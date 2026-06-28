import { Link2 } from 'lucide-react';
import type { EntityType } from '@daily-hub/shared';
import { useInspector } from '../inspector-context';

/**
 * Abre o Inspetor de conexões (tags + relacionados + anexos) de uma entidade.
 * Renderiza um ícone discreto; o rótulo vive no `aria-label`/`title`.
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
      className={
        className ??
        'inline-flex items-center justify-center rounded-md p-1 text-muted transition-colors hover:text-primary'
      }
    >
      <Link2 size={15} strokeWidth={2} aria-hidden="true" />
    </button>
  );
}
