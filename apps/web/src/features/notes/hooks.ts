import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateNoteInput, ListNotesQuery, UpdateNoteInput } from '@daily-hub/shared';
import { createNote, deleteNote, listNotes, updateNote } from './api';

export const noteKeys = {
  all: ['notes'] as const,
  list: (query: ListNotesQuery) => ['notes', 'list', query] as const,
};

export function useNotes(query: ListNotesQuery = {}) {
  return useQuery({
    queryKey: noteKeys.list(query),
    queryFn: () => listNotes(query),
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateNoteInput) => createNote(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: noteKeys.all }),
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateNoteInput }) => updateNote(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: noteKeys.all }),
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteNote(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: noteKeys.all }),
  });
}
