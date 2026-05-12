# ETNOS Performance Tests

Este pacote concentra os testes iniciais de performance do ETNOS com k6. O primeiro cenário valida o endpoint público `GET /public/schools`, cobrindo os RNFs iniciais de usuários simultâneos e tempo de resposta da API.

## Instalar o k6

O k6 roda como CLI instalada no ambiente, por isso não é uma dependência npm obrigatória deste pacote.

macOS:

```sh
brew install k6
```

Outras opções de instalação estão na documentação oficial do k6: https://grafana.com/docs/k6/latest/set-up/install-k6/

## Rodar contra ambiente local

Com a API local disponível em `http://localhost:8080/api`:

```sh
API_URL=http://localhost:8080/api k6 run packages/performance/scripts/public-schools.js
```

Também é possível rodar pelo workspace do pacote:

```sh
yarn workspace @etnos/performance test:public-schools
```

Quando `API_URL` não for informada, o teste usa `http://localhost:8080/api`.

## Rodar contra ambiente publicado

Informe a URL base publicada da API, mantendo o sufixo `/api`:

```sh
API_URL=https://minha-api.com/api k6 run packages/performance/scripts/public-schools.js
```

## Fluxo autenticado de leitura

O teste `auth-read-flow` simula usuários existentes fazendo:

1. `POST /auth/login`
2. `GET /auth/profile`
3. `GET /schools/me/game-access`
4. `GET /characters?slug=<personagem-habilitado>`

Ele não chama cadastro e não deve criar usuários. Cada VU faz login uma vez e reutiliza o token nas iterações seguintes, simulando navegação autenticada sem forçar login a cada ciclo. Mesmo assim, rode apenas contra uma base/ambiente preparado para teste, usando usuários já existentes.

Os scripts do pacote carregam automaticamente `packages/performance/.env`. Como esse arquivo é ignorado pelo Git, você pode colocar credenciais locais nele:

```env
API_URL=http://localhost:8080/api
AUTH_EMAIL=usuario@etnos.com
AUTH_PASSWORD=<defina-no-env-local>
```

Ou, para vários usuários:

```env
API_URL=http://localhost:8080/api
AUTH_USERS_JSON=[{"email":"usuario-1@etnos.com","password":"<defina-no-env-local>"},{"email":"usuario-2@etnos.com","password":"<defina-no-env-local>"}]
```

Com um usuário:

```sh
yarn workspace @etnos/performance test:auth-read-flow
```

Com vários usuários:

```sh
API_URL=http://localhost:8080/api \
AUTH_USERS_JSON='[
  {"email":"usuario-1@etnos.com","password":"<defina-no-env-local>"},
  {"email":"usuario-2@etnos.com","password":"<defina-no-env-local>"}
]' \
yarn workspace @etnos/performance test:auth-read-flow
```

Com summary JSON:

```sh
yarn workspace @etnos/performance test:auth-read-flow:summary
```

Com Grafana:

```sh
yarn workspace @etnos/performance test:auth-read-flow:grafana
```

Não salve credenciais reais no repositório. Passe e-mail/senha apenas por variáveis de ambiente ou por um arquivo local ignorado pelo Git.

## Gerar summary JSON

```sh
API_URL=http://localhost:8080/api k6 run --summary-export=packages/performance/results/public-schools-summary.json packages/performance/scripts/public-schools.js
```

Ou pelo workspace do pacote:

```sh
API_URL=http://localhost:8080/api yarn workspace @etnos/performance test:public-schools:summary
```

O arquivo gerado fica em `packages/performance/results/public-schools-summary.json`.

## Acompanhar no Grafana

Este pacote inclui uma stack local com Prometheus e Grafana para acompanhar o teste em tempo real. O k6 envia as métricas para o Prometheus via remote write, e o Grafana já sobe com datasource e dashboard provisionados.

Suba a stack:

```sh
cd packages/performance
yarn observability:up
```

Ou pela raiz do monorepo:

```sh
yarn workspace @etnos/performance observability:up
```

Acesse o Grafana em:

- `http://localhost:9000`

Dashboard provisionado:

- `ETNOS / ETNOS - k6 Public Schools`
- `ETNOS / ETNOS - API Observability`

Rode o teste enviando métricas para o Grafana:

```sh
cd packages/performance
API_URL=http://localhost:8080/api yarn test:public-schools:grafana
```

Ou pela raiz:

```sh
API_URL=http://localhost:8080/api yarn workspace @etnos/performance test:public-schools:grafana
```

Para ambiente publicado:

```sh
API_URL=https://minha-api.com/api yarn workspace @etnos/performance test:public-schools:grafana
```

Quando terminar:

```sh
yarn workspace @etnos/performance observability:down
```

O Prometheus também coleta a API local em `http://host.docker.internal:8080/api/metrics`. Para ver métricas da aplicação no dashboard `ETNOS - API Observability`, deixe a API rodando localmente na porta `8080`.

Endpoint exposto pela API:

```sh
curl http://localhost:8080/api/metrics
```

## Métricas para observar

- `http_req_duration` p95: deve ficar abaixo de `600ms`.
- `http_req_failed`: deve ficar abaixo de `5%`.
- Duração média das requisições.
- Usuários virtuais ativos durante os estágios.
- Total e taxa de requisições.
- Métricas da API: p95 por rota, requisições por segundo, erros 5xx, memória e event loop.

O cenário atual aumenta a carga progressivamente até 50 usuários virtuais e valida se o endpoint público mantém status `200` e tempo de resposta adequado.

## Sentry

O Sentry já está configurado na API NestJS em `apps/api`:

- dependências `@sentry/nestjs` e `@sentry/profiling-node`;
- inicialização em `apps/api/src/instrument.ts`;
- filtro global `SentryGlobalFilter` em `apps/api/src/app.module.ts`;
- variável `SENTRY_DSN` documentada em `apps/api/README.md`.

Para ativar o envio de eventos, configure `SENTRY_DSN` no ambiente onde a API roda. Este pacote de performance não adiciona DSN, tokens ou senhas ao repositório.

Para enxergar o teste no Sentry durante uma rodada local/staging:

```sh
SENTRY_DSN=https://seu-dsn-do-sentry \
yarn workspace api dev
```

Com `SENTRY_DSN` configurado, a API envia traces, profiling e logs para o Sentry mesmo em desenvolvimento. Os defaults são `SENTRY_TRACES_SAMPLE_RATE=1` e `SENTRY_PROFILE_SESSION_SAMPLE_RATE=1`; ajuste essas variáveis se quiser reduzir volume. `SENTRY_SEND_DEFAULT_PII` fica `false` por padrão em todos os ambientes.

O script k6 envia o header `X-ETNOS-Load-Test: public-schools`. A API usa esse header para marcar os spans do Sentry e registrar logs de anomalia quando uma chamada do teste passar de `600ms` ou retornar erro `5xx`.

No Sentry, procure por:

- spans/traces com atributo `etnos.load_test=public-schools`;
- logs com mensagem `ETNOS load test request anomaly`.

Requisições normais e rápidas não viram logs individuais no Sentry para evitar milhares de eventos durante testes de carga. Para série temporal completa, use o Grafana.
