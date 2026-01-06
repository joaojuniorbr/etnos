import { Test, TestingModule } from '@nestjs/testing';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';

const mockGamesService = {
  getGames: jest.fn().mockResolvedValue([
    {
      id: '1',
      gameSlug: 'jogo-1',
      characterSlug: 'char-1',
      imageCoverUrl: 'url1',
    },
  ]),
  getGamesBySlug: jest.fn().mockImplementation((slug: string) =>
    Promise.resolve({
      id: '1',
      gameSlug: slug,
      characterSlug: 'char-1',
      imageCoverUrl: 'url1',
    }),
  ),

  saveScoreGame: jest.fn().mockResolvedValue(undefined),

  getScoreGame: jest.fn().mockResolvedValue({
    score: 100,
  }),
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
    }).compile();

    controller = module.get<GamesController>(GamesController);
    service = module.get<GamesService>(GamesService);
  });

  it('deve retornar uma lista de jogos', async () => {
    const result = await controller.getGames();

    expect(result).toHaveLength(1);
    expect(service.getGames).toHaveBeenCalled();
  });

  it('deve retornar um jogo específico', async () => {
    const slug = 'meu-jogo';
    const result = await controller.getGamesBySlug(slug);

    expect(result.gameSlug).toEqual(slug);
    expect(service.getGamesBySlug).toHaveBeenCalledWith(slug);
  });

  it('deve salvar o score do jogo', async () => {
    const result = await controller.saveScoreGame(
      {
        user: {
          uid: 'user-1',
        },
      },
      {
        slug: 'jogo-1',
        characterSlug: 'char-1',
        score: 100,
      },
    );

    expect(service.saveScoreGame).toHaveBeenCalledWith({
      slug: 'jogo-1',
      characterSlug: 'char-1',
      score: 100,
      userId: 'user-1',
    });

    expect(result).toBeUndefined();
  });

  it('deve buscar o score do jogo de acordo com o personagem', async () => {
    const slug = 'jogo-1';
    const characterSlug = 'char-1';
    const userId = 'user-1';

    const result = await controller.getFromGameScore(
      {
        user: {
          uid: userId,
        },
      },
      slug,
      characterSlug,
    );

    expect(result).toEqual({
      score: 100,
    });
  });
});
