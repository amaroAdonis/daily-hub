# Backlog

Backlog priorizado de melhorias e trabalho futuro. O produto está funcional ponta
a ponta (Fases 0–11); este documento organiza o polimento restante e as frentes
ainda não executadas. Direção visual em [design-system](design-system/index.md).

> **Prioridade:** `P0` essencial · `P1` alto valor · `P2` refinamento.
> **Esforço:** `S` pequeno · `M` médio · `L` grande.
> **Status:** ⬜ pendente · 🔄 em andamento · ✅ feito.

## UX / UI

### P0 — Fundações de percepção (✅ concluído na Fase 8)

| #   | Item                                                | Esforço | Status |
| --- | --------------------------------------------------- | ------- | ------ |
| 1   | Carregar as fontes do design system (`@fontsource`) | S       | ✅     |
| 2   | Biblioteca de ícones (`lucide-react`)               | S       | ✅     |
| 3   | Feedback de mutações (toasts via `sonner`)          | M       | ✅     |
| 4   | Skeletons de carregamento                           | S       | ✅     |

> Fontes self-hosted (Inter, Bricolage Grotesque, JetBrains Mono); ícones na
> navegação e ações; erro global de mutações (`MutationCache`) + toasts de
> sucesso; skeletons nas listas.

### P1 — Hierarquia, profundidade e vida (✅ entregue na frente de redesenho)

| #   | Item                                                    | Esforço | Status |
| --- | ------------------------------------------------------- | ------- | ------ |
| 5   | Elevação e profundidade (tokens de sombra/raio)         | S       | ✅     |
| 6   | Status/prioridade como pílulas                          | S       | ✅     |
| 7   | Drag-and-drop (status no Kanban; `Task.order` na lista) | M       | 🔄     |
| 8   | Command palette (⌘K)                                    | M       | ✅     |
| 9   | Empty states com personalidade                          | S       | ✅     |
| 10  | Animação do Inspetor (slide-in)                         | S       | ✅     |

> A frente de redesenho ("o dia como linha do tempo viva") entregou: tokens de
> elevação/raio/motion + `framer-motion`; pílulas de status/prioridade
> (`lib/status.ts`, `components/ui/status-pill.tsx`); ⌘K reusando a busca global;
> empty states (`components/ui/empty-state.tsx`); slide-in do Inspetor. O DnD de
> **status** existe no Kanban (`@dnd-kit`); reordenar tarefas por `Task.order` na
> lista do dia segue pendente.

### P2 — Refinamento e consistência

| #   | Item                                                      | Esforço | Status |
| --- | --------------------------------------------------------- | ------- | ------ |
| 11  | Calendário mais denso/legível (full-bleed, células ricas) | M       | ✅     |
| 12  | Tags coloridas com seletor de cor                         | S       | ⬜     |
| 13  | Notas em board (masonry) + preview                        | M       | ⬜     |
| 14  | Acessibilidade: foco e aria                               | M       | 🔄     |
| 15  | Microcópia e datas relativas                              | S       | ⬜     |
| 16  | Responsividade mobile                                     | M       | ⬜     |

> O calendário ganhou grade full-bleed e células ricas (pílulas de evento com
> hora/cor, resumo de tarefas/notas, feriados, hoje em destaque). Itens 12, 13,
> 15 e 16 ficam para a **Fase 12** (deploy).

## Produto / Engenharia

| Item                                            | Prioridade | Status | Nota                                                          |
| ----------------------------------------------- | ---------- | ------ | ------------------------------------------------------------- |
| Deploy e demo ao vivo (Railway + R2)            | P0         | ⬜     | Fase 12; ver [deploy](deploy.md) e [D008](DECISIONS.md#d008). |
| Tema claro/escuro                               | P1         | ⬜     | Tokens já são CSS vars; ativar na Fase 12.                    |
| Testes E2E (Playwright)                         | P1         | ⬜     | Fase posterior; specs unitárias (Vitest) já existem.          |
| Sync real Google Calendar (OAuth)               | P2         | ⬜     | Hoje só exportação por URL ([D007](DECISIONS.md#d007)).       |
| Exceções por ocorrência (editar 1 de uma série) | P2         | ⬜     | Hoje editar uma ocorrência edita a série base.                |
| Painel de chat com agente de IA                 | P2         | ⬜     | Ideia adiada por custo/escopo; reavaliar pós-MVP.             |

## Princípios ao executar

- Um destaque por tela; calma antes de adorno (microinterações com parcimônia).
- Preferir self-host de assets (sem dependência de CDN).
- Nunca cor sozinha para status — sempre com ícone/rótulo.
- Rodar `pnpm typecheck`, `pnpm test` e `pnpm lint` a cada bloco.
