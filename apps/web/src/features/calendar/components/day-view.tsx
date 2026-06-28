import { CalendarClock, CheckSquare, StickyNote, Target } from 'lucide-react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { DayTasks } from '../../tasks/components/day-tasks';
import { DayEvents } from '../../events/components/day-events';
import { DayNotes } from '../../notes/components/day-notes';
import { DayGoals } from '../../goals/components/day-goals';
import { useTasks } from '../../tasks/hooks';
import { useNotes } from '../../notes/hooks';
import { useGoals } from '../../goals/hooks';
import { useEventOccurrences } from '../../events/hooks';
import { todayString } from '../dates';
import { DayContacts } from './day-contacts';
import { DayHolidays } from './day-holidays';

/** Uma contagem do resumo do dia (ícone + valor + rótulo). */
function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof CalendarClock;
  value: string;
  label: string;
}) {
  return (
    <span className="flex items-center gap-1.5 text-sm text-muted">
      <Icon size={15} strokeWidth={2} aria-hidden="true" />
      <span className="font-medium text-ink">{value}</span>
      {label}
    </span>
  );
}

/**
 * Dashboard do dia: barra de resumo + três zonas (compromissos por período,
 * tarefas e notas/pessoas) em largura cheia, com entrada animada que reanima a
 * cada troca de dia. Reaproveita cada feature; as queries são compartilhadas.
 */
export function DayView({ day }: { day: string }) {
  const isToday = day === todayString();
  const reduce = useReducedMotion();

  // Mesmas queries dos sub-componentes (deduplicadas pela queryKey) — alimentam
  // só o resumo, sem custo extra de rede.
  const { data: tasks } = useTasks({ date: day });
  const { data: notes } = useNotes({ date: day });
  const { data: eventsByDay } = useEventOccurrences({ from: day, to: day });
  const { data: activeGoals } = useGoals({ status: 'ACTIVE' });

  const eventCount = eventsByDay?.get(day)?.length ?? 0;
  const taskTotal = tasks?.length ?? 0;
  const taskDone = tasks?.filter((task) => task.status === 'DONE').length ?? 0;
  const noteCount = notes?.length ?? 0;
  const goalCount = activeGoals?.length ?? 0;

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.07 } },
  };
  const item: Variants = reduce
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.32, 0.72, 0, 1] } },
      };

  return (
    <section className="w-full">
      <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2">
        {isToday && (
          <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent">
            hoje
          </span>
        )}
        <Stat
          icon={CalendarClock}
          value={String(eventCount)}
          label={eventCount === 1 ? 'compromisso' : 'compromissos'}
        />
        <Stat
          icon={CheckSquare}
          value={`${taskDone}/${taskTotal}`}
          label={taskTotal === 1 ? 'tarefa' : 'tarefas'}
        />
        <Stat
          icon={StickyNote}
          value={String(noteCount)}
          label={noteCount === 1 ? 'nota' : 'notas'}
        />
        <Stat
          icon={Target}
          value={String(goalCount)}
          label={goalCount === 1 ? 'meta ativa' : 'metas ativas'}
        />
      </div>

      <DayHolidays day={day} />

      <motion.div
        key={day}
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3"
      >
        <motion.div variants={item}>
          <DayEvents date={day} />
        </motion.div>
        <motion.div variants={item} className="flex flex-col gap-6">
          <DayTasks date={day} />
          <DayGoals />
        </motion.div>
        <motion.div variants={item} className="flex flex-col gap-6">
          <DayNotes date={day} />
          <DayContacts day={day} />
        </motion.div>
      </motion.div>
    </section>
  );
}
