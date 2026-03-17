import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as admin from 'firebase-admin';
import { PrismaService } from 'src/prisma';

@Injectable()
export class AuthService {
  private readonly firebaseApiKey =
    this.configService.get<string>('FIREBASE_API_KEY');

  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  private readonly profileAllowedFields = new Set([
    'parentName',
    'childName',
    'childBirthDate',
    'parentPhone',
    'school',
  ]);

  private async findProfileByFirebaseUid(firebaseUid: string) {
    return this.prismaService.user.findUnique({
      where: { firebaseUid },
    });
  }

  private mapProfile(profile: Awaited<ReturnType<AuthService['findProfileByFirebaseUid']>>) {
    if (!profile) {
      return null;
    }

    return {
      id: profile.id,
      uid: profile.firebaseUid,
      email: profile.email,
      parentName: profile.parentName,
      childName: profile.childName,
      childBirthDate: profile.childBirthDate,
      parentPhone: profile.parentPhone,
      school: profile.school,
      roles: profile.roles,
      role: profile.roles,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

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

  async loginWithGoogle(idToken: string) {
    try {
      const decoded = await admin.auth().verifyIdToken(idToken, true);
      const userRecord = await admin.auth().getUser(decoded.uid);
      const existingProfile = await this.findProfileByFirebaseUid(userRecord.uid);

      if (!existingProfile) {
        await this.prismaService.user.create({
          data: {
            firebaseUid: userRecord.uid,
            email: userRecord.email ?? null,
            parentName: userRecord.displayName ?? null,
            childName: null,
            childBirthDate: null,
            parentPhone: null,
            school: null,
            roles: ['student'],
          },
        });
      }

      const user = await this.getProfile(userRecord.uid);

      return {
        idToken,
        refreshToken: '',
        expiresIn: '',
        localId: userRecord.uid,
        user,
      };
    } catch {
      throw new UnauthorizedException('Não foi possível autenticar com Google');
    }
  }

  async registerWithEmailAndPassword(data: {
    email: string;
    password: string;
    parentName?: string;
    childName?: string;
    childBirthDate?: string;
    parentPhone?: string;
    school?: string;
  }) {
    try {
      let userRecord: admin.auth.UserRecord;

      try {
        userRecord = await admin.auth().createUser({
          email: data.email,
          password: data.password,
          displayName: data.parentName,
        });
      } catch (error) {
        if (error?.errorInfo?.code !== 'auth/email-already-exists') {
          throw error;
        }

        userRecord = await admin.auth().getUserByEmail(data.email);
      }

      const existingProfile = await this.findProfileByFirebaseUid(userRecord.uid);

      if (existingProfile) {
        throw new UnauthorizedException('Email já cadastrado');
      }

      await this.prismaService.user.create({
        data: {
          firebaseUid: userRecord.uid,
          email: data.email,
          parentName: data.parentName ?? null,
          childName: data.childName ?? null,
          childBirthDate: data.childBirthDate ?? null,
          parentPhone: data.parentPhone ?? null,
          school: data.school ?? null,
          roles: ['student'],
        },
      });

      return this.loginWithEmailAndPassword(data.email, data.password);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      if (error?.errorInfo?.code == 'auth/email-already-exists') {
        throw new UnauthorizedException('Email já cadastrado');
      }
      throw new UnauthorizedException('Não foi possível concluir o cadastro');
    }
  }

  async sendRecoveryEmail(email: string) {
    try {
      await axios.post(
        'https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode',
        {
          requestType: 'PASSWORD_RESET',
          email,
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

      return true;
    } catch {
      throw new UnauthorizedException('Não foi possível enviar o e-mail');
    }
  }

  async getProfile(id: string) {
    const data = await this.findProfileByFirebaseUid(id);
    return this.mapProfile(data);
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
    const user = await this.findProfileByFirebaseUid(id);

    if (!user) {
      throw new NotFoundException('Usuario não encontrado');
    }

    const safeData = Object.fromEntries(
      Object.entries(data).filter(([key]) =>
        this.profileAllowedFields.has(key),
      ),
    );

    await this.prismaService.user.update({
      where: { firebaseUid: id },
      data: safeData,
    });

    return this.getProfile(id);
  }
}
