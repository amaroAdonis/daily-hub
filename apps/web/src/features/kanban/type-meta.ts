import { CalendarClock, CheckSquare, Target, type LucideIcon } from 'lucide-react';
import type { BoardItemType } from './board';

/**
 * Identidade visual de cada tipo no quadro — cor própria (teal/índigo/âmbar)
 * para distinguir Tarefa, Compromisso e Meta de relance.
 */
export const TYPE_META: Record<
  BoardItemType,
  { label: string; icon: LucideIcon; bar: string; badge: string; dot: string }
> = {
  TASK: {
    label: 'Tarefa',
    icon: CheckSquare,
    bar: 'border-l-teal-500',
    badge: 'bg-teal-500/10 text-teal-700',
    dot: 'bg-teal-500',
  },
  EVENT: {
    label: 'Compromisso',
    icon: CalendarClock,
    bar: 'border-l-indigo-500',
    badge: 'bg-indigo-500/10 text-indigo-700',
    dot: 'bg-indigo-500',
  },
  GOAL: {
    label: 'Meta',
    icon: Target,
    bar: 'border-l-amber-500',
    badge: 'bg-amber-500/10 text-amber-700',
    dot: 'bg-amber-500',
  },
};
