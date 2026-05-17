import { PrismaClient } from '@prisma/client';

const createPrismaClient = () =>
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development' &&
      process.env.PRISMA_LOG_QUERIES === 'true'
        ? ['query', 'warn', 'error']
        : ['warn', 'error'],
  });

const globalForPrisma = globalThis as typeof globalThis & {
  __etnosPrisma?: PrismaClient;
};

export const prisma = globalForPrisma.__etnosPrisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__etnosPrisma = prisma;
}
