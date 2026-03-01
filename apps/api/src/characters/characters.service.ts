import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/firebase';

const COLLECTION_NAME = 'character';

export interface CharacterInterface {
  id: string;
  name: string;
  region: string;
  description: string;
  slug: string;
}

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
