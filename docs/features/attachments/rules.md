# Anexos — Regras de Negócio

> Referência: [README.md](README.md) | [Glossário](../../GLOSSARY.md#anexo)

## Fluxo de URL assinada

| Passo | Quem          | Ação                                                                 |
| ----- | ------------- | -------------------------------------------------------------------- |
| 1     | Web → API     | pede URL de upload (`POST /attachments/presign`); API valida a posse |
| 2     | API → Web     | devolve `uploadUrl` (PUT assinado) + `key` (prefixada pelo usuário)  |
| 3     | Web → Storage | envia o arquivo **direto** ao storage via PUT na URL assinada        |
| 4     | Web → API     | registra os metadados (`POST /attachments`)                          |
| 5     | API → Storage | confirma o objeto (`HeadObject`) e grava `size`/`contentType` reais  |

> **Nenhum byte de arquivo passa pela API** — ela só valida, emite URLs e
> registra metadados ([D006](../../DECISIONS.md#d006)).

## Tipos de entidade suportados

| `entityType` | Entidade    | Feature                       |
| ------------ | ----------- | ----------------------------- |
| `TASK`       | Tarefa      | [tasks](../tasks/README.md)   |
| `EVENT`      | Compromisso | [events](../events/README.md) |
| `NOTE`       | Nota        | [notes](../notes/README.md)   |

## Validações e isolamento

| Regra                     | Detalhe                                                              |
| ------------------------- | -------------------------------------------------------------------- |
| Posse da entidade         | `EntityResolverService.exists` no presign e no registro; senão `404` |
| Prefixo da chave          | a `key` precisa começar com `${userId}/`; senão `403`                |
| Tamanho máximo            | 10 MB por arquivo, validado no presign (`MAX_ATTACHMENT_SIZE`)       |
| Metadados confiáveis      | `size`/`contentType` lidos via `HeadObject`, não do cliente          |
| Sem upload → sem registro | `HeadObject` ausente recusa o registro (sem órfão) → `400`           |

## Storage (ambientes)

| Ambiente | Backend             | Configuração                                           |
| -------- | ------------------- | ------------------------------------------------------ |
| Local    | **MinIO** (compose) | `STORAGE_*` no `.env` (portas 9000 API / 9001 console) |
| Produção | **Cloudflare R2**   | só trocar as `STORAGE_*` (nenhum código muda)          |

> O `S3Client` usa `forcePathStyle: true` (exigido pelo MinIO) e o bucket é
> criado no boot da API (`StorageService` → `ensureBucket`/`onModuleInit`).
