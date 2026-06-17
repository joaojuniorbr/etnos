# Jogo Adivinhe (`guess-game`)

O **Adivinhe** desafia o estudante a descobrir uma palavra cultural com apoio de
dicas, imagem e tentativas limitadas. A validação das letras e da palavra
completa ocorre no backend; o frontend concentra a experiência em
`@etnos/games`.

## Componentes principais

| Arquivo | Papel |
| :--- | :--- |
| `GuessGame.tsx` | Integração com hooks (`useGames`, `useGameScore`), sessão, NPS e analytics |
| `GuessGameExperience.tsx` | Estado da partida, teclado, dicas, vidas e tela final |
| `GuessGameUi.tsx` | Caixinhas de letras, cartões, botões e imagem |
| `guess-game.scoring.ts` | Pontuação por dica, acerto de letra e resolução da palavra |

## Fluxo da partida

1. o estudante escolhe o personagem e abre o jogo (`apps/student/app/jogos/advinhe`);
2. `GET /games/guess/play/:characterSlug` retorna palavra jogável (máscara, dicas, imagem);
3. o estudante pode **pedir dicas** (com penalidade de pontos) ou **tentar letras**;
4. letras corretas revelam posições na palavra; erros consomem vidas (10 no total);
5. ao completar todas as letras ou **chutar a palavra inteira**, a API valida em
   `POST /games/guess/validate`;
6. ao terminar, score e histórico são salvos automaticamente; NPS pode ser exibido na vitória.

## Interface do estudante

### Dicas e palavra revelada

- dicas liberadas uma a uma, com contador de restantes;
- prévia da palavra com indicador de letras reveladas;
- imagem ilustrativa (ou placeholder quando não houver URL).

### Tentar uma letra

- campo de uma letra com botão **Tentar letra** ou tecla **Enter**;
- acerto: som de flip, pontos e revelação nas caixinhas da palavra;
- erro: som de erro e perda de uma vida.

### Chutar a palavra inteira

- caixinhas clicáveis para posicionar o cursor (`word-attempt-*`);
- digitação pelo teclado (A–Z, **Backspace**) na seção da palavra;
- botão **← Apagar** e **Chutar palavra**;
- o chute incorreto também consome uma vida.

### Tela final

- palavra correta e descrição cultural (quando retornada pela API);
- `FinishGame` com opção de jogar novamente;
- `GameNpsModal` após vitória (se o estudante ainda não avaliou o jogo).

## Pontuação

Regras em `guess-game.scoring.ts`:

| Ação | Pontos |
| :--- | :--- |
| Pedir dica | −50 (mínimo 0 no total acumulado) |
| Acertar letra | +100 |
| Resolver palavra sem letras reveladas | `tamanho × 200` |
| Resolver com letras já reveladas | `letras restantes × 120` |

Ao finalizar, `GuessGameExperience` persiste recorde (`saveGameScore`) e histórico
(`saveGameScoreHistory`) via callbacks do host. O botão manual em `FinishGame`
permite salvar novamente se necessário.

## API e conteúdo

### Endpoints

| Método | Rota | Uso |
| :--- | :--- | :--- |
| `GET` | `/games/guess/play/:characterSlug` | Conteúdo jogável da rodada |
| `POST` | `/games/guess/validate` | Valida letra ou palavra |
| `GET` | `/games/guess/:characterSlug` | Lista conteúdo (admin) |
| `POST` | `/games/guess` | Cadastra conteúdo |
| `DELETE` | `/games/guess/:id` | Remove conteúdo |

Score, histórico e NPS seguem os endpoints gerais em [Arquitetura dos jogos](games-architecture.md).

### Admin

Em `apps/admin/app/jogos/guess-game`, a equipe cadastra palavras, dicas, imagens
e personagem associado. Tabela: `guess_game_contents`.

## Analytics

| Evento | Momento |
| :--- | :--- |
| `game_selected` | Escolha do jogo |
| `game_finished` | Partida encerrada na UI (`outcome`: `won` / `lost`) |
| `game_session_completed` | Histórico persistido no backend |

Detalhes em [Analytics](analytics-architecture.md).

## Mobile

O Adivinhe está disponível no **portal web** (`apps/student`). No app nativo
(`apps/student-mobile`) apenas o **jogo da memória** está implementado hoje.

## Testes

Suite em `apps/games/src/games/GuessGame/` com Vitest (integração via `GuessGame`
e unitários em `GuessGameUi`). Cobertura de 100% no pacote `@etnos/games`.
