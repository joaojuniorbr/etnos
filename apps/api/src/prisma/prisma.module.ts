import { Global, Module } from '@nestjs/common';
import { PrismaConnectionService } from './prisma-connection.service';
import { prisma } from './prisma.client';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [
    PrismaConnectionService,
    {
      provide: PrismaService,
      useValue: prisma,
    },
  ],
  exports: [PrismaService],
})
export class PrismaModule {}
