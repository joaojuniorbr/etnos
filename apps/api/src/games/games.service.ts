import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/firebase';
import { ConfigGamesInterface } from '@etnos/tools';

const COLLECTION_NAME = 'config-games';

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
}
