# @etnos/student (`apps/student`)

Portal web autenticado do estudante, com seleção de personagem, jogos, dashboard
e perfil.

## Responsabilidades

- renderizar a experiência principal do estudante;
- exibir dashboard na home (`StudentHome` / `useStudentDashboard`);
- exibir catálogo de jogos e roteamento por personagem;
- exibir perfil e histórico de atividade;
- executar onboarding pós-login;
- coletar NPS após partidas nos jogos.

## Stack

- Next.js 16 + React 19 + TypeScript
- `@etnos/games`, `@etnos/ui`, `@etnos/tools`, `@etnos/types`, `@etnos/analytics`
- Tailwind CSS 4

## Scripts

```bash
yarn dev
yarn build
yarn start
yarn lint
yarn check-types
```

## Desenvolvimento local

Executar em `http://localhost:3002`:

```bash
yarn dev
```

## Variáveis de ambiente

Criar `apps/student/.env.local`:

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

- `app/page.tsx`: home com dashboard do estudante.
- `app/selecionar`: seleção de personagem.
- `app/jogos/advinhe`: jogo Adivinhe (`GuessGame`).
- `app/jogos/jogo-da-memoria`: jogo da memória (`MemoryGame`).
- `app/perfil`: perfil do estudante.
- `app/perfil/historico`: histórico de atividades.
- `app/onboarding`: fluxo de vínculo pós-login.

## Integração no monorepo

- biblioteca de jogos: `@etnos/games` (workspace `apps/games`);
- componentes visuais: `@etnos/ui`;
- hooks: `@etnos/tools` (HTTP via `@etnos/services`);
- backend: `apps/api`.

Documentação dos jogos: `docs-site/docs/games-architecture.md`.
