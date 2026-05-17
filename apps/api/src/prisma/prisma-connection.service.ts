import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { prisma } from './prisma.client';

@Injectable()
export class PrismaConnectionService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaConnectionService.name);
  private isConnected = false;

  async onModuleInit() {
    if (!process.env.DATABASE_URL) {
      this.logger.warn(
        'DATABASE_URL nao configurada. Prisma iniciara desconectado ate a configuracao do banco.',
      );
      return;
    }

    await prisma.$connect();
    this.isConnected = true;
  }

  async onModuleDestroy() {
    if (!this.isConnected) {
      return;
    }

    await prisma.$disconnect();
  }
}
