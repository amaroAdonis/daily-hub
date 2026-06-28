import type { ReactNode } from 'react';
import {
  CalendarRange,
  LogOut,
  Search,
  StickyNote,
  Sun,
  Target,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../../contexts/auth';
import { Avatar } from '../ui/avatar';

/**
 * Itens de navegação da barra lateral. "Hoje" e "Agenda" levam ambos ao
 * calendário (seção unificada); os demais são seções próprias.
 */
export type NavKey = 'today' | 'agenda' | 'goals' | 'notes' | 'contacts' | 'search' | 'settings';

const NAV: { key: NavKey; label: string; icon: LucideIcon }[] = [
  { key: 'today', label: 'Hoje', icon: Sun },
  { key: 'agenda', label: 'Agenda', icon: CalendarRange },
  { key: 'goals', label: 'Metas', icon: Target },
  { key: 'notes', label: 'Notas', icon: StickyNote },
  { key: 'contacts', label: 'Contatos', icon: Users },
  { key: 'search', label: 'Buscar', icon: Search },
];

const TITLES: Record<NavKey, string> = {
  today: 'Hoje',
  agenda: 'Agenda',
  goals: 'Metas',
  notes: 'Notas',
  contacts: 'Contatos',
  search: 'Buscar',
  settings: 'Configurações',
};

interface Props {
  active: NavKey;
  onNavigate: (key: NavKey) => void;
  children: ReactNode;
}

/** Casca da aplicação: barra lateral de navegação + área de conteúdo. */
export function AppShell({ active, onNavigate, children }: Props) {
  const { user, logout } = useAuth();

  return (
    <div className="grid min-h-full grid-cols-[15rem_1fr]">
      <aside className="flex flex-col border-r border-border bg-surface px-5 py-6">
        <img src="/dailyhub-logo.png" alt="DailyHub" className="h-8 w-auto self-start" />

        <nav className="mt-8 flex flex-col gap-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                  item.key === active
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'text-muted hover:bg-bg'
                }`}
              >
                <Icon size={18} strokeWidth={2} aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {user && (
          <div className="mt-auto border-t border-border pt-4">
            <button
              type="button"
              onClick={() => onNavigate('settings')}
              className={`flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors ${
                active === 'settings' ? 'bg-primary/10' : 'hover:bg-bg'
              }`}
            >
              <Avatar name={user.name} src={user.avatarUrl} size={36} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{user.name}</p>
                <p className="truncate text-xs text-muted">
                  {user.occupation ?? 'Ver configurações'}
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={logout}
              className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-muted transition-colors hover:bg-bg"
            >
              <LogOut size={18} strokeWidth={2} aria-hidden="true" />
              Sair
            </button>
          </div>
        )}
      </aside>

      <div className="flex flex-col">
        <header className="flex items-baseline justify-between border-b border-border px-8 py-5">
          <h1 className="font-display text-2xl font-semibold capitalize">{TITLES[active]}</h1>
        </header>
        <main className="flex-1 px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
