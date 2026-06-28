import { useEffect, useState, type ReactNode } from 'react';
import {
  CalendarRange,
  LayoutGrid,
  LogOut,
  Menu,
  PanelLeftClose,
  Search,
  StickyNote,
  Sun,
  Target,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useAuth } from '../../contexts/auth';
import { Avatar } from '../ui/avatar';

/**
 * Itens de navegação da barra lateral. "Hoje" e "Agenda" levam ambos ao
 * calendário (seção unificada); os demais são seções próprias.
 */
export type NavKey =
  'today' | 'agenda' | 'kanban' | 'goals' | 'notes' | 'contacts' | 'search' | 'settings';

const NAV: { key: NavKey; label: string; icon: LucideIcon }[] = [
  { key: 'today', label: 'Hoje', icon: Sun },
  { key: 'agenda', label: 'Agenda', icon: CalendarRange },
  { key: 'kanban', label: 'Quadro', icon: LayoutGrid },
  { key: 'goals', label: 'Metas', icon: Target },
  { key: 'notes', label: 'Notas', icon: StickyNote },
  { key: 'contacts', label: 'Contatos', icon: Users },
  { key: 'search', label: 'Buscar', icon: Search },
];

const TITLES: Record<NavKey, string> = {
  today: 'Hoje',
  agenda: 'Agenda',
  kanban: 'Quadro',
  goals: 'Metas',
  notes: 'Notas',
  contacts: 'Contatos',
  search: 'Buscar',
  settings: 'Configurações',
};

const SIDEBAR_KEY = 'daily-hub.sidebar-collapsed';
const SIDEBAR_WIDTH = 240;

/**
 * Conteúdo da barra lateral (logo + navegação + bloco do usuário), reutilizado
 * tanto pela sidebar fixa do desktop quanto pelo drawer flutuante do mobile.
 */
function SidebarContent({
  active,
  onNavigate,
  topAction,
}: {
  active: NavKey;
  onNavigate: (key: NavKey) => void;
  topAction?: ReactNode;
}) {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-full w-full flex-col border-r border-border bg-surface px-5 py-6">
      <div className="flex items-center justify-between gap-2">
        <img src="/dailyhub-logo.png" alt="DailyHub" className="h-8 w-auto" />
        {topAction}
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
  );
}

interface Props {
  active: NavKey;
  onNavigate: (key: NavKey) => void;
  children: ReactNode;
}

/**
 * Casca da aplicação. Em telas grandes (`lg+`) a barra lateral é fixa e
 * recolhível, empurrando o conteúdo. Em telas pequenas ela vira um **drawer
 * flutuante** (sobre o conteúdo), aberto pelo botão hambúrguer do cabeçalho.
 */
export function AppShell({ active, onNavigate, children }: Props) {
  const reduce = useReducedMotion();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  const setCollapsedPersisted = (value: boolean) => {
    setCollapsed(value);
    try {
      localStorage.setItem(SIDEBAR_KEY, value ? '1' : '0');
    } catch {
      /* ignora storage indisponível */
    }
  };

  // Trava o scroll do body enquanto o drawer mobile está aberto + fecha no Esc.
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMobileOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [mobileOpen]);

  const ease = [0.32, 0.72, 0, 1] as const;
  const duration = reduce ? 0 : 0.32;

  // No mobile, navegar fecha o drawer.
  const navigateMobile = (key: NavKey) => {
    onNavigate(key);
    setMobileOpen(false);
  };

  return (
    <div className="flex min-h-full">
      {/* Sidebar do desktop (lg+): empurra o conteúdo e é recolhível. */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 0 : SIDEBAR_WIDTH }}
        transition={{ duration, ease }}
        className="hidden shrink-0 overflow-hidden lg:block"
        aria-hidden={collapsed}
      >
        <div className="h-full w-60">
          <SidebarContent
            active={active}
            onNavigate={onNavigate}
            topAction={
              <button
                type="button"
                onClick={() => setCollapsedPersisted(true)}
                aria-label="Recolher menu"
                title="Recolher menu"
                className="shrink-0 rounded-lg p-1.5 text-muted transition-colors hover:bg-bg hover:text-ink"
              >
                <PanelLeftClose size={18} strokeWidth={2} aria-hidden="true" />
              </button>
            }
          />
        </div>
      </motion.aside>

      {/* Drawer flutuante do mobile (< lg): sobrepõe o conteúdo. */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <motion.button
              type="button"
              aria-label="Fechar menu"
              onClick={() => setMobileOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.2 }}
              className="absolute inset-0 bg-ink/20"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: reduce ? 0 : 0.28, ease }}
              className="relative h-full w-72 max-w-[85%] shadow-drawer"
            >
              <SidebarContent
                active={active}
                onNavigate={navigateMobile}
                topAction={
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    aria-label="Fechar menu"
                    title="Fechar menu"
                    className="shrink-0 rounded-lg p-1.5 text-muted transition-colors hover:bg-bg hover:text-ink"
                  >
                    <X size={18} strokeWidth={2} aria-hidden="true" />
                  </button>
                }
              />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-border px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
          {/* Hambúrguer: só no mobile. */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
            title="Abrir menu"
            className="shrink-0 rounded-lg p-1.5 text-muted transition-colors hover:bg-bg hover:text-ink lg:hidden"
          >
            <Menu size={20} strokeWidth={2} aria-hidden="true" />
          </button>

          {/* Reabrir a sidebar recolhida: só no desktop. */}
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
                className="hidden shrink-0 items-center overflow-hidden rounded-lg transition-opacity hover:opacity-80 lg:flex"
              >
                <img src="/dailyhub-logo.png" alt="DailyHub" className="h-8 w-auto" />
              </motion.button>
            )}
          </AnimatePresence>

          <h1 className="ml-auto font-display text-xl font-semibold first-letter:uppercase sm:text-2xl">
            {TITLES[active]}
          </h1>
        </header>
        <main className="flex-1 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">{children}</main>
      </div>
    </div>
  );
}
