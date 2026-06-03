# SPRINT 6 - (11/05/2026 - 24/05/2026)

## 1. Adicionar os Relatórios das Sprints na Documentação do Projeto

Tarefa: Adicionar os Relatórios das Sprints na Documentação do Projeto (já finalizada)

Data em que foi concluída: 28/05/2026 às 22:00

#### Observações referente ao desenvolvimento da tarefa:

Foi realizada a atualização da documentação do projeto com a inclusão dos relatórios das sprints desenvolvidas, organizando as informações das entregas e atividades executadas ao longo do desenvolvimento.
 
## 2. Revisão de UX e Compatibilidade Cross-Browser 

Tarefa: Revisão de UX e Compatibilidade Cross-Browser (já finalizada)

Data em que foi concluída: 21/05/2026 às 15:41

#### Observações referente ao desenvolvimento da tarefa:

Foram realizados ajustes visuais na interface da plataforma, incluindo refinamentos de espaçamento, alinhamento e tipografia, visando melhorar a experiência e a padronização visual da aplicação.
Também foram executados testes de compatibilidade nos navegadores Chrome, Firefox, Safari e Edge para garantir o funcionamento e a consistência do layout em diferentes ambientes de acesso.
 
## 3. Homologação Geral

Tarefa: Homologação Geral (já finalizada)

Data em que foi concluída: 21/05/2026 às 16:57

#### Observações referente ao desenvolvimento da tarefa:

Foram realizados testes manuais nos principais fluxos da plataforma, contemplando as jornadas de Aluno e Admin, com o objetivo de validar a estabilidade das funcionalidades após as últimas alterações técnicas realizadas nas sprints anteriores.
Também foram verificados processos como cadastro, login, escolha de personagem, gravação de score, dashboard administrativo e funcionamento do fluxo “Esqueci minha senha”.
 
## 4. Nova Área do Estudante na Web

Tarefa: Nova área do estudante na web (já finalizada)

Data em que foi concluída: 21/05/2026 às 10:03

#### Observações referente ao desenvolvimento da tarefa:

Foi implementado o novo dashboard inicial da plataforma ETNOS, substituindo a antiga tela de boas-vindas. A tela passou a exibir informações reais do backend, como pontuação, jogos concluídos, ranking e atividades recentes.
 
Também foram realizados ajustes para permitir a seleção/troca do guia cultural e garantir o funcionamento da interface com e sem personagem selecionado.
 
## 5. Alterar a Interface visual do jogo adivinhe a palavra

Tarefa: Alterar a Interface visual do jogo adivinhe a palavra (já finalizada)

Data em que foi concluída: entre os dias 25/08/2026 e 28/05/2026

#### Observações referente ao desenvolvimento da tarefa:

Foi realizada a atualização das imagens do jogo “Adivinhe a Palavra”, incluindo a implementação de imagens relacionadas às palavras cadastradas no sistema. O objetivo foi melhorar a associação entre as dicas e a resposta esperada para cada palavra.
Durante o desenvolvimento, foram ajustados os componentes visuais da tela para suportar a exibição das imagens sem comprometer a responsividade e a navegação do jogo. Também foram realizados testes para validar a exibição correta das imagens e a compatibilidade com diferentes resoluções de telas.
 
## 6. Refinamento de Queries e Performance de Dados 

Tarefa: Refinamento de Queries e Performance de Dados (já finalizada)

Data em que foi concluída: 19/05/2026 às 01:10

#### Observações referente ao desenvolvimento da tarefa:

Durante testes simultâneos realizados com alunos utilizando a plataforma ETNOS, foram identificados problemas relacionados ao limite de conexões do PostgreSQL no Supabase. Para solucionar o cenário, foram implementadas melhorias na comunicação com o banco de dados e otimizações no backend e frontend da aplicação.
Os ajustes incluíram configuração do PgBouncer, implementação de Prisma Singleton, otimização de queries, aplicação de cache e revisão das configurações do React Query para reduzir requisições desnecessárias. Após as alterações, foram realizados novos testes para validar a estabilidade e a melhora de performance da plataforma em acessos concorrentes.

## 7. Padronização Técnica e Qualidade de Código

Tarefa: Padronização Técnica e Qualidade de Código (já finalizada)

Data em que foi concluída: 19/05/2026 às 01:09

#### Observações referente ao desenvolvimento da tarefa:

Foram realizados ajustes de padronização do ambiente de desenvolvimento, incluindo configuração do ESLint, ativação de validações mais rígidas no TypeScript e revisão da compatibilidade do projeto com Node. Também foi validada a integração do Sonar Cloud para análise contínua da qualidade do código.

## 8. Implementar Dashboard de Monitoramento de Progresso

Tarefa: Implementar Dashboard de Monitoramento de Progresso (já 
finalizada)

Data em que foi concluída: 19/05/2026 às 01:09

#### Observações referente ao desenvolvimento da tarefa:

Foi desenvolvido o dashboard administrativo para visualização do desempenho dos alunos, incluindo gráficos e tabelas com informações de pontuação média por escola e ranking dos alunos com maiores pontuações no Jogo da Memória. Também foi implementado filtro por escola para facilitar a análise dos dados pelos administradores e pedagogos.

## 9. Implementar Mix Panel para Acompanhamento de Jornada

Tarefa: Implementar Mix Panel para Acompanhamento de Jornada (já 
finalizada)

Data em que foi concluída: 19/05/2026 às 01:09

#### Observações referente ao desenvolvimento da tarefa:

Realizada a implementação do Mixpanel no monorepo ETNOS para permitir o monitoramento da jornada do estudante nos ambientes web e mobile, incluindo autenticação, seleção de personagens, jogos, recuperação de senha e persistência de pontuação. Foi criado o pacote compartilhado @etnos/analytics, com padronização dos eventos, configuração via variáveis de ambiente e controle de identificação/reset de usuários. Também foram adicionadas documentações, exemplos de .env e realizadas validações manuais no Mixpanel Live View para garantir o correto envio dos eventos.

## 10. Atualização da Documentação Técnica Final

Tarefa: Atualização da Documentação Técnica Final (já finalizada)

Data em que foi concluída: 19/05/2026 às 01:09

#### Observações referente ao desenvolvimento da tarefa:

Foi realizada a revisão e atualização da documentação do projeto, incluindo README, diagramas de arquitetura e manual de deploy, garantindo alinhamento com a estrutura atual do monorepo ETNOS. Também foram revisados os arquivos .md da raiz e da pasta /docs, corrigindo links, ajustando instruções de execução/deploy e atualizando os diagramas de Caso de Uso e Classes conforme o estado final da aplicação.

## Leitura geral da equipe após a execução das tarefas da Sprint 6:
A sprint teve 10 tarefas no total. No estado atual da lista, todas as tarefas foram finalizadas
As entregas fechadas se concentraram principalmente entre 16/05 e 19/05, com destaque para a frente técnica de performance, qualidade de código, dashboard, documentação e instrumentação.

A sprint marcou a etapa final do desenvolvimento do projeto consolidando melhorias técnicas, ajustes visuais, otimizações de performance e funcionalidades voltadas à experiência dos alunos e administradores. Durante o período, também foram realizados testes e validações para garantir maior estabilidade, usabilidade e qualidade da aplicação antes da finalização do projeto.

Com a conclusão desta sprint, o projeto encerra seu ciclo de desenvolvimento com as principais funcionalidades implementadas, documentação atualizada e ambiente preparado para utilização e futuras manutenções.
 