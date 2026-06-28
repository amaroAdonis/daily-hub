# Design System

Direção visual: **"luz do dia, foco calmo"**. Uma central pessoal do dia deve
parecer organizada e tranquila, com um único ponto de calor para marcar o
"agora". Evita-se deliberadamente os clichês de UI gerada por IA (cream + serif

- terracota; preto + verde-ácido; layout de jornal).

## Cores (tokens)

Definidas como CSS variables em `apps/web/src/styles/index.css` e expostas ao
Tailwind em `tailwind.config.ts`.

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
o `accent`. Regra: o coral (`accent`) é o "gasto de ousadia" — usado só para o
hoje/destaque, nunca como cor geral.

## Tipografia

| Papel   | Fonte               | Uso                     |
| ------- | ------------------- | ----------------------- |
| Display | Bricolage Grotesque | Títulos, datas, marca   |
| Corpo   | Inter               | Texto e UI              |
| Mono    | JetBrains Mono      | Dados, horários, status |

## Princípios

- Conteúdo calmo, um único destaque por tela.
- Acessível por padrão: foco de teclado visível, `prefers-reduced-motion`
  respeitado, responsivo até mobile.
- Microinterações com parcimônia — animação demais "cheira" a template.

> A identidade será aprofundada na Fase 1, quando houver telas reais. Estes
> tokens são a base estável sobre a qual elas serão construídas.
