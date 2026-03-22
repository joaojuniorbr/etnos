# Swagger

## Visão geral

A API do Etnos expõe a documentação interativa pelo Swagger UI. Essa interface
mostra os endpoints disponíveis, os corpos esperados, os parâmetros, os grupos
de rotas e os cenários de autenticação com bearer token.

No ambiente local, a documentação fica disponível em:

- `http://localhost:8080/docs`

As rotas da API continuam respeitando o prefixo global `api`, então os endpoints
documentados aparecem como `/api/auth`, `/api/games`, `/api/midia` e assim por
diante.

## O que aparece no Swagger

Hoje a documentação da API cobre estes grupos:

- `Autenticação`
- `Público`
- `Personagens`
- `Escolas`
- `Jogos`
- `Mídia`

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
