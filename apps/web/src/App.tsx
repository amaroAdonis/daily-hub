import { useState } from 'react';
import { AppShell, type Section } from './components/layout/app-shell';
import { AuthProvider, useAuth } from './contexts/auth';
import { AuthPage } from './features/auth/components/auth-page';
import { CalendarPage } from './features/calendar/components/calendar-page';
import { DayView } from './features/calendar/components/day-view';
import { todayString } from './features/calendar/dates';
import { GoalsPage } from './features/goals/components/goals-page';
import { NotesPage } from './features/notes/components/notes-page';
import { ContactsPage } from './features/contacts/components/contacts-page';
import { SearchPage } from './features/integration/components/search-page';
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

function AuthenticatedApp() {
  const [section, setSection] = useState<Section>('today');

  return (
    <InspectorProvider>
      <AppShell active={section} onNavigate={setSection}>
        {section === 'search' && <SearchPage />}
        {section === 'today' && <DayView day={todayString()} />}
        {section === 'agenda' && <CalendarPage />}
        {section === 'goals' && <GoalsPage />}
        {section === 'notes' && <NotesPage />}
        {section === 'contacts' && <ContactsPage />}
      </AppShell>
    </InspectorProvider>
  );
}
