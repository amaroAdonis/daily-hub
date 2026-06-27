import { Injectable, type OnModuleInit, type OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@daily-hub/db';

/**
 * Expõe o Prisma Client como provider injetável do Nest,
 * cuidando do ciclo de vida da conexão.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
