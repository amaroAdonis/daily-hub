import type { EntityType } from '@daily-hub/shared';

/** Rótulo legível por tipo de entidade. */
export const ENTITY_LABEL: Record<EntityType, string> = {
  TASK: 'Tarefa',
  GOAL: 'Meta',
  NOTE: 'Nota',
  EVENT: 'Compromisso',
  CONTACT: 'Contato',
};
