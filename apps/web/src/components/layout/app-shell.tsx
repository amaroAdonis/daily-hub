import { useState, type ReactNode } from 'react';
import {
  CalendarRange,
  LogOut,
  PanelLeftClose,
  Search,
  StickyNote,
  Sun,
  Target,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
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

const SIDEBAR_KEY = 'daily-hub.sidebar-collapsed';
const SIDEBAR_WIDTH = 240;

interface Props {
  active: NavKey;
  onNavigate: (key: NavKey) => void;
  children: ReactNode;
}

/** Casca da aplicação: barra lateral recolhível + área de conteúdo. */
export function AppShell({ active, onNavigate, children }: Props) {
  const { user, logout } = useAuth();
  const reduce = useReducedMotion();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_KEY) === '1';
    } catch {
      return false;
    }
  });

  const setCollapsedPersisted = (value: boolean) => {
    setCollapsed(value);
    try {
      localStorage.setItem(SIDEBAR_KEY, value ? '1' : '0');
    } catch {
      /* ignora storage indisponível */
    }
  };

  const ease = [0.32, 0.72, 0, 1] as const;
  const duration = reduce ? 0 : 0.32;

  return (
    <div className="flex min-h-full">
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 0 : SIDEBAR_WIDTH }}
        transition={{ duration, ease }}
        className="shrink-0 overflow-hidden"
        aria-hidden={collapsed}
      >
        <div className="flex h-full w-60 flex-col border-r border-border bg-surface px-5 py-6">
          <div className="flex items-center justify-between gap-2">
            <img src="/dailyhub-logo.png" alt="DailyHub" className="h-8 w-auto" />
            <button
              type="button"
              onClick={() => setCollapsedPersisted(true)}
              aria-label="Recolher menu"
              title="Recolher menu"
              className="shrink-0 rounded-lg p-1.5 text-muted transition-colors hover:bg-bg hover:text-ink"
            >
              <PanelLeftClose size={18} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>

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
        </div>
      </motion.aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-border px-8 py-5">
          <AnimatePresence initial={false}>
            {collapsed && (
              <motion.button
                key="reopen"
                type="button"
                onClick={() => setCollapsedPersisted(false)}
                aria-label="Abrir menu"
                title="Abrir menu"
                initial={{ opacity: 0, width: 0, marginRight: 0 }}
                animate={{ opacity: 1, width: 'auto', marginRight: 4 }}
                exit={{ opacity: 0, width: 0, marginRight: 0 }}
                transition={{ duration, ease }}
                className="flex shrink-0 items-center overflow-hidden rounded-lg transition-opacity hover:opacity-80"
              >
                <img src="/dailyhub-logo.png" alt="DailyHub" className="h-8 w-auto" />
              </motion.button>
            )}
          </AnimatePresence>
          <h1 className="ml-auto font-display text-2xl font-semibold first-letter:uppercase">
            {TITLES[active]}
          </h1>
        </header>
        <main className="flex-1 px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
