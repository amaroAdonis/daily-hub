# Glossário

Termos do domínio do Daily Hub. As features referenciam estas âncoras a partir da
seção "Conceitos-Chave". Termos novos são adicionados aqui ao surgirem.

## Termos gerais

| Termo           | Definição                                                                                                                                                                               |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dia**         | Unidade central do produto. Campos de "dia" (`@db.Date`) trafegam como `YYYY-MM-DD` e são gravados à meia-noite UTC. O calendário/dashboard agrega tudo cujo campo temporal cai no dia. |
| **Hub**         | A ideia de que o dia interliga tarefas, compromissos, notas, metas e contatos num só lugar.                                                                                             |
| **Inspetor**    | Drawer lateral que reúne tags e itens relacionados de qualquer entidade; aberto pelo botão "Conexões". Ver [integração](features/integration/README.md).                                |
| **Single-user** | Modo anterior à Fase 8 em que o usuário atual era o primeiro do banco. Substituído por autenticação real ([D004](DECISIONS.md#d004)).                                                   |

## Tarefas e metas

| Termo                                              | Definição                                                                                                                                                                                            |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="tarefa"></a>**Tarefa** (`Task`)             | Atividade de um **dia**. Tem `status`, `priority`, `order` (ordenação manual) e vínculo opcional a uma meta (`goalId`).                                                                              |
| <a id="meta"></a>**Meta** (`Goal`)                 | Objetivo com `progress`, `horizon` e `status`; pode ter sub-metas (auto-relação `parentId`) e tarefas vinculadas.                                                                                    |
| <a id="sub-meta"></a>**Sub-meta**                  | Meta filha de outra meta, via `parentId`.                                                                                                                                                            |
| <a id="horizonte"></a>**Horizonte** (`horizon`)    | Janela temporal de uma meta (ex.: curto/médio/longo prazo).                                                                                                                                          |
| <a id="status"></a>**Status** (progresso)          | Eixo comum **A fazer → Em andamento → Concluído** (`TODO`/`DOING`/`DONE`) de tarefas, compromissos e metas; metas têm ainda `ARCHIVED`. Centralizado em `lib/status.ts` ([D005](DECISIONS.md#d005)). |
| <a id="prioridade"></a>**Prioridade** (`priority`) | Importância de uma tarefa: `LOW`/`MEDIUM`/`HIGH`.                                                                                                                                                    |

## Compromissos e calendário

| Termo                                                                     | Definição                                                                                                                              |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="compromisso"></a>**Compromisso** (`Event`)                         | Evento com horário, local e recorrência opcional.                                                                                      |
| <a id="ocorrencia"></a>**Ocorrência** (`EventOccurrence`)                 | Instância de um compromisso num intervalo; eventos recorrentes são expandidos em ocorrências, cada uma referenciando o `eventId` base. |
| <a id="rrule"></a>**RRULE**                                               | Regra de recorrência (RFC 5545) guardada sem o prefixo `RRULE:`. Expandida via a lib `rrule`.                                          |
| <a id="categoria-de-evento"></a>**Categoria de evento** (`EventCategory`) | Classificação do compromisso (ex.: Trabalho, Pessoal, Saúde…) com paleta de cor própria, distinta do teal/coral de marca.              |
| <a id="feriado"></a>**Feriado**                                           | Data comemorativa nacional (Brasil/Irlanda) obtida da API pública Nager.Date, exibida no calendário e no dashboard.                    |
| <a id="resumo-do-dia"></a>**Resumo / summary**                            | Agregação por dia (contagem de tarefas, eventos, notas) servida por `GET /calendar/summary`.                                           |

## Notas, contatos e anexos

| Termo                                       | Definição                                                                                                                                              |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| <a id="anotacao"></a>**Anotação** (`Note`)  | Texto em Markdown, opcionalmente ligado a um dia; pode ser fixada.                                                                                     |
| <a id="fixada"></a>**Fixada** (`pinned`)    | Marca que mantém uma nota em destaque, independente do dia.                                                                                            |
| <a id="contato"></a>**Contato** (`Contact`) | Pessoa registrada (nome, e-mail, telefone), vinculável a eventos e notas.                                                                              |
| <a id="anexo"></a>**Anexo** (`Attachment`)  | Arquivo (documento/imagem) ligado polimorficamente a uma tarefa, compromisso ou nota; armazenado em storage S3-compatível ([D006](DECISIONS.md#d006)). |
| <a id="url-assinada"></a>**URL assinada**   | URL temporária para upload (PUT) ou download (GET) direto no storage, emitida pela API.                                                                |

## Integração

| Termo                                     | Definição                                                                                                                           |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| <a id="tag"></a>**Tag**                   | Etiqueta reutilizável, aplicável a qualquer entidade.                                                                               |
| <a id="tagging"></a>**Tagging**           | Associação polimórfica `(tagId, entityType, entityId)` entre uma tag e uma entidade ([D003](DECISIONS.md#d003)).                    |
| <a id="entitylink"></a>**EntityLink**     | Relação dirigida polimórfica `(sourceType, sourceId) → (targetType, targetId)` com `relation` opcional ([D003](DECISIONS.md#d003)). |
| <a id="ref"></a>**Ref** (`{type, id}`)    | Referência a uma entidade qualquer, resolvida em preview pelo `EntityResolverService`.                                              |
| <a id="busca-global"></a>**Busca global** | Pesquisa transversal sobre todas as entidades, base da seção Buscar e do command palette (⌘K).                                      |

## Kanban

| Termo                                | Definição                                                                                                                      |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| <a id="kanban"></a>**Kanban**        | Quadro único que controla o status (A fazer/Em andamento/Concluído) de tarefas, compromissos e metas, independente de dia/mês. |
| <a id="board-item"></a>**BoardItem** | Item normalizado do quadro (`type`: TASK/EVENT/GOAL + título + status + metadados), unificando os três tipos numa mesma forma. |
