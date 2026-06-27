import type { GoalHorizon, GoalStatus } from '@daily-hub/shared';

export const HORIZON_LABEL: Record<GoalHorizon, string> = {
  SHORT: 'Curto prazo',
  MEDIUM: 'Médio prazo',
  LONG: 'Longo prazo',
};

export const STATUS_LABEL: Record<GoalStatus, string> = {
  ACTIVE: 'Ativa',
  ACHIEVED: 'Concluída',
  ARCHIVED: 'Arquivada',
};

export const HORIZON_OPTIONS = (Object.keys(HORIZON_LABEL) as GoalHorizon[]).map((value) => ({
  value,
  label: HORIZON_LABEL[value],
}));

export const STATUS_OPTIONS = (Object.keys(STATUS_LABEL) as GoalStatus[]).map((value) => ({
  value,
  label: STATUS_LABEL[value],
}));
