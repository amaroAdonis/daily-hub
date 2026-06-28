import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import type {
  AuthResponseDto,
  LoginInput,
  RegisterInput,
  UpdateProfileInput,
  UserDto,
} from '@daily-hub/shared';
import type { User } from '@daily-hub/db';
import { PrismaService } from '../../prisma/prisma.service';
import type { JwtPayload } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  /** Projeta o usuário no DTO público, sem o `passwordHash`. */
  private toDto(user: User): UserDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      occupation: user.occupation,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt.toISOString(),
    };
  }

  /** Assina um JWT para o usuário e monta a resposta de auth. */
  private sign(user: User): AuthResponseDto {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    return { token: this.jwt.sign(payload), user: this.toDto(user) };
  }

  async register(input: RegisterInput): Promise<AuthResponseDto> {
    const email = input.email.toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Já existe uma conta com este e-mail');

    const passwordHash = await argon2.hash(input.password);
    const user = await this.prisma.user.create({
      data: { name: input.name, email, passwordHash },
    });
    return this.sign(user);
  }

  async login(input: LoginInput): Promise<AuthResponseDto> {
    const email = input.email.toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('E-mail ou senha inválidos');

    const valid = await argon2.verify(user.passwordHash, input.password);
    if (!valid) throw new UnauthorizedException('E-mail ou senha inválidos');

    return this.sign(user);
  }

  async getProfile(userId: string): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return this.toDto(user);
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<UserDto> {
    const existing = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!existing) throw new NotFoundException('Usuário não encontrado');

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: input.name,
        occupation: input.occupation,
        avatarUrl: input.avatarUrl,
      },
    });
    return this.toDto(user);
  }
}
