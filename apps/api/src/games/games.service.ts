import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomInt } from 'node:crypto';
import type {
  ConfigGamesInterface,
  GuessGameContentInterface,
  GuessGamePlayItemInterface,
  GuessGameValidationResultInterface,
  MemoryGameContentInterface,
  ScoreInterface,
} from '@etnos/types';
import { PrismaService } from 'src/prisma';

@Injectable()
export class GamesService {
  constructor(private readonly prismaService: PrismaService) {}

  private isMissingGuessGameContentTable(error: unknown) {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2021'
    );
  }

  private async getUserSchoolId(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        firebaseUid: userId,
      },
      select: {
        school: true,
      },
    });

    return user?.school ?? null;
  }

  async getGames() {
    return this.prismaService.gameConfig.findMany();
  }

  async getGamesBySlug(gameSlug: string) {
    return this.prismaService.gameConfig.findFirst({
      where: { gameSlug },
    });
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
  ): Promise<GuessGamePlayItemInterface | null> {
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

  async getMemoryGameImages(characterSlug: string) {
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
  }) {
    const schoolId = await this.getUserSchoolId(data.userId);

    return this.prismaService.gameScoreHistory.create({
      data: {
        gameSlug: data.slug,
        characterSlug: data.characterSlug,
        score: data.score,
        userId: data.userId,
        schoolId,
      },
    });
  }

  async saveScoreGame(data: {
    slug: string;
    characterSlug: string;
    score: number;
    userId: string;
  }) {
    const where = {
      slug_characterSlug_userId: {
        slug: data.slug,
        characterSlug: data.characterSlug,
        userId: data.userId,
      },
    };

    const existingScore = await this.prismaService.gameScore.findUnique({
      where,
    });

    if (!existingScore) {
      return this.prismaService.gameScore.create({
        data,
      });
    }

    if (data.score > existingScore.score) {
      return this.prismaService.gameScore.update({
        where,
        data: {
          score: data.score,
        },
      });
    }

    return existingScore;
  }

  getScoreGame(data: { slug: string; characterSlug: string; userId: string }) {
    return this.prismaService.gameScore.findUnique({
      where: {
        slug_characterSlug_userId: {
          slug: data.slug,
          characterSlug: data.characterSlug,
          userId: data.userId,
        },
      },
    }) as Promise<ScoreInterface | null>;
  }

  getScoreByUser(userId: string) {
    return this.prismaService.gameScore.findMany({
      where: { userId },
    }) as Promise<ScoreInterface[]>;
  }
}
