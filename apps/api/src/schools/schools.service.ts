import { Injectable } from '@nestjs/common';
import type { SchoolInterface } from '@etnos/types';
import { PrismaService } from 'src/prisma';

@Injectable()
export class SchoolsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAll(): Promise<SchoolInterface[]> {
    return this.prismaService.school.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async create(school: SchoolInterface) {
    const exists = await this.prismaService.school.findUnique({
      where: { name: school.name },
    });

    if (exists) return null;

    const created = await this.prismaService.school.create({
      data: {
        name: school.name,
        city: school.city,
        state: school.state,
      },
    });

    return {
      id: created.id,
      ...school,
    };
  }

  async update(id: string, school: Partial<SchoolInterface>) {
    const existing =
      school.name === undefined
        ? null
        : await this.prismaService.school.findFirst({
            where: {
              name: school.name,
              city: school.city ?? null,
            },
          });

    if (existing && existing.id !== id) return null;

    await this.prismaService.school.update({
      where: { id },
      data: {
        name: school.name,
        city: school.city,
        state: school.state,
      },
    });

    return {
      id,
      ...school,
    };
  }

  async delete(id: string) {
    await this.prismaService.school.delete({
      where: { id },
    });

    return true;
  }

  async getOne(id: string): Promise<SchoolInterface | null> {
    return this.prismaService.school.findUnique({
      where: { id },
    });
  }
}
