import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  createContactSchema,
  listContactsQuery,
  updateContactSchema,
  type CreateContactInput,
  type ListContactsQuery,
  type UpdateContactInput,
} from '@daily-hub/shared';
import { CurrentUser } from '../../common/current-user.decorator';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { ContactsService } from './contacts.service';

@ApiTags('contacts')
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contacts: ContactsService) {}

  @Get()
  list(
    @CurrentUser('id') userId: string,
    @Query(new ZodValidationPipe(listContactsQuery)) query: ListContactsQuery,
  ) {
    return this.contacts.list(userId, query);
  }

  @Get(':id')
  findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.contacts.findOne(userId, id);
  }

  @Post()
  create(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(createContactSchema)) input: CreateContactInput,
  ) {
    return this.contacts.create(userId, input);
  }

  @Patch(':id')
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateContactSchema)) input: UpdateContactInput,
  ) {
    return this.contacts.update(userId, id, input);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.contacts.remove(userId, id);
  }
}
