# Arquitetura de Banco de Dados

## Objetivo

Documentar como a API usa a stack de dados atual:

- `Firebase Auth` para identidade
- `Firebase Storage` para arquivos
- `PostgreSQL` para persistência de domínio
- `Prisma` para acesso ao banco

## Visão geral

A aplicação deixou de usar o Firestore como banco principal. O backend NestJS
passou a centralizar as regras de negócio e a persistir os dados no Postgres.

Fluxo principal:

`Cliente -> API NestJS -> Prisma -> PostgreSQL`

Fluxos auxiliares:

- autenticação: `Cliente -> Firebase Auth`
- autorização na API: `Firebase token -> firebase.strategy.ts`
- uploads: `API -> Firebase Storage`

## Diagrama da arquitetura

```mermaid
flowchart LR
    A["Web / App Nativo"] --> B["API NestJS"]
    B --> C["Prisma ORM"]
    C --> D["PostgreSQL"]
    A --> E["Firebase Auth"]
    E --> B
    B --> F["Firebase Storage"]
```

## Responsabilidades por tecnologia

| Tecnologia         | Papel na arquitetura                              |
| ------------------ | ------------------------------------------------- |
| `Firebase Auth`    | Login, identidade, emissão e validação de token   |
| `Firebase Storage` | Armazenamento de arquivos enviados pela aplicação |
| `PostgreSQL`       | Persistência principal dos dados de domínio       |
| `Prisma`           | ORM, schema tipado e acesso ao banco              |
| `NestJS API`       | Regras de negócio, validação e orquestração       |

### Firebase Auth

Responsável por:

- login com e-mail e senha
- login com Google
- recuperação de senha
- emissão e validação de `idToken`

O backend usa o `firebaseUid` como elo entre identidade e perfil.

### PostgreSQL

Responsável por:

- perfis de usuário
- escolas
- personagens
- configurações de jogos
- conteúdo do jogo da memória
- pontuações
- metadados de mídia

### Prisma

Responsável por:

- mapear o schema relacional
- gerar o client tipado
- padronizar queries e updates
- manter a modelagem explícita no código

Arquivo principal do schema:

- `apps/api/prisma/schema.prisma`

## Decisões de arquitetura

### 1. Auth separado de perfil

O usuário autentica no Firebase, mas o perfil de negócio fica no Postgres.

Isso permite:

- reaproveitar o mesmo backend para web e app nativo
- centralizar regras no servidor
- evoluir o domínio sem depender do SDK do Firestore

### 2. Storage separado de metadados

Os arquivos continuam no Firebase Storage, mas os metadados ficam em `midia`.

Isso permite:

- paginação e filtros no banco relacional
- vínculo com usuário
- futura troca de storage sem reestruturar o domínio

### 3. API como fonte de verdade

O frontend não deve conhecer detalhes do banco. Toda regra de acesso, validação
e persistência passa pela API.

## Benefícios da arquitetura atual

- backend mais consistente para web e app nativo
- regras de negócio centralizadas no servidor
- modelagem explícita e versionada com Prisma
- menor acoplamento do domínio ao SDK de banco do frontend
- documentação mais simples de manter

## Convenções adotadas

- nomes internos no Prisma em `camelCase`
- nomes de colunas com `@map(...)` em `snake_case`
- `createdAt` e `updatedAt` em todas as tabelas principais
- uso de índices e chaves únicas para regras de unicidade

## Relações importantes

- `users.school` funciona como referência para `schools.id`
- `users.firebase_uid` referencia a identidade do Firebase
- `memory_game_contents.character_id` aponta para `characters.id`
- `game_configs.character_slug` aponta para `characters.slug`
- `game_scores.character_slug` aponta para `characters.slug`
- `game_scores.user_id` e `midia.user_id` apontam para `users.firebase_uid`

## Operação do banco

Comandos mais usados:

```bash
yarn prisma:generate
yarn prisma:migrate:dev --name <nome-da-migration>
yarn prisma:migrate:deploy
```

## Documentos relacionados

- [Modelagem de Dados](data-model.md)
- [DDL PostgreSQL para DrawSQL](files/etnos-postgresql-ddl.sql)
