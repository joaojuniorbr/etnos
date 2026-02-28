import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { FirebaseService } from 'src/firebase';
import * as admin from 'firebase-admin';

@Injectable()
export class AuthService {
  private readonly firebaseApiKey =
    this.configService.get<string>('FIREBASE_API_KEY');

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly configService: ConfigService,
  ) {}

  private readonly profileAllowedFields = new Set([
    'parentName',
    'childName',
    'childBirthDate',
    'parentPhone',
    'school',
  ]);

  async loginWithEmailAndPassword(email: string, password: string) {
    try {
      const response = await axios.post(
        'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword',
        {
          email,
          password,
          returnSecureToken: true,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          params: {
            key: this.firebaseApiKey,
          },
        },
      );

      const decoded = await admin.auth().verifyIdToken(response.data.idToken);
      const uid = decoded.uid;

      const user = await this.getProfile(uid);

      return {
        idToken: response.data.idToken,
        refreshToken: response.data.refreshToken,
        expiresIn: response.data.expiresIn,
        localId: response.data.localId,
        user,
      };
    } catch {
      throw new UnauthorizedException('Email ou senha inválidos');
    }
  }

  async getProfile(id: string) {
    const data = await this.firebaseService.findById('users', id);

    return {
      ...data,
      uid: id,
    };
  }

  async updateProfile(
    id: string,
    data: Partial<{
      parentName: unknown;
      childName: unknown;
      childBirthDate: unknown;
      parentPhone: unknown;
      school: unknown;
    }>,
  ) {
    const user = await this.getProfile(id);

    if (!user) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    const safeData = Object.fromEntries(
      Object.entries(data).filter(([key]) => this.profileAllowedFields.has(key)),
    );

    return this.firebaseService.update('users', user.uid, safeData);
  }
}
