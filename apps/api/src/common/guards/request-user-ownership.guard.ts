import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class RequestUserOwnershipGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authenticatedUserId = request.user?.uid;

    if (!authenticatedUserId) {
      throw new ForbiddenException('Usuario autenticado nao encontrado.');
    }

    const userIds = [
      request.params?.userId,
      request.query?.userId,
      request.body?.userId,
      request.body?.uid,
    ].filter((value): value is string => typeof value === 'string' && !!value);

    const hasMismatchedUserId = userIds.some(
      (userId) => userId !== authenticatedUserId,
    );

    if (hasMismatchedUserId) {
      throw new ForbiddenException(
        'Nao e permitido acessar ou modificar dados de outro usuario.',
      );
    }

    return true;
  }
}
