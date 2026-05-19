# @etnos/ui

Biblioteca de componentes compartilhados do Etnos baseada em Atomic Design.

## Estrutura

```text
src/
  @atoms/
  @molecules/
  @organisms/
  @templates/
  context/
  guards/
  providers/
  test/
    fixtures/
  styles.css
```

## Padrão de componentes

Cada componente exportado segue a estrutura:

```text
ComponentName/
  ComponentName.tsx
  ComponentName.test.tsx      # Vitest + Testing Library
  ComponentName.stories.tsx   # Storybook (apps/docs)
  index.ts
```

### Testes unitários

- Framework: **Vitest** + **@testing-library/react**
- Setup global: `src/test/setup.tsx`
- Fixtures compartilhadas: `@ui/test/fixtures`
- Convenção de `describe`: `@atoms/Button`, `@molecules/Footer`, etc.
- Mocks de dependências externas com `vi.mock(...)` no arquivo de teste

```bash
yarn test
yarn test:dev
yarn test:ui
```

### Storybook

As stories ficam colocalizadas em `packages/ui` e são servidas pelo app `apps/docs`.

- Título das stories: `UI/@atoms/Button`, `UI/@molecules/Footer`, `UI/@organisms/Header`
- Tag `autodocs` nos componentes documentáveis
- Imports internos via alias `@ui/...`

```bash
yarn storybook
yarn storybook:build
```

## Exports principais

- componentes por categoria (`@atoms`, `@molecules`, `@organisms`, `@templates`);
- contexto e providers (`context`, `providers`);
- guardas de rota (`guards`);
- estilos globais em `@etnos/ui/styles.css`;
- assets compilados em `@etnos/ui/assets/*`.

## Scripts

```bash
yarn build
yarn build:styles
yarn build:components
yarn build:assets
yarn dev:styles
yarn dev:components
yarn lint
yarn check-types
yarn test
yarn storybook
```

## Integração no monorepo

- consumido por `apps/web`, `apps/admin`, `apps/student` e `apps/docs`;
- usa `@etnos/types` para contratos compartilhados.
- imports internos usam o alias `@ui/*` (mapeado em `packages/ui/tsconfig.json`);
- apps que consomem `@etnos/ui` pelo source precisam do mesmo alias no `tsconfig.json`:

```json
"paths": {
  "@ui/*": ["../../packages/ui/src/*"]
}
```
