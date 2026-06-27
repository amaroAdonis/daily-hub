# Direção de UI — pesquisa e recomendações

Pesquisa de tendências atuais (2025–2026) **avaliada e filtrada** para o Daily
Hub. Objetivo: modernizar e "embelezar" sem trair a direção
[**"luz do dia, foco calmo"**](design-system.md) — e sem cair em clichês.

> Companheiro do [`ux-backlog.md`](ux-backlog.md) (execução priorizada) e do
> [`design-system.md`](design-system.md) (tokens). Pesquisado em 2026-06-28;
> fontes ao final.

## Leitura crítica: adotar, adaptar, evitar

O consenso forte de 2026 é **"calm interfaces" e o fim do espetáculo visual**:
clareza, controle do usuário, acessibilidade como infraestrutura e sistemas de
**design tokens**. Há também uma corrente oposta (cores "dopamina"/neon, 3D,
neo-brutalismo, AI-agentic) que **não serve** a uma agenda pessoal calma.

| Tendência 2026                                                 | Decisão     | Por quê para o Daily Hub                                              |
| -------------------------------------------------------------- | ----------- | --------------------------------------------------------------------- |
| Interfaces calmas, menos carga cognitiva, white space          | **Adotar**  | É literalmente a nossa direção.                                       |
| Acessibilidade como infraestrutura (não retrofit)              | **Adotar**  | Foco de teclado, contraste, `prefers-reduced-motion`, ARIA.           |
| Design tokens (cor, espaço, tipografia, raio, motion)          | **Adotar**  | Já temos cores em CSS vars; estender para sombra/raio/motion.         |
| Micro-interações **com propósito** ("explicar, não performar") | **Adotar**  | Feedback sutil em concluir/salvar/excluir; 200–300ms.                 |
| Tipografia variável + fluida (`clamp()`)                       | **Adotar**  | Carrega a identidade que hoje não aparece; escala responsiva.         |
| Progressive disclosure (mostrar o que importa agora)           | **Adotar**  | Crucial no dashboard do dia (Fase 9).                                 |
| Dark mode (workflow dark-first)                                | **Adaptar** | Fica para a Fase 12; nossos tokens já preparam. Mantemos light-first. |
| Cor expressiva / gradientes estruturais                        | **Adaptar** | Um único calor (âmbar) + acentos sóbrios; gradiente só pontual.       |
| Cores "dopamina"/neon, Y2K                                     | **Evitar**  | Brigam com "foco calmo".                                              |
| 3D/WebGL imersivo, scroll-telling                              | **Evitar**  | Peso e distração sem valor para uma agenda.                           |
| Neo-brutalismo / "agentic UI"                                  | **Evitar**  | Estética errada para o produto.                                       |

## Recomendações por área

### Tipografia

- **Carregar de fato** Bricolage Grotesque / Inter / JetBrains Mono (hoje caem em
  `system-ui`). Self-host via `@fontsource` (sem CDN). — _maior alavanca, P0._
- **Escala fluida** com `clamp()` para títulos (display) que respiram no desktop
  sem estourar no mobile.
- Display **expressivo, mas contido**: títulos de seção e datas com mais peso e
  tracking; corpo neutro (Inter); dados/horários em mono.

### Cor e tema

- Manter a **disciplina do acento**: âmbar só para o "agora"/destaque. Resto em
  teal (`primary`) + neutros.
- **Nunca cor sozinha** para status: parear com texto/ícone (ex.: prioridade,
  status de meta, "no prazo/atrasado").
- Estender os tokens para suportar **tema claro/escuro** na Fase 12 (já são CSS
  vars). Não inventar tema agora.

### Espaço, profundidade e forma

- Mais **white space** e hierarquia por tamanho/posição/espaço (não por borda).
- Introduzir **tokens de elevação** (sombras sutis) e uma **escala de raio** —
  hoje é "borda fina + plano". Cards e o drawer ganham profundidade leve.
- Cantos arredondados suaves (já temos `xl`); padronizar a escala.

### Movimento (com parcimônia)

- Micro-interações **funcionais**: feedback de conclusão, entrada do drawer
  (slide-in), transições de 200–300ms. "Explicar, não performar".
