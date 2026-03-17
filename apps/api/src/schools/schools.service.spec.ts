import { Test, TestingModule } from '@nestjs/testing';
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
});
