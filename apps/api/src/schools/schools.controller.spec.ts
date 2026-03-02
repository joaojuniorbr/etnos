import { Test, TestingModule } from '@nestjs/testing';
import { SchoolsController } from './schools.controller';
import { SchoolsService } from './schools.service';

describe('SchoolsController', () => {
  let controller: SchoolsController;
  let service: SchoolsService;

  const mockSchoolsService = {
    getAll: jest.fn().mockResolvedValue([{ id: '1', name: 'IFPR' }]),
    getOne: jest.fn().mockResolvedValue({ id: '1', name: 'IFPR' }),
    create: jest.fn().mockResolvedValue({ id: '1', name: 'IFPR' }),
    update: jest.fn().mockResolvedValue({ id: '1', name: 'IFPR Atualizado' }),
    delete: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchoolsController],
      providers: [
        {
          provide: SchoolsService,
          useValue: mockSchoolsService,
        },
      ],
    }).compile();

    controller = module.get<SchoolsController>(SchoolsController);
    service = module.get<SchoolsService>(SchoolsService);
    jest.clearAllMocks();
  });

  it('deve listar escolas', async () => {
    const result = await controller.getAll();

    expect(service.getAll).toHaveBeenCalled();
    expect(result).toEqual([{ id: '1', name: 'IFPR' }]);
  });

  it('deve buscar escola por id', async () => {
    const result = await controller.getOne('1');

    expect(service.getOne).toHaveBeenCalledWith('1');
    expect(result).toEqual({ id: '1', name: 'IFPR' });
  });

  it('deve criar escola', async () => {
    const payload = { id: '1', name: 'IFPR' };
    const result = await controller.create(payload as any);

    expect(service.create).toHaveBeenCalledWith(payload);
    expect(result).toEqual(payload);
  });

  it('deve atualizar escola', async () => {
    const payload = { name: 'IFPR Atualizado' };
    const result = await controller.update('1', payload);

    expect(service.update).toHaveBeenCalledWith('1', payload);
    expect(result).toEqual({ id: '1', name: 'IFPR Atualizado' });
  });

  it('deve excluir escola', async () => {
    const result = await controller.delete('1');

    expect(service.delete).toHaveBeenCalledWith('1');
    expect(result).toBe(true);
  });
});
