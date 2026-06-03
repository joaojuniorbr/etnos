# SPRINT 5 - (27/04/2026 - 10/05/2026)

## 1. Criação de app nativo para estudantes 

Tarefa: Criação de app nativo para estudantes (já finalizada)

Data em que foi concluída: 30/04/2026 às 15:37 

#### Observações referente ao desenvolvimento da tarefa:

Desenvolvemos o aplicativo nativo do Etnos com integração ao sistema web já existente, permitindo que estudantes acessem a plataforma utilizando as mesmas credenciais. Também foram implementadas as principais funcionalidades do aplicativo, como seleção de personagem, acesso à lista de jogos e jogo da memória, garantindo uma navegação fluida e adaptada para dispositivos móveis. Além disso, realizamos a integração com a API para persistência de login e salvamento das pontuações, assegurando uma experiência funcional no ambiente mobile. 

## 2. Implementar Gestão de Usuários no Admin

Tarefa: Implementar Gestão de Usuários no Admin (já finalizada)

Data em que foi concluída: 30/04/2026 às 15:37 

#### Observações referente ao desenvolvimento da tarefa:

Desenvolvida a funcionalidade de gerenciamento de usuários da plataforma, permitindo que administradores visualizem, filtrem e editem usuários vinculados às escolas cadastradas. Também foram implementados os recursos para alteração de perfil e gerenciamento de status das contas, facilitando o controle de acesso à plataforma. Além disso, organizamos a interface para exibir informações importantes, como ID e data de criação dos usuários, garantindo uma administração mais precisa.

## 3. Vínculo de Segurança Usuário x Escola 

Tarefa: Vínculo de Segurança Usuário x Escola (já finalizada)

Data em que foi concluída: 

#### Observações referente ao desenvolvimento da tarefa:

Desenvolvemos a validação de acesso baseada no ID da escola  do usuário, garantindo que cada aluno ou professor visualize apenas os dados, jogos e conteúdos vinculados à sua própria instituição. Também implementamos a verificação automática dessas permissões no carregamento do perfil, reforçando a segurança, a privacidade das informações e o isolamento pedagógico entre as escolas cadastradas.

## 4. Controle de Concorrência e Integridade de Uso

Tarefa: Controle de Concorrência e Integridade de Uso (já finalizada)

Data em que foi concluída: 30/04/2026 às 15:37 

#### Observações referente ao desenvolvimento da tarefa:

Implementadas melhorias de segurança e controle de concorrência nas operações críticas da plataforma, utilizando transações do Firestore para garantir integridade nas atualizações de pontuação e rankings dos alunos. Também adicionados mecanismos de throttling no frontend para evitar múltiplos envios causados por cliques repetidos, além de validações que impedem o cadastro simultâneo de escolas com o mesmo identificador. Com isso, o sistema passou a ter maior confiabilidade, consistência de dados e proteção contra sobrescritas em acessos simultâneos. 

## 5. Implementar Envio de Notificações via Painel Administrativo

Tarefa: Implementar Envio de Notificações via Painel Administrativo 
(já finalizada)

Data em que foi concluída: 04/05/2026 às 17:44 

#### Observações referente ao desenvolvimento da tarefa:

Desenvolvemos o módulo de notificações da plataforma, permitindo que administradores e gestores escolares enviem comunicados segmentados para estudantes. Também implementei o gerenciamento de templates de mensagens, histórico de envios e controle de permissões por escola, além da integração com o serviço de push notification para garantir o envio correto das notificações no aplicativo dos usuários.

## 6. Implementar Sistema de Notificações para o App de Estudantes

Tarefa: Implementar Sistema de Notificações para o App de Estudantes 
(já finalizada)

Data em que foi concluída: 04/05/2026 às 16:44 

#### Observações referente ao desenvolvimento da tarefa:

Implementado o sistema de notificações push no aplicativo mobile da plataforma, permitindo o envio de lembretes, atualizações de atividades e feedbacks de progresso para os estudantes. Também realizamos a integração com Expo Notifications e backend da aplicação para gerenciamento dos tokens dos dispositivos, o que permite que sejam enviadas notificações coletivas ou individuais para um usuário em específico, garantindo envio segmentado, autenticação persistente e redirecionamento correto do usuário para as telas do app através de deep links que nos permitem ir até a tela escolhida diretamente. 

## 7. Cadastro Simplificado de Estudante via Link da Escola

Tarefa: Cadastro Simplificado de Estudante via Link da Escola (já finalizada)

Data em que foi concluída: 07/05/2026 às 12:18 

#### Observações referente ao desenvolvimento da tarefa:

Desenvolvemos um fluxo de cadastro simplificado por link de escola, permitindo que responsáveis e alunos acessem uma URL já vinculada à instituição correta. Também adaptamos o formulário para exibir apenas os campos necessários, preenchendo automaticamente as informações da escola e do responsável, além de garantir validações, tratamento de erros para códigos inválidos e redirecionamento automático após o cadastro concluído com sucesso.

## 8. Implementar Onboarding Pós-Login para Vínculo com Escola

Tarefa: Implementar Onboarding Pós-Login para Vínculo com Escola (já finalizada)

Data em que foi concluída: 07/05/2026 às 12:18 

#### Observações referente ao desenvolvimento da tarefa:

Implementamos um fluxo de cadastro complementar para usuários que entram na plataforma sem escola vinculada, direcionando automaticamente esses alunos para uma tela onde informam o código da escola e o nome da criança antes de acessar os jogos. Também adicionamos validações para garantir que apenas usuários vinculados corretamente a uma escola consigam utilizar a área do estudante. 

## 9. Histórico de Atividades do Aluno

Tarefa: Histórico de Atividades do Aluno (já finalizada)

Data em que foi concluída: 07/05/2026 às 12:40 

#### Observações referente ao desenvolvimento da tarefa:

Desenvolvemos a visualização detalhada do histórico de partidas dos alunos no painel administrativo, permitindo que gestores escolares acompanhem informações como data, horário e pontuação de cada atividade realizada. Também implementei a ordenação das partidas da mais recente para a mais antiga, facilitando a análise do engajamento e desempenho individual dos estudantes. 

## Leitura geral da equipe após a execução das tarefas da Sprint 4:
Todas as 9 tarefas da sprint foram finalizadas, o que representa 100% de conclusão da sprint. 

- Criação de um App Nativo para os estudantes: concluída no mesmo dia do vencimento, mas após o horário previsto do card;

- Implementar Gestão de Usuários no Admin: concluída aproximadamente 4 dias antes do vencimento;

- Vínculo de Segurança Usuário x Escola: concluída aproximadamente 8 dias antes do vencimento;

- Controle de Concorrência e Integridade de Uso: concluída aproximadamente 6 dias antes do vencimento;

- Implementar Envio de Notificações via Painel Administrativo: concluída aproximadamente 2 dias antes do vencimento;

- Implementar Sistema de Notificações para o App de Estudantes: concluída aproximadamente 4 dias antes do vencimento; 

- Histórico de Atividades do Aluno: concluída aproximadamente 15 dias antes do vencimento; 

- Cadastro Simplificado de Estudante via Link da Escola: sem data de vencimento cadastrada;

- Implementar Onboarding Pós-Login para Vínculo com Escola: sem data de vencimento definida.

A sprint terminou com todos os itens entregues, sem pendências abertas, e com avanço relevante em frentes de administração, segurança, onboarding, notificações e app mobile. O principal ponto de atenção foi apenas um card concluído no mesmo dia do vencimento, após o horário previsto, mas sem comprometer a conclusão total da sprint.

 
