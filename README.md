![Etnos](./docs-site/docs/files/github-cover.jpg)

# Etnos

Uma plataforma educacional com jogos culturais para estudantes do ensino
fundamental. Por trás da parte divertida, existe um monorepo com apps web, API,
biblioteca de jogos e pacotes compartilhados fazendo a mágica acontecer.

[![Version](https://img.shields.io/badge/version-1.1.1-blue.svg)](./CHANGELOG.md)
![Node](https://img.shields.io/badge/Node-%3E%3D20-green)
![Yarn](https://img.shields.io/badge/Yarn-1.22.19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue)
![License](https://img.shields.io/badge/license-UNLICENSED-lightgray)

---

## Visão geral

O repositório reúne tudo o que faz o Etnos sair da ideia e virar produto:

- `apps/web`: o site institucional, que faz as apresentações.
- `apps/student`: a área do estudante, onde a brincadeira começa.
- `apps/admin`: o painel administrativo, que organiza os bastidores.
- `apps/api`: a API REST com NestJS, que cuida da parte séria.
- `apps/games`: a biblioteca React onde os jogos moram.
- `apps/docs`: o Storybook com componentes e padrões visuais.
- `docs-site`: a documentação em MkDocs, para quando bater a curiosidade
  técnica.

## Jogos atuais

- `guess-game`: um desafio de adivinhação com dicas e pontuação.
- `memory-game`: jogo da memória configurável por personagem, com capa, conteúdo
  dinâmico e persistência de recorde.

O jogo da memória, por exemplo, passeia por quatro camadas do monorepo:

- `apps/student` mostra a experiência para o aluno;
- `apps/games` concentra a lógica e a interface do jogo;
- `apps/admin` organiza capa e imagens das cartas;
- `apps/api` salva configurações, conteúdo e score.

## Stack principal

- Frontend: Next.js, React 19, TypeScript, Tailwind CSS e Ant Design.
- Backend: NestJS, Firebase Auth e Prisma.
- Monorepo: Turborepo e Yarn Workspaces.
- Testes: Vitest, Testing Library, Jest e Playwright.

## Requisitos

- Node.js >= 18
- Yarn >= 1.22.19

## Primeiros passos

Se a ideia é colocar tudo para rodar localmente, o começo do caminho é este:

```bash
git clone https://github.com/joaojuniorbr/etnos.git
cd etnos
yarn install
```

Depois disso, configure os arquivos de ambiente das aplicações Next.js com
`.env.local` e da API com `.env`.

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

Para levantar o monorepo inteiro de uma vez:

```bash
yarn dev
```

Com tudo rodando, estes são os endereços principais:

- `http://localhost:3000`: web
- `http://localhost:3001`: admin
- `http://localhost:3002`: student
- `http://localhost:3333`: api
- `http://localhost:6006`: Storybook

## Estrutura

Mapa rápido da casa:

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

O catálogo de jogos é definido em `packages/tools`, o `student` escolhe o jogo
pela rota, e a renderização fica a cargo da biblioteca `@etnos/games`.

No caso do `memory-game`, a jornada acontece mais ou menos assim:

1. o estudante entra na rota do jogo com o personagem selecionado;
2. `apps/games` busca configuração visual, cartas e recorde;
3. `packages/tools` conversa com a API;
4. `apps/api` devolve as configurações e salva o score;
5. `apps/admin` deixa o baralho pronto para ganhar cara nova quando precisar.

## Scripts úteis

Os comandos mais usados no dia a dia:

```bash
yarn dev
yarn build
yarn lint
yarn test
yarn check-types
```

## Acessos

- 📘 [Swagger](https://api.etnos.online/docs): a porta de entrada para explorar
  a API, testar rotas e ver os contratos em ação.
- 🚀 [Aplicação funcionando](https://etnos.online): a plataforma publicada para
  navegar, conhecer a experiência e ver o Etnos em movimento.
- 📚 [Documentação acadêmica](https://joaojuniorbr.github.io/etnos/):
  arquitetura, banco de dados, contexto do projeto e material técnico reunidos
  em um só lugar.
- 🎨 [Storybook](https://691f7645d388cc8aa2a047b6-amyptzoyzk.chromatic.com/):
  vitrine dos componentes, telas e padrões visuais que dão forma à interface.

## Licença

`UNLICENSED`
