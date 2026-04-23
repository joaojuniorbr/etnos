import { Test, TestingModule } from '@nestjs/testing';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { AuthGuard } from '@nestjs/passport';
import { AdminRoleGuard, RequestUserOwnershipGuard } from 'src/common';

const mockGamesService = {
  getGames: jest.fn().mockResolvedValue([
    {
      id: '1',
      gameSlug: 'memory-game',
      characterSlug: 'char-1',
      imageCoverUrl: 'url1',
    },
  ]),
  getGamesBySlug: jest.fn().mockResolvedValue({
    id: '1',
    gameSlug: 'memory-game',
    characterSlug: 'char-1',
    imageCoverUrl: 'url1',
  }),
  getConfigByGame: jest.fn().mockResolvedValue([]),
  getConfig: jest.fn().mockResolvedValue(null),
  saveConfig: jest.fn().mockResolvedValue({ id: 'cfg-1' }),
  removeConfig: jest.fn().mockResolvedValue(true),
  getMemoryGameContent: jest.fn().mockResolvedValue([]),
  getMemoryGameImages: jest.fn().mockResolvedValue([]),
  getGuessGameContent: jest.fn().mockResolvedValue([]),
  getGuessGamePlayContent: jest.fn().mockResolvedValue(null),
  saveMemoryGameContent: jest.fn().mockResolvedValue({ id: 'mem-1' }),
  saveGuessGameContent: jest.fn().mockResolvedValue({ id: 'guess-1' }),
  deleteMemoryGameContent: jest.fn().mockResolvedValue(true),
  deleteGuessGameContent: jest.fn().mockResolvedValue(true),
  validateGuessGameAttempt: jest.fn().mockResolvedValue({ isCorrect: true }),
  saveScoreGame: jest.fn().mockResolvedValue(undefined),
  saveScoreHistory: jest.fn().mockResolvedValue(undefined),
  getScoreHistory: jest.fn().mockResolvedValue([]),
  getScoreByUser: jest.fn().mockResolvedValue([]),
  getScoreGame: jest.fn().mockResolvedValue({ score: 100 }),
};

