import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from 'src/cache';
import { PrismaService } from 'src/prisma';
import { GAME_SLUGS } from 'src/games/games.catalog';
import { StudentDashboardService } from './student-dashboard.service';

describe('StudentDashboardService', () => {
  let service: StudentDashboardService;
  let prismaService: {
    user: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
    };
    gameScore: {
      findMany: jest.Mock;
    };
    gameScoreHistory: {
      findMany: jest.Mock;
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
    };
  };

  const profileWithSchool = {
    childName: 'Ana Silva',
    parentName: null,
    email: 'ana@test.com',
    schoolId: 'school-1',
    avatarCharacterSlug: 'iara',
  };

  const profileWithoutSchool = {
    childName: 'Pedro',
    parentName: null,
    email: 'pedro@test.com',
    schoolId: null,
    avatarCharacterSlug: null,
  };

  const mockCharacter = {
    id: 'char-1',
    slug: 'iara',
    name: 'Iara',
    region: 'Norte',
    description: 'desc',
    imageUrl: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentDashboardService,
        CacheService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
            },
            gameScore: {
              findMany: jest.fn().mockResolvedValue([]),
            },
            gameScoreHistory: {
              findMany: jest.fn().mockResolvedValue([]),
            },
            character: {
              findMany: jest.fn(),
            },
            schoolEnabledGame: {
              findMany: jest.fn(),
            },
            schoolEnabledCharacter: {
              findMany: jest.fn(),
            },
            gameConfig: {
              findMany: jest.fn().mockResolvedValue([]),
            },
          },
        },
      ],
    }).compile();

    service = module.get<StudentDashboardService>(StudentDashboardService);
    prismaService = module.get(PrismaService);
    jest.clearAllMocks();
  });

  it('lança erro quando perfil não existe', async () => {
    prismaService.user.findUnique.mockResolvedValue(null);

    await expect(service.getDashboard('missing-user')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('monta dashboard sem escola usando catálogo padrão', async () => {
    prismaService.user.findUnique.mockResolvedValue(profileWithoutSchool);
    prismaService.character.findMany.mockResolvedValue([mockCharacter]);
    prismaService.gameConfig.findMany.mockResolvedValue([
      {
        gameSlug: 'memory-game',
        characterSlug: 'iara',
        imageCoverUrl: 'https://cdn.test/cover.jpg',
      },
    ]);

    const result = await service.getDashboard('user-1', 'iara');

    expect(result.user.name).toBe('Pedro');
    expect(result.user.schoolStudentsCount).toBe(0);
    expect(result.user.classRank).toBeNull();
    expect(result.culturalGuide?.slug).toBe('iara');
    expect(
      result.availableGames
        .map((game) => game.slug)
        .sort((a, b) => a.localeCompare(b)),
    ).toEqual([...GAME_SLUGS].sort((a, b) => a.localeCompare(b)));
    expect(prismaService.user.findMany).not.toHaveBeenCalled();
    expect(
      result.availableGames.find((game) => game.slug === 'guess-game')
        ?.coverUrl,
    ).toBeNull();
  });

  it('não busca capas quando não há personagens para montar combinações', async () => {
    prismaService.user.findUnique.mockResolvedValue(profileWithoutSchool);
    prismaService.character.findMany.mockResolvedValue([]);

    await service.getDashboard('user-1');

    expect(prismaService.gameConfig.findMany).not.toHaveBeenCalled();
  });

  it('usa avatar do perfil quando characterSlug não é informado', async () => {
    prismaService.user.findUnique.mockResolvedValue(profileWithSchool);
    prismaService.user.findMany.mockResolvedValue([
      {
        firebaseUid: 'user-1',
        childName: 'Ana Silva',
        parentName: null,
        email: 'ana@test.com',
      },
    ]);
    prismaService.schoolEnabledGame.findMany.mockResolvedValue([]);
    prismaService.schoolEnabledCharacter.findMany.mockResolvedValue([]);
    prismaService.character.findMany.mockResolvedValue([mockCharacter]);

    const result = await service.getDashboard('user-1');

    expect(result.culturalGuide?.slug).toBe('iara');
  });

  it('monta dashboard com escola, acessos customizados e capas', async () => {
    prismaService.user.findUnique.mockResolvedValue(profileWithSchool);
    prismaService.user.findMany.mockResolvedValue([
      {
        firebaseUid: 'user-1',
        childName: 'Ana Silva',
        parentName: null,
        email: 'ana@test.com',
      },
      {
        firebaseUid: 'user-2',
        childName: 'João Pedro',
        parentName: null,
        email: 'joao@test.com',
      },
    ]);
    prismaService.schoolEnabledGame.findMany.mockResolvedValue([
      { gameSlug: 'memory-game' },
    ]);
    prismaService.schoolEnabledCharacter.findMany.mockResolvedValue([
      { characterSlug: 'iara' },
    ]);
    prismaService.character.findMany.mockResolvedValue([mockCharacter]);
    prismaService.gameScore.findMany
      .mockResolvedValueOnce([
        { slug: 'memory-game', characterSlug: 'iara', score: 120 },
      ])
      .mockResolvedValueOnce([
        {
          userId: 'user-1',
          slug: 'memory-game',
          characterSlug: 'iara',
          score: 120,
        },
        {
          userId: 'user-2',
          slug: 'memory-game',
          characterSlug: 'iara',
          score: 200,
        },
      ]);
    prismaService.gameScoreHistory.findMany.mockResolvedValue([
      {
        id: 'history-1',
        gameSlug: 'memory-game',
        characterSlug: 'iara',
        score: 120,
        startedAt: new Date('2026-05-18T10:00:00Z'),
        endedAt: new Date('2026-05-18T10:10:00Z'),
        status: 'completed',
      },
    ]);
    prismaService.gameConfig.findMany.mockResolvedValue([
      {
        gameSlug: 'memory-game',
        characterSlug: 'iara',
        imageCoverUrl: 'https://cdn.test/cover.jpg',
      },
    ]);

    const result = await service.getDashboard('user-1', 'iara');

    expect(result.user.totalScore).toBe(120);
    expect(result.user.classRank).toBe(2);
    expect(result.user.schoolStudentsCount).toBe(2);
    expect(result.availableGames).toEqual([
      {
        slug: 'memory-game',
        name: 'Jogo da Memória',
        coverUrl: 'https://cdn.test/cover.jpg',
      },
    ]);
    expect(result.recentActivity[0]).toMatchObject({
      points: 120,
      coverUrl: 'https://cdn.test/cover.jpg',
    });
  });

  it('usa jogos e personagens padrão quando escola não tem vínculos', async () => {
    prismaService.user.findUnique.mockResolvedValue(profileWithSchool);
    prismaService.user.findMany.mockResolvedValue([]);
    prismaService.schoolEnabledGame.findMany.mockResolvedValue([]);
    prismaService.schoolEnabledCharacter.findMany.mockResolvedValue([]);
    prismaService.character.findMany
      .mockResolvedValueOnce([{ slug: 'iara' }])
      .mockResolvedValueOnce([mockCharacter]);

    const result = await service.getDashboard('user-1', 'iara');

    expect(
      result.availableGames
        .map((game) => game.slug)
        .sort((a, b) => a.localeCompare(b)),
    ).toEqual([...GAME_SLUGS].sort((a, b) => a.localeCompare(b)));
    expect(result.characters[0]?.slug).toBe('iara');
  });
});
