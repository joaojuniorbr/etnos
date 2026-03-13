import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as admin from 'firebase-admin';

import { AuthService } from './auth.service';
import { FirebaseService } from 'src/firebase';

jest.mock('axios');
jest.mock('firebase-admin', () => ({
  auth: jest.fn(),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedAdminAuth = admin.auth as jest.Mock;

const FAKE_FIREBASE_API_KEY = 'fake-firebase-api-key';
const TEST_EMAIL = 'test@email.com';
const TEST_PASSWORD = Buffer.from('dGVzdC1wYXNz', 'base64').toString('utf8');

describe('AuthService', () => {
  let service: AuthService;
  let firebaseService: jest.Mocked<FirebaseService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: FirebaseService,
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(FAKE_FIREBASE_API_KEY),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    firebaseService = module.get(FirebaseService);

    mockedAdminAuth.mockReturnValue({
      createUser: jest.fn().mockResolvedValue({ uid: 'new-user-id' }),
      getUserByEmail: jest.fn().mockResolvedValue({ uid: 'existing-user-id' }),
      verifyIdToken: jest.fn().mockResolvedValue({ uid: 'user-id' }),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('loginWithEmailAndPassword', () => {
    it('deve autenticar com sucesso e retornar os tokens', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          idToken: 'id-token',
          refreshToken: 'refresh-token',
          expiresIn: '3600',
          localId: 'user-id',
        },
      });
      firebaseService.findById.mockResolvedValueOnce({
        id: 'user-id',
        role: ['student'],
      } as any);

      const result = await service.loginWithEmailAndPassword(
        TEST_EMAIL,
        TEST_PASSWORD,
      );

      expect(result).toEqual({
        idToken: 'id-token',
        refreshToken: 'refresh-token',
        expiresIn: '3600',
        localId: 'user-id',
        user: {
          id: 'user-id',
          role: ['student'],
          uid: 'user-id',
        },
      });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword',
        {
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
          returnSecureToken: true,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          params: {
            key: FAKE_FIREBASE_API_KEY,
          },
        },
      );
    });

    it('deve lançar UnauthorizedException quando o login falhar', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Invalid credentials'));

      await expect(
        service.loginWithEmailAndPassword('wrong@email.com', 'wrong'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('deve retornar o perfil do usuário com uid', async () => {
      firebaseService.findById.mockResolvedValueOnce({
        name: 'João',
        email: 'joao@email.com',
      } as any);

      const result = await service.getProfile('user-123');

      expect(firebaseService.findById).toHaveBeenCalledWith(
        'users',
        'user-123',
      );

      expect(result).toEqual({
        name: 'João',
        email: 'joao@email.com',
        uid: 'user-123',
      });
    });
  });

  describe('updateProfile', () => {
    it('deve atualizar perfil quando usuário existir', async () => {
      firebaseService.findById.mockResolvedValueOnce({
        id: 'user-123',
        parentName: 'Maria',
      } as any);
      firebaseService.update.mockResolvedValueOnce({
        ok: true,
      } as any);

      const payload = { parentName: 'Novo Nome' };
      const result = await service.updateProfile('user-123', payload);

      expect(firebaseService.update).toHaveBeenCalledWith(
        'users',
        'user-123',
        payload,
      );
      expect(result).toEqual({ ok: true });
    });

    it('deve ignorar campos sensíveis no updateProfile', async () => {
      firebaseService.findById.mockResolvedValueOnce({
        id: 'user-123',
      } as any);
      firebaseService.update.mockResolvedValueOnce({
        ok: true,
      } as any);

      await service.updateProfile(
        'user-123',
        {
          parentName: 'Novo Nome',
          role: ['admin'],
          uid: 'hack',
        } as any,
      );

      expect(firebaseService.update).toHaveBeenCalledWith(
        'users',
        'user-123',
        { parentName: 'Novo Nome' },
      );
    });

    it('deve lançar NotFoundException quando getProfile retornar null', async () => {
      jest.spyOn(service, 'getProfile').mockResolvedValueOnce(null as any);

      await expect(
        service.updateProfile('user-missing', { parentName: 'Teste' }),
      ).rejects.toThrow('Usuario não encontrado');

      expect(firebaseService.update).not.toHaveBeenCalled();
    });
  });

  describe('registerWithEmailAndPassword', () => {
    it('deve criar usuário e perfil e retornar login', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          idToken: 'id-token',
          refreshToken: 'refresh-token',
          expiresIn: '3600',
          localId: 'new-user-id',
        },
      });

      firebaseService.findById
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
        id: 'new-user-id',
        role: ['student'],
      } as any);

      const result = await service.registerWithEmailAndPassword({
        email: 'new@email.com',
        password: '123456',
        parentName: 'Pai',
      });

      expect(firebaseService.create).toHaveBeenCalledWith(
        'users',
        expect.objectContaining({
          email: 'new@email.com',
          parentName: 'Pai',
        }),
        'new-user-id',
      );
      expect(result.idToken).toBe('id-token');
    });

    it('deve criar perfil quando usuário já existe no firebase auth', async () => {
      const authMock = {
        createUser: jest.fn().mockRejectedValue({
          errorInfo: { code: 'auth/email-already-exists' },
        }),
        getUserByEmail: jest.fn().mockResolvedValue({ uid: 'existing-user-id' }),
        verifyIdToken: jest.fn().mockResolvedValue({ uid: 'existing-user-id' }),
      } as any;
      mockedAdminAuth.mockReturnValueOnce(authMock);
      mockedAdminAuth.mockReturnValue(authMock);

      mockedAxios.post.mockResolvedValueOnce({
        data: {
          idToken: 'id-token',
          refreshToken: 'refresh-token',
          expiresIn: '3600',
          localId: 'existing-user-id',
        },
      });

      firebaseService.findById
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: 'existing-user-id',
          role: ['student'],
        } as any);

      const result = await service.registerWithEmailAndPassword({
        email: 'existing@email.com',
        password: '123456',
      });

      expect(firebaseService.create).toHaveBeenCalledWith(
        'users',
        expect.objectContaining({
          email: 'existing@email.com',
          parentName: null,
        }),
        'existing-user-id',
      );
      expect(result.idToken).toBe('id-token');
    });

    it('deve lançar UnauthorizedException quando já existe perfil', async () => {
      mockedAdminAuth.mockReturnValueOnce({
        createUser: jest.fn().mockRejectedValue({
          errorInfo: { code: 'auth/email-already-exists' },
        }),
        getUserByEmail: jest.fn().mockResolvedValue({ uid: 'existing-user-id' }),
      } as any);

      firebaseService.findById.mockResolvedValueOnce({
        id: 'existing-user-id',
      } as any);

      await expect(
        service.registerWithEmailAndPassword({
          email: 'existing@email.com',
          password: '123456',
        }),
      ).rejects.toThrow('Email já cadastrado');
    });

    it('deve lançar UnauthorizedException se falhar no register', async () => {
      mockedAdminAuth.mockReturnValueOnce({
        createUser: jest.fn().mockRejectedValue(new Error('fail')),
      } as any);

      await expect(
        service.registerWithEmailAndPassword({
          email: 'new@email.com',
          password: '123456',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve preencher parentName como null quando não informado', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          idToken: 'id-token',
          refreshToken: 'refresh-token',
          expiresIn: '3600',
          localId: 'new-user-id',
        },
      });
      firebaseService.findById
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: 'new-user-id',
        } as any);

      await service.registerWithEmailAndPassword({
        email: 'new@email.com',
        password: '123456',
      });

      expect(firebaseService.create).toHaveBeenCalledWith(
        'users',
        expect.objectContaining({
          parentName: null,
        }),
        'new-user-id',
      );
    });
  });

  describe('sendRecoveryEmail', () => {
    it('deve disparar e-mail de recuperação', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: {} });

      const result = await service.sendRecoveryEmail('mail@test.com');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode',
        {
          requestType: 'PASSWORD_RESET',
          email: 'mail@test.com',
        },
        expect.objectContaining({
          params: {
            key: FAKE_FIREBASE_API_KEY,
          },
        }),
      );
      expect(result).toBe(true);
    });

    it('deve lançar UnauthorizedException se recovery falhar', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('fail'));

      await expect(service.sendRecoveryEmail('mail@test.com')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
