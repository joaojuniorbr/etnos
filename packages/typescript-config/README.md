# @etnos/typescript-config

Presets de TypeScript compartilhados entre os workspaces do Etnos.

## Configurações disponíveis

- `base.json`: base comum para projetos TypeScript;
- `nextjs.json`: preset para apps Next.js;
- `react-library.json`: preset para bibliotecas React.

## Integração no monorepo

Cada workspace referencia um desses presets no respectivo `tsconfig.json` para
garantir consistência de compilação e tipagem.
