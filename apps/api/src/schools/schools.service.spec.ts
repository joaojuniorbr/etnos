import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SchoolsService } from './schools.service';
import { PrismaService } from 'src/prisma';

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
    city?: string | null;
    state?: string | null;
  }>,
) => ({
  id: '1',
  name: 'IFPR',
  city: 'Curitiba',
  state: 'PR',
  ...overrides,
});

const createAuthenticatedProfile = (
  overrides?: Partial<{
    firebaseUid: string;
    school: string | null;
    roles: string[];
  }>,
) => ({
  firebaseUid: 'firebase-user-1',
  school: '1',
  roles: ['school'],
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

const createSchoolsServiceMocks = (defaultSchool = createSchool()) => ({
  school: {
    findMany: jest.fn().mockResolvedValue([defaultSchool]),
    findUnique: jest.fn().mockResolvedValue(defaultSchool),
    findFirst: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue(defaultSchool),
    update: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
  },
  user: {
    findUnique: jest.fn().mockResolvedValue(createAuthenticatedProfile()),
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
  },
  gameScore: {
    findMany: jest
      .fn()
      .mockResolvedValue([createUserScore('firebase-user-1', 80)]),
  },
});

describe('SchoolsService', () => {
  let service: SchoolsService;
  let prismaService: ReturnType<typeof createSchoolsServiceMocks>;

  const mockSchool = createSchool();

  const expectAuthenticatedProfileLookup = () => {
    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { firebaseUid: 'firebase-user-1' },
      select: {
        firebaseUid: true,
        school: true,
        roles: true,
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

  const expectUserRankingLookup = (schoolId = '1') => {
    expect(prismaService.user.findMany).toHaveBeenCalledWith({
      where: {
        school: schoolId,
      },
      select: schoolUserSelect,
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
      prismaService.school.findUnique.mockResolvedValueOnce(null);

      const result = await service.create(mockSchool);

      expect(prismaService.school.findUnique).toHaveBeenCalledWith({
        where: { name: mockSchool.name },
      });
      expect(prismaService.school.create).toHaveBeenCalledWith({
        data: {
          name: mockSchool.name,
          city: mockSchool.city,
          state: mockSchool.state,
        },
      });
      expect(result).toEqual(mockSchool);
    });

    it('retorna null ao criar escola duplicada', async () => {
      prismaService.school.findUnique.mockResolvedValueOnce(mockSchool);

      await expect(service.create(mockSchool)).resolves.toBeNull();
      expect(prismaService.school.create).not.toHaveBeenCalled();
    });

    it('atualiza escola quando nao ha conflito', async () => {
      const result = await service.update('1', { name: 'Novo nome' });

      expect(prismaService.school.findFirst).toHaveBeenCalledWith({
        where: {
          name: 'Novo nome',
          city: null,
        },
      });
      expect(prismaService.school.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          name: 'Novo nome',
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
          city: 'Pinhais',
          state: undefined,
        },
      });
      expect(result).toEqual({ id: '1', city: 'Pinhais' });
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

      expectUserRankingLookup();
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

      const result = await service.getUserRankingBySchoolForAdmin(
        '1',
        'memory-game',
      );

      expect(prismaService.school.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: { id: true },
      });
      expectUserRankingLookup('1');
      expect(result).toEqual([
        createUserRanking({
          gameSlug: 'memory-game',
          totalScore: 80,
        }),
      ]);
    });

    it('lança erro para ranking admin quando escola nao existir', async () => {
      prismaService.school.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.getUserRankingBySchoolForAdmin('missing-school', 'memory-game'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
