![Etnos](./files/github-cover.jpg)

# ETNOS: gamificando a diversidade

## Sobre o projeto

O **Etnos** é uma plataforma educacional pensada para estudantes do ensino
fundamental. A proposta é usar jogos interativos para apresentar a diversidade
cultural brasileira de um jeito lúdico, visual e acessível.

O projeto está organizado como um monorepo com aplicações web, app nativo iOS e
Android, painel administrativo, portal do estudante, API e pacotes
compartilhados. Isso ajuda a reaproveitar componentes, contratos e serviços sem
espalhar lógica pelo projeto.

## Objetivo pedagógico

O produto foi desenhado para:

- promover respeito às diferenças étnico-raciais;
- valorizar saberes, símbolos, histórias e tradições do Brasil;
- transformar o aprendizado em uma jornada mais envolvente e participativa.

## Público-alvo

- estudantes do 5º ano do ensino fundamental;
- faixa etária principal entre 10 e 12 anos;
- uso em contexto escolar, com apoio de professoras e professores.

## Experiência de jogo

Cada personagem representa um recorte cultural e regional do Brasil. A jornada
do estudante combina seleção de personagem, escolha do desafio e progressão por
meio de pontuação e recordes.

### Personagens

| Regiao         | Personagem       | Foco cultural                           |
| :------------- | :--------------- | :-------------------------------------- |
| Amazonia       | Iara Curumim     | floresta, lendas e biodiversidade       |
| Minas Gerais   | Tonico do Fogão  | culinária, memória afetiva e interior   |
| Rio de Janeiro | Dandara do Morro | ritmos, resistencia e cultura urbana    |
| Nordeste       | Zeca do Sertao   | festas, oralidade e simbolos populares  |
| Sul            | Anita dos Pampas | tradicoes gauchas e identidade regional |

### Jogos

- **Adivinhe**: o estudante descobre uma palavra com apoio de dicas.
- **Jogo da Memória**: o estudante encontra pares visuais relacionados ao
  personagem selecionado.

## Documentação técnica

O site reúne a documentação da plataforma, dos jogos, da autenticação e da
camada de dados.

### Guias disponíveis

- **Monorepo**: explica como `web`, `student`, `student-mobile`, `admin`, `api`
  e os pacotes compartilhados se conectam.
- **Autenticação**: detalha login, cadastro, refresh de token, proteção de rotas
  e perfil autenticado, tanto na web quanto no app nativo.
- **App Mobile**: descreve a arquitetura do app Expo para iOS e Android, com
  Expo Router, contextos de autenticação e seleção de personagem, e o pacote
  `packages/core` que serve de base para o cliente de API mobile.
- **Mídia**: descreve upload, storage, catalogação de assets e integração com o
  admin.
- **Swagger**: mostra onde acessar a documentação interativa da API e como
  testar rotas públicas e autenticadas.
- **Jogos**: panorama da integração entre `student`, `student-mobile`, `admin`,
  `apps/games`, `packages/tools`, `packages/types` e `api`, com foco especial no
  jogo da memória.
- **Banco de Dados**: organização de persistência da plataforma.
- **Modelagem**: estruturas, relações e regras principais.

## Navegação

- `Monorepo` mostra como os apps e pacotes se conectam.
- `Autenticação` reúne o fluxo de login, sessão e proteção de rotas.
- `Monorepo` também cobre o app nativo (`apps/student-mobile`) e o pacote
  `packages/core`.
- `Mídia` mostra upload, armazenamento e biblioteca de imagens.
- `Swagger` centraliza a documentação interativa da API.
- `Banco de Dados` e `Modelagem` descrevem persistência, relações e regras do
  domínio.
