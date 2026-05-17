import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomInt } from 'node:crypto';
import type {
  ConfigGamesInterface,
  GuessGameContentInterface,
  GuessGamePlayItemInterface,
  GuessGameValidationResultInterface,
  MemoryGameContentInterface,
  ScoreHistory,
  ScoreInterface,
} from '@etnos/types';
import { PrismaService } from 'src/prisma';

const GAME_SLUGS = ['memory-game', 'guess-game'] as const;
const GAME_SLUG = {
  MEMORY_GAME: 'memory-game',
  GUESS_GAME: 'guess-game',
} as const;

@Injectable()
export class GamesService {
  constructor(private readonly prismaService: PrismaService) {}

  private isMissingGuessGameContentTable(error: unknown) {
    if (
      !(error instanceof Prisma.PrismaClientKnownRequestError) ||
      error.code !== 'P2021'
    ) {
      return false;
    }

    const table = error.meta?.table;
    return typeof table === 'string' && table.includes('guess_game_content');
  }

  private async getUserSchoolId(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        firebaseUid: userId,
      },
      select: {
        school: true,
        roles: true,
      },
    });

    return user ?? null;
  }

  private async getEnabledGameAccessForSchool(schoolId: string) {
    const [enabledGames, enabledCharacters, allCharacters] = await Promise.all([
      this.prismaService.schoolEnabledGame.findMany({
        where: { schoolId },
        select: { gameSlug: true },
      }),
      this.prismaService.schoolEnabledCharacter.findMany({
        where: { schoolId },
        select: { characterSlug: true },
      }),
      this.prismaService.character.findMany({
        select: { slug: true },
      }),
    ]);

    return {
      enabledGameSlugs: enabledGames.length
        ? enabledGames.map((game) => game.gameSlug)
        : [...GAME_SLUGS],
      enabledCharacterSlugs: enabledCharacters.length
        ? enabledCharacters.map((character) => character.characterSlug)
        : allCharacters.map((character) => character.slug),
    };
  }

  private async assertUserCanAccessGameContent(
    userId: string,
    gameSlug: string,
    characterSlug: string,
  ) {
    const user = await this.getUserSchoolId(userId);

    if (!user?.school || user.roles?.includes('admin')) {
      return;
    }

    const enabledAccess = await this.getEnabledGameAccessForSchool(user.school);

    if (
      !enabledAccess.enabledGameSlugs.includes(gameSlug) ||
      !enabledAccess.enabledCharacterSlugs.includes(characterSlug)
    ) {
      throw new ForbiddenException(
        'Este jogo ou personagem nao esta habilitado para a escola do usuario.',
      );
    }
  }

  private async abandonInProgressSessions(userId: string) {
    await this.prismaService.gameScoreHistory.updateMany({
      where: {
        userId,
        status: 'in_progress',
      },
      data: {
        endedAt: new Date(),
        status: 'abandoned',
      },
    });
  }

  private mapScoreHistoryRow(item: {
    id: string;
    gameSlug: string;
    characterSlug: string;
    score: number;
    startedAt: Date;
    endedAt: Date | null;
    status: string;
    createdAt: Date;
  }): ScoreHistory {
    const endedOrStarted = item.endedAt ?? item.startedAt;

    return {
      id: item.id,
      characterName: item.characterSlug,
      gameName: item.gameSlug,
      score: item.score,
      timestamp: endedOrStarted.toISOString(),
      startedAt: item.startedAt.toISOString(),
      endedAt: item.endedAt ? item.endedAt.toISOString() : null,
      status: item.status,
    };
  }

  async getGames() {
    return this.prismaService.gameConfig.findMany();
  }

  async getGamesBySlug(gameSlug: string) {
    return this.prismaService.gameConfig.findFirst({
      where: { gameSlug },
    });
  }

  async getScoreHistory(
    userId: string,
    gameSlug?: string,
  ): Promise<ScoreHistory[]> {
    const history = await this.prismaService.gameScoreHistory.findMany({
      where: {
        userId,
        gameSlug: gameSlug || undefined,
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    return history.map((item) => this.mapScoreHistoryRow(item));
  }

  async getScoreHistoryForSchoolUser(
    studentFirebaseUid: string,
    schoolId: string,
  ): Promise<ScoreHistory[]> {
    const rows = await this.prismaService.gameScoreHistory.findMany({
      where: {
        userId: studentFirebaseUid,
        schoolId,
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    return rows.map((item) => this.mapScoreHistoryRow(item));
  }

  async saveConfig(data: ConfigGamesInterface) {
    const id = `${data.gameSlug}_${data.characterSlug}`;

    await this.prismaService.gameConfig.upsert({
      where: {
        gameSlug_characterSlug: {
          gameSlug: data.gameSlug,
          characterSlug: data.characterSlug,
        },
      },
      create: {
        id,
        gameSlug: data.gameSlug,
        characterSlug: data.characterSlug,
        imageCoverUrl: data.imageCoverUrl,
      },
      update: {
        imageCoverUrl: data.imageCoverUrl,
      },
    });

    return {
      id,
      ...data,
    };
  }

  async getConfig(gameSlug: string, characterSlug: string) {
    return this.prismaService.gameConfig.findUnique({
      where: {
        gameSlug_characterSlug: {
          gameSlug,
          characterSlug,
        },
      },
    });
  }

  async getConfigByGame(gameSlug: string) {
    return this.prismaService.gameConfig.findMany({
      where: { gameSlug },
    });
  }

  async removeConfig(gameSlug: string, characterSlug: string) {
    await this.prismaService.gameConfig.delete({
      where: {
        gameSlug_characterSlug: {
          gameSlug,
          characterSlug,
        },
      },
    });
    return true;
  }

  async saveMemoryGameContent(props: Partial<MemoryGameContentInterface>) {
    return this.prismaService.memoryGameContent.create({
      data: {
        id: props.id,
        slug: props.slug,
        url: props.url,
        characterId: props.idCharacter,
      },
    });
  }

  async saveGuessGameContent(props: GuessGameContentInterface) {
    if (props.id) {
      return this.prismaService.guessGameContent.update({
        where: { id: props.id },
        data: {
          title: props.title,
          word: props.word,
          tips: props.tips,
          imageUrl: props.imageUrl ?? null,
          description: props.description,
          characterSlug: props.characterSlug,
        },
      });
    }

    return this.prismaService.guessGameContent.create({
      data: {
        title: props.title,
        word: props.word,
        tips: props.tips,
        imageUrl: props.imageUrl ?? null,
        description: props.description,
        characterSlug: props.characterSlug,
      },
    });
  }

  async getMemoryGameContent(slug: string) {
    const docs = await this.prismaService.memoryGameContent.findMany({
      where: { slug },
    });

    return docs.map((doc) => ({
      ...doc,
      idCharacter: doc.characterId,
    }));
  }

  async getGuessGameContent(characterSlug: string) {
    try {
      return await this.prismaService.guessGameContent.findMany({
        where: { characterSlug },
        orderBy: [{ title: 'asc' }, { word: 'asc' }],
      });
    } catch (error) {
      if (this.isMissingGuessGameContentTable(error)) {
        return [];
      }

      throw error;
    }
  }

  async getGuessGamePlayContent(
    characterSlug: string,
    userId: string,
  ): Promise<GuessGamePlayItemInterface | null> {
    await this.assertUserCanAccessGameContent(
      userId,
      GAME_SLUG.GUESS_GAME,
      characterSlug,
    );

    const items = await this.getGuessGameContent(characterSlug);

    if (!items.length) {
      return null;
    }

    const selectedItem = items[randomInt(items.length)];

    if (!selectedItem) {
      return null;
    }

    return {
      id: selectedItem.id,
      title: selectedItem.title,
      tips: selectedItem.tips,
      imageUrl: selectedItem.imageUrl ?? null,
      characterSlug: selectedItem.characterSlug,
      wordLength: selectedItem.word.length,
    };
  }

  async validateGuessGameAttempt(data: {
    contentId: string;
    guess: string;
    type: 'letter' | 'word';
    currentGuesses?: string;
    userId: string;
  }): Promise<GuessGameValidationResultInterface> {
    const content = await this.prismaService.guessGameContent.findUnique({
      where: {
        id: data.contentId,
      },
    });

    if (!content) {
      return {
        isCorrect: false,
        isSolved: false,
        matchedIndexes: [],
        revealedCharacters: [],
      };
    }

    await this.assertUserCanAccessGameContent(
      data.userId,
      GAME_SLUG.GUESS_GAME,
      content.characterSlug,
    );

    const normalize = (value: string) =>
      value
        .normalize('NFD')
        .replaceAll(/[\u0300-\u036f]/g, '')
        .toLowerCase();

    if (data.type === 'word') {
      const isCorrect = normalize(data.guess) === normalize(content.word);

      return {
        isCorrect,
        isSolved: isCorrect,
        matchedIndexes: [],
        revealedCharacters: [],
        word: isCorrect ? content.word : undefined,
        description: isCorrect ? content.description : undefined,
      };
    }

    const normalizedGuess = normalize(data.guess);
    const matchedIndexes: number[] = [];
    const revealedCharacters: string[] = [];

    for (let index = 0; index < content.word.length; index += 1) {
      const character = content.word[index];

      if (character && normalize(character) === normalizedGuess) {
        matchedIndexes.push(index);
        revealedCharacters.push(character);
      }
    }

    return {
      isCorrect: matchedIndexes.length > 0,
      isSolved: false,
      matchedIndexes,
      revealedCharacters,
    };
  }

  async deleteMemoryGameContent(id: string) {
    try {
      await this.prismaService.memoryGameContent.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  async deleteGuessGameContent(id: string) {
    try {
      await this.prismaService.guessGameContent.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  async getMemoryGameImages(characterSlug: string, userId: string) {
    await this.assertUserCanAccessGameContent(
      userId,
      GAME_SLUG.MEMORY_GAME,
      characterSlug,
    );

    const docs = await this.getMemoryGameContent(characterSlug);

    return docs.map((doc, index) => ({
      id: doc.id,
      name: `${characterSlug}-${index + 1}`,
      image: doc.url,
    }));
  }

  async saveScoreHistory(data: {
    slug: string;
    characterSlug: string;
    score: number;
    userId: string;
    phase?: 'start' | 'end';
    sessionId?: string;
  }) {
    await this.assertUserCanAccessGameContent(
      data.userId,
      data.slug,
      data.characterSlug,
    );

    const userRow = await this.getUserSchoolId(data.userId);
    const schoolId = userRow?.school ?? null;

    if (data.phase === 'start') {
      await this.abandonInProgressSessions(data.userId);

      return this.prismaService.gameScoreHistory.create({
        data: {
          gameSlug: data.slug,
          characterSlug: data.characterSlug,
          score: 0,
          userId: data.userId,
          schoolId,
          startedAt: new Date(),
          endedAt: null,
          status: 'in_progress',
        },
      });
    }

    if (data.phase === 'end' && data.sessionId) {
      const existing = await this.prismaService.gameScoreHistory.findFirst({
        where: {
          id: data.sessionId,
          userId: data.userId,
          status: 'in_progress',
        },
      });

      if (!existing) {
        await this.abandonInProgressSessions(data.userId);
        const now = new Date();

        return this.prismaService.gameScoreHistory.create({
          data: {
            gameSlug: data.slug,
            characterSlug: data.characterSlug,
            score: data.score,
            userId: data.userId,
            schoolId,
            startedAt: now,
            endedAt: now,
            status: 'completed',
          },
        });
      }

      return this.prismaService.gameScoreHistory.update({
        where: { id: data.sessionId },
        data: {
          score: data.score,
          endedAt: new Date(),
          status: 'completed',
        },
      });
    }

    await this.abandonInProgressSessions(data.userId);
    const now = new Date();

    return this.prismaService.gameScoreHistory.create({
      data: {
        gameSlug: data.slug,
        characterSlug: data.characterSlug,
        score: data.score,
        userId: data.userId,
        schoolId,
        startedAt: now,
        endedAt: now,
        status: 'completed',
      },
    });
  }

  async saveScoreGame(data: {
    slug: string;
    characterSlug: string;
    score: number;
    userId: string;
  }) {
    await this.assertUserCanAccessGameContent(
      data.userId,
      data.slug,
      data.characterSlug,
    );

    const where = {
      slug_characterSlug_userId: {
        slug: data.slug,
        characterSlug: data.characterSlug,
        userId: data.userId,
      },
    };

    return this.prismaService.$transaction(async (transaction) => {
      await transaction.gameScore.upsert({
        where,
        create: data,
        update: {
          score: {
            increment: 0,
          },
        },
      });

      await transaction.gameScore.updateMany({
        where: {
          slug: data.slug,
          characterSlug: data.characterSlug,
          userId: data.userId,
          score: {
            lt: data.score,
          },
        },
        data: {
          score: data.score,
        },
      });

      return transaction.gameScore.findUnique({
        where,
      });
    });
  }

  getScoreGame(data: { slug: string; characterSlug: string; userId: string }) {
    return this.assertUserCanAccessGameContent(
      data.userId,
      data.slug,
      data.characterSlug,
    ).then(() =>
      this.prismaService.gameScore.findUnique({
        where: {
          slug_characterSlug_userId: {
            slug: data.slug,
            characterSlug: data.characterSlug,
            userId: data.userId,
          },
        },
      }),
    ) as Promise<ScoreInterface | null>;
  }

  async saveGameNps(data: {
    slug: string;
    characterSlug: string;
    rating: number;
    comment?: string | null;
    userId: string;
  }) {
    await this.assertUserCanAccessGameContent(
      data.userId,
      data.slug,
      data.characterSlug,
    );

    const userRow = await this.getUserSchoolId(data.userId);
    const schoolId = userRow?.school ?? null;
    const comment =
      typeof data.comment === 'string' && data.comment.trim().length > 0
        ? data.comment.trim()
        : null;

    return this.prismaService.gameNpsResponse.create({
      data: {
        rating: data.rating,
        comment,
        userId: data.userId,
        characterSlug: data.characterSlug,
        gameSlug: data.slug,
        schoolId,
      },
    });
  }

  getUserGameNps(data: { slug: string; userId: string }) {
    return this.prismaService.gameNpsResponse.findFirst({
      where: {
        gameSlug: data.slug,
        userId: data.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  getScoreByUser(userId: string) {
    return this.prismaService.gameScore.findMany({
      where: { userId },
    }) as Promise<ScoreInterface[]>;
  }
}
