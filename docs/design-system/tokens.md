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
