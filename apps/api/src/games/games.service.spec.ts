import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as crypto from 'node:crypto';
import { GamesService } from './games.service';
import { CacheService } from 'src/cache';
import { PrismaService } from 'src/prisma';

describe('GamesService', () => {
  let service: GamesService;
  let prismaService: {
    user: {
      findUnique: jest.Mock;
    };
    character: {
      findMany: jest.Mock;
    };
    schoolEnabledGame: {
      findMany: jest.Mock;
    };
    schoolEnabledCharacter: {
      findMany: jest.Mock;
    };
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
    guessGameContent: {
      create: jest.Mock;
      update: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      delete: jest.Mock;
    };
    gameScore: {
      upsert: jest.Mock;
      updateMany: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      findUnique: jest.Mock;
      findMany: jest.Mock;
    };
    gameScoreHistory: {
      create: jest.Mock;
      findMany: jest.Mock;
      updateMany: jest.Mock;
      update: jest.Mock;
      findFirst: jest.Mock;
    };
    gameNpsResponse: {
      create: jest.Mock;
      findFirst: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  const mockGame = {
    id: '1',
    gameSlug: 'memory-game',
    characterSlug: 'joao-silva',
    imageCoverUrl: 'url-aqui',
  };

  const makeGuessGameContent = (overrides: Record<string, unknown> = {}) => ({
    id: 'guess-1',
    title: 'Chimarrao',
    word: 'Bomba',
    tips: ['Dica 1'],
    imageUrl: null,
    description: 'Descricao',
    characterSlug: 'anita',
    ...overrides,
  });

  const makeScoreData = (overrides: Record<string, unknown> = {}) => ({
    slug: 'memory-game',
    characterSlug: 'joao-silva',
    score: 150,
    userId: 'user-123',
    ...overrides,
  });

  const makeKnownRequestError = (table?: string) =>
    Object.assign(
      new Prisma.PrismaClientKnownRequestError('Tabela inexistente', {
        code: 'P2021',
        clientVersion: '6.19.2',
      }),
      table
        ? {
            meta: {
              table,
            },
          }
        : {},
    );

  const expectScoreLookup = (scoreData: ReturnType<typeof makeScoreData>) => {
    expect(prismaService.gameScore.findUnique).toHaveBeenCalledWith({
      where: {
        slug_characterSlug_userId: {
          slug: scoreData.slug,
          characterSlug: scoreData.characterSlug,
          userId: scoreData.userId,
        },
      },
    });
  };

  const mockPrismaService = {
    user: {
      findUnique: jest
        .fn()
        .mockResolvedValue({ schoolId: 'school-1', roles: ['student'] }),
    },
    character: {
      findMany: jest
        .fn()
        .mockResolvedValue([
          { slug: 'anita' },
          { slug: 'joao-silva' },
          { slug: 'maria' },
        ]),
    },
    schoolEnabledGame: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    schoolEnabledCharacter: {
      findMany: jest.fn().mockResolvedValue([]),
    },
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
    guessGameContent: {
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      delete: jest.fn(),
    },
    gameScore: {
      upsert: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
    },
    gameScoreHistory: {
      create: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      update: jest.fn(),
      findFirst: jest.fn(),
    },
    gameNpsResponse: {
      create: jest.fn().mockResolvedValue({ id: 'nps-1' }),
      findFirst: jest.fn().mockResolvedValue(null),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamesService,
        CacheService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<GamesService>(GamesService);
    prismaService = module.get(PrismaService);
    module.get(CacheService).clear();
    jest.clearAllMocks();
    prismaService.user.findUnique.mockResolvedValue({
      schoolId: 'school-1',
      roles: ['student'],
    });
    prismaService.character.findMany.mockResolvedValue([
      { slug: 'anita' },
      { slug: 'joao-silva' },
      { slug: 'maria' },
    ]);
    prismaService.schoolEnabledGame.findMany.mockResolvedValue([]);
    prismaService.schoolEnabledCharacter.findMany.mockResolvedValue([]);
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
      {
        id: '1',
        slug: 'maria',
        url: 'u',
        characterId: 'c1',
        idCharacter: 'c1',
      },
    ]);
  });

  it('reutiliza cache de acesso por escola e de personagens', async () => {
    prismaService.memoryGameContent.findMany.mockResolvedValue([
      { id: '1', slug: 'anita', url: 'imagem-1', characterId: 'char-1' },
    ]);

    await service.getMemoryGameImages('anita', 'user-123');
    await service.getMemoryGameImages('anita', 'user-123');

    expect(prismaService.schoolEnabledGame.findMany).toHaveBeenCalledTimes(1);
    expect(prismaService.schoolEnabledCharacter.findMany).toHaveBeenCalledTimes(
      1,
    );
    expect(prismaService.character.findMany).toHaveBeenCalledTimes(1);

    prismaService.user.findUnique.mockResolvedValueOnce({
      schoolId: 'school-2',
      roles: ['student'],
    });

    await service.getMemoryGameImages('anita', 'user-456');

    expect(prismaService.character.findMany).toHaveBeenCalledTimes(1);
    expect(prismaService.schoolEnabledGame.findMany).toHaveBeenCalledTimes(2);
  });

  it('bloqueia acesso a conteúdo não habilitado para a escola do usuário', async () => {
    prismaService.schoolEnabledGame.findMany.mockResolvedValueOnce([
      { gameSlug: 'guess-game' },
    ]);
    prismaService.schoolEnabledCharacter.findMany.mockResolvedValueOnce([
      { characterSlug: 'iara' },
    ]);

    await expect(
      service.getMemoryGameImages('anita', 'user-123'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('permite acesso ao conteúdo quando o usuário não possui escola vinculada', async () => {
    prismaService.user.findUnique.mockResolvedValueOnce(null);
    prismaService.memoryGameContent.findMany.mockResolvedValueOnce([
      { id: '1', slug: 'anita', url: 'imagem-1', characterId: 'char-1' },
    ]);

    const result = await service.getMemoryGameImages('anita', 'user-123');

    expect(result).toEqual([{ id: '1', name: 'anita-1', image: 'imagem-1' }]);
    expect(prismaService.schoolEnabledGame.findMany).not.toHaveBeenCalled();
    expect(
      prismaService.schoolEnabledCharacter.findMany,
    ).not.toHaveBeenCalled();
  });

  it('deve criar conteúdo do guess game quando não houver id', async () => {
    const payload = makeGuessGameContent({ id: undefined });

    await service.saveGuessGameContent(payload);

    expect(prismaService.guessGameContent.create).toHaveBeenCalledWith({
      data: payload,
    });
  });

  it('deve atualizar conteúdo do guess game quando houver id', async () => {
    const payload = makeGuessGameContent({
      imageUrl: undefined,
    });

    await service.saveGuessGameContent(payload);

    expect(prismaService.guessGameContent.update).toHaveBeenCalledWith({
      where: { id: 'guess-1' },
      data: {
        title: payload.title,
        word: payload.word,
        tips: payload.tips,
        imageUrl: null,
        description: payload.description,
        characterSlug: payload.characterSlug,
      },
    });
  });

  it('deve buscar conteúdo do guess game ordenado por título e palavra', async () => {
    await service.getGuessGameContent('anita');

    expect(prismaService.guessGameContent.findMany).toHaveBeenCalledWith({
      where: { characterSlug: 'anita' },
      orderBy: [{ title: 'asc' }, { word: 'asc' }],
    });
  });

  it('deve selecionar um conteúdo jogável sem expor a palavra', async () => {
    prismaService.guessGameContent.findMany.mockResolvedValueOnce([
      makeGuessGameContent(),
    ]);

    jest.spyOn(crypto, 'randomInt').mockImplementationOnce(() => 0 as never);

    await expect(
      service.getGuessGamePlayContent('anita', 'user-123'),
    ).resolves.toEqual({
      id: 'guess-1',
      title: 'Chimarrao',
      tips: ['Dica 1'],
      imageUrl: null,
      characterSlug: 'anita',
      wordLength: 5,
    });
  });

  it('deve retornar null quando não houver conteúdo jogável', async () => {
    prismaService.guessGameContent.findMany.mockResolvedValueOnce([]);

    await expect(
      service.getGuessGamePlayContent('anita', 'user-123'),
    ).resolves.toBeNull();
  });

  it('deve retornar null quando o item sorteado não existir', async () => {
    jest
      .spyOn(service, 'getGuessGameContent')
      .mockResolvedValueOnce([undefined] as any);

    await expect(
      service.getGuessGamePlayContent('anita', 'user-123'),
    ).resolves.toBeNull();
  });

  it('deve retornar lista vazia quando a tabela do guess game ainda não existir', async () => {
    prismaService.guessGameContent.findMany.mockRejectedValueOnce(
      makeKnownRequestError('public.guess_game_contents'),
    );

    await expect(service.getGuessGameContent('anita')).resolves.toEqual([]);
  });

  it('deve relançar erro inesperado ao buscar conteúdo do guess game', async () => {
    prismaService.guessGameContent.findMany.mockRejectedValueOnce(
      new Error('erro inesperado'),
    );

    await expect(service.getGuessGameContent('anita')).rejects.toThrow(
      'erro inesperado',
    );
  });

  it('deve relançar erro P2021 quando a tabela ausente não for a do guess game', async () => {
    prismaService.guessGameContent.findMany.mockRejectedValueOnce(
      makeKnownRequestError('public.memory_game_contents'),
    );

    await expect(service.getGuessGameContent('anita')).rejects.toThrow(
      'Tabela inexistente',
    );
  });

  it('deve relançar erro P2021 quando o Prisma não informar meta.table', async () => {
    prismaService.guessGameContent.findMany.mockRejectedValueOnce(
      makeKnownRequestError(),
    );

    await expect(service.getGuessGameContent('anita')).rejects.toThrow(
      'Tabela inexistente',
    );
  });

  it('deve validar palavra completa correta', async () => {
    prismaService.guessGameContent.findUnique.mockResolvedValueOnce(
      makeGuessGameContent(),
    );

    await expect(
      service.validateGuessGameAttempt({
        contentId: 'guess-1',
        guess: 'bomba',
        type: 'word',
        userId: 'user-123',
      }),
    ).resolves.toEqual({
      isCorrect: true,
      isSolved: true,
      matchedIndexes: [],
      revealedCharacters: [],
      word: 'Bomba',
      description: 'Descricao',
    });
  });

  it('deve validar palavra completa incorreta sem expor resposta', async () => {
    prismaService.guessGameContent.findUnique.mockResolvedValueOnce(
      makeGuessGameContent(),
    );

    await expect(
      service.validateGuessGameAttempt({
        contentId: 'guess-1',
        guess: 'cuia',
        type: 'word',
        userId: 'user-123',
      }),
    ).resolves.toEqual({
      isCorrect: false,
      isSolved: false,
      matchedIndexes: [],
      revealedCharacters: [],
      word: undefined,
      description: undefined,
    });
  });

  it('deve validar letra correta sem resolver a palavra inteira', async () => {
    prismaService.guessGameContent.findUnique.mockResolvedValueOnce(
      makeGuessGameContent(),
    );

    await expect(
      service.validateGuessGameAttempt({
        contentId: 'guess-1',
        guess: 'b',
        type: 'letter',
        userId: 'user-123',
      }),
    ).resolves.toEqual({
      isCorrect: true,
      isSolved: false,
      matchedIndexes: [0, 3],
      revealedCharacters: ['B', 'b'],
    });
  });

  it('deve retornar tentativa inválida quando o conteúdo não existir', async () => {
    prismaService.guessGameContent.findUnique.mockResolvedValueOnce(null);

    await expect(
      service.validateGuessGameAttempt({
        contentId: 'missing',
        guess: 'b',
        type: 'letter',
        userId: 'user-123',
      }),
    ).resolves.toEqual({
      isCorrect: false,
      isSolved: false,
      matchedIndexes: [],
      revealedCharacters: [],
    });
  });

  it('deve deletar conteúdo do memory game com sucesso', async () => {
    prismaService.memoryGameContent.delete.mockResolvedValueOnce(undefined);

    const result = await service.deleteMemoryGameContent('id-1');

    expect(result).toBe(true);
  });

  it('deve deletar conteúdo do guess game com sucesso', async () => {
    prismaService.guessGameContent.delete.mockResolvedValueOnce(undefined);

    const result = await service.deleteGuessGameContent('id-1');

    expect(result).toBe(true);
  });

  it('deve retornar false ao falhar no delete do memory game', async () => {
    prismaService.memoryGameContent.delete.mockRejectedValueOnce(
      new Error('fail'),
    );

    const result = await service.deleteMemoryGameContent('id-1');

    expect(result).toBe(false);
  });

  it('deve retornar false ao falhar no delete do guess game', async () => {
    prismaService.guessGameContent.delete.mockRejectedValueOnce(
      new Error('fail'),
    );

    const result = await service.deleteGuessGameContent('id-1');

    expect(result).toBe(false);
  });

  it('deve mapear imagens do memory game', async () => {
    jest.spyOn(service, 'getMemoryGameContent').mockResolvedValueOnce([
      { id: '1', slug: 'maria', url: 'u1', idCharacter: 'c1' },
      { id: '2', slug: 'maria', url: 'u2', idCharacter: 'c1' },
    ] as any);

    const result = await service.getMemoryGameImages('maria', 'user-123');

    expect(result).toEqual([
      { id: '1', name: 'maria-1', image: 'u1' },
      { id: '2', name: 'maria-2', image: 'u2' },
    ]);
  });

  it('deve buscar score do jogo por filtros', async () => {
    const scoreData = makeScoreData();

    await service.getScoreGame(scoreData);

    expectScoreLookup(scoreData);
  });

  it('deve salvar score usando transação e comparação atômica', async () => {
    const scoreData = makeScoreData();

    prismaService.gameScore.findUnique.mockResolvedValueOnce(scoreData);

    const result = await service.saveScoreGame(scoreData);

    expect(prismaService.user.findUnique).toHaveBeenCalled();
    expect(prismaService.gameScoreHistory.create).not.toHaveBeenCalled();
    expect(prismaService.$transaction).toHaveBeenCalledWith(
      expect.any(Function),
    );
    expect(prismaService.gameScore.upsert).toHaveBeenCalledWith({
      where: {
        slug_characterSlug_userId: {
          slug: 'memory-game',
          characterSlug: 'joao-silva',
          userId: 'user-123',
        },
      },
      create: scoreData,
      update: {
        score: {
          increment: 0,
        },
      },
    });
    expect(prismaService.gameScore.updateMany).toHaveBeenCalledWith({
      where: {
        slug: 'memory-game',
        characterSlug: 'joao-silva',
        userId: 'user-123',
        score: {
          lt: 150,
        },
      },
      data: {
        score: 150,
      },
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
    expect(result).toEqual(scoreData);
    expect(prismaService.gameScore.create).not.toHaveBeenCalled();
    expect(prismaService.gameScore.update).not.toHaveBeenCalled();
  });

  it('deve manter retorno do score atual quando o novo valor nao superar o banco', async () => {
    const scoreData = makeScoreData();
    const currentScore = {
      ...scoreData,
      score: 200,
    };
    prismaService.gameScore.findUnique.mockResolvedValueOnce(currentScore);

    const result = await service.saveScoreGame(scoreData);

    expect(prismaService.gameScore.updateMany).toHaveBeenCalledWith({
      where: {
        slug: 'memory-game',
        characterSlug: 'joao-silva',
        userId: 'user-123',
        score: {
          lt: 150,
        },
      },
      data: { score: 150 },
    });
    expect(result).toEqual(currentScore);
  });

  it('deve salvar histórico de score com escola vinculada', async () => {
    const scoreData = makeScoreData();

    await service.saveScoreHistory(scoreData);

    expect(prismaService.gameScoreHistory.updateMany).toHaveBeenCalled();
    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: {
        firebaseUid: 'user-123',
      },
      select: {
        schoolId: true,
        roles: true,
      },
    });
    expect(prismaService.gameScoreHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        gameSlug: 'memory-game',
        characterSlug: 'joao-silva',
        score: 150,
        userId: 'user-123',
        schoolId: 'school-1',
        status: 'completed',
      }),
    });
  });

  it('deve salvar histórico sem escola quando o usuário não estiver vinculado', async () => {
    const scoreData = makeScoreData({ score: 90 });

    prismaService.user.findUnique.mockResolvedValue({
      school: null,
      roles: ['student'],
    });

    await service.saveScoreHistory(scoreData);

    expect(prismaService.gameScoreHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        gameSlug: 'memory-game',
        characterSlug: 'joao-silva',
        score: 90,
        userId: 'user-123',
        schoolId: null,
        status: 'completed',
      }),
    });
    expect(prismaService.gameScore.create).not.toHaveBeenCalled();
  });

  it('deve registrar resposta de NPS com escola e comentário opcional', async () => {
    const created = {
      id: 'nps-1',
      rating: 5,
      comment: 'Muito bom',
      userId: 'user-123',
      characterSlug: 'joao-silva',
      gameSlug: 'memory-game',
      schoolId: 'school-1',
      createdAt: new Date(),
    };
    prismaService.gameNpsResponse.create.mockResolvedValueOnce(created);

    const result = await service.saveGameNps({
      slug: 'memory-game',
      characterSlug: 'joao-silva',
      rating: 5,
      comment: 'Muito bom',
      userId: 'user-123',
    });

    expect(prismaService.gameNpsResponse.create).toHaveBeenCalledWith({
      data: {
        rating: 5,
        comment: 'Muito bom',
        userId: 'user-123',
        characterSlug: 'joao-silva',
        gameSlug: 'memory-game',
        schoolId: 'school-1',
      },
    });
    expect(result).toEqual(created);
  });

  it('deve registrar NPS com comentário vazio como null', async () => {
    prismaService.gameNpsResponse.create.mockResolvedValueOnce({ id: 'nps-2' });

    await service.saveGameNps({
      slug: 'memory-game',
      characterSlug: 'joao-silva',
      rating: 3,
      comment: '   ',
      userId: 'user-123',
    });

    expect(prismaService.gameNpsResponse.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        comment: null,
        rating: 3,
      }),
    });
  });

  it('deve registrar NPS sem escola quando o usuário não for encontrado', async () => {
    prismaService.user.findUnique.mockResolvedValue(null);
    prismaService.gameNpsResponse.create.mockResolvedValueOnce({ id: 'nps-4' });

    await service.saveGameNps({
      slug: 'memory-game',
      characterSlug: 'joao-silva',
      rating: 4,
      userId: 'user-123',
    });

    expect(prismaService.gameNpsResponse.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        rating: 4,
        comment: null,
        schoolId: null,
      }),
    });
  });

  it('deve consultar NPS por jogo e usuário', async () => {
    prismaService.gameNpsResponse.findFirst.mockResolvedValueOnce({
      id: 'nps-3',
    });

    const result = await service.getUserGameNps({
      slug: 'guess-game',
      userId: 'user-123',
    });

    expect(prismaService.gameNpsResponse.findFirst).toHaveBeenCalledWith({
      where: {
        gameSlug: 'guess-game',
        userId: 'user-123',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    expect(result).toEqual({ id: 'nps-3' });
  });

  it('deve listar score por usuário', async () => {
    await service.getScoreByUser('user-1');

    expect(prismaService.gameScore.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
    });
  });

  it('deve listar histórico de score por usuário', async () => {
    const createdAt = new Date();
    prismaService.gameScoreHistory.findMany.mockResolvedValueOnce([
      {
        id: 'hist-1',
        gameSlug: 'memory-game',
        characterSlug: 'anita',
        score: 100,
        startedAt: createdAt,
        endedAt: createdAt,
        status: 'completed',
        createdAt,
      },
    ]);

    const result = await service.getScoreHistory('user-1');

    expect(prismaService.gameScoreHistory.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', gameSlug: undefined },
      orderBy: { startedAt: 'desc' },
    });
    expect(result).toEqual([
      {
        id: 'hist-1',
        characterName: 'anita',
        gameName: 'memory-game',
        score: 100,
        timestamp: createdAt.toISOString(),
        startedAt: createdAt.toISOString(),
        endedAt: createdAt.toISOString(),
        status: 'completed',
      },
    ]);
  });

  it('deve mapear histórico com sessão em andamento (endedAt nulo)', async () => {
    const startedAt = new Date('2026-05-01T10:00:00.000Z');
    const createdAt = new Date('2026-05-01T10:00:01.000Z');
    prismaService.gameScoreHistory.findMany.mockResolvedValueOnce([
      {
        id: 'hist-progress',
        gameSlug: 'memory-game',
        characterSlug: 'joao-silva',
        score: 0,
        startedAt,
        endedAt: null,
        status: 'in_progress',
        createdAt,
      },
    ]);

    const result = await service.getScoreHistory('user-1');

    expect(result[0]).toEqual({
      id: 'hist-progress',
      characterName: 'joao-silva',
      gameName: 'memory-game',
      score: 0,
      timestamp: startedAt.toISOString(),
      startedAt: startedAt.toISOString(),
      endedAt: null,
      status: 'in_progress',
    });
  });

  it('deve listar histórico de score filtrado por jogo', async () => {
    await service.getScoreHistory('user-1', 'guess-game');

    expect(prismaService.gameScoreHistory.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', gameSlug: 'guess-game' },
      orderBy: { startedAt: 'desc' },
    });
  });

  it('deve listar histórico por aluno e escola', async () => {
    const createdAt = new Date();
    prismaService.gameScoreHistory.findMany.mockResolvedValueOnce([
      {
        id: 'hist-2',
        gameSlug: 'guess-game',
        characterSlug: 'anita',
        score: 40,
        startedAt: createdAt,
        endedAt: createdAt,
        status: 'completed',
        createdAt,
      },
    ]);

    const result = await service.getScoreHistoryForSchoolUser(
      'student-uid',
      'school-1',
    );

    expect(prismaService.gameScoreHistory.findMany).toHaveBeenCalledWith({
      where: { userId: 'student-uid', schoolId: 'school-1' },
      orderBy: { startedAt: 'desc' },
    });
    expect(result[0]).toMatchObject({
      id: 'hist-2',
      gameName: 'guess-game',
      characterName: 'anita',
      score: 40,
      status: 'completed',
    });
  });

  it('deve iniciar sessão de histórico com phase start', async () => {
    prismaService.gameScoreHistory.create.mockResolvedValueOnce({
      id: 'sess-new',
    });

    await service.saveScoreHistory({
      ...makeScoreData({ score: 0 }),
      phase: 'start',
    });

    expect(prismaService.gameScoreHistory.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-123', status: 'in_progress' },
      }),
    );
    expect(prismaService.gameScoreHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        gameSlug: 'memory-game',
        characterSlug: 'joao-silva',
        score: 0,
        userId: 'user-123',
        schoolId: 'school-1',
        status: 'in_progress',
        endedAt: null,
      }),
    });
  });

  it('deve finalizar sessão existente com phase end e sessionId', async () => {
    prismaService.gameScoreHistory.findFirst.mockResolvedValueOnce({
      id: 'sess-1',
      userId: 'user-123',
      status: 'in_progress',
    });
    prismaService.gameScoreHistory.update.mockResolvedValueOnce({
      id: 'sess-1',
      score: 88,
    });

    await service.saveScoreHistory({
      ...makeScoreData({ score: 88 }),
      phase: 'end',
      sessionId: 'sess-1',
    });

    expect(prismaService.gameScoreHistory.update).toHaveBeenCalledWith({
      where: { id: 'sess-1' },
      data: expect.objectContaining({
        score: 88,
        status: 'completed',
      }),
    });
    expect(prismaService.gameScoreHistory.create).not.toHaveBeenCalled();
  });

  it('deve criar histórico completo quando sessionId do fim não existir', async () => {
    prismaService.gameScoreHistory.findFirst.mockResolvedValueOnce(null);

    await service.saveScoreHistory({
      ...makeScoreData({ score: 42 }),
      phase: 'end',
      sessionId: 'sess-invalido',
    });

    expect(prismaService.gameScoreHistory.updateMany).toHaveBeenCalled();
    expect(prismaService.gameScoreHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        score: 42,
        status: 'completed',
        gameSlug: 'memory-game',
      }),
    });
  });
});
