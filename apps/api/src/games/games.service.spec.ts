import { Test, TestingModule } from '@nestjs/testing';
import { GamesService } from './games.service';
import { FirebaseService } from 'src/firebase';

describe('GamesService', () => {
  let service: GamesService;
  let firebaseService: FirebaseService;

  const mockGame = {
    id: '1',
    gameSlug: 'memory-game',
    characterSlug: 'joao-silva',
    imageCoverUrl: 'url-aqui',
  };

  const mockFirebaseService = {
    findAll: jest.fn().mockResolvedValue([mockGame]),
    findOne: jest.fn().mockResolvedValue(mockGame),
    findById: jest.fn().mockResolvedValue(mockGame),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamesService,
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
        },
      ],
    }).compile();

    service = module.get<GamesService>(GamesService);
    firebaseService = module.get<FirebaseService>(FirebaseService);
    jest.clearAllMocks();
  });

  it('deve listar jogos', async () => {
    const result = await service.getGames();

    expect(firebaseService.findAll).toHaveBeenCalledWith('config-games');
    expect(result).toEqual([mockGame]);
  });

  it('deve buscar jogo por slug', async () => {
    const result = await service.getGamesBySlug('memory-game');

    expect(firebaseService.findOne).toHaveBeenCalledWith('config-games', [
      { field: 'gameSlug', operator: '==', value: 'memory-game' },
    ]);
    expect(result).toEqual(mockGame);
  });

  it('deve salvar configuração de jogo com id composto', async () => {
    await service.saveConfig({
      gameSlug: 'memory-game',
      characterSlug: 'maria',
      imageCoverUrl: 'url',
    });

    expect(firebaseService.create).toHaveBeenCalledWith(
      'config-games',
      {
        gameSlug: 'memory-game',
        characterSlug: 'maria',
        imageCoverUrl: 'url',
      },
      'memory-game_maria',
    );
  });

  it('deve buscar configuração específica', async () => {
    await service.getConfig('memory-game', 'maria');

    expect(firebaseService.findById).toHaveBeenCalledWith(
      'config-games',
      'memory-game_maria',
    );
  });

  it('deve buscar configuração por jogo', async () => {
    await service.getConfigByGame('memory-game');

    expect(firebaseService.findAll).toHaveBeenCalledWith('config-games', {
      filters: [{ field: 'gameSlug', operator: '==', value: 'memory-game' }],
    });
  });

  it('deve remover configuração', async () => {
    const result = await service.removeConfig('memory-game', 'maria');

    expect(firebaseService.delete).toHaveBeenCalledWith(
      'config-games',
      'memory-game_maria',
    );
    expect(result).toBe(true);
  });

  it('deve salvar conteúdo do memory game', async () => {
    const payload = { slug: 'maria', url: 'u' };

    await service.saveMemoryGameContent(payload);

    expect(firebaseService.create).toHaveBeenCalledWith('game-memory-game', payload);
  });

  it('deve buscar conteúdo do memory game', async () => {
    await service.getMemoryGameContent('maria');

    expect(firebaseService.findAll).toHaveBeenCalledWith('game-memory-game', {
      filters: [{ field: 'slug', operator: '==', value: 'maria' }],
    });
  });

  it('deve deletar conteúdo do memory game com sucesso', async () => {
    mockFirebaseService.delete.mockResolvedValueOnce(undefined);

    const result = await service.deleteMemoryGameContent('id-1');

    expect(result).toBe(true);
  });

  it('deve retornar false ao falhar no delete do memory game', async () => {
    mockFirebaseService.delete.mockRejectedValueOnce(new Error('fail'));

    const result = await service.deleteMemoryGameContent('id-1');

    expect(result).toBe(false);
  });

  it('deve mapear imagens do memory game', async () => {
    jest.spyOn(service, 'getMemoryGameContent').mockResolvedValueOnce([
      { id: '1', slug: 'maria', url: 'u1', idCharacter: 'c1' },
      { id: '2', slug: 'maria', url: 'u2', idCharacter: 'c1' },
    ]);

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

    expect(firebaseService.findOne).toHaveBeenCalledWith('score-games', [
      { field: 'slug', operator: '==', value: 'memory-game' },
      { field: 'characterSlug', operator: '==', value: 'joao-silva' },
      { field: 'userId', operator: '==', value: 'user-123' },
    ]);
  });

  it('deve salvar score novo e atualizar score existente', async () => {
    const scoreData = {
      slug: 'memory-game',
      characterSlug: 'joao-silva',
      score: 150,
      userId: 'user-123',
    };

    mockFirebaseService.findOne.mockResolvedValueOnce(null);

    await service.saveScoreGame(scoreData);

    expect(firebaseService.create).toHaveBeenCalledWith('score-games', scoreData);

    mockFirebaseService.findOne.mockResolvedValueOnce({
      id: 'existing-score-id',
      ...scoreData,
    });

    await service.saveScoreGame({ ...scoreData, score: 200 });

    expect(firebaseService.update).toHaveBeenCalledWith(
      'score-games',
      'existing-score-id',
      { score: 200 },
    );
  });

  it('deve listar score por usuário', async () => {
    await service.getScoreByUser('user-1');

    expect(firebaseService.findAll).toHaveBeenCalledWith('score-games', {
      filters: [{ field: 'userId', operator: '==', value: 'user-1' }],
    });
  });
});
