import { BadRequestException, type PipeTransform } from '@nestjs/common';
import type { ZodSchema } from 'zod';

/**
 * Valida o payload de entrada usando um schema Zod do pacote @daily-hub/shared.
 * Uso: @UsePipes(new ZodValidationPipe(createTaskSchema))
 */
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        message: 'Falha de validação',
        errors: result.error.flatten().fieldErrors,
      });
    }
    return result.data;
  }
}
