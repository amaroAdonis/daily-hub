import { useEffect } from 'react';
import type { EntityPreview } from '@daily-hub/shared';
import { ENTITY_LABEL } from '../entity-meta';
import { EntityTags } from './entity-tags';
import { RelatedItems } from './related-items';

/** Drawer lateral com as conexões de uma entidade: tags e itens relacionados. */
export function EntityInspector({
  preview,
  onClose,
}: {
  preview: EntityPreview;
  onClose: () => void;
}) {
  const entityRef = { type: preview.type, id: preview.id };

  // Fecha com Esc.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 bg-ink/20"
      />
      <aside className="relative h-full w-full max-w-md overflow-y-auto bg-surface shadow-xl">
        <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              {ENTITY_LABEL[preview.type]}
            </span>
            <h2 className="truncate font-display text-lg font-semibold">{preview.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-ink"
            aria-label="Fechar"
          >
            ×
          </button>
        </header>

        <div className="flex flex-col gap-6 px-5 py-5">
          <section>
            <h3 className="mb-2 font-display text-sm font-semibold">Tags</h3>
            <EntityTags entityRef={entityRef} />
          </section>
          <section>
            <h3 className="mb-2 font-display text-sm font-semibold">Itens relacionados</h3>
            <RelatedItems entityRef={entityRef} />
          </section>
        </div>
      </aside>
    </div>
  );
}
