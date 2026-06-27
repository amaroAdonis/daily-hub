import { useState } from 'react';
import type { EntityPreview, EntityRef } from '@daily-hub/shared';
import { ENTITY_LABEL } from '../entity-meta';
import { useCreateLink, useRelatedItems, useRemoveLink, useSearch } from '../hooks';

/** Busca um item para vincular (exclui a própria entidade e os já vinculados). */
function LinkPicker({
  entityRef,
  excludeIds,
  onPick,
}: {
  entityRef: EntityRef;
  excludeIds: Set<string>;
  onPick: (preview: EntityPreview) => void;
}) {
  const [query, setQuery] = useState('');
  const { data: results } = useSearch(query);

  const candidates = (results ?? []).filter(
    (item) =>
      !(item.type === entityRef.type && item.id === entityRef.id) && !excludeIds.has(item.id),
  );

  return (
    <div className="mt-2">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar item para vincular…"
        aria-label="Buscar item para vincular"
        className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-sm outline-none placeholder:text-muted focus-visible:border-primary"
      />
      {query.trim() && (
        <ul className="mt-1.5 flex flex-col gap-1">
          {candidates.map((item) => (
            <li key={`${item.type}-${item.id}`}>
              <button
                type="button"
                onClick={() => {
                  onPick(item);
                  setQuery('');
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left text-sm hover:bg-bg"
              >
                <span className="rounded bg-bg px-1.5 py-0.5 text-xs text-muted">
                  {ENTITY_LABEL[item.type]}
                </span>
                <span className="truncate">{item.title}</span>
              </button>
            </li>
          ))}
          {candidates.length === 0 && (
            <li className="px-2 py-1 text-xs text-muted">Nenhum item encontrado.</li>
          )}
        </ul>
      )}
    </div>
  );
}

/** Painel de itens relacionados a uma entidade (vínculos polimórficos). */
export function RelatedItems({ entityRef }: { entityRef: EntityRef }) {
  const { data: related } = useRelatedItems(entityRef);
  const createLink = useCreateLink(entityRef);
  const removeLink = useRemoveLink(entityRef);
  const [adding, setAdding] = useState(false);

  const linkedIds = new Set((related ?? []).map((r) => r.item.id));

  const pick = (preview: EntityPreview) => {
    createLink.mutate({
      sourceType: entityRef.type,
      sourceId: entityRef.id,
      targetType: preview.type,
      targetId: preview.id,
    });
  };

  return (
    <div>
      <ul className="flex flex-col gap-1.5">
        {(related ?? []).map((rel) => (
          <li
            key={rel.linkId}
            className="group flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"
          >
            <span className="rounded bg-bg px-1.5 py-0.5 text-xs text-muted">
              {ENTITY_LABEL[rel.item.type]}
            </span>
            <span className="min-w-0 flex-1 truncate">{rel.item.title}</span>
            {rel.relation && <span className="text-xs text-muted">{rel.relation}</span>}
            <button
              type="button"
              aria-label="Remover vínculo"
              onClick={() => removeLink.mutate(rel.linkId)}
              className="text-muted opacity-0 hover:text-danger group-hover:opacity-100"
            >
              ×
            </button>
          </li>
        ))}
        {(related ?? []).length === 0 && (
          <li className="text-xs text-muted">Nenhum item relacionado.</li>
        )}
      </ul>

      {adding ? (
        <LinkPicker entityRef={entityRef} excludeIds={linkedIds} onPick={pick} />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-2 text-sm font-medium text-primary hover:opacity-80"
        >
          + Vincular item
        </button>
      )}
    </div>
  );
}
