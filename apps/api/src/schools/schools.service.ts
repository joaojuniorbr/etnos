import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  SchoolInterface,
  SchoolRankingInterface,
  SchoolUserInterface,
  UserRankingInterface,
} from '@etnos/types';
import * as admin from 'firebase-admin';
import { randomBytes } from 'crypto';
import { PrismaService } from 'src/prisma';

@Injectable()
export class SchoolsService {
  constructor(private readonly prismaService: PrismaService) {}

  private getUserRankingLabel(
    user: Pick<UserRankingInterface, 'childName' | 'parentName' | 'email'>,
  ) {
    if (user.childName) {
      return user.childName;
    }

    if (user.parentName) {
      return user.parentName;
    }

    if (user.email) {
      return user.email;
    }

    return '';
  }

  private async getUserRankingBySchoolId(
    schoolId: string,
    gameSlug?: string,
  ): Promise<UserRankingInterface[]> {
    const [users, scores] = await Promise.all([
      this.prismaService.user.findMany({
        where: {
          school: schoolId,
        },
        select: {
          id: true,
          firebaseUid: true,
          email: true,
          parentName: true,
          childName: true,
          school: true,
        },
      }),
      this.prismaService.gameScore.findMany({
        where: gameSlug
          ? {
              slug: gameSlug,
            }
          : undefined,
        select: {
          userId: true,
          score: true,
        },
      }),
    ]);

    const userMap = new Map(
      users.map((schoolUser) => [
        schoolUser.firebaseUid,
        {
          userId: schoolUser.id,
          uid: schoolUser.firebaseUid,
          email: schoolUser.email,
          parentName: schoolUser.parentName,
          childName: schoolUser.childName,
          school: schoolUser.school,
        },
      ]),
    );

    const rankingMap = new Map<string, UserRankingInterface>();

    users.forEach((schoolUser) => {
      rankingMap.set(schoolUser.firebaseUid, {
        position: 0,
        uid: schoolUser.firebaseUid,
        userId: schoolUser.id,
        email: schoolUser.email,
        parentName: schoolUser.parentName,
        childName: schoolUser.childName,
        school: schoolUser.school,
        gameSlug: gameSlug ?? null,
        totalScore: 0,
      });
    });

    scores.forEach((score) => {
      const rankingUser = userMap.get(score.userId);

      if (!rankingUser) {
        return;
      }

      const currentRanking = rankingMap.get(rankingUser.uid);

      if (!currentRanking) {
        return;
      }

      currentRanking.totalScore += score.score;
    });

    return Array.from(rankingMap.values())
      .sort((left, right) => {
        if (right.totalScore !== left.totalScore) {
          return right.totalScore - left.totalScore;
        }

        return this.getUserRankingLabel(left).localeCompare(
          this.getUserRankingLabel(right),
        );
      })
      .map((ranking, index) => ({
        ...ranking,
        position: index + 1,
      }));
  }

  private mapSchoolUser(
    schoolUser: Pick<
      SchoolUserInterface,
      'id' | 'email' | 'parentName' | 'childName' | 'school' | 'roles' | 'updatedAt'
    > & { firebaseUid?: string | null; uid?: string | null },
  ): SchoolUserInterface {
    return {
      id: schoolUser.id,
      uid: schoolUser.uid ?? schoolUser.firebaseUid ?? '',
      email: schoolUser.email,
      parentName: schoolUser.parentName,
      childName: schoolUser.childName,
      school: schoolUser.school,
      roles: schoolUser.roles,
      updatedAt: schoolUser.updatedAt,
    };
  }