- **Sempre** respeitar `prefers-reduced-motion` (já tratado no CSS base).
- `framer-motion` é opcional e pontual (drawer, listas) — não generalizar.

### Densidade e progressive disclosure (Dashboard — Fase 9)

- Zonas: topo = o essencial do dia; meio = listas (eventos/tarefas/notas); detalhe
  sob interação. **Escaneável em ~10s.**
- Mostrar o que importa agora; o secundário entra por clique (o Inspetor da Fase
  7 já é um bom exemplo de disclosure).
- Ações **inline** (criar/editar no próprio dashboard) com feedback imediato.

### Acessibilidade (infraestrutura, não enfeite)

- Foco de teclado visível e consistente; ordem de tab lógica.
- `aria-label` nos botões só-ícone (chegam com a P0 de ícones).
- Contraste AA; suporte a zoom 200%; navegação por teclado no calendário.

## Benchmarks (o que pegar de cada um)

- **Linear** — base Radix + design system próprio ("Orbiter"); superfície sóbria,
  **um único acento** cromático, muitos componentes modulares sobre princípios
  minimais. _Pegar:_ disciplina de acento, consistência de componentes.
- **Amie** — calendário + tarefas com cor e interação **quentes**, não ocupadas.
  _Pegar:_ calor sem ruído, microinterações simpáticas.
- **Sunsama / Fantastical** — layout limpo, hierarquia clara, "focused views" que
  escondem distração. _Pegar:_ progressive disclosure, foco no dia.

## Stack e implementação (alinhado ao nosso projeto)

- **Tokens**: estender `tailwind.config.ts` + CSS vars com sombra, raio e
  timing/easing de motion.
- **Ícones**: `lucide-react` (P0).
- **Fontes**: `@fontsource/*` self-host (P0).
- **Toasts**: `sonner` (P0) — feedback de mutações/erros.
- **Primitivas acessíveis**: avaliar **Radix UI** (base do shadcn) para Dialog/
  Popover/Dropdown — útil para Inspetor, command palette (⌘K) e menus, com a11y
  pronta. Não migrar tudo para shadcn; adotar primitivas pontuais.
- **Motion**: `framer-motion` opcional, só onde agrega.
- **Reordenar tarefas**: `@dnd-kit` (o campo `Task.order` já existe e está ocioso).

## Mapeamento para o trabalho

- **Já no backlog P0** (entra na Fase 8): fontes, ícones, toasts, skeletons.
- **P1**: elevação/tokens, pílulas de status, DnD de tarefas, command palette,
  animação do Inspetor, empty states.
- **Fase 9 (Dashboard)**: aplicar densidade + progressive disclosure + ações
  inline conforme acima.
- **Fase 12**: tema claro/escuro (dark-first adaptado), P1/P2 restantes.

## Fontes

- [Figma — Top Web Design Trends](https://www.figma.com/resource-library/web-design-trends/)
- [Envato Elements — Calm interfaces, transparent AI, end of visual theatrics](https://elements.envato.com/learn/ux-ui-design-trends)
- [Tubik Studio — 7 UI Design Trends of 2026](https://tubikstudio.com/blog/ui-design-trends-2026/)
- [think.design — Dashboard Design 2026: Do's and Don'ts](https://think.design/blog/dashboard-design-in-2026-dos-and-donts/)
- [UXPin — Dashboard Design Principles (2026)](https://www.uxpin.com/studio/blog/dashboard-design-principles/)
- [Morgen — Aesthetic Calendar Apps 2026](https://www.morgen.so/blog-posts/aesthetic-calendar-app)
- [Eleken — Calendar UI Examples + UX Tips](https://www.eleken.co/blog-posts/calendar-ui)
- [LogRocket — UI libraries for the Linear aesthetic](https://blog.logrocket.com/ux-design/linear-design-ui-libraries-design-kits-layout-grid/)
- [Fontfabric — Typography Trends 2026](https://www.fontfabric.com/blog/10-design-trends-shaping-the-visual-typographic-landscape-in-2026/)
- [Recursion — UI Color Trends 2026](https://recursion.software/blog/ui-color-trends-2026)
- [Expeed — Microinteractions in 2025](https://www.expeed.com/the-evolution-of-motion-ui-how-microinteractions-shape-digital-experiences-in-2025/)
