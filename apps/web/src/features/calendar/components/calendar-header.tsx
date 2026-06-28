import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { weekDays } from '../dates';

export type CalendarView = 'month' | 'week' | 'day';

const VIEWS: { value: CalendarView; label: string }[] = [
  { value: 'month', label: 'Mês' },
  { value: 'week', label: 'Semana' },
  { value: 'day', label: 'Dia' },
];

/** Rótulo do período visível conforme a visão atual. */
function periodLabel(view: CalendarView, reference: Date): string {
  if (view === 'month') return format(reference, "MMMM 'de' yyyy", { locale: ptBR });
  if (view === 'day') return format(reference, "EEEE, d 'de' MMMM", { locale: ptBR });
  const days = weekDays(reference);
  const start = days[0]!;
  const end = days[6]!;
  return `${format(start, 'd MMM', { locale: ptBR })} – ${format(end, 'd MMM', { locale: ptBR })}`;
}

interface Props {
  view: CalendarView;
  reference: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewChange: (view: CalendarView) => void;
}

export function CalendarHeader({ view, reference, onPrev, onNext, onToday, onViewChange }: Props) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-xl border border-border">
          <button
            type="button"
            aria-label="Período anterior"
            onClick={onPrev}
            className="px-2.5 py-1.5 text-muted hover:text-ink"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={onToday}
            className="border-x border-border px-3 py-1.5 text-sm hover:bg-bg"
          >
            Hoje
          </button>
          <button
            type="button"
            aria-label="Próximo período"
            onClick={onNext}
            className="px-2.5 py-1.5 text-muted hover:text-ink"
          >
            ›
          </button>
        </div>
        <h2 className="font-display text-lg font-semibold first-letter:uppercase">
          {periodLabel(view, reference)}
        </h2>
      </div>

      <div className="flex items-center rounded-xl border border-border p-0.5" role="tablist">
        {VIEWS.map((option) => (
          <button
            key={option.value}
            role="tab"
            aria-selected={view === option.value}
            onClick={() => onViewChange(option.value)}
            className={`rounded-lg px-3 py-1 text-sm transition-colors ${
              view === option.value
                ? 'bg-primary/10 font-medium text-primary'
                : 'text-muted hover:text-ink'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
