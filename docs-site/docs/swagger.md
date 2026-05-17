# Swagger

## Visão geral

A API do Etnos expõe a documentação interativa pelo Swagger UI. Essa interface
mostra os endpoints disponíveis, os corpos esperados, os parâmetros, os grupos
de rotas e os cenários de autenticação com bearer token.

No ambiente local, com a API na porta padrão do NestJS (`PORT=8080`), a
documentação fica em:

- **Swagger UI:** `http://localhost:8080/docs`
- **Base da API:** `http://localhost:8080/api`

Se `PORT=3333` no `.env`, use `http://localhost:3333/docs`.

As rotas documentadas aparecem com prefixo `/api` (ex.: `/api/auth`,
`/api/games`, `/api/midia`).

## O que aparece no Swagger

Hoje a documentação da API cobre estes grupos (entre outros):

- `Autenticação`
- `Público`
- `Personagens`
- `Escolas`
- `Jogos`
- `Mídia`
- `Notificações` (admin)
- `Métricas` (`GET /api/metrics` — Prometheus)

Cada grupo reúne os endpoints da controller correspondente, com parâmetros,
corpos, autenticação e descrições básicas de uso.

## Como usar

### Rotas públicas

As rotas públicas podem ser testadas direto na interface.

Exemplos:

- `POST /api/public/contact`
- `GET /api/public/schools`

### Rotas autenticadas

As rotas protegidas usam bearer token. O token pode ser obtido nos endpoints:

- `POST /api/auth/login`
- `POST /api/auth/google`
- `POST /api/auth/register`

O `idToken` retornado por esses endpoints pode ser usado no botão **Authorize**
do Swagger.

## Organização da documentação

O Swagger é gerado em tempo de execução a partir dos decorators do NestJS.
Entre os principais decorators usados na API estão:

- `@ApiTags`
- `@ApiOperation`
- `@ApiBody`
- `@ApiParam`
- `@ApiQuery`
- `@ApiResponse`
- `@ApiBearerAuth`

Essa abordagem mantém a documentação perto das controllers e dos DTOs usados
pelas rotas.

## Ambiente Produtivo

Acesse em [api.etnos.online/docs](https://api.etnos.online/docs)
