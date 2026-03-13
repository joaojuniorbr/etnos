import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/firebase';
import * as admin from 'firebase-admin';
import { QueryFilter } from 'src/firebase/firebase.type';
import type { MidiaInterface } from '@etnos/types';

const COLLECTION_NAME = 'midia';
const SIGNED_URL_EXPIRES = '03-01-2500';

@Injectable()
export class MidiaService {
  constructor(private readonly firebaseService: FirebaseService) {}

  getPathFromUrl(url: string): string {
    const decodedUrl = decodeURIComponent(url);
    const markerIndex = decodedUrl.indexOf('/o/');

    if (markerIndex >= 0) {
      const start = markerIndex + 3;
      const end = decodedUrl.indexOf('?');
      return decodedUrl.substring(start, end >= 0 ? end : decodedUrl.length);
    }

    const pathname = new URL(decodedUrl).pathname;
    return pathname.replace(/^\//, '');
  }

  private get bucket() {
    return admin.storage().bucket();
  }

  async uploadImage(file: any, folder: string, userId: string) {
    const safeFolder = folder || 'uploads';
    const path = `${safeFolder}/${Date.now()}-${file.originalname}`;

    const storageFile = this.bucket.file(path);

    await storageFile.save(file.buffer, {
      contentType: file.mimetype,
      resumable: false,
    });

    const [url] = await storageFile.getSignedUrl({
      action: 'read',
      expires: SIGNED_URL_EXPIRES,
    });

    await this.saveMidia({
      url,
      userId,
      folder: safeFolder,
      path,
    });

    return { url };
  }

  async uploadMultipleImages(files: any[], folder: string, userId: string) {
    const uploadPromises = files.map((file) =>
      this.uploadImage(file, folder, userId),
    );

    return Promise.all(uploadPromises);
  }

  async getMidia(
    userId: string,
    limitNumber: number,
    page = 1,
    folder?: string,
  ) {
    const filters: QueryFilter[] = [
      {
        field: 'userId',
        operator: '==',
        value: userId,
      },
    ];

    if (folder) {
      filters.push({
        field: 'folder',
        operator: '==',
        value: folder,
      });
    }

    const result = await this.firebaseService.findPaginated<MidiaInterface>(
      COLLECTION_NAME,
      {
        filters,
        page,
        limit: limitNumber,
      },
    );

    return {
      data: result.data,
      nextCursor: result.pagination.hasNextPage
        ? result.pagination.currentPage + 1
        : undefined,
    };
  }

  async saveMidia(props: MidiaInterface) {
    return this.firebaseService.create(
      COLLECTION_NAME,
      props as unknown as Record<string, unknown>,
    );
  }

  async deleteMidia(item: MidiaInterface) {
    try {
      const path = item.path || this.getPathFromUrl(item.url);
      const fileRef = this.bucket.file(path);

      await fileRef.delete();

      if (item.id) {
        await this.firebaseService.delete(COLLECTION_NAME, item.id);
      }

      return true;
    } catch {
      return false;
    }
  }

  async deleteMidiaFromUrl(url: string, userId: string) {
    try {
      const items = await this.firebaseService.findAll<MidiaInterface>(
        COLLECTION_NAME,
        {
          filters: [
            {
              field: 'url',
              operator: '==',
              value: url,
            },
            {
              field: 'userId',
              operator: '==',
              value: userId,
            },
          ],
        },
      );

      if (!items.length) return true;

      const path = items[0].path || this.getPathFromUrl(url);
      await this.bucket.file(path).delete();

      await this.firebaseService.batchDelete(
        COLLECTION_NAME,
        items.map((item) => item.id),
      );

      return true;
    } catch {
      return false;
    }
  }

  async deleteMidiaById(id: string, userId: string) {
    const item = (await this.firebaseService.findById(
      COLLECTION_NAME,
      id,
    )) as unknown as MidiaInterface | null;

    if (!(item?.userId === userId)) {
      return false;
    }

    return this.deleteMidia(item);
  }

  async getFolders(userId: string) {
    const docs = await this.firebaseService.findAll<MidiaInterface>(
      COLLECTION_NAME,
      {
        filters: [
          {
            field: 'userId',
            operator: '==',
            value: userId,
          },
        ],
      },
    );

    const folders = new Map<string, number>();

    docs.forEach((doc) => {
      if (!doc.folder) return;
      folders.set(doc.folder, (folders.get(doc.folder) ?? 0) + 1);
    });

    return Array.from(folders.entries())
      .map(([folder, count]) => ({ folder, count }))
      .sort((a, b) => a.folder.localeCompare(b.folder, 'pt-BR'));
  }
}
