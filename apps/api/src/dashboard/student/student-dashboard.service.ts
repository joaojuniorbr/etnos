import { ForbiddenException, Injectable } from '@nestjs/common';
import type { StudentDashboardInterface } from '@etnos/types';
import { CacheKeys, CACHE_TTL_MS, CacheService } from 'src/cache';
import { PrismaService } from 'src/prisma';
import { GAME_SLUGS, getGameCatalogBySlugs } from 'src/games/games.catalog';
import {
  toStudentDashboard,
  totalScoreByUser,
} from './student-dashboard.utils';

@Injectable()
export class StudentDashboardService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  async getDashboard(
    firebaseUid: string,
    characterSlug?: string,
  ): Promise<StudentDashboardInterface> {
    const profile = await this.prismaService.user.findUnique({
      where: { firebaseUid },
      select: {
        childName: true,
        parentName: true,
        email: true,
        schoolId: true,
        avatarCharacterSlug: true,
      },
    });

    if (!profile) {
      throw new ForbiddenException('Perfil do estudante não encontrado.');
    }

    const resolvedCharacter =
      characterSlug || profile.avatarCharacterSlug || undefined;

    const access = profile.schoolId
      ? await this.loadSchoolAccess(profile.schoolId)
      : {
          enabledGameSlugs: [...GAME_SLUGS],
          enabledCharacterSlugs: await this.loadCharacterSlugs(),
        };

    const schoolUsers = profile.schoolId
      ? await this.prismaService.user.findMany({
          where: { schoolId: profile.schoolId, roles: { has: 'student' } },
          select: {
            firebaseUid: true,
            childName: true,
            parentName: true,
            email: true,
          },
        })
      : [];

    const studentUids = schoolUsers.map((user) => user.firebaseUid);
    const coverSlugs = [
      ...new Set([
        ...access.enabledCharacterSlugs,
        ...(resolvedCharacter ? [resolvedCharacter] : []),
      ]),
    ];

    const games = getGameCatalogBySlugs(access.enabledGameSlugs);

    const [scores, history, schoolScores, characters, covers] =
      await Promise.all([
        this.prismaService.gameScore.findMany({
          where: { userId: firebaseUid },
          select: { slug: true, characterSlug: true, score: true },
        }),
        this.prismaService.gameScoreHistory.findMany({
          where: { userId: firebaseUid },
          orderBy: { startedAt: 'desc' },
          take: 20,
          select: {
            id: true,
            gameSlug: true,
            characterSlug: true,
            score: true,
            startedAt: true,
            endedAt: true,
            status: true,
          },
        }),
        studentUids.length
          ? this.prismaService.gameScore.findMany({
              where: { userId: { in: studentUids } },
              select: {
                userId: true,
                slug: true,
                characterSlug: true,
                score: true,
              },
            })
          : [],
        this.prismaService.character.findMany({
          where: { slug: { in: access.enabledCharacterSlugs } },
          select: {
            slug: true,
            name: true,
            region: true,
            imageUrl: true,
            description: true,
            id: true,
          },
          orderBy: { name: 'asc' },
        }),
        this.loadCovers(
          games.map((game) => game.slug),
          coverSlugs,
        ),
      ]);

    return toStudentDashboard({
      profile: { firebaseUid, ...profile },
      characterSlug: resolvedCharacter,
      scores,
      history,
      games,
      enabledCharacterSlugs: access.enabledCharacterSlugs,
      schoolUsers,
      schoolScoresByUid: totalScoreByUser(schoolScores),
      characters,
      covers,
    });
  }

  private async loadSchoolAccess(schoolId: string) {
    return this.cacheService.getOrSet(
      CacheKeys.schoolEnabledAccess(schoolId),
      CACHE_TTL_MS.gameAccess,
      async () => {
        const [games, characters, allSlugs] = await Promise.all([
          this.prismaService.schoolEnabledGame.findMany({
            where: { schoolId },
            select: { gameSlug: true },
          }),
          this.prismaService.schoolEnabledCharacter.findMany({
            where: { schoolId },
            select: { characterSlug: true },
          }),
          this.loadCharacterSlugs(),
        ]);

        return {
          enabledGameSlugs: games.length
            ? games.map((g) => g.gameSlug)
            : [...GAME_SLUGS],
          enabledCharacterSlugs: characters.length
            ? characters.map((c) => c.characterSlug)
            : allSlugs,
        };
      },
    );
  }

  private async loadCharacterSlugs() {
    return this.cacheService.getOrSet(
      CacheKeys.characterSlugs(),
      CACHE_TTL_MS.characterSlugs,
      async () => {
        const rows = await this.prismaService.character.findMany({
          select: { slug: true },
        });
        return rows.map((row) => row.slug);
      },
    );
  }

  private async loadCovers(gameSlugs: string[], characterSlugs: string[]) {
    if (!gameSlugs.length || !characterSlugs.length) return new Map();

    const rows = await this.prismaService.gameConfig.findMany({
      where: {
        gameSlug: { in: gameSlugs },
        characterSlug: { in: characterSlugs },
      },
      select: { gameSlug: true, characterSlug: true, imageCoverUrl: true },
    });

    return new Map(
      rows.map((row) => [
        `${row.gameSlug}:${row.characterSlug}`,
        row.imageCoverUrl,
      ]),
    );
  }
}
