# Testes de performance

## Visão geral

O pacote `packages/performance` concentra testes de carga com [k6](https://grafana.com/docs/k6/). Os cenários validam endpoints críticos da API contra os requisitos não funcionais do projeto (RNF002 e RNF003).

| RNF    | Meta                                                         |
| ------ | ------------------------------------------------------------ |
| RNF002 | Até 50 usuários simultâneos                                  |
| RNF003 | Tempo de resposta da API &lt; 600 ms (p95 em rotas públicas) |

A API expõe métricas Prometheus em `GET /api/metrics` e pode marcar spans no Sentry
quando recebe o header `X-ETNOS-Load-Test`.

## Ferramentas

| Item                  | Detalhe                                            |
| --------------------- | -------------------------------------------------- |
| Runner                | k6 (CLI instalada no ambiente, não via npm)        |
| Scripts               | `packages/performance/scripts/*.js`                |
| Observabilidade local | Prometheus `:9090` + Grafana `:9000`               |
| Resultados locais     | `packages/performance/results/*.json` (gitignored) |

### Instalação do k6

```bash
brew install k6   # macOS
```

### Executar um cenário

```bash
# API local (porta padrão do NestJS: 8080)
API_URL=http://localhost:8080/api yarn workspace @etnos/performance test:public-schools

# Smoke de personagens (~1,5 min)
yarn workspace @etnos/performance test:characters:smoke

# Perfil standard de personagens (~5 min)
yarn workspace @etnos/performance test:characters

# Fluxo autenticado (requer credenciais em packages/performance/.env)
yarn workspace @etnos/performance test:auth-read-flow
```

## Cenários de teste

### 1. Escolas públicas (`public-schools`)

Valida o endpoint usado no cadastro e onboarding.

| Item                  | Valor                                  |
| --------------------- | -------------------------------------- |
| Endpoint              | `GET /public/schools`                  |
| Header                | `X-ETNOS-Load-Test: public-schools`    |
| Duração               | ~3 min 30 s                            |
| Carga                 | 10 → **100** → 50 → 50 → 0 VUs         |
| Sleep entre iterações | 1 s                                    |
| Threshold global      | p95 &lt; **600 ms**, erros &lt; **5%** |

### 2. Personagens (`characters`)

Exercita leitura do catálogo com mix realista e fase de warmup para cache.

| Endpoint                        | Tráfego |
| ------------------------------- | ------- |
| `GET /characters`               | ~70%    |
| `GET /characters/:slug`         | ~20%    |
| `GET /characters/:slug/avatars` | ~10%    |

**Fases:** warmup (só lista) → carga sustentada (`ramping-vus`).

| Perfil     | Comando                  | Pico VUs | Thresholds principais                     |
| ---------- | ------------------------ | -------- | ----------------------------------------- |
| `smoke`    | `test:characters:smoke`  | 25       | p95 global &lt; 800 ms; lista &lt; 500 ms |
| `standard` | `test:characters`        | 75       | p95 global &lt; 600 ms; lista &lt; 400 ms |
| `stress`   | `test:characters:stress` | 150      | p95 global &lt; 900 ms; lista &lt; 600 ms |

Métricas customizadas:

- `characters_list_ms_warmup` / `characters_list_ms_load` — latência da lista por fase;
- `characters_cache_likely_hits` — respostas &lt; 120 ms (indício de cache quente no servidor).

O catálogo de personagens usa cache em memória com TTL de ~5 minutos na API.

### 3. Fluxo autenticado (`auth-read-flow`)

Simula navegação de usuário logado (sem cadastro).

| Passo | Endpoint                      |
| ----- | ----------------------------- |
| 1     | `POST /auth/login`            |
| 2     | `GET /auth/profile`           |
| 3     | `GET /schools/me/game-access` |
| 4     | `GET /characters?slug=...`    |

| Item             | Valor               |
| ---------------- | ------------------- |
| Duração          | ~2 min              |
| Carga            | 10 → **50** → 0 VUs |
| Login p95        | &lt; **1200 ms**    |
| Demais rotas p95 | &lt; **800 ms**     |
| Erros            | &lt; **5%**         |

Credenciais via `packages/performance/.env` (gitignored):

```env
API_URL=http://localhost:8080/api
AUTH_EMAIL=usuario@exemplo.com
AUTH_PASSWORD=...
```

## Observabilidade durante os testes

### Stack local (Grafana + Prometheus)

```bash
yarn workspace @etnos/performance observability:up
# Grafana: http://localhost:9000
# Dashboards: ETNOS - k6 Public Schools, ETNOS - API Observability

API_URL=http://localhost:8080/api yarn workspace @etnos/performance test:public-schools:grafana

yarn workspace @etnos/performance observability:down
```

### Métricas da API

- `etnos_api_http_requests_total`
- `etnos_api_http_request_duration_seconds` (histograma por rota)

Com `SENTRY_LOAD_TEST_ANOMALY_LOGS=true`, a API registra anomalias quando uma
requisição de load test passa de 600 ms ou retorna 5xx.

## Resultados de referência (ambiente local)

Os números abaixo foram coletados em **17/05/2026**, com API NestJS rodando em
`localhost:8080`, PostgreSQL local e k6 v2.0.0. Servem como linha de base de
desenvolvimento; **produção e staging devem ser validados separadamente**.

### `public-schools` (perfil completo, até 100 VUs)

| Métrica                    | Resultado  | Threshold   | Status |
| -------------------------- | ---------- | ----------- | ------ |
| `http_req_duration` p95    | **9 ms**   | &lt; 600 ms | ✓      |
| `http_req_duration` avg    | **3,6 ms** | —           | —      |
| `http_req_duration` max    | 162 ms     | —           | —      |
| Taxa de erro               | **0%**     | &lt; 5%     | ✓      |
| Requisições totais         | 9.456      | —           | —      |
| Throughput                 | ~45 req/s  | —           | —      |
| Checks (200 + &lt; 600 ms) | 100%       | —           | ✓      |

### `characters` — perfil `smoke` (até 25 VUs, ~1 min 15 s)

| Métrica                               | Resultado  | Threshold   | Status |
| ------------------------------------- | ---------- | ----------- | ------ |
| Lista — p95 warmup                    | **5,5 ms** | —           | —      |
| Lista — p95 carga                     | **8,8 ms** | &lt; 500 ms | ✓      |
| Hits prováveis de cache (&lt; 120 ms) | 1.739      | —           | —      |

### `characters` — perfil `standard` (até 75 VUs, ~4 min 45 s)

| Métrica                               | Resultado                     | Threshold   | Status |
| ------------------------------------- | ----------------------------- | ----------- | ------ |
| Lista — p95 warmup                    | **7,9 ms**                    | —           | —      |
| Lista — p95 carga                     | **7,4 ms**                    | &lt; 400 ms | ✓      |
| Hits prováveis de cache (&lt; 120 ms) | 26.308                        | —           | —      |
| Erros HTTP                            | 0% (implícito — teste passou) | &lt; 2%     | ✓      |

!!! note "Interpretação do cache"
Quase todas as requisições da lista ficaram abaixo de 120 ms após o warmup,
indicando que o cache em memória do catálogo respondeu de forma consistente
sob carga de até 75 VUs no ambiente local.

### `auth-read-flow`

Não incluído na tabela acima: exige usuários de teste reais em
`packages/performance/.env`. Configure credenciais e rode:

```bash
yarn workspace @etnos/performance test:auth-read-flow:summary
```

O JSON gerado fica em `packages/performance/results/auth-read-flow-summary.json`.

## Exportar resultados

```bash
yarn workspace @etnos/performance test:public-schools:summary
yarn workspace @etnos/performance test:characters:summary
```

Arquivos em `packages/performance/results/` (não versionados no Git).

## Índices de banco relacionados

A migration `20260516120000_add_performance_indices` adiciona índices em tabelas
de score, histórico e mídia para consultas frequentes sob carga. Detalhes em
[Modelagem de Dados](data-model.md).
