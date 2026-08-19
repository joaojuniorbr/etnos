# App mobile

## Visão geral

O `apps/student-mobile` é o app nativo do estudante, construído com **Expo**,
**Expo Router** e **React Query**. Ele compartilha contratos e regras de negócio
com o portal web, mas usa uma camada de integração própria via `packages/core`.

## Stack

| Camada        | Tecnologia                           |
| ------------- | ------------------------------------ |
| Framework     | React Native + Expo                  |
| Navegação     | Expo Router (file-based)             |
| Estado remoto | React Query                          |
| Auth          | Firebase Auth + token na API         |
| Analytics     | `@etnos/analytics/native` (Mixpanel) |
| HTTP          | `@etnos/core`                        |

## Estrutura de pastas

```
apps/student-mobile/
├── app/                    # rotas (Expo Router)
│   ├── (app)/              # área autenticada
│   └── games/              # telas de jogos
├── components/             # UI mobile
├── contexts/               # Auth, personagem, etc.
├── providers/              # AppProviders (Query, Mixpanel, temas)
└── package.json
```

## Fluxo de autenticação

1. o usuário faz login com e-mail/senha ou Google via Firebase;
2. o `AuthContext` persiste `idToken` e dados de sessão;
3. requisições autenticadas passam pelo cliente HTTP de `@etnos/core`;
4. a API valida o token e retorna o perfil (`GET /auth/profile`);
5. no logout, a sessão local é limpa e o Mixpanel chama `reset()`.

O fluxo espelha o da web (`packages/tools/useAuth`), adaptado para storage e
ciclo de vida do app nativo.

## Seleção de personagem

O `CharacterSelectionContext` controla o personagem ativo. Ao confirmar a
escolha, dispara o evento `character_selected` no Mixpanel.

A API valida se o personagem está habilitado para a escola do estudante
(`SchoolEnabledCharacter`).

## Jogos no mobile

| Jogo            | Rota                   | Status        |
| --------------- | ---------------------- | ------------- |
| Jogo da memória | `app/games/memory.tsx` | Implementado  |
| Adivinhe        | —                      | Apenas web    |

O app lista os jogos em `app/(app)/games.tsx`; hoje apenas a memória abre tela
jogável. O Adivinhe está disponível em `apps/student` (portal web).

Eventos de analytics no mobile:

- `game_selected` ao escolher o jogo;
- `game_finished` ao terminar a partida na UI;
- `game_session_completed` ao persistir pontuação (memória).

## Notificações push

Tokens de dispositivo ficam em `user_push_tokens` (PostgreSQL). O admin envia
campanhas que geram registros em `notification_logs`.

Variáveis e permissões dependem do perfil Expo/EAS configurado no projeto.

## Variáveis de ambiente

```env
EXPO_PUBLIC_API_URL=http://localhost:8080/api
EXPO_PUBLIC_MIXPANEL_TOKEN=seu_token
EXPO_PUBLIC_FIREBASE_API_KEY=...
```

Modelo completo: `apps/student-mobile/.env.example`.

## Desenvolvimento

```bash
yarn workspace @etnos/student-mobile dev
```

## Build

O app tem script `build` no workspace (`expo export` para Android e iOS). A
saída fica em `apps/student-mobile/dist` e entra no `yarn build` da raiz via
Turborepo (`dependsOn: ^build` constrói `@etnos/core` antes).

```bash
yarn workspace @etnos/student-mobile build
```

Binários nativos (APK/IPA) continuam no EAS (`apps/student-mobile/eas.json`).
