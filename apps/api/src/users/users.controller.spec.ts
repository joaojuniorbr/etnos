import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import { AdminRoleGuard, SchoolRoleGuard } from 'src/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    findAll: jest.fn().mockResolvedValue([{ id: 'user-1' }]),
    updateUser: jest.fn().mockResolvedValue({ id: 'user-1' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    })
      .overrideGuard(AuthGuard('firebase-auth'))
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(AdminRoleGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(SchoolRoleGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get(UsersController);
    service = module.get(UsersService);
    jest.clearAllMocks();
  });

  it('lista usuarios com filtros', async () => {
    const result = await controller.findAll('school-1', 'ana');

    expect(service.findAll).toHaveBeenCalledWith({
      schoolId: 'school-1',
      search: 'ana',
      hasPushToken: false,
    });
    expect(result).toEqual([{ id: 'user-1' }]);
  });

  it('lista usuarios filtrando por token push', async () => {
    const result = await controller.findAll('school-1', 'ana', 'true');

    expect(service.findAll).toHaveBeenCalledWith({
      schoolId: 'school-1',
      search: 'ana',
      hasPushToken: true,
    });
    expect(result).toEqual([{ id: 'user-1' }]);
  });

  it('atualiza usuario usando uid autenticado', async () => {
    const result = await controller.update(
      { user: { uid: 'admin-1' } },
      'user-1',
      { roles: ['teacher'], isActive: true },
    );

    expect(service.updateUser).toHaveBeenCalledWith('admin-1', 'user-1', {
      roles: ['teacher'],
      isActive: true,
    });
    expect(result).toEqual({ id: 'user-1' });
  });
});
