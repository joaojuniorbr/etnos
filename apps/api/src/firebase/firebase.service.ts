import {
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import {
  QueryOptions,
  PaginationOptions,
  PaginatedResponse,
  FilterSummary,
  QueryFilter,
} from './firebase.type';

interface FirestoreDocument {
  id: string;
  [key: string]: unknown;
}

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
        serviceAccountJson.storageBucket ||
        `${serviceAccountJson.project_id}.appspot.com`;

      this.app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccountJson),
        storageBucket,
      });

      this.firestore = this.app.firestore();
      this.logger.log('Firebase inicializado com sucesso');
    } catch (error) {
      this.logger.error('Erro ao inicializar Firebase', error);
      throw error;
    }
  }

  private buildQuery(
    collectionName: string,
    options?: QueryOptions,
  ): FirebaseFirestore.Query {
    let query: FirebaseFirestore.Query =
      this.firestore.collection(collectionName);

    if (options?.filters?.length) {
      for (const filter of options.filters) {
        query = query.where(filter.field, filter.operator, filter.value);
      }
    }

    if (options?.orderBy) {
      query = query.orderBy(
        options.orderBy.field,
        options.orderBy.direction || 'asc',
      );
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.startAfter) {
      query = query.startAfter(options.startAfter);
    }

    return query;
  }

  async findAll<T>(
    collectionName: string,
    options?: QueryOptions,
  ): Promise<T[]> {
    try {
      const query = this.buildQuery(collectionName, options);
      const snapshot = await query.get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
    } catch (error) {
      this.logger.error(
        `Erro ao buscar documentos de ${collectionName}`,
        error,
      );
      throw error;
    }
  }

  async findById<T extends FirestoreDocument>(
    collectionName: string,
    id: string,
  ): Promise<T | null> {
    try {
      const doc = await this.firestore.collection(collectionName).doc(id).get();

      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data(),
      } as T;
    } catch (error) {
      this.logger.error(
        `Erro ao buscar documento ${id} de ${collectionName}`,
        error,
      );
      throw error;
    }
  }

  async findOne<T>(
    collectionName: string,
    filters: QueryFilter[],
  ): Promise<T | null> {
    try {
      const query = this.buildQuery(collectionName, { filters, limit: 1 });
      const snapshot = await query.get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as T;
    } catch (error) {
      this.logger.error(`Erro ao buscar item de ${collectionName}`, error);
      throw error;
    }
  }

  async findPaginated<T>(
    collectionName: string,
    options: PaginationOptions = {},
  ): Promise<PaginatedResponse<T>> {
    try {
      const page = Math.max(1, options.page || 1);
      const limit = Math.min(100, Math.max(1, options.limit || 10));

      const query = this.buildQuery(collectionName, {
        filters: options.filters,
        orderBy: options.orderBy,
      });

      const snapshot = await query.get();
      let docs = snapshot.docs;

      if (options.search && options.searchFields?.length) {
        const searchTerm = options.search.toLowerCase();
        docs = docs.filter((doc) => {
          const data = doc.data();
          return options.searchFields?.some((field) => {
            const value = data[field];
            return value && String(value).toLowerCase().includes(searchTerm);
          });
        });
      }

      const total = docs.length;
      const totalPages = Math.ceil(total / limit);
      const start = (page - 1) * limit;
      const end = start + limit;

      const paginatedDocs = docs.slice(start, end);
      const data = paginatedDocs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];

      return {
        data,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    } catch (error) {
      this.logger.error(
        `Erro ao buscar documentos paginados de ${collectionName}`,
        error,
      );
      throw error;
    }
  }

  async create<T extends Record<string, unknown>>(
    collectionName: string,
    data: T,
    customId?: string,
  ): Promise<T & { id: string }> {
    try {
      const docRef = customId
        ? this.firestore.collection(collectionName).doc(customId)
        : this.firestore.collection(collectionName).doc();

      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      const dataWithTimestamp = {
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      await docRef.set(dataWithTimestamp);

      return {
        id: docRef.id,
        ...data,
      };
    } catch (error) {
      this.logger.error(`Erro ao criar documento em ${collectionName}`, error);
      throw error;
    }
  }

  async update<T extends Record<string, unknown>>(
    collectionName: string,
    id: string,
    data: Partial<T>,
  ): Promise<void> {
    try {
      const docRef = this.firestore.collection(collectionName).doc(id);
      const timestamp = admin.firestore.FieldValue.serverTimestamp();

      await docRef.update({
        ...data,
        updatedAt: timestamp,
      });
    } catch (error) {
      this.logger.error(
        `Erro ao atualizar documento ${id} em ${collectionName}`,
        error,
      );
      throw error;
    }
  }

  async delete(collectionName: string, id: string): Promise<void> {
    try {
      await this.firestore.collection(collectionName).doc(id).delete();
    } catch (error) {
      this.logger.error(
        `Erro ao deletar documento ${id} de ${collectionName}`,
        error,
      );
      throw error;
    }
  }

  async batchDelete(collectionName: string, ids: string[]): Promise<void> {
    try {
      const batch = this.firestore.batch();

      for (const id of ids) {
        const docRef = this.firestore.collection(collectionName).doc(id);
        batch.delete(docRef);
      }

      await batch.commit();
    } catch (error) {
      this.logger.error(
        `Erro ao deletar documentos em batch de ${collectionName}`,
        error,
      );
      throw error;
    }
  }

  async getFiltersSummary(
    collectionName: string,
    fields: string[],
  ): Promise<FilterSummary[]> {
    try {
      const snapshot = await this.firestore.collection(collectionName).get();

      const counters: Record<string, Record<string, number>> = {};

      snapshot.forEach((doc) => {
        const data = doc.data();

        for (const field of fields) {
          const value = data[field];
          if (value === undefined || value === null) continue;

          if (!counters[field]) {
            counters[field] = {};
          }

          const key = String(value);
          counters[field][key] = (counters[field][key] || 0) + 1;
        }
      });

      return Object.entries(counters).map(([field, valuesMap]) => ({
        field,
        values: Object.entries(valuesMap)
          .map(([label, value]) => ({ label, value }))
          .sort((a, b) => b.value - a.value),
      }));
    } catch (error) {
      this.logger.error(
        `Erro ao obter resumo de filtros de ${collectionName}`,
        error,
      );
      throw error;
    }
  }

  async count(
    collectionName: string,
    filters?: QueryFilter[],
  ): Promise<number> {
    try {
      const query = this.buildQuery(collectionName, { filters });
      const snapshot = await query.count().get();
      return snapshot.data().count;
    } catch (error) {
      this.logger.error(
        `Erro ao contar documentos de ${collectionName}`,
        error,
      );
      throw error;
    }
  }

  async runTransaction<T>(
    updateFunction: (transaction: FirebaseFirestore.Transaction) => Promise<T>,
  ): Promise<T> {
    try {
      return await this.firestore.runTransaction(updateFunction);
    } catch (error) {
      this.logger.error('Erro ao executar transação', error);
      throw error;
    }
  }

  getDocRef(
    collectionName: string,
    id: string,
  ): FirebaseFirestore.DocumentReference {
    return this.firestore.collection(collectionName).doc(id);
  }

  getCollectionRef(
    collectionName: string,
  ): FirebaseFirestore.CollectionReference {
    return this.firestore.collection(collectionName);
  }
}
