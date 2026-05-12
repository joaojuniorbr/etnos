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
PORT=3333
DATABASE_URL=
DIRECT_URL=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
FIREBASE_STORAGE_BUCKET=
FIREBASE_CHECK_REVOKED_TOKENS=false
SENTRY_DSN=
```

## Swagger

Com a API local em `3333`, a documentação fica em:

- `http://localhost:3333/docs`

## Métricas

Com a API local em `8080`, as métricas Prometheus ficam em:

- `http://localhost:8080/api/metrics`

Essas métricas alimentam a stack local de Grafana/Prometheus em `packages/performance`.

## Performance e observabilidade

Por padrão, a validação do Firebase ID token não consulta revogação remota a cada request (`FIREBASE_CHECK_REVOKED_TOKENS=false`). Isso evita uma chamada externa por rota autenticada durante navegação normal. Se precisar validar tokens revogados em cada requisição, configure:

```env
FIREBASE_CHECK_REVOKED_TOKENS=true
```

Logs de anomalia do teste de carga para o Sentry ficam desligados por padrão para não gerar milhares de eventos durante k6. Para ligar temporariamente:

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
