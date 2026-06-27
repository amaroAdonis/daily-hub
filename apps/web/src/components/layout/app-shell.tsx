import type { ReactNode } from 'react';

/** Seções de topo navegáveis. Contatos chega na Fase 6. */
export type Section = 'today' | 'agenda' | 'goals' | 'notes';

const NAV: { key: Section | 'contacts'; label: string; enabled: boolean }[] = [
  { key: 'today', label: 'Hoje', enabled: true },
  { key: 'agenda', label: 'Agenda', enabled: true },
  { key: 'goals', label: 'Metas', enabled: true },
  { key: 'notes', label: 'Notas', enabled: true },
  { key: 'contacts', label: 'Contatos', enabled: false },
];

const SECTION_TITLE: Record<Section, string> = {
  today: 'Hoje',
  agenda: 'Agenda',
  goals: 'Metas',
  notes: 'Notas',
};

interface Props {
  active: Section;
  onNavigate: (section: Section) => void;
  children: ReactNode;
}

/** Casca da aplicação: barra lateral de navegação + área de conteúdo. */
export function AppShell({ active, onNavigate, children }: Props) {
  return (
    <div className="grid min-h-full grid-cols-[15rem_1fr]">
      <aside className="border-r border-border bg-surface px-5 py-6">
        <div className="font-display text-xl font-semibold tracking-tight">
          Daily<span className="text-primary">Hub</span>
        </div>
        <nav className="mt-8 flex flex-col gap-1">
          {NAV.map((item) => {
            const isActive = item.enabled && item.key === active;
            return (
              <button
                key={item.key}
                disabled={!item.enabled}
                onClick={() => item.enabled && onNavigate(item.key as Section)}
                title={item.enabled ? undefined : 'Em breve'}
                className={`rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                  isActive
                    ? 'bg-primary/10 font-medium text-primary'
                    : item.enabled
                      ? 'text-muted hover:bg-bg'
                      : 'cursor-not-allowed text-muted/40'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="flex flex-col">
        <header className="flex items-baseline justify-between border-b border-border px-8 py-5">
          <h1 className="font-display text-2xl font-semibold capitalize">
            {SECTION_TITLE[active]}
          </h1>
          <span className="text-sm text-muted">Fase 5 — Anotações</span>
        </header>
        <main className="flex-1 px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
