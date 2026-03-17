import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as admin from 'firebase-admin';

import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma';

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
  let prismaService: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
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
    prismaService = module.get(PrismaService);

    mockedAdminAuth.mockReturnValue({
      createUser: jest.fn().mockResolvedValue({ uid: 'new-user-id' }),
      getUserByEmail: jest.fn().mockResolvedValue({ uid: 'existing-user-id' }),
      getUser: jest.fn().mockResolvedValue({
        uid: 'google-user-id',
        email: 'google@test.com',
        displayName: 'Google User',
      }),
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
      prismaService.user.findUnique.mockResolvedValueOnce({
        id: 'db-user-id',
        firebaseUid: 'user-id',
        roles: ['student'],
        email: TEST_EMAIL,
        parentName: null,
        childName: null,
        childBirthDate: null,
        parentPhone: null,
        school: null,
        createdAt: new Date('2026-03-15T00:00:00.000Z'),
        updatedAt: new Date('2026-03-15T00:00:00.000Z'),
      });

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
          id: 'db-user-id',
          uid: 'user-id',
          email: TEST_EMAIL,
          parentName: null,
          childName: null,
          childBirthDate: null,
          parentPhone: null,
          school: null,
          roles: ['student'],
          role: ['student'],
          createdAt: new Date('2026-03-15T00:00:00.000Z'),
          updatedAt: new Date('2026-03-15T00:00:00.000Z'),
        },
      });
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
      prismaService.user.findUnique.mockResolvedValueOnce({
        id: 'db-user-id',
        firebaseUid: 'user-123',
        email: 'joao@email.com',
        parentName: 'João',
        childName: null,
        childBirthDate: null,
        parentPhone: null,
        school: null,
        roles: ['student'],
        createdAt: new Date('2026-03-15T00:00:00.000Z'),
        updatedAt: new Date('2026-03-15T01:00:00.000Z'),
      });

      const result = await service.getProfile('user-123');

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { firebaseUid: 'user-123' },
      });
      expect(result).toEqual({
        id: 'db-user-id',
        uid: 'user-123',
        email: 'joao@email.com',
        parentName: 'João',
        childName: null,
        childBirthDate: null,
        parentPhone: null,
        school: null,
        roles: ['student'],
        role: ['student'],
        createdAt: new Date('2026-03-15T00:00:00.000Z'),
        updatedAt: new Date('2026-03-15T01:00:00.000Z'),
      });
    });

    it('deve retornar null quando perfil não existir', async () => {
      prismaService.user.findUnique.mockResolvedValueOnce(null);

      await expect(service.getProfile('missing-user')).resolves.toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('deve atualizar perfil quando usuário existir', async () => {
      prismaService.user.findUnique
        .mockResolvedValueOnce({
          id: 'db-user-id',
          firebaseUid: 'user-123',
        })
        .mockResolvedValueOnce({
          id: 'db-user-id',
          firebaseUid: 'user-123',
          email: TEST_EMAIL,
          parentName: 'Novo Nome',
          childName: null,
          childBirthDate: null,
          parentPhone: null,
          school: null,
          roles: ['student'],
          createdAt: new Date('2026-03-15T00:00:00.000Z'),
          updatedAt: new Date('2026-03-15T01:00:00.000Z'),
        });
      prismaService.user.update.mockResolvedValueOnce({} as never);

      const result = await service.updateProfile('user-123', {
        parentName: 'Novo Nome',
      });

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { firebaseUid: 'user-123' },
        data: { parentName: 'Novo Nome' },
      });
      expect(result).toEqual(
        expect.objectContaining({
          uid: 'user-123',
          parentName: 'Novo Nome',
        }),
      );
    });

    it('deve ignorar campos sensíveis no updateProfile', async () => {
      prismaService.user.findUnique
        .mockResolvedValueOnce({
          id: 'db-user-id',
          firebaseUid: 'user-123',
        })
        .mockResolvedValueOnce({
          id: 'db-user-id',
          firebaseUid: 'user-123',
          email: TEST_EMAIL,
          parentName: 'Novo Nome',
          childName: null,
          childBirthDate: null,
          parentPhone: null,
          school: null,
          roles: ['student'],
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      prismaService.user.update.mockResolvedValueOnce({} as never);

      await service.updateProfile(
        'user-123',
        {
          parentName: 'Novo Nome',
          role: ['admin'],
          uid: 'hack',
        } as any,
      );

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { firebaseUid: 'user-123' },
        data: { parentName: 'Novo Nome' },
      });
    });

    it('deve lançar NotFoundException quando perfil não existir', async () => {
      prismaService.user.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.updateProfile('user-missing', { parentName: 'Teste' }),
      ).rejects.toThrow(NotFoundException);
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

      prismaService.user.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: 'db-user-id',
          firebaseUid: 'new-user-id',
          email: 'new@email.com',
          parentName: 'Pai',
          childName: null,
          childBirthDate: null,
          parentPhone: null,
          school: null,
          roles: ['student'],
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      const result = await service.registerWithEmailAndPassword({
        email: 'new@email.com',
        password: TEST_PASSWORD,
        parentName: 'Pai',
      });

      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          firebaseUid: 'new-user-id',
          email: 'new@email.com',
          parentName: 'Pai',
        }),
      });
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

      prismaService.user.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: 'db-user-id',
          firebaseUid: 'existing-user-id',
          email: 'existing@email.com',
          parentName: null,
          childName: null,
          childBirthDate: null,
          parentPhone: null,
          school: null,
          roles: ['student'],
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      const result = await service.registerWithEmailAndPassword({
        email: 'existing@email.com',
        password: TEST_PASSWORD,
      });

      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          firebaseUid: 'existing-user-id',
          email: 'existing@email.com',
          parentName: null,
        }),
      });
      expect(result.idToken).toBe('id-token');
    });

    it('deve lançar UnauthorizedException quando já existe perfil', async () => {
      prismaService.user.findUnique.mockResolvedValueOnce({
        id: 'db-user-id',
        firebaseUid: 'existing-user-id',
      });

      await expect(
        service.registerWithEmailAndPassword({
          email: 'existing@email.com',
          password: TEST_PASSWORD,
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
          password: TEST_PASSWORD,
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar Email já cadastrado quando getUserByEmail falhar com email existente', async () => {
      mockedAdminAuth.mockReturnValue({
        createUser: jest.fn().mockRejectedValue({
          errorInfo: { code: 'auth/email-already-exists' },
        }),
        getUserByEmail: jest.fn().mockRejectedValue({
          errorInfo: { code: 'auth/email-already-exists' },
        }),
      } as any);

      await expect(
        service.registerWithEmailAndPassword({
          email: 'existing@email.com',
          password: TEST_PASSWORD,
        }),
      ).rejects.toThrow('Email já cadastrado');
    });
  });

  describe('loginWithGoogle', () => {
    it('deve validar token Google e criar perfil quando não existir', async () => {
      mockedAdminAuth.mockReturnValueOnce({
        verifyIdToken: jest.fn().mockResolvedValue({ uid: 'google-user-id' }),
        getUser: jest.fn().mockResolvedValue({
          uid: 'google-user-id',
          email: 'google@test.com',
          displayName: 'Google User',
        }),
      } as any);

      prismaService.user.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: 'db-user-id',
          firebaseUid: 'google-user-id',
          email: 'google@test.com',
          parentName: 'Google User',
          childName: null,
          childBirthDate: null,
          parentPhone: null,
          school: null,
          roles: ['student'],
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      const result = await service.loginWithGoogle('google-id-token');

      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          firebaseUid: 'google-user-id',
          email: 'google@test.com',
          parentName: 'Google User',
          childName: null,
          childBirthDate: null,
          parentPhone: null,
          school: null,
          roles: ['student'],
        },
      });
      expect(result).toEqual({
        idToken: 'google-id-token',
        refreshToken: '',
        expiresIn: '',
        localId: 'google-user-id',
        user: expect.objectContaining({
          uid: 'google-user-id',
          email: 'google@test.com',
          roles: ['student'],
          role: ['student'],
        }),
      });
    });

    it('deve reutilizar perfil existente no login com Google', async () => {
      mockedAdminAuth.mockReturnValueOnce({
        verifyIdToken: jest.fn().mockResolvedValue({ uid: 'google-user-id' }),
        getUser: jest.fn().mockResolvedValue({
          uid: 'google-user-id',
          email: 'google@test.com',
          displayName: 'Google User',
        }),
      } as any);

      prismaService.user.findUnique
        .mockResolvedValueOnce({
          id: 'db-user-id',
          firebaseUid: 'google-user-id',
        })
        .mockResolvedValueOnce({
          id: 'db-user-id',
          firebaseUid: 'google-user-id',
          email: 'google@test.com',
          parentName: 'Google User',
          childName: null,
          childBirthDate: null,
          parentPhone: null,
          school: null,
          roles: ['student'],
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      const result = await service.loginWithGoogle('google-id-token');

      expect(prismaService.user.create).not.toHaveBeenCalled();
      expect(result.user).toEqual(
        expect.objectContaining({
          uid: 'google-user-id',
          email: 'google@test.com',
          roles: ['student'],
          role: ['student'],
        }),
      );
    });

    it('deve lançar UnauthorizedException quando login com Google falhar', async () => {
      mockedAdminAuth.mockReturnValueOnce({
        verifyIdToken: jest.fn().mockRejectedValue(new Error('invalid token')),
      } as any);

      await expect(service.loginWithGoogle('invalid-token')).rejects.toThrow(
        'Não foi possível autenticar com Google',
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
