# @etnos/tools

Camada compartilhada de hooks, serviços HTTP e helpers para os apps web.

## Módulos principais

### Hooks (`src/hooks`)

- `useAuth`
- `useCharacter`
- `useGameScore`
- `useGames`
- `useGamesConfig`
- `useMidia`
- `useSchools`

### Services (`src/services`)

- `characters`
- `games`
- `midia`
- `notifications`
- `school`
- `users`

### Helpers (`src/helpers`)

- `api`
- `authSession`
- `errorMessage`
- `getRandomIndex`
- `phone`
- `slugfy`

## Build

Compilação feita com `esbuild` (`esbuild.js`).

## Scripts

```bash
yarn dev
yarn build
yarn test
yarn test:dev
yarn test:ui
```

## Integração no monorepo

- consumido por `apps/web`, `apps/admin`, `apps/student`, `apps/games` e
  `@etnos/ui`;
- compartilha contratos com `@etnos/types`.
