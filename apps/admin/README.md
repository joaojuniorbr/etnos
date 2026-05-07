# @etnos/admin (`apps/admin`)

Painel administrativo do Etnos para gestão de conteúdo, usuários e operação da
plataforma.

## Responsabilidades

- gerenciar escolas e usuários;
- gerenciar personagens, jogos e configurações;
- administrar biblioteca de mídias;
- publicar notificações.

## Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4
- `@etnos/ui`, `@etnos/tools`, `@etnos/types`

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
NEXT_PUBLIC_API_URL=http://localhost:3333
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Estrutura funcional (resumo)

- `app/escolas`: gestão de escolas.
- `app/usuarios`: gestão de usuários.
- `app/personagens`: gestão de personagens.
- `app/jogos`: gestão de jogos e conteúdos.
- `app/midia`: biblioteca de mídia.
- `app/notificacoes`: envio e histórico de notificações.

## Integração no monorepo

- usa `@etnos/ui` para componentes;
- usa `@etnos/tools` para chamadas à API;
- usa `@etnos/types` para contratos compartilhados;
- integra com `apps/api` para persistência.
