# @etnos/student-mobile (`apps/student-mobile`)

Aplicativo nativo do estudante (iOS, Android e Web) construído com Expo.

## Stack

- Expo SDK 55 + React Native 0.83
- Expo Router + React Navigation
- React Query
- `@etnos/core`, `@etnos/types`, `@etnos/analytics`
- `twrnc` para estilos utilitários
- `expo-notifications` para notificações push

## Scripts

```bash
yarn dev
yarn start
yarn android
yarn ios
yarn web
yarn build
yarn lint
yarn check-types
```

O `yarn build` gera o bundle de produção (Android e iOS) em `dist/` via
`expo export`. Ele entra no `yarn build` da raiz do monorepo (Turborepo), que
primeiro constrói `@etnos/core`.

Na raiz:

```bash
yarn workspace @etnos/student-mobile build
```

Script especial para build EAS (binário nativo na nuvem):

```bash
yarn eas-build-post-install
```

## Estrutura de rotas

```text
app/
  (auth)/
    login.tsx
  (app)/
    index.tsx
    characters.tsx
    games.tsx
    profile.tsx
  games/
    memory.tsx
```

## Jogos

| Jogo | Rota | Status |
| :--- | :--- | :--- |
| Jogo da memória | `app/games/memory.tsx` | Implementado |
| Adivinhe | — | Disponível apenas no portal web (`apps/student`) |

## Variáveis de ambiente

Criar `apps/student-mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:8080/api
EXPO_PUBLIC_MIXPANEL_TOKEN=
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

Modelo completo: `apps/student-mobile/.env.example`.

## EAS Build

Configuração em `apps/student-mobile/eas.json`:

- perfis: `development`, `preview`, `production`
- Node: `22.14.0`

## Integração no monorepo

- `@etnos/core`: cliente HTTP, serviços de domínio e storage de sessão;
- `@etnos/analytics`: Mixpanel nativo;
- `@etnos/types`: contratos compartilhados;
- `apps/api`: backend consumido pelo app.

Arquitetura: `docs-site/docs/mobile-architecture.md`.
