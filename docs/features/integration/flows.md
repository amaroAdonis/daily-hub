# Integração — Fluxos

> Referência: [README.md](README.md) | [Glossário](../../GLOSSARY.md#inspetor)

## Índice

- Abrir o Inspetor de um card — carrega tags + itens relacionados.
- Busca global → resultado → abre Inspetor (ou navega).
- Command palette (⌘K) — busca em overlay, navegação por teclado.

## Abrir o Inspetor de um card

```mermaid
flowchart TD
    A["Clica em 'Conexões' num card"] --> B["ConnectionsButton.open({type,id,title})"]
    B --> C["InspectorProvider monta o drawer (1 por vez)"]
    C --> D["GET /tags/entity?entityType&entityId"]
    C --> E["GET /links?entityType&entityId"]
    D --> F["EntityTags: tags do item (aplicar/remover)"]
    E --> G["EntityResolver resolve refs → previews"]
    G --> H["RelatedItems: relacionados (mão dupla) + buscar p/ vincular"]
```

## Busca global → resultado → Inspetor

```mermaid
flowchart TD
    A["Digita na seção Buscar"] --> B["GET /search?q="]
    B --> C["Service consulta as 5 entidades em paralelo"]
    C --> D["Previews uniformes {type,id,title,subtitle}"]
    D --> E{"Resultado escolhido"}
    E -->|item| F["openInspector(item) → drawer de conexões"]
    E -->|tag| G["GET /tags/:id/items → lista itens da tag"]
```

## Command palette (⌘K)

```mermaid
flowchart LR
    A["⌘K / Ctrl+K"] --> B["Overlay de busca abre e foca o campo"]
    B --> C["Digita → GET /search?q= (debounced via query)"]
    C --> D["Lista navegável: ↑/↓ move, Enter confirma, Esc fecha"]
    D -->|Enter| E["openInspector(item) → fecha o overlay"]
```
