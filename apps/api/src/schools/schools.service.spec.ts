import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { SchoolsService } from './schools.service';
import { PrismaService } from 'src/prisma';
import * as admin from 'firebase-admin';

jest.mock('firebase-admin', () => ({
  auth: jest.fn(),
}));

const schoolUserSelect = {
  id: true,
  firebaseUid: true,
  email: true,
  parentName: true,
  childName: true,
  school: true,
};

const schoolUsersListSelect = {
  ...schoolUserSelect,
  roles: true,
  updatedAt: true,
};

const schoolUsersOrderBy = [
  { childName: 'asc' },
  { parentName: 'asc' },
  { email: 'asc' },
];

const createSchool = (
  overrides?: Partial<{
    id: string;
    name: string;
    code?: string | null;
    city?: string | null;
    state?: string | null;
  }>,
) => ({
  id: '1',
  name: 'IFPR',
  code: 'IFPR',
  city: 'Curitiba',
  state: 'PR',
  ...overrides,
});

const createAuthenticatedProfile = (
  overrides?: Partial<{
    id: string;
    firebaseUid: string;
    email?: string | null;
    school: string | null;
    roles: string[];
    schoolAccesses: Array<{ schoolId: string }>;
  }>,
) => ({
  id: 'user-1',
  firebaseUid: 'firebase-user-1',
  email: 'school@test.com',
  school: '1',
  roles: ['school'],
  schoolAccesses: [],
  ...overrides,
});

const createUserEntity = (
  overrides?: Partial<{
    id?: string;
    firebaseUid: string;
    childName?: string | null;
    parentName?: string | null;
    email?: string | null;
    school?: string | null;
    roles?: string[];
    updatedAt?: Date;
  }>,
) => ({
  id: 'user-1',
  firebaseUid: 'firebase-user-1',
  childName: 'Aluno 1',
  parentName: 'Responsavel 1',
  email: 'aluno1@test.com',
  school: '1',
  roles: ['student'],
  updatedAt: new Date('2026-03-01T00:00:00.000Z'),
  ...overrides,
});

const createUserScore = (userId: string, score: number) => ({
  userId,
  score,
});

const createUserRanking = (
  overrides?: Partial<{
    position: number;
    uid: string;
    userId?: string | null;
    email?: string | null;
    parentName?: string | null;
    childName?: string | null;
    school?: string | null;
    gameSlug?: string | null;
    totalScore: number;
  }>,
) => ({
  position: 1,
  uid: 'firebase-user-1',
  userId: 'user-1',
  email: 'aluno1@test.com',
  parentName: 'Responsavel 1',
  childName: 'Aluno 1',
  school: '1',
  gameSlug: null,
  totalScore: 40,
  ...overrides,
});

const createSchoolRanking = (
  overrides?: Partial<{
    position: number;
    schoolId: string;
    schoolName: string;
    gameSlug?: string | null;
    totalScore: number;
    totalPlayers: number;
    averageScore: number;
  }>,
) => ({
  position: 1,
  schoolId: '1',
  schoolName: 'IFPR',
  gameSlug: null,
  totalScore: 100,
  totalPlayers: 1,
  averageScore: 100,
  ...overrides,
});

