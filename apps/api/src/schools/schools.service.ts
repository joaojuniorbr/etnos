import {
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
import { PrismaService } from 'src/prisma';

@Injectable()
export class SchoolsService {
  constructor(private readonly prismaService: PrismaService) {}

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

        return (left.childName || left.parentName || left.email || '').localeCompare(
          right.childName || right.parentName || right.email || '',
        );
      })
      .map((ranking, index) => ({
        ...ranking,
        position: index + 1,
      }));
  }

  private async getAuthenticatedProfile(firebaseUid: string) {
    const user = await this.prismaService.user.findUnique({
      where: { firebaseUid },
      select: {
        firebaseUid: true,
        school: true,
        roles: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario nao encontrado.');
    }

    return user;
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

    return this.prismaService.user.findMany({
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
      orderBy: [{ childName: 'asc' }, { parentName: 'asc' }, { email: 'asc' }],
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
    }).then((users) =>
      users.map((schoolUser) => ({
        id: schoolUser.id,
        uid: schoolUser.firebaseUid,
        email: schoolUser.email,
        parentName: schoolUser.parentName,
        childName: schoolUser.childName,
        school: schoolUser.school,
        roles: schoolUser.roles,
        updatedAt: schoolUser.updatedAt,
      })),
    );
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
        .map((user) => [user.firebaseUid, user.school as string]),
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

  async getUserRankingBySchoolForAdmin(
    schoolId: string,
    gameSlug?: string,
  ): Promise<UserRankingInterface[]> {
    const school = await this.prismaService.school.findUnique({
      where: { id: schoolId },
      select: { id: true },
    });

    if (!school) {
      throw new NotFoundException('Escola nao encontrada.');
    }

    return this.getUserRankingBySchoolId(schoolId, gameSlug);
  }
}
