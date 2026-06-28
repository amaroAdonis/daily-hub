import type { EventCategory } from '@daily-hub/shared';

/**
 * Paleta de categorias de compromisso — cores próprias (distintas do teal/coral
 * da marca, que seguem com função de UI). Classes literais para o Tailwind
 * detectá-las no build.
 */
export const EVENT_CATEGORIES: Record<
  EventCategory,
  { label: string; dot: string; pill: string; bar: string }
> = {
  WORK: {
    label: 'Trabalho',
    dot: 'bg-blue-500',
    pill: 'bg-blue-500/10 text-blue-700',
    bar: 'border-l-blue-500',
  },
  PERSONAL: {
    label: 'Pessoal',
    dot: 'bg-rose-500',
    pill: 'bg-rose-500/10 text-rose-700',
    bar: 'border-l-rose-500',
  },
  HEALTH: {
    label: 'Saúde',
    dot: 'bg-emerald-500',
    pill: 'bg-emerald-500/10 text-emerald-700',
    bar: 'border-l-emerald-500',
  },
  SOCIAL: {
    label: 'Social',
    dot: 'bg-violet-500',
    pill: 'bg-violet-500/10 text-violet-700',
    bar: 'border-l-violet-500',
  },
  STUDY: {
    label: 'Estudos',
    dot: 'bg-amber-500',
    pill: 'bg-amber-500/10 text-amber-700',
    bar: 'border-l-amber-500',
  },
  OTHER: {
    label: 'Outro',
    dot: 'bg-slate-400',
    pill: 'bg-slate-400/10 text-slate-600',
    bar: 'border-l-slate-400',
  },
};

export const CATEGORY_OPTIONS = (Object.keys(EVENT_CATEGORIES) as EventCategory[]).map((value) => ({
  value,
  label: EVENT_CATEGORIES[value].label,
}));
