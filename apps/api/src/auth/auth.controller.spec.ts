import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            loginWithEmailAndPassword: jest.fn(),
            getProfile: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard('firebase-auth'))
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('deve chamar o AuthService e retornar o login com sucesso', async () => {
      authService.loginWithEmailAndPassword.mockResolvedValueOnce({
        idToken: 'token',
        refreshToken: 'refresh',
        expiresIn: '3600',
        localId: 'uid',
      });

      const result = await controller.login({
        email: 'test@email.com',
        password: '123456',
      });

      expect(authService.loginWithEmailAndPassword).toHaveBeenCalledWith(
        'test@email.com',
        '123456',
      );

      expect(result).toEqual({
        idToken: 'token',
        refreshToken: 'refresh',
        expiresIn: '3600',
        localId: 'uid',
      });
    });
  });

  describe('profile', () => {
    it('deve retornar o perfil do usuário autenticado', async () => {
      authService.getProfile.mockResolvedValueOnce({
        uid: 'user-1',
        id: 'user-1',
      });

      const req = {
        user: {
          uid: 'user-1',
        },
      };

      const result = await controller.profile(req);

      expect(authService.getProfile).toHaveBeenCalledWith('user-1');
      expect(result).toEqual({
        uid: 'user-1',
        id: 'user-1',
      });
    });

    it('deve lançar UnauthorizedException se req.user não existir', async () => {
      const req = {};

      await expect(controller.profile(req)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(authService.getProfile).not.toHaveBeenCalled();
    });
  });
});
