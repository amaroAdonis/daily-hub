<!--
  Modelo de README de feature. Copie a pasta _template/ para features/<feature>/
  e preencha. Sem front-matter YAML — os metadados ficam nas 3 linhas abaixo do
  título. Remova estes comentários ao preencher.
-->

# <Nome da feature>

- Prioridade: P0 | P1 | P2
- Status: Concluída | Em desenvolvimento | Planejada
- Última atualização: YYYY-MM-DD

## Visão Geral

<!-- 1–3 parágrafos: o que a feature resolve, escopo e diferencial. -->

## Conceitos-Chave

<!-- Termos do domínio, com link para o Glossário. Ex.: -->

- **Termo** — definição curta. Ver [Glossário](../../GLOSSARY.md#ancora).

## Requisitos (REQ-*)

<!-- Agrupados por tema. Cada item é um REQ-<FEATURE>-NNN. -->

### <Tema>

- `REQ-<FEATURE>-001` Descrição do requisito (estilo "o sistema deve…").
- `REQ-<FEATURE>-002` …

## Critérios de Aceite (AC-*)

### AC-<FEATURE>-001 - Título (REQ-<FEATURE>-001)

- **Given** pré-condição
- **When** ação
- **Then** resultado esperado

## Dependências

### Features relacionadas

- [<Feature>](../<feature>/README.md) — motivo.

### Serviços e contratos compartilhados

- `Endpoint` / `Service.metodo()` — propósito.

## Cobertura de Testes

- `apps/api/src/modules/<feature>/<feature>.service.spec.ts` — o que cobre.
- (Pendente) E2E (Playwright) — fase posterior.

## Rastreabilidade

- Decisões: [`../../DECISIONS.md`](../../DECISIONS.md)
- Glossário: [`../../GLOSSARY.md`](../../GLOSSARY.md)
- Modelo de dados: [`../../data-model.md`](../../data-model.md)

## Não Escopo

- O que deliberadamente fica de fora.

## Questões em Aberto

1. Pergunta pendente?
