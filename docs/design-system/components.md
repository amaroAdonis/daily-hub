# Componentes

> Referência: [Design System](index.md) | [Tokens](tokens.md)

Primitivas de UI reutilizáveis em `apps/web/src/components/ui/` e os sistemas de
cor por significado (status, prioridade, categoria, tipo). Regra transversal:
**cor nunca sozinha** — sempre com ícone e/ou rótulo.

## Primitivas (`components/ui/`)

| Componente                  | Arquivo           | Papel                                                                  |
| --------------------------- | ----------------- | ---------------------------------------------------------------------- |
| `StatusPill`                | `status-pill.tsx` | Pílula de status clicável que cicla A fazer → Em andamento → Concluído |
| `EmptyState`                | `empty-state.tsx` | Estado vazio com ícone, título, descrição e ação opcional              |
| `Skeleton` / `SkeletonList` | `skeleton.tsx`    | Placeholders de carregamento                                           |
| `Avatar`                    | `avatar.tsx`      | Avatar por iniciais ou URL                                             |

## Sistema de status (progresso)

Centralizado em `apps/web/src/lib/status.ts` ([D005](../DECISIONS.md#d005)).
Comum a tarefas, compromissos e metas.

| Status  | Rótulo       | Cor (família) |
| ------- | ------------ | ------------- |
| `TODO`  | A fazer      | slate         |
| `DOING` | Em andamento | amber         |
| `DONE`  | Concluído    | emerald       |

- `PROGRESS_STATUS` — rótulo + classes de pílula + cor do dot por status.
- `NEXT_STATUS` — próximo estágio ao clicar a pílula (cicla).
- `STATUS_TOAST` — cores do toast por status (mesma família das pílulas).

## Prioridade de tarefa

Pílula com dot em `kanban-card.tsx` / `TaskItem`: `HIGH` (danger), `MEDIUM`
(primary), `LOW` (muted).

## Categorias de evento

Paleta própria de evento, **distinta** do teal/coral de marca
(`features/events/categories.ts`):

| Categoria            | Cor     |
| -------------------- | ------- |
| Trabalho (`WORK`)    | blue    |
| Pessoal (`PERSONAL`) | rose    |
| Saúde (`HEALTH`)     | emerald |
| Social (`SOCIAL`)    | violet  |
| Estudos (`STUDY`)    | amber   |
| Outro (`OTHER`)      | slate   |

Cada categoria expõe `dot`, `pill` e `bar` (borda lateral) — classes literais
para o Tailwind detectá-las no build.

## Tipos no Kanban

Identidade visual por tipo de item (`features/kanban/type-meta.ts`): Tarefa
(teal), Compromisso (índigo), Meta (âmbar) — ícone + barra lateral + badge.

## Toasts

`sonner` com erro global de mutações (`MutationCache`) + toasts de sucesso
pontuais; cor do toast acompanha o status quando aplicável (`STATUS_TOAST`).
