import { Test, TestingModule } from '@nestjs/testing';
import { SchoolsService } from './schools.service';
import { FirebaseService } from 'src/firebase';

describe('SchoolsService', () => {
  let service: SchoolsService;
  let firebaseService: FirebaseService;

  const mockSchool = {
    id: '1',
    name: 'IFPR',
    city: 'Curitiba',
    state: 'PR',
  };

  const mockFirebaseService = {
    findAll: jest.fn().mockResolvedValue([mockSchool]),
    findOne: jest.fn().mockResolvedValue(null),
    findById: jest.fn().mockResolvedValue(mockSchool),
    create: jest.fn().mockResolvedValue(mockSchool),
    update: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchoolsService,
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
        },
      ],
    }).compile();

    service = module.get<SchoolsService>(SchoolsService);
    firebaseService = module.get<FirebaseService>(FirebaseService);
    jest.clearAllMocks();
  });

  it('deve listar escolas ordenadas por nome', async () => {
    const result = await service.getAll();

    expect(firebaseService.findAll).toHaveBeenCalledWith('schools', {
      orderBy: { field: 'name', direction: 'asc' },
    });
    expect(result).toEqual([mockSchool]);
  });

  it('deve criar escola quando não existe duplicada', async () => {
    const result = await service.create(mockSchool);

    expect(firebaseService.findOne).toHaveBeenCalled();
    expect(firebaseService.create).toHaveBeenCalledWith('schools', mockSchool);
    expect(result).toEqual(mockSchool);
  });

  it('deve retornar null ao criar escola duplicada', async () => {
    mockFirebaseService.findOne.mockResolvedValueOnce(mockSchool);

    const result = await service.create(mockSchool);

    expect(result).toBeNull();
    expect(firebaseService.create).not.toHaveBeenCalled();
  });

  it('deve atualizar escola sem conflito', async () => {
    const result = await service.update('1', { name: 'Novo nome' });

    expect(firebaseService.update).toHaveBeenCalledWith('schools', '1', {
      name: 'Novo nome',
    });
    expect(result).toEqual({ id: '1', name: 'Novo nome' });
  });

  it('deve retornar null no update quando houver conflito de id', async () => {
    mockFirebaseService.findOne.mockResolvedValueOnce({
      id: '2',
      name: 'Escola X',
      city: 'Curitiba',
    });

    const result = await service.update('1', {
      name: 'Escola X',
      city: 'Curitiba',
    });

    expect(result).toBeNull();
    expect(firebaseService.update).not.toHaveBeenCalled();
  });

  it('deve remover escola', async () => {
    const result = await service.delete('1');

    expect(firebaseService.delete).toHaveBeenCalledWith('schools', '1');
    expect(result).toBe(true);
  });

  it('deve buscar escola por id', async () => {
    const result = await service.getOne('1');

    expect(firebaseService.findById).toHaveBeenCalledWith('schools', '1');
    expect(result).toEqual(mockSchool);
  });
});
