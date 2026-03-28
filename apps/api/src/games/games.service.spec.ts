import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { GamesService } from './games.service';
import { PrismaService } from 'src/prisma';

describe('GamesService', () => {
  let service: GamesService;
  let prismaService: {
    user: {
      findUnique: jest.Mock;
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
      create: jest.Mock;
      update: jest.Mock;
      findUnique: jest.Mock;
      findMany: jest.Mock;
    };
    gameScoreHistory: {
      create: jest.Mock;
    };
  };

  const mockGame = {
    id: '1',
    gameSlug: 'memory-game',
    characterSlug: 'joao-silva',
    imageCoverUrl: 'url-aqui',
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn().mockResolvedValue({ school: 'school-1' }),
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
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
    },
    gameScoreHistory: {
      create: jest.fn(),
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

  it('deve criar conteúdo do guess game quando não houver id', async () => {
    const payload = {
      title: 'Chimarrao',
      word: 'Bomba',
      tips: ['Dica 1'],
      imageUrl: null,
      description: 'Descricao',
      characterSlug: 'anita',
    };

    await service.saveGuessGameContent(payload);

    expect(prismaService.guessGameContent.create).toHaveBeenCalledWith({
      data: payload,
    });
  });

  it('deve atualizar conteúdo do guess game quando houver id', async () => {
    const payload = {
      id: 'guess-1',
      title: 'Chimarrao',
      word: 'Bomba',
      tips: ['Dica 1'],
      imageUrl: undefined,
      description: 'Descricao',
      characterSlug: 'anita',
    };

    await service.saveGuessGameContent(payload);

    expect(prismaService.guessGameContent.update).toHaveBeenCalledWith({
      where: { id: 'guess-1' },
      data: {
        title: 'Chimarrao',
        word: 'Bomba',
        tips: ['Dica 1'],
        imageUrl: null,
        description: 'Descricao',
        characterSlug: 'anita',
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
      {
        id: 'guess-1',
        title: 'Chimarrao',
        word: 'Bomba',
        tips: ['Dica 1'],
        imageUrl: null,
        description: 'Descricao',
        characterSlug: 'anita',
      },
    ]);

    jest.spyOn(Math, 'random').mockReturnValueOnce(0);

    await expect(service.getGuessGamePlayContent('anita')).resolves.toEqual({
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

    await expect(service.getGuessGamePlayContent('anita')).resolves.toBeNull();
  });

  it('deve retornar null quando o item sorteado não existir', async () => {
    jest
      .spyOn(service, 'getGuessGameContent')
      .mockResolvedValueOnce([undefined] as any);

    await expect(service.getGuessGamePlayContent('anita')).resolves.toBeNull();
  });

  it('deve retornar lista vazia quando a tabela do guess game ainda não existir', async () => {
    prismaService.guessGameContent.findMany.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError(
        'Tabela inexistente',
        {
          code: 'P2021',
          clientVersion: '6.19.2',
          meta: {
            table: 'public.guess_game_contents',
          },
        },
      ),
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
      new Prisma.PrismaClientKnownRequestError(
        'Tabela inexistente',
        {
          code: 'P2021',
          clientVersion: '6.19.2',
          meta: {
            table: 'public.memory_game_contents',
          },
        },
      ),
    );

    await expect(service.getGuessGameContent('anita')).rejects.toThrow(
      'Tabela inexistente',
    );
  });

  it('deve relançar erro P2021 quando o Prisma não informar meta.table', async () => {
    prismaService.guessGameContent.findMany.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError(
        'Tabela inexistente',
        {
          code: 'P2021',
          clientVersion: '6.19.2',
        },
      ),
    );

    await expect(service.getGuessGameContent('anita')).rejects.toThrow(
      'Tabela inexistente',
    );
  });

  it('deve validar palavra completa correta', async () => {
    prismaService.guessGameContent.findUnique.mockResolvedValueOnce({
      id: 'guess-1',
      title: 'Chimarrao',
      word: 'Bomba',
      tips: ['Dica 1'],
      imageUrl: null,
      description: 'Descricao',
      characterSlug: 'anita',
    });

    await expect(
      service.validateGuessGameAttempt({
        contentId: 'guess-1',
        guess: 'bomba',
        type: 'word',
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
    prismaService.guessGameContent.findUnique.mockResolvedValueOnce({
      id: 'guess-1',
      title: 'Chimarrao',
      word: 'Bomba',
      tips: ['Dica 1'],
      imageUrl: null,
      description: 'Descricao',
      characterSlug: 'anita',
    });

    await expect(
      service.validateGuessGameAttempt({
        contentId: 'guess-1',
        guess: 'cuia',
        type: 'word',
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
    prismaService.guessGameContent.findUnique.mockResolvedValueOnce({
      id: 'guess-1',
      title: 'Chimarrao',
      word: 'Bomba',
      tips: ['Dica 1'],
      imageUrl: null,
      description: 'Descricao',
      characterSlug: 'anita',
    });

    await expect(
      service.validateGuessGameAttempt({
        contentId: 'guess-1',
        guess: 'b',
        type: 'letter',
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
    prismaService.memoryGameContent.delete.mockRejectedValueOnce(new Error('fail'));

    const result = await service.deleteMemoryGameContent('id-1');

    expect(result).toBe(false);
  });

  it('deve retornar false ao falhar no delete do guess game', async () => {
    prismaService.guessGameContent.delete.mockRejectedValueOnce(new Error('fail'));

    const result = await service.deleteGuessGameContent('id-1');

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

    expect(prismaService.user.findUnique).not.toHaveBeenCalled();
    expect(prismaService.gameScoreHistory.create).not.toHaveBeenCalled();
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

  it('deve salvar histórico de score com escola vinculada', async () => {
    const scoreData = {
      slug: 'memory-game',
      characterSlug: 'joao-silva',
      score: 150,
      userId: 'user-123',
    };

    await service.saveScoreHistory(scoreData);

    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: {
        firebaseUid: 'user-123',
      },
      select: {
        school: true,
      },
    });
    expect(prismaService.gameScoreHistory.create).toHaveBeenCalledWith({
      data: {
        gameSlug: 'memory-game',
        characterSlug: 'joao-silva',
        score: 150,
        userId: 'user-123',
        schoolId: 'school-1',
      },
    });
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

    expect(prismaService.gameScoreHistory.create).not.toHaveBeenCalled();
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

    expect(prismaService.gameScoreHistory.create).not.toHaveBeenCalled();
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

    expect(prismaService.gameScoreHistory.create).not.toHaveBeenCalled();
    expect(prismaService.gameScore.create).not.toHaveBeenCalled();
    expect(prismaService.gameScore.update).not.toHaveBeenCalled();
    expect(result).toEqual(existingScore);
  });

  it('deve salvar histórico sem escola quando o usuário não estiver vinculado', async () => {
    const scoreData = {
      slug: 'memory-game',
      characterSlug: 'joao-silva',
      score: 90,
      userId: 'user-123',
    };

    prismaService.user.findUnique.mockResolvedValueOnce({ school: null });

    await service.saveScoreHistory(scoreData);

    expect(prismaService.gameScoreHistory.create).toHaveBeenCalledWith({
      data: {
        gameSlug: 'memory-game',
        characterSlug: 'joao-silva',
        score: 90,
        userId: 'user-123',
        schoolId: null,
      },
    });
    expect(prismaService.gameScore.create).not.toHaveBeenCalled();
  });

  it('deve listar score por usuário', async () => {
    await service.getScoreByUser('user-1');

    expect(prismaService.gameScore.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
    });
  });
});