const createSchoolsServiceMocks = (defaultSchool = createSchool()) => {
  const mocks = {
    school: {
      findMany: jest.fn().mockResolvedValue([defaultSchool]),
      findUnique: jest.fn().mockResolvedValue(defaultSchool),
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(defaultSchool),
      update: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    },
    character: {
      findMany: jest.fn().mockResolvedValue([
        { slug: 'anita', name: 'Anita' },
        { slug: 'iara', name: 'Iara' },
      ]),
    },
    user: {
      findUnique: jest.fn().mockResolvedValue(createAuthenticatedProfile()),
      findFirst: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([
        createUserEntity(),
        createUserEntity({
          id: undefined,
          childName: undefined,
          parentName: undefined,
          email: undefined,
          roles: undefined,
          updatedAt: undefined,
        }),
      ]),
      update: jest.fn().mockImplementation(({ where, data }) => ({
        id: where.id ?? 'user-1',
        firebaseUid: 'firebase-user-1',
        email: data.email ?? 'school@test.com',
        parentName: 'Responsavel',
        childName: null,
        childBirthDate: null,
        parentPhone: null,
        school: null,
        photoURL: null,
        avatarCharacterSlug: null,
        roles: data.roles ?? ['school'],
        updatedAt: new Date('2026-03-01T00:00:00.000Z'),
      })),
      create: jest.fn().mockImplementation(({ data }) => ({
        id: 'created-user',
        ...data,
        updatedAt: new Date('2026-03-01T00:00:00.000Z'),
      })),
    },
    schoolAccess: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue({
        id: 'access-1',
        schoolId: '1',
        userId: 'user-1',
      }),
      upsert: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    },
    schoolEnabledGame: {
      findMany: jest.fn().mockResolvedValue([]),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    schoolEnabledCharacter: {
      findMany: jest.fn().mockResolvedValue([]),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    gameScore: {
      findMany: jest
        .fn()
        .mockResolvedValue([createUserScore('firebase-user-1', 80)]),
    },
    $transaction: jest.fn(),
  };

  mocks.$transaction.mockImplementation(async (callback) => callback(mocks));

  return mocks;
};

describe('SchoolsService', () => {
  let service: SchoolsService;
  let prismaService: ReturnType<typeof createSchoolsServiceMocks>;
  let mockedAdminAuth: {
    getUserByEmail: jest.Mock;
    createUser: jest.Mock;
  };

  const mockSchool = createSchool();

  const expectAuthenticatedProfileLookup = () => {
    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { firebaseUid: 'firebase-user-1' },
      select: {
        id: true,
        firebaseUid: true,
        email: true,
        school: true,
        roles: true,
        schoolAccesses: {
          select: {
            schoolId: true,
          },
        },
      },
    });
  };

  const expectSchoolUsersLookup = (search?: string) => {
    expect(prismaService.user.findMany).toHaveBeenCalledWith({
      where: {
        school: '1',
        ...(search
          ? {
              OR: [
                {
                  childName: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
                {
                  parentName: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
                {
                  email: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              ],
            }
          : {}),
      },
      orderBy: schoolUsersOrderBy,
      select: schoolUsersListSelect,
    });
  };

  const expectUserRankingLookup = (
    schoolId = '1',
    gameSlug?: string,
    characterSlug?: string,
  ) => {
    const scoreWhere = {
      ...(gameSlug ? { slug: gameSlug } : {}),
      ...(characterSlug ? { characterSlug } : {}),
    };

    expect(prismaService.user.findMany).toHaveBeenCalledWith({
      where: {
        school: schoolId,
      },
      select: schoolUserSelect,
    });
    expect(prismaService.gameScore.findMany).toHaveBeenCalledWith({
      where: Object.keys(scoreWhere).length ? scoreWhere : undefined,
      select: { userId: true, score: true },
    });
  };

  const mockUserRankingInputs = (
    users: ReturnType<typeof createUserEntity>[],
    scores: ReturnType<typeof createUserScore>[],
  ) => {
    prismaService.user.findMany.mockResolvedValueOnce(users);
    prismaService.gameScore.findMany.mockResolvedValueOnce(scores);
  };

  beforeEach(async () => {
    prismaService = createSchoolsServiceMocks();
    mockedAdminAuth = {
      getUserByEmail: jest.fn(),
      createUser: jest.fn(),
    };
    (admin.auth as jest.Mock).mockReturnValue(mockedAdminAuth);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchoolsService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    service = module.get<SchoolsService>(SchoolsService);
    jest.clearAllMocks();
  });

  describe('CRUD basico', () => {
    it('lista escolas ordenadas por nome', async () => {
      const result = await service.getAll();

      expect(prismaService.school.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual([mockSchool]);
    });

    it('cria escola quando nao existe duplicata', async () => {
      prismaService.school.findFirst.mockResolvedValueOnce(null);

      const result = await service.create(mockSchool);

      expect(prismaService.school.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ name: mockSchool.name }, { code: mockSchool.code }],
        },
      });
      expect(prismaService.school.create).toHaveBeenCalledWith({
        data: {
          name: mockSchool.name,
          code: mockSchool.code,
          city: mockSchool.city,
          state: mockSchool.state,
        },
      });
      expect(result).toEqual(mockSchool);
    });

    it('retorna null ao criar escola duplicada', async () => {
      prismaService.school.findFirst.mockResolvedValueOnce(mockSchool);

      await expect(service.create(mockSchool)).resolves.toBeNull();
      expect(prismaService.school.create).not.toHaveBeenCalled();
    });

    it('lança erro ao criar escola sem codigo identificador', async () => {
      await expect(
        service.create({ ...mockSchool, code: '   ' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('lança conflito quando duas criações simultâneas usam o mesmo codigo', async () => {
      prismaService.school.findFirst.mockResolvedValueOnce(null);
      prismaService.school.create.mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: '6.19.2',
        }),
      );

      await expect(service.create(mockSchool)).rejects.toThrow(
        ConflictException,
      );
    });

    it('propaga erro inesperado ao criar escola', async () => {
      prismaService.school.findFirst.mockResolvedValueOnce(null);
      prismaService.school.create.mockRejectedValueOnce(new Error('database'));

      await expect(service.create(mockSchool)).rejects.toThrow('database');
    });

    it('atualiza escola quando nao ha conflito', async () => {
      const result = await service.update('1', { name: 'Novo nome' });

      expect(prismaService.school.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ name: 'Novo nome' }],
        },
      });
      expect(prismaService.school.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          name: 'Novo nome',
          code: undefined,
          city: undefined,
          state: undefined,
        },
      });
      expect(result).toEqual({ id: '1', name: 'Novo nome' });
    });

    it('retorna null ao atualizar escola com conflito', async () => {
      prismaService.school.findFirst.mockResolvedValueOnce({
        id: '2',
        name: 'Escola X',
        city: 'Curitiba',
      });

      await expect(
        service.update('1', { name: 'Escola X', city: 'Curitiba' }),
      ).resolves.toBeNull();
      expect(prismaService.school.update).not.toHaveBeenCalled();
    });

    it('atualiza escola sem consultar duplicidade quando name nao for enviado', async () => {
      const result = await service.update('1', { city: 'Pinhais' });

      expect(prismaService.school.findFirst).not.toHaveBeenCalled();
      expect(prismaService.school.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          name: undefined,
          code: undefined,
          city: 'Pinhais',
          state: undefined,
        },
      });
      expect(result).toEqual({ id: '1', city: 'Pinhais' });
    });

    it('normaliza codigo ao atualizar escola', async () => {
      const result = await service.update('1', { code: ' escola-01 ' });

      expect(prismaService.school.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ code: 'ESCOLA-01' }],
        },
      });
      expect(prismaService.school.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          name: undefined,
          code: 'ESCOLA-01',
          city: undefined,
          state: undefined,
        },
      });
      expect(result).toEqual({ id: '1', code: 'ESCOLA-01' });
    });

    it('remove escola', async () => {
      await expect(service.delete('1')).resolves.toBe(true);
      expect(prismaService.school.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('busca escola por id', async () => {
      prismaService.school.findUnique.mockResolvedValueOnce(mockSchool);

      await expect(service.getOne('1')).resolves.toEqual(mockSchool);
      expect(prismaService.school.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('configuracao de jogos por escola', () => {
    it('retorna acesso padrão quando o perfil não possui escola vinculada', async () => {
      prismaService.user.findUnique.mockResolvedValueOnce(
        createAuthenticatedProfile({
          school: null,
          roles: ['teacher'],
        }),
      );

      const result = await service.getMyGameAccess('firebase-user-1');

      expect(result.schoolId).toBe('');
      expect(result.enabledGameSlugs).toEqual(['memory-game', 'guess-game']);
      expect(result.enabledCharacterSlugs).toEqual(['anita', 'iara']);
      expect(result.canEdit).toBe(false);
    });

    it('retorna acesso da escola vinculada no meu perfil quando a escola existe', async () => {
      prismaService.user.findUnique.mockResolvedValueOnce(
        createAuthenticatedProfile({
          school: '1',
          roles: ['school'],
        }),
      );

      const result = await service.getMyGameAccess('firebase-user-1');

      expectAuthenticatedProfileLookup();
      expect(prismaService.school.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(prismaService.schoolEnabledGame.findMany).toHaveBeenCalledWith({
        where: { schoolId: '1' },
        select: { gameSlug: true },
        orderBy: { gameSlug: 'asc' },
      });
      expect(prismaService.schoolEnabledCharacter.findMany).toHaveBeenCalledWith({
        where: { schoolId: '1' },
        select: { characterSlug: true },
        orderBy: { characterSlug: 'asc' },
      });
      expect(result.schoolId).toBe('1');
      expect(result.enabledGameSlugs).toEqual(['memory-game', 'guess-game']);
      expect(result.enabledCharacterSlugs).toEqual(['anita', 'iara']);
      expect(result.canEdit).toBe(true);
    });

    it('retorna todos os jogos e personagens quando a escola ainda nao possui configuracao customizada', async () => {
      const result = await service.getGameAccessBySchool('firebase-user-1', '1');

      expectAuthenticatedProfileLookup();
      expect(prismaService.schoolEnabledGame.findMany).toHaveBeenCalledWith({
        where: { schoolId: '1' },
        select: { gameSlug: true },
        orderBy: { gameSlug: 'asc' },
      });
      expect(prismaService.schoolEnabledCharacter.findMany).toHaveBeenCalledWith({
        where: { schoolId: '1' },
        select: { characterSlug: true },
        orderBy: { characterSlug: 'asc' },
      });
      expect(result.enabledGameSlugs).toEqual(['memory-game', 'guess-game']);
      expect(result.enabledCharacterSlugs).toEqual(['anita', 'iara']);
      expect(result.hasCustomGames).toBe(false);
      expect(result.hasCustomCharacters).toBe(false);
      expect(result.canEdit).toBe(true);
    });

    it('retorna configuracao customizada de jogos e personagens da escola', async () => {
      prismaService.schoolEnabledGame.findMany.mockResolvedValueOnce([
        { gameSlug: 'guess-game' },
      ]);
      prismaService.schoolEnabledCharacter.findMany.mockResolvedValueOnce([
        { characterSlug: 'iara' },
      ]);

      const result = await service.getGameAccessBySchool('firebase-user-1', '1');

      expect(result.enabledGameSlugs).toEqual(['guess-game']);
      expect(result.enabledCharacterSlugs).toEqual(['iara']);
      expect(result.hasCustomGames).toBe(true);
      expect(result.hasCustomCharacters).toBe(true);
    });

    it('atualiza a configuracao de jogos e personagens da escola', async () => {
      await service.updateGameAccessBySchool('firebase-user-1', '1', {
        enabledGameSlugs: ['guess-game', 'memory-game'],
        enabledCharacterSlugs: ['iara'],
      });

      expect(prismaService.$transaction).toHaveBeenCalled();
      expect(prismaService.schoolEnabledGame.deleteMany).toHaveBeenCalledWith({
        where: { schoolId: '1' },
      });
      expect(prismaService.schoolEnabledCharacter.deleteMany).toHaveBeenCalledWith({
        where: { schoolId: '1' },
      });
      expect(prismaService.schoolEnabledGame.createMany).toHaveBeenCalledWith({
        data: [
          { schoolId: '1', gameSlug: 'guess-game' },
          { schoolId: '1', gameSlug: 'memory-game' },
        ],
      });
      expect(prismaService.schoolEnabledCharacter.createMany).toHaveBeenCalledWith({
        data: [{ schoolId: '1', characterSlug: 'iara' }],
      });
    });

    it('permite limpar a configuracao customizada da escola', async () => {
      const result = await service.updateGameAccessBySchool('firebase-user-1', '1', {
        enabledGameSlugs: [],
        enabledCharacterSlugs: [],
      });

      expect(prismaService.schoolEnabledGame.createMany).not.toHaveBeenCalled();
      expect(prismaService.schoolEnabledCharacter.createMany).not.toHaveBeenCalled();
      expect(result.hasCustomGames).toBe(false);
      expect(result.hasCustomCharacters).toBe(false);
    });

    it('bloqueia professor alterando a configuracao da escola', async () => {
      prismaService.user.findUnique.mockResolvedValueOnce(
        createAuthenticatedProfile({ roles: ['teacher'] }),
      );

      await expect(
        service.updateGameAccessBySchool('firebase-user-1', '1', {
          enabledGameSlugs: ['memory-game'],
          enabledCharacterSlugs: ['anita'],
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('valida slugs invalidos de jogos e personagens', async () => {
      await expect(
        service.updateGameAccessBySchool('firebase-user-1', '1', {
          enabledGameSlugs: ['invalid-game'],
          enabledCharacterSlugs: ['anita'],
        }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.updateGameAccessBySchool('firebase-user-1', '1', {
          enabledGameSlugs: ['memory-game'],
          enabledCharacterSlugs: ['invalid-character'],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Minha escola e usuarios', () => {
    it('retorna a escola do perfil autenticado', async () => {
      await expect(service.getMySchool('firebase-user-1')).resolves.toEqual(
        mockSchool,
      );

      expectAuthenticatedProfileLookup();
      expect(prismaService.school.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it.each([
      [
        'perfil autenticado inexistente',
        null,
        NotFoundException,
        'getMySchool',
      ],
      [
        'perfil autenticado sem escola',
        createAuthenticatedProfile({ school: null }),
        ForbiddenException,
        'getMySchool',
      ],
      [
        'perfil sem escola ao listar usuarios',
        createAuthenticatedProfile({ school: null }),
        ForbiddenException,
        'getUsersFromMySchool',
      ],
      [
        'perfil sem escola ao montar ranking de usuarios',
        createAuthenticatedProfile({ school: null }),
        ForbiddenException,
        'getUserRankingFromMySchool',
      ],
    ])('lança erro para %s', async (_, profile, expectedError, methodName) => {
      prismaService.user.findUnique.mockResolvedValueOnce(profile);

      let call: Promise<unknown>;

      switch (methodName) {
        case 'getMySchool':
          call = service.getMySchool('firebase-user-1');
          break;
        case 'getUsersFromMySchool':
          call = service.getUsersFromMySchool('firebase-user-1', 'Aluno');
          break;
        default:
          call = service.getUserRankingFromMySchool(
            'firebase-user-1',
            'memory-game',
          );
      }

      await expect(call).rejects.toThrow(expectedError);
    });

    it('lança erro quando a escola do perfil autenticado nao existir', async () => {
      prismaService.school.findUnique.mockResolvedValueOnce(null);

      await expect(service.getMySchool('firebase-user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('lista usuarios da escola autenticada com e sem busca', async () => {
      const resultWithSearch = await service.getUsersFromMySchool(
        'firebase-user-1',
        'Aluno',
      );
      expectSchoolUsersLookup('Aluno');
      expect(resultWithSearch).toEqual([
        {
          id: 'user-1',
          uid: 'firebase-user-1',
          childName: 'Aluno 1',
          parentName: 'Responsavel 1',
          email: 'aluno1@test.com',
          school: '1',
          roles: ['student'],
          updatedAt: new Date('2026-03-01T00:00:00.000Z'),
        },
        {
          id: undefined,
          uid: 'firebase-user-1',
          childName: undefined,
          parentName: undefined,
          email: undefined,
          school: '1',
          roles: undefined,
          updatedAt: undefined,
        },
      ]);

      await service.getUsersFromMySchool('firebase-user-1');
      expectSchoolUsersLookup();
    });

    it('lista escolas gerenciadas pelo perfil school usando school principal e acessos extras', async () => {
      prismaService.user.findUnique.mockResolvedValueOnce(
        createAuthenticatedProfile({
          school: '1',
          schoolAccesses: [{ schoolId: '2' }, { schoolId: '1' }],
        }),
      );
      prismaService.school.findMany.mockResolvedValueOnce([
        mockSchool,
        createSchool({ id: '2', name: 'Outra Escola' }),
      ]);

      const result = await service.getManagedSchools('firebase-user-1');

      expectAuthenticatedProfileLookup();
      expect(prismaService.school.findMany).toHaveBeenCalledWith({
        where: {
          id: {
            in: ['2', '1'],
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
      expect(result).toEqual([
        mockSchool,
        createSchool({ id: '2', name: 'Outra Escola' }),
      ]);
    });

    it('lista escola principal gerenciada por perfil teacher', async () => {
      prismaService.user.findUnique.mockResolvedValueOnce(
        createAuthenticatedProfile({
          roles: ['teacher'],
          school: '1',
          schoolAccesses: [],
        }),
      );
      prismaService.school.findMany.mockResolvedValueOnce([mockSchool]);

      await expect(
        service.getManagedSchools('firebase-user-1'),
      ).resolves.toEqual([mockSchool]);

      expect(prismaService.school.findMany).toHaveBeenCalledWith({
        where: {
          id: {
            in: ['1'],
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
    });

    it('retorna lista vazia quando o perfil nao possui escolas gerenciadas', async () => {
      prismaService.user.findUnique.mockResolvedValueOnce(
        createAuthenticatedProfile({
          school: null,
          schoolAccesses: [],
        }),
      );

      await expect(
        service.getManagedSchools('firebase-user-1'),
      ).resolves.toEqual([]);
      expect(prismaService.school.findMany).not.toHaveBeenCalled();
    });

    it('lista usuarios de uma escola acessivel para perfil school', async () => {
      prismaService.user.findUnique.mockResolvedValueOnce(
        createAuthenticatedProfile({
          school: null,
          schoolAccesses: [{ schoolId: '2' }],
        }),
      );
      prismaService.user.findMany.mockResolvedValueOnce([
        createUserEntity({
          id: 'user-2',
          firebaseUid: 'firebase-user-2',
          school: '2',
          roles: ['student'],
        }),
      ]);

      const result = await service.getUsersBySchool(
        'firebase-user-1',
        '2',
        'Aluno',
      );

      expect(result).toEqual([
        {
          id: 'user-2',
          uid: 'firebase-user-2',
          childName: 'Aluno 1',
          parentName: 'Responsavel 1',
          email: 'aluno1@test.com',
          school: '2',
          roles: ['student'],
          updatedAt: new Date('2026-03-01T00:00:00.000Z'),
        },
      ]);
      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          school: '2',
          OR: [
            {
              childName: {
                contains: 'Aluno',
                mode: 'insensitive',
              },
            },
            {
              parentName: {
                contains: 'Aluno',
                mode: 'insensitive',
              },
            },
            {
              email: {
                contains: 'Aluno',
                mode: 'insensitive',
              },
            },
          ],
        },
        orderBy: schoolUsersOrderBy,
        select: schoolUsersListSelect,
      });
    });

    it('mapeia uid vazio quando usuario listado nao tiver firebaseUid', async () => {
      prismaService.user.findUnique.mockResolvedValueOnce(
        createAuthenticatedProfile({
          school: null,
          schoolAccesses: [{ schoolId: '2' }],
        }),
      );
      prismaService.user.findMany.mockResolvedValueOnce([
        createUserEntity({
          id: 'user-without-firebase',
          firebaseUid: undefined as unknown as string,
          school: '2',
        }),
      ]);

      await expect(
        service.getUsersBySchool('firebase-user-1', '2'),
      ).resolves.toEqual([
        {
          id: 'user-without-firebase',
          uid: '',
          childName: 'Aluno 1',
          parentName: 'Responsavel 1',
          email: 'aluno1@test.com',
          school: '2',
          roles: ['student'],
          updatedAt: new Date('2026-03-01T00:00:00.000Z'),
        },
      ]);
    });

    it('permite acesso por escola para perfil admin sem validar vínculo school', async () => {
      prismaService.user.findUnique.mockResolvedValueOnce(
        createAuthenticatedProfile({
          roles: ['admin'],
          school: null,
          schoolAccesses: [],
        }),
      );
      prismaService.user.findMany.mockResolvedValueOnce([
        createUserEntity({
          id: 'admin-user-view',
          firebaseUid: 'firebase-user-2',
          school: '2',
        }),
      ]);

      await expect(
        service.getUsersBySchool('firebase-user-1', '2'),
      ).resolves.toEqual([
        {
          id: 'admin-user-view',
          uid: 'firebase-user-2',
          childName: 'Aluno 1',
          parentName: 'Responsavel 1',
          email: 'aluno1@test.com',
          school: '2',
          roles: ['student'],
          updatedAt: new Date('2026-03-01T00:00:00.000Z'),
        },
      ]);
    });

    it('bloqueia acesso quando o perfil nao possui role admin ou school', async () => {
      prismaService.user.findUnique.mockResolvedValueOnce(
        createAuthenticatedProfile({
          roles: ['student'],
          school: null,
          schoolAccesses: [],
        }),
      );

      await expect(
        service.getUsersBySchool('firebase-user-1', '2'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('bloqueia acesso quando o perfil school nao possui vinculo com a escola', async () => {
      prismaService.user.findUnique.mockResolvedValueOnce(
        createAuthenticatedProfile({
          roles: ['school'],
          school: null,
          schoolAccesses: [{ schoolId: '3' }],
        }),
      );

      await expect(
        service.getUsersBySchool('firebase-user-1', '2'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Ranking por escola', () => {
    it.each([
      {
        name: 'agrega ranking por escola com filtro de jogo',
        schools: [
          createSchool(),
          createSchool({ id: '2', name: 'Outra Escola' }),
        ],
        users: [
          { firebaseUid: 'firebase-user-1', school: '1' },
          { firebaseUid: 'firebase-user-2', school: '2' },
        ],
        scores: [
          createUserScore('firebase-user-1', 80),
          createUserScore('firebase-user-1', 20),
          createUserScore('firebase-user-2', 50),
        ],
        gameSlug: 'memory-game',
        expected: [
          createSchoolRanking({ gameSlug: 'memory-game' }),
          createSchoolRanking({
            position: 2,
            schoolId: '2',
            schoolName: 'Outra Escola',
            gameSlug: 'memory-game',
            totalScore: 50,
            averageScore: 50,
          }),
        ],
      },
      {
        name: 'ignora score sem escola e desempata por nome',
        schools: [
          createSchool({ id: '1', name: 'Beta' }),
          createSchool({ id: '2', name: 'Alfa' }),
          createSchool({ id: '3', name: 'Gama' }),
        ],
        users: [
          { firebaseUid: 'user-1', school: '1' },
          { firebaseUid: 'user-2', school: '2' },
          { firebaseUid: 'user-3', school: '4' },
        ],
        scores: [
          createUserScore('user-1', 50),
          createUserScore('user-2', 50),
          createUserScore('user-3', 20),
          createUserScore('user-4', 100),
        ],
        expected: [
          createSchoolRanking({
            position: 1,
            schoolId: '2',
            schoolName: 'Alfa',
            totalScore: 50,
            averageScore: 50,
          }),
          createSchoolRanking({
            position: 2,
            schoolId: '1',
            schoolName: 'Beta',
            totalScore: 50,
            averageScore: 50,
          }),
          createSchoolRanking({
            position: 3,
            schoolId: '3',
            schoolName: 'Gama',
            totalScore: 0,
            totalPlayers: 0,
            averageScore: 0,
          }),
        ],
      },
      {
        name: 'desempata pela media quando totalScore for igual',
        schools: [
          createSchool({ id: '1', name: 'Escola A' }),
          createSchool({ id: '2', name: 'Escola B' }),
        ],
        users: [
          { firebaseUid: 'user-1', school: '1' },
          { firebaseUid: 'user-2', school: '1' },
          { firebaseUid: 'user-3', school: '2' },
        ],
        scores: [
          createUserScore('user-1', 20),
          createUserScore('user-2', 20),
          createUserScore('user-3', 40),
        ],
        expected: [
          createSchoolRanking({
            position: 1,
            schoolId: '2',
            schoolName: 'Escola B',
            totalScore: 40,
            averageScore: 40,
          }),
          createSchoolRanking({
            position: 2,
            schoolId: '1',
            schoolName: 'Escola A',
            totalScore: 40,
            totalPlayers: 2,
            averageScore: 20,
          }),
        ],
      },
    ])('$name', async ({ schools, users, scores, gameSlug, expected }) => {
      prismaService.school.findMany.mockResolvedValueOnce(schools);
      prismaService.user.findMany.mockResolvedValueOnce(users);
      prismaService.gameScore.findMany.mockResolvedValueOnce(scores);

      await expect(service.getSchoolRanking(gameSlug)).resolves.toEqual(
        expected,
      );
      expect(prismaService.gameScore.findMany).toHaveBeenCalledWith({
        where: gameSlug ? { slug: gameSlug } : undefined,
        select: { userId: true, score: true },
      });
    });
  });

  describe('Ranking por usuario', () => {
    it.each([
      {
        name: 'ordena por childName',
        users: [
          createUserEntity({
            id: 'user-2',
            firebaseUid: 'firebase-user-2',
            childName: 'Bruno',
            parentName: 'Responsavel 2',
            email: 'bruno@test.com',
          }),
          createUserEntity({
            id: 'user-1',
            firebaseUid: 'firebase-user-1',
            childName: 'Ana',
            parentName: 'Responsavel 1',
            email: 'ana@test.com',
          }),
        ],
        scores: [
          createUserScore('firebase-user-2', 40),
          createUserScore('firebase-user-1', 40),
          createUserScore('firebase-user-3', 99),
        ],
        expected: [
          createUserRanking({
            email: 'ana@test.com',
            parentName: 'Responsavel 1',
            childName: 'Ana',
          }),
          createUserRanking({
            position: 2,
            uid: 'firebase-user-2',
            userId: 'user-2',
            email: 'bruno@test.com',
            parentName: 'Responsavel 2',
            childName: 'Bruno',
          }),
        ],
      },
      {
        name: 'ordena por parentName e email quando childName nao existir',
        users: [
          createUserEntity({
            id: 'user-2',
            firebaseUid: 'firebase-user-2',
            childName: null,
            parentName: 'Bruno Responsavel',
            email: 'bruno@test.com',
          }),
          createUserEntity({
            id: 'user-1',
            firebaseUid: 'firebase-user-1',
            childName: null,
            parentName: null,
            email: 'ana@test.com',
          }),
        ],
        scores: [
          createUserScore('firebase-user-2', 40),
          createUserScore('firebase-user-1', 40),
        ],
        expected: [
          createUserRanking({
            email: 'ana@test.com',
            parentName: null,
            childName: null,
          }),
          createUserRanking({
            position: 2,
            uid: 'firebase-user-2',
            userId: 'user-2',
            email: 'bruno@test.com',
            parentName: 'Bruno Responsavel',
            childName: null,
          }),
        ],
      },
      {
        name: 'ordena por string vazia quando nao houver identificador textual',
        users: [
          createUserEntity({
            id: 'user-2',
            firebaseUid: 'firebase-user-2',
            childName: null,
            parentName: null,
            email: null,
          }),
          createUserEntity({
            id: 'user-1',
            firebaseUid: 'firebase-user-1',
            childName: null,
            parentName: null,
            email: 'ana@test.com',
          }),
        ],
        scores: [
          createUserScore('firebase-user-2', 40),
          createUserScore('firebase-user-1', 40),
        ],
        expected: [
          createUserRanking({
            uid: 'firebase-user-2',
            userId: 'user-2',
            email: null,
            parentName: null,
            childName: null,
          }),
          createUserRanking({
            position: 2,
            email: 'ana@test.com',
            parentName: null,
            childName: null,
          }),
        ],
      },
      {
        name: 'ordena por email quando childName e parentName nao existirem',
        users: [
          createUserEntity({
            id: 'user-2',
            firebaseUid: 'firebase-user-2',
            childName: null,
            parentName: null,
            email: 'bruno@test.com',
          }),
          createUserEntity({
            id: 'user-1',
            firebaseUid: 'firebase-user-1',
            childName: null,
            parentName: null,
            email: 'ana@test.com',
          }),
        ],
        scores: [
          createUserScore('firebase-user-2', 40),
          createUserScore('firebase-user-1', 40),
        ],
        expected: [
          createUserRanking({
            email: 'ana@test.com',
            parentName: null,
            childName: null,
          }),
          createUserRanking({
            position: 2,
            uid: 'firebase-user-2',
            userId: 'user-2',
            email: 'bruno@test.com',
            parentName: null,
            childName: null,
          }),
        ],
      },
    ])('$name', async ({ users, scores, expected }) => {
      mockUserRankingInputs(users, scores);

      await expect(
        service.getUserRankingFromMySchool('firebase-user-1'),
      ).resolves.toEqual(expected);
    });

    it('retorna ranking da escola autenticada com filtro por jogo', async () => {
      mockUserRankingInputs(
        [
          createUserEntity({
            id: 'user-1',
            firebaseUid: 'firebase-user-1',
          }),
          createUserEntity({
            id: 'user-2',
            firebaseUid: 'firebase-user-2',
            childName: 'Aluno 2',
            parentName: 'Responsavel 2',
            email: 'aluno2@test.com',
          }),
        ],
        [
          createUserScore('firebase-user-1', 80),
          createUserScore('firebase-user-1', 20),
          createUserScore('firebase-user-2', 50),
        ],
      );

      const result = await service.getUserRankingFromMySchool(
        'firebase-user-1',
        'memory-game',
      );

      expectUserRankingLookup('1', 'memory-game');
      expect(result).toEqual([
        createUserRanking({
          gameSlug: 'memory-game',
          totalScore: 100,
        }),
        createUserRanking({
          position: 2,
          uid: 'firebase-user-2',
          userId: 'user-2',
          email: 'aluno2@test.com',
          parentName: 'Responsavel 2',
          childName: 'Aluno 2',
          gameSlug: 'memory-game',
          totalScore: 50,
        }),
      ]);
    });

    it('cobre retorno quando o ranking interno nao encontra usuario atual', async () => {
      const originalMapGet = Map.prototype.get;
      const mapGetSpy = jest.spyOn(Map.prototype, 'get');
      let shouldDropCurrentRanking = false;

      mapGetSpy.mockImplementation(function (this: Map<unknown, unknown>, key) {
        if (this.size === 1 && key === 'firebase-user-1') {
          const originalResult = Reflect.apply(originalMapGet, this, [key]);

          if (!shouldDropCurrentRanking) {
            shouldDropCurrentRanking = true;
            return originalResult;
          }

          return undefined;
        }

        return Reflect.apply(originalMapGet, this, [key]);
      });

      mockUserRankingInputs(
        [createUserEntity({ childName: 'Ana', email: 'ana@test.com' })],
        [createUserScore('firebase-user-1', 40)],
      );

      await expect(
        service.getUserRankingFromMySchool('firebase-user-1'),
      ).resolves.toEqual([
        createUserRanking({
          email: 'ana@test.com',
          childName: 'Ana',
          totalScore: 0,
        }),
      ]);

      mapGetSpy.mockRestore();
    });

    it('retorna ranking por usuario de escola especifica para admin', async () => {
      prismaService.user.findUnique.mockResolvedValueOnce(
        createAuthenticatedProfile({
          roles: ['school'],
          school: null,
          schoolAccesses: [{ schoolId: '1' }],
        }),
      );
      prismaService.school.findUnique.mockResolvedValueOnce({ id: '1' });
      mockUserRankingInputs(
        [
          createUserEntity({
            childName: 'Aluno 1',
            parentName: 'Responsavel 1',
            email: 'aluno1@test.com',
          }),
        ],
        [createUserScore('firebase-user-1', 80)],
      );

      const result = await service.getUserRankingBySchoolForViewer(
        'firebase-user-1',
        '1',
        'memory-game',
        'anita',
      );

      expect(prismaService.school.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expectUserRankingLookup('1', 'memory-game', 'anita');
      expect(result).toEqual([
        createUserRanking({
          gameSlug: 'memory-game',
          totalScore: 80,
        }),
      ]);
    });

    it('lança erro para ranking admin quando escola nao existir', async () => {
      prismaService.user.findUnique.mockResolvedValueOnce(
        createAuthenticatedProfile({
          roles: ['school'],
          school: null,
          schoolAccesses: [{ schoolId: 'missing-school' }],
        }),
      );
      prismaService.school.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.getUserRankingBySchoolForViewer(
          'firebase-user-1',
          'missing-school',
          'memory-game',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('Gestao de acessos school', () => {
    it('lista usuarios com acesso school por escola', async () => {
      prismaService.schoolAccess.findMany.mockResolvedValueOnce([
        {
          user: {
            id: 'user-10',
            firebaseUid: 'firebase-user-10',
            email: 'escola@test.com',
            parentName: 'Maria',
            childName: null,
            school: null,
            roles: ['school'],
            updatedAt: new Date('2026-03-01T00:00:00.000Z'),
          },
        },
      ]);

      const result = await service.getAccessUsersBySchool('1');

      expect(prismaService.school.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(prismaService.schoolAccess.findMany).toHaveBeenCalledWith({
        where: { schoolId: '1' },
        select: {
          user: {
            select: {
              id: true,
              firebaseUid: true,
              email: true,
              parentName: true,
              childName: true,
              school: true,
              roles: true,
              updatedAt: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result).toEqual([
        {
          id: 'user-10',
          uid: 'firebase-user-10',
          email: 'escola@test.com',
          parentName: 'Maria',
          childName: null,
          school: null,
          roles: ['school'],
          updatedAt: new Date('2026-03-01T00:00:00.000Z'),
        },
      ]);
    });

    it('cria o vinculo usando usuario existente e adiciona role school como segundo perfil', async () => {
      prismaService.user.findFirst.mockResolvedValueOnce({
        id: 'user-20',
        firebaseUid: 'firebase-user-20',
        email: 'responsavel@test.com',
        parentName: 'Ana',
        childName: null,
        childBirthDate: null,
        parentPhone: null,
        school: null,
        photoURL: null,
        avatarCharacterSlug: null,
        roles: ['student'],
        updatedAt: new Date('2026-03-01T00:00:00.000Z'),
      });
      prismaService.user.update.mockResolvedValueOnce({
        id: 'user-20',
        firebaseUid: 'firebase-user-20',
        email: 'responsavel@test.com',
        parentName: 'Ana',
        childName: null,
        childBirthDate: null,
        parentPhone: null,
        school: null,
        photoURL: null,
        avatarCharacterSlug: null,
        roles: ['student', 'school'],
        updatedAt: new Date('2026-03-01T00:00:00.000Z'),
      });

      const result = await service.addAccessUserToSchool(
        '1',
        ' RESPONSAVEL@TEST.COM ',
      );

      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          email: {
            equals: 'responsavel@test.com',
            mode: 'insensitive',
          },
        },
      });
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-20' },
        data: {
          email: 'responsavel@test.com',
          roles: ['student', 'school'],
        },
      });
      expect(prismaService.schoolAccess.upsert).toHaveBeenCalledWith({
        where: {
          schoolId_userId: {
            schoolId: '1',
            userId: 'user-20',
          },
        },
        update: {},
        create: {
          schoolId: '1',
          userId: 'user-20',
        },
      });
      expect(result).toEqual({
        id: 'user-20',
        uid: 'firebase-user-20',
        email: 'responsavel@test.com',
        parentName: 'Ana',
        childName: null,
        school: null,
        roles: ['student', 'school'],
        updatedAt: new Date('2026-03-01T00:00:00.000Z'),
      });
    });

    it('reutiliza usuario existente sem update quando ele ja possui role school', async () => {
      prismaService.user.findFirst.mockResolvedValueOnce({
        id: 'user-21',
        firebaseUid: 'firebase-user-21',
        email: 'escola@test.com',
        parentName: 'Escola',
        childName: null,
        childBirthDate: null,
        parentPhone: null,
        school: null,
        photoURL: null,
        avatarCharacterSlug: null,
        roles: ['school'],
        updatedAt: new Date('2026-03-01T00:00:00.000Z'),
      });

      await service.addAccessUserToSchool('1', 'escola@test.com');

      expect(prismaService.user.update).not.toHaveBeenCalled();
      expect(prismaService.user.create).not.toHaveBeenCalled();
      expect(mockedAdminAuth.getUserByEmail).not.toHaveBeenCalled();
    });

    it('bloqueia promocao quando o usuario ja possui 2 perfis sem school', async () => {
      prismaService.user.findFirst.mockResolvedValueOnce({
        id: 'user-22',
        firebaseUid: 'firebase-user-22',
        email: 'multi@test.com',
        parentName: 'Multi',
        childName: null,
        childBirthDate: null,
        parentPhone: null,
        school: null,
        photoURL: null,
        avatarCharacterSlug: null,
        roles: ['student', 'admin'],
        updatedAt: new Date('2026-03-01T00:00:00.000Z'),
      });

      await expect(
        service.addAccessUserToSchool('1', 'multi@test.com'),
      ).rejects.toThrow(BadRequestException);
    });

    it('adiciona role school quando usuario existente nao possui roles salvas', async () => {
      prismaService.user.findFirst.mockResolvedValueOnce({
        id: 'user-23',
        firebaseUid: 'firebase-user-23',
        email: 'sem-role@test.com',
        parentName: 'Sem Role',
        childName: null,
        childBirthDate: null,
        parentPhone: null,
        school: null,
        photoURL: null,
        avatarCharacterSlug: null,
        roles: undefined,
        updatedAt: new Date('2026-03-01T00:00:00.000Z'),
      });
      prismaService.user.update.mockResolvedValueOnce({
        id: 'user-23',
        firebaseUid: 'firebase-user-23',
        email: 'sem-role@test.com',
        parentName: 'Sem Role',
        childName: null,
        childBirthDate: null,
        parentPhone: null,
        school: null,
        photoURL: null,
        avatarCharacterSlug: null,
        roles: ['school'],
        updatedAt: new Date('2026-03-01T00:00:00.000Z'),
      });

      await service.addAccessUserToSchool('1', 'sem-role@test.com');

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-23' },
        data: {
          email: 'sem-role@test.com',
          roles: ['school'],
        },
      });
    });

    it('cria perfil local para usuario existente no Firebase mas ainda sem registro na base', async () => {
      mockedAdminAuth.getUserByEmail.mockResolvedValueOnce({
        uid: 'firebase-user-30',
        displayName: 'Gestora',
        photoURL: 'https://image.test/user.png',
      });
      prismaService.user.findUnique.mockResolvedValueOnce(null);
      prismaService.user.create.mockResolvedValueOnce({
        id: 'user-30',
        firebaseUid: 'firebase-user-30',
        email: 'gestora@test.com',
        parentName: 'Gestora',
        childName: null,
        childBirthDate: null,
        parentPhone: null,
        school: null,
        photoURL: 'https://image.test/user.png',
        avatarCharacterSlug: null,
        roles: ['school'],
        updatedAt: new Date('2026-03-01T00:00:00.000Z'),
      });

      const result = await service.addAccessUserToSchool('1', 'gestora@test.com');

      expect(mockedAdminAuth.getUserByEmail).toHaveBeenCalledWith(
        'gestora@test.com',
      );
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          firebaseUid: 'firebase-user-30',
          email: 'gestora@test.com',
          parentName: 'Gestora',
          childName: null,
          childBirthDate: null,
          parentPhone: null,
          school: null,
          photoURL: 'https://image.test/user.png',
          avatarCharacterSlug: null,
          roles: ['school'],
        },
      });
      expect(result.uid).toBe('firebase-user-30');
    });

    it('cria usuario no Firebase quando o email ainda nao existir', async () => {
      mockedAdminAuth.getUserByEmail.mockRejectedValueOnce({
        errorInfo: { code: 'auth/user-not-found' },
      });
      mockedAdminAuth.createUser.mockResolvedValueOnce({
        uid: 'firebase-user-31',
        displayName: null,
        photoURL: null,
      });
      prismaService.user.findUnique.mockResolvedValueOnce(null);
      prismaService.user.create.mockResolvedValueOnce({
        id: 'user-31',
        firebaseUid: 'firebase-user-31',
        email: 'nova-escola@test.com',
        parentName: null,
        childName: null,
        childBirthDate: null,
        parentPhone: null,
        school: null,
        photoURL: null,
        avatarCharacterSlug: null,
        roles: ['school'],
        updatedAt: new Date('2026-03-01T00:00:00.000Z'),
      });

      await service.addAccessUserToSchool('1', 'nova-escola@test.com');

      expect(mockedAdminAuth.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'nova-escola@test.com',
        }),
      );
      expect(prismaService.user.create).toHaveBeenCalled();
    });

    it('atualiza perfil local existente pelo firebaseUid quando faltar role school ou email normalizado', async () => {
      mockedAdminAuth.getUserByEmail.mockResolvedValueOnce({
        uid: 'firebase-user-32',
        displayName: 'Gestor',
        photoURL: null,
      });
      prismaService.user.findUnique.mockResolvedValueOnce({
        id: 'user-32',
        firebaseUid: 'firebase-user-32',
        email: 'outro-email@test.com',
        parentName: 'Gestor',
        childName: null,
        childBirthDate: null,
        parentPhone: null,
        school: null,
        photoURL: null,
        avatarCharacterSlug: null,
        roles: ['student'],
        updatedAt: new Date('2026-03-01T00:00:00.000Z'),
      });
      prismaService.user.update.mockResolvedValueOnce({
        id: 'user-32',
        firebaseUid: 'firebase-user-32',
        email: 'gestor@test.com',
        parentName: 'Gestor',
        childName: null,
        childBirthDate: null,
        parentPhone: null,
        school: null,
        photoURL: null,
        avatarCharacterSlug: null,
        roles: ['student', 'school'],
        updatedAt: new Date('2026-03-01T00:00:00.000Z'),
      });

      await service.addAccessUserToSchool('1', 'gestor@test.com');

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-32' },
        data: {
          email: 'gestor@test.com',
          roles: ['student', 'school'],
        },
      });
    });

    it('atualiza perfil local existente pelo firebaseUid quando roles existem mas email diverge', async () => {
      mockedAdminAuth.getUserByEmail.mockResolvedValueOnce({
        uid: 'firebase-user-34',
        displayName: 'Gestor',
        photoURL: null,
      });
      prismaService.user.findUnique.mockResolvedValueOnce({
        id: 'user-34',
        firebaseUid: 'firebase-user-34',
        email: 'antigo@test.com',
        parentName: 'Gestor',
        childName: null,
        childBirthDate: null,
        parentPhone: null,
        school: null,
        photoURL: null,
        avatarCharacterSlug: null,
        roles: ['school'],
        updatedAt: new Date('2026-03-01T00:00:00.000Z'),
      });
      prismaService.user.update.mockResolvedValueOnce({
        id: 'user-34',
        firebaseUid: 'firebase-user-34',
        email: 'novo@test.com',
        parentName: 'Gestor',
        childName: null,
        childBirthDate: null,
        parentPhone: null,
        school: null,
        photoURL: null,
        avatarCharacterSlug: null,
        roles: ['school'],
        updatedAt: new Date('2026-03-01T00:00:00.000Z'),
      });

      await service.addAccessUserToSchool('1', 'novo@test.com');

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-34' },
        data: {
          email: 'novo@test.com',
          roles: ['school'],
        },
      });
    });

    it('adiciona role school para perfil local por firebaseUid quando roles nao existirem', async () => {
      mockedAdminAuth.getUserByEmail.mockResolvedValueOnce({
        uid: 'firebase-user-35',
        displayName: 'Gestor',
        photoURL: null,
      });
      prismaService.user.findUnique.mockResolvedValueOnce({
        id: 'user-35',
        firebaseUid: 'firebase-user-35',
        email: 'firebase-sem-role@test.com',
        parentName: 'Gestor',
        childName: null,
        childBirthDate: null,
        parentPhone: null,
        school: null,
        photoURL: null,
        avatarCharacterSlug: null,
        roles: undefined,
        updatedAt: new Date('2026-03-01T00:00:00.000Z'),
      });
      prismaService.user.update.mockResolvedValueOnce({
        id: 'user-35',
        firebaseUid: 'firebase-user-35',
        email: 'firebase-sem-role@test.com',
        parentName: 'Gestor',
        childName: null,
        childBirthDate: null,
        parentPhone: null,
        school: null,
        photoURL: null,
        avatarCharacterSlug: null,
        roles: ['school'],
        updatedAt: new Date('2026-03-01T00:00:00.000Z'),
      });

      await service.addAccessUserToSchool('1', 'firebase-sem-role@test.com');

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-35' },
        data: {
          email: 'firebase-sem-role@test.com',
          roles: ['school'],
        },
      });
    });

    it('reutiliza perfil local existente pelo firebaseUid sem update quando ja estiver normalizado', async () => {
      mockedAdminAuth.getUserByEmail.mockResolvedValueOnce({
        uid: 'firebase-user-33',
        displayName: 'Gestor',
        photoURL: null,
      });
      prismaService.user.findUnique.mockResolvedValueOnce({
        id: 'user-33',
        firebaseUid: 'firebase-user-33',
        email: 'gestor@test.com',
        parentName: 'Gestor',
        childName: null,
        childBirthDate: null,
        parentPhone: null,
        school: null,
        photoURL: null,
        avatarCharacterSlug: null,
        roles: ['school'],
        updatedAt: new Date('2026-03-01T00:00:00.000Z'),
      });

      const result = await service.addAccessUserToSchool('1', 'gestor@test.com');

      expect(prismaService.user.update).not.toHaveBeenCalled();
      expect(result).toEqual({
        id: 'user-33',
        uid: 'firebase-user-33',
        email: 'gestor@test.com',
        parentName: 'Gestor',
        childName: null,
        school: null,
        roles: ['school'],
        updatedAt: new Date('2026-03-01T00:00:00.000Z'),
      });
    });

    it('propaga erro inesperado do Firebase', async () => {
      mockedAdminAuth.getUserByEmail.mockRejectedValueOnce(new Error('firebase'));

      await expect(
        service.addAccessUserToSchool('1', 'erro@test.com'),
      ).rejects.toThrow('firebase');
    });

    it('valida email vazio ao criar acesso', async () => {
      await expect(service.addAccessUserToSchool('1', '   ')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('remove vinculo de acesso existente', async () => {
      await expect(
        service.removeAccessUserFromSchool('1', 'user-1'),
      ).resolves.toBe(true);

      expect(prismaService.schoolAccess.findUnique).toHaveBeenCalledWith({
        where: {
          schoolId_userId: {
            schoolId: '1',
            userId: 'user-1',
          },
        },
      });
      expect(prismaService.schoolAccess.delete).toHaveBeenCalledWith({
        where: {
          schoolId_userId: {
            schoolId: '1',
            userId: 'user-1',
          },
        },
      });
    });

    it('lança erro ao remover vinculo inexistente', async () => {
      prismaService.schoolAccess.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.removeAccessUserFromSchool('1', 'missing-user'),
      ).rejects.toThrow(NotFoundException);
    });

    it('lança erro quando a escola do acesso nao existir', async () => {
      prismaService.school.findUnique.mockResolvedValueOnce(null);

      await expect(service.getAccessUsersBySchool('missing-school')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
