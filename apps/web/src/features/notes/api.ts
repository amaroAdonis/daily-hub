import type { CreateNoteInput, ListNotesQuery, NoteDto, UpdateNoteInput } from '@daily-hub/shared';
import { api } from '../../lib/api';

export const listNotes = (query: ListNotesQuery = {}) => {
  const params = new URLSearchParams();
  if (query.date) params.set('date', query.date);
  if (query.pinned !== undefined) params.set('pinned', String(query.pinned));
  const qs = params.toString();
  return api<NoteDto[]>(`/notes${qs ? `?${qs}` : ''}`);
};

export const createNote = (input: CreateNoteInput) =>
  api<NoteDto>('/notes', { method: 'POST', body: JSON.stringify(input) });

export const updateNote = (id: string, input: UpdateNoteInput) =>
  api<NoteDto>(`/notes/${id}`, { method: 'PATCH', body: JSON.stringify(input) });

export const deleteNote = (id: string) => api<void>(`/notes/${id}`, { method: 'DELETE' });
