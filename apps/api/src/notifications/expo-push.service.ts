import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/nestjs';
import { logger } from '@sentry/nestjs';
import Expo, { type ExpoPushMessage } from 'expo-server-sdk';
import { PrismaService } from 'src/prisma';

@Injectable()
export class ExpoPushService {
  private readonly expo: Expo;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.expo = new Expo({
      accessToken: this.configService.get<string>('EXPO_ACCESS_TOKEN'),
    });
  }

  async sendToTokens(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ): Promise<number> {
    if (!tokens.length) return 0;

    const validTokens = tokens.filter((token) => {
      if (Expo.isExpoPushToken(token)) return true;
      logger.warn('expo_push.invalid_token', { token });
      return false;
    });

    if (!validTokens.length) {
      logger.warn('expo_push.no_valid_tokens', { totalTokens: tokens.length });
      return 0;
    }

    const messages: ExpoPushMessage[] = validTokens.map((token) => ({
      to: token,
      title,
      body,
      sound: 'default',
      ...(data ? { data } : {}),
    }));

    const chunks = this.expo.chunkPushNotifications(messages);

    logger.info('expo_push.send.started', {
      totalTokens: validTokens.length,
      totalChunks: chunks.length,
    });

    let successCount = 0;
    const expiredTokens: string[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunkIndex = i + 1;
      const chunk = chunks[i];

      try {
        const tickets = await this.expo.sendPushNotificationsAsync(chunk);

        for (let j = 0; j < tickets.length; j++) {
          const ticket = tickets[j];
          const token = chunk[j].to as string;

          if (ticket.status === 'ok') {
            successCount++;
            continue;
          }

          const errorCode = ticket.details?.error ?? 'unknown';

          logger.warn('expo_push.ticket.error', {
            chunkIndex,
            errorCode,
            message: ticket.message ?? 'unknown',
          });

          if (errorCode === 'DeviceNotRegistered') {
            expiredTokens.push(token);
          } else {
            Sentry.withScope((scope) => {
              scope.setTag('module', 'expo_push');
              scope.setTag('operation', 'send_chunk');
              scope.setExtra('chunkIndex', chunkIndex);
              scope.setExtra('errorCode', errorCode);
              scope.setExtra('message', ticket.message);
              Sentry.captureMessage(
                `Expo push ticket error: ${errorCode}`,
                'warning',
              );
            });
          }
        }

        logger.info('expo_push.chunk.completed', {
          chunkIndex,
          chunkSize: chunk.length,
          success: tickets.filter((t) => t.status === 'ok').length,
          errors: tickets.filter((t) => t.status === 'error').length,
        });
      } catch (error) {
        logger.error('expo_push.chunk.failed', {
          chunkIndex,
          chunkSize: chunk.length,
        });

        Sentry.withScope((scope) => {
          scope.setTag('module', 'expo_push');
          scope.setTag('operation', 'send_chunk');
          scope.setExtra('chunkIndex', chunkIndex);
          scope.setExtra('chunkSize', chunk.length);
          Sentry.captureException(error);
        });
      }
    }

    if (expiredTokens.length) {
      await this.cleanupExpiredTokens(expiredTokens);
    }

    logger.info('expo_push.send.finished', {
      totalTokens: validTokens.length,
      successCount,
      expiredTokensRemoved: expiredTokens.length,
    });

    return successCount;
  }

  private async cleanupExpiredTokens(tokens: string[]): Promise<void> {
    try {
      const { count } = await this.prismaService.userPushToken.deleteMany({
        where: { token: { in: tokens } },
      });
      logger.info('expo_push.tokens.cleaned_up', { count });
    } catch (error) {
      logger.error('expo_push.tokens.cleanup_failed');
      Sentry.captureException(error);
    }
  }
}
