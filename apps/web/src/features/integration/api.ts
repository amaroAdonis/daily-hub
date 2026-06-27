import type {
  CreateLinkInput,
  CreateTagInput,
  EntityPreview,
  EntityRef,
  RelatedItem,
  TagDto,
  TaggingInput,
} from '@daily-hub/shared';
import { api } from '../../lib/api';

// Busca global
export const search = (q: string) => api<EntityPreview[]>(`/search?q=${encodeURIComponent(q)}`);

// Tags
export const listTags = () => api<TagDto[]>('/tags');

export const createTag = (input: CreateTagInput) =>
  api<TagDto>('/tags', { method: 'POST', body: JSON.stringify(input) });

export const deleteTag = (id: string) => api<void>(`/tags/${id}`, { method: 'DELETE' });

export const tagItems = (id: string) => api<EntityPreview[]>(`/tags/${id}/items`);

export const entityTags = (ref: EntityRef) =>
  api<TagDto[]>(`/tags/entity?entityType=${ref.type}&entityId=${ref.id}`);

export const applyTag = (input: TaggingInput) =>
  api<TagDto[]>('/tags/apply', { method: 'POST', body: JSON.stringify(input) });

export const unapplyTag = (input: TaggingInput) =>
  api<TagDto[]>('/tags/unapply', { method: 'POST', body: JSON.stringify(input) });

// Links
export const relatedItems = (ref: EntityRef) =>
  api<RelatedItem[]>(`/links?entityType=${ref.type}&entityId=${ref.id}`);

export const createLink = (input: CreateLinkInput) =>
  api<RelatedItem>('/links', { method: 'POST', body: JSON.stringify(input) });

export const deleteLink = (id: string) => api<void>(`/links/${id}`, { method: 'DELETE' });
