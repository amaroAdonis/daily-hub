import type {
  ContactDto,
  CreateContactInput,
  ListContactsQuery,
  UpdateContactInput,
} from '@daily-hub/shared';
import { api } from '../../lib/api';

export const listContacts = (query: ListContactsQuery = {}) => {
  const params = new URLSearchParams();
  if (query.search) params.set('search', query.search);
  const qs = params.toString();
  return api<ContactDto[]>(`/contacts${qs ? `?${qs}` : ''}`);
};

export const createContact = (input: CreateContactInput) =>
  api<ContactDto>('/contacts', { method: 'POST', body: JSON.stringify(input) });

export const updateContact = (id: string, input: UpdateContactInput) =>
  api<ContactDto>(`/contacts/${id}`, { method: 'PATCH', body: JSON.stringify(input) });

export const deleteContact = (id: string) => api<void>(`/contacts/${id}`, { method: 'DELETE' });
