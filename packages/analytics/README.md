# @etnos/analytics

Integração Mixpanel compartilhada do monorepo ETNOS.

## Token (variáveis de ambiente)

O `.env` **precisa ficar em cada app**, não só na raiz do monorepo. Pacotes (`packages/analytics`) **não leem** `.env` sozinhos.

### Por que não “chega” no package?

1. O Next só carrega `.env.local` da pasta do app (`apps/student`, etc.).
2. Variáveis `NEXT_PUBLIC_*` precisam ser lidas no app (ou em pacotes listados em `transpilePackages`).
3. O `MixpanelProvider` recebe o token via `process.env.NEXT_PUBLIC_MIXPANEL_TOKEN` em `AppProviders` (`@etnos/ui`).

### O que configurar

**Next.js** — `apps/<app>/.env.local` (um arquivo por app que você roda):

```env
NEXT_PUBLIC_MIXPANEL_TOKEN=seu_token_mixpanel
```

**Expo** — `apps/student-mobile/.env`:

```env
EXPO_PUBLIC_MIXPANEL_TOKEN=seu_token_mixpanel
```

Reinicie o `yarn dev` após alterar o `.env`.

### Checklist se o Mixpanel não inicializar

- [ ] Arquivo é `.env.local` (Next) na pasta do app, ex.: `apps/student/.env.local`
- [ ] Nome exato: `NEXT_PUBLIC_MIXPANEL_TOKEN` (com prefixo `NEXT_PUBLIC_`)
- [ ] `@etnos/analytics` está em `transpilePackages` no `next.config.ts` do app
- [ ] Servidor reiniciado após salvar o `.env`

## Uso

### Web (Next.js)

```tsx
import { MixpanelProvider } from '@etnos/analytics/web';

<MixpanelProvider appName="student">{children}</MixpanelProvider>
```

Tracking:

```ts
import { trackMixpanelEvent } from '@etnos/analytics/web';

trackMixpanelEvent('my_event', { foo: 'bar' });
```

### Mobile (Expo)

```ts
import { initMixpanelNative, trackMixpanelEventNative } from '@etnos/analytics/native';

await initMixpanelNative('student-mobile');
await trackMixpanelEventNative('my_event', { foo: 'bar' });
```

## Verificação

1. Suba um app (ex.: `yarn workspace @etnos/student dev`).
2. Abra [Mixpanel → Live View](https://mixpanel.com).
3. Dispare `sign_up_completed` (cadastro), `game_finished` (terminar partida) ou `game_session_completed` (pontuação salva no backend).
