import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private firestore: admin.firestore.Firestore;
  private app: admin.app.App;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.initializeFirebase();
  }

  private initializeFirebase(): void {
    try {
      const firebaseBase64 = this.configService.get<string>('FIREBASE_BASE64');

      if (!firebaseBase64) {
        throw new Error('FIREBASE_BASE64 não está configurado');
      }

      const serviceAccountJson = JSON.parse(
        Buffer.from(firebaseBase64, 'base64').toString('utf-8'),
      );

      const storageBucket =
        this.configService.get<string>('FIREBASE_STORAGE_BUCKET') ||
        this.configService.get<string>('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET') ||
        serviceAccountJson.storageBucket ||
        `${serviceAccountJson.project_id}.firebasestorage.app`;

      this.app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccountJson),
        storageBucket,
      });

      this.firestore = this.app.firestore();
      this.logger.log(
        `Firebase inicializado com sucesso (bucket: ${storageBucket})`,
      );
    } catch (error) {
      this.logger.error('Erro ao inicializar Firebase', error);
      throw error;
    }
  }
}
