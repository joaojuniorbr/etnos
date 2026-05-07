# @etnos/student-mobile (`apps/student-mobile`)

Aplicativo nativo do estudante (iOS, Android e Web) construído com Expo.

## Stack

- Expo SDK 55 + React Native 0.83
- Expo Router + React Navigation
- React Query
- `@etnos/core` e `@etnos/types`
- `twrnc` para estilos utilitários
- `expo-notifications` para notificações push

## Scripts

```bash
yarn dev
yarn start
yarn android
yarn ios
yarn web
yarn lint
yarn check-types
```

Script especial para build EAS:

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

## Variáveis de ambiente

Definir `.env` conforme o ambiente de execução do app, incluindo URL da API e
configuração Firebase usada pelos fluxos de autenticação e dados.

## EAS Build

Configuração em `apps/student-mobile/eas.json`:

- perfis: `development`, `preview`, `production`
- Node: `22.14.0`

## Integração no monorepo

- `@etnos/core`: cliente HTTP, serviços de domínio e storage de sessão;
- `@etnos/types`: contratos compartilhados;
- `apps/api`: backend consumido pelo app.
