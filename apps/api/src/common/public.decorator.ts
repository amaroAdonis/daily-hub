import { SetMetadata } from '@nestjs/common';

/** Chave de metadata que marca uma rota como pública (sem JwtAuthGuard). */
export const IS_PUBLIC_KEY = 'isPublic';

/** Marca um handler ou controller como acessível sem autenticação. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
