![Etnos](./docs-site/docs/files/github-cover.jpg)

# Etnos

Plataforma educacional com jogos culturais para estudantes do ensino
fundamental, organizada em monorepo com apps web/mobile, API e pacotes
compartilhados.

[![Version](https://img.shields.io/badge/version-1.8.0-blue.svg)](./CHANGELOG.md)
![Node](https://img.shields.io/badge/Node-%3E%3D20-green)
![Yarn](https://img.shields.io/badge/Yarn-1.22.19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue)
![License](https://img.shields.io/badge/license-UNLICENSED-lightgray)

## Visão geral do monorepo

### Apps

- `apps/web`: site institucional, login e cadastro.
- `apps/student`: portal web do estudante com jogos e perfil.
- `apps/student-mobile`: app nativo Expo (iOS, Android e Web).
- `apps/admin`: painel administrativo para conteúdo e operação.
- `apps/api`: API NestJS com Prisma, Firebase e Swagger.
- `apps/games`: biblioteca React de jogos reutilizáveis.
- `apps/docs`: Storybook dos componentes visuais.

### Packages

- `packages/core`: cliente HTTP e serviços compartilhados para o mobile.
- `packages/tools`: hooks, serviços e helpers para apps web.
- `packages/ui`: biblioteca de componentes e estilos compartilhados.
- `packages/types`: contratos e entidades compartilhadas.
- `packages/analytics`: integração Mixpanel (web e mobile).
- `packages/performance`: testes de carga com k6.
- `packages/tailwind-config`: estilos e config comum de Tailwind/PostCSS.
- `packages/typescript-config`: presets de `tsconfig` do monorepo.
- `packages/eslint-config`: presets de lint reutilizáveis.

### Docs

- `docs-site`: documentação técnica (MkDocs → GitHub Pages).
- `AGENTS.md`: convenções para agentes (analytics, eventos Mixpanel).

## Funcionalidades atuais

- `guess-game`: jogo de adivinhação com dicas e score.
- `memory-game`: jogo da memória por personagem, com capa, cartas e recorde.
- onboarding pós-login com vínculo do estudante à escola.
- cadastro simplificado por link/código da escola.

## Stack principal

- Frontend web: Next.js 16, React 19, Tailwind CSS e Ant Design.
- Mobile: React Native, Expo, Expo Router e React Query.
- Backend: NestJS, Prisma, PostgreSQL, Firebase Auth/Storage e Sentry.
- Monorepo: Yarn Workspaces e Turborepo.
- Testes: Vitest, Testing Library, Jest e Playwright.

## Requisitos

- Node.js >= 20
- Yarn >= 1.22.19

## Primeiros passos

```bash
git clone https://github.com/joaojuniorbr/etnos.git
cd etnos
yarn install
```

Configure os arquivos de ambiente:

- apps Next (`apps/web`, `apps/admin`, `apps/student`): `.env.local` **dentro de cada app** (não basta na raiz do monorepo)
- API (`apps/api`): `.env`
- mobile (`apps/student-mobile`): `.env`

Variáveis de pacotes compartilhados (ex.: Mixpanel em `@etnos/analytics`) usam `NEXT_PUBLIC_*` no `.env.local` do app Next que você está rodando; o token é repassado pelo `AppProviders`.

Exemplo frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:3333
NEXT_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_project_token
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
```

Mobile (`apps/student-mobile/.env`):

```env
EXPO_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_project_token
```

Modelos completos: `.env.example` na raiz e em cada app (`apps/web/.env.example`, etc.).

Exemplo API:

```env
NODE_ENV=development
PORT=3333
DATABASE_URL=postgres://...
DIRECT_URL=postgres://...
FIREBASE_PROJECT_ID=your_project
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_email
```

## Desenvolvimento

Subir todo o monorepo:

```bash
yarn dev
```

Endpoints locais principais:

- `http://localhost:3000`: web
- `http://localhost:3001`: admin
- `http://localhost:3002`: student
- `http://localhost:8080/api`: api (porta padrão NestJS; Swagger em `/docs`)
- `http://localhost:6006`: Storybook

Mobile:

```bash
yarn workspace @etnos/student-mobile dev
```

## Scripts úteis

```bash
yarn dev
yarn build
yarn lint
yarn test
yarn check-types
```

## Fluxo de jogos (resumo)

1. estudante acessa um jogo no `apps/student` ou `apps/student-mobile`;
2. renderização vem de `@etnos/games` (web) e integrações de `@etnos/core`/`@etnos/tools`;
3. API (`apps/api`) retorna configuração e persiste score/NPS;
4. `apps/admin` mantém conteúdo, capas e mídias.

## Documentação

- [Documentação técnica (MkDocs)](https://joaojuniorbr.github.io/etnos/) — arquitetura, banco, analytics, performance
- Local: `cd docs-site && mkdocs serve`

## Links

- [Swagger](https://api.etnos.online/docs)
- [Aplicação](https://etnos.online)
- [Storybook](https://691f7645d388cc8aa2a047b6-amyptzoyzk.chromatic.com/)
- [Sonar Cloud](https://sonarcloud.io/project/overview?id=joaojuniorbr_etnos)

## Licença

`UNLICENSED`
