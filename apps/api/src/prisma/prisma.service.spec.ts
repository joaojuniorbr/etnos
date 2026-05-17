jest.mock('@prisma/client', () => ({
  PrismaClient: class {
    async $connect() {
      return undefined;
    }

    async $disconnect() {
      return undefined;
    }
  },
}));

import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;

  afterEach(() => {
    if (originalDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = originalDatabaseUrl;
    }

    jest.restoreAllMocks();
  });

  it('deve iniciar desconectado quando DATABASE_URL nao existir', async () => {
    process.env.DATABASE_URL = '';

    const service = new PrismaService();
    const connectSpy = jest
      .spyOn(service, '$connect')
      .mockResolvedValue(undefined);

    await service.onModuleInit();

    expect(connectSpy).not.toHaveBeenCalled();
  });

  it('deve conectar quando DATABASE_URL existir', async () => {
    process.env.DATABASE_URL = 'postgresql://local:test@localhost:5432/test';

    const service = new PrismaService();
    const connectSpy = jest
      .spyOn(service, '$connect')
      .mockResolvedValue(undefined);

    await service.onModuleInit();

    expect(connectSpy).toHaveBeenCalled();
  });

  it('nao deve desconectar se ainda nao estiver conectado', async () => {
    const service = new PrismaService();
    const disconnectSpy = jest
      .spyOn(service, '$disconnect')
      .mockResolvedValue(undefined);

    await service.onModuleDestroy();

    expect(disconnectSpy).not.toHaveBeenCalled();
  });

  it('deve desconectar quando a conexao estiver ativa', async () => {
    process.env.DATABASE_URL = 'postgresql://local:test@localhost:5432/test';

    const service = new PrismaService();
    jest.spyOn(service, '$connect').mockResolvedValue(undefined);
    const disconnectSpy = jest
      .spyOn(service, '$disconnect')
      .mockResolvedValue(undefined);

    await service.onModuleInit();
    await service.onModuleDestroy();

    expect(disconnectSpy).toHaveBeenCalled();
  });
});
