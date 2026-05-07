# @etnos/games

Biblioteca de jogos educacionais do Etnos.

Este pacote centraliza os jogos reutilizados pelo portal do estudante e expoe
componentes React prontos para integracao com `@etnos/tools`, `@etnos/types` e
`@etnos/ui`.

## Jogos disponiveis

- `MemoryGame`: jogo da memoria com cartas por personagem, capa configuravel,
  pontuacao e persistencia de recorde.
- `GuessGame`: jogo de adivinhacao com dicas, tentativas, sons e salvamento de
  pontuacao.
- `GameNpsModal`: modal de coleta de satisfacao apos partidas.

## Estrutura

```text
src/
  components/
    FinishGame/
    ScoreHighlight/
  games/
    GuessGame/
    MemoryGame/
  index.ts
  styles.css
```

## Como funciona

- Os componentes dos jogos vivem em `src/games`.
- Componentes compartilhados de interface ficam em `src/components`.
- A integracao com dados acontece via hooks de `@etnos/tools`.
- Os contratos e enums compartilhados vem de `@etnos/types`.
- Os estilos distribuidos pelo pacote sao gerados a partir de `src/styles.css`.

## Uso

```tsx
'use client';

import { MemoryGame } from '@etnos/games';
import '@etnos/games/styles.css';

export const Example = () => <MemoryGame characterSlug="anita" />;
```

Subpath exports:

- `@etnos/games/guess-game`
- `@etnos/games/memory-game`

## Scripts

- `yarn dev`: observa componentes TypeScript e folha de estilos.
- `yarn build`: gera `dist/index.js`, `dist/index.d.ts` e `dist/index.css`.
- `yarn test`: executa a suite com Vitest e cobertura.
- `yarn lint`: roda ESLint no pacote.
- `yarn check-types`: valida tipagem sem emitir arquivos.

## Integracao no monorepo

- `apps/student` consome os jogos renderizando `MemoryGame` e `GuessGame`.
- `apps/admin` gerencia configuracoes e conteudo do jogo da memoria.
- `apps/api` persiste configuracao, conteudo e pontuacao.
- `apps/api` recebe feedback de NPS via `POST /games/nps`.

Para a visao arquitetural completa, consulte `docs-site/docs/games-architecture.md`.
