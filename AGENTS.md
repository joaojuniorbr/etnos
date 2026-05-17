# ETNOS — orientações para agentes

## Analytics (Mixpanel)

O produto usa **Mixpanel** como ferramenta principal de analytics (não adicionar GA4/Amplitude em paralelo sem alinhamento).

| Item | Detalhe |
| --- | --- |
| Projeto Mixpanel | `NEXT_PUBLIC_MIXPANEL_TOKEN` (web) ou `EXPO_PUBLIC_MIXPANEL_TOKEN` (mobile) em `.env.local` / `.env` — ver `.env.example` |
| SDK web | `mixpanel-browser` via `@etnos/analytics/web` |
| SDK mobile | `mixpanel-react-native` via `@etnos/analytics/native` |
| Inicialização web | `MixpanelProvider` em `packages/ui/src/providers/AppProviders.tsx` (`appName`: `web`, `student`, `admin`) |
| Inicialização mobile | `initMixpanelNative('student-mobile')` em `apps/student-mobile/providers/AppProviders.tsx` |
| Identidade | `identify(uid)` + `people.set` quando o perfil carrega; `reset()` no logout |
| Consentimento | Produto focado no Brasil; sem gate de consentimento por padrão. Se houver usuários UE/CA, aplicar `opt_out_tracking_by_default` antes do `init` (ver skill Mixpanel). |

### Eventos implementados

| Evento | Trigger | Onde |
| --- | --- | --- |
| `sign_up_completed` | Cadastro concluído (após sessão salva) | `useAuth` → `onRegister` |
| `character_selected` | Usuário escolhe um personagem | `useCharacter` → `selectCharacter` (web); `CharacterSelectionContext` (mobile) |
| `game_selected` | Usuário escolhe um jogo | `GameSelect` / `CardGame` (web); `games.tsx` (mobile) |
| `game_finished` | Partida concluída na UI (vitória/derrota), independente de salvar pontuação | `MemoryGameExperience`, `GuessGameExperience`, `MemoryGameBoard` |
| `game_session_completed` | Pontuação persistida no backend (`saveGameScoreHistory`) | `useGames` → `saveGameScoreHistory` (web); `memory.tsx` → `onSaveScoreHistory` (mobile) |
| `password_recovery_requested` | “Esqueci minha senha” enviado com sucesso | `useAuth` → `onRecoveryPass`; `ResetPasswordForm`; `AuthContext` (mobile) |

Propriedades comuns: `app_name`, `platform`. Por evento: `character_slug`, `character_name`, `game_slug`, `game_name`, `score`, `outcome` (`won` / `lost` no Adivinhe), `sign_up_method`, `email_domain` (sem e-mail completo).

### Como adicionar um evento

1. Defina o nome em `snake_case` em `packages/analytics/src/events.ts`.
2. Use `trackMixpanelEvent` (web) ou `trackMixpanelEventNative` (mobile) — não chame o SDK diretamente nos apps.
3. Documente trigger, propriedades obrigatórias e duplicação na tabela acima.
4. Valide no [Live View](https://mixpanel.com) do projeto.

### Arquivos-chave

- `packages/analytics/` — SDK, eventos, identidade
- `packages/tools/src/hooks/useAuth/useAuth.ts` — login, logout, cadastro, sync de perfil
- `packages/ui/src/providers/AppProviders.tsx` — provider web
