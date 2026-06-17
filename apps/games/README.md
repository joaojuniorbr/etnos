# @etnos/games

Biblioteca de jogos educacionais do Etnos.

Este pacote centraliza os jogos reutilizados pelo portal do estudante e expõe
componentes React prontos para integração com `@etnos/tools`, `@etnos/services`,
`@etnos/types` e `@etnos/ui`.

## Jogos disponíveis

- `GuessGame`: Adivinhe — dicas, tentativas por letra ou palavra, teclado nas
  caixinhas, validação no backend, auto-save de score e NPS.
- `MemoryGame`: jogo da memória com níveis, cartas por personagem, capa
  configurável, pontuação e persistência de recorde.
- `GameNpsModal`: modal de satisfação após partidas.
- `FinishGame` / `ScoreHighlight`: telas e destaques compartilhados.

## Estrutura

```text
src/
  components/
    FinishGame/
    GameNpsModal/
    ScoreHighlight/
  games/
    GuessGame/
      GuessGame.tsx
      GuessGameExperience.tsx
      GuessGameUi.tsx
      guess-game.scoring.ts
    MemoryGame/
  index.ts
  styles.css
```

## Como funciona

- Os componentes dos jogos vivem em `src/games`.
- Componentes compartilhados de interface ficam em `src/components`.
- A integração com dados acontece via hooks de `@etnos/tools` (host) e serviços
  de `@etnos/services`.
- Os contratos e enums compartilhados vêm de `@etnos/types`.
- Os estilos distribuídos pelo pacote são gerados a partir de `src/styles.css`.

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
- `yarn test`: executa a suite com Vitest e cobertura (100% no pacote).
- `yarn lint`: roda ESLint no pacote.
- `yarn check-types`: valida tipagem sem emitir arquivos.

## Integração no monorepo

- `apps/student` consome `MemoryGame` e `GuessGame`.
- `apps/admin` gerencia conteúdo em `jogos/jogo-da-memoria` e `jogos/guess-game`.
- `apps/api` persiste configuração, conteúdo, validação e pontuação.
- `apps/student-mobile` usa apenas memória (implementação própria em `MemoryGameBoard`).

Documentação:

- `docs-site/docs/games-architecture.md`
- `docs-site/docs/guess-game.md`
- `docs-site/docs/memory-game.md`
