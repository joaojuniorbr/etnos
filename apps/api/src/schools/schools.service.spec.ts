import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SchoolsService } from './schools.service';
import { PrismaService } from 'src/prisma';

describe('SchoolsService', () => {
  let service: SchoolsService;
  let prismaService: {
    school: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    user: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
    };
    gameScore: {
      findMany: jest.Mock;
    };
  };

  const mockSchool = {
    id: '1',
    name: 'IFPR',
    city: 'Curitiba',
    state: 'PR',
  };

  const mockPrismaService = {
    school: {
      findMany: jest.fn().mockResolvedValue([mockSchool]),
      findUnique: jest.fn().mockResolvedValue(mockSchool),
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(mockSchool),
      update: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    },
    user: {
      findUnique: jest.fn().mockResolvedValue({
        firebaseUid: 'firebase-user-1',
        school: '1',
        roles: ['school'],
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'user-1',
          firebaseUid: 'firebase-user-1',
          childName: 'Aluno 1',
          parentName: 'Responsavel 1',
          email: 'aluno1@test.com',
          school: '1',
          roles: ['student'],
          updatedAt: new Date('2026-03-01T00:00:00.000Z'),
        },
        {
          firebaseUid: 'firebase-user-1',
          school: '1',
        },
      ]),
    },
    gameScore: {
      findMany: jest.fn().mockResolvedValue([
        {
          userId: 'firebase-user-1',
          score: 80,
        },
      ]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchoolsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SchoolsService>(SchoolsService);
    prismaService = module.get(PrismaService);
    jest.clearAllMocks();
  });

  it('deve listar escolas ordenadas por nome', async () => {
    const result = await service.getAll();

    expect(prismaService.school.findMany).toHaveBeenCalledWith({
      orderBy: { name: 'asc' },
    });
    expect(result).toEqual([mockSchool]);
  });

  it('deve criar escola quando não existe duplicada', async () => {
    mockPrismaService.school.findUnique.mockResolvedValueOnce(null);

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

  it('deve retornar null ao criar escola duplicada', async () => {
    mockPrismaService.school.findUnique.mockResolvedValueOnce(mockSchool);

    const result = await service.create(mockSchool);

    expect(result).toBeNull();
    expect(prismaService.school.create).not.toHaveBeenCalled();
  });

  it('deve atualizar escola sem conflito', async () => {
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

  it('deve retornar null no update quando houver conflito de id', async () => {
    mockPrismaService.school.findFirst.mockResolvedValueOnce({
      id: '2',
      name: 'Escola X',
      city: 'Curitiba',
    });

    const result = await service.update('1', {
      name: 'Escola X',
      city: 'Curitiba',
    });

    expect(result).toBeNull();
    expect(prismaService.school.update).not.toHaveBeenCalled();
  });

  it('deve atualizar escola sem consultar duplicidade quando name nao for enviado', async () => {
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

  it('deve remover escola', async () => {
    const result = await service.delete('1');

    expect(prismaService.school.delete).toHaveBeenCalledWith({
      where: { id: '1' },
    });
    expect(result).toBe(true);
  });

  it('deve buscar escola por id', async () => {
    mockPrismaService.school.findUnique.mockResolvedValueOnce(mockSchool);

    const result = await service.getOne('1');

    expect(prismaService.school.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
    });
    expect(result).toEqual(mockSchool);
  });

  it('deve buscar a escola do perfil autenticado', async () => {
    const result = await service.getMySchool('firebase-user-1');

    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { firebaseUid: 'firebase-user-1' },
      select: {
        firebaseUid: true,
        school: true,
        roles: true,
      },
    });
    expect(prismaService.school.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
    });
    expect(result).toEqual(mockSchool);
  });

  it('deve lançar erro quando perfil autenticado nao existir', async () => {
    mockPrismaService.user.findUnique.mockResolvedValueOnce(null);

    await expect(service.getMySchool('missing-user')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('deve lançar erro quando perfil autenticado nao tiver escola', async () => {
    mockPrismaService.user.findUnique.mockResolvedValueOnce({
      firebaseUid: 'firebase-user-1',
      school: null,
      roles: ['school'],
    });

    await expect(service.getMySchool('firebase-user-1')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('deve lançar erro quando a escola do perfil autenticado nao existir', async () => {
    mockPrismaService.school.findUnique.mockResolvedValueOnce(null);

    await expect(service.getMySchool('firebase-user-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('deve listar usuarios da escola autenticada', async () => {
    const result = await service.getUsersFromMySchool(
      'firebase-user-1',
      'Aluno',
    );

    expect(prismaService.user.findMany).toHaveBeenCalledWith({
      where: {
        school: '1',
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
      orderBy: [
        { childName: 'asc' },
        { parentName: 'asc' },
        { email: 'asc' },
      ],
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
    });
    expect(result).toEqual([
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
  });

  it('deve listar usuarios da escola autenticada sem filtro de busca', async () => {
    await service.getUsersFromMySchool('firebase-user-1');

    expect(prismaService.user.findMany).toHaveBeenCalledWith({
      where: {
        school: '1',
      },
      orderBy: [
        { childName: 'asc' },
        { parentName: 'asc' },
        { email: 'asc' },
      ],
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
    });
  });

  it('deve lançar erro ao listar usuarios quando perfil nao tiver escola', async () => {
    mockPrismaService.user.findUnique.mockResolvedValueOnce({
      firebaseUid: 'firebase-user-1',
      school: null,
      roles: ['school'],
    });

    await expect(
      service.getUsersFromMySchool('firebase-user-1', 'Aluno'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('deve retornar ranking agregado por escola', async () => {
    mockPrismaService.school.findMany.mockResolvedValueOnce([
      { id: '1', name: 'IFPR' },
      { id: '2', name: 'Outra Escola' },
    ]);
    mockPrismaService.user.findMany.mockResolvedValueOnce([
      { firebaseUid: 'firebase-user-1', school: '1' },
      { firebaseUid: 'firebase-user-2', school: '2' },
    ]);
    mockPrismaService.gameScore.findMany.mockResolvedValueOnce([
      { userId: 'firebase-user-1', score: 80 },
      { userId: 'firebase-user-1', score: 20 },
      { userId: 'firebase-user-2', score: 50 },
    ]);

    const result = await service.getSchoolRanking('memory-game');

    expect(prismaService.gameScore.findMany).toHaveBeenCalledWith({
      where: { slug: 'memory-game' },
      select: { userId: true, score: true },
    });
    expect(result).toEqual([
      {
        position: 1,
        schoolId: '1',
        schoolName: 'IFPR',
        gameSlug: 'memory-game',
        totalScore: 100,
        totalPlayers: 1,
        averageScore: 100,
      },
      {
        position: 2,
        schoolId: '2',
        schoolName: 'Outra Escola',
        gameSlug: 'memory-game',
        totalScore: 50,
        totalPlayers: 1,
        averageScore: 50,
      },
    ]);
  });

  it('deve ignorar score sem escola mapeada e ordenar por media e nome no ranking de escolas', async () => {
    mockPrismaService.school.findMany.mockResolvedValueOnce([
      { id: '1', name: 'Beta' },
      { id: '2', name: 'Alfa' },
      { id: '3', name: 'Gama' },
    ]);
    mockPrismaService.user.findMany.mockResolvedValueOnce([
      { firebaseUid: 'user-1', school: '1' },
      { firebaseUid: 'user-2', school: '2' },
      { firebaseUid: 'user-3', school: '4' },
    ]);
    mockPrismaService.gameScore.findMany.mockResolvedValueOnce([
      { userId: 'user-1', score: 50 },
      { userId: 'user-2', score: 50 },
      { userId: 'user-3', score: 20 },
      { userId: 'user-4', score: 100 },
    ]);

    const result = await service.getSchoolRanking();

    expect(prismaService.gameScore.findMany).toHaveBeenCalledWith({
      where: undefined,
      select: { userId: true, score: true },
    });
    expect(result).toEqual([
      {
        position: 1,
        schoolId: '2',
        schoolName: 'Alfa',
        gameSlug: null,
        totalScore: 50,
        totalPlayers: 1,
        averageScore: 50,
      },
      {
        position: 2,
        schoolId: '1',
        schoolName: 'Beta',
        gameSlug: null,
        totalScore: 50,
        totalPlayers: 1,
        averageScore: 50,
      },
      {
        position: 3,
        schoolId: '3',
        schoolName: 'Gama',
        gameSlug: null,
        totalScore: 0,
        totalPlayers: 0,
        averageScore: 0,
      },
    ]);
  });

  it('deve desempatar ranking de escolas pela media quando a pontuacao total for igual', async () => {
    mockPrismaService.school.findMany.mockResolvedValueOnce([
      { id: '1', name: 'Escola A' },
      { id: '2', name: 'Escola B' },
    ]);
    mockPrismaService.user.findMany.mockResolvedValueOnce([
      { firebaseUid: 'user-1', school: '1' },
      { firebaseUid: 'user-2', school: '1' },
      { firebaseUid: 'user-3', school: '2' },
    ]);
    mockPrismaService.gameScore.findMany.mockResolvedValueOnce([
      { userId: 'user-1', score: 20 },
      { userId: 'user-2', score: 20 },
      { userId: 'user-3', score: 40 },
    ]);

    const result = await service.getSchoolRanking();

    expect(result).toEqual([
      {
        position: 1,
        schoolId: '2',
        schoolName: 'Escola B',
        gameSlug: null,
        totalScore: 40,
        totalPlayers: 1,
        averageScore: 40,
      },
      {
        position: 2,
        schoolId: '1',
        schoolName: 'Escola A',
        gameSlug: null,
        totalScore: 40,
        totalPlayers: 2,
        averageScore: 20,
      },
    ]);
  });

  it('deve retornar ranking por usuario da escola autenticada', async () => {
    mockPrismaService.user.findMany.mockResolvedValueOnce([
      {
        id: 'user-1',
        firebaseUid: 'firebase-user-1',
        childName: 'Aluno 1',
        parentName: 'Responsavel 1',
        email: 'aluno1@test.com',
        school: '1',
      },
      {
        id: 'user-2',
        firebaseUid: 'firebase-user-2',
        childName: 'Aluno 2',
        parentName: 'Responsavel 2',
        email: 'aluno2@test.com',
        school: '1',
      },
    ]);
    mockPrismaService.gameScore.findMany.mockResolvedValueOnce([
      { userId: 'firebase-user-1', score: 80 },
      { userId: 'firebase-user-1', score: 20 },
      { userId: 'firebase-user-2', score: 50 },
    ]);

    const result = await service.getUserRankingFromMySchool(
      'firebase-user-1',
      'memory-game',
    );

    expect(prismaService.user.findMany).toHaveBeenCalledWith({
      where: {
        school: '1',
      },
      select: {
        id: true,
        firebaseUid: true,
        email: true,
        parentName: true,
        childName: true,
        school: true,
      },
    });
    expect(result).toEqual([
      {
        position: 1,
        uid: 'firebase-user-1',
        userId: 'user-1',
        email: 'aluno1@test.com',
        parentName: 'Responsavel 1',
        childName: 'Aluno 1',
        school: '1',
        gameSlug: 'memory-game',
        totalScore: 100,
      },
      {
        position: 2,
        uid: 'firebase-user-2',
        userId: 'user-2',
        email: 'aluno2@test.com',
        parentName: 'Responsavel 2',
        childName: 'Aluno 2',
        school: '1',
        gameSlug: 'memory-game',
        totalScore: 50,
      },
    ]);
  });

  it('deve lançar erro no ranking de usuarios quando perfil nao tiver escola', async () => {
    mockPrismaService.user.findUnique.mockResolvedValueOnce({
      firebaseUid: 'firebase-user-1',
      school: null,
      roles: ['school'],
    });

    await expect(
      service.getUserRankingFromMySchool('firebase-user-1', 'memory-game'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('deve ignorar score de usuario nao mapeado e ordenar ranking de usuarios por nome', async () => {
    mockPrismaService.user.findMany.mockResolvedValueOnce([
      {
        id: 'user-2',
        firebaseUid: 'firebase-user-2',
        childName: 'Bruno',
        parentName: 'Responsavel 2',
        email: 'bruno@test.com',
        school: '1',
      },
      {
        id: 'user-1',
        firebaseUid: 'firebase-user-1',
        childName: 'Ana',
        parentName: 'Responsavel 1',
        email: 'ana@test.com',
        school: '1',
      },
    ]);
    mockPrismaService.gameScore.findMany.mockResolvedValueOnce([
      { userId: 'firebase-user-2', score: 40 },
      { userId: 'firebase-user-1', score: 40 },
      { userId: 'firebase-user-3', score: 99 },
    ]);

    const result = await service.getUserRankingFromMySchool('firebase-user-1');

    expect(result).toEqual([
      {
        position: 1,
        uid: 'firebase-user-1',
        userId: 'user-1',
        email: 'ana@test.com',
        parentName: 'Responsavel 1',
        childName: 'Ana',
        school: '1',
        gameSlug: null,
        totalScore: 40,
      },
      {
        position: 2,
        uid: 'firebase-user-2',
        userId: 'user-2',
        email: 'bruno@test.com',
        parentName: 'Responsavel 2',
        childName: 'Bruno',
        school: '1',
        gameSlug: null,
        totalScore: 40,
      },
    ]);
  });

  it('deve ordenar ranking de usuarios usando parentName e email quando childName nao existir', async () => {
    mockPrismaService.user.findMany.mockResolvedValueOnce([
      {
        id: 'user-2',
        firebaseUid: 'firebase-user-2',
        childName: null,
        parentName: 'Bruno Responsavel',
        email: 'bruno@test.com',
        school: '1',
      },
      {
        id: 'user-1',
        firebaseUid: 'firebase-user-1',
        childName: null,
        parentName: null,
        email: 'ana@test.com',
        school: '1',
      },
    ]);
    mockPrismaService.gameScore.findMany.mockResolvedValueOnce([
      { userId: 'firebase-user-2', score: 40 },
      { userId: 'firebase-user-1', score: 40 },
    ]);

    const result = await service.getUserRankingFromMySchool('firebase-user-1');

    expect(result).toEqual([
      {
        position: 1,
        uid: 'firebase-user-1',
        userId: 'user-1',
        email: 'ana@test.com',
        parentName: null,
        childName: null,
        school: '1',
        gameSlug: null,
        totalScore: 40,
      },
      {
        position: 2,
        uid: 'firebase-user-2',
        userId: 'user-2',
        email: 'bruno@test.com',
        parentName: 'Bruno Responsavel',
        childName: null,
        school: '1',
        gameSlug: null,
        totalScore: 40,
      },
    ]);
  });

  it('deve ordenar ranking de usuarios usando string vazia quando nao houver nenhum identificador textual', async () => {
    mockPrismaService.user.findMany.mockResolvedValueOnce([
      {
        id: 'user-2',
        firebaseUid: 'firebase-user-2',
        childName: null,
        parentName: null,
        email: null,
        school: '1',
      },
      {
        id: 'user-1',
        firebaseUid: 'firebase-user-1',
        childName: null,
        parentName: null,
        email: 'ana@test.com',
        school: '1',
      },
    ]);
    mockPrismaService.gameScore.findMany.mockResolvedValueOnce([
      { userId: 'firebase-user-2', score: 40 },
      { userId: 'firebase-user-1', score: 40 },
    ]);

    const result = await service.getUserRankingFromMySchool('firebase-user-1');

    expect(result).toEqual([
      {
        position: 1,
        uid: 'firebase-user-2',
        userId: 'user-2',
        email: null,
        parentName: null,
        childName: null,
        school: '1',
        gameSlug: null,
        totalScore: 40,
      },
      {
        position: 2,
        uid: 'firebase-user-1',
        userId: 'user-1',
        email: 'ana@test.com',
        parentName: null,
        childName: null,
        school: '1',
        gameSlug: null,
        totalScore: 40,
      },
    ]);
  });

  it('deve cobrir retorno quando o ranking interno nao encontra usuario atual', async () => {
    const originalMapGet = Map.prototype.get;
    const mapGetSpy = jest.spyOn(Map.prototype, 'get');
    let shouldDropCurrentRanking = false;

    mapGetSpy.mockImplementation(function (this: Map<unknown, unknown>, key) {
      const currentSize = this.size;

      if (currentSize === 1 && key === 'firebase-user-1') {
        const originalResult = Reflect.apply(originalMapGet, this, [key]);

        if (!shouldDropCurrentRanking) {
          shouldDropCurrentRanking = true;
          return originalResult;
        }

        return undefined;
      }

      return Reflect.apply(originalMapGet, this, [key]);
    });

    mockPrismaService.user.findMany.mockResolvedValueOnce([
      {
        id: 'user-1',
        firebaseUid: 'firebase-user-1',
        childName: 'Ana',
        parentName: 'Responsavel 1',
        email: 'ana@test.com',
        school: '1',
      },
    ]);
    mockPrismaService.gameScore.findMany.mockResolvedValueOnce([
      { userId: 'firebase-user-1', score: 40 },
    ]);

    const result = await service.getUserRankingFromMySchool('firebase-user-1');

    expect(result).toEqual([
      {
        position: 1,
        uid: 'firebase-user-1',
        userId: 'user-1',
        email: 'ana@test.com',
        parentName: 'Responsavel 1',
        childName: 'Ana',
        school: '1',
        gameSlug: null,
        totalScore: 0,
      },
    ]);

    mapGetSpy.mockRestore();
  });

  it('deve retornar ranking por usuario de uma escola especifica para admin', async () => {
    mockPrismaService.school.findUnique.mockResolvedValueOnce({ id: '1' });
    mockPrismaService.user.findMany.mockResolvedValueOnce([
      {
        id: 'user-1',
        firebaseUid: 'firebase-user-1',
        childName: 'Aluno 1',
        parentName: 'Responsavel 1',
        email: 'aluno1@test.com',
        school: '1',
      },
    ]);
    mockPrismaService.gameScore.findMany.mockResolvedValueOnce([
      { userId: 'firebase-user-1', score: 80 },
    ]);

    const result = await service.getUserRankingBySchoolForAdmin(
      '1',
      'memory-game',
    );

    expect(prismaService.school.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
      select: { id: true },
    });
    expect(result).toEqual([
      {
        position: 1,
        uid: 'firebase-user-1',
        userId: 'user-1',
        email: 'aluno1@test.com',
        parentName: 'Responsavel 1',
        childName: 'Aluno 1',
        school: '1',
        gameSlug: 'memory-game',
        totalScore: 80,
      },
    ]);
  });

  it('deve lançar erro no ranking por usuario para admin quando escola nao existir', async () => {
    mockPrismaService.school.findUnique.mockResolvedValueOnce(null);

    await expect(
      service.getUserRankingBySchoolForAdmin('missing-school', 'memory-game'),
    ).rejects.toThrow(NotFoundException);
  });
});
