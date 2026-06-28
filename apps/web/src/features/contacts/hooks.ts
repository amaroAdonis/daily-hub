import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { CreateContactInput, ListContactsQuery, UpdateContactInput } from '@daily-hub/shared';
import { createContact, deleteContact, listContacts, updateContact } from './api';

export const contactKeys = {
  all: ['contacts'] as const,
  list: (query: ListContactsQuery) => ['contacts', 'list', query] as const,
};

export function useContacts(query: ListContactsQuery = {}) {
  return useQuery({
    queryKey: contactKeys.list(query),
    queryFn: () => listContacts(query),
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateContactInput) => createContact(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.all });
      toast.success('Contato adicionado.');
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateContactInput }) =>
      updateContact(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: contactKeys.all }),
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.all });
      toast.success('Contato excluído.');
    },
  });
}
