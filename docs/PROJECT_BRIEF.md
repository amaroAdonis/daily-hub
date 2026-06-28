# Project Brief — Daily Hub

- Status: Ativo
- Última atualização: 2026-06-28

## Visão geral

Daily Hub é uma **agenda pessoal centrada no dia**: tarefas, metas, anotações,
compromissos e contatos, todos interligados, organizados como um calendário de
uso diário. Em vez de silos separados (um app de to-do, um de calendário, um de
notas), o produto trata o **dia** como o eixo que dá sentido a tudo — e uma
camada de links/tags conecta itens de qualquer tipo entre si.

É, também, uma **aplicação fullstack TypeScript** (React + NestJS, monorepo)
construída com cuidado de arquitetura, qualidade de código e, sobretudo,
**excelência de frontend**.

## Problema que resolve

A vida pessoal fica espalhada por ferramentas que não conversam: a tarefa não
sabe da meta, a nota não sabe da pessoa, o compromisso não sabe da tarefa. O
Daily Hub reúne tudo sob a lente do dia e permite **interligar** qualquer item a
qualquer outro, dando um "painel de itens relacionados" uniforme.

## Público-alvo

- **Uso pessoal** — quem quer planejar o dia num só lugar, com baixo atrito.
- **Pares técnicos** — a demo ao vivo e o código comunicam as decisões de
  arquitetura e o foco em frontend.

## Diferenciais

- **O dia como hub**: calendário é a porta de entrada; clicar num dia abre um
  dashboard rico (agenda por períodos + tarefas + notas + pessoas).
- **Tudo interligado**: tags transversais e links polimórficos entre entidades
  (ver [data-model](data-model.md) e [D003](DECISIONS.md#d003)).
- **Type-safety de ponta a ponta**: Zod compartilhado da borda do banco à UI.
- **Identidade visual própria** — "luz do dia, foco calmo" (ver
  [design-system](design-system/index.md)), evitando clichês de UI gerada por IA.

## Objetivos

- **Produto**: um MVP coeso e agradável de usar no dia a dia.
- **Engenharia**: código legível, decisões registradas, demo ao vivo, leitura em
  poucos minutos do "porquê" de cada escolha.

### KPIs técnicos (metas de qualidade)

- Dashboard do dia **escaneável em ~10 s**.
- `pnpm typecheck`, `pnpm test` e `pnpm lint` verdes em CI.
- Acessibilidade: foco de teclado visível, `prefers-reduced-motion` respeitado,
  contraste AA.
- Validação num único lugar (Zod), sem `class-validator`.

Formalizados como requisitos transversais em [`nfr/NON_FUNCTIONAL.md`](nfr/NON_FUNCTIONAL.md) (`NFR-*`).

## Não-objetivos

- Colaboração multiusuário em tempo real (compartilhamento, permissões).
- Sincronização bidirecional com Google/Apple Calendar via OAuth (só exportação
  por URL na Fase 11; sync real fica para uma fase própria, se desejado).
- App mobile nativo (a web é responsiva; sem React Native).
- Agente de IA embutido — ideia levantada e **adiada** por custo/escopo.

## Restrições e premissas

- **Stack fixa**: monorepo pnpm + Turborepo; React+Vite (web); NestJS (api);
  Prisma+Postgres; Zod compartilhado. Ver [ARCHITECTURE](ARCHITECTURE.md).
- **Single-user até a Fase 8**: antes da autenticação, os services resolviam o
  usuário como o primeiro do banco. A Fase 8 introduziu auth JWT real
  ([D004](DECISIONS.md#d004)).
- **Custo baixo**: deploy alvo cabe no Railway Hobby (~US$5/mês) + Cloudflare R2
  free tier ([deploy](deploy.md), [D008](DECISIONS.md#d008)).

## Riscos

- **Escopo x produto**: equilibrar polimento visual e amplitude de
  features sem inflar o backlog.
- **Polimorfismo sem FK**: `Tagging`/`EntityLink` exigem integridade na camada de
  serviço (ver [D003](DECISIONS.md#d003)).
- **Datas e timezone**: campos de "dia" trafegam como `YYYY-MM-DD` em UTC; erros
  de fuso são uma armadilha recorrente.

## Perguntas em aberto

1. Sync real com Google Calendar (OAuth) entra como fase futura?
2. Tema escuro: ativar na Fase 12 (tokens já são CSS vars)?
3. O espaço lateral livre vira painel de chat de IA no futuro?
