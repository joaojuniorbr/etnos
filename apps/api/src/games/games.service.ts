import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/firebase';

const COLLECTION_NAME = 'config-games';

const COLLECTION_SCORES = 'score-games';

export interface ConfigGamesInterface {
  id?: string;
  gameSlug: string;
  characterSlug: string;
  imageCoverUrl: string;
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
    return this.firebaseService.findAll<ConfigGamesInterface>(COLLECTION_NAME);
  }

  async getGamesBySlug(gameSlug: string) {
    return this.firebaseService.findOne<ConfigGamesInterface>(COLLECTION_NAME, [
      {
        field: 'gameSlug',
        operator: '==',
        value: gameSlug,
      },
    ]);
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
}
