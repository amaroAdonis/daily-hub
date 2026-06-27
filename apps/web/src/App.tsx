import { useState } from 'react';
import { AppShell, type Section } from './components/layout/app-shell';
import { CalendarPage } from './features/calendar/components/calendar-page';
import { DayView } from './features/calendar/components/day-view';
import { todayString } from './features/calendar/dates';
import { GoalsPage } from './features/goals/components/goals-page';
import { NotesPage } from './features/notes/components/notes-page';
import { ContactsPage } from './features/contacts/components/contacts-page';

export function App() {
  const [section, setSection] = useState<Section>('today');

  return (
    <AppShell active={section} onNavigate={setSection}>
      {section === 'today' && <DayView day={todayString()} />}
      {section === 'agenda' && <CalendarPage />}
      {section === 'goals' && <GoalsPage />}
      {section === 'notes' && <NotesPage />}
      {section === 'contacts' && <ContactsPage />}
    </AppShell>
  );
}
