import { Test, TestingModule } from '@nestjs/testing';
import { SchoolsController } from './schools.controller';
import { SchoolsService } from './schools.service';
import { AuthGuard } from '@nestjs/passport';
import { AdminRoleGuard } from 'src/common/guards/admin-role.guard';
import { SchoolRoleGuard } from 'src/common/guards/school-role.guard';

describe('SchoolsController', () => {
  let controller: SchoolsController;
  let service: SchoolsService;

  const mockSchoolsService = {
    getAll: jest.fn().mockResolvedValue([{ id: '1', name: 'IFPR' }]),
    getOne: jest.fn().mockResolvedValue({ id: '1', name: 'IFPR' }),
    create: jest.fn().mockResolvedValue({ id: '1', name: 'IFPR' }),
    update: jest.fn().mockResolvedValue({ id: '1', name: 'IFPR Atualizado' }),
    delete: jest.fn().mockResolvedValue(true),
    getMySchool: jest.fn().mockResolvedValue({ id: '1', name: 'IFPR' }),
    getUsersFromMySchool: jest
      .fn()
      .mockResolvedValue([{ uid: 'user-1', childName: 'Aluno 1' }]),
    getSchoolRanking: jest
      .fn()
      .mockResolvedValue([
        { position: 1, schoolId: '1', schoolName: 'IFPR', totalScore: 100 },
      ]),
    getUserRankingFromMySchool: jest
      .fn()
      .mockResolvedValue([
        { position: 1, uid: 'user-1', childName: 'Aluno 1', totalScore: 120 },
      ]),
    getUserRankingBySchoolForViewer: jest
      .fn()
      .mockResolvedValue([
        { position: 1, uid: 'user-1', childName: 'Aluno 1', totalScore: 120 },
      ]),
    getManagedSchools: jest.fn().mockResolvedValue([{ id: '1', name: 'IFPR' }]),
    getUsersBySchool: jest
      .fn()
      .mockResolvedValue([
        { position: 1, uid: 'user-1', childName: 'Aluno 1', totalScore: 120 },
      ]),
    getAccessUsersBySchool: jest
      .fn()
      .mockResolvedValue([{ uid: 'user-2', email: 'escola@teste.com' }]),
    addAccessUserToSchool: jest
      .fn()
      .mockResolvedValue({ uid: 'user-2', email: 'escola@teste.com' }),
    removeAccessUserFromSchool: jest.fn().mockResolvedValue(true),
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
    })
      .overrideGuard(AuthGuard('firebase-auth'))
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(AdminRoleGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(SchoolRoleGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

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

  it('deve buscar a escola do perfil autenticado', async () => {
    const result = await controller.getMySchool({
      user: { uid: 'firebase-user-1' },
    });

    expect(service.getMySchool).toHaveBeenCalledWith('firebase-user-1');
    expect(result).toEqual({ id: '1', name: 'IFPR' });
  });

  it('deve listar usuarios da escola autenticada com busca', async () => {
    const result = await controller.getUsersFromMySchool(
      { user: { uid: 'firebase-user-1' } },
      'Aluno',
    );

    expect(service.getUsersFromMySchool).toHaveBeenCalledWith(
      'firebase-user-1',
      'Aluno',
    );
    expect(result).toEqual([{ uid: 'user-1', childName: 'Aluno 1' }]);
  });

  it('deve retornar ranking de escolas filtrando por jogo', async () => {
    const result = await controller.getSchoolRanking('memory-game');

    expect(service.getSchoolRanking).toHaveBeenCalledWith('memory-game');
    expect(result).toEqual([
      { position: 1, schoolId: '1', schoolName: 'IFPR', totalScore: 100 },
    ]);
  });

  it('deve retornar ranking de usuarios da escola autenticada', async () => {
    const result = await controller.getUserRankingFromMySchool(
      { user: { uid: 'firebase-user-1' } },
      'memory-game',
    );

    expect(service.getUserRankingFromMySchool).toHaveBeenCalledWith(
      'firebase-user-1',
      'memory-game',
    );
    expect(result).toEqual([
      { position: 1, uid: 'user-1', childName: 'Aluno 1', totalScore: 120 },
    ]);
  });

  it('deve listar escolas gerenciadas pelo perfil autenticado', async () => {
    const result = await controller.getManagedSchools({
      user: { uid: 'firebase-user-1' },
    });

    expect(service.getManagedSchools).toHaveBeenCalledWith('firebase-user-1');
    expect(result).toEqual([{ id: '1', name: 'IFPR' }]);
  });

  it('deve listar usuarios de uma escola acessivel ao perfil', async () => {
    const result = await controller.getUsersBySchool(
      { user: { uid: 'firebase-user-1' } },
      'school-1',
      'Aluno',
    );

    expect(service.getUsersBySchool).toHaveBeenCalledWith(
      'firebase-user-1',
      'school-1',
      'Aluno',
    );
    expect(result).toEqual([
      { position: 1, uid: 'user-1', childName: 'Aluno 1', totalScore: 120 },
    ]);
  });

  it('deve retornar ranking de usuarios por escola acessivel ao perfil', async () => {
    const result = await controller.getUserRankingBySchoolForAdmin(
      { user: { uid: 'firebase-user-1' } },
      'school-1',
      'memory-game',
    );

    expect(service.getUserRankingBySchoolForViewer).toHaveBeenCalledWith(
      'firebase-user-1',
      'school-1',
      'memory-game',
    );
    expect(result).toEqual([
      { position: 1, uid: 'user-1', childName: 'Aluno 1', totalScore: 120 },
    ]);
  });

  it('deve listar os usuarios school vinculados a uma escola', async () => {
    const result = await controller.getAccessUsersBySchool('school-1');

    expect(service.getAccessUsersBySchool).toHaveBeenCalledWith('school-1');
    expect(result).toEqual([{ uid: 'user-2', email: 'escola@teste.com' }]);
  });

  it('deve vincular usuario school por email', async () => {
    const result = await controller.addAccessUserToSchool('school-1', {
      email: 'escola@teste.com',
    });

    expect(service.addAccessUserToSchool).toHaveBeenCalledWith(
      'school-1',
      'escola@teste.com',
    );
    expect(result).toEqual({ uid: 'user-2', email: 'escola@teste.com' });
  });

  it('deve remover usuario school da escola', async () => {
    const result = await controller.removeAccessUserFromSchool(
      'school-1',
      'user-2',
    );

    expect(service.removeAccessUserFromSchool).toHaveBeenCalledWith(
      'school-1',
      'user-2',
    );
    expect(result).toBe(true);
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