describe('GamesController', () => {
  let controller: GamesController;
  let service: GamesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamesController],
      providers: [
        {
          provide: GamesService,
          useValue: mockGamesService,
        },
      ],
    })
      .overrideGuard(AuthGuard('firebase-auth'))
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RequestUserOwnershipGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(AdminRoleGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<GamesController>(GamesController);
    service = module.get<GamesService>(GamesService);
    jest.clearAllMocks();
  });

  it('deve retornar uma lista de jogos', async () => {
    const result = await controller.getGames();

    expect(result).toHaveLength(1);
    expect(service.getGames).toHaveBeenCalled();
  });

  it('deve retornar jogo por slug', async () => {
    const result = await controller.getGamesBySlug('memory-game');

    expect(service.getGamesBySlug).toHaveBeenCalledWith('memory-game');
    expect(result.gameSlug).toBe('memory-game');
  });

  it('deve listar configuração por jogo', async () => {
    await controller.getConfigByGame('memory-game');

    expect(service.getConfigByGame).toHaveBeenCalledWith('memory-game');
  });

  it('deve buscar configuração por jogo/personagem', async () => {
    await controller.getConfig('memory-game', 'char-1');

    expect(service.getConfig).toHaveBeenCalledWith('memory-game', 'char-1');
  });

  it('deve salvar configuração', async () => {
    const payload = {
      gameSlug: 'memory-game',
      characterSlug: 'char-1',
      imageCoverUrl: 'url1',
    } as any;

    await controller.saveConfig(payload);

    expect(service.saveConfig).toHaveBeenCalledWith(payload);
  });

  it('deve remover configuração', async () => {
    const result = await controller.removeConfig('memory-game', 'char-1');

    expect(service.removeConfig).toHaveBeenCalledWith('memory-game', 'char-1');
    expect(result).toBe(true);
  });

  it('deve listar conteúdo de memory game', async () => {
    await controller.getMemoryGameContent('char-1');

    expect(service.getMemoryGameContent).toHaveBeenCalledWith('char-1');
  });

  it('deve listar imagens de memory game', async () => {
    await controller.getMemoryGameImages({ user: { uid: 'user-1' } }, 'char-1');

    expect(service.getMemoryGameImages).toHaveBeenCalledWith('char-1', 'user-1');
  });

  it('deve listar conteúdo de guess game', async () => {
    await controller.getGuessGameContent('char-1');

    expect(service.getGuessGameContent).toHaveBeenCalledWith('char-1');
  });

  it('deve listar conteúdo jogável de guess game', async () => {
    await controller.getGuessGamePlayContent(
      { user: { uid: 'user-1' } },
      'char-1',
    );

    expect(service.getGuessGamePlayContent).toHaveBeenCalledWith(
      'char-1',
      'user-1',
    );
  });

  it('deve salvar conteúdo do memory game', async () => {
    const payload = {
      url: 'u',
      slug: 'char-1',
      idCharacter: 'id-char-1',
    };

    await controller.saveMemoryGameContent(payload);

    expect(service.saveMemoryGameContent).toHaveBeenCalledWith(payload);
  });

  it('deve salvar conteúdo do guess game', async () => {
    const payload = {
      title: 'Chimarrao',
      word: 'Bomba',
      tips: ['Dica 1'],
      imageUrl: null,
      description: 'Descricao',
      characterSlug: 'anita',
    };

    await controller.saveGuessGameContent(payload);

    expect(service.saveGuessGameContent).toHaveBeenCalledWith(payload);
  });

  it('deve deletar conteúdo do memory game', async () => {
    const result = await controller.deleteMemoryGameContent('id-1');

    expect(service.deleteMemoryGameContent).toHaveBeenCalledWith('id-1');
    expect(result).toBe(true);
  });

  it('deve deletar conteúdo do guess game', async () => {
    const result = await controller.deleteGuessGameContent('id-1');

    expect(service.deleteGuessGameContent).toHaveBeenCalledWith('id-1');
    expect(result).toBe(true);
  });

  it('deve validar tentativa do guess game', async () => {
    const payload = {
      contentId: 'guess-1',
      guess: 'B',
      type: 'letter' as const,
    };

    await controller.validateGuessGameAttempt(
      { user: { uid: 'user-1' } },
      payload,
    );

    expect(service.validateGuessGameAttempt).toHaveBeenCalledWith({
      ...payload,
      userId: 'user-1',
    });
  });

  it('deve salvar score do jogo', async () => {
    await controller.saveScoreGame(
      {
        user: { uid: 'user-1' },
      },
      {
        slug: 'memory-game',
        characterSlug: 'char-1',
        score: 100,
      },
    );

    expect(service.saveScoreGame).toHaveBeenCalledWith({
      slug: 'memory-game',
      characterSlug: 'char-1',
      score: 100,
      userId: 'user-1',
    });
  });

  it('deve salvar histórico de score do jogo', async () => {
    await controller.saveScoreHistory(
      {
        user: { uid: 'user-1' },
      },
      {
        slug: 'memory-game',
        characterSlug: 'char-1',
        score: 100,
      },
    );

    expect(service.saveScoreHistory).toHaveBeenCalledWith({
      slug: 'memory-game',
      characterSlug: 'char-1',
      score: 100,
      userId: 'user-1',
    });
  });

  it('deve listar score do usuário', async () => {
    await controller.getScore({ user: { uid: 'user-1' } });

    expect(service.getScoreByUser).toHaveBeenCalledWith('user-1');
  });

  it('deve retornar score por jogo/personagem', async () => {
    const result = await controller.getFromGameScore(
      { user: { uid: 'user-1' } },
      'memory-game',
      'char-1',
    );

    expect(service.getScoreGame).toHaveBeenCalledWith({
      slug: 'memory-game',
      characterSlug: 'char-1',
      userId: 'user-1',
    });
    expect(result).toEqual({ score: 100 });
  });

  it('deve retornar histórico de score do usuário', async () => {
    const history = [
      {
        gameName: 'memory-game',
        score: 100,
        timestamp: new Date().toISOString(),
      },
    ];
    mockGamesService.getScoreHistory.mockResolvedValueOnce(history);

    const result = await controller.getScoreHistory(
      { user: { uid: 'user-1' } },
      { gameSlug: 'memory-game' },
    );

    expect(service.getScoreHistory).toHaveBeenCalledWith(
      'user-1',
      'memory-game',
    );
    expect(result).toEqual(history);
  });
});
