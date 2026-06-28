import type { MotionProps } from 'framer-motion';

/**
 * Animação padrão de itens de lista: entram com fade + leve subida ao criar,
 * saem deslizando ao excluir, e reposicionam os vizinhos com `layout`. Usar
 * dentro de um `<AnimatePresence>`. Respeita prefers-reduced-motion via o
 * `<MotionConfig reducedMotion="user">` no topo da aplicação.
 */
export const listItemMotion: MotionProps = {
  layout: true,
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, x: -12 },
  transition: { duration: 0.22, ease: [0.32, 0.72, 0, 1] },
};
