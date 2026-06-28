# Anexos

- Prioridade: P1
- Status: Concluída
- Última atualização: 2026-06-28

## Visão Geral

Permite anexar arquivos (imagens e documentos) a **tarefas, compromissos e
notas**, guardados num storage S3-compatível (MinIO local, R2/S3 em produção).
Os binários **nunca passam pela API**: tanto o upload quanto o download usam
[URLs assinadas](../../GLOSSARY.md#url-assinada) — o cliente fala direto com o
storage e a API apenas valida a posse, emite as URLs e registra os metadados.

O modelo segue o polimorfismo já usado em tags e links
([D003](../../DECISIONS.md#d003)): um único registro `Attachment`
(`entityType` + `entityId`) liga o arquivo a qualquer um dos tipos suportados.

## Conceitos-Chave

- **Anexo** — arquivo ligado polimorficamente a uma tarefa, compromisso ou nota.
  Ver [Glossário](../../GLOSSARY.md#anexo).
- **URL assinada** — URL temporária para upload (PUT) ou download (GET) direto no
  storage, emitida pela API. Ver [Glossário](../../GLOSSARY.md#url-assinada).

## Requisitos (REQ-*)

### Modelo polimórfico

- `REQ-ATTACHMENTS-001` O anexo é polimórfico: `entityType` + `entityId`, sem FK
  para o alvo (integridade na camada de serviço) — segue
  [D003](../../DECISIONS.md#d003).
- `REQ-ATTACHMENTS-002` Cada anexo guarda a `key` do objeto no bucket, prefixada
  pelo usuário (`${userId}/${uuid}-${nome}`).

### Tipos de entidade suportados

- `REQ-ATTACHMENTS-003` São suportados anexos em **tarefas** (`TASK`),
  **compromissos** (`EVENT`) e **notas** (`NOTE`).

### Metadados

- `REQ-ATTACHMENTS-004` Cada anexo guarda `filename`, `contentType`, `size`,
  `userId` e `createdAt`.
- `REQ-ATTACHMENTS-005` `contentType` e `size` registrados são os **reais** do
  objeto no storage (lidos via `HeadObject`), não os informados pelo cliente.

### Upload por URL assinada

- `REQ-ATTACHMENTS-010` Solicitar uma URL assinada de upload (PUT) e a `key`
  gerada, validando antes a posse da entidade alvo.
- `REQ-ATTACHMENTS-011` O cliente envia o arquivo **direto ao storage** pela URL
  assinada; nenhum byte de arquivo passa pela API.
- `REQ-ATTACHMENTS-012` Registrar o anexo após o upload, confirmando-o no storage
  (`HeadObject`); sem confirmação não há registro órfão.
- `REQ-ATTACHMENTS-013` Limite de **10 MB** por arquivo (validado no presign).

### Download por URL assinada

- `REQ-ATTACHMENTS-020` A listagem de anexos devolve, para cada um, uma URL
  assinada de download (GET) — usada para baixar/visualizar direto no storage.

### Isolamento

- `REQ-ATTACHMENTS-030` Operações restritas aos anexos do usuário autenticado
  ([D004](../../DECISIONS.md#d004)); a posse da entidade alvo é validada e a
  `key` é checada contra o prefixo do próprio usuário.

## Critérios de Aceite (AC-*)

### AC-ATTACHMENTS-001 - Anexar arquivo a uma entidade suportada (REQ-ATTACHMENTS-003, REQ-ATTACHMENTS-010, REQ-ATTACHMENTS-011, REQ-ATTACHMENTS-012)

- **Given** uma tarefa/compromisso/nota do usuário
- **When** peço o presign, envio o arquivo (PUT) à URL assinada e registro o anexo
- **Then** o anexo é criado, ligado à entidade, e nenhum byte passou pela API

### AC-ATTACHMENTS-002 - Metadados reais do storage (REQ-ATTACHMENTS-004, REQ-ATTACHMENTS-005, REQ-ATTACHMENTS-012)

- **Given** um upload concluído no storage
- **When** registro o anexo
- **Then** `size` e `contentType` gravados são os lidos via `HeadObject`
- **And** se o objeto não existe no storage, o registro é recusado (sem órfão)

### AC-ATTACHMENTS-003 - Baixar por URL assinada (REQ-ATTACHMENTS-020)

- **Given** anexos registrados numa entidade
- **When** chamo `GET /attachments?entityType&entityId`
- **Then** cada anexo vem com uma `url` assinada de download válida

### AC-ATTACHMENTS-004 - Limite de tamanho (REQ-ATTACHMENTS-013)

- **Given** um arquivo acima de 10 MB
- **When** peço o presign
- **Then** recebo erro de validação ("Arquivo acima de 10 MB")

### AC-ATTACHMENTS-005 - Isolamento por usuário (REQ-ATTACHMENTS-030)

- **Given** uma entidade de outro usuário ou uma `key` fora do meu prefixo
- **When** tento gerar o presign ou registrar o anexo
- **Then** recebo `404` (entidade alheia) ou `403` (chave alheia)

## Dependências

### Features relacionadas

- [Integração](../integration/README.md) — o `EntityResolverService` valida a
  posse/existência da entidade alvo (`{type, id}`).
- [Tarefas](../tasks/README.md), [Compromissos](../events/README.md) e
  [Notas](../notes/README.md) — entidades às quais um anexo pode ser ligado.

### Serviços e contratos compartilhados

- `POST/GET/DELETE /api/attachments` (+ `POST /api/attachments/presign`) — ver
  [notes](notes.md).
- Schemas Zod `packages/shared/src/schemas/attachments.ts`.
- `StorageService` (S3-compatível) — ver [rules](rules.md) e [notes](notes.md).

## Cobertura de Testes

- `apps/api/src/modules/attachments/attachments.service.spec.ts` — presign (posse
  - chave prefixada), recusa de chave alheia, recusa sem upload no storage,
    registro com metadados reais e remoção (storage + banco).
- Smoke test HTTP: ciclo presign → PUT (MinIO) → registrar → listar → baixar →
  excluir, e `404` em entidade inexistente.
- (Pendente) E2E (Playwright) — fase posterior.

## Rastreabilidade

- Decisões: [D006](../../DECISIONS.md#d006) (storage S3-compatível, polimórfico),
  [D003](../../DECISIONS.md#d003) (polimorfismo), [D004](../../DECISIONS.md#d004)
  (auth/isolamento).
- Glossário: [Anexo](../../GLOSSARY.md#anexo),
  [URL assinada](../../GLOSSARY.md#url-assinada).
- Modelo de dados: [`../../data-model.md`](../../data-model.md).

## Não Escopo

- Antivírus / verificação de conteúdo dos arquivos enviados.
- Versionamento de anexos ou histórico de substituições.
- Anexos em outras entidades (metas, contatos) — fora dos três tipos atuais.
- Sync real do Google ([D007](../../DECISIONS.md#d007)) — frente própria.

## Questões em Aberto

1. Convém limitar `contentType` a uma allowlist (imagens/PDF/docs) no presign?
2. Limpeza de objetos órfãos (upload sem registro) — job periódico ou TTL no
   bucket?
