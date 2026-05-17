# Analytics (Mixpanel)

## Visão geral

O Etnos usa **Mixpanel** como ferramenta principal de analytics de produto. A
integração fica centralizada no pacote `@etnos/analytics`, evitando chamadas
diretas ao SDK nos apps.

| Item         | Detalhe                                                       |
| ------------ | ------------------------------------------------------------- |
| Pacote       | `packages/analytics`                                          |
| SDK web      | `mixpanel-browser` via `@etnos/analytics/web`                 |
| SDK mobile   | `mixpanel-react-native` via `@etnos/analytics/native`         |
| Token web    | `NEXT_PUBLIC_MIXPANEL_TOKEN` no `.env.local` de cada app Next |
| Token mobile | `EXPO_PUBLIC_MIXPANEL_TOKEN` em `apps/student-mobile/.env`    |

Não adicionar GA4, Amplitude ou outra ferramenta em paralelo sem alinhamento de
produto.

## Inicialização

### Web (`web`, `student`, `admin`)

O `MixpanelProvider` é montado em `packages/ui/src/providers/AppProviders.tsx`,
com `appName` identificando a origem do evento (`web`, `student` ou `admin`).

Cada app Next precisa:

1. `NEXT_PUBLIC_MIXPANEL_TOKEN` no próprio `.env.local`;
2. `@etnos/analytics` em `transpilePackages` no `next.config.ts`;
3. reinício do servidor após alterar variáveis de ambiente.

### Mobile (`student-mobile`)

A inicialização ocorre em `apps/student-mobile/providers/AppProviders.tsx`:

```ts
initMixpanelNative('student-mobile');
```

## Identidade e sessão

| Ação            | Quando                               |
| --------------- | ------------------------------------ |
| `identify(uid)` | Perfil carregado após login          |
| `people.set`    | Propriedades de perfil sincronizadas |
| `reset()`       | Logout                               |

O `uid` é o `firebaseUid` do usuário. Não enviar e-mail completo nos eventos;
use `email_domain` quando necessário.

## Eventos implementados

Propriedades comuns em todos os eventos: `app_name`, `platform`.

| Evento                        | Trigger                                                                 | Onde                                                             |
| ----------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `sign_up_completed`           | Cadastro concluído (sessão salva)                                       | `useAuth` → `onRegister`                                         |
| `character_selected`          | Escolha de personagem                                                   | `useCharacter` (web); `CharacterSelectionContext` (mobile)       |
| `game_selected`               | Escolha de jogo                                                         | `GameSelect` / `CardGame` (web); `games.tsx` (mobile)            |
| `game_finished`               | Partida concluída na UI (vitória/derrota), sem depender de salvar score | `MemoryGameExperience`, `GuessGameExperience`, `MemoryGameBoard` |
| `game_session_completed`      | Pontuação persistida (`saveGameScoreHistory`)                           | `useGames` (web); `memory.tsx` (mobile)                          |
| `password_recovery_requested` | “Esqueci minha senha” enviado com sucesso                               | `useAuth`, `ResetPasswordForm`, `AuthContext` (mobile)           |

### Propriedades por evento

| Evento                        | Propriedades adicionais                                                  |
| ----------------------------- | ------------------------------------------------------------------------ |
| `sign_up_completed`           | `sign_up_method`, `email_domain`                                         |
| `character_selected`          | `character_slug`, `character_name`                                       |
| `game_selected`               | `game_slug`, `game_name`, `character_slug`, `character_name`             |
| `game_finished`               | `game_slug`, `game_name`, `score`, `outcome` (`won` / `lost` no Amotion) |
| `game_session_completed`      | `game_slug`, `game_name`, `score`, `character_slug`                      |
| `password_recovery_requested` | `email_domain`                                                           |

`game_finished` e `game_session_completed` são eventos distintos: o primeiro
marca o fim da partida na interface; o segundo, quando o backend persiste o
histórico de pontuação.

## Como adicionar um evento

1. Defina o nome em `snake_case` em `packages/analytics/src/events.ts`.
2. Dispare com `trackMixpanelEvent` (web) ou `trackMixpanelEventNative`
   (mobile) — não chame o SDK diretamente nos apps.
3. Documente trigger, propriedades obrigatórias e possível duplicação na tabela
   acima e em `AGENTS.md`.
4. Valide no [Live View](https://mixpanel.com) do projeto.

## Arquivos-chave

- `packages/analytics/` — SDK, eventos, identidade
- `packages/tools/src/hooks/useAuth/useAuth.ts` — login, logout, cadastro
- `packages/ui/src/providers/AppProviders.tsx` — provider web
- `apps/student-mobile/providers/AppProviders.tsx` — init mobile
