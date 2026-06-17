# @etnos/services

Clientes HTTP e serviços de domínio compartilhados entre os apps web.

Este pacote concentra chamadas à API (`apps/api`). Os hooks em `@etnos/tools`
importam daqui; o mobile usa `@etnos/core` com serviços equivalentes adaptados
ao React Native.

## Módulos

| Pasta | Responsabilidade |
| :--- | :--- |
| `api` | Cliente Axios base (`api.ts`) |
| `authSession` | Sessão e token Firebase |
| `characters` | Personagens |
| `games` | Memória, Adivinhe, score, configuração |
| `school` | Escolas, onboarding, habilitação |
| `users` | Usuários e perfis |
| `midia` | Biblioteca de mídia |
| `notifications` | Notificações push |
| `dashboard` | Dashboard do estudante e métricas admin |

## Jogos (`src/games`)

- `guessGameContentService` — conteúdo e `validateAttempt`
- `memoryGameContentService` — baralho e imagens
- `scoreGamesService` — recorde, histórico, NPS, sessão
- `configGamesService` — capas e configuração por personagem

## Scripts

```bash
yarn check-types
yarn test
yarn test:dev
```

## Integração

- importado por `@etnos/tools` (hooks web);
- tipos de `@etnos/types`;
- não deve ser usado diretamente nos componentes — prefira hooks.
