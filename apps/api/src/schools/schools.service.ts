import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type {
  AdminDashboardCharacterUsageInterface,
  AdminDashboardNpsInterface,
  DashboardPieSliceInterface,
  SchoolGameAccessInterface,
  SchoolInterface,
  SchoolRankingInterface,
  SchoolUserInterface,
  UpdateSchoolGameAccessPayload,
  UserRankingInterface,
  UserRole,
} from '@etnos/types';
import * as admin from 'firebase-admin';
import { randomBytes } from 'node:crypto';
import {
  CacheKeys,
  CachePrefixes,
  CACHE_TTL_MS,
  CacheService,
} from 'src/cache';
import { GamesService } from 'src/games/games.service';
import { PrismaService } from 'src/prisma';

const AVAILABLE_GAME_SLUGS = ['memory-game', 'guess-game'] as const;

@Injectable()
export class SchoolsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly gamesService: GamesService,
    private readonly cacheService: CacheService,
  ) {}

  private getAvailableGameSlugs(): string[] {
    return [...AVAILABLE_GAME_SLUGS];
  }

  private isAvailableGameSlug(gameSlug: string) {
    return this.getAvailableGameSlugs().includes(gameSlug);
  }

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
    characterSlug?: string,
  ): Promise<UserRankingInterface[]> {
    const scoreWhere: Prisma.GameScoreWhereInput = {
      ...(gameSlug ? { slug: gameSlug } : {}),
      ...(characterSlug ? { characterSlug } : {}),
    };

    const users = await this.prismaService.user.findMany({
      where: {
        schoolId,
      },
      select: {
        id: true,
        firebaseUid: true,
        email: true,
        parentName: true,
        childName: true,
        schoolId: true,
      },
    });

    const schoolFirebaseUids = users.map(
      (schoolUser) => schoolUser.firebaseUid,
    );

    const scoreAggregates = schoolFirebaseUids.length
      ? await this.prismaService.gameScore.groupBy({
          by: ['userId'],
          where: {
            userId: { in: schoolFirebaseUids },
            ...scoreWhere,
          },
          _sum: {
            score: true,
          },
        })
      : [];

    const totalScoreByUid = new Map(
      scoreAggregates.map((row) => [row.userId, row._sum.score ?? 0]),
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
        school: schoolUser.schoolId,
        gameSlug: gameSlug ?? null,
        totalScore: totalScoreByUid.get(schoolUser.firebaseUid) ?? 0,
      });
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

  private mapSchoolUser(schoolUser: {
    id: string;
    firebaseUid?: string | null;
    email: string | null;
    parentName: string | null;
    childName: string | null;
    schoolId: string | null;
    roles: string[];
    updatedAt: Date;
  }): SchoolUserInterface {
    return {
      id: schoolUser.id,
      uid: schoolUser.firebaseUid ?? '',
      email: schoolUser.email,
      parentName: schoolUser.parentName,
      childName: schoolUser.childName,
      school: schoolUser.schoolId,
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
        schoolId: true,
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

  private getManagedSchoolIds(
    profile: Awaited<ReturnType<typeof this.getAuthenticatedProfile>>,
  ) {
    return Array.from(
      new Set([
        ...profile.schoolAccesses.map((access) => access.schoolId),
        ...((profile.roles.includes('school') ||
          profile.roles.includes('teacher')) &&
        profile.schoolId
          ? [profile.schoolId]
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

    if (!user.roles.includes('school') && !user.roles.includes('teacher')) {
      throw new ForbiddenException(
        'Acesso restrito a administradores, escolas e professores.',
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

  private canEditSchoolGameAccess(userRoles: string[]) {
    return userRoles.includes('admin') || userRoles.includes('school');
  }

  private async getAvailableCharacterSlugs() {
    return this.cacheService.getOrSet(
      CacheKeys.characterSlugs(),
      CACHE_TTL_MS.characterSlugs,
      async () => {
        const characters = await this.prismaService.character.findMany({
          select: {
            slug: true,
          },
          orderBy: {
            name: 'asc',
          },
        });

        return characters.map((character) => character.slug);
      },
    );
  }

  private invalidateSchoolCatalogCaches() {
    this.cacheService.delete(CacheKeys.schoolsAll());
  }

  private invalidateSchoolGameAccessCaches() {
    this.cacheService.invalidateByPrefix(CachePrefixes.schoolGameAccess);
    this.cacheService.invalidateByPrefix(CachePrefixes.schoolEnabledAccess);
    this.cacheService.invalidateByPrefix(CachePrefixes.myGameAccess);
  }

  private normalizeUniqueValues(values: string[]) {
    return Array.from(
      new Set(values.map((value) => value.trim()).filter(Boolean)),
    );
  }

  private sortStringsAlphabetically(values: string[]) {
    return [...values].sort((left, right) => left.localeCompare(right));
  }

  private async buildSchoolGameAccess(
    schoolId: string,
    viewerRoles: string[],
  ): Promise<SchoolGameAccessInterface> {
    const rolesKey = this.sortStringsAlphabetically(viewerRoles).join(',');

    return this.cacheService.getOrSet(
      CacheKeys.schoolGameAccess(schoolId, rolesKey),
      CACHE_TTL_MS.gameAccess,
      async () => {
        const enabledGames =
          await this.prismaService.schoolEnabledGame.findMany({
            where: { schoolId },
            select: { gameSlug: true },
            orderBy: { gameSlug: 'asc' },
          });
        const enabledCharacters =
          await this.prismaService.schoolEnabledCharacter.findMany({
            where: { schoolId },
            select: { characterSlug: true },
            orderBy: { characterSlug: 'asc' },
          });
        const availableCharacterSlugs = await this.getAvailableCharacterSlugs();

        const availableGameSlugs = this.getAvailableGameSlugs();
        const hasCustomGames = enabledGames.length > 0;
        const hasCustomCharacters = enabledCharacters.length > 0;

        return {
          schoolId,
          enabledGameSlugs: hasCustomGames
            ? enabledGames.map((game) => game.gameSlug)
            : availableGameSlugs,
          enabledCharacterSlugs: hasCustomCharacters
            ? enabledCharacters.map((character) => character.characterSlug)
            : availableCharacterSlugs,
          hasCustomGames,
          hasCustomCharacters,
          canEdit: this.canEditSchoolGameAccess(viewerRoles),
          viewerRoles: viewerRoles as UserRole[],
        };
      },
    );
  }

  private async validateSchoolGameAccessPayload(
    payload: UpdateSchoolGameAccessPayload,
  ) {
    const enabledGameSlugs = this.normalizeUniqueValues(
      payload.enabledGameSlugs,
    );
    const enabledCharacterSlugs = this.normalizeUniqueValues(
      payload.enabledCharacterSlugs,
    );

    const availableGameSlugs = this.getAvailableGameSlugs();
    const invalidGameSlug = enabledGameSlugs.find(
      (gameSlug) =>
        !availableGameSlugs.includes(
          gameSlug as (typeof AVAILABLE_GAME_SLUGS)[number],
        ),
    );

    if (invalidGameSlug) {
      throw new BadRequestException(`Jogo invalido: ${invalidGameSlug}.`);
    }

    const availableCharacterSlugs = await this.getAvailableCharacterSlugs();
    const invalidCharacterSlug = enabledCharacterSlugs.find(
      (characterSlug) => !availableCharacterSlugs.includes(characterSlug),
    );

    if (invalidCharacterSlug) {
      throw new BadRequestException(
        `Personagem invalido: ${invalidCharacterSlug}.`,
      );
    }

    return {
      enabledGameSlugs,
      enabledCharacterSlugs,
    };
  }

  private normalizeSchoolCode(code?: string | null) {
    const normalizedCode = code?.trim().toUpperCase();

    return normalizedCode || null;
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
        schoolId: null,
        photoURL: firebaseUser.photoURL ?? null,
        avatarCharacterSlug: null,
        roles: ['school'],
      },
    });
  }

  async getAll(): Promise<SchoolInterface[]> {
    return this.cacheService.getOrSet(
      CacheKeys.schoolsAll(),
      CACHE_TTL_MS.catalog,
      () =>
        this.prismaService.school.findMany({
          orderBy: {
            name: 'asc',
          },
        }),
    );
  }

  async create(school: SchoolInterface) {
    const normalizedCode = this.normalizeSchoolCode(school.code);

    if (!normalizedCode) {
      throw new BadRequestException(
        'Informe o codigo identificador da escola.',
      );
    }

    const exists = await this.prismaService.school.findFirst({
      where: {
        OR: [{ name: school.name }, { code: normalizedCode }],
      },
    });

    if (exists) return null;

    try {
      const created = await this.prismaService.school.create({
        data: {
          name: school.name,
          code: normalizedCode,
          city: school.city,
          state: school.state,
        },
      });

      this.invalidateSchoolCatalogCaches();

      return {
        id: created.id,
        ...school,
        code: normalizedCode,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Ja existe uma escola com este codigo identificador.',
        );
      }

      throw error;
    }
  }

  async update(id: string, school: Partial<SchoolInterface>) {
    const normalizedCode =
      school.code === undefined
        ? undefined
        : this.normalizeSchoolCode(school.code);
    const existing =
      school.name === undefined && school.code === undefined
        ? null
        : await this.prismaService.school.findFirst({
            where: {
              OR: [
                ...(school.name === undefined ? [] : [{ name: school.name }]),
                ...(normalizedCode === undefined
                  ? []
                  : [{ code: normalizedCode }]),
              ],
            },
          });

    if (existing && existing.id !== id) return null;

    await this.prismaService.school.update({
      where: { id },
      data: {
        name: school.name,
        code: normalizedCode,
        city: school.city,
        state: school.state,
      },
    });

    this.invalidateSchoolCatalogCaches();

    return {
      id,
      ...school,
      ...(normalizedCode === undefined ? {} : { code: normalizedCode }),
    };
  }

  async delete(id: string) {
    await this.prismaService.school.delete({
      where: { id },
    });

    this.invalidateSchoolCatalogCaches();
    this.invalidateSchoolGameAccessCaches();

    return true;
  }

  async getOne(id: string): Promise<SchoolInterface | null> {
    return this.prismaService.school.findUnique({
      where: { id },
    });
  }

  async getMySchool(firebaseUid: string): Promise<SchoolInterface> {
    const user = await this.getAuthenticatedProfile(firebaseUid);

    if (!user.schoolId) {
      throw new ForbiddenException(
        'O perfil autenticado nao possui escola vinculada.',
      );
    }

    const school = await this.prismaService.school.findUnique({
      where: { id: user.schoolId },
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

    if (!user.schoolId) {
      throw new ForbiddenException(
        'O perfil autenticado nao possui escola vinculada.',
      );
    }

    const normalizedSearch = search?.trim();

    return this.prismaService.user
      .findMany({
        where: {
          schoolId: user.schoolId,
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
          schoolId: true,
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

  async getMyGameAccess(
    firebaseUid: string,
  ): Promise<SchoolGameAccessInterface> {
    return this.cacheService.getOrSet(
      CacheKeys.myGameAccess(firebaseUid),
      CACHE_TTL_MS.gameAccess,
      async () => {
        const profile = await this.getAuthenticatedProfile(firebaseUid);

        if (profile.schoolId) {
          await this.ensureSchoolExists(profile.schoolId);
        }

        return profile.schoolId
          ? await this.buildSchoolGameAccess(profile.schoolId, profile.roles)
          : await this.buildSchoolGameAccess('', profile.roles);
      },
    );
  }

  async getGameAccessBySchool(
    firebaseUid: string,
    schoolId: string,
  ): Promise<SchoolGameAccessInterface> {
    const profile = await this.assertViewerCanAccessSchool(
      firebaseUid,
      schoolId,
    );
    await this.ensureSchoolExists(schoolId);
    return this.buildSchoolGameAccess(schoolId, profile.roles);
  }

  async updateGameAccessBySchool(
    firebaseUid: string,
    schoolId: string,
    payload: UpdateSchoolGameAccessPayload,
  ): Promise<SchoolGameAccessInterface> {
    const profile = await this.assertViewerCanAccessSchool(
      firebaseUid,
      schoolId,
    );

    if (!this.canEditSchoolGameAccess(profile.roles)) {
      throw new ForbiddenException(
        'Somente administradores e gestores de escola podem alterar essa configuracao.',
      );
    }

    await this.ensureSchoolExists(schoolId);

    const validatedPayload = await this.validateSchoolGameAccessPayload(
      payload,
    );

    await this.prismaService.$transaction(async (transaction) => {
      await transaction.schoolEnabledGame.deleteMany({
        where: { schoolId },
      });
      await transaction.schoolEnabledCharacter.deleteMany({
        where: { schoolId },
      });

      if (validatedPayload.enabledGameSlugs.length) {
        await transaction.schoolEnabledGame.createMany({
          data: validatedPayload.enabledGameSlugs.map((gameSlug) => ({
            schoolId,
            gameSlug,
          })),
        });
      }

      if (validatedPayload.enabledCharacterSlugs.length) {
        await transaction.schoolEnabledCharacter.createMany({
          data: validatedPayload.enabledCharacterSlugs.map((characterSlug) => ({
            schoolId,
            characterSlug,
          })),
        });
      }
    });

    this.invalidateSchoolGameAccessCaches();

    return this.buildSchoolGameAccess(schoolId, profile.roles);
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
          schoolId,
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
          schoolId: true,
          roles: true,
          updatedAt: true,
        },
      })
      .then((users) =>
        users.map((schoolUser) => this.mapSchoolUser(schoolUser)),
      );
  }

  async getSchoolUserGameScoreHistory(
    viewerFirebaseUid: string,
    schoolId: string,
    studentFirebaseUid: string,
  ) {
    await this.assertViewerCanAccessSchool(viewerFirebaseUid, schoolId);

    const student = await this.prismaService.user.findFirst({
      where: {
        firebaseUid: studentFirebaseUid,
        schoolId,
      },
      select: { id: true },
    });

    if (!student) {
      throw new NotFoundException('Usuario nao encontrado nesta escola.');
    }

    return this.gamesService.getScoreHistoryForSchoolUser(
      studentFirebaseUid,
      schoolId,
    );
  }

  async getSchoolRanking(gameSlug?: string): Promise<SchoolRankingInterface[]> {
    const schools = await this.prismaService.school.findMany({
      orderBy: { name: 'asc' },
    });
    const users = await this.prismaService.user.findMany({
      where: {
        schoolId: {
          not: null,
        },
      },
      select: {
        firebaseUid: true,
        schoolId: true,
      },
    });

    const userFirebaseUids = users.map((user) => user.firebaseUid);
    const scoreAggregates = userFirebaseUids.length
      ? await this.prismaService.gameScore.groupBy({
          by: ['userId'],
          where: {
            userId: { in: userFirebaseUids },
            ...(gameSlug ? { slug: gameSlug } : {}),
          },
          _sum: {
            score: true,
          },
        })
      : [];

    const schoolByUserId = new Map(
      users
        .filter((user) => !!user.schoolId)
        .map((user) => [user.firebaseUid, user.schoolId]),
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

    scoreAggregates.forEach((row) => {
      const resolvedSchoolId = schoolByUserId.get(row.userId);

      if (!resolvedSchoolId) {
        return;
      }

      const schoolRanking = rankingMap.get(resolvedSchoolId);

      if (!schoolRanking) {
        return;
      }

      schoolRanking.totalScore += row._sum.score ?? 0;
      schoolRanking.playerIds.add(row.userId);
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

  async getTopUsersForGameForAdmin(options: {
    gameSlug: string;
    schoolId?: string;
    limit: number;
  }): Promise<UserRankingInterface[]> {
    const { gameSlug, limit } = options;
    const schoolId = options.schoolId?.trim() || undefined;

    if (!this.isAvailableGameSlug(gameSlug)) {
      throw new BadRequestException('Jogo invalido para o ranking.');
    }

    let schoolUserUids: string[] | undefined;

    if (schoolId) {
      await this.ensureSchoolExists(schoolId);

      const schoolUsers = await this.prismaService.user.findMany({
        where: { schoolId },
        select: { firebaseUid: true },
      });
      schoolUserUids = schoolUsers.map((user) => user.firebaseUid);

      if (schoolUserUids.length === 0) {
        return [];
      }
    }

    const grouped = await this.prismaService.gameScore.groupBy({
      by: ['userId'],
      where: {
        slug: gameSlug,
        ...(schoolUserUids?.length ? { userId: { in: schoolUserUids } } : {}),
      },
      _sum: {
        score: true,
      },
      orderBy: {
        _sum: {
          score: 'desc',
        },
      },
      take: limit,
    });

    const ranked = grouped
      .map((row) => ({
        uid: row.userId,
        totalScore: row._sum.score ?? 0,
      }))
      .filter((row) => row.totalScore > 0);

    if (!ranked.length) {
      return [];
    }

    const uids = ranked.map((row) => row.uid);
    const users = await this.prismaService.user.findMany({
      where: { firebaseUid: { in: uids } },
      select: {
        id: true,
        firebaseUid: true,
        email: true,
        parentName: true,
        childName: true,
        schoolId: true,
      },
    });

    type DashboardRankingUser = (typeof users)[number];

    const userByUid = new Map<string, DashboardRankingUser>(
      users.map((user) => [user.firebaseUid, user]),
    );

    const schoolIds = [
      ...new Set(
        users
          .map((user) => user.schoolId)
          .filter(
            (id): id is string => typeof id === 'string' && id.length > 0,
          ),
      ),
    ];

    const schools = schoolIds.length
      ? await this.prismaService.school.findMany({
          where: { id: { in: schoolIds } },
          select: { id: true, name: true },
        })
      : [];

    const schoolNameById = new Map<string, string>(
      schools.map((school) => [school.id, school.name]),
    );

    const rows: UserRankingInterface[] = [];

    for (const row of ranked) {
      const user = userByUid.get(row.uid);

      if (!user) {
        continue;
      }

      const schoolName: string | null = user.schoolId
        ? schoolNameById.get(user.schoolId) ?? null
        : null;

      rows.push({
        position: 0,
        uid: row.uid,
        userId: user.id,
        email: user.email,
        parentName: user.parentName,
        childName: user.childName,
        school: user.schoolId,
        schoolName,
        gameSlug,
        totalScore: row.totalScore,
      });
    }

    return rows.map((entry, index) => ({
      ...entry,
      position: index + 1,
    }));
  }

  private buildDashboardPieSlices(
    entries: Array<{ key: string; label: string; value: number }>,
  ): DashboardPieSliceInterface[] {
    const total = entries.reduce((sum, entry) => sum + entry.value, 0);

    return entries
      .filter((entry) => entry.value > 0)
      .map((entry) => ({
        key: entry.key,
        label: entry.label,
        value: entry.value,
        percentage:
          total > 0 ? Number(((entry.value / total) * 100).toFixed(1)) : 0,
      }));
  }

  async getDashboardCharacterUsageForAdmin(options: {
    gameSlug: string;
    schoolId?: string;
  }): Promise<AdminDashboardCharacterUsageInterface> {
    const { gameSlug } = options;
    const schoolId = options.schoolId?.trim() || undefined;

    if (!this.isAvailableGameSlug(gameSlug)) {
      throw new BadRequestException('Jogo invalido para o uso de personagens.');
    }

    if (schoolId) {
      await this.ensureSchoolExists(schoolId);
    }

    const grouped = await this.prismaService.gameScoreHistory.groupBy({
      by: ['characterSlug'],
      where: {
        status: 'completed',
        gameSlug,
        ...(schoolId ? { schoolId } : {}),
      },
      _count: {
        _all: true,
      },
    });

    const characterSlugs = grouped.map((row) => row.characterSlug);
    const characters = characterSlugs.length
      ? await this.prismaService.character.findMany({
          where: { slug: { in: characterSlugs } },
          select: { slug: true, name: true },
        })
      : [];
    const nameBySlug = new Map(
      characters.map((character) => [character.slug, character.name]),
    );

    const entries = grouped
      .map((row) => ({
        key: row.characterSlug,
        label: nameBySlug.get(row.characterSlug) ?? row.characterSlug,
        value: row._count._all,
      }))
      .sort((left, right) => right.value - left.value);

    const slices = this.buildDashboardPieSlices(entries);
    const top = slices[0];

    return {
      slices,
      topCharacterSlug: top?.key ?? null,
      topCharacterName: top?.label ?? null,
      totalPlays: entries.reduce((sum, entry) => sum + entry.value, 0),
    };
  }

  async getDashboardNpsForAdmin(options: {
    gameSlug: string;
    schoolId?: string;
  }): Promise<AdminDashboardNpsInterface> {
    const { gameSlug } = options;
    const schoolId = options.schoolId?.trim() || undefined;

    if (!this.isAvailableGameSlug(gameSlug)) {
      throw new BadRequestException('Jogo invalido para o NPS.');
    }

    if (schoolId) {
      await this.ensureSchoolExists(schoolId);

      const grouped = await this.prismaService.gameNpsResponse.groupBy({
        by: ['rating'],
        where: {
          gameSlug,
          schoolId,
        },
        _count: {
          _all: true,
        },
      });

      const ratingLabels: Record<number, string> = {
        1: '1 estrela',
        2: '2 estrelas',
        3: '3 estrelas',
        4: '4 estrelas',
        5: '5 estrelas',
      };

      const entries = grouped
        .map((row) => ({
          key: String(row.rating),
          label: ratingLabels[row.rating] ?? `Nota ${row.rating}`,
          value: row._count._all,
        }))
        .sort((left, right) => Number(left.key) - Number(right.key));

      const slices = this.buildDashboardPieSlices(entries);
      const totalResponses = slices.reduce(
        (sum, slice) => sum + slice.value,
        0,
      );
      const weightedSum = grouped.reduce(
        (sum, row) => sum + row.rating * row._count._all,
        0,
      );

      return {
        slices,
        totalResponses,
        averageRating:
          totalResponses > 0
            ? Number((weightedSum / totalResponses).toFixed(2))
            : null,
        viewMode: 'by_rating',
      };
    }

    const grouped = await this.prismaService.gameNpsResponse.groupBy({
      by: ['schoolId'],
      where: {
        gameSlug,
        schoolId: { not: null },
      },
      _count: {
        _all: true,
      },
      _avg: {
        rating: true,
      },
    });

    const schoolIds = grouped
      .map((row) => row.schoolId)
      .filter((id): id is string => typeof id === 'string' && id.length > 0);

    const schools = schoolIds.length
      ? await this.prismaService.school.findMany({
          where: { id: { in: schoolIds } },
          select: { id: true, name: true },
        })
      : [];

    const schoolNameById = new Map(
      schools.map((school) => [school.id, school.name]),
    );

    const entries = grouped
      .map((row) => ({
        key: row.schoolId ?? 'unknown',
        label: row.schoolId
          ? schoolNameById.get(row.schoolId) ?? row.schoolId
          : 'Sem escola',
        value: row._count._all,
      }))
      .sort((left, right) => right.value - left.value);

    const slices = this.buildDashboardPieSlices(entries);
    const totalResponses = slices.reduce((sum, slice) => sum + slice.value, 0);
    const weightedSum = grouped.reduce((sum, row) => {
      const avg = row._avg.rating ?? 0;
      return sum + avg * row._count._all;
    }, 0);

    return {
      slices,
      totalResponses,
      averageRating:
        totalResponses > 0
          ? Number((weightedSum / totalResponses).toFixed(2))
          : null,
      viewMode: 'by_school',
    };
  }

  async getUserRankingFromMySchool(
    firebaseUid: string,
    gameSlug?: string,
    characterSlug?: string,
  ): Promise<UserRankingInterface[]> {
    const user = await this.getAuthenticatedProfile(firebaseUid);

    if (!user.schoolId) {
      throw new ForbiddenException(
        'O perfil autenticado nao possui escola vinculada.',
      );
    }

    return this.getUserRankingBySchoolId(
      user.schoolId,
      gameSlug,
      characterSlug,
    );
  }

  async getUserRankingBySchoolForViewer(
    firebaseUid: string,
    schoolId: string,
    gameSlug?: string,
    characterSlug?: string,
  ): Promise<UserRankingInterface[]> {
    await this.assertViewerCanAccessSchool(firebaseUid, schoolId);
    await this.ensureSchoolExists(schoolId);

    return this.getUserRankingBySchoolId(schoolId, gameSlug, characterSlug);
  }

  async getAccessUsersBySchool(
    schoolId: string,
  ): Promise<SchoolUserInterface[]> {
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
            schoolId: true,
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
      schoolId: user.schoolId,
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
