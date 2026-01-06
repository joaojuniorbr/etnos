import { Test, TestingModule } from '@nestjs/testing';
import { GamesService } from './games.service';
import { FirebaseService } from 'src/firebase';

describe('GamesService', () => {
  let service: GamesService;
  let firebaseService: FirebaseService;

  const mockGame = {
    id: '1',
    gameSlug: 'jogo-da-memoria',
    characterSlug: 'joao-silva',
    imageCoverUrl: 'url-aqui',
  };

  const mockFirebaseService = {
    findAll: jest.fn().mockResolvedValue([mockGame]),
    findOne: jest.fn().mockResolvedValue(mockGame),
    create: jest.fn(),
    update: jest.fn(),
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
  });

  it('deve chamar o findAll com a coleção correta', async () => {
    const result = await service.getGames();

    expect(firebaseService.findAll).toHaveBeenCalledWith('config-games');
    expect(result).toEqual([mockGame]);
  });

  it('deve chamar o findOne com os filtros de slug corretos', async () => {
    const slug = 'jogo-da-memoria';
    const result = await service.getGamesBySlug(slug);

    expect(firebaseService.findOne).toHaveBeenCalledWith('config-games', [
      {
        field: 'gameSlug',
        operator: '==',
        value: slug,
      },
    ]);
    expect(result).toEqual(mockGame);
  });

  it('deve buscar o score do jogo de acordo com o usuário e personagem', async () => {
    const slug = 'jogo-da-memoria';
    const characterSlug = 'joao-silva';
    const userId = 'user-123';

    mockFirebaseService.findOne.mockResolvedValueOnce({ score: 100 });

    const result = await service.getScoreGame({ slug, characterSlug, userId });

    expect(firebaseService.findOne).toHaveBeenCalledWith('score-games', [
      {
        field: 'slug',
        operator: '==',
        value: slug,
      },
      {
        field: 'characterSlug',
        operator: '==',
        value: characterSlug,
      },
      {
        field: 'userId',
        operator: '==',
        value: userId,
      },
    ]);

    expect(result).toEqual({ score: 100 });
  });

  it('deve salvar um score novo e depois atualizar o que já existe', async () => {
    const scoreData = {
      slug: 'jogo-da-memoria',
      characterSlug: 'joao-silva',
      score: 150,
      userId: 'user-123',
    };

    mockFirebaseService.findOne.mockResolvedValueOnce(null);
    mockFirebaseService.create = jest
      .fn()
      .mockResolvedValue({ id: 'new-score-id', ...scoreData });

    const newScoreResult = await service.saveScoreGame(scoreData);

    expect(firebaseService.findOne).toHaveBeenCalledWith('score-games', [
      {
        field: 'slug',
        operator: '==',
        value: scoreData.slug,
      },
      {
        field: 'characterSlug',
        operator: '==',
        value: scoreData.characterSlug,
      },
      {
        field: 'userId',
        operator: '==',
        value: scoreData.userId,
      },
    ]);

    expect(firebaseService.create).toHaveBeenCalledWith(
      'score-games',
      scoreData,
    );
    expect(newScoreResult).toEqual({ id: 'new-score-id', ...scoreData });

    const existingScore = { id: 'existing-score-id', ...scoreData, score: 100 };
    mockFirebaseService.findOne.mockResolvedValueOnce(existingScore);
    mockFirebaseService.update = jest
      .fn()
      .mockResolvedValue({ ...existingScore, score: 200 });

    const updatedScoreResult = await service.saveScoreGame({
      ...scoreData,
      score: 200,
    });

    expect(firebaseService.findOne).toHaveBeenCalledWith('score-games', [
      {
        field: 'slug',
        operator: '==',
        value: scoreData.slug,
      },
      {
        field: 'characterSlug',
        operator: '==',
        value: scoreData.characterSlug,
      },
      {
        field: 'userId',
        operator: '==',
        value: scoreData.userId,
      },
    ]);

    expect(firebaseService.update).toHaveBeenCalledWith(
      'score-games',
      'existing-score-id',
      { score: 200 },
    );
    expect(updatedScoreResult).toEqual({ ...existingScore, score: 200 });
  });
});
