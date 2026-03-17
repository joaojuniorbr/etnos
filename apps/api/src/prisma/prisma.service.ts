import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private isConnected = false;

  async onModuleInit() {
    if (!process.env.DATABASE_URL) {
      this.logger.warn(
        'DATABASE_URL nao configurada. Prisma iniciara desconectado ate a configuracao do banco.',
      );
      return;
    }

    await this.$connect();
    this.isConnected = true;
  }

  async onModuleDestroy() {
    if (!this.isConnected) {
      return;
    }

    await this.$disconnect();
  }
}
