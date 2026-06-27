import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateLinkInput, CreateTagInput, EntityRef, TaggingInput } from '@daily-hub/shared';
import {
  applyTag,
  createLink,
  createTag,
  deleteLink,
  deleteTag,
  entityTags,
  listTags,
  relatedItems,
  search,
  tagItems,
  unapplyTag,
} from './api';

export const integrationKeys = {
  search: (q: string) => ['search', q] as const,
  tags: ['tags'] as const,
  tagItems: (id: string) => ['tags', 'items', id] as const,
  entityTags: (ref: EntityRef) => ['tags', 'entity', ref.type, ref.id] as const,
  related: (ref: EntityRef) => ['links', ref.type, ref.id] as const,
};

export function useSearch(q: string) {
  return useQuery({
    queryKey: integrationKeys.search(q),
    queryFn: () => search(q),
    enabled: q.trim().length > 0,
  });
}

export function useTags() {
  return useQuery({ queryKey: integrationKeys.tags, queryFn: listTags });
}

export function useTagItems(tagId: string | null) {
  return useQuery({
    queryKey: integrationKeys.tagItems(tagId ?? ''),
    queryFn: () => tagItems(tagId!),
    enabled: tagId !== null,
  });
}

export function useEntityTags(ref: EntityRef) {
  return useQuery({
    queryKey: integrationKeys.entityTags(ref),
    queryFn: () => entityTags(ref),
  });
}

export function useRelatedItems(ref: EntityRef) {
  return useQuery({
    queryKey: integrationKeys.related(ref),
    queryFn: () => relatedItems(ref),
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTagInput) => createTag(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: integrationKeys.tags }),
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTag(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tags'] }),
  });
}

export function useApplyTag(ref: EntityRef) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TaggingInput) => applyTag(input),
    onSuccess: (tags) => {
      queryClient.setQueryData(integrationKeys.entityTags(ref), tags);
      queryClient.invalidateQueries({ queryKey: integrationKeys.tags });
    },
  });
}

export function useUnapplyTag(ref: EntityRef) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TaggingInput) => unapplyTag(input),
    onSuccess: (tags) => {
      queryClient.setQueryData(integrationKeys.entityTags(ref), tags);
      queryClient.invalidateQueries({ queryKey: integrationKeys.tags });
    },
  });
}

export function useCreateLink(ref: EntityRef) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLinkInput) => createLink(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: integrationKeys.related(ref) }),
  });
}

export function useRemoveLink(ref: EntityRef) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (linkId: string) => deleteLink(linkId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: integrationKeys.related(ref) }),
  });
}
