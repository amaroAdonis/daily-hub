import { AppShell } from './components/layout/app-shell';
import { CalendarPage } from './features/calendar/components/calendar-page';

export function App() {
  return (
    <AppShell>
      <CalendarPage />
    </AppShell>
  );
}
