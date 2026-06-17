# ETNOS: gamificando a diversidade

![Etnos](./files/github-cover.jpg)

## Sobre o projeto

O **Etnos** é uma plataforma educacional para estudantes do ensino fundamental.
A proposta é usar jogos interativos para apresentar a diversidade cultural
brasileira de forma lúdica, visual e acessível.

O projeto está organizado como **monorepo** com aplicações web, app nativo
(Expo), painel administrativo, API NestJS e pacotes compartilhados.

Versão atual da plataforma: **1.9.0** (ver [CHANGELOG](https://github.com/joaojuniorbr/etnos/blob/main/CHANGELOG.md)).

## Objetivo pedagógico

- promover respeito às diferenças étnico-raciais;
- valorizar saberes, símbolos, histórias e tradições do Brasil;
- transformar o aprendizado em uma jornada envolvente e participativa.

## Público-alvo

- estudantes do 5º ano do ensino fundamental;
- faixa etária principal entre 10 e 12 anos;
- uso em contexto escolar, com apoio de professoras e professores.

## Experiência de jogo

Cada personagem representa um recorte cultural e regional do Brasil. A jornada
combina seleção de personagem, escolha do desafio e progressão por pontuação e
recordes.

### Personagens

| Região | Personagem | Foco cultural |
| :--- | :--- | :--- |
| Amazônia | Iara Curumim | floresta, lendas e biodiversidade |
| Minas Gerais | Tonico do Fogão | culinária, memória afetiva e interior |
| Rio de Janeiro | Dandara do Morro | ritmos, resistência e cultura urbana |
| Nordeste | Zeca do Sertão | festas, oralidade e símbolos populares |
| Sul | Anita dos Pampas | tradições gaúchas e identidade regional |

### Jogos

- **[Adivinhe](guess-game.md)**: descobrir uma palavra com dicas, letras e chute
  pela palavra inteira (portal web).
- **[Jogo da Memória](memory-game.md)**: encontrar pares visuais do personagem
  (web e app mobile).

## Funcionalidades da plataforma

- dashboard do estudante com resumo de progresso;
- painel admin com gestão de escolas, usuários, mídia e jogos;
- dashboard de performance e NPS no admin;
- histórico de pontuações e atividades;
- notificações push no app mobile;
- analytics Mixpanel em todos os apps de produto.

## Mapa da documentação

### Arquitetura

| Guia | Conteúdo |
| :--- | :--- |
| [Monorepo](monorepo-architecture.md) | Apps, pacotes, fluxo entre camadas |
| [App mobile](mobile-architecture.md) | Expo, rotas, auth e jogos no nativo |
| [Pacotes compartilhados](packages-overview.md) | `ui`, `tools`, `services`, `core`, `analytics`, etc. |
| [Autenticação](auth-architecture.md) | Firebase Auth + perfil no Postgres |
| [Analytics](analytics-architecture.md) | Mixpanel, eventos e identidade |
| [Mídia](media-architecture.md) | Upload, Storage e tabela `midia` |
| [Swagger](swagger.md) | Documentação interativa da API |

### Jogos e dados

| Guia | Conteúdo |
| :--- | :--- |
| [Jogos](games-architecture.md) | Biblioteca `@etnos/games`, score e admin |
| [Adivinhe](guess-game.md) | Regras, UI, API e pontuação |
| [Jogo da memória](memory-game.md) | Baralho, níveis e fluxo |
| [Arquitetura de dados](database-architecture.md) | Postgres, Prisma, Firebase |
| [Modelagem](data-model.md) | Tabelas, relações e índices |

### Qualidade

| Guia | Conteúdo |
| :--- | :--- |
| [Testes de performance](performance-tests.md) | Cenários k6, thresholds e resultados |

### Entregas acadêmicas

Planejamento de sprints (2026) e entregas históricas (2025) na seção **Entregas**
do menu.

## Links úteis

- [Repositório no GitHub](https://github.com/joaojuniorbr/etnos)
- [Swagger (produção)](https://api.etnos.online/docs)
- [Aplicação](https://etnos.online)
- [Storybook](https://691f7645d388cc8aa2a047b6-amyptzoyzk.chromatic.com/)

## Desenvolvimento local

```bash
git clone https://github.com/joaojuniorbr/etnos.git
cd etnos
yarn install
yarn dev
```

Portas principais:

| Serviço | URL |
| :--- | :--- |
| Web | http://localhost:3000 |
| Admin | http://localhost:3001 |
| Student | http://localhost:3002 |
| API | http://localhost:8080/api (padrão NestJS) |
| Swagger | http://localhost:8080/docs |
| Storybook | http://localhost:6006 |

Documentação MkDocs (local):

```bash
cd docs-site && mkdocs serve
```
