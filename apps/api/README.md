# API (apps/api)

API NestJS responsável pelo acesso a dados e regras de negócio dos serviços que antes viviam no front (`packages/tools/src/services`).

## Stack de dados

- `Firebase Auth` para autenticação e validação de token
- `Firebase Storage` para upload e remoção de arquivos
- `PostgreSQL` como banco principal da aplicação
- `Prisma` como ORM e camada de acesso a dados

Hoje o Firestore não é mais a fonte principal de persistência da aplicação. Os dados de domínio ficam no Postgres, enquanto o Firebase permanece como infraestrutura de autenticação e storage.

## Banco de dados

O schema da aplicação está em [`prisma/schema.prisma`](./prisma/schema.prisma).

Variáveis principais:

- `DATABASE_URL`: conexão usada pela aplicação
- `DIRECT_URL`: conexão direta usada pelo Prisma em migrations

Comandos úteis:

```bash
yarn prisma:generate
yarn prisma:migrate:dev --name <nome-da-migration>
yarn prisma:migrate:deploy
```

Documentação complementar:

- [`../../docs-site/docs/database-architecture.md`](../../docs-site/docs/database-architecture.md)
- [`../../docs-site/docs/data-model.md`](../../docs-site/docs/data-model.md)
- [`../../docs-site/docs/auth-architecture.md`](../../docs-site/docs/auth-architecture.md)
- [`../../docs-site/docs/media-architecture.md`](../../docs-site/docs/media-architecture.md)
- [`../../docs-site/docs/games-architecture.md`](../../docs-site/docs/games-architecture.md)
- [`../../docs-site/docs/swagger.md`](../../docs-site/docs/swagger.md)

## Swagger

A API expõe a documentação interativa em:

- `/docs`

Em ambiente local, com a API rodando na porta padrão:

- `http://localhost:8080/docs`

Os endpoints da aplicação continuam com o prefixo global `api`, então a UI do
Swagger documenta rotas como `/api/auth/login`, `/api/games/score` e
`/api/midia/upload`.

## Serviços migrados do front para API

- `characters`
- `schools`
- `games/config-games`
- `games/memory-game`
- `games/score-games`
- `midia`

## Arquitetura atual

Fluxo principal:

`frontend/app nativo -> API NestJS -> Prisma -> PostgreSQL`

Fluxos complementares:

- autenticação: `frontend -> Firebase Auth -> API`
- arquivos: `API -> Firebase Storage`

## Endpoints principais

### Auth

- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/recovery`
- `GET /auth/profile` (autenticado)
- `POST /auth/profile` (autenticado)

### Characters

- `GET /characters`
- `GET /characters/:slug`
- `POST /characters`
- `PATCH /characters/:id`

### Schools (autenticado)

- `GET /schools`
- `GET /schools/:id`
- `POST /schools`
- `PATCH /schools/:id`
- `DELETE /schools/:id`

### Games (autenticado)

- `GET /games`
- `GET /games/:gameSlug`
- `GET /games/config/by-game/:gameSlug`
- `GET /games/config/:gameSlug/:characterSlug`
- `POST /games/config`
- `DELETE /games/config/:gameSlug/:characterSlug`
- `GET /games/memory/:characterSlug`
- `GET /games/memory/images/:characterSlug`
- `POST /games/memory`
- `DELETE /games/memory/:id`
- `POST /games/score`
- `GET /games/score`
- `GET /games/score/:slug/:characterSlug`

### Midia (autenticado)

- `POST /midia/upload` (multipart, campo `file`)
- `POST /midia/upload/multiple` (multipart, campo `files[]`)
- `GET /midia?limit=10&page=1&folder=...`
- `GET /midia/folders`
- `POST /midia`
- `DELETE /midia/by-url?url=...`
- `DELETE /midia/:id`

## Testes unitários

Rodar em `apps/api`:

```bash
yarn test
```

Arquivos de teste relevantes desta migração:

- `src/characters/characters.service.spec.ts`
- `src/games/games.service.spec.ts`
- `src/games/games.controller.spec.ts`
- `src/schools/schools.service.spec.ts`
- `src/schools/schools.controller.spec.ts`
- `src/midia/midia.service.spec.ts`
- `src/midia/midia.controller.spec.ts`

## Observações

- a API mantém compatibilidade com o fluxo atual de autenticação do frontend
- o perfil do usuário agora é persistido no Postgres e vinculado ao `firebaseUid`
- a modelagem relacional fica centralizada no Prisma, o que facilita manutenção e documentação
