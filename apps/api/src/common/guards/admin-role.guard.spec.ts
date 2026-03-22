import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AdminRoleGuard } from './admin-role.guard';

const createContext = (request: any): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  }) as ExecutionContext;

describe('AdminRoleGuard', () => {
  let guard: AdminRoleGuard;
  let prismaService: {
    user: {
      findUnique: jest.Mock;
    };
  };

  beforeEach(() => {
    prismaService = {
      user: {
        findUnique: jest.fn(),
      },
    };

    guard = new AdminRoleGuard(prismaService as any);
  });

  it('permite acesso para usuario admin', async () => {
    prismaService.user.findUnique.mockResolvedValueOnce({
      roles: ['admin'],
      school: 'Escola Central',
    });

    await expect(
      guard.canActivate(createContext({ user: { uid: 'admin-1' } })),
    ).resolves.toBe(true);
  });

  it('bloqueia acesso para usuario sem role admin', async () => {
    prismaService.user.findUnique.mockResolvedValueOnce({
      roles: ['student'],
      school: 'Escola Central',
    });

    await expect(
      guard.canActivate(createContext({ user: { uid: 'student-1' } })),
    ).rejects.toThrow(ForbiddenException);
  });

  it('bloqueia quando nao existe usuario autenticado', async () => {
    await expect(guard.canActivate(createContext({}))).rejects.toThrow(
      ForbiddenException,
    );
  });
});
