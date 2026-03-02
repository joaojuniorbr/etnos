import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/firebase';

const COLLECTION_NAME = 'schools';

export interface SchoolInterface {
  id: string;
  name: string;
  city?: string;
  state?: string;
}

@Injectable()
export class SchoolsService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async getAll(): Promise<SchoolInterface[]> {
    return this.firebaseService.findAll<SchoolInterface>(COLLECTION_NAME, {
      orderBy: {
        field: 'name',
        direction: 'asc',
      },
    });
  }

  async create(school: SchoolInterface) {
    const exists = await this.firebaseService.findOne<SchoolInterface>(
      COLLECTION_NAME,
      [
        {
          field: 'name',
          operator: '==',
          value: school.name,
        },
      ],
    );

    if (exists) return null;

    const created = await this.firebaseService.create(
      COLLECTION_NAME,
      school as unknown as Record<string, unknown>,
    );

    return {
      id: created.id,
      ...school,
    };
  }

  async update(id: string, school: Partial<SchoolInterface>) {
    const existing = await this.firebaseService.findOne<SchoolInterface>(
      COLLECTION_NAME,
      [
        {
          field: 'name',
          operator: '==',
          value: school.name,
        },
        {
          field: 'city',
          operator: '==',
          value: school.city ?? null,
        },
      ],
    );

    if (existing && existing.id !== id) return null;

    await this.firebaseService.update(
      COLLECTION_NAME,
      id,
      school as unknown as Record<string, unknown>,
    );

    return {
      id,
      ...school,
    };
  }

  async delete(id: string) {
    await this.firebaseService.delete(COLLECTION_NAME, id);
    return true;
  }

  async getOne(id: string): Promise<SchoolInterface | null> {
    return this.firebaseService.findById(COLLECTION_NAME, id) as unknown as Promise<
      SchoolInterface | null
    >;
  }
}
