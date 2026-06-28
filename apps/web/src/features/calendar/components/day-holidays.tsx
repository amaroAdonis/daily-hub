import { PartyPopper } from 'lucide-react';
import { useHolidays } from '../holidays';

/** Faixa informativa com os feriados nacionais (BR/IE) do dia. Some se não houver. */
export function DayHolidays({ day }: { day: string }) {
  const { data } = useHolidays(Number(day.slice(0, 4)));
  const items = (data ?? []).filter((holiday) => holiday.date === day);

  if (items.length === 0) return null;

  return (
    <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-accent/30 bg-accent/5 px-4 py-2.5 text-sm">
      <span className="flex items-center gap-1.5 font-medium text-ink">
        <PartyPopper size={16} strokeWidth={2} className="text-accent" aria-hidden="true" />
        {items.length === 1 ? 'Feriado' : 'Feriados'}
      </span>
      {items.map((holiday) => (
        <span
          key={`${holiday.country}-${holiday.name}`}
          className="flex items-center gap-1.5 text-muted"
        >
          <span aria-hidden="true">{holiday.flag}</span>
          {holiday.name}
          <span className="text-xs text-muted/70">· {holiday.label}</span>
        </span>
      ))}
    </div>
  );
}
