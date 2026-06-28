# Calendário / Agenda — Regras de Negócio

> Referência: [README.md](README.md) | [Glossário](../../GLOSSARY.md#resumo-do-dia)

## Visões e navegação

| Visão  | Grade                                                                       | Navegação (anterior/próximo) | Clicar um dia       |
| ------ | --------------------------------------------------------------------------- | ---------------------------- | ------------------- |
| Mês    | 6×7 a partir do início da semana do dia 1 até o fim da semana do último dia | ± 1 mês                      | abre a visão de dia |
| Semana | 7 colunas (dom→sáb)                                                         | ± 1 semana                   | abre a visão de dia |
| Dia    | dashboard do dia                                                            | ± 1 dia                      | —                   |

> A semana **começa no domingo** (`weekStartsOn: 0`). "Hoje" volta a referência
> para a data atual; o dia atual recebe a cor `accent`.

## Intervalo consultável (`from`/`to`)

| Visão  | `from` / `to`                                                            |
| ------ | ------------------------------------------------------------------------ |
| Mês    | primeiro/último dia da **grade visível** (inclui dias de meses vizinhos) |
| Semana | domingo/sábado da semana de referência                                   |
| Dia    | o próprio dia (`from == to`)                                             |

| Regra         | Detalhe                                              |
| ------------- | ---------------------------------------------------- |
| Inclusividade | intervalo `from..to` inclusivo dos dois extremos     |
| Limite        | máx. **92 dias** por requisição; acima disso → `400` |
| Validação     | `from <= to` (refine no schema Zod)                  |

## Agregação do resumo (`GET /calendar/summary`)

| Entrada              | Saída                                            |
| -------------------- | ------------------------------------------------ |
| intervalo `from..to` | `DaySummary[]` = `{ date, total, done }` por dia |
| dia sem tarefa       | **omitido** da resposta (web preenche com zero)  |
| ordenação            | por `date` ascendente                            |

> Duas agregações no banco (`groupBy date`): total de tarefas e tarefas `DONE`.
> Os indicadores do mês combinam esse resumo com eventos e contagem de notas.

## Indicadores da grade do mês

| Item                       | Origem                                             | Como aparece                   |
| -------------------------- | -------------------------------------------------- | ------------------------------ |
| Tarefas pendentes          | `summary.total − summary.done`                     | "N tarefa(s)" com ponto neutro |
| Tarefas concluídas (todas) | `summary.done == total > 0`                        | "N ✓" em verde                 |
| Compromissos               | ocorrências de eventos (até 3 pílulas + "+N mais") | pílula com cor da categoria    |
| Notas                      | contagem de notas com a data                       | "N nota(s)" com ponto `accent` |
| Feriado                    | Nager.Date                                         | pílula com bandeira + nome     |

## Detalhe do dia (`GET /calendar/day`)

| Atividade considerada | Critério                                                           |
| --------------------- | ------------------------------------------------------------------ |
| Tarefas               | `date == dia`                                                      |
| Notas                 | `date == dia`                                                      |
| Eventos únicos        | sobrepõem o dia (`startsAt <= fimDoDia` e `endsAt >= inícioDoDia`) |
| Eventos recorrentes   | RRULE expandida tem ocorrência no dia                              |

| Regra         | Detalhe                                                                                       |
| ------------- | --------------------------------------------------------------------------------------------- |
| Vínculo       | contato ligado por `EntityLink` a qualquer atividade do dia ([D003](../../DECISIONS.md#d003)) |
| Direção       | o `CONTACT` pode estar no `source` ou no `target` do link                                     |
| Deduplicação  | contato vinculado a várias atividades aparece **uma vez**                                     |
| Sem atividade | retorna `{ date, contacts: [] }` sem consultar links                                          |

## Feriados (Nager.Date)

| País    | Código | Nome exibido                                  | Abrangência                         |
| ------- | ------ | --------------------------------------------- | ----------------------------------- |
| Brasil  | `BR`   | nome **local** (PT)                           | grade do mês inteiro + faixa do dia |
| Irlanda | `IE`   | nome **internacional** (local vem em gaélico) | grade do mês inteiro + faixa do dia |

| Regra         | Detalhe                                                                  |
| ------------- | ------------------------------------------------------------------------ |
| Fonte         | API pública `date.nager.at` (sem chave)                                  |
| Cache         | "infinito" (`staleTime`/`gcTime` = Infinity) — feriados do ano não mudam |
| Falha de rede | tratada como "sem feriados" (lista vazia), não quebra a visão            |
| Bordas de ano | a grade do mês busca os feriados do ano do primeiro e do último dia      |

## Dia e fuso

| Regra           | Detalhe                                                     |
| --------------- | ----------------------------------------------------------- |
| Trânsito        | dias trafegam como `YYYY-MM-DD`                             |
| Filtro no banco | convertido para meia-noite **UTC** (`@db.Date`)             |
| Web             | `Date` local construído a partir de `YYYY-MM-DD` (date-fns) |
