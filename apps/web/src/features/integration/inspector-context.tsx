import { createContext, useContext, useState, type ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { EntityPreview } from '@daily-hub/shared';
import { EntityInspector } from './components/entity-inspector';

interface InspectorContextValue {
  open: (preview: EntityPreview) => void;
}

const InspectorContext = createContext<InspectorContextValue | null>(null);

export function useInspector(): InspectorContextValue {
  const ctx = useContext(InspectorContext);
  if (!ctx) throw new Error('useInspector deve ser usado dentro de InspectorProvider');
  return ctx;
}

/**
 * Disponibiliza o Inspetor de conexões (tags + itens relacionados) para
 * qualquer entidade. Um único drawer é montado no topo da árvore.
 */
export function InspectorProvider({ children }: { children: ReactNode }) {
  const [preview, setPreview] = useState<EntityPreview | null>(null);

  return (
    <InspectorContext.Provider value={{ open: setPreview }}>
      {children}
      <AnimatePresence>
        {preview && (
          <EntityInspector
            key={`${preview.type}:${preview.id}`}
            preview={preview}
            onClose={() => setPreview(null)}
          />
        )}
      </AnimatePresence>
    </InspectorContext.Provider>
  );
}
