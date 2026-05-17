# Jogo da memória

O jogo da memória foi estruturado como uma experiência configurável por
personagem. Em vez de deixar cartas fixas dentro da aplicação, o frontend busca
um conjunto de imagens cadastrado no admin e transforma isso em tabuleiro.

## Componentes principais

- `MemoryGame.tsx`: ponto de integração entre hooks, score, configuração e UI.
- `MemoryGameExperience.tsx`: renderiza placar, grid de cartas e tela final.
- `useMemoryGame.ts`: gerencia estado do tabuleiro, pares, movimentos e score.
- `@etnos/core`: utilitários compartilhados de preparação, embaralhamento e pontuação das cartas.
- `memory-game.types.ts`: contratos locais da feature (`MemoryGameSound` e reexport dos tipos do core).

## Fluxo do jogo da memória

![Modelagem de Dados](files/memory-game-flow.png)

## Como o jogo é montado

Para montar a experiência, o jogo usa duas fontes principais.

### 1. Configuração visual

Fica salva como configuração de jogo por personagem. É daí que sai, por
exemplo, a imagem de capa usada no verso das cartas.

Campos relevantes:

- `gameSlug`
- `characterSlug`
- `imageCoverUrl`

### 2. Conteúdo do baralho

Fica salvo nos itens de conteúdo do jogo da memória. Cada registro representa
uma imagem disponível para duplicação e montagem dos pares.

Campos relevantes:

- `id`
- `slug`
- `url`
- `idCharacter`
