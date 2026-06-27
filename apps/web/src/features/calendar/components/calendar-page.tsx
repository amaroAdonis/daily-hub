import { useState } from 'react';
import { fromDayString, shiftReference, toDayString } from '../dates';
import { CalendarHeader, type CalendarView } from './calendar-header';
import { MonthView } from './month-view';
import { WeekView } from './week-view';
import { DayView } from './day-view';

/**
 * Hub da agenda: alterna entre mês/semana/dia e navega por data, agregando as
 * tarefas do período. Clicar um dia aprofunda para a visão de dia.
 */
export function CalendarPage() {
  const [view, setView] = useState<CalendarView>('month');
  const [reference, setReference] = useState<Date>(() => new Date());

  const selectDay = (day: string) => {
    setReference(fromDayString(day));
    setView('day');
  };

  return (
    <div className="max-w-4xl">
      <CalendarHeader
        view={view}
        reference={reference}
        onPrev={() => setReference((current) => shiftReference(view, current, -1))}
        onNext={() => setReference((current) => shiftReference(view, current, 1))}
        onToday={() => setReference(new Date())}
        onViewChange={setView}
      />

      {view === 'month' && <MonthView reference={reference} onSelectDay={selectDay} />}
      {view === 'week' && <WeekView reference={reference} onSelectDay={selectDay} />}
      {view === 'day' && <DayView day={toDayString(reference)} />}
    </div>
  );
}
