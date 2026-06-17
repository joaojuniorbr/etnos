# @etnos/admin (`apps/admin`)

Painel administrativo do Etnos para gestão de conteúdo, usuários e operação da
plataforma.

## Responsabilidades

- gerenciar escolas e usuários;
- gerenciar personagens, jogos e configurações;
- administrar biblioteca de mídias;
- publicar notificações push;
- acompanhar performance e NPS (`AdminPerformanceDashboard` na home).

## Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4
- `@etnos/ui`, `@etnos/tools`, `@etnos/types`, `@etnos/analytics`

## Scripts

```bash
yarn dev
yarn build
yarn start
yarn lint
yarn check-types
```

## Desenvolvimento local

Executar em `http://localhost:3001`:

```bash
yarn dev
```

## Variáveis de ambiente

Criar `apps/admin/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_MIXPANEL_TOKEN=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Estrutura funcional (resumo)

Rotas sob o layout autenticado (prefixo `/admin` na navegação):

- `app/page.tsx`: dashboard de performance.
- `app/escolas`: gestão de escolas.
- `app/usuarios`: gestão de usuários.
- `app/personagens`: gestão de personagens.
- `app/jogos`: visão geral de jogos.
- `app/jogos/jogo-da-memoria`: conteúdo do jogo da memória.
- `app/jogos/guess-game`: conteúdo do Adivinhe.
- `app/midia`: biblioteca de mídia.
- `app/notificacoes`: envio e histórico de notificações.

## Integração no monorepo

- usa `@etnos/ui` para componentes;
- usa `@etnos/tools` para chamadas à API (`@etnos/services`);
- usa `@etnos/types` para contratos compartilhados;
- integra com `apps/api` para persistência.
