/**
 * Ponto único de acesso ao Prisma Client em todo o monorepo.
 *
 * Em desenvolvimento, reaproveita a mesma instância entre hot-reloads
 * para evitar esgotar o pool de conexões do Postgres.
 */
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Reexporta tipos e enums gerados pelo Prisma para uso em toda a aplicação.
export * from '@prisma/client';
