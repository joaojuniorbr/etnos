# SPRINT 1 - (02/03/2026 - 15/03/2026)

Registro histórico da sprint 1 do ciclo 2026.

## 1. Implementar Login de Usuários

Tarefa: Implementar Login de Usuários (já finalizada)

Data em que foi concluída: 12 de março de 2026, às 20:06

### Observações referente ao desenvolvimento da tarefa:

- Realizado teste de login cadastrando usuário e logando com a conta do Google;
- Realizado teste de login utilizando credenciais inválidas e confirmado o aparecimento da mensagem de erro: "Email ou senha inválidos";
- Realizado o teste de redirecionamento do usuário p/ a página de seleção do personagem;
- Realizado o teste de autenticação mesmo após atualização da página.

**Correções necessárias:** Verificar a questão de exibição do nome da criança embaixo da foto de perfil após login e também a edição de cadastro (nome da criança, nome responsável e data de nascimento. Aapós ajustes no código, o nome da criança/aluno já está sendo exibido e também já é possível fazer a edição do cadastro.

## 2. Implementar Landing Page e Conteúdo Público

Tarefa: Implementar Landing Page e Conteúdo Público (já finalizada)

Data em que foi concluída: 12 de março de 2026, às 20:23

### Observações referente ao desenvolvimento da tarefa:

- Realizado o teste de carregamento da página e a exibição das informações necessárias (sobre, objetivos e como funciona, bem como botão COMECE AGORA (para redirecionar para a tela de login) - funções em perfeito funcionamento.

## 3. Desenvolver Fluxo de Cadastro de Usuário (UC001)

Tarefa: Desenvolver Fluxo de Cadastro de Usuário (já finalizada)

Data em que foi concluída: 13 de março de 2026, às 15:32

### Observações referente ao desenvolvimento da tarefa:

- Realizados os testes de cadastro: validação dos campos obrigatórios;
- Armazenamento dos dados do usuário cadastrado no Fire Base Authentication sendo realizado perfeitamente;
- Não permitida a criação de dois usuários com o mesmo e-mail.

## 4. Configurar Proteção de Rotas e Middleware (RF025)

Tarefa: Configurar Proteção de Rotas e Middleware (já finalizada)

Data em que foi concluída: 13 de março de 2026, às 20:58

### Observações referente ao desenvolvimento da tarefa::

- Correção necessária: Ao tentar acessar á página usando a url https://etnos.vercel.app/jogos, o usuário que não está logado/autenticado no sistema, não está sendo redirecionado para a página de login e após ajustes realizados no código, a configuração de rotas foi corrigida;
- O usuário logado não consegue acessar a página de cadastro novamente;
- Correção necessária: Quanto ao acesso à https://etnos.vercel.app/jogos , a mensagem exibida é a seguinte: "404 This page could not be found.". Após correções, a rota funcionou corretamente.

## 5. Garantir Responsividade Mínima e Feedback Visual

Tarefa: Garantir Responsividade Mínima e Feedback Visual

Data em que foi concluída: 13 de março de 2026, às 20:58

### Observações referente ao desenvolvimento da tarefa::

- A aplicação foi acessada de dois aparelhos celulares diferentes e está responsiva e com a visualização devida.

---

## Leitura geral da equipe após a execução das tarefas da Sprint 1:

- A sprint fecha com 100% das, sem backlog carregado para a sprint seguinte a partir desta lista.
- Os pequenos desvios de prazo foram resolvidos ainda dentro da própria sprint.
- O fluxo de status e os registros sugerem um bom andamento de desenvolvimento e uma homologação concentrada no final, sem grandes travas no decorrer das tarefas.
