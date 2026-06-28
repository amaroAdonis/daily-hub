import { fromDayString, shiftReference, toDayString } from '../dates';
import { CalendarHeader, type CalendarView } from './calendar-header';
import { MonthView } from './month-view';
import { WeekView } from './week-view';
import { DayView } from './day-view';

interface Props {
  view: CalendarView;
  reference: Date;
  onViewChange: (view: CalendarView) => void;
  onReferenceChange: (reference: Date) => void;
}

/**
 * Hub da agenda: alterna entre mês/semana/dia e navega por data, agregando as
 * tarefas do período. Clicar um dia aprofunda para a visão de dia. O estado de
 * visão/data é controlado pelo `App` (a sidebar "Hoje" abre o dia atual).
 */
export function CalendarPage({ view, reference, onViewChange, onReferenceChange }: Props) {
  const selectDay = (day: string) => {
    onReferenceChange(fromDayString(day));
    onViewChange('day');
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-[110rem] flex-col">
      <CalendarHeader
        view={view}
        reference={reference}
        onPrev={() => onReferenceChange(shiftReference(view, reference, -1))}
        onNext={() => onReferenceChange(shiftReference(view, reference, 1))}
        onToday={() => onReferenceChange(new Date())}
        onViewChange={onViewChange}
      />

      {view === 'month' && <MonthView reference={reference} onSelectDay={selectDay} />}
      {view === 'week' && <WeekView reference={reference} onSelectDay={selectDay} />}
      {view === 'day' && <DayView day={toDayString(reference)} />}
    </div>
  );
}
