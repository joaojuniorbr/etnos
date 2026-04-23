import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma';

@Injectable()
export class SchoolRoleGuard implements CanActivate {
  constructor(private readonly prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authenticatedUserId = request.user?.uid;

    if (!authenticatedUserId) {
      throw new ForbiddenException('Usuario autenticado nao encontrado.');
    }

    const user = await this.prismaService.user.findUnique({
      where: { firebaseUid: authenticatedUserId },
      select: { roles: true, school: true, isActive: true },
    });

    if (!user || user.isActive === false) {
      throw new ForbiddenException('Conta desativada.');
    }

    if (
      !user?.roles?.some(
        (role) => role === 'admin' || role === 'school' || role === 'teacher',
      )
    ) {
      throw new ForbiddenException(
        'Acesso restrito a administradores, escolas e professores.',
      );
    }

    request.currentUserProfile = user;

    return true;
  }
}
