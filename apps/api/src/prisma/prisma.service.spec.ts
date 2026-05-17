const mockConnect = jest.fn().mockResolvedValue(undefined);
const mockDisconnect = jest.fn().mockResolvedValue(undefined);

jest.mock('./prisma.client', () => ({
  prisma: {
    $connect: mockConnect,
    $disconnect: mockDisconnect,
  },
}));

import { PrismaConnectionService } from './prisma-connection.service';

describe('PrismaConnectionService', () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;

  beforeEach(() => {
    mockConnect.mockClear();
    mockDisconnect.mockClear();
  });

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

    const service = new PrismaConnectionService();

    await service.onModuleInit();

    expect(mockConnect).not.toHaveBeenCalled();
  });

  it('deve conectar quando DATABASE_URL existir', async () => {
    process.env.DATABASE_URL = 'postgresql://local:test@localhost:5432/test';

    const service = new PrismaConnectionService();

    await service.onModuleInit();

    expect(mockConnect).toHaveBeenCalled();
  });

  it('nao deve desconectar se ainda nao estiver conectado', async () => {
    const service = new PrismaConnectionService();

    await service.onModuleDestroy();

    expect(mockDisconnect).not.toHaveBeenCalled();
  });

  it('deve desconectar quando a conexao estiver ativa', async () => {
    process.env.DATABASE_URL = 'postgresql://local:test@localhost:5432/test';

    const service = new PrismaConnectionService();

    await service.onModuleInit();
    await service.onModuleDestroy();

    expect(mockDisconnect).toHaveBeenCalled();
  });
});
