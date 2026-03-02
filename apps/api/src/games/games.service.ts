import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/firebase';

const COLLECTION_CONFIG = 'config-games';
const COLLECTION_SCORES = 'score-games';
const COLLECTION_MEMORY_GAME = 'game-memory-game';

export interface ConfigGamesInterface {
  id?: string;
  gameSlug: string;
  characterSlug: string;
  imageCoverUrl: string;
}

export interface MemoryGameContentInterface {
  id: string;
  url: string;
  slug: string;
  idCharacter: string;
}

export interface ScoreInterface {
  id?: string;
  characterSlug: string;
  score: number;
  slug: string;
  timestamp?: unknown;
  userId: string;
  createdAt?: unknown;
}

@Injectable()
export class GamesService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async getGames() {
    return this.firebaseService.findAll<ConfigGamesInterface>(COLLECTION_CONFIG);
  }

  async getGamesBySlug(gameSlug: string) {
    return this.firebaseService.findOne<ConfigGamesInterface>(COLLECTION_CONFIG, [
      {
        field: 'gameSlug',
        operator: '==',
        value: gameSlug,
      },
    ]);
  }

  async saveConfig(data: ConfigGamesInterface) {
    const id = `${data.gameSlug}_${data.characterSlug}`;

    await this.firebaseService.create(
      COLLECTION_CONFIG,
      data as unknown as Record<string, unknown>,
      id,
    );

    return {
      id,
      ...data,
    };
  }

  async getConfig(gameSlug: string, characterSlug: string) {
    const id = `${gameSlug}_${characterSlug}`;

    return this.firebaseService.findById(COLLECTION_CONFIG, id) as unknown as Promise<
      ConfigGamesInterface | null
    >;
  }

  async getConfigByGame(gameSlug: string) {
    return this.firebaseService.findAll<ConfigGamesInterface>(COLLECTION_CONFIG, {
      filters: [
        {
          field: 'gameSlug',
          operator: '==',
          value: gameSlug,
        },
      ],
    });
  }

  async removeConfig(gameSlug: string, characterSlug: string) {
    const id = `${gameSlug}_${characterSlug}`;
    await this.firebaseService.delete(COLLECTION_CONFIG, id);
    return true;
  }

  async saveMemoryGameContent(props: Partial<MemoryGameContentInterface>) {
    return this.firebaseService.create(
      COLLECTION_MEMORY_GAME,
      props as unknown as Record<string, unknown>,
    );
  }

  async getMemoryGameContent(slug: string) {
    return this.firebaseService.findAll<MemoryGameContentInterface>(
      COLLECTION_MEMORY_GAME,
      {
        filters: [
          {
            field: 'slug',
            operator: '==',
            value: slug,
          },
        ],
      },
    );
  }

  async deleteMemoryGameContent(id: string) {
    try {
      await this.firebaseService.delete(COLLECTION_MEMORY_GAME, id);
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

  async saveScoreGame(data: {
    slug: string;
    characterSlug: string;
    score: number;
    userId: string;
  }) {
    const existingScore = await this.firebaseService.findOne<ScoreInterface>(
      COLLECTION_SCORES,
      [
        {
          field: 'slug',
          operator: '==',
          value: data.slug,
        },
        {
          field: 'characterSlug',
          operator: '==',
          value: data.characterSlug,
        },
        {
          field: 'userId',
          operator: '==',
          value: data.userId,
        },
      ],
    );

    if (existingScore?.id) {
      return this.firebaseService.update(COLLECTION_SCORES, existingScore.id, {
        score: data.score,
      });
    }

    return this.firebaseService.create(COLLECTION_SCORES, data);
  }

  getScoreGame(data: { slug: string; characterSlug: string; userId: string }) {
    return this.firebaseService.findOne<ScoreInterface>(COLLECTION_SCORES, [
      {
        field: 'slug',
        operator: '==',
        value: data.slug,
      },
      {
        field: 'characterSlug',
        operator: '==',
        value: data.characterSlug,
      },
      {
        field: 'userId',
        operator: '==',
        value: data.userId,
      },
    ]);
  }

  getScoreByUser(userId: string) {
    return this.firebaseService.findAll<ScoreInterface>(COLLECTION_SCORES, {
      filters: [
        {
          field: 'userId',
          operator: '==',
          value: userId,
        },
      ],
    });
  }
}
