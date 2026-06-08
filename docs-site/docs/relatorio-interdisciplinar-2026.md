# Relatório de Desempenho do Projeto Interdisciplinar II

## Histórico da Revisão

| Versão | Data       | Responsável    | Observação                                                                                                                                                       |
| ------ | ---------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0    | 03/06/2026 | Sprint Manager | Relatório consolidado com base na lista [Sprint 1 (2/3 - 15/3)](https://app.clickup.com/90133075500/v/li/901325806192), atividades e comentários de homologação. |

## 1. Resumo Executivo da Sprint 1

- **Período da Sprint:** 02/03/2026 a 15/03/2026
- **Objetivo da Sprint:** consolidar a base do MVP do Etnos com entregas de landing page pública, cadastro, login, proteção de rotas e ajustes mínimos de responsividade, conforme as tarefas [UC009](https://app.clickup.com/t/86afpzruf), [UC001](https://app.clickup.com/t/86afpzrv0), [UC002](https://app.clickup.com/t/86afpzrwf), [RF025](https://app.clickup.com/t/86afpzrzp) e [RNF006 / RNF008](https://app.clickup.com/t/86afpzt12).
- **Status Geral:** **Com Alertas** — a sprint terminou com **100% das 5 histórias principais fechadas**, mas houve **1 entrega com atraso relevante** e **1 ajuste formal de prazo**.

## 2. Indicadores de Produtividade (Métricas de Fluxo)

### 2.1. Métricas de Tempo (médias aproximadas da sprint)

- **Response Time (Tempo de Resposta):** **~12,2 dias corridos**
  - Tempo médio entre a criação dos cards e o início da execução/primeira movimentação efetiva.
  - Esse número ficou alto porque os cards foram criados em 25/02 e parte do trabalho começou perto do meio da sprint; portanto ele inclui fila pré-sprint.

- **Cycle Time (Tempo de Ciclo):** **~3,6 dias corridos**
  - Estimativa média entre início de execução e entrada em homologação/aprovação final das 5 histórias principais.
  - O maior peso veio de [UC009](https://app.clickup.com/t/86afpzruf), que percorreu boa parte da sprint até o fechamento.

- **Lead Time (Tempo de Entrega):** **~16 dias corridos**
  - Estimativa média entre criação do card e fechamento final.
  - Como os cards foram criados antes da sprint, esse indicador também incorpora espera antes da execução.

### 2.2. Métrica de Volume (Capacidade)

- **Throughput (Vazão):** **5 tarefas entregues / sprint**
  - Foram **5 histórias principais fechadas** dentro da quinzena.
  - No quadro completo existiam **12 registros** na lista, sendo **5 tarefas principais + 7 subtarefas** da [UC009](https://app.clickup.com/t/86afpzruf).

## 3. Análise de Rastreabilidade e Cruzamento de Dados

### 3.1. Planejado vs. Realizado (Escopo)

- **Tarefas Planejadas no Backlog:** **5 histórias principais**
- **Tarefas Concluídas (Throughput):** **5**
- **Justificativa de Desvios:**
  - [UC009](https://app.clickup.com/t/86afpzruf) venceu em **05/03** e foi fechada em **12/03**: atraso aproximado de **7 dias**, embora ainda tenha sido entregue dentro da sprint. A homologação foi registrada no [comentário de QA](https://app.clickup.com/t/90133075500/86afpzruf?comment=90130236475178).
  - [UC001](https://app.clickup.com/t/86afpzrv0) teve **ajuste de prazo em 12/03** e foi fechada dentro da nova data planejada.
  - [RF025](https://app.clickup.com/t/86afpzrzp) apresentou retrabalho em homologação por conta da rota `/jogos`; a decisão foi **abrir um card na sprint seguinte** para tratar a experiência de página inexistente, registrada no [thread de comentário](https://app.clickup.com/t/90133075500/86afpzrzp?comment=90130236979684&threadedComment=90130237011447).
  - [UC002](https://app.clickup.com/t/86afpzrwf) passou por uma rechecagem funcional sobre exibição do nome da criança e edição de cadastro, registrada no [comentário de QA](https://app.clickup.com/t/90133075500/86afpzrwf?comment=90130236473850).

### 3.2. Eficiência e Esforço

- **Total de Horas Trabalhadas (Equipe):** **N/D** — não havia apontamento de horas no ClickUp para a sprint.
- **Nº de Entregas Semanais Realizadas:** **5 na quinzena**
  - Distribuição observada: **0 fechamentos na 1ª semana** e **5 fechamentos concentrados na 2ª semana**.
- **Relação Horas/Throughput:** **N/D** — sem base confiável de horas lançadas.

## 4. Análise Crítica e Plano de Ação

### 4.1. Gargalos Identificados (Dificuldades Encontradas)

Os principais gargalos não foram de volume, e sim de **concentração das entregas no fim da sprint** e de **retrabalho em homologação**:

- **UC009** foi o maior gargalo visível no fluxo: percorreu praticamente toda a sprint até o fechamento e ainda fechou após o vencimento.
- **RF025** teve um desvio de homologação por comportamento de rota inexistente; o time tratou isso como ajuste de escopo, evitando travar a entrega principal.
- **UC002** teve micro-retrabalho funcional, mas com correção rápida no dia útil seguinte.
- A maioria das validações formais ficou concentrada entre **12/03 e 13/03**, o que aumenta risco de fila de QA no fim da sprint.

#### Gráfico simples — Cycle Time aproximado por tarefa

```text
UC009  ████████████  ~11,5d
UC001  ████          ~3,6d
RNF006 ███           ~1,5d
UC002  █             <1d
RF025  █             <1d
```

Leitura do gráfico: o maior travamento visual está em UC009. As demais tarefas tiveram ciclo curto ou moderado, com gargalos mais ligados à homologação do que ao desenvolvimento em si.

### 4.2. Estratégia de Mitigação

Com base no que ficou registrado nos comentários e transições da Sprint 1, as ações mais adequadas para reduzir gargalos nas próximas entregas são:

- manter a prática de **homologação com registros objetivos**, descrevendo exatamente o que foi testado e qual foi o resultado;
- **distribuir as validações ao longo da sprint**, evitando concentrar quase todos os fechamentos nos últimos dias;
- abrir tarefas específicas para débitos identificados durante os testes, como aconteceu com a necessidade da **página 404**, que foi desdobrada para a sprint seguinte;
- formalizar ajustes de prazo sempre que necessário, para que o desvio fique visível e rastreável;
- priorizar o tratamento antecipado de itens com maior chance de retrabalho, principalmente fluxos de autenticação, navegação e experiência do usuário.

### 4.3. Lições Aprendidas na Gestão do Fluxo

- A sprint demonstrou **boa capacidade de entrega**, com as 5 histórias principais concluídas.
- Os **comentários detalhados de homologação** ajudaram a reduzir ambiguidades e facilitaram a validação final das funcionalidades.
- A concentração das aprovações no fim da sprint aumentou o risco operacional, mesmo sem comprometer o resultado final.
- O desdobramento de uma entrega em subtarefas, como ocorreu em **UC009**, ajudou na organização da execução, mas o acompanhamento da história principal continuou sendo essencial.
- O registro explícito de desvios e decisões técnicas contribuiu para manter o fluxo claro e facilitar o planejamento da sprint seguinte.

## Fechamento rápido

- **Backlog principal planejado:** 5 tarefas
- **Entregues:** 5/5 (**100%**)
- **Não concluídas:** 0
- **Atrasos relevantes:** 1 tarefa ([UC009](https://app.clickup.com/t/86afpzruf))
- **Risco principal identificado:** homologação concentrada no fim da sprint
