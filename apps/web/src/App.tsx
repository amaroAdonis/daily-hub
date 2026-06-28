import { useState } from 'react';
import { AppShell, type NavKey } from './components/layout/app-shell';
import { AuthProvider, useAuth } from './contexts/auth';
import { AuthPage } from './features/auth/components/auth-page';
import { CalendarPage } from './features/calendar/components/calendar-page';
import { type CalendarView } from './features/calendar/components/calendar-header';
import { toDayString, todayString } from './features/calendar/dates';
import { GoalsPage } from './features/goals/components/goals-page';
import { NotesPage } from './features/notes/components/notes-page';
import { ContactsPage } from './features/contacts/components/contacts-page';
import { SearchPage } from './features/integration/components/search-page';
import { SettingsPage } from './features/settings/components/settings-page';
import { KanbanPage } from './features/kanban/components/kanban-page';
import { InspectorProvider } from './features/integration/inspector-context';

export function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

/** Decide entre splash, tela de auth e a aplicação protegida. */
function AuthGate() {
  const { status } = useAuth();

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <span className="text-sm text-muted">Carregando…</span>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <AuthPage />;
  }

  return <AuthenticatedApp />;
}

/** Seções que não são o calendário. */
type Section = 'calendar' | 'kanban' | 'goals' | 'notes' | 'contacts' | 'search' | 'settings';

function AuthenticatedApp() {
  // Calendário é a landing pós-login; seu estado vive aqui para que a sidebar
  // ("Hoje") consiga abrir diretamente o dashboard do dia atual.
  const [section, setSection] = useState<Section>('calendar');
  const [calendarView, setCalendarView] = useState<CalendarView>('month');
  const [calendarRef, setCalendarRef] = useState<Date>(() => new Date());

  // Qual item da sidebar destacar (derivado do estado, não armazenado).
  const isToday = calendarView === 'day' && toDayString(calendarRef) === todayString();
  const active: NavKey = section === 'calendar' ? (isToday ? 'today' : 'agenda') : section;

  const navigate = (key: NavKey) => {
    if (key === 'today') {
      setSection('calendar');
      setCalendarView('day');
      setCalendarRef(new Date());
    } else if (key === 'agenda') {
      setSection('calendar');
      setCalendarView('month');
    } else {
      setSection(key);
    }
  };

  return (
    <InspectorProvider>
      <AppShell active={active} onNavigate={navigate}>
        {section === 'calendar' && (
          <CalendarPage
            view={calendarView}
            reference={calendarRef}
            onViewChange={setCalendarView}
            onReferenceChange={setCalendarRef}
          />
        )}
        {section === 'kanban' && <KanbanPage />}
        {section === 'goals' && <GoalsPage />}
        {section === 'notes' && <NotesPage />}
        {section === 'contacts' && <ContactsPage />}
        {section === 'search' && <SearchPage />}
        {section === 'settings' && <SettingsPage />}
      </AppShell>
    </InspectorProvider>
  );
}
