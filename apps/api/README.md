# API (`apps/api`)

API NestJS do Etnos responsável por autenticação, domínio de jogos, escolas,
usuários, notificações e mídia.

## Stack

- NestJS 10
- Prisma + PostgreSQL
- Firebase Auth e Firebase Storage
- Sentry (`@sentry/nestjs`)
- Expo Server SDK (push notification)

## Scripts

```bash
yarn dev
yarn build
yarn start:prod
yarn lint
yarn test
yarn prisma:generate
yarn prisma:migrate:dev --name <nome>
yarn prisma:migrate:deploy
```

## Variáveis de ambiente (principais)

```env
NODE_ENV=development
PORT=3333
DATABASE_URL=
DIRECT_URL=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
FIREBASE_STORAGE_BUCKET=
SENTRY_DSN=
```

## Swagger

Com a API local em `3333`, a documentação fica em:

- `http://localhost:3333/docs`

## Endpoints principais

### Auth

- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/recovery`
- `GET /auth/profile`
- `POST /auth/profile`

### Games

- `GET /games`
- `GET /games/:gameSlug`
- `POST /games/score`
- `GET /games/score`
- `GET /games/score/:slug/:characterSlug`
- `POST /games/nps`
- `GET /games/memory/:characterSlug`
- `GET /games/memory/images/:characterSlug`
- `POST /games/memory`

### Midia

- `POST /midia/upload`
- `POST /midia/upload/multiple`
- `GET /midia`
- `GET /midia/folders`
- `DELETE /midia/:id`
- `DELETE /midia/by-url`

## Referências no monorepo

- schema e migrations: `apps/api/prisma/`
- DTO NPS: `apps/api/src/games/dto/save-game-nps.dto.ts`
- arquitetura: `docs-site/docs/games-architecture.md`
- banco/modelagem: `docs-site/docs/database-architecture.md`,
  `docs-site/docs/data-model.md`
