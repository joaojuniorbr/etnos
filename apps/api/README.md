# API (apps/api)

API NestJS responsável pelo acesso a dados (Firestore e Storage) e regras de negócio dos serviços que antes viviam no front (`packages/tools/src/services`).

## Serviços migrados do front para API

- `characters`
- `schools`
- `games/config-games`
- `games/memory-game`
- `games/score-games`
- `midia`

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
