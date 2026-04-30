import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  AdminUserInterface,
  UpdateAdminUserPayload,
  UserRole,
} from '@etnos/types';
import { PrismaService } from 'src/prisma';

const VALID_ROLES: UserRole[] = ['admin', 'school', 'student', 'teacher'];

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  private mapUser(user: {
    id: string;
    firebaseUid: string;
    email?: string | null;
    parentName?: string | null;
    childName?: string | null;
    school?: string | null;
    roles: string[];
    isActive: boolean;
    notificationsEnabled: boolean;
    createdAt: Date;
    updatedAt: Date;
    schoolName?: string | null;
    pushTokens?: { token: string }[];
  }): AdminUserInterface {
    return {
      id: user.id,
      uid: user.firebaseUid,
      email: user.email,
      parentName: user.parentName,
      childName: user.childName,
      school: user.school,
      schoolName: user.schoolName ?? null,
      roles: user.roles as UserRole[],
      isActive: user.isActive,
      hasPushToken: Boolean(user.pushTokens?.length),
      expoPushToken: user.pushTokens?.[0]?.token ?? null,
      notificationsEnabled: user.notificationsEnabled,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private normalizeRoles(roles?: UserRole[]) {
    if (!roles) {
      return undefined;
    }

    const normalizedRoles = Array.from(new Set(roles));

    if (!normalizedRoles.length) {
      throw new BadRequestException('O usuario precisa ter ao menos um perfil.');
    }

    const invalidRole = normalizedRoles.find(
      (role) => !VALID_ROLES.includes(role),
    );

    if (invalidRole) {
      throw new BadRequestException(`Perfil invalido: ${invalidRole}.`);
    }

    return normalizedRoles;
  }

  private async getRequester(firebaseUid: string) {
    const requester = await this.prismaService.user.findUnique({
      where: { firebaseUid },
      select: {
        id: true,
        firebaseUid: true,
        school: true,
        roles: true,
        isActive: true,
        schoolAccesses: {
          select: { schoolId: true },
        },
      },
    });

    if (!requester?.isActive) {
      throw new ForbiddenException('Conta desativada.');
    }

    return requester;
  }

  private getManagedSchoolIds(requester: Awaited<ReturnType<UsersService['getRequester']>>) {
    return Array.from(
      new Set([
        ...(requester.school ? [requester.school] : []),
        ...requester.schoolAccesses.map((access) => access.schoolId),
      ]),
    );
  }

  async findAll(filters?: {
    schoolId?: string;
    search?: string;
    hasPushToken?: boolean;
  }): Promise<AdminUserInterface[]> {
    const normalizedSearch = filters?.search?.trim();

    const users = await this.prismaService.user.findMany({
      where: {
        ...(filters?.schoolId ? { school: filters.schoolId } : {}),
        ...(filters?.hasPushToken
          ? { notificationsEnabled: true, pushTokens: { some: {} } }
          : {}),
        ...(normalizedSearch
          ? {
              OR: [
                { email: { contains: normalizedSearch, mode: 'insensitive' } },
                {
                  parentName: {
                    contains: normalizedSearch,
                    mode: 'insensitive',
                  },
                },
                {
                  childName: {
                    contains: normalizedSearch,
                    mode: 'insensitive',
                  },
                },
                {
                  firebaseUid: {
                    contains: normalizedSearch,
                    mode: 'insensitive',
                  },
                },
              ],
            }
          : {}),
      },
      include: {
        pushTokens: {
          orderBy: { updatedAt: 'desc' },
          select: { token: true },
          take: 1,
        },
      },
      orderBy: [{ createdAt: 'desc' }, { email: 'asc' }],
    });

    const schoolIds = Array.from(
      new Set(users.map((user) => user.school).filter(Boolean)),
    ) as string[];
    const schools = schoolIds.length
      ? await this.prismaService.school.findMany({
          where: { id: { in: schoolIds } },
          select: { id: true, name: true },
        })
      : [];
    const schoolNameById = new Map(
      schools.map((school) => [school.id, school.name]),
    );

    return users.map((user) =>
      this.mapUser({
        ...user,
        schoolName: user.school ? schoolNameById.get(user.school) ?? null : null,
      }),
    );
  }

  async updateUser(
    requesterFirebaseUid: string,
    userId: string,
    payload: UpdateAdminUserPayload,
  ) {
    const requester = await this.getRequester(requesterFirebaseUid);
    const target = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!target) {
      throw new NotFoundException('Usuario nao encontrado.');
    }

    if (target.firebaseUid === requester.firebaseUid) {
      throw new ForbiddenException('Nao e possivel alterar o proprio perfil.');
    }

    const isAdmin = requester.roles.includes('admin');
    const roles = this.normalizeRoles(payload.roles);

    if (!isAdmin) {
      if (!requester.roles.includes('school')) {
        throw new ForbiddenException('Perfil sem permissao para editar usuarios.');
      }

      const managedSchoolIds = this.getManagedSchoolIds(requester);
      const targetSchool = payload.school ?? target.school;

      if (!targetSchool || !managedSchoolIds.includes(targetSchool)) {
        throw new ForbiddenException(
          'Usuario fora das escolas gerenciadas pelo perfil.',
        );
      }

      if (payload.isActive !== undefined) {
        throw new ForbiddenException(
          'Administradores de escola nao podem alterar status da conta.',
        );
      }

      if (roles?.some((role) => role === 'admin' || role === 'school')) {
        throw new ForbiddenException(
          'Administradores de escola so podem alternar entre aluno e professor.',
        );
      }
    }

    const updated = await this.prismaService.user.update({
      where: { id: userId },
      data: {
        ...(roles ? { roles } : {}),
        ...(payload.school !== undefined ? { school: payload.school } : {}),
        ...(payload.isActive !== undefined
          ? { isActive: payload.isActive }
          : {}),
      },
    });

    const school = updated.school
      ? await this.prismaService.school.findUnique({
          where: { id: updated.school },
          select: { name: true },
        })
      : null;

    return this.mapUser({ ...updated, schoolName: school?.name ?? null });
  }
}
