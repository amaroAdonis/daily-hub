import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { ENTITY_LABEL } from '../entity-meta';
import { useSearch } from '../hooks';
import { useInspector } from '../inspector-context';

/**
 * Paleta de comandos (⌘K / Ctrl+K): busca global em overlay. Selecionar um item
 * abre o Inspetor. Navega por setas, confirma com Enter, fecha com Esc.
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { open: openInspector } = useInspector();
  const { data: results } = useSearch(query.trim());
  const items = results ?? [];

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Reseta ao abrir e foca o campo.
  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => setActive(0), [query]);

  const choose = (index: number) => {
    const item = items[index];
    if (!item) return;
    openInspector(item);
    setOpen(false);
  };

  const onInputKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') setOpen(false);
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      choose(active);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center bg-ink/20 px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            role="dialog"
            aria-label="Busca rápida"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-surface shadow-pop"
          >
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search
                size={18}
                strokeWidth={2}
                className="shrink-0 text-muted"
                aria-hidden="true"
              />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKey}
                placeholder="Buscar tarefas, metas, notas, compromissos e contatos…"
                aria-label="Busca rápida"
                className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-muted"
              />
              <kbd className="shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted">
                esc
              </kbd>
            </div>

            {query.trim() && (
              <ul className="max-h-80 overflow-y-auto p-2">
                {items.length === 0 && (
                  <li className="px-3 py-6 text-center text-sm text-muted">Nada encontrado.</li>
                )}
                {items.map((item, index) => (
                  <li key={`${item.type}-${item.id}`}>
                    <button
                      type="button"
                      onMouseEnter={() => setActive(index)}
                      onClick={() => choose(index)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left ${
                        index === active ? 'bg-primary/10' : 'hover:bg-bg'
                      }`}
                    >
                      <span className="rounded bg-bg px-1.5 py-0.5 text-xs text-muted">
                        {ENTITY_LABEL[item.type]}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm">{item.title}</span>
                      {item.subtitle && (
                        <span className="shrink-0 text-xs text-muted">{item.subtitle}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
