# UX / UI Backlog

Backlog **priorizado** de melhorias de interface e experiência. O app está
funcional ponta a ponta (Fases 0–7), mas a camada visual foi mantida mínima a
cada fase — este documento organiza o polimento.

Direção visual de referência: **"luz do dia, foco calmo"** (ver
[`design-system.md`](design-system.md)) e a pesquisa de tendências avaliada em
[`ui-direction.md`](ui-direction.md). Um único ponto de calor (âmbar/`accent`)
para o "agora"; evitar clichês de UI gerada por IA.

> **Encaixe no roadmap (revisão de 2026-06-28):** os itens **P0** (fontes,
> ícones, toasts, skeletons) entram junto da **Fase 8** — a tela de login é a
> primeira impressão e deve nascer já com a identidade certa. Os demais (P1/P2)
> ficam para a **Fase 12** (vitrine). Ver [`ROADMAP.md`](ROADMAP.md).

> **Prioridade:** `P0` essencial · `P1` alto valor · `P2` refinamento
> **Esforço:** `S` pequeno · `M` médio · `L` grande
> **Status:** ⬜ pendente · 🔄 em andamento · ✅ feito

---

## P0 — Fundações que mudam a percepção

| #   | Item                                    | Esforço | Status |
| --- | --------------------------------------- | ------- | ------ |
| 1   | **Carregar as fontes do design system** | S       | ⬜     |
| 2   | **Biblioteca de ícones**                | S       | ⬜     |
| 3   | **Feedback de mutações (toasts)**       | M       | ⬜     |
| 4   | **Skeletons de carregamento**           | S       | ⬜     |

1. **Fontes.** `Bricolage Grotesque`, `Inter` e `JetBrains Mono` estão
   declaradas em `apps/web/tailwind.config.ts`, mas **não são carregadas** — tudo
   cai em `system-ui`, anulando a identidade tipográfica. Self-host via
   `@fontsource/*` (sem CDN, alinhado ao restante). É a maior alavanca isolada.
2. **Ícones (`lucide-react`).** Hoje as ações são quase só texto
   ("Editar/Excluir/Conexões", `✕`, `★`, `‹ ›`, `↻`). Ícones dão textura, reduzem
   ruído e padronizam. Afeta praticamente todos os `components/`.
3. **Toasts.** Criar/concluir/excluir/vincular acontecem em silêncio. Um toaster
   leve (ex.: `sonner`) + feedback de erro das mutations (hoje só `isError` em
   queries). Ligar nos `onError`/`onSuccess` dos hooks de cada feature.
4. **Skeletons.** Trocar os `"Carregando…"` por skeletons nos lugares de maior
   espera: `DayView`, `MonthView`, `GoalsPage`, `NotesPage`, `ContactsPage`,
   `SearchPage`.

---

## P1 — Hierarquia, profundidade e vida

| #   | Item                                     | Esforço | Status |
| --- | ---------------------------------------- | ------- | ------ |
| 5   | **Elevação e profundidade**              | S       | ⬜     |
| 6   | **Status/prioridade como pílulas**       | S       | ⬜     |
| 7   | **Drag-and-drop para reordenar tarefas** | M       | ⬜     |
| 8   | **Command palette (⌘K)**                 | M       | ⬜     |
| 9   | **Empty states com personalidade**       | S       | ⬜     |
| 10  | **Animação do Inspetor (slide-in)**      | S       | ⬜     |

5. **Elevação.** Está tudo "borda fina + plano". Sombras sutis em cards e no
   drawer, hover mais perceptível, raios/espaços mais intencionais. Definir
   tokens de sombra no Tailwind.
6. **Pílulas de status/prioridade.** `TaskItem` usa pontinhos de prioridade;
   `GoalCard` já tem pílula de status. Padronizar pílulas sutis (com cor) para
   prioridade de tarefa e status de meta/tarefa.
7. **Reordenar tarefas (DnD).** O campo `Task.order` **já existe no schema e está
   sem uso na UI**. Vitória pronta: drag-and-drop em `DayTasks` persistindo
   `order` via `PATCH /tasks/:id` (o service já ordena por `order`). Avaliar
   `@dnd-kit`.
8. **Command palette (⌘K).** Reaproveita a busca global da Fase 7
   (`/search`) — alto impacto, custo baixo no backend. Atalho de teclado abrindo
   um overlay de busca → abre o Inspetor / navega.
9. **Empty states.** Já há os textos; falta ícone/ilustração leve + CTA claro
   (ex.: "Nenhuma tarefa para hoje" com um botão de criar).
10. **Inspetor.** `EntityInspector` aparece sem transição. Slide-in do drawer +
    fade do backdrop, respeitando `prefers-reduced-motion` (já tratado no CSS).

---

## P2 — Refinamento e consistência

| #   | Item                                   | Esforço | Status |
| --- | -------------------------------------- | ------- | ------ |
| 11  | **Calendário mais denso/legível**      | M       | ⬜     |
| 12  | **Tags coloridas com seletor de cor**  | S       | ⬜     |
| 13  | **Notas em board (masonry) + preview** | M       | ⬜     |
| 14  | **Acessibilidade: foco e aria**        | M       | ⬜     |
| 15  | **Microcópia e datas relativas**       | S       | ⬜     |
| 16  | **Responsividade mobile**              | M       | ⬜     |

11. **Calendário.** Células do mês são planas; melhorar densidade dos
    indicadores, ênfase do "hoje", blocos de horário na semana.
12. **Tags.** `createTag` aceita `color`, mas a UI sempre usa o default. Seletor
    de cor ao criar tag, e usar a cor de forma mais presente.
13. **Notas.** Grade atual é 2 colunas uniformes; um masonry e limite de
    altura com "ver mais" deixam o board mais natural.
14. **Acessibilidade.** Foco de teclado visível consistente, `aria-label` nos
    botões só-ícone, navegação por teclado no calendário, contraste.
15. **Microcópia/datas.** "hoje/amanhã/ontem" e datas relativas onde fizer
    sentido; revisar textos.
16. **Mobile.** A sidebar é fixa em `15rem`; falta um layout responsivo
    (drawer de navegação, grids que colapsam).

---

## Migrou para o roadmap

- **Dashboard do dia**: virou a **Fase 9** (calendário como landing + dashboard
  rico com CRUD inline e contatos vinculados).
- **Tema claro/escuro**: **Fase 12** (os tokens já são CSS variables, prontos).
- **Anexos** e **integrações externas**: Fases 10 e 11.
- **E2E (Playwright)**: previsto como fase posterior.

## Princípios ao executar

- Um destaque por tela; calma antes de adorno (microinterações com parcimônia).
- Preferir self-host de assets (sem dependência de CDN).
- Rodar `pnpm typecheck`, `pnpm test` e `pnpm lint` a cada bloco.
