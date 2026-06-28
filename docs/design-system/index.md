# Design System

- Status: Ativo
- Última atualização: 2026-06-28

## Propósito

Documentar a linguagem visual do Daily Hub: tokens (cor, tipografia, elevação,
movimento) e os componentes que os aplicam. A direção é **"luz do dia, foco
calmo"** — uma central pessoal do dia deve parecer organizada e tranquila, com um
único ponto de calor para marcar o "agora".

## Princípios

1. **Um destaque por tela.** Calma antes de adorno; o coral (`accent`) é o "gasto
   de ousadia", reservado ao hoje/destaque.
2. **Cor com função, nunca sozinha.** Status e categorias sempre pareados com
   ícone/rótulo (acessibilidade e clareza).
3. **Hierarquia por tamanho/peso/espaço**, não por borda.
4. **Movimento com propósito** — microinterações de 200–300ms que "explicam, não
   performam"; `prefers-reduced-motion` sempre respeitado.
5. **Acessível por padrão** — foco de teclado visível, contraste AA, responsivo.
6. **Sem clichês de UI gerada por IA** (cream+serif+terracota; preto+neon;
   layout de jornal).

## Navegação

| Documento                     | Conteúdo                                               |
| ----------------------------- | ------------------------------------------------------ |
| [Tokens](tokens.md)           | Cores, tipografia, elevação, raio, movimento           |
| [Componentes](components.md)  | Primitivas de UI, pílulas, paletas de status/categoria |
| [Direção de UI](direction.md) | Pesquisa de tendências (adotar/adaptar/evitar)         |
| [Redesenho](redesign.md)      | Frente de polimento "o dia como linha do tempo viva"   |

## Stack

- **Tailwind CSS** sobre **CSS variables** (tokens) — preparado para tema
  claro/escuro.
- Fontes self-hosted via `@fontsource` (sem CDN).
- Ícones `lucide-react`; toasts `sonner`; motion `framer-motion`; DnD `@dnd-kit`.
- Tokens em `apps/web/src/styles/index.css` e `apps/web/tailwind.config.ts`.

## Decisões relacionadas

- [D005](../DECISIONS.md#d005) — Status comum (pílulas TODO/DOING/DONE).
