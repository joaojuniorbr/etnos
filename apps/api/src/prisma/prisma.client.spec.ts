describe('prisma.client', () => {
  const PrismaClientMock = jest.fn().mockImplementation(() => ({}));
  const globalForPrisma = globalThis as typeof globalThis & {
    __etnosPrisma?: unknown;
  };

  const originalNodeEnv = process.env.NODE_ENV;
  const originalPrismaLogQueries = process.env.PRISMA_LOG_QUERIES;

  const loadPrismaModule = () => {
    let prismaExport: { prisma: unknown };

    jest.isolateModules(() => {
      jest.doMock('@prisma/client', () => ({
        PrismaClient: PrismaClientMock,
      }));
      prismaExport = require('./prisma.client');
    });

    return prismaExport.prisma;
  };

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    delete globalForPrisma.__etnosPrisma;

    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }

    if (originalPrismaLogQueries === undefined) {
      delete process.env.PRISMA_LOG_QUERIES;
    } else {
      process.env.PRISMA_LOG_QUERIES = originalPrismaLogQueries;
    }
  });

  afterAll(() => {
    delete globalForPrisma.__etnosPrisma;

    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }

    if (originalPrismaLogQueries === undefined) {
      delete process.env.PRISMA_LOG_QUERIES;
    } else {
      process.env.PRISMA_LOG_QUERIES = originalPrismaLogQueries;
    }
  });

  it('deve criar o client com logs padrao fora de development', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.PRISMA_LOG_QUERIES;

    loadPrismaModule();

    expect(PrismaClientMock).toHaveBeenCalledWith({
      log: ['warn', 'error'],
    });
    expect(globalForPrisma.__etnosPrisma).toBeUndefined();
  });

  it('deve criar o client com logs de query em development quando PRISMA_LOG_QUERIES=true', () => {
    process.env.NODE_ENV = 'development';
    process.env.PRISMA_LOG_QUERIES = 'true';

    loadPrismaModule();

    expect(PrismaClientMock).toHaveBeenCalledWith({
      log: ['query', 'warn', 'error'],
    });
  });

  it('deve criar o client com logs padrao em development sem PRISMA_LOG_QUERIES', () => {
    process.env.NODE_ENV = 'development';
    delete process.env.PRISMA_LOG_QUERIES;

    loadPrismaModule();

    expect(PrismaClientMock).toHaveBeenCalledWith({
      log: ['warn', 'error'],
    });
  });

  it('deve reutilizar o singleton global quando ja existir', () => {
    const existingClient = { marker: 'existing-singleton' };
    globalForPrisma.__etnosPrisma = existingClient;
    process.env.NODE_ENV = 'test';

    const prisma = loadPrismaModule();

    expect(prisma).toBe(existingClient);
    expect(PrismaClientMock).not.toHaveBeenCalled();
  });

  it('deve registrar o singleton global fora de production', () => {
    process.env.NODE_ENV = 'test';

    const prisma = loadPrismaModule();

    expect(globalForPrisma.__etnosPrisma).toBe(prisma);
  });
});
