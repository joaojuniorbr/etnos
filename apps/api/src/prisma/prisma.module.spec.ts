import { Test } from '@nestjs/testing';
import { PrismaConnectionService } from './prisma-connection.service';
import { prisma } from './prisma.client';
import { PrismaModule } from './prisma.module';
import { PrismaService } from './prisma.service';

describe('PrismaModule', () => {
  it('deve exportar o singleton prisma como PrismaService', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [PrismaModule],
    }).compile();

    const injected = moduleRef.get(PrismaService);

    expect(injected).toBe(prisma);
    expect(injected).toHaveProperty('$connect');
    expect(moduleRef.get(PrismaConnectionService)).toBeInstanceOf(
      PrismaConnectionService,
    );
  });
});
