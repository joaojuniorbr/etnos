import { Injectable } from '@nestjs/common';
import type {
  ConfigGamesInterface,
  MemoryGameContentInterface,
  ScoreInterface,
} from '@etnos/types';
import { PrismaService } from 'src/prisma';

@Injectable()
export class GamesService {
  constructor(private readonly prismaService: PrismaService) {}

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

  async getMemoryGameContent(slug: string) {
    const docs = await this.prismaService.memoryGameContent.findMany({
      where: { slug },
    });

    return docs.map((doc) => ({
      ...doc,
      idCharacter: doc.characterId,
    }));
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
