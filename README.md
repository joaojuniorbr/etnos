Este é o monorepo do projeto **Etnos**, uma plataforma educacional para crianças
de 10 a 12 anos que utiliza jogos para ensinar sobre a rica diversidade cultural
brasileira.

A plataforma é composta por:

- **Site institucional** (público)
- **Painel administrativo**
- **Portal do estudante**, onde os jogos são acessados
- **Biblioteca de componentes UI** e **biblioteca de jogos reutilizáveis**
- **Projeto de documentação/Storybook**

O monorepo é gerenciado com [Turborepo](https://turbo.build/repo/docs) e toda a
arquitetura é construída com **TypeScript**.

---

## Estrutura do Monorepo

O projeto é organizado em workspaces [apps](apps) e [packages](packages),
garantindo um desenvolvimento modular e escalável.

### Aplicações

Interfaces de usuário e documentação:

- **`apps/web`**  
  Aplicação pública da Etnos (site institucional).

- **`apps/admin`**  
  Painel administrativo para gerenciamento da plataforma (usuários, jogos,
  conteúdo, progresso, etc.).

- **`apps/student`**  
  Portal do estudante, onde as crianças:
  - escolhem um personagem/guia cultural,
  - acessam os jogos,
  - acompanham seu progresso e pontuações.

- **`apps/docs`**  
  Projeto responsável pela documentação e pelo Storybook da biblioteca de
  componentes (`@etnos/ui`).

- **`apps/games`**  
  Biblioteca de jogos da Etnos (`@etnos/games`), construída em React e usada
  pelo portal do estudante. Contém a implementação dos jogos (ex.: Jogo da
  Memória, Jogo “Adivinhe a Palavra”).

### Pacotes Compartilhados

Código reutilizável e configurações compartilhadas:

- **`packages/ui` → `@etnos/ui`**  
  Biblioteca de componentes React da Etnos.  
  Inclui:
  - componentes de UI,
  - stories do Storybook,
  - testes unitários com Vitest + Testing Library.

- **`packages/eslint-config` → `@etnos/eslint-config`**  
  Configuração padrão de ESLint para o monorepo.

- **`packages/typescript-config` → `@etnos/typescript-config`**  
  `tsconfig` compartilhados, garantindo uma verificação de tipos consistente.

- **`packages/tailwind-config` → `@etnos/tailwind-config`**  
  Configuração compartilhada do Tailwind CSS.

- **`packages/tools` → `@etnos/tools`**  
  Utilitários e hooks compartilhados entre as aplicações (ex.: hooks de
  personagem, jogos, placar, etc.).  
  Também possui testes automatizados com Vitest.

### Mapa da Arquitetura

```text
/etnos
├── apps/
│   ├── web/           # Site institucional
│   ├── admin/         # Painel administrativo
│   ├── student/       # Portal do estudante (acesso aos jogos)
│   ├── docs/          # Storybook / documentação
│   └── games/         # Biblioteca de jogos (@etnos/games)
│
└── packages/
    ├── ui/                # Biblioteca de componentes (@etnos/ui)
    ├── eslint-config/     # Configuração ESLint
    ├── typescript-config/ # Configuração TypeScript
    ├── tailwind-config/   # Configuração Tailwind
    └── tools/             # Hooks e utilitários (@etnos/tools)
```

Essa estrutura permite que a plataforma escale de forma organizada, facilitando
a manutenção e o desenvolvimento de novas funcionalidades.

---

## Começando

Clone o repositório e instale as dependências:

```bash
git clone https://github.com/joaojuniorbr/etnos.git
cd etnos
yarn install
```

---

## Scripts Principais (root)

Rodar todas as aplicações em modo de desenvolvimento:

```bash
yarn dev
```

Rodar uma aplicação específica:

```bash
# Web (http://localhost:3000)
yarn dev --filter=web

# Admin (http://localhost:3001)
yarn dev --filter=admin

# Student (http://localhost:3002)
yarn dev --filter=student

# Docs / Storybook host (ver seção Storybook)
yarn dev --filter=@etnos/docs
```

Build de todas as aplicações:

```bash
yarn build
```

Build de uma aplicação específica:

```bash
yarn build --filter=web
```

---

## Jogos da Plataforma

Os jogos da Etnos são construídos como **componentes React reutilizáveis** no
workspace **[apps/games](apps/games)** (`@etnos/games`) e consumidos pelo portal
do estudante em **`apps/student`**.

### Onde estão os jogos no código

- **Biblioteca de jogos**
  - Diretório: [[apps/games](apps/games)](apps/games)
  - Arquivos principais:
    - [apps/games/src/games/MemoryGame/MemoryGame.tsx](apps/games/src/games/MemoryGame/MemoryGame.tsx)
    - [apps/games/src/games/GuessGame/GuessGame.tsx](apps/games/src/games/GuessGame/GuessGame.tsx)

- **Integração com o portal do estudante**
  - Seleção de jogos:
    - [apps/student/app/jogos/page.tsx](apps/student/app/jogos/page.tsx)
    - [apps/student/components/@organisms/GameSelect/GameSelect.tsx](apps/student/components/@organisms/GameSelect/GameSelect.tsx)
  - Rotas dos jogos:
    - [apps/student/app/jogos/jogo-da-memoria/page.tsx](apps/student/app/jogos/jogo-da-memoria/page.tsx)
    - [apps/student/app/jogos/advinhe/page.tsx](apps/student/app/jogos/advinhe/page.tsx)
  - Componente wrapper de jogos:
    - [apps/student/components/@molecules/Games/Games.tsx](apps/student/components/@molecules/Games/Games.tsx)
    - [apps/student/components/@molecules/CardGame/CardGame.tsx](apps/student/components/@molecules/CardGame/CardGame.tsx)

### Tipos de jogos atualmente implementados

1. **Jogo da Memória ([MemoryGame](apps/games/dist/games/MemoryGame))**

2. **Jogo “Adivinhe a Palavra” ([GuessGame](apps/games/dist/games/GuessGame))**

### Como o estudante acessa os jogos

Fluxo no portal do estudante (`apps/student`):

1. O estudante acessa a **Área do Estudante**.
2. Seleciona um **personagem/guia cultural** (via `CharacterSelect`).
3. Navega para a página de **seleção de jogos**:
   - Rota: `/estudante/jogos`
   - Arquivo: [apps/student/app/jogos/page.tsx](apps/student/app/jogos/page.tsx)
   - Componente principal: `GameSelect`
4. Na tela de seleção, vê os **cards de jogos** (`CardGame`) e, ao escolher um:
   - é redirecionado para:
     - `/estudante/jogos/jogo-da-memoria` ou
     - `/estudante/jogos/advinhe`,
   - já com o personagem escolhido integrado à experiência do jogo.

### Como rodar os jogos localmente

Os jogos rodam dentro do **portal do estudante**. Para testar como o usuário
final:

```bash
# No root do monorepo
yarn dev
```

Depois, acesse:

- Portal do estudante:  
  `http://localhost:3000` (porta padrão do `apps/student`)

Rotas úteis:

- Seleção de jogos:  
  `http://localhost:3000/estudante/jogos`

- Jogo da Memória:  
  `http://localhost:3000/estudante/jogos/jogo-da-memoria`

- Adivinhe a Palavra:  
  `http://localhost:3000/estudante/jogos/advinhe`

### Desenvolvendo na biblioteca `@etnos/games`

Para trabalhar diretamente na biblioteca de jogos:

```bash
cd apps/games

# Build de estilos e componentes
yarn build

# Ou, durante desenvolvimento, com watch de TypeScript
yarn dev
```

Scripts definidos em [apps/games/package.json](apps/games/package.json):

- `dev`: `tsc --watch && npm run build:styles`
- `build:styles`: build do CSS com Tailwind para `dist/index.css`
- `build:components`: build dos componentes TypeScript para `dist`
- `build`: roda `build:styles` + `build:components`
- `check-types`: `tsc --noEmit`

A biblioteca exporta os jogos principais em:

```ts
// apps/games/src/games/index.ts
export * from './GuessGame';
export * from './MemoryGame';
```

Assim, o portal do estudante importa os componentes de jogo diretamente de
`@etnos/games`.

---

## Testes

### Visão Geral

Os testes do monorepo são orquestrados pelo Turborepo:

```bash
yarn test
```

Esse comando roda a task `test` em todos os workspaces que a definem (veja
[(turbo.json)](turbo.json)).

Atualmente os principais pacotes com testes são:

- **`packages/ui`** – testes de componentes
- **`packages/tools`** – testes de hooks e serviços
- **`apps/docs`** – testes integrados com Storybook (via Vitest + Playwright)

### Tecnologias de Teste

- **Vitest**  
  Framework de testes (unitários e de integração).

- **@testing-library/react / @testing-library/dom**  
  Utilizados em `@etnos/ui` e `@etnos/tools` para testes baseados em
  comportamento do usuário.

- **jsdom**  
  Ambiente DOM para testes de componentes React.

- **Playwright + @vitest/browser-playwright**  
  Utilizados em `apps/docs` para rodar testes das stories do Storybook em
  navegador real (Chromium).

### Scripts de Teste por Pacote

#### `packages/ui` (`@etnos/ui`)

```bash
# Rodar testes uma vez com cobertura
yarn test --filter=@etnos/ui

# Modo watch
yarn test --filter=@etnos/ui -- --watch

# UI do Vitest
yarn test --filter=@etnos/ui -- test:ui
```

Scripts definidos no [`packages/ui/package.json`](packages/ui/package.json):

- `test`: `vitest --coverage --watch=false`
- `test:watch`: `vitest --watch --coverage`
- `test:ui`: `vitest --ui --coverage --open=false`

#### `packages/tools` (`@etnos/tools`)

```bash
# Rodar testes de hooks/serviços
yarn test --filter=@etnos/tools
```

Script no [`packages/tools/package.json`](packages/tools/package.json):

- `test`: `vitest --watch=false --coverage`

#### `apps/docs` – Testes de Stories do Storybook

A configuração de testes de stories fica em
[`apps/docs/vitest.config.ts`](apps/docs/vitest.config.ts), usando o plugin
`@storybook/addon-vitest` e Playwright.

Exemplo de execução:

```bash
cd apps/docs
npx vitest
# ou, via Turbo (se adicionado script "test" no futuro)
# yarn test --filter=@etnos/docs
```

---

## Storybook

O Storybook do projeto roda a partir de **`apps/docs`**, consumindo as stories
de `packages/ui` e as stories locais em `apps/docs/stories`.

### Como rodar o Storybook localmente

No root do monorepo:

```bash
yarn dev --filter=@etnos/docs
```

Ou diretamente dentro de `apps/docs`:

```bash
cd apps/docs
yarn dev        # alias para: storybook dev -p 6006 --no-open
```

Por padrão, o Storybook sobe na porta `6006`:

- **URL local**: http://localhost:6006

### Build do Storybook

Para gerar o build estático do Storybook:

```bash
cd apps/docs
yarn build      # alias para: storybook build
# ou:
yarn build-storybook
```

Os artefatos estáticos são produzidos em `storybook-static/` (configurado em
[[turbo.json](cci:7://file:///Users/joaojunior/WORK/faculdade/IFPR/ETNOS/etnos/turbo.json)](turbo.json)
como output de build).

### Integração com Chromatic

O projeto utiliza **Chromatic** para publicação e revisão visual das stories do
Storybook.

- Storybook publicado:  
  [Acessar no Chromatic](https://www.chromatic.com/library?appId=691f7645d388cc8aa2a047b6)

---

## UI/UX

- **Storybook (produção / Chromatic)**  
  [https://www.chromatic.com/library?appId=691f7645d388cc8aa2a047b6](https://www.chromatic.com/library?appId=691f7645d388cc8aa2a047b6)

- **Protótipo no Figma**  
  [https://www.figma.com/proto/DC1bYnTWGpp1ppCLhuOm1e/Etnos](https://www.figma.com/proto/DC1bYnTWGpp1ppCLhuOm1e/Etnos?node-id=2-6&p=f&t=D7YYcgs2oQdpQxIR-1&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=2%3A6)

---

## Qualidade e Ferramentas

- **Lint** (ESLint):

  ```bash
  yarn lint
  ```

- **Checagem de tipos** (TypeScript):

  ```bash
  yarn check-types
  ```

Esses comandos são orquestrados pelo Turborepo e executam as tasks
correspondentes em cada workspace que as declara.
