import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { logger } from '@sentry/nestjs';
import { PrismaService } from 'src/prisma';
import { ExpoPushService } from './expo-push.service';
import { NotificationTargetType } from './dto/send-notification.dto';
import { SendNotificationWithDeeplinkDto } from './dto/send-notification-with-deeplink.dto';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { RegisterPushTokenDto } from './dto/register-push-token.dto';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly expoPushService: ExpoPushService,
  ) {}

  async registerPushToken(firebaseUid: string, dto: RegisterPushTokenDto) {
    const user = await this.prismaService.user.findUnique({
      where: { firebaseUid },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    await this.prismaService.userPushToken.upsert({
      where: { token: dto.token },
      create: { userId: user.id, token: dto.token, platform: dto.platform },
      update: { userId: user.id, platform: dto.platform },
    });

    logger.info('notifications.push_token.registered', {
      userId: user.id,
      platform: dto.platform ?? 'unknown',
    });

    return { ok: true };
  }

  async send(firebaseUid: string, dto: SendNotificationWithDeeplinkDto) {
    const sender = await this.prismaService.user.findUnique({
      where: { firebaseUid },
      select: { id: true, email: true, roles: true, school: true },
    });

    if (!sender) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const isAdmin = sender.roles.includes('admin');
    const isSchoolRole = sender.roles.some(
      (r) => r === 'school' || r === 'teacher',
    );

    if (
      dto.targetType === NotificationTargetType.GLOBAL ||
      (dto.targetType === NotificationTargetType.INDIVIDUAL && dto.userId)
    ) {
      if (!isAdmin) {
        logger.warn('notifications.send.forbidden', {
          senderId: sender.id,
          targetType: dto.targetType,
          reason: 'non_admin_global_or_individual',
        });
        throw new ForbiddenException(
          'Apenas administradores podem enviar notificações globais ou individuais.',
        );
      }
    }

    if (dto.targetType === NotificationTargetType.SCHOOL) {
      if (!dto.schoolId) {
        throw new BadRequestException(
          'schoolId é obrigatório para notificações por escola.',
        );
      }

      if (!isAdmin && isSchoolRole) {
        const hasAccess = await this.prismaService.schoolAccess.findFirst({
          where: { userId: sender.id, schoolId: dto.schoolId },
        });

        if (!hasAccess) {
          logger.warn('notifications.send.forbidden', {
            senderId: sender.id,
            schoolId: dto.schoolId,
            reason: 'school_access_denied',
          });
          throw new ForbiddenException('Sem acesso à escola informada.');
        }
      } else if (!isAdmin) {
        throw new ForbiddenException('Sem permissão para enviar notificações.');
      }
    }

    logger.info('notifications.send.started', {
      senderId: sender.id,
      senderEmail: sender.email ?? undefined,
      targetType: dto.targetType,
      schoolId: dto.schoolId ?? undefined,
      userId: dto.userId ?? undefined,
    });

    const tokens = await this.resolveTokens(dto);

    logger.info('notifications.send.tokens_resolved', {
      targetType: dto.targetType,
      schoolId: dto.schoolId ?? undefined,
      tokenCount: tokens.length,
    });

    if (!tokens.length) {
      logger.warn('notifications.send.no_tokens', {
        targetType: dto.targetType,
        schoolId: dto.schoolId ?? undefined,
        userId: dto.userId ?? undefined,
      });
    }

    const notifData: Record<string, unknown> = { ...dto.data };
    if (dto.deeplink) {
      notifData.deeplink = dto.deeplink;
    }

    let successCount = 0;
    try {
      successCount = await this.expoPushService.sendToTokens(
        tokens,
        dto.title,
        dto.message,
        Object.keys(notifData).length ? notifData : undefined,
      );
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setTag('module', 'notifications');
        scope.setTag('operation', 'send');
        scope.setExtra('targetType', dto.targetType);
        scope.setExtra('senderId', sender.id);
        scope.setExtra('tokenCount', tokens.length);
        Sentry.captureException(error);
      });
      throw error;
    }

    let schoolName: string | null = null;
    if (dto.schoolId) {
      const school = await this.prismaService.school.findUnique({
        where: { id: dto.schoolId },
        select: { name: true },
      });
      schoolName = school?.name ?? null;
    }

    await this.prismaService.notificationLog.create({
      data: {
        title: dto.title,
        message: dto.message,
        targetType: dto.targetType,
        schoolId: dto.schoolId ?? null,
        schoolName,
        sentBy: sender.id,
        sentByEmail: sender.email ?? null,
        tokenCount: successCount,
      },
    });

    logger.info('notifications.send.completed', {
      senderId: sender.id,
      senderEmail: sender.email ?? undefined,
      targetType: dto.targetType,
      schoolId: dto.schoolId ?? undefined,
      schoolName: schoolName ?? undefined,
      tokensResolved: tokens.length,
      successCount,
    });

    return { ok: true, sent: successCount };
  }

  private async resolveTokens(
    dto: SendNotificationWithDeeplinkDto,
  ): Promise<string[]> {
    if (dto.targetType === NotificationTargetType.GLOBAL) {
      const tokens = await this.prismaService.userPushToken.findMany({
        select: { token: true },
      });
      return tokens.map((t) => t.token);
    }

    if (dto.targetType === NotificationTargetType.INDIVIDUAL && dto.userId) {
      const tokens = await this.prismaService.userPushToken.findMany({
        where: { userId: dto.userId },
        select: { token: true },
      });
      return tokens.map((t) => t.token);
    }

    if (dto.targetType === NotificationTargetType.SCHOOL && dto.schoolId) {
      const school = await this.prismaService.school.findUnique({
        where: { id: dto.schoolId },
        select: { id: true, code: true },
      });

      if (!school) return [];

      const users = await this.prismaService.user.findMany({
        where: {
          OR: [
            { school: school.id },
            ...(school.code ? [{ school: school.code }] : []),
          ],
        },
        select: { id: true },
      });

      if (!users.length) return [];

      const userIds = users.map((u) => u.id);
      const tokens = await this.prismaService.userPushToken.findMany({
        where: { userId: { in: userIds } },
        select: { token: true },
      });

      return tokens.map((t) => t.token);
    }

    return [];
  }

  async getHistory(firebaseUid: string) {
    const user = await this.prismaService.user.findUnique({
      where: { firebaseUid },
      select: { id: true, roles: true },
    });

    if (!user) throw new NotFoundException('Usuário não encontrado.');

    const isAdmin = user.roles.includes('admin');

    if (isAdmin) {
      return this.prismaService.notificationLog.findMany({
        orderBy: { sentAt: 'desc' },
        take: 200,
      });
    }

    const accesses = await this.prismaService.schoolAccess.findMany({
      where: { userId: user.id },
      select: { schoolId: true },
    });

    const schoolIds = accesses.map((a) => a.schoolId);

    return this.prismaService.notificationLog.findMany({
      where: { schoolId: { in: schoolIds } },
      orderBy: { sentAt: 'desc' },
      take: 200,
    });
  }

  async getTemplates() {
    return this.prismaService.notificationTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTemplate(firebaseUid: string, dto: CreateTemplateDto) {
    const template = await this.prismaService.notificationTemplate.create({
      data: {
        title: dto.title,
        message: dto.message,
        createdBy: firebaseUid,
      },
    });

    logger.info('notifications.template.created', {
      templateId: template.id,
      createdBy: firebaseUid,
    });

    return template;
  }

  async updateTemplate(id: string, dto: UpdateTemplateDto) {
    await this.findTemplateOrFail(id);

    const template = await this.prismaService.notificationTemplate.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.message !== undefined ? { message: dto.message } : {}),
      },
    });

    logger.info('notifications.template.updated', { templateId: id });

    return template;
  }

  async deleteTemplate(id: string) {
    await this.findTemplateOrFail(id);
    await this.prismaService.notificationTemplate.delete({ where: { id } });

    logger.info('notifications.template.deleted', { templateId: id });

    return { ok: true };
  }

  private async findTemplateOrFail(id: string) {
    const template = await this.prismaService.notificationTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('Template não encontrado.');
    }

    return template;
  }
}
