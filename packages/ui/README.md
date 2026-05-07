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
  styles.css
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
```

## Integração no monorepo

- consumido por `apps/web`, `apps/admin`, `apps/student` e `apps/docs`;
- usa `@etnos/types` para contratos compartilhados.
