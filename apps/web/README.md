# @etnos/web (`apps/web`)

Aplicação pública do Etnos: landing page, autenticação e fluxo de cadastro por
escola.

## Responsabilidades

- apresentar o projeto e os jogos;
- login de usuários;
- cadastro de estudante por rota pública e por código/link de escola;
- ponte inicial para os fluxos autenticados.

## Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4 + Ant Design
- Firebase Web SDK
- `@etnos/ui`, `@etnos/tools`, `@etnos/analytics`
- Vercel Analytics e Speed Insights

## Scripts

```bash
yarn dev
yarn build
yarn start
yarn lint
yarn check-types
```

## Desenvolvimento local

Executar em `http://localhost:3000`:

```bash
yarn dev
```

## Variáveis de ambiente

Criar `apps/web/.env.local`:

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

- `app/page.tsx`: homepage.
- `app/login/page.tsx`: login.
- `app/cadastro/page.tsx`: entrada de cadastro.
- `app/cadastro/escola/[schoolCode]/page.tsx`: cadastro com vínculo escolar.

## Integração no monorepo

- consome componentes de `@etnos/ui`;
- consome serviços/hooks de `@etnos/tools`;
- utiliza a API em `apps/api`.

Referência arquitetural: `docs-site/docs/monorepo-architecture.md`.
