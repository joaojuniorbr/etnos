# SPRINT 3 - (30/03/2026 - 12/04/2026)
## 1. Adicionar nível de dificuldade no jogo da memória

Tarefa: Adicionar nível de dificuldade no jogo da memória (já finalizada)

Data em que foi concluída: 08/04/2026 às 20:12

Observações referente ao desenvolvimento da tarefa:
08/04:

Concluído. Adicionados níveis de dificuldade adequados ao público-alvo.

Adicionar novos avatares

Tarefa: Adicionar novos avatares (já finalizada)

Data em que foi concluída: 07/04/2026 às 15:35

Observações referente ao desenvolvimento da tarefa:
07/04:

Concluído. Adicionadas 10 opções de avatar para cada personagem.

Alterar a forma de pontuação do jogo da memória
Tarefa: Alterar forma de pontuação do jogo da memória (já finalizada)
Data em que foi concluída: 08/04/2026 às 20:11
Observações referente ao desenvolvimento da tarefa:
08/04:
Foi concluída a implementação do sistema de pontuação do jogo da memória. Agora, a cada par correto são somados 100 pontos, enquanto erros resultam em desconto de 100 pontos, permitindo pontuação negativa. Também foi adicionado bônus progressivo para acertos consecutivos, aumentando em 50 pontos a cada sequência de acerto (100, 150, 200, etc.). Em caso de erro, a sequência é reiniciada e o próximo acerto volta a valer 100 pontos.

Criar fluxo de alteração de senha
Tarefa: Criar fluxo de alteração de senha (já finalizada)
Data em que foi concluída: 08/04/2026 às 20:12
Observações referente ao desenvolvimento da tarefa:
08/04:
Foi concluído o fluxo de alteração de senha na página de perfil para usuários autenticados, garantindo acesso apenas em rota protegida e validação da senha atual antes da troca. Também foram implementados bloqueios para senha atual incorreta, confirmação divergente e reutilização da senha atual, com mensagens adequadas de erro e sucesso. Além disso, foi disponibilizada a opção “Esqueci minha senha” no perfil, utilizando o mesmo fluxo de redefinição já existente no login, com envio de e-mail e confirmação da solicitação.

Histórico de jogos
Tarefa: Histórico de jogos (já finalizada)
Data em que foi concluída: 08/04/2026 às 20:12
Observações referente ao desenvolvimento da tarefa:
08/04:
Foi concluída a implementação do histórico de pontuações, registrando automaticamente cada partida com usuário, escola, data/hora, jogo e score. Os registros não sobrescrevem tentativas anteriores e permanecem independentes do recorde atual, com validação no Dashboard do Looker Studio.

Implementar Observabilidade Básica e Logs Estruturados 
Tarefa: Implementar Observabilidade Básica e Logs Estruturados (já finalizada)
Data em que foi concluída: 08/04/2026 às 20:11
Observações referente ao desenvolvimento da tarefa:
22/03:
O Sentry foi instalado, permitindo atuação mais proativa em erros críticos. Foram anexadas evidências visuais anexadas no card.

Migração dos Dados estáticos do jogo adivinhe uma palavra para o admin
Tarefa: Migração dos Dados estáticos do jogo adivinhe uma palavra para o admin (já finalizada)
Data em que foi concluída: 08/04/2026 às 20:12
Observações referente ao desenvolvimento da tarefa:
08/04:
Foi concluída a integração do Guess Game com o banco de dados, com validações no backend e proteção da palavra correta no endpoint público. Também foi habilitado no admin o cadastro, edição e exclusão de conteúdos, incluindo descrição final exibida ao jogador ao acertar.

Otimização de Performance e Lazy Loading 
Tarefa: Otimização de Performance e Lazy Loading (já finalizada)
Data em que foi concluída: 08/04/2026 às 20:11
Observações referente ao desenvolvimento da tarefa:
08/04:
Foi concluída a otimização de carregamento do aplicativo, garantindo que as páginas de jogos carreguem apenas quando o usuário acessar a rota correspondente, reduzindo o consumo de dados e o tempo de espera inicial.

Reforço de Segurança no Firebase 
Tarefa: Reforço de Segurança no Firebase (já finalizada)
Data em que foi concluída: 08/04/2026 às 20:11
Observações referente ao desenvolvimento da tarefa:
08/04:
Concluído e validado. Um usuário logado não pode ler o documento de score de outro usuário, não sendo possível modificar dados de outros alunos ou de outras escolas.

 Revisão Final de Responsividade Mobile 
Tarefa:Revisão Final de Responsividade Mobile (já finalizada)
Data em que foi concluída: 07/04/2026 às 15:35
Observações referente ao desenvolvimento da tarefa:
07/04:
Teste realizado em iPhone 11, com validação positiva do comportamento responsivo, sem sobreposição de textos ou ícones e com funcionamento correto das telas.

Seleção de Avatar
Tarefa: Seleção de Avatar (já finalizada)
Data em que foi concluída: 08/04/2026 às 20:12
Observações referente ao desenvolvimento da tarefa:
08/04:
Concluído e validado. Selecionado o personagem escolhido, só são apresentadas imagens vinculadas à esse personagem. Imagem de perfil escolhida e salva com sucesso.

Leitura geral da equipe após a execução das tarefas da Sprint 3:
Todas as 11 tarefas da sprint foram fechadas antes do encerramento do ciclo, o que representa 100% de conclusão da sprint.
Algumas tarefas tiveram fechamento após a data de vencimento interna do card, com concentração de atrasos principalmente entre os itens previstos para 03/04 a 06/04:
Adicionar nível de dificuldade no jogo da memória: 5 dias após o vencimento.
Alterar a forma de pontuação do jogo da memória: 5 dias após o vencimento.
Criar fluxo de alteração de senha: 4 dias após o vencimento.
Histórico de jogos: 4 dias após o vencimento.
Adicionar novos avatares: 3 dias após o vencimento.
Implementar Observabilidade Básica e Logs Estruturados: 2 dias após o vencimento.
Reforço de Segurança no Firebase: 2 dias após o vencimento.

Algumas atividades foram concluídas antes do vencimento previsto, o que mostra folga em parte da sprint:
Revisão Final de Responsividade Mobile: concluída 4 dias antes do vencimento.
Migração dos Dados estáticos do jogo adivinhe uma palavra para o admin: concluída 3 dias antes do vencimento.
Seleção de Avatar: concluída 2 dias antes do vencimento.
No geral, a sprint teve bom resultado: apesar de atrasos pontuais nas datas intermediárias dos cards, houve concentração de fechamento em 07 e 08/04, e o time conseguiu concluir toda a sprint com antecedência em relação ao prazo final de 12/04.
