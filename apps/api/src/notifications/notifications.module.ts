import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { ExpoPushService } from './expo-push.service';
import { AdminRoleGuard, SchoolRoleGuard } from 'src/common';

@Module({
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    ExpoPushService,
    AdminRoleGuard,
    SchoolRoleGuard,
  ],
})
export class NotificationsModule {}
