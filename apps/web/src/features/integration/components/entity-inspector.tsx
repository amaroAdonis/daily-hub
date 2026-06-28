import { useEffect } from 'react';
import { motion } from 'framer-motion';
import type { EntityPreview, EntityType } from '@daily-hub/shared';
import { ENTITY_LABEL } from '../entity-meta';
import { EntityAttachments } from '../../attachments/components/entity-attachments';
import { EntityTags } from './entity-tags';
import { RelatedItems } from './related-items';

/** Tipos que aceitam anexos (Fase 10). */
const ATTACHABLE: EntityType[] = ['TASK', 'EVENT', 'NOTE'];

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
      <motion.button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-ink/20"
      />
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
        className="relative h-full w-full max-w-md overflow-y-auto bg-surface shadow-drawer"
      >
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
          {ATTACHABLE.includes(preview.type) && (
            <section>
              <h3 className="mb-2 font-display text-sm font-semibold">Anexos</h3>
              <EntityAttachments entityRef={entityRef} />
            </section>
          )}
        </div>
      </motion.aside>
    </div>
  );
}
