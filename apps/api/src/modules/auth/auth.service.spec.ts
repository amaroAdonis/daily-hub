import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { AuthService } from './auth.service';
import type { PrismaService } from '../../prisma/prisma.service';
import type { JwtService } from '@nestjs/jwt';

vi.mock('argon2', () => ({
  hash: vi.fn().mockResolvedValue('hashed'),
  verify: vi.fn(),
}));

function makePrisma() {
  return {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  };
}

function makeJwt() {
  return { sign: vi.fn().mockReturnValue('signed-token') };
}

function userRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-1',
    name: 'Você',
    email: 'voce@daily-hub.dev',
    passwordHash: 'hashed',
    occupation: null,
    avatarUrl: null,
    createdAt: new Date('2026-06-01T10:00:00.000Z'),
    updatedAt: new Date('2026-06-01T10:00:00.000Z'),
    ...overrides,
  };
}

describe('AuthService', () => {
  let prisma: ReturnType<typeof makePrisma>;
  let jwt: ReturnType<typeof makeJwt>;
  let service: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    prisma = makePrisma();
    jwt = makeJwt();
    service = new AuthService(prisma as unknown as PrismaService, jwt as unknown as JwtService);
  });

  it('cadastra um usuário com senha em hash e retorna token + DTO sem passwordHash', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue(userRow());

    const result = await service.register({
      name: 'Você',
      email: 'Voce@Daily-Hub.dev',
      password: 'segredo123',
    });

    expect(argon2.hash).toHaveBeenCalledWith('segredo123');
    // E-mail normalizado em minúsculas ao persistir.
    expect(prisma.user.create.mock.calls[0]![0].data).toMatchObject({
      email: 'voce@daily-hub.dev',
      passwordHash: 'hashed',
    });
    expect(result.token).toBe('signed-token');
    expect(result.user).not.toHaveProperty('passwordHash');
    expect(result.user.email).toBe('voce@daily-hub.dev');
  });

  it('rejeita cadastro com e-mail já existente', async () => {
    prisma.user.findUnique.mockResolvedValue(userRow());

    await expect(
      service.register({ name: 'X', email: 'voce@daily-hub.dev', password: 'segredo123' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('faz login quando a senha confere', async () => {
    prisma.user.findUnique.mockResolvedValue(userRow());
    vi.mocked(argon2.verify).mockResolvedValue(true);

    const result = await service.login({ email: 'voce@daily-hub.dev', password: 'segredo123' });

    expect(argon2.verify).toHaveBeenCalledWith('hashed', 'segredo123');
    expect(result.token).toBe('signed-token');
  });

  it('rejeita login com senha incorreta', async () => {
    prisma.user.findUnique.mockResolvedValue(userRow());
    vi.mocked(argon2.verify).mockResolvedValue(false);

    await expect(
      service.login({ email: 'voce@daily-hub.dev', password: 'errada' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejeita login de e-mail inexistente', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.login({ email: 'ninguem@daily-hub.dev', password: 'x' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
