import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const TEST_EMAIL = 'test@email.com';
const TEST_PASSWORD = Buffer.from('dGVzdC1wYXNz', 'base64').toString('utf8');

const mockProfile = {
  id: 'user-1',
  uid: 'user-1',
  email: 'user-1@email.com',
  parentName: 'Joao',
  childName: 'Pedro',
  childBirthDate: '2018-01-01',
  parentPhone: '(41) 99999-9999',
  school: 'Escola Teste',
  roles: ['student'],
  role: ['student'],
  createdAt: new Date('2026-03-15T00:00:00.000Z'),
  updatedAt: new Date('2026-03-15T01:00:00.000Z'),
};

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
            loginWithGoogle: jest.fn(),
            registerWithEmailAndPassword: jest.fn(),
            sendRecoveryEmail: jest.fn(),
            getProfile: jest.fn(),
            updateProfile: jest.fn(),
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
        user: {
          ...mockProfile,
          uid: 'uid',
          id: 'uid',
        },
      });

      const result = await controller.login({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      });

      expect(authService.loginWithEmailAndPassword).toHaveBeenCalledWith(
        TEST_EMAIL,
        TEST_PASSWORD,
      );

      expect(result).toEqual({
        idToken: 'token',
        refreshToken: 'refresh',
        expiresIn: '3600',
        localId: 'uid',
        user: {
          ...mockProfile,
          uid: 'uid',
          id: 'uid',
        },
      });
    });
  });

  describe('profile', () => {
    it('deve retornar o perfil do usuário autenticado', async () => {
      authService.getProfile.mockResolvedValueOnce(mockProfile);

      const req = {
        user: {
          uid: 'user-1',
        },
      };

      const result = await controller.profile(req);

      expect(authService.getProfile).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(mockProfile);
    });

    it('deve lançar UnauthorizedException se req.user não existir', async () => {
      const req = {};

      await expect(controller.profile(req)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(authService.getProfile).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('deve registrar usuário com sucesso', async () => {
      authService.registerWithEmailAndPassword.mockResolvedValueOnce({
        idToken: 'token',
      } as any);

      const body = {
        email: 'new@email.com',
        password: TEST_PASSWORD,
      };

      const result = await controller.register(body);

      expect(authService.registerWithEmailAndPassword).toHaveBeenCalledWith(
        body,
      );
      expect(result).toEqual({ idToken: 'token' });
    });
  });

  describe('googleLogin', () => {
    it('deve autenticar com Google com sucesso', async () => {
      authService.loginWithGoogle.mockResolvedValueOnce({
        idToken: 'google-id-token',
        user: { uid: 'google-user-1' },
      } as any);

      const result = await controller.googleLogin({
        idToken: 'google-id-token',
      });

      expect(authService.loginWithGoogle).toHaveBeenCalledWith(
        'google-id-token',
      );
      expect(result).toEqual({
        idToken: 'google-id-token',
        user: { uid: 'google-user-1' },
      });
    });
  });

  describe('recovery', () => {
    it('deve enviar recuperação', async () => {
      authService.sendRecoveryEmail.mockResolvedValueOnce(true);

      const result = await controller.recovery({ email: 'x@email.com' });

      expect(authService.sendRecoveryEmail).toHaveBeenCalledWith('x@email.com');
      expect(result).toBe(true);
    });
  });

  describe('updateProfile', () => {
    it('deve atualizar o perfil quando usuário autenticado existir', async () => {
      authService.updateProfile.mockResolvedValueOnce(mockProfile as any);

      const req = {
        user: {
          uid: 'user-1',
        },
      };
      const body = {
        parentName: 'Joao',
      };

      const result = await controller.updateProfile(req, body);

      expect(authService.updateProfile).toHaveBeenCalledWith('user-1', body);
      expect(result).toEqual(mockProfile);
    });

    it('deve lançar UnauthorizedException no updateProfile se req.user não existir', async () => {
      const req = {};

      await expect(controller.updateProfile(req, { parentName: 'Joao' })).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.updateProfile).not.toHaveBeenCalled();
    });
  });
});
