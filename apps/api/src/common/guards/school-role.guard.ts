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
      select: { roles: true, school: true },
    });

    if (!user?.roles?.some((role) => role === 'admin' || role === 'school')) {
      throw new ForbiddenException(
        'Acesso restrito a administradores e perfis de escola.',
      );
    }

    request.currentUserProfile = user;

    return true;
  }
}
