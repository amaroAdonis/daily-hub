import { Module } from '@nestjs/common';
import { IntegrationModule } from '../integration/integration.module';
import { AttachmentsController } from './attachments.controller';
import { AttachmentsService } from './attachments.service';
import { StorageService } from './storage.service';

@Module({
  imports: [IntegrationModule],
  controllers: [AttachmentsController],
  providers: [AttachmentsService, StorageService],
})
export class AttachmentsModule {}
