# Design Tokens

> Referência: [Design System](index.md)

Tokens definidos como CSS variables em `apps/web/src/styles/index.css` e expostos
ao Tailwind em `apps/web/tailwind.config.ts`.

## Cores

| Token     | Hex       | Uso                                     |
| --------- | --------- | --------------------------------------- |
| `bg`      | `#fbfbfd` | Fundo da aplicação (claro e frio)       |
| `surface` | `#ffffff` | Cartões e painéis                       |
| `ink`     | `#1a1c23` | Texto principal                         |
| `muted`   | `#6e7280` | Texto secundário                        |
| `border`  | `#e6e8ee` | Bordas e divisórias                     |
| `primary` | `#18646f` | Ação principal (teal/petróleo da logo)  |
| `accent`  | `#e8895a` | **Reservado** para destacar o dia atual |
| `success` | `#15803d` | Estados positivos                       |
| `danger`  | `#dc2626` | Erros e ações destrutivas               |

As cores derivam da **logo**: o teal de "Daily" é a primária; o coral de "Hub" é
o `accent`. Regra de ouro: o coral é o "gasto de ousadia" — usado só para o
hoje/destaque, nunca como cor geral. Por serem CSS vars, preparam o tema
claro/escuro da Fase 12.

## Tipografia

| Papel   | Fonte               | Uso                     |
| ------- | ------------------- | ----------------------- |
| Display | Bricolage Grotesque | Títulos, datas, marca   |
| Corpo   | Inter               | Texto e UI              |
| Mono    | JetBrains Mono      | Dados, horários, status |

Carregadas via `@fontsource` (self-host). Escala fluida com `clamp()` para
títulos que respiram no desktop sem estourar no mobile.

## Elevação (sombra)

Três níveis sutis e frios, alinhados a "foco calmo" (em `tailwind.config.ts`):

| Token               | Uso                        |
| ------------------- | -------------------------- |
| `shadow-card`       | Repouso de cards           |
| `shadow-card-hover` | Hover de cards             |
| `shadow-drawer`     | Inspetor (drawer lateral)  |
| `shadow-pop`        | Popovers / command palette |

## Raio

`rounded-xl` (`0.875rem`) e `rounded-2xl` (`1.25rem`) padronizam os cantos.

## Movimento

- Easing padrão `snappy` = `cubic-bezier(0.32, 0.72, 0, 1)` (entrada suave, saída
  rápida).
- Animações utilitárias: `fade-in` (200ms), `slide-up` (220ms).
- Helper `listItemMotion` (`apps/web/src/lib/motion.ts`) para entrada/saída de
  itens de lista com `framer-motion`, dentro de `<AnimatePresence>`.
- Tudo sob `<MotionConfig reducedMotion="user">` — respeita
  `prefers-reduced-motion`.

## Responsividade (mobile-first)

Breakpoints padrão do Tailwind (`sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280).
Diretrizes:

- **Mobile-first:** estilos base servem o telefone; refinamentos vêm com
  `sm:`/`lg:`. Espaçamento de página: `px-4 py-4 sm:px-6 lg:px-8 lg:py-6`.
- **Shell:** a barra lateral é fixa e recolhível (empurra o conteúdo) **a partir
  de `lg`**; **abaixo de `lg`** ela vira um **drawer flutuante** (overlay com
  backdrop, abre pelo hambúrguer do cabeçalho), reusando o padrão do
  `EntityInspector`.
- **Calendário (mês):** abaixo de `sm`, as células mostram só o número do dia +
  **bolinhas indicadoras**; em `sm+`, as pílulas de evento/resumo.
- **Touch:** o Kanban usa `TouchSensor` (`@dnd-kit`) para arrastar no toque sem
  travar o scroll; cards com `touch-none`.
- **Anti-zoom iOS:** campos têm `font-size: 16px` em telas ≤ 640px
  (`styles/index.css`), evitando o zoom automático do Safari ao focar.
