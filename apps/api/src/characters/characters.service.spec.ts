import { Test, TestingModule } from '@nestjs/testing';
import { CharactersService } from './characters.service';
import { CacheService } from 'src/cache';
import { PrismaService } from 'src/prisma';

describe('CharactersService', () => {
  let service: CharactersService;
  let cacheService: CacheService;
  let prismaService: {
    character: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    midia: {
      findMany: jest.Mock;
    };
  };

  const mockCharacter = {
    id: '123',
    name: 'João Silva',
    slug: 'joao-silva',
    region: 'Asia',
    description: 'Descrição do personagem',
    avatarUrls: ['https://avatar.test/1.png'],
  };

  const mockPrismaService = {
    character: {
      findMany: jest.fn().mockResolvedValue([mockCharacter]),
      findUnique: jest.fn().mockResolvedValue(mockCharacter),
      create: jest.fn().mockResolvedValue({ id: '123' }),
      update: jest.fn().mockResolvedValue(undefined),
    },
    midia: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'midia-1',
          url: 'https://avatar.test/1.png',
          folder: 'avatar/joao-silva',
        },
      ]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CharactersService,
        CacheService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CharactersService>(CharactersService);
    cacheService = module.get(CacheService);
    prismaService = module.get(PrismaService);
    cacheService.clear();
    jest.clearAllMocks();
  });

  it('deve listar personagens', async () => {
    const result = await service.getCharacters();

    expect(prismaService.character.findMany).toHaveBeenCalledWith({
      where: undefined,
    });
    expect(result).toEqual([mockCharacter]);
  });

  it('deve listar personagens filtrando por slug', async () => {
    await service.getCharacters('joao-silva');

    expect(prismaService.character.findMany).toHaveBeenCalledWith({
      where: { slug: 'joao-silva' },
    });
  });

  it('deve reutilizar personagens em cache quando a entrada ainda estiver válida', async () => {
    const first = await service.getCharacters('joao-silva');
    const second = await service.getCharacters('joao-silva');

    expect(first).toEqual(second);
    expect(prismaService.character.findMany).toHaveBeenCalledTimes(1);
    expect(prismaService.midia.findMany).toHaveBeenCalledTimes(1);
  });

  it('deve ignorar mídias sem folder ao montar avatarUrls', async () => {
    prismaService.midia.findMany.mockResolvedValueOnce([
      {
        id: 'midia-1',
        url: 'https://avatar.test/1.png',
        folder: 'avatar/joao-silva',
      },
      {
        id: 'midia-2',
        url: 'https://avatar.test/2.png',
        folder: null,
      },
    ]);

    const result = await service.getCharacters();

    expect(result).toEqual([mockCharacter]);
  });

  it('deve evitar consulta de mídias quando não houver personagens', async () => {
    prismaService.character.findMany.mockResolvedValueOnce([]);

    const result = await service.getCharacters();

    expect(result).toEqual([]);
    expect(prismaService.midia.findMany).not.toHaveBeenCalled();
  });

  it('deve retornar avatarUrls vazio quando não houver mídia para o personagem', async () => {
    prismaService.midia.findMany.mockResolvedValueOnce([]);

    const result = await service.getCharacters();

    expect(result).toEqual([
      {
        ...mockCharacter,
        avatarUrls: [],
      },
    ]);
  });

  it('deve buscar por slug', async () => {
    const slug = 'joao-silva';
    const result = await service.getCharacterBySlug(slug);

    expect(prismaService.character.findUnique).toHaveBeenCalledWith({
      where: { slug },
    });
    expect(result).toEqual(mockCharacter);
  });

  it('deve retornar null ao buscar personagem por slug inexistente', async () => {
    prismaService.character.findUnique.mockResolvedValueOnce(null);

    const result = await service.getCharacterBySlug('slug-inexistente');

    expect(prismaService.character.findUnique).toHaveBeenCalledWith({
      where: { slug: 'slug-inexistente' },
    });
    expect(result).toBeNull();
  });

  it('deve listar avatares do personagem pela pasta', async () => {
    const result = await service.getCharacterAvatars('joao-silva');

    expect(prismaService.midia.findMany).toHaveBeenCalledWith({
      where: {
        folder: 'avatar/joao-silva',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    expect(result).toEqual([
      {
        id: 'midia-1',
        url: 'https://avatar.test/1.png',
        folder: 'avatar/joao-silva',
      },
    ]);
  });

  it('deve criar personagem quando slug não existe', async () => {
    mockPrismaService.character.findUnique.mockResolvedValueOnce(null);

    const result = await service.save(mockCharacter);

    expect(prismaService.character.create).toHaveBeenCalledWith({
      data: {
        name: mockCharacter.name,
        slug: mockCharacter.slug,
        region: mockCharacter.region,
        description: mockCharacter.description,
        imageUrl: undefined,
      },
    });
    expect(result).toEqual(mockCharacter);
  });

  it('deve retornar null ao criar personagem com slug duplicado', async () => {
    const result = await service.save(mockCharacter);

    expect(result).toBeNull();
    expect(prismaService.character.create).not.toHaveBeenCalled();
  });

  it('deve atualizar personagem sem conflito', async () => {
    mockPrismaService.character.findUnique.mockResolvedValueOnce({
      ...mockCharacter,
      id: '123',
    });

    const result = await service.update({
      ...mockCharacter,
      name: 'Atualizado',
    });

    expect(prismaService.character.update).toHaveBeenCalledWith({
      where: { id: '123' },
      data: {
        name: 'Atualizado',
        slug: mockCharacter.slug,
        region: mockCharacter.region,
        description: mockCharacter.description,
        imageUrl: undefined,
      },
    });
    expect(result?.name).toBe('Atualizado');
  });

  it('deve retornar null ao atualizar quando slug conflitar com outro id', async () => {
    mockPrismaService.character.findUnique.mockResolvedValueOnce({
      ...mockCharacter,
      id: '999',
    });

    const result = await service.update({
      ...mockCharacter,
      id: '123',
    });

    expect(result).toBeNull();
    expect(prismaService.character.update).not.toHaveBeenCalled();
  });
});
