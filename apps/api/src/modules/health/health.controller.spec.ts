import { describe, it, expect, vi } from 'vitest';
import { HealthController } from './health.controller';
import type { PrismaService } from '../../prisma/prisma.service';

describe('HealthController', () => {
  it('retorna status ok quando o banco responde', async () => {
    const prisma = { $queryRaw: vi.fn().mockResolvedValue([{ '?column?': 1 }]) };
    const controller = new HealthController(prisma as unknown as PrismaService);

    const result = await controller.check();

    expect(result.status).toBe('ok');
    expect(prisma.$queryRaw).toHaveBeenCalled();
  });
});
