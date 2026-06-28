import { Body, Controller, Delete, Get, HttpCode, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  createAttachmentSchema,
  listAttachmentsQuery,
  presignUploadSchema,
  type CreateAttachmentInput,
  type ListAttachmentsQuery,
  type PresignUploadInput,
} from '@daily-hub/shared';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { CurrentUser } from '../../common/current-user.decorator';
import { AttachmentsService } from './attachments.service';

@ApiTags('attachments')
@ApiBearerAuth()
@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachments: AttachmentsService) {}

  @Get()
  list(
    @CurrentUser('id') userId: string,
    @Query(new ZodValidationPipe(listAttachmentsQuery)) query: ListAttachmentsQuery,
  ) {
    return this.attachments.list(userId, query);
  }

  /** Gera a URL assinada para o cliente enviar o arquivo direto ao storage. */
  @Post('presign')
  presign(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(presignUploadSchema)) input: PresignUploadInput,
  ) {
    return this.attachments.presignUpload(userId, input);
  }

  /** Registra os metadados do anexo após o upload concluído. */
  @Post()
  create(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(createAttachmentSchema)) input: CreateAttachmentInput,
  ) {
    return this.attachments.create(userId, input);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.attachments.remove(userId, id);
  }
}
