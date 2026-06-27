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
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { ContactsService } from './contacts.service';

@ApiTags('contacts')
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contacts: ContactsService) {}

  @Get()
  list(@Query(new ZodValidationPipe(listContactsQuery)) query: ListContactsQuery) {
    return this.contacts.list(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contacts.findOne(id);
  }

  @Post()
  create(@Body(new ZodValidationPipe(createContactSchema)) input: CreateContactInput) {
    return this.contacts.create(input);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateContactSchema)) input: UpdateContactInput,
  ) {
    return this.contacts.update(id, input);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.contacts.remove(id);
  }
}
