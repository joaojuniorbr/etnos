# @etnos/tools

Camada compartilhada de hooks React Query e helpers para os apps web.

Os **serviços HTTP** ficam em `@etnos/services`; este pacote consome esses
serviços nos hooks e expõe a API reativa para os componentes.

## Módulos principais

### Hooks (`src/hooks`)

| Área | Hooks |
| :--- | :--- |
| Auth | `useAuth` |
| Personagens | `useCharacter` |
| Jogos | `useGames`, `useGameScore`, `useGuessGamePlayableContent`, `useMemoryGameContent`, `useGamesConfig`, `useMyGameAccess` |
| Conteúdo (admin) | `useGuessGameContentMutations`, `useMemoryGameContentMutations`, `useMemoryGameEditorContent` |
| Dashboard | `useStudentDashboard`, `useAdminPerformanceDashboard`, `useAdminDashboardNps`, `useAdminDashboardCharacterUsage` |
| Escolas | `useSchools`, `useManagedSchools`, `useSchoolGameAccess`, `useSchoolMutations` |
| Usuários / admin | `useAdminUsers`, `useUpdateAdminUserMutation`, `useSchoolAccessUsers` |
| Notificações | `useNotificationTemplates`, `useNotificationHistory`, `useNotificationMutations` |
| Mídia | `useMidia` |
| Histórico | `useUserGameScoreHistory` |

Lista completa em `src/hooks/index.ts`.

### Helpers (`src/helpers`)

- `api`, `errorMessage`, `getRandomIndex`, `phone`, `slugfy`

> `authSession` e demais serviços HTTP estão em `@etnos/services`.

## Build

Compilação feita com `esbuild` (`esbuild.js`).

## Scripts

```bash
yarn dev
yarn build
yarn test
yarn test:dev
yarn test:ui
yarn check-types
```

## Integração no monorepo

- consumido por `apps/web`, `apps/admin`, `apps/student`, `apps/games` e
  `@etnos/ui`;
- depende de `@etnos/services` e `@etnos/types`;
- compartilha contratos com `@etnos/types`.
