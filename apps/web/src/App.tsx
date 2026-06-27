import { useState } from 'react';
import { AppShell, type Section } from './components/layout/app-shell';
import { CalendarPage } from './features/calendar/components/calendar-page';
import { DayView } from './features/calendar/components/day-view';
import { todayString } from './features/calendar/dates';
import { GoalsPage } from './features/goals/components/goals-page';

export function App() {
  const [section, setSection] = useState<Section>('today');

  return (
    <AppShell active={section} onNavigate={setSection}>
      {section === 'today' && <DayView day={todayString()} />}
      {section === 'agenda' && <CalendarPage />}
      {section === 'goals' && <GoalsPage />}
    </AppShell>
  );
}
