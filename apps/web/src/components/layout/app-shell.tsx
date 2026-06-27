import type { ReactNode } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const NAV = [
  { label: 'Hoje' },
  { label: 'Agenda', active: true },
  { label: 'Metas' },
  { label: 'Notas' },
  { label: 'Contatos' },
];

/**
 * Casca da aplicação: barra lateral de navegação + área de conteúdo.
 * As rotas reais entram na Fase 2; por ora os itens são placeholders.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  return (
    <div className="grid min-h-full grid-cols-[15rem_1fr]">
      <aside className="border-r border-border bg-surface px-5 py-6">
        <div className="font-display text-xl font-semibold tracking-tight">
          Daily<span className="text-primary">Hub</span>
        </div>
        <nav className="mt-8 flex flex-col gap-1">
          {NAV.map((item) => (
            <button
              key={item.label}
              className={`rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                item.active ? 'bg-primary/10 font-medium text-primary' : 'text-muted hover:bg-bg'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex flex-col">
        <header className="flex items-baseline justify-between border-b border-border px-8 py-5">
          <h1 className="font-display text-2xl font-semibold capitalize">{today}</h1>
          <span className="text-sm text-muted">Fase 3 — Compromissos / Eventos</span>
        </header>
        <main className="flex-1 px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
