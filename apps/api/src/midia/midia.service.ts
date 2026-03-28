import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import type { MidiaInterface } from '@etnos/types';
import { PrismaService } from 'src/prisma';
const SIGNED_URL_EXPIRES = '03-01-2500';

@Injectable()
export class MidiaService {
  constructor(private readonly prismaService: PrismaService) {}

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
    userId: string | undefined,
    limitNumber: number,
    page = 1,
    folder?: string,
  ) {
    const where = {
      ...(userId ? { userId } : {}),
      ...(folder ? { folder } : {}),
    };
    const skip = (Math.max(page, 1) - 1) * limitNumber;
    const [data, total] = await Promise.all([
      this.prismaService.midia.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prismaService.midia.count({ where }),
    ]);

    return {
      data,
      nextCursor: skip + data.length < total ? page + 1 : undefined,
    };
  }

  async saveMidia(props: MidiaInterface) {
    return this.prismaService.midia.create({
      data: {
        id: props.id,
        url: props.url,
        userId: props.userId,
        folder: props.folder,
        path: props.path,
      },
    });
  }

  async deleteMidia(item: MidiaInterface) {
    try {
      const path = item.path || this.getPathFromUrl(item.url);
      const fileRef = this.bucket.file(path);

      await fileRef.delete();

      if (item.id) {
        await this.prismaService.midia.delete({
          where: { id: item.id },
        });
      }

      return true;
    } catch {
      return false;
    }
  }

  async deleteMidiaFromUrl(url: string, userId?: string) {
    try {
      const items = await this.prismaService.midia.findMany({
        where: {
          url,
          ...(userId ? { userId } : {}),
        },
      });

      if (!items.length) return true;

      const path = items[0].path || this.getPathFromUrl(url);
      await this.bucket.file(path).delete();

      await this.prismaService.midia.deleteMany({
        where: {
          id: {
            in: items.map((item) => item.id),
          },
        },
      });

      return true;
    } catch {
      return false;
    }
  }

  async deleteMidiaById(id: string, userId?: string) {
    const item = await this.prismaService.midia.findUnique({
      where: { id },
    });

    if (!item) {
      return false;
    }

    if (userId && item.userId !== userId) {
      return false;
    }

    return this.deleteMidia(item);
  }

  async getFolders(userId?: string) {
    const docs = await this.prismaService.midia.findMany({
      where: userId ? { userId } : {},
      select: { folder: true },
    });

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
