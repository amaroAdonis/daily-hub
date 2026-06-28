# Feature: Anexos

- **Fase:** 10
- **Status:** concluída

## Objetivo

Anexar arquivos (imagens e documentos) a tarefas, compromissos e notas, guardados
num storage S3-compatível (MinIO local, R2/S3 em produção). Os binários nunca
passam pela API: o upload e o download usam **URLs assinadas**.

## Modelo de dados

Modelo `Attachment` **polimórfico** em
[`schema.prisma`](../../packages/db/prisma/schema.prisma) (como `Tagging`):

- `entityType` + `entityId` (sem FK; integridade na camada de serviço)
- `key` (objeto no bucket, prefixado pelo usuário: `${userId}/${uuid}-${nome}`)
- `filename`, `contentType`, `size`, `userId`, `createdAt`

## Storage

`StorageService` (`apps/api/src/modules/attachments/storage.service.ts`) encapsula
um `S3Client` (`@aws-sdk/client-s3`) apontado ao endpoint do `.env`
(`STORAGE_*`), com `forcePathStyle` (exigido pelo MinIO). Cria o bucket no boot
(`ensureBucket`) e expõe `presignPut`, `presignGet`, `stat` (HeadObject) e
`delete`. O MinIO sobe pelo `docker-compose` (portas 9000/9001).

## Contrato da API

| Método | Rota                                   | Descrição                            | Body / Query             |
| ------ | -------------------------------------- | ------------------------------------ | ------------------------ |
| POST   | `/api/attachments/presign`             | URL assinada de upload (PUT) + `key` | `presignUploadSchema`    |
| POST   | `/api/attachments`                     | Registra o anexo após o upload       | `createAttachmentSchema` |
| GET    | `/api/attachments?entityType&entityId` | Lista anexos da entidade (com URL)   | query                    |
| DELETE | `/api/attachments/:id`                 | Remove do storage e do banco (204)   | —                        |

Fluxo de upload: **presign → PUT direto ao storage → registrar**. O `presign`
valida a posse da entidade via `EntityResolverService.exists`; o registro confirma
o upload com `HeadObject` e usa o `size`/`contentType` reais (sem registro órfão);
a chave é validada contra o prefixo do usuário. Schemas em
[`packages/shared/src/schemas/attachments.ts`](../../packages/shared/src/schemas/attachments.ts)
(limite de 10 MB por arquivo).

## UI (web)

`apps/web/src/features/attachments`: `useUploadAttachment` orquestra presign →
`fetch` PUT → registrar; `EntityAttachments` lista (miniatura para imagens, ícone
para o resto), baixa pela URL assinada e remove. Entra como a seção **Anexos** do
`EntityInspector`, exibida para `TASK`/`EVENT`/`NOTE` (o botão "Conexões" dos
cards já abre o Inspetor — sem novos botões).

## Critérios de aceite

- [x] Anexar arquivo a uma tarefa/compromisso/nota.
- [x] Listar, baixar e excluir anexos.
- [x] Upload direto ao storage por URL assinada (a API só valida e registra).
- [x] Isolamento por usuário (posse validada; chave prefixada pelo `userId`).

## Testes

- [x] Unit (Vitest): `attachments.service.spec.ts` cobre presign (posse + chave
      prefixada), recusa de chave alheia, recusa sem upload no storage, registro
      com metadados reais e remoção (storage + banco).
- [x] Smoke test HTTP: ciclo presign → PUT (MinIO) → registrar → listar → baixar
      → excluir, e `404` em entidade inexistente.
- [ ] E2E (Playwright): planejado para fase posterior.
