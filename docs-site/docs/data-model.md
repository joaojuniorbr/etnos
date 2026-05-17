# Modelagem de dados

## Visão geral

O banco principal é **PostgreSQL**, modelado em **Prisma**. A fonte de verdade
do schema é `apps/api/prisma/schema.prisma`.

## Resumo das tabelas

| Tabela                      | Finalidade                                |
| --------------------------- | ----------------------------------------- |
| `users`                     | Perfil de negócio (Firebase `uid`)        |
| `schools`                   | Escolas cadastradas                       |
| `school_accesses`           | Vínculo usuário ↔ escola                  |
| `school_enabled_games`      | Jogos habilitados por escola              |
| `school_enabled_characters` | Personagens habilitados por escola        |
| `characters`                | Catálogo de personagens culturais         |
| `game_configs`              | Capa/config visual por jogo e personagem  |
| `memory_game_contents`      | Cartas do jogo da memória                 |
| `guess_game_contents`       | Palavras e dicas do Amotion               |
| `game_scores`               | Recorde atual por usuário/jogo/personagem |
| `game_score_histories`      | Histórico de partidas                     |
| `game_nps_responses`        | Feedback NPS pós-jogo                     |
| `midia`                     | Metadados de arquivos no Storage          |
| `user_push_tokens`          | Tokens Expo para push                     |
| `notification_templates`    | Modelos de notificação                    |
| `notification_logs`         | Registro de envios                        |

## Entidades

### `users`

Perfil de negócio vinculado ao Firebase Auth.

| Campo                                                           | Descrição                        |
| --------------------------------------------------------------- | -------------------------------- |
| `id`                                                            | CUID interno                     |
| `firebase_uid`                                                  | Chave com Firebase (único)       |
| `email`                                                         | E-mail                           |
| `parent_name`, `child_name`, `child_birth_date`, `parent_phone` | Dados do responsável/criança     |
| `school_id`                                                     | FK para `schools.id`             |
| `photo_url`                                                     | Avatar/foto                      |
| `avatar_character_slug`                                         | Personagem escolhido como avatar |
| `roles`                                                         | Papéis (`student`, etc.)         |
| `is_active`                                                     | Conta ativa                      |
| `notifications_enabled`                                         | Opt-in de push                   |

Relações Prisma: `school`, `schoolAccesses`, `pushTokens`.

### `schools`

| Campo           | Descrição                                       |
| --------------- | ----------------------------------------------- |
| `name`          | Nome (único)                                    |
| `code`          | Código para cadastro por link (único, opcional) |
| `city`, `state` | Localização                                     |

Relações: usuários, acessos, jogos/personagens habilitados.

### `school_accesses`

Vínculo explícito usuário ↔ escola (além de `users.school_id`).

- único: `(school_id, user_id)`

### `school_enabled_games` / `school_enabled_characters`

Controlam o que cada escola pode usar.

- `game_slug` / `character_slug` com FK para escola;
- `character_slug` referencia `characters.slug`.

Usado em `GET /schools/me/game-access` e validações no app do estudante.

### `characters`

Catálogo de personagens (slug único, região, descrição, `image_url`).

### `game_configs`

Configuração visual por par `(game_slug, character_slug)`.

- exemplo: `image_cover_url` do jogo da memória.

### `memory_game_contents`

Cartas por personagem (`character_id` → `characters.id`, `slug`, `url`).

### `guess_game_contents`

Conteúdo do Adivinhe: `word`, `tips[]`, `title`, `description`, `character_slug`.

### `game_scores`

Recorde atual (upsert) por `(slug, character_slug, user_id)`.

- `slug`: identificador do jogo (ex.: `memory-game`)
- `user_id`: `firebase_uid` do estudante

### `game_score_histories`

Histórico de partidas para analytics e relatórios.

| Campo                         | Descrição                    |
| ----------------------------- | ---------------------------- |
| `game_slug`, `character_slug` | Contexto da partida          |
| `score`                       | Pontuação                    |
| `user_id`                     | Firebase UID                 |
| `school_id`                   | Escola no momento da partida |
| `started_at`, `ended_at`      | Janela da sessão             |
| `status`                      | Ex.: `completed`             |

Índices compostos para consultas por usuário, escola e jogo.

### `game_nps_responses`

Feedback após o jogo.

| Campo                         | Descrição             |
| ----------------------------- | --------------------- |
| `rating`                      | Nota NPS              |
| `comment`                     | Comentário opcional   |
| `game_slug`, `character_slug` | Contexto              |
| `user_id`, `school_id`        | Quem respondeu e onde |

### `midia`

Metadados de arquivos no Firebase Storage (`url`, `folder`, `path`, `user_id`).

### `user_push_tokens`

Token Expo por dispositivo, ligado a `users.id`.

### `notification_templates` / `notification_logs`

Templates reutilizáveis e log de campanhas enviadas (escola alvo, contagem de tokens, etc.).

## Índices e performance

Além das chaves únicas por domínio, a migration `20260516120000_add_performance_indices`
reforça consultas frequentes em:

- histórico de scores (`user_id`, `school_id`, `game_slug`, datas);
- NPS e mídia por usuário/escola;
- listagens do admin sob carga.

Ver [Testes de performance](performance-tests.md) para validação com k6.

## Convenções

| Tópico           | Convenção                                   |
| ---------------- | ------------------------------------------- |
| Integração auth  | `firebase_uid` como elo Firebase ↔ Postgres |
| URLs de jogo/API | `slug` de personagem e `game_slug`          |
| Arquivos         | URLs no banco; binário no Storage           |
| Nomes físicos    | `snake_case` via `@map` no Prisma           |
