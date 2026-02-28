import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import { AuthService } from './auth.service';
import { FirebaseService } from 'src/firebase';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

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

      const result = await service.loginWithEmailAndPassword(
        TEST_EMAIL,
        TEST_PASSWORD,
      );

      expect(result).toEqual({
        idToken: 'id-token',
        refreshToken: 'refresh-token',
        expiresIn: '3600',
        localId: 'user-id',
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

      await expect(
        service.loginWithEmailAndPassword('wrong@email.com', 'wrong'),
      ).rejects.toThrow('Email ou senha inválidos');
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
});
