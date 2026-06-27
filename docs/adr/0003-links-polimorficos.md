# ADR 0003 — Links e tags polimórficos

- **Status:** aceito
- **Data:** Fase 0

## Contexto

O requisito central é **interligar todas as features**. Opções: (a) tabelas de
junção explícitas para cada par de entidades; (b) associações polimórficas
genéricas.

## Decisão

Usar duas tabelas polimórficas:

- `Tagging (tagId, entityType, entityId)` para categorização transversal.
- `EntityLink (sourceType, sourceId, targetType, targetId, relation)` para
  relações dirigidas entre quaisquer dois itens.

Relações naturais e frequentes (ex.: Task → Goal) mantêm FK própria; o
polimórfico cobre o resto.

## Consequências

- Liga qualquer item a qualquer item sem explosão de tabelas de junção.
- Sem integridade referencial via FK no alvo polimórfico — garantida na camada
  de serviço da API (validar existência antes de criar o link).
- Permite um "painel de itens relacionados" uniforme em todas as telas.
