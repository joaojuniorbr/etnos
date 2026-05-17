import { Module } from '@nestjs/common';
import { SentryGlobalFilter } from '@sentry/nestjs/setup';
import { ConfigModule } from '@nestjs/config';
import { isSentryEnabled } from './sentry/sentry.config';
import { AuthModule } from './auth';
import { FirebaseModule } from './firebase';
import { GamesModule } from './games/games.module';
import { CharactersModule } from './characters/characters.module';
import { PublicModule } from './public/public.module';
import { EmailModule } from './email/email.module';
import { SchoolsModule } from './schools/schools.module';
import { MidiaModule } from './midia/midia.module';
import { UsersModule } from './users';
import { NotificationsModule } from './notifications/notifications.module';
import { PrismaModule } from './prisma';
import { MetricsModule } from './metrics';
import { APP_FILTER } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    FirebaseModule,
    GamesModule,
    CharactersModule,
    SchoolsModule,
    PublicModule,
    EmailModule,
    MidiaModule,
    UsersModule,
    NotificationsModule,
    MetricsModule,
  ],
  controllers: [],
  providers: [
    ...(isSentryEnabled()
      ? [
          {
            provide: APP_FILTER,
            useClass: SentryGlobalFilter,
          },
        ]
      : []),
  ],
})
export class AppModule {}
