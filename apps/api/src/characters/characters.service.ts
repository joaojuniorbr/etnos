import { CharacterInterface } from '@etnos/tools';
import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/firebase';

const COLLECTION_NAME = 'character';

@Injectable()
export class CharactersService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async getCharacters() {
    return this.firebaseService.findAll<CharacterInterface>(COLLECTION_NAME);
  }

  async getCharacterBySlug(slug: string) {
    return this.firebaseService.findOne<CharacterInterface>(COLLECTION_NAME, [
      {
        field: 'slug',
        operator: '==',
        value: slug,
      },
    ]);
  }
}
