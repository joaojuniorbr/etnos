import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/firebase';

const COLLECTION_NAME = 'character';

export interface CharacterInterface {
  id: string;
  name: string;
  region: string;
  description: string;
  slug: string;
  imageUrl?: string;
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

  async save(character: CharacterInterface) {
    const exists = await this.firebaseService.findOne<CharacterInterface>(
      COLLECTION_NAME,
      [
        {
          field: 'slug',
          operator: '==',
          value: character.slug,
        },
      ],
    );

    if (exists) return null;

    const created = await this.firebaseService.create(
      COLLECTION_NAME,
      character as unknown as Record<string, unknown>,
    );

    return {
      id: created.id,
      ...character,
    };
  }

  async update(character: CharacterInterface) {
    const existing = await this.firebaseService.findOne<CharacterInterface>(
      COLLECTION_NAME,
      [
        {
          field: 'slug',
          operator: '==',
          value: character.slug,
        },
      ],
    );

    if (existing && existing.id !== character.id) return null;

    await this.firebaseService.update(
      COLLECTION_NAME,
      character.id,
      character as unknown as Record<string, unknown>,
    );

    return character;
  }
}
