# Calendário / Agenda

- Prioridade: P0
- Status: Concluída
- Última atualização: 2026-06-28

## Visão Geral

Dá ao usuário o **hub temporal** da agenda: navegar por data em visões de mês,
semana e dia, vendo de relance o que cada dia concentra. É a camada que costura
as demais features ao eixo do dia — não introduz modelo próprio, agrega o que já
existe (tarefas, compromissos, notas) e oferece os indicadores que guiam a
navegação.

O calendário é a **landing pós-login**: clicar um dia aprofunda para o dashboard
desse dia, onde cada feature aparece com CRUD inline.

## Conceitos-Chave

- **Resumo do dia** — agregação por dia (contagem de tarefas) servida por
  `GET /calendar/summary`. Ver [Glossário](../../GLOSSARY.md#resumo-do-dia).
- **Dia** — eixo central da agenda (`YYYY-MM-DD`). Ver
  [Glossário](../../GLOSSARY.md#dia).
- **Feriado** — data nacional (Brasil/Irlanda) obtida da Nager.Date, exibida nas
  visões. Ver [Glossário](../../GLOSSARY.md#feriado).
- **Tarefa** — agregada por dia nos indicadores. Ver
  [Glossário](../../GLOSSARY.md#tarefa).
- **Compromisso** / **Ocorrência** — eventos (inclusive recorrentes) renderizados
  nas visões. Ver [Glossário](../../GLOSSARY.md#compromisso) e
  [Glossário](../../GLOSSARY.md#ocorrencia).

## Requisitos (REQ-*)

### Visões e navegação

- `REQ-CALENDAR-001` Oferecer três visões: **mês**, **semana** e **dia**.
- `REQ-CALENDAR-002` Navegar para o período anterior/seguinte conforme a visão
  (mês → mês, semana → semana, dia → dia) e voltar para "hoje".
- `REQ-CALENDAR-003` A semana começa no **domingo** (convenção brasileira).
- `REQ-CALENDAR-004` Destacar visualmente o **dia atual** (cor de destaque
  `accent`).
- `REQ-CALENDAR-005` Clicar um dia (na visão de mês ou semana) aprofunda para a
  visão de dia daquele dia.

### Agregação (resumo)

- `REQ-CALENDAR-010` Agregar, por dia de um intervalo, o total de tarefas e
  quantas estão concluídas (`GET /calendar/summary`).
- `REQ-CALENDAR-011` Omitir da resposta os dias sem nenhuma tarefa; a web
  preenche com zero.
- `REQ-CALENDAR-012` Limitar o intervalo consultável a **92 dias** (~12 semanas)
  por requisição.
- `REQ-CALENDAR-013` Na grade do mês, indicar por dia: tarefas pendentes/
  concluídas, compromissos e notas.

### Detalhe do dia

- `REQ-CALENDAR-020` Servir o detalhe agregado de um dia (`GET /calendar/day`)
  reunindo os **contatos vinculados** (via `EntityLink`) às atividades do dia —
  tarefas/notas com a data e eventos (inclusive recorrentes) com ocorrência no
  dia.
- `REQ-CALENDAR-021` Deduplicar o contato vinculado a mais de uma atividade do
  mesmo dia.

### Feriados

- `REQ-CALENDAR-030` Exibir feriados nacionais (Brasil e Irlanda) via API pública
  Nager.Date, sem chave de acesso.
- `REQ-CALENDAR-031` Na grade do mês, mostrar os feriados de cada dia; na visão de
  dia, uma faixa com os feriados daquele dia (some se não houver).
- `REQ-CALENDAR-032` Cobrir as bordas da grade que cruzam dois anos (jan/dez).

### Isolamento

- `REQ-CALENDAR-040` Toda agregação restringe-se aos dados do usuário autenticado
  ([D004](../../DECISIONS.md#d004)).

## Critérios de Aceite (AC-*)

### AC-CALENDAR-001 - Alternar entre visões (REQ-CALENDAR-001)

- **Given** o calendário aberto na visão de mês
- **When** seleciono "semana" ou "dia" no alternador
- **Then** a visão correspondente é renderizada para a data de referência

### AC-CALENDAR-002 - Navegar e voltar para hoje (REQ-CALENDAR-002, REQ-CALENDAR-004)

- **Given** uma data de referência qualquer
- **When** uso anterior/próximo e depois "hoje"
- **Then** a referência volta para a data atual, que aparece destacada

### AC-CALENDAR-003 - Resumo agrega por dia (REQ-CALENDAR-010, REQ-CALENDAR-011)

- **Given** tarefas em dias diferentes de um intervalo
- **When** chamo `GET /calendar/summary?from&to`
- **Then** recebo, por dia com ao menos uma tarefa, `{ date, total, done }`
  ordenado por data
- **And** dias sem tarefas não aparecem na resposta

### AC-CALENDAR-004 - Intervalo limitado (REQ-CALENDAR-012)

- **Given** um intervalo maior que 92 dias
- **When** chamo `GET /calendar/summary`
- **Then** recebo `400 Bad Request` e nenhuma agregação é executada

### AC-CALENDAR-005 - Clicar um dia abre o dashboard (REQ-CALENDAR-005)

- **Given** a visão de mês (ou semana)
- **When** clico numa célula de dia
- **Then** a visão muda para "dia" daquele dia, com tarefas/compromissos/notas

### AC-CALENDAR-006 - Pessoas do dia (REQ-CALENDAR-020, REQ-CALENDAR-021)

- **Given** um contato vinculado a uma tarefa e a uma nota do mesmo dia
- **When** chamo `GET /calendar/day?date=YYYY-MM-DD`
- **Then** o contato aparece **uma única vez** na lista `contacts`

### AC-CALENDAR-007 - Feriados nas visões (REQ-CALENDAR-030, REQ-CALENDAR-031)

- **Given** um dia que é feriado nacional no BR ou IE
- **When** abro a grade do mês ou a visão desse dia
- **Then** o feriado é exibido (com bandeira do país e nome local)

### AC-CALENDAR-008 - Isolamento por usuário (REQ-CALENDAR-040)

- **Given** dados de outro usuário no mesmo intervalo
- **When** chamo os endpoints de calendário
- **Then** a agregação considera apenas os dados do usuário autenticado

## Dependências

### Features relacionadas

- [Tarefas](../tasks/README.md) — base da agregação do `summary`; as visões de
  semana/dia reaproveitam `GET /tasks?date=`.
- [Compromissos](../events/README.md) — eventos e ocorrências renderizados nas
  visões e considerados no detalhe do dia.
- [Notas](../notes/README.md) — contadas nos indicadores do mês e exibidas no dia.
- [Contatos](../contacts/README.md) — "Pessoas do dia" via `EntityLink`.

### Serviços e contratos compartilhados

- `GET /api/calendar/summary`, `GET /api/calendar/day` — ver [notes](notes.md).
- Schemas Zod `packages/shared/src/schemas/calendar.ts`.
- `EntityLink` polimórfico ([D003](../../DECISIONS.md#d003)) para "Pessoas do dia".

## Cobertura de Testes

- `apps/api/src/modules/calendar/calendar.service.spec.ts` — agregação por dia
  (total/concluídas), conversão do intervalo para UTC, limite de 92 dias, caso
  vazio; e `dayContacts` (reúne contatos vinculados, deduplica, retorna vazio sem
  atividades).
- (Pendente) E2E (Playwright) — fase posterior.

## Rastreabilidade

- Decisões: [D003](../../DECISIONS.md#d003) (links polimórficos),
  [D004](../../DECISIONS.md#d004) (auth).
- Glossário: [Resumo do dia](../../GLOSSARY.md#resumo-do-dia),
  [Feriado](../../GLOSSARY.md#feriado), [Dia](../../GLOSSARY.md#dia).
- Modelo de dados: [`../../data-model.md`](../../data-model.md).

## Não Escopo

- Modelo próprio de calendário — é camada de agregação, sem entidade nova.
- Visão de agenda por horas (timeline minuto a minuto) na semana/dia.
- Sincronização real com Google Agenda (apenas link-template em
  [Compromissos](../events/README.md)).
- Outros países de feriado além de BR/IE.

## Questões em Aberto

1. O detalhe do dia (`GET /calendar/day`) hoje só reúne contatos — vale agregar
   também tags ou anexos do dia?
2. Paginar/janelar intervalos maiores que 92 dias no cliente, ou manter o limite
   por requisição?
