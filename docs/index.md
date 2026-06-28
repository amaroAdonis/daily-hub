# Daily Hub — Documentação

Agenda pessoal centrada no **dia**: tarefas, metas, anotações, compromissos e
contatos, todos interligados. Aplicação fullstack TypeScript
(React + NestJS, monorepo).

## Por onde começar

| Documento                                          | Conteúdo                                            |
| -------------------------------------------------- | --------------------------------------------------- |
| [Project Brief](PROJECT_BRIEF.md)                  | Visão, problema, público, objetivos e não-objetivos |
| [Arquitetura](ARCHITECTURE.md)                     | Monorepo, pacotes e fluxo de uma feature            |
| [Modelo de dados](data-model.md)                   | Entidades, ER e a camada de links polimórficos      |
| [Decisões](DECISIONS.md)                           | Registro de decisões de arquitetura (`D00N`)        |
| [Glossário](GLOSSARY.md)                           | Termos do domínio                                   |
| [Roadmap](ROADMAP.md)                              | Plano em fases (0–12)                               |
| [Backlog](BACKLOG.md)                              | Melhorias priorizadas e trabalho futuro             |
| [Convenções](conventions.md)                       | Padrões de código, commits e documentação           |
| [Requisitos não-funcionais](nfr/NON_FUNCTIONAL.md) | Requisitos transversais (`NFR-*`)                   |
| [Deploy](deploy.md)                                | Plano de deploy e estado em produção                |
| [Relatórios](reports/README.md)                    | Verificações/análises pontuais                      |

> **Onde o estado operacional da sessão NÃO vai:** branch, deploy, "próxima ação"
> não entram em ROADMAP/BACKLOG/DECISIONS. Isso vive no Git/PRs ou no snapshot
> **local e gitignored** `reports/CURRENT_STATE.md` (não versionado).

## Design System

[Tokens, princípios e componentes](design-system/index.md) da direção visual
"luz do dia, foco calmo".

## Features

O [índice de features](features/INDEX.md) lista todas as features com prioridade,
status e links para a documentação de cada uma (visão geral, regras, fluxos e
notas técnicas).
