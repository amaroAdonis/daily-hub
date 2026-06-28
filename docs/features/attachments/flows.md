# Anexos — Fluxos

> Referência: [README.md](README.md) | [Glossário](../../GLOSSARY.md#url-assinada)

## Índice

- Upload por URL assinada — presign → PUT direto no storage → registrar.
- Download por URL assinada — listagem devolve URL assinada de GET.

## Upload por URL assinada

```mermaid
sequenceDiagram
    participant Web as Web (cliente)
    participant API as API (NestJS)
    participant S as Storage (MinIO/R2)
    Web->>API: POST /attachments/presign (entityType, entityId, filename, size)
    API->>API: valida posse (EntityResolver) + tamanho (≤10 MB)
    API->>S: getSignedUrl (PutObject)
    API-->>Web: { uploadUrl, key }
    Web->>S: PUT uploadUrl (bytes do arquivo)
    S-->>Web: 200 OK
    Web->>API: POST /attachments (entityType, entityId, key, filename)
    API->>S: HeadObject(key) → size/contentType reais
    API->>API: grava Attachment (prefixo da key validado)
    API-->>Web: AttachmentDto (com url de download)
```

## Download por URL assinada

```mermaid
sequenceDiagram
    participant Web as Web (cliente)
    participant API as API (NestJS)
    participant S as Storage (MinIO/R2)
    Web->>API: GET /attachments?entityType&entityId
    API->>S: getSignedUrl (GetObject) por anexo
    API-->>Web: AttachmentDto[] (cada um com url assinada)
    Web->>S: GET url (baixa/visualiza direto)
    S-->>Web: bytes do arquivo
```
