import type { EntityPreview, EntityType } from '@daily-hub/shared';

/** Chave estável para uma referência polimórfica. */
export const refKey = (type: EntityType, id: string): string => `${type}:${id}`;

const day = (date: Date | null): string | null => (date ? date.toISOString().slice(0, 10) : null);

// Mappers por entidade → preview uniforme. Reaproveitados por busca e resolver.

export const taskPreview = (t: { id: string; title: string; date: Date }): EntityPreview => ({
  type: 'TASK',
  id: t.id,
  title: t.title,
  subtitle: day(t.date),
});

export const goalPreview = (g: { id: string; title: string; progress: number }): EntityPreview => ({
  type: 'GOAL',
  id: g.id,
  title: g.title,
  subtitle: `${g.progress}%`,
});

export const notePreview = (n: {
  id: string;
  title: string;
  date: Date | null;
}): EntityPreview => ({
  type: 'NOTE',
  id: n.id,
  title: n.title,
  subtitle: day(n.date),
});

export const eventPreview = (e: { id: string; title: string; startsAt: Date }): EntityPreview => ({
  type: 'EVENT',
  id: e.id,
  title: e.title,
  subtitle: day(e.startsAt),
});

export const contactPreview = (c: {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
}): EntityPreview => ({
  type: 'CONTACT',
  id: c.id,
  title: c.name,
  subtitle: c.company ?? c.email,
});