  private async getAuthenticatedProfile(firebaseUid: string) {
    const user = await this.prismaService.user.findUnique({
      where: { firebaseUid },
      select: {
        id: true,
        firebaseUid: true,
        email: true,
        school: true,
        roles: true,
        schoolAccesses: {
          select: {
            schoolId: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario nao encontrado.');
    }

    return user;
  }

  private getManagedSchoolIds(profile: Awaited<ReturnType<typeof this.getAuthenticatedProfile>>) {
    return Array.from(
      new Set([
        ...profile.schoolAccesses.map((access) => access.schoolId),
        ...(profile.roles.includes('school') && profile.school
          ? [profile.school]
          : []),
      ]),
    );
  }

  private async assertViewerCanAccessSchool(
    firebaseUid: string,
    schoolId: string,
  ) {
    const user = await this.getAuthenticatedProfile(firebaseUid);

    if (user.roles.includes('admin')) {
      return user;
    }

    if (!user.roles.includes('school')) {
      throw new ForbiddenException(
        'Acesso restrito a administradores e perfis de escola.',
      );
    }

    const managedSchoolIds = this.getManagedSchoolIds(user);

    if (!managedSchoolIds.includes(schoolId)) {
      throw new ForbiddenException(
        'O perfil autenticado nao possui acesso a esta escola.',
      );
    }

    return user;
  }

  private async ensureSchoolExists(schoolId: string) {
    const school = await this.prismaService.school.findUnique({
      where: { id: schoolId },
    });

    if (!school) {
      throw new NotFoundException('Escola nao encontrada.');
    }

    return school;
  }

  private buildRolesForSchoolAccess(existingRoles: string[]) {
    const normalizedRoles = Array.from(new Set(existingRoles));

    if (normalizedRoles.includes('school')) {
      return normalizedRoles;
    }

    if (normalizedRoles.length >= 2) {
      throw new BadRequestException(
        'O usuário já possui 2 perfis e não pode receber o perfil school.',
      );
    }

    return [...normalizedRoles, 'school'];
  }

  private async findUserByEmail(email: string) {
    return this.prismaService.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
    });
  }

  private async ensureUserForSchoolAccess(email: string) {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      throw new BadRequestException('Informe um e-mail valido.');
    }

    const existingProfile = await this.findUserByEmail(normalizedEmail);

    if (existingProfile) {
      const roles = this.buildRolesForSchoolAccess(existingProfile.roles ?? []);

      if (roles.join('|') !== (existingProfile.roles ?? []).join('|')) {
        return this.prismaService.user.update({
          where: { id: existingProfile.id },
          data: {
            email: normalizedEmail,
            roles,
          },
        });
      }

      return existingProfile;
    }

    let firebaseUser: admin.auth.UserRecord;

    try {
      firebaseUser = await admin.auth().getUserByEmail(normalizedEmail);
    } catch (error) {
      if (error?.errorInfo?.code !== 'auth/user-not-found') {
        throw error;
      }

      firebaseUser = await admin.auth().createUser({
        email: normalizedEmail,
        password: randomBytes(18).toString('base64url'),
      });
    }

    const profileByFirebaseUid = await this.prismaService.user.findUnique({
      where: { firebaseUid: firebaseUser.uid },
    });

    if (profileByFirebaseUid) {
      const roles = this.buildRolesForSchoolAccess(
        profileByFirebaseUid.roles ?? [],
      );

      if (
        roles.join('|') === (profileByFirebaseUid.roles ?? []).join('|') &&
        profileByFirebaseUid.email === normalizedEmail
      ) {
        return profileByFirebaseUid;
      }

      return this.prismaService.user.update({
        where: { id: profileByFirebaseUid.id },
        data: {
          email: normalizedEmail,
          roles,
        },
      });
    }

    return this.prismaService.user.create({
      data: {
        firebaseUid: firebaseUser.uid,
        email: normalizedEmail,
        parentName: firebaseUser.displayName ?? null,
        childName: null,
        childBirthDate: null,
        parentPhone: null,
        school: null,
        photoURL: firebaseUser.photoURL ?? null,
        avatarCharacterSlug: null,
        roles: ['school'],
      },
    });
  }

  async getAll(): Promise<SchoolInterface[]> {
    return this.prismaService.school.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async create(school: SchoolInterface) {
    const exists = await this.prismaService.school.findUnique({
      where: { name: school.name },
    });

    if (exists) return null;

    const created = await this.prismaService.school.create({
      data: {
        name: school.name,
        city: school.city,
        state: school.state,
      },
    });

    return {
      id: created.id,
      ...school,
    };
  }

  async update(id: string, school: Partial<SchoolInterface>) {
    const existing =
      school.name === undefined
        ? null
        : await this.prismaService.school.findFirst({
            where: {
              name: school.name,
              city: school.city ?? null,
            },
          });

    if (existing && existing.id !== id) return null;

    await this.prismaService.school.update({
      where: { id },
      data: {
        name: school.name,
        city: school.city,
        state: school.state,
      },
    });

    return {
      id,
      ...school,
    };
  }

  async delete(id: string) {
    await this.prismaService.school.delete({
      where: { id },
    });

    return true;
  }

  async getOne(id: string): Promise<SchoolInterface | null> {
    return this.prismaService.school.findUnique({
      where: { id },
    });
  }

  async getMySchool(firebaseUid: string): Promise<SchoolInterface> {
    const user = await this.getAuthenticatedProfile(firebaseUid);

    if (!user.school) {
      throw new ForbiddenException(
        'O perfil autenticado nao possui escola vinculada.',
      );
    }

    const school = await this.prismaService.school.findUnique({
      where: { id: user.school },
    });

    if (!school) {
      throw new NotFoundException('Escola nao encontrada.');
    }

    return school;
  }

  async getUsersFromMySchool(
    firebaseUid: string,
    search?: string,
  ): Promise<SchoolUserInterface[]> {
    const user = await this.getAuthenticatedProfile(firebaseUid);

    if (!user.school) {
      throw new ForbiddenException(
        'O perfil autenticado nao possui escola vinculada.',
      );
    }

    const normalizedSearch = search?.trim();

    return this.prismaService.user
      .findMany({
        where: {
          school: user.school,
          ...(normalizedSearch
            ? {
                OR: [
                  {
                    childName: {
                      contains: normalizedSearch,
                      mode: 'insensitive',
                    },
                  },
                  {
                    parentName: {
                      contains: normalizedSearch,
                      mode: 'insensitive',
                    },
                  },
                  {
                    email: {
                      contains: normalizedSearch,
                      mode: 'insensitive',
                    },
                  },
                ],
              }
            : {}),
        },
        orderBy: [
          { childName: 'asc' },
          { parentName: 'asc' },
          { email: 'asc' },
        ],
        select: {
          id: true,
          firebaseUid: true,
          email: true,
          parentName: true,
          childName: true,
          school: true,
          roles: true,
          updatedAt: true,
        },
      })
      .then((users) =>
        users.map((schoolUser) => this.mapSchoolUser(schoolUser)),
      );
  }

  async getManagedSchools(firebaseUid: string): Promise<SchoolInterface[]> {
    const user = await this.getAuthenticatedProfile(firebaseUid);
    const managedSchoolIds = this.getManagedSchoolIds(user);

    if (!managedSchoolIds.length) {
      return [];
    }

    return this.prismaService.school.findMany({
      where: {
        id: {
          in: managedSchoolIds,
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async getUsersBySchool(
    firebaseUid: string,
    schoolId: string,
    search?: string,
  ): Promise<SchoolUserInterface[]> {
    await this.assertViewerCanAccessSchool(firebaseUid, schoolId);

    const normalizedSearch = search?.trim();

    return this.prismaService.user
      .findMany({
        where: {
          school: schoolId,
          ...(normalizedSearch
            ? {
                OR: [
                  {
                    childName: {
                      contains: normalizedSearch,
                      mode: 'insensitive',
                    },
                  },
                  {
                    parentName: {
                      contains: normalizedSearch,
                      mode: 'insensitive',
                    },
                  },
                  {
                    email: {
                      contains: normalizedSearch,
                      mode: 'insensitive',
                    },
                  },
                ],
              }
            : {}),
        },
        orderBy: [
          { childName: 'asc' },
          { parentName: 'asc' },
          { email: 'asc' },
        ],
        select: {
          id: true,
          firebaseUid: true,
          email: true,
          parentName: true,
          childName: true,
          school: true,
          roles: true,
          updatedAt: true,
        },
      })
      .then((users) => users.map((schoolUser) => this.mapSchoolUser(schoolUser)));
  }

  async getSchoolRanking(gameSlug?: string): Promise<SchoolRankingInterface[]> {
    const [schools, users, scores] = await Promise.all([
      this.prismaService.school.findMany({
        orderBy: { name: 'asc' },
      }),
      this.prismaService.user.findMany({
        where: {
          school: {
            not: null,
          },
        },
        select: {
          firebaseUid: true,
          school: true,
        },
      }),
      this.prismaService.gameScore.findMany({
        where: gameSlug
          ? {
              slug: gameSlug,
            }
          : undefined,
        select: {
          userId: true,
          score: true,
        },
      }),
    ]);

    const schoolByUserId = new Map(
      users
        .filter((user) => !!user.school)
        .map((user) => [user.firebaseUid, user.school]),
    );

    const rankingMap = new Map<
      string,
      Omit<SchoolRankingInterface, 'position'> & { playerIds: Set<string> }
    >();

    schools.forEach((school) => {
      rankingMap.set(school.id, {
        schoolId: school.id,
        schoolName: school.name,
        gameSlug: gameSlug ?? null,
        totalScore: 0,
        totalPlayers: 0,
        averageScore: 0,
        playerIds: new Set<string>(),
      });
    });

    scores.forEach((score) => {
      const schoolId = schoolByUserId.get(score.userId);

      if (!schoolId) {
        return;
      }

      const schoolRanking = rankingMap.get(schoolId);

      if (!schoolRanking) {
        return;
      }

      schoolRanking.totalScore += score.score;
      schoolRanking.playerIds.add(score.userId);
    });

    return Array.from(rankingMap.values())
      .map((ranking) => {
        const totalPlayers = ranking.playerIds.size;
        const averageScore =
          totalPlayers > 0 ? ranking.totalScore / totalPlayers : 0;

        return {
          position: 0,
          schoolId: ranking.schoolId,
          schoolName: ranking.schoolName,
          gameSlug: ranking.gameSlug,
          totalScore: ranking.totalScore,
          totalPlayers,
          averageScore: Number(averageScore.toFixed(2)),
        };
      })
      .sort((left, right) => {
        if (right.totalScore !== left.totalScore) {
          return right.totalScore - left.totalScore;
        }

        if (right.averageScore !== left.averageScore) {
          return right.averageScore - left.averageScore;
        }

        return left.schoolName.localeCompare(right.schoolName);
      })
      .map((ranking, index) => ({
        ...ranking,
        position: index + 1,
      }));
  }

  async getUserRankingFromMySchool(
    firebaseUid: string,
    gameSlug?: string,
  ): Promise<UserRankingInterface[]> {
    const user = await this.getAuthenticatedProfile(firebaseUid);

    if (!user.school) {
      throw new ForbiddenException(
        'O perfil autenticado nao possui escola vinculada.',
      );
    }

    return this.getUserRankingBySchoolId(user.school, gameSlug);
  }

  async getUserRankingBySchoolForViewer(
    firebaseUid: string,
    schoolId: string,
    gameSlug?: string,
  ): Promise<UserRankingInterface[]> {
    await this.assertViewerCanAccessSchool(firebaseUid, schoolId);
    await this.ensureSchoolExists(schoolId);

    return this.getUserRankingBySchoolId(schoolId, gameSlug);
  }

  async getAccessUsersBySchool(schoolId: string): Promise<SchoolUserInterface[]> {
    await this.ensureSchoolExists(schoolId);

    const accesses = await this.prismaService.schoolAccess.findMany({
      where: { schoolId },
      select: {
        user: {
          select: {
            id: true,
            firebaseUid: true,
            email: true,
            parentName: true,
            childName: true,
            school: true,
            roles: true,
            updatedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return accesses.map((access) => this.mapSchoolUser(access.user));
  }

  async addAccessUserToSchool(schoolId: string, email: string) {
    await this.ensureSchoolExists(schoolId);
    const user = await this.ensureUserForSchoolAccess(email);

    await this.prismaService.schoolAccess.upsert({
      where: {
        schoolId_userId: {
          schoolId,
          userId: user.id,
        },
      },
      update: {},
      create: {
        schoolId,
        userId: user.id,
      },
    });

    return this.mapSchoolUser({
      id: user.id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      parentName: user.parentName,
      childName: user.childName,
      school: user.school,
      roles: user.roles,
      updatedAt: user.updatedAt,
    });
  }

  async removeAccessUserFromSchool(schoolId: string, userId: string) {
    await this.ensureSchoolExists(schoolId);

    const access = await this.prismaService.schoolAccess.findUnique({
      where: {
        schoolId_userId: {
          schoolId,
          userId,
        },
      },
    });

    if (!access) {
      throw new NotFoundException('Vinculo de acesso nao encontrado.');
    }

    await this.prismaService.schoolAccess.delete({
      where: {
        schoolId_userId: {
          schoolId,
          userId,
        },
      },
    });

    return true;
  }
}
