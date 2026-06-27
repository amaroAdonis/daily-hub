import { format } from 'date-fns';
import { AppShell } from './components/layout/app-shell';
import { DayTasks } from './features/tasks/components/day-tasks';

export function App() {
  // Dia atual no formato YYYY-MM-DD — eixo central da agenda.
  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <AppShell>
      <DayTasks date={today} />
    </AppShell>
  );
}
