# `@etnos/eslint-config`

Coleção de configurações de ESLint compartilhadas no monorepo Etnos.

## Exports disponíveis

- `@etnos/eslint-config/base`
- `@etnos/eslint-config/next-js`
- `@etnos/eslint-config/react-internal`

## Uso

Exemplo em `eslint.config.mjs`:

```js
import base from '@etnos/eslint-config/base';

export default [...base];
```

## Onde é usado

- `apps/web`, `apps/admin` e `apps/student` com preset Next.js;
- `packages/ui` e `apps/games` em cenários React/biblioteca;
- demais pacotes com preset base quando aplicável.
