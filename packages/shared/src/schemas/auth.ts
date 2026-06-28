import { z } from 'zod';
import { id } from './common';

/** Payload de cadastro de um novo usuário. */
export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Informe seu nome').max(120),
  email: z.string().trim().email('E-mail inválido').max(200),
  password: z.string().min(8, 'A senha deve ter ao menos 8 caracteres').max(200),
});
export type RegisterInput = z.infer<typeof registerSchema>;

/** Payload de login. */
export const loginSchema = z.object({
  email: z.string().trim().email('E-mail inválido').max(200),
  password: z.string().min(1, 'Informe a senha').max(200),
});
export type LoginInput = z.infer<typeof loginSchema>;

/** Atualização de perfil (campos opcionais; `null` limpa o opcional). */
export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(1, 'Informe seu nome').max(120),
    occupation: z.string().trim().max(120).nullable(),
    avatarUrl: z.string().trim().url('URL inválida').max(500).nullable(),
  })
  .partial();
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/** DTO público de um usuário (nunca inclui `passwordHash`). */
export const userDto = z.object({
  id: id,
  name: z.string(),
  email: z.string(),
  occupation: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  createdAt: z.string(),
});
export type UserDto = z.infer<typeof userDto>;

/** Resposta de cadastro/login: token JWT + usuário. */
export const authResponseDto = z.object({
  token: z.string(),
  user: userDto,
});
export type AuthResponseDto = z.infer<typeof authResponseDto>;
