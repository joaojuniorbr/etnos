# API (`apps/api`)

API NestJS do Etnos responsável por autenticação, domínio de jogos, escolas,
usuários, notificações e mídia.

## Stack

- NestJS 10
- Prisma + PostgreSQL
- Firebase Auth e Firebase Storage
- Sentry (`@sentry/nestjs`)
- Prometheus metrics (`prom-client`)
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
PORT=8080
DATABASE_URL=
DIRECT_URL=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
FIREBASE_STORAGE_BUCKET=
FIREBASE_CHECK_REVOKED_TOKENS=false
SENTRY_DSN=
```

O Sentry fica **desligado em `NODE_ENV=development`**, mesmo com `SENTRY_DSN` definido. Em staging/produção, configure o DSN para habilitar traces, profiling e captura de erros.

## Swagger

Com a API local na porta padrão (`8080`):

- **Swagger UI:** `http://localhost:8080/docs`
- **Base da API:** `http://localhost:8080/api`

Se `PORT=3333` no `.env`, ajuste as URLs para `http://localhost:3333`.

## Métricas

- `http://localhost:8080/api/metrics` (Prometheus)

Essas métricas alimentam a stack local de Grafana/Prometheus em `packages/performance`.

## Performance e observabilidade

Por padrão, a validação do Firebase ID token não consulta revogação remota a cada request (`FIREBASE_CHECK_REVOKED_TOKENS=false`). Para validar tokens revogados em cada requisição:

```env
FIREBASE_CHECK_REVOKED_TOKENS=true
```

Logs de anomalia do teste de carga para o Sentry ficam desligados por padrão:

```env
SENTRY_LOAD_TEST_ANOMALY_LOGS=true
```

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
- `GET /games/config/:gameSlug/:characterSlug`
- `POST /games/config`
- `POST /games/score`
- `POST /games/score/history`
- `GET /games/score`
- `GET /games/score/history`
- `GET /games/score/:slug/:characterSlug`
- `POST /games/nps`
- `GET /games/nps/:slug`
- `GET /games/memory/:characterSlug`
- `GET /games/memory/images/:characterSlug`
- `POST /games/memory`
- `DELETE /games/memory/:id`
- `GET /games/guess/:characterSlug`
- `GET /games/guess/play/:characterSlug`
- `POST /games/guess`
- `POST /games/guess/validate`
- `DELETE /games/guess/:id`

### Midia

- `POST /midia/upload`
- `POST /midia/upload/multiple`
- `GET /midia`
- `GET /midia/folders`
- `DELETE /midia/:id`
- `DELETE /midia/by-url`

## Referências no monorepo

- schema e migrations: `apps/api/prisma/`
- arquitetura: `docs-site/docs/games-architecture.md`
- banco/modelagem: `docs-site/docs/database-architecture.md`,
  `docs-site/docs/data-model.md`
