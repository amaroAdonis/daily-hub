import type { ReactNode } from 'react';
import { useAuth } from '../../contexts/auth';
import { Avatar } from '../ui/avatar';

/** Seções de topo navegáveis. */
export type Section = 'search' | 'today' | 'agenda' | 'goals' | 'notes' | 'contacts';

const NAV: { key: Section; label: string }[] = [
  { key: 'search', label: 'Buscar' },
  { key: 'today', label: 'Hoje' },
  { key: 'agenda', label: 'Agenda' },
  { key: 'goals', label: 'Metas' },
  { key: 'notes', label: 'Notas' },
  { key: 'contacts', label: 'Contatos' },
];

const SECTION_TITLE: Record<Section, string> = {
  search: 'Buscar',
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
  const { user, logout } = useAuth();

  return (
    <div className="grid min-h-full grid-cols-[15rem_1fr]">
      <aside className="flex flex-col border-r border-border bg-surface px-5 py-6">
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

        {user && (
          <div className="mt-auto border-t border-border pt-4">
            <div className="flex items-center gap-3">
              <Avatar name={user.name} src={user.avatarUrl} size={36} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{user.name}</p>
                {user.occupation && (
                  <p className="truncate text-xs text-muted">{user.occupation}</p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="mt-3 w-full rounded-xl px-3 py-2 text-left text-sm text-muted transition-colors hover:bg-bg"
            >
              Sair
            </button>
          </div>
        )}
      </aside>

      <div className="flex flex-col">
        <header className="flex items-baseline justify-between border-b border-border px-8 py-5">
          <h1 className="font-display text-2xl font-semibold capitalize">
            {SECTION_TITLE[active]}
          </h1>
        </header>
        <main className="flex-1 px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
