# Arquitetura dos jogos

## Visão geral

Os jogos do Etnos foram organizados para separar bem experiência visual, regras
do jogo, integração com API e persistência. Hoje essa parte passa por sete áreas
principais do monorepo:

- `apps/student`: entrega a experiência jogável para o estudante (web).
- `apps/student-mobile`: jogo da memória no app nativo.
- `apps/admin`: configura conteúdo, capas e palavras dos jogos.
- `apps/games`: biblioteca React com os jogos reutilizáveis.
- `apps/api`: expõe endpoints autenticados para configuração, conteúdo, validação e score.
- `packages/tools`: hooks React Query que conectam UI e `@etnos/services`.
- `packages/services`: clientes HTTP de jogos, score, escolas e mídia.
- `packages/types`: enums e interfaces compartilhadas entre apps e pacotes.

## Fluxo geral

![Fluxo de alto nivel](./files/games-flow.png)

## Camadas e responsabilidades

### `apps/student`

O portal do estudante controla navegação, breadcrumb e contexto da experiência.
As páginas de jogos ficam em `app/jogos` e delegam a renderização para
`@etnos/games`.

Responsabilidades principais:

- selecionar o tipo de jogo pela rota;
- recuperar o personagem via query string;
- renderizar o layout da experiência no contexto do estudante;
- respeitar habilitação por escola (`useMyGameAccess`).

### `apps/games`

É a biblioteca compartilhada de jogos. Ela concentra a interface, os estados do
jogo e os componentes reutilizáveis, como placar e tela final.

Hoje a biblioteca exporta:

- `GuessGame`
- `MemoryGame`
- `FinishGame`
- `ScoreHighlight`
- `GameNpsModal`

Assim, o `student` consome um jogo pronto sem duplicar lógica de pontuação,
feedback visual ou integração com score.

### `packages/tools` e `packages/services`

- **`@etnos/services`**: funções HTTP (`guessGameContentService`,
  `scoreGamesService`, `memoryGameContentService`, etc.).
- **`@etnos/tools`**: hooks (`useGames`, `useGameScore`, `useGuessGamePlayableContent`,
  `useMemoryGameContent`, `useMyGameAccess`) que encapsulam React Query.

### `apps/admin`

O painel administrativo cuida do lado editorial dos jogos:

- **Memória**: capa por personagem, imagens do baralho (`app/jogos/jogo-da-memoria`).
- **Adivinhe**: palavras, dicas e imagens (`app/jogos/guess-game`).
- habilitação de jogos e personagens por escola.

### `apps/api`

Centraliza as regras de persistência. A controller `games.controller.ts` oferece
endpoints para:

- configuração de capa por jogo e personagem;
- conteúdo e validação do **Adivinhe** (`guess/*`, `guess/validate`);
- cadastro e remoção de conteúdo do **jogo da memória**;
- consulta e gravação de pontuações e histórico;
- coleta de NPS ao final dos jogos com `POST /games/nps`;
- listagem de imagens formatadas para o frontend.

## Como o score funciona

O score fica vinculado a três dimensões: **jogo**, **personagem** e **usuário**.

- **Recorde** em `game_scores`: atualizado via `POST /games/score` quando a
  pontuação supera o melhor resultado (`upsert`).
- **Histórico** em `game_score_histories`: cada partida via `POST /games/score/history`,
  associada à sessão iniciada com `startGameSession`.

Nas bibliotecas de jogos, o histórico e o recorde são disparados ao final da
partida (auto-save em `GuessGameExperience` e `MemoryGameExperience`).

## Relação com o admin

| Jogo | Sem conteúdo no admin |
| :--- | :--- |
| Memória | Sem cartas para montar o tabuleiro |
| Adivinhe | Sem palavra jogável para o personagem |

Alterações no admin refletem na próxima rodada carregada pelo estudante.

## Analytics de jogos

Eventos Mixpanel (via `@etnos/analytics`):

| Evento                   | Momento                                                       |
| ------------------------ | ------------------------------------------------------------- |
| `game_selected`          | Estudante escolhe o jogo                                      |
| `game_finished`          | Partida termina na UI (antes ou independente de salvar score) |
| `game_session_completed` | Backend persiste histórico (`game_score_histories`)           |

Propriedades típicas: `game_slug`, `game_name`, `character_slug`, `score`,
`outcome` (`won` / `lost` no Adivinhe). Detalhes em
[Analytics](analytics-architecture.md).

## Histórico de partidas

Além do recorde em `game_scores`, a API persiste cada sessão em
`game_score_histories` (`saveGameScoreHistory` em `useGames` na web e callback
equivalente no mobile). Isso alimenta relatórios no admin e o evento
`game_session_completed`.

## Habilitação por escola

Antes de jogar, o app consulta `GET /schools/me/game-access`. As tabelas
`school_enabled_games` e `school_enabled_characters` definem o que cada escola
pode acessar.

## Jogos da plataforma

| Slug | Documentação | Conteúdo |
| :--- | :--- | :--- |
| `guess-game` | [Adivinhe](guess-game.md) | `guess_game_contents` |
| `memory-game` | [Jogo da memória](memory-game.md) | `memory_game_contents` + `game_configs` |
