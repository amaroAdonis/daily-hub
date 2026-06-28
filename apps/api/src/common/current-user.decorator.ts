import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

/** Usuário autenticado anexado à requisição pela JwtStrategy. */
export interface AuthUser {
  id: string;
  email: string;
}

/**
 * Injeta o usuário autenticado (ou uma de suas propriedades).
 * Uso: `@CurrentUser() user: AuthUser` ou `@CurrentUser('id') userId: string`.
 */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthUser }>();
    return data ? request.user?.[data] : request.user;
  },
);
