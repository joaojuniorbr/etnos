# @etnos/core

Pacote base de integração do app mobile com a API do Etnos.

## O que o pacote oferece

- cliente HTTP em `src/api/client.ts`;
- serviços de domínio em `src/services`:
  - `auth.service`
  - `characters.service`
  - `memory-game.service` (jogo da memória — Adivinhe é apenas web hoje)
  - `notifications.service`
  - `school.service`
  - `score-games.service`
- storage de sessão em `src/storage/session-storage.ts`;
- utilitários de jogo da memória em `src/memory-game`;
- analytics via `@etnos/analytics/native` no app mobile.

## Scripts

```bash
yarn build
yarn check-types
yarn test
```

## Integração no monorepo

- consumido principalmente por `apps/student-mobile`;
- compartilha contratos com `@etnos/types`.
