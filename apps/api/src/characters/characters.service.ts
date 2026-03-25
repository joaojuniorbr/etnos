import { Injectable } from '@nestjs/common';
import type { CharacterInterface } from '@etnos/types';
import { PrismaService } from 'src/prisma';

@Injectable()
export class CharactersService {
  constructor(private readonly prismaService: PrismaService) {}

  private getAvatarFolder(slug: string) {
    return `avatar/${slug}`;
  }

  async getCharacters(slug?: string) {
    const characters = await this.prismaService.character.findMany({
      where: slug ? { slug } : undefined,
    });

    return Promise.all(
      characters.map(async (character) => ({
        ...character,
        avatarUrls: (await this.getCharacterAvatars(character.slug)).map(
          (item) => item.url,
        ),
      })),
    );
  }

  async getCharacterBySlug(slug: string) {
    const character = await this.prismaService.character.findUnique({
      where: { slug },
    });

    if (!character) {
      return null;
    }

    return {
      ...character,
      avatarUrls: (await this.getCharacterAvatars(slug)).map(
        (item) => item.url,
      ),
    };
  }

  async getCharacterAvatars(slug: string) {
    return this.prismaService.midia.findMany({
      where: {
        folder: this.getAvatarFolder(slug),
      },
      orderBy: {
        createdAt: 'desc',
      },
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
