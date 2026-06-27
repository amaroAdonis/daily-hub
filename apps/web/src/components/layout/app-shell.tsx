import type { ReactNode } from 'react';

/** Seções de topo navegáveis. */
export type Section = 'today' | 'agenda' | 'goals' | 'notes' | 'contacts';

const NAV: { key: Section; label: string }[] = [
  { key: 'today', label: 'Hoje' },
  { key: 'agenda', label: 'Agenda' },
  { key: 'goals', label: 'Metas' },
  { key: 'notes', label: 'Notas' },
  { key: 'contacts', label: 'Contatos' },
];

const SECTION_TITLE: Record<Section, string> = {
  today: 'Hoje',
  agenda: 'Agenda',
  goals: 'Metas',
  notes: 'Notas',
  contacts: 'Contatos',
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
          {NAV.map((item) => (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                item.key === active
                  ? 'bg-primary/10 font-medium text-primary'
                  : 'text-muted hover:bg-bg'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex flex-col">
        <header className="flex items-baseline justify-between border-b border-border px-8 py-5">
          <h1 className="font-display text-2xl font-semibold capitalize">
            {SECTION_TITLE[active]}
          </h1>
          <span className="text-sm text-muted">Fase 6 — Contatos</span>
        </header>
        <main className="flex-1 px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
