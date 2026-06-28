# Redesenho de UI/UX (frente pré-deploy)

Frente de polimento visual **antes** da Fase 12 (deploy), para a demo nascer com
cara de produto. Foco em frontend (é a especialidade do dono do projeto). Mantém
a identidade da logo (teal `#18646f`, coral `#e8895a`, Bricolage/Inter/JetBrains
Mono) e a direção "luz do dia, foco calmo" — o redesenho está na **estrutura**,
não na troca de paleta.

## Conceito-âncora: "o dia como uma linha do tempo viva"

O dia é o coração do produto. O dashboard vira uma **agenda por períodos**
(Manhã / Tarde / Noite — estilo Sunsama) com um marcador de "agora"; o mês vira
uma grade onde cada célula **conta** o que há no dia.

## Decisões alinhadas

- **Cronograma do dia:** agrupado por **Manhã / Tarde / Noite** (Sunsama), não
  régua de horas proporcional — mais leve e sem buracos em dias vazios.
- **Motion:** **vivo e expressivo** (com `framer-motion`), respeitando
  `prefers-reduced-motion`. Entrada de itens, check de tarefa, criação que
  "pousa", troca de dia/mês em cross-fade, slide-in do Inspetor.
- **Categorias de evento com cor:** entram agora. Enum dedicado (ex.: Trabalho,
  Pessoal, Saúde, Social, Estudos, Outro) com uma **paleta própria de evento**
  (distinta do teal/coral de marca, que seguem com função de UI: primary e
  "agora/hoje"). A cor pinta os blocos no cronograma e as pílulas no mês.

## Sistema visual (fundação)

- **Elevação:** 3 níveis de sombra suave (repouso → hover → drawer) + escala de
  raio padronizada (tokens no `tailwind.config.ts`).
- **Cor com função:** teal = compromisso/UI; coral = só "agora/hoje"; prioridade
  de tarefa em pílula (alta/média/baixa); categorias com a paleta de evento.
  Nunca cor sozinha — sempre com ícone/rótulo.
- **Tipografia:** horários em mono, títulos em Bricolage com mais presença,
  hierarquia por tamanho/peso (não por borda).

## Plano em blocos (implementar e validar por screenshot a cada um)

- **A — Fundação visual + fixes:** tokens de elevação/raio/motion; `framer-motion`;
  corrigir bugs pontuais (data duplicada no header, `capitalize` em "de", título
  de evento cortado, tooltip do botão de ações).
- **B — Componentes & microinterações:** ações em ícone (tooltip correto), pílulas
  de prioridade/status, hover/focus ricos, animação de check e de entrada/saída.
- **C — Backend de categorias:** enum `EventCategory` + campo no `Event` (migração),
  schemas, service; paleta de cores de evento nos tokens; seletor no formulário.
- **D — Dashboard do dia:** agenda por períodos + painel de foco (tarefas/notas/
  pessoas), com a cor de categoria e o motion.
- **E — Calendário:** grade full-bleed, células ricas (pílulas de evento com hora
  e cor, resumo de tarefas/notas), hoje com anel coral, hover eleva.
- **F — Extras:** empty states com personalidade, ⌘K (reusa a busca), drag-and-drop
  de tarefas (`Task.order` já existe), slide-in do Inspetor.

## Referências

Amie (blocos quentes, microinterações) · Sunsama/Things (planejar o dia, check
satisfatório) · Notion Calendar/Cron (densidade limpa) · Fantastical (pílulas) ·
Linear (disciplina de cor, ⌘K, consistência). Base em [`ui-direction.md`](ui-direction.md)
e [`ux-backlog.md`](ux-backlog.md).
