![Etnos](./docs-site/docs/files/github-cover.jpg)

# Etnos

Plataforma educacional com jogos culturais para estudantes do ensino
fundamental, organizada como monorepo com apps web, API, biblioteca de jogos e
pacotes compartilhados.

[![Version](https://img.shields.io/badge/version-1.1.1-blue.svg)](./CHANGELOG.md)
![Node](https://img.shields.io/badge/Node-%3E%3D20-green)
![Yarn](https://img.shields.io/badge/Yarn-1.22.19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue)
![License](https://img.shields.io/badge/license-UNLICENSED-lightgray)

---

## Visao geral

O repositorio reune as camadas que sustentam a experiencia do Etnos:

- `apps/web`: site institucional.
- `apps/student`: portal do estudante, onde os jogos sao acessados.
- `apps/admin`: painel administrativo para gestao de conteudo.
- `apps/api`: API REST com NestJS.
- `apps/games`: biblioteca React de jogos reutilizaveis.
- `apps/docs`: Storybook de componentes.
- `docs-site`: documentacao em MkDocs.

## Jogos atuais

- `guess-game`: jogo de adivinhacao com dicas e pontuacao.
- `memory-game`: jogo da memoria configuravel por personagem, com capa, conteudo
  dinamico e persistencia de recorde.

O jogo da memoria hoje envolve quatro camadas do monorepo:

- `apps/student` renderiza a experiencia do aluno;
- `apps/games` concentra a logica e a UI do jogo;
- `apps/admin` cadastra capa e imagens das cartas;
- `apps/api` persiste configuracoes, conteudo e score.

## Stack principal

- Frontend: Next.js, React 19, TypeScript, Tailwind CSS, Ant Design.
- Backend: NestJS, Firebase Auth, Prisma.
- Monorepo: Turborepo, Yarn Workspaces.
- Testes: Vitest, Testing Library, Jest, Playwright.

## Requisitos

- Node.js >= 18
- Yarn >= 1.22.19

## Primeiros passos

```bash
git clone https://github.com/joaojuniorbr/etnos.git
cd etnos
yarn install
```

Configure os arquivos de ambiente das aplicacoes Next.js com `.env.local` e da
API com `.env`.

Exemplo para frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:3333
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
```

Exemplo para API:

```env
NODE_ENV=development
PORT=3333
FIREBASE_PROJECT_ID=your_project
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_email
```

## Desenvolvimento

Para subir o monorepo:

```bash
yarn dev
```

Entradas locais principais:

- `http://localhost:3000`: web
- `http://localhost:3001`: admin
- `http://localhost:3002`: student
- `http://localhost:3333`: api
- `http://localhost:6006`: Storybook

## Estrutura

```text
etnos/
  apps/
    admin/
    api/
    docs/
    games/
    student/
    web/
  docs-site/
  packages/
    eslint-config/
    tools/
    types/
    ui/
```

## Fluxo de jogos

O catalogo de jogos e definido em `packages/tools`, o `student` escolhe o jogo
pela rota, e a renderizacao fica a cargo da biblioteca `@etnos/games`.

No caso do `memory-game`, o fluxo completo funciona assim:

1. o estudante acessa a rota do jogo com o personagem selecionado;
2. `apps/games` busca configuracao visual, cartas e recorde;
3. `packages/tools` consulta a API;
4. `apps/api` devolve configuracoes e salva o score;
5. `apps/admin` permite editar capa e imagens do baralho.

## Scripts uteis

```bash
yarn dev
yarn build
yarn lint
yarn test
yarn check-types
```

## Documentacao

- Documentacao tecnica geral: `docs-site/`
- Storybook de componentes: `apps/docs/`
- Arquitetura dos jogos: `docs-site/docs/games-architecture.md`

## Contribuicao

O projeto segue Conventional Commits.

Exemplos:

```text
feat: adiciona novo jogo
fix: corrige score do memory-game
docs: atualiza arquitetura dos jogos
```

## Licenca

`UNLICENSED`
