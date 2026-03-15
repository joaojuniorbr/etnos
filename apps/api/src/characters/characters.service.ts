import { Injectable } from '@nestjs/common';
import type { CharacterInterface } from '@etnos/types';
import { PrismaService } from 'src/prisma';

@Injectable()
export class CharactersService {
  constructor(private readonly prismaService: PrismaService) {}

  async getCharacters() {
    return this.prismaService.character.findMany();
  }

  async getCharacterBySlug(slug: string) {
    return this.prismaService.character.findUnique({
      where: { slug },
    });
  }

  async save(character: CharacterInterface) {
    const exists = await this.prismaService.character.findUnique({
      where: { slug: character.slug },
    });

    if (exists) return null;

    const created = await this.prismaService.character.create({
      data: {
        name: character.name,
        slug: character.slug,
        region: character.region,
        description: character.description,
        imageUrl: character.imageUrl,
      },
    });

    return {
      id: created.id,
      ...character,
    };
  }

  async update(character: CharacterInterface) {
    const existing = await this.prismaService.character.findUnique({
      where: { slug: character.slug },
    });

    if (existing && existing.id !== character.id) return null;

    await this.prismaService.character.update({
      where: { id: character.id },
      data: {
        name: character.name,
        slug: character.slug,
        region: character.region,
        description: character.description,
        imageUrl: character.imageUrl,
      },
    });

    return character;
  }
}
