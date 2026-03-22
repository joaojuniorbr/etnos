![Etnos](./files/github-cover.jpg)

# ETNOS: gamificando a diversidade

## Sobre o projeto

O **Etnos** e uma plataforma educacional pensada para estudantes do ensino
fundamental, usando jogos interativos para apresentar a diversidade cultural
brasileira de forma ludica, visual e acessivel.

O projeto esta organizado como um monorepo com aplicacoes web, painel
administrativo, portal do estudante, API e pacotes compartilhados. Isso permite
evoluir a experiencia dos jogos com reuso de componentes, contratos e servicos.

## Objetivo pedagogico

O produto foi desenhado para:

- promover respeito as diferencas etnico-raciais;
- valorizar saberes, simbolos, historias e tradicoes do Brasil;
- transformar o aprendizado em uma jornada mais envolvente e participativa.

## Publico-alvo

- estudantes do 5o ano do ensino fundamental;
- faixa etaria principal entre 10 e 12 anos;
- uso em contexto escolar, com apoio de professoras e professores.

## Experiencia de jogo

Cada personagem representa um recorte cultural e regional do Brasil. A jornada
do estudante combina selecao de personagem, escolha do desafio e progressao por
meio de pontuacao e recordes.

### Personagens atuais

| Regiao         | Personagem       | Foco cultural                           |
| :------------- | :--------------- | :-------------------------------------- |
| Amazonia       | Iara Curumim     | floresta, lendas e biodiversidade       |
| Minas Gerais   | Tonico do Fogao  | culinaria, memoria afetiva e interior   |
| Rio de Janeiro | Dandara do Morro | ritmos, resistencia e cultura urbana    |
| Nordeste       | Zeca do Sertao   | festas, oralidade e simbolos populares  |
| Sul            | Anita dos Pampas | tradicoes gauchas e identidade regional |

### Jogos atuais

- **Adivinhe**: o estudante descobre uma palavra com apoio de dicas.
- **Jogo da Memoria**: o estudante encontra pares visuais relacionados ao
  personagem selecionado.

## Documentacao tecnica

O site de documentacao agora cobre tanto a camada de dados quanto a camada de
jogos da plataforma.

### Guias disponiveis

- **Monorepo e Apps**: explica como `web`, `student`, `admin`, `api` e os
  pacotes compartilhados se conectam.
- **Autenticacao e Sessao**: detalha login, cadastro, refresh de token, protecao
  de rotas e perfil autenticado.
- **Midia e Storage**: descreve upload, storage, catalogacao de assets e
  integracao com o admin.
- **Arquitetura dos Jogos**: panorama da integracao entre `student`, `admin`,
  `apps/games`, `packages/tools`, `packages/types` e `api`, com foco especial no
  jogo da memoria.
- **Arquitetura de Banco de Dados**: organizacao de persistencia da plataforma.
- **Modelagem de Dados**: estruturas, relacoes e regras principais.

## Por onde comecar

- Se voce quer entender a experiencia do usuario, comece pela pagina de monorepo
  e depois siga para arquitetura dos jogos.
- Se voce quer entender login e areas protegidas, leia a pagina de autenticacao
  e sessao.
- Se voce quer entender upload e biblioteca de imagens, leia a pagina de midia e
  storage.
- Se voce quer entender persistencia e integracoes, siga para a documentacao de
  banco de dados.
- Se voce esta entrando no projeto para contribuir, use o `README.md` da raiz
  como guia de setup local.
