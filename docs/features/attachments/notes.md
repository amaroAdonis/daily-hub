# Anexos — Notas Técnicas

## Contrato da API

| Método | Rota                                   | Descrição                              | Body / Query             |
| ------ | -------------------------------------- | -------------------------------------- | ------------------------ |
| POST   | `/api/attachments/presign`             | Solicita URL de upload (PUT) + `key`   | `presignUploadSchema`    |
| POST   | `/api/attachments`                     | Registra os metadados após o upload    | `createAttachmentSchema` |
| GET    | `/api/attachments?entityType&entityId` | Lista anexos da entidade (com URL GET) | `listAttachmentsQuery`   |
| DELETE | `/api/attachments/:id`                 | Remove do storage e do banco (204)     | —                        |

Schemas Zod: `packages/shared/src/schemas/attachments.ts` (`MAX_ATTACHMENT_SIZE`
= 10 MB). Validação via `ZodValidationPipe`. Rotas autenticadas
(`@CurrentUser('id')`).

- **Solicitar URL de upload** (`presignUpload`): valida a posse via
  `EntityResolverService.exists`, gera `key = ${userId}/${uuid}-${nome}`
  (nome saneado) e devolve `presignPut(key, contentType)` + a `key`.
- **Registrar metadados** (`create`): revalida a posse, exige que a `key` comece
  com `${userId}/` (senão `403`), confirma o objeto com `stat`/`HeadObject`
  (senão `400`) e grava `size`/`contentType` reais.
- **Obter URL de download**: feito na serialização do DTO (`toDto`), que chama
  `presignGet(key)` por anexo — a listagem já vem com a `url`.
- **Deletar** (`remove`): valida posse pelo `id`/`userId`, apaga o objeto no
  storage (`delete`) e o registro no banco.

## Modelo

Entidade `Attachment` em `packages/db/prisma/schema.prisma` (polimórfica, como
`Tagging`/`EntityLink` — [D003](../../DECISIONS.md#d003)):

- `entityType` (`EntityType`) + `entityId` — sem FK para o alvo.
- `key` — objeto no bucket, prefixado pelo usuário (`${userId}/${uuid}-${nome}`).
- `filename`, `contentType`, `size`, `userId`, `createdAt`.
- Índice `@@index([userId, entityType, entityId])`; `onDelete: Cascade` no
  `user`.

## StorageService

`apps/api/src/modules/attachments/storage.service.ts` encapsula um `S3Client`
(`@aws-sdk/client-s3`) apontado às `STORAGE_*` do `.env`:

- `presignPut(key, contentType)` / `presignGet(key)` — URLs assinadas (via
  `@aws-sdk/s3-request-presigner`), expiram em `STORAGE_PRESIGNED_EXPIRES_IN`.
- `stat(key)` — `HeadObject`; devolve `size`/`contentType` reais ou `null`.
- `delete(key)` — `DeleteObjectCommand`.
- `onModuleInit` — garante o bucket no boot (`HeadBucket`/`CreateBucket`).

## UI (web)

`apps/web/src/features/attachments`:

- `api.ts` — funções HTTP tipadas (`presignUpload`, `createAttachment`,
  `listAttachments`, `deleteAttachment`) sobre `lib/api`.
- `hooks.ts` — `useAttachments`, `useUploadAttachment` (orquestra presign →
  `fetch` PUT direto ao storage → registrar) e `useDeleteAttachment` (TanStack
  Query, com toasts `sonner`).
- `components/entity-attachments.tsx` — lista (miniatura para imagens, ícone para
  o resto), baixa pela URL assinada e remove. Entra como a seção **Anexos** do
  `EntityInspector`, exibida para `TASK`/`EVENT`/`NOTE` (o botão "Conexões" dos
  cards abre o Inspetor — sem novos botões). Ver
  [integração](../integration/README.md).

## Decisões e armadilhas

- **Storage S3-compatível, polimórfico** ([D006](../../DECISIONS.md#d006)): MinIO
  local, R2 em produção; nenhum byte passa pela API.
- **`forcePathStyle: true`** — exigido pelo MinIO (bucket no path, não no host);
  mantido também para o R2.
- **MinIO ↔ R2** — trocar de ambiente é só ajustar as `STORAGE_*` (endpoint,
  região, credenciais, bucket); nenhum código muda.
- **Metadados do storage, não do cliente** — `size`/`contentType` vêm do
  `HeadObject` no registro, evitando dados forjados e registros órfãos.
- **Chave prefixada pelo usuário** — o `${userId}/` na `key` é a barreira de
  isolamento verificada no registro ([D004](../../DECISIONS.md#d004)).
