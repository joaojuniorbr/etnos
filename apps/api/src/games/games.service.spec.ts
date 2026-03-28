import { Test, TestingModule } from '@nestjs/testing';
import { GamesService } from './games.service';
import { PrismaService } from 'src/prisma';

describe('GamesService', () => {
  let service: GamesService;
  let prismaService: {
    gameConfig: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      upsert: jest.Mock;
      delete: jest.Mock;
    };
    memoryGameContent: {
      create: jest.Mock;
      findMany: jest.Mock;
      delete: jest.Mock;
    };
    gameScore: {
      create: jest.Mock;
      update: jest.Mock;
      findUnique: jest.Mock;
      findMany: jest.Mock;
    };
  };

  const mockGame = {
    id: '1',
    gameSlug: 'memory-game',
    characterSlug: 'joao-silva',
    imageCoverUrl: 'url-aqui',
  };

  const mockPrismaService = {
    gameConfig: {
      findMany: jest.fn().mockResolvedValue([mockGame]),
      findFirst: jest.fn().mockResolvedValue(mockGame),
      findUnique: jest.fn().mockResolvedValue(mockGame),
      upsert: jest.fn(),
      delete: jest.fn(),
    },
    memoryGameContent: {
      create: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      delete: jest.fn(),
    },
    gameScore: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<GamesService>(GamesService);
    prismaService = module.get(PrismaService);
    jest.clearAllMocks();
  });

  it('deve listar jogos', async () => {
    const result = await service.getGames();

    expect(prismaService.gameConfig.findMany).toHaveBeenCalledWith();
    expect(result).toEqual([mockGame]);
  });

  it('deve buscar jogo por slug', async () => {
    const result = await service.getGamesBySlug('memory-game');

    expect(prismaService.gameConfig.findFirst).toHaveBeenCalledWith({
      where: { gameSlug: 'memory-game' },
    });
    expect(result).toEqual(mockGame);
  });

  it('deve salvar configuração de jogo com id composto', async () => {
    await service.saveConfig({
      gameSlug: 'memory-game',
      characterSlug: 'maria',
      imageCoverUrl: 'url',
    });

    expect(prismaService.gameConfig.upsert).toHaveBeenCalledWith({
      where: {
        gameSlug_characterSlug: {
          gameSlug: 'memory-game',
          characterSlug: 'maria',
        },
      },
      create: {
        id: 'memory-game_maria',
        gameSlug: 'memory-game',
        characterSlug: 'maria',
        imageCoverUrl: 'url',
      },
      update: {
        imageCoverUrl: 'url',
      },
    });
  });

  it('deve buscar configuração específica', async () => {
    await service.getConfig('memory-game', 'maria');

    expect(prismaService.gameConfig.findUnique).toHaveBeenCalledWith({
      where: {
        gameSlug_characterSlug: {
          gameSlug: 'memory-game',
          characterSlug: 'maria',
        },
      },
    });
  });

  it('deve buscar configuração por jogo', async () => {
    await service.getConfigByGame('memory-game');

    expect(prismaService.gameConfig.findMany).toHaveBeenCalledWith({
      where: { gameSlug: 'memory-game' },
    });
  });

  it('deve remover configuração', async () => {
    const result = await service.removeConfig('memory-game', 'maria');

    expect(prismaService.gameConfig.delete).toHaveBeenCalledWith({
      where: {
        gameSlug_characterSlug: {
          gameSlug: 'memory-game',
          characterSlug: 'maria',
        },
      },
    });
    expect(result).toBe(true);
  });

  it('deve salvar conteúdo do memory game', async () => {
    const payload = { slug: 'maria', url: 'u', idCharacter: 'c1' };

    await service.saveMemoryGameContent(payload);

    expect(prismaService.memoryGameContent.create).toHaveBeenCalledWith({
      data: {
        id: undefined,
        slug: 'maria',
        url: 'u',
        characterId: 'c1',
      },
    });
  });

  it('deve buscar conteúdo do memory game', async () => {
    prismaService.memoryGameContent.findMany.mockResolvedValueOnce([
      { id: '1', slug: 'maria', url: 'u', characterId: 'c1' },
    ]);

    const result = await service.getMemoryGameContent('maria');

    expect(prismaService.memoryGameContent.findMany).toHaveBeenCalledWith({
      where: { slug: 'maria' },
    });
    expect(result).toEqual([
      { id: '1', slug: 'maria', url: 'u', characterId: 'c1', idCharacter: 'c1' },
    ]);
  });

  it('deve deletar conteúdo do memory game com sucesso', async () => {
    prismaService.memoryGameContent.delete.mockResolvedValueOnce(undefined);

    const result = await service.deleteMemoryGameContent('id-1');

    expect(result).toBe(true);
  });

  it('deve retornar false ao falhar no delete do memory game', async () => {
    prismaService.memoryGameContent.delete.mockRejectedValueOnce(new Error('fail'));

    const result = await service.deleteMemoryGameContent('id-1');

    expect(result).toBe(false);
  });

  it('deve mapear imagens do memory game', async () => {
    jest.spyOn(service, 'getMemoryGameContent').mockResolvedValueOnce([
      { id: '1', slug: 'maria', url: 'u1', idCharacter: 'c1' },
      { id: '2', slug: 'maria', url: 'u2', idCharacter: 'c1' },
    ] as any);

    const result = await service.getMemoryGameImages('maria');

    expect(result).toEqual([
      { id: '1', name: 'maria-1', image: 'u1' },
      { id: '2', name: 'maria-2', image: 'u2' },
    ]);
  });

  it('deve buscar score do jogo por filtros', async () => {
    await service.getScoreGame({
      slug: 'memory-game',
      characterSlug: 'joao-silva',
      userId: 'user-123',
    });

    expect(prismaService.gameScore.findUnique).toHaveBeenCalledWith({
      where: {
        slug_characterSlug_userId: {
          slug: 'memory-game',
          characterSlug: 'joao-silva',
          userId: 'user-123',
        },
      },
    });
  });

  it('deve criar score quando ainda não existir registro', async () => {
    const scoreData = {
      slug: 'memory-game',
      characterSlug: 'joao-silva',
      score: 150,
      userId: 'user-123',
    };

    prismaService.gameScore.create.mockResolvedValueOnce(scoreData);

    await service.saveScoreGame(scoreData);

    expect(prismaService.gameScore.findUnique).toHaveBeenCalledWith({
      where: {
        slug_characterSlug_userId: {
          slug: 'memory-game',
          characterSlug: 'joao-silva',
          userId: 'user-123',
        },
      },
    });
    expect(prismaService.gameScore.create).toHaveBeenCalledWith({
      data: scoreData,
    });
    expect(prismaService.gameScore.update).not.toHaveBeenCalled();
  });

  it('deve atualizar score quando o novo valor for maior', async () => {
    const scoreData = {
      slug: 'memory-game',
      characterSlug: 'joao-silva',
      score: 150,
      userId: 'user-123',
    };

    prismaService.gameScore.findUnique.mockResolvedValueOnce({
      ...scoreData,
      score: 120,
    });

    await service.saveScoreGame(scoreData);

    expect(prismaService.gameScore.update).toHaveBeenCalledWith({
      where: {
        slug_characterSlug_userId: {
          slug: 'memory-game',
          characterSlug: 'joao-silva',
          userId: 'user-123',
        },
      },
      data: { score: 150 },
    });
  });

  it('deve manter score atual quando o novo valor não for maior', async () => {
    const scoreData = {
      slug: 'memory-game',
      characterSlug: 'joao-silva',
      score: 150,
      userId: 'user-123',
    };

    const existingScore = {
      ...scoreData,
      score: 200,
    };

    prismaService.gameScore.findUnique.mockResolvedValueOnce(existingScore);

    const result = await service.saveScoreGame(scoreData);

    expect(prismaService.gameScore.create).not.toHaveBeenCalled();
    expect(prismaService.gameScore.update).not.toHaveBeenCalled();
    expect(result).toEqual(existingScore);
  });

  it('deve manter score atual quando o novo valor for igual', async () => {
    const scoreData = {
      slug: 'memory-game',
      characterSlug: 'joao-silva',
      score: 150,
      userId: 'user-123',
    };

    const existingScore = {
      ...scoreData,
    };

    prismaService.gameScore.findUnique.mockResolvedValueOnce(existingScore);

    const result = await service.saveScoreGame(scoreData);

    expect(prismaService.gameScore.create).not.toHaveBeenCalled();
    expect(prismaService.gameScore.update).not.toHaveBeenCalled();
    expect(result).toEqual(existingScore);
  });

  it('deve listar score por usuário', async () => {
    await service.getScoreByUser('user-1');

    expect(prismaService.gameScore.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
    });
  });
});
