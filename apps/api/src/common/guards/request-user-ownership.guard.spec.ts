import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RequestUserOwnershipGuard } from './request-user-ownership.guard';

const createContext = (request: any): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  }) as ExecutionContext;

describe('RequestUserOwnershipGuard', () => {
  let guard: RequestUserOwnershipGuard;

  beforeEach(() => {
    guard = new RequestUserOwnershipGuard();
  });

  it('permite quando nao existe userId no request', () => {
    const result = guard.canActivate(
      createContext({
        user: { uid: 'user-1' },
        params: {},
        query: {},
        body: {},
      }),
    );

    expect(result).toBe(true);
  });

  it('permite quando o userId informado bate com o usuario autenticado', () => {
    const result = guard.canActivate(
      createContext({
        user: { uid: 'user-1' },
        params: { userId: 'user-1' },
        query: {},
        body: {},
      }),
    );

    expect(result).toBe(true);
  });

  it('bloqueia quando o userId da request e de outro usuario', () => {
    expect(() =>
      guard.canActivate(
        createContext({
          user: { uid: 'user-1' },
          params: { userId: 'user-2' },
          query: {},
          body: {},
        }),
      ),
    ).toThrow(ForbiddenException);
  });

  it('bloqueia quando o uid no body e de outro usuario', () => {
    expect(() =>
      guard.canActivate(
        createContext({
          user: { uid: 'user-1' },
          params: {},
          query: {},
          body: { uid: 'user-2' },
        }),
      ),
    ).toThrow(ForbiddenException);
  });
});
