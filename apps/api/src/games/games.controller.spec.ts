import { Test, TestingModule } from '@nestjs/testing';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';

describe('GamesController', () => {
  let controller: GamesController;
  let service: GamesService;

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
  };

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

  it('deve retornar uma lista de jogos (getGames)', async () => {
    const result = await controller.getGames();

    expect(result).toHaveLength(1);
    expect(service.getGames).toHaveBeenCalled();
  });

  it('deve retornar um jogo específico (getGamesBySlug)', async () => {
    const slug = 'meu-jogo';
    const result = await controller.getGamesBySlug(slug);

    expect(result.gameSlug).toEqual(slug);
    expect(service.getGamesBySlug).toHaveBeenCalledWith(slug);
  });
});
