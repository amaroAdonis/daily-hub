import { useState } from 'react';
import { SearchX } from 'lucide-react';
import type { EntityPreview } from '@daily-hub/shared';
import { SkeletonList } from '../../../components/ui/skeleton';
import { EmptyState } from '../../../components/ui/empty-state';
import { ENTITY_LABEL } from '../entity-meta';
import { useSearch, useTagItems, useTags } from '../hooks';
import { useInspector } from '../inspector-context';

/** Linha de um item (preview) que abre o Inspetor ao clicar. */
function PreviewRow({ item }: { item: EntityPreview }) {
  const { open } = useInspector();
  return (
    <button
      type="button"
      onClick={() => open(item)}
      className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface px-4 py-2.5 text-left hover:bg-bg"
    >
      <span className="rounded bg-bg px-1.5 py-0.5 text-xs text-muted">
        {ENTITY_LABEL[item.type]}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm">{item.title}</span>
      {item.subtitle && <span className="shrink-0 text-xs text-muted">{item.subtitle}</span>}
    </button>
  );
}

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [tagId, setTagId] = useState<string | null>(null);
  const trimmed = query.trim();

  const { data: results, isLoading } = useSearch(trimmed);
  const { data: tags } = useTags();
  const { data: tagItems } = useTagItems(tagId);

  return (
    <div className="mx-auto w-full max-w-[110rem]">
      <input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setTagId(null);
        }}
        placeholder="Buscar em tarefas, metas, notas, compromissos e contatos…"
        aria-label="Busca global"
        autoFocus
        className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none placeholder:text-muted focus-visible:border-primary"
      />

      {trimmed ? (
        <div className="mt-4">
          {isLoading && <SkeletonList rows={4} />}
          {!isLoading && results?.length === 0 && (
            <EmptyState
              icon={SearchX}
              title="Nada encontrado"
              description={`Nenhum item para “${trimmed}”.`}
            />
          )}
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {results?.map((item) => (
              <PreviewRow key={`${item.type}-${item.id}`} item={item} />
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-5">
          <h3 className="mb-2 font-display text-sm font-semibold">Tags</h3>
          {tags?.length === 0 && (
            <p className="text-sm text-muted">
              Nenhuma tag ainda. Crie tags a partir das “Conexões” de qualquer item.
            </p>
          )}
          <div className="flex flex-wrap gap-1.5">
            {tags?.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => setTagId((current) => (current === tag.id ? null : tag.id))}
                aria-pressed={tagId === tag.id}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors ${
                  tagId === tag.id ? 'border-primary bg-primary/10 text-primary' : 'border-border'
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: tag.color }}
                  aria-hidden
                />
                {tag.name}
                <span className="text-muted">{tag.count}</span>
              </button>
            ))}
          </div>

          {tagId && (
            <div className="mt-4 flex flex-col gap-2">
              {tagItems?.length === 0 && (
                <p className="text-sm text-muted">Nenhum item com esta tag.</p>
              )}
              {tagItems?.map((item) => (
                <PreviewRow key={`${item.type}-${item.id}`} item={item} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
