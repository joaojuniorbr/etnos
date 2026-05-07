# @etnos/types

Contratos TypeScript compartilhados entre apps e packages do monorepo.

## Módulos exportados

### Entidades (`src/entities`)

- `profile`
- `admin-user`
- `character`
- `midia`
- `notification`
- `school`
- `school-game-access`
- `school-ranking`
- `school-user`
- `user-ranking`

### Jogos (`src/games`)

- `enums`
- `game`
- `game-config`
- `guess-game-content`
- `guess-game-play`
- `memory-game-content`
- `score`
- `score-history`

## Script

```bash
yarn check-types
```

## Integração no monorepo

Consumido por `apps/api`, `apps/student-mobile`, `@etnos/tools`, `@etnos/ui`,
`@etnos/games` e `@etnos/core`.
