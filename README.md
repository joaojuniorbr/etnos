# Etnos

Este é o monorepo do projeto **Etnos**, uma plataforma educacional para crianças
de 10 a 12 anos que utiliza jogos para ensinar sobre a rica diversidade cultural
brasileira. O projeto é gerenciado com
[Turborepo](https://turbo.build/repo/docs) para otimizar a performance, e toda a
arquitetura é construída com **TypeScript** para garantir escalabilidade e
segurança de tipos.

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
  Portal do estudante, onde as crianças acessam os jogos, acompanham progresso e
  exploram o conteúdo educacional.

- **`apps/docs`**  
  Projeto responsável pela documentação e pelo Storybook da biblioteca de
  componentes (`@etnos/ui`).

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
  Utilitários e hooks compartilhados entre as aplicações.  
  Também possui testes automatizados com Vitest.

### Mapa da Arquitetura

```text
/etnos
├── apps/
│   ├── web/
│   ├── admin/
│   ├── student/
│   └── docs/
│
└── packages/
    ├── ui/
    ├── eslint-config/
    ├── typescript-config/
    ├── tailwind-config/
    └── tools/
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

## Scripts Principais

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

## Testes

### Visão Geral

Os testes do monorepo são orquestrados pelo Turborepo:

```bash
yarn test
```

Esse comando roda a task `test` em todos os workspaces que a definem (veja
[turbo.json](turbo.json)).

Atualmente os principais pacotes com testes são:

- **`packages/ui`** – testes de componentes
- **`packages/tools`** – testes de hooks e serviços
- **`apps/docs`** – testes integrados com Storybook (via Vitest + Playwright)

### Tecnologias de Teste

- **Vitest** Framework de testes (unitários e de integração).

- **@testing-library/react / @testing-library/dom** Utilizados em `@etnos/ui` e
  `@etnos/tools` para testes baseados em comportamento do usuário.

- **jsdom** Ambiente DOM para testes de componentes React.

- **Playwright + @vitest/browser-playwright** Utilizados em `apps/docs` para
  rodar testes das stories do Storybook em navegador real (Chromium).

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

Scripts definidos no [packages/ui/package.json](packages/ui/package.json):

- `test`: `vitest --coverage --watch=false`
- `test:watch`: `vitest --watch --coverage`
- `test:ui`: `vitest --ui --coverage --open=false`

#### `packages/tools` (`@etnos/tools`)

```bash
# Rodar testes de hooks/serviços
yarn test --filter=@etnos/tools
```

Script no [packages/tools/package.json](packages/tools/package.json):

- `test`: `vitest --watch=false --coverage`

#### `apps/docs` – Testes de Stories do Storybook

A configuração de testes de stories fica em
[apps/docs/vitest.config.ts](apps/docs/vitest.config.ts), usando o plugin
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
[turbo.json](turbo.json) como output de build).

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
