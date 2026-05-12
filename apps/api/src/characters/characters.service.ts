import { Injectable } from '@nestjs/common';
import type { CharacterInterface } from '@etnos/types';
import { PrismaService } from 'src/prisma';

@Injectable()
export class CharactersService {
  private readonly cacheTtlMs = 30_000;
  private readonly charactersCache = new Map<
    string,
    { expiresAt: number; data: CharacterInterface[] }
  >();

  constructor(private readonly prismaService: PrismaService) {}

  private getAvatarFolder(slug: string) {
    return `avatar/${slug}`;
  }

  async getCharacters(slug?: string) {
    const cacheKey = slug ?? '__all__';
    const cached = this.charactersCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const characters = await this.prismaService.character.findMany({
      where: slug ? { slug } : undefined,
    });

    const avatarFolders = characters.map((character) =>
      this.getAvatarFolder(character.slug),
    );
    const avatarRows = avatarFolders.length
      ? await this.prismaService.midia.findMany({
          where: {
            folder: {
              in: avatarFolders,
            },
          },
          select: {
            folder: true,
            url: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        })
      : [];

    const avatarsByFolder = avatarRows.reduce<Record<string, string[]>>(
      (acc, avatar) => {
        if (!avatar.folder) {
          return acc;
        }

        acc[avatar.folder] ??= [];
        acc[avatar.folder].push(avatar.url);
        return acc;
      },
      {},
    );

    const data = characters.map((character) => ({
      ...character,
      avatarUrls: avatarsByFolder[this.getAvatarFolder(character.slug)] ?? [],
    }));

    this.charactersCache.set(cacheKey, {
      expiresAt: Date.now() + this.cacheTtlMs,
      data,
    });

    return data;
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

    this.charactersCache.clear();

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

    this.charactersCache.clear();

    return character;
  }
}
