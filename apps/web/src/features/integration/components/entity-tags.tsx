import { useState } from 'react';
import type { EntityRef } from '@daily-hub/shared';
import { useApplyTag, useCreateTag, useEntityTags, useTags, useUnapplyTag } from '../hooks';

/** Tags aplicadas a uma entidade, com adicionar (existente ou nova) e remover. */
export function EntityTags({ entityRef }: { entityRef: EntityRef }) {
  const { data: applied } = useEntityTags(entityRef);
  const { data: allTags } = useTags();
  const apply = useApplyTag(entityRef);
  const unapply = useUnapplyTag(entityRef);
  const createTag = useCreateTag();
  const [query, setQuery] = useState('');

  const tagging = (tagId: string) => ({
    tagId,
    entityType: entityRef.type,
    entityId: entityRef.id,
  });

  const appliedIds = new Set((applied ?? []).map((tag) => tag.id));
  const term = query.trim().toLowerCase();
  const suggestions = (allTags ?? []).filter(
    (tag) => !appliedIds.has(tag.id) && tag.name.toLowerCase().includes(term),
  );
  const exactExists = (allTags ?? []).some((tag) => tag.name.toLowerCase() === term);

  const createAndApply = async () => {
    const name = query.trim();
    if (!name) return;
    const tag = await createTag.mutateAsync({ name });
    await apply.mutateAsync(tagging(tag.id));
    setQuery('');
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5">
        {(applied ?? []).map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: tag.color }}
              aria-hidden
            />
            {tag.name}
            <button
              type="button"
              aria-label={`Remover tag ${tag.name}`}
              onClick={() => unapply.mutate(tagging(tag.id))}
              className="text-muted hover:text-danger"
            >
              ×
            </button>
          </span>
        ))}
        {(applied ?? []).length === 0 && <span className="text-xs text-muted">Sem tags.</span>}
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Adicionar tag…"
        aria-label="Adicionar tag"
        className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-sm outline-none placeholder:text-muted focus-visible:border-primary"
      />

      {term && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {suggestions.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => {
                apply.mutate(tagging(tag.id));
                setQuery('');
              }}
              className="inline-flex items-center gap-1 rounded-full bg-bg px-2 py-0.5 text-xs hover:bg-border"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: tag.color }}
                aria-hidden
              />
              {tag.name}
            </button>
          ))}
          {!exactExists && (
            <button
              type="button"
              onClick={createAndApply}
              disabled={createTag.isPending || apply.isPending}
              className="rounded-full border border-dashed border-border px-2 py-0.5 text-xs text-primary hover:bg-bg"
            >
              + criar “{query.trim()}”
            </button>
          )}
        </div>
      )}
    </div>
  );
}
