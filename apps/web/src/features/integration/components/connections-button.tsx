import type { EntityType } from '@daily-hub/shared';
import { useInspector } from '../inspector-context';

/**
 * Abre o Inspetor de conexões (tags + relacionados) para uma entidade.
 * Usado pelos cards das features para tornar a integração pervasiva.
 */
export function ConnectionsButton({
  type,
  id,
  title,
  className,
}: {
  type: EntityType;
  id: string;
  title: string;
  className?: string;
}) {
  const { open } = useInspector();
  return (
    <button
      type="button"
      title="Conexões"
      aria-label="Conexões"
      onClick={() => open({ type, id, title, subtitle: null })}
      className={className ?? 'hover:text-primary'}
    >
      Conexões
    </button>
  );
}
