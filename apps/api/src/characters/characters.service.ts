import { Injectable } from '@nestjs/common';
import type { CharacterInterface } from '@etnos/types';
import { CacheKeys, CachePrefixes, CACHE_TTL_MS, CacheService } from 'src/cache';
import { PrismaService } from 'src/prisma';

@Injectable()
export class CharactersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  private getAvatarFolder(slug: string) {
    return `avatar/${slug}`;
  }

  private async loadCharacters(slug?: string): Promise<CharacterInterface[]> {
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

    return characters.map((character) => ({
      ...character,
      avatarUrls: avatarsByFolder[this.getAvatarFolder(character.slug)] ?? [],
    }));
  }

  async getCharacters(slug?: string) {
    const cacheKey = slug
      ? CacheKeys.charactersFilter(slug)
      : CacheKeys.charactersAll();

    return this.cacheService.getOrSet(cacheKey, CACHE_TTL_MS.catalog, () =>
      this.loadCharacters(slug),
    );
  }

  async getCharacterBySlug(slug: string) {
    return this.cacheService.getOrSet(
      CacheKeys.characterDetail(slug),
      CACHE_TTL_MS.catalog,
      async () => {
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
      },
    );
  }

  async getCharacterAvatars(slug: string) {
    return this.cacheService.getOrSet(
      CacheKeys.characterAvatars(slug),
      CACHE_TTL_MS.catalog,
      () =>
        this.prismaService.midia.findMany({
          where: {
            folder: this.getAvatarFolder(slug),
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
    );
  }

  private invalidateCharacterCaches() {
    this.cacheService.delete(CacheKeys.characterSlugs());
    this.cacheService.invalidateByPrefix('catalog:characters:');
    this.cacheService.invalidateByPrefix('catalog:character:');
    this.cacheService.invalidateByPrefix('catalog:character-avatars:');
    this.cacheService.invalidateByPrefix(CachePrefixes.schoolEnabledAccess);
    this.cacheService.invalidateByPrefix(CachePrefixes.schoolGameAccess);
    this.cacheService.invalidateByPrefix(CachePrefixes.myGameAccess);
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

    this.invalidateCharacterCaches();

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

    this.invalidateCharacterCaches();

    return character;
  }
}
