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

  describe('getGames', () => {
    it('deve chamar o findAll com a coleção correta', async () => {
      const result = await service.getGames();

      expect(firebaseService.findAll).toHaveBeenCalledWith('config-games');
      expect(result).toEqual([mockGame]);
    });
  });

  describe('getGamesBySlug', () => {
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
  });
});
