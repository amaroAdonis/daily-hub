# Contatos — Fluxos

> Referência: [README.md](README.md) | [Glossário](../../GLOSSARY.md#contato)

## Índice

- Buscar contatos — digitação na busca e atualização da grade.
- Criar contato — formulário inline e atualização da lista.

## Buscar contatos

```mermaid
flowchart TD
    A["Usuário digita na busca (ContactsPage)"] --> B["useContacts({ search })"]
    B --> C["GET /contacts?search=…"]
    C --> D["API filtra por name/email/company (OR, case-insensitive)"]
    D --> E["Grade de ContactCard re-renderiza com os resultados"]
```

## Criar contato

```mermaid
flowchart TD
    A["Usuário abre ContactForm e preenche os campos"] --> B["POST /contacts (name + opcionais)"]
    B --> C["API valida (Zod) e grava vinculado ao userId"]
    C --> D["Invalida cache de contacts (TanStack Query)"]
    D --> E["ContactsPage re-renderiza com o novo contato"]
```
