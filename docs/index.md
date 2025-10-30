# Etnos

Este é o monorepo do projeto **Etnos**, uma plataforma educacional para crianças
de 10 a 12 anos que utiliza jogos para ensinar sobre a rica diversidade cultural
brasileira. O projeto é gerenciado com
[Turborepo](https://turbo.build/repo/docs) para otimizar a performance, e toda a
arquitetura é construída com **TypeScript** para garantir escalabilidade e
segurança de tipos.

## Estrutura do Monorepo

O projeto é organizado em workspaces, principalmente `apps` e `packages`,
garantindo um desenvolvimento modular e escalável.

### Aplicações (`apps`)

Estas são as interfaces de usuário da plataforma, cada uma servindo a um
propósito específico.

- **`web`**: O site principal e público da Etnos. Serve como a página de
  entrada, apresentando a plataforma, a proposta do projeto e informações para
  pais e educadores.
- **`admin`**: O painel administrativo para gerenciamento completo da
  plataforma. Aqui, a equipe Etnos pode gerenciar usuários, cadastrar novos
  jogos, atualizar conteúdo e monitorar o progresso dos estudantes.
- **`student`**: O portal do estudante. É a interface onde as crianças acessam
  os jogos, acompanham seu progresso e exploram o conteúdo educacional de forma
  interativa.
- **`docs`**: A documentação técnica e de negócio do projeto, essencial para a
  colaboração da equipe.

### Pacotes Compartilhados (`packages`)

Pacotes com código reutilizável, garantindo a consistência e a manutenção
simplificada entre as aplicações.

- **`@etnos/ui`**: Uma biblioteca de componentes React unificada para construir
  interfaces com a mesma identidade visual e experiência de usuário.
- **`@etnos/eslint-config`**: Configurações de ESLint padrão para manter a
  qualidade e a consistência do código em todo o monorepo.
- **`@etnos/typescript-config`**: Configurações de TypeScript (`tsconfig.json`)
  para uma verificação de tipos rigorosa e consistente.
- **`@etnos/tailwind-config`**: Configurações do Tailwind CSS compartilhadas
  para estilização rápida e padronizada.
- **`@etnos/tools`**: Ferramentas de desenvolvimento e scripts compartilhados
  utilizados no monorepo.

---

## Mapa da Arquitetura

Aqui está uma representação visual da arquitetura atual do monorepo:

```
/etnos
├── apps/
│   ├── web/
│   ├── admin/
│   ├── student/
│   └── docs/
│
└── packages/
    ├── ui/
    ├── eslint-config/
    ├── typescript-config/
    ├── tailwind-config/
    └── tools/
```

Essa estrutura permite que a plataforma escale de forma organizada, facilitando
a manutenção e o desenvolvimento de novas funcionalidades.

## Começando

Para começar a desenvolver, clone o repositório e instale as dependências:

```bash
git clone https://github.com/joaojuniorbr/etnos.git
cd etnos
yarn install
```

## Desenvolvimento

Para rodar todas as aplicações em modo de desenvolvimento, execute:

```bash
yarn dev
```

Isso iniciará cada uma das aplicações em `apps` em suas respectivas portas.

Você também pode rodar uma aplicação específica:

```bash
# Rodar a aplicação web (disponível em http://localhost:3000)
yarn dev --filter=web

# Rodar o painel do admin (disponível em http://localhost:3001)
yarn dev --filter=admin

# Rodar o portal do estudante (disponível em http://localhost:3002)
yarn dev --filter=student

# Rodar a documentação (disponível em http://localhost:3003)
yarn dev --filter=docs
```

## Build

Para construir todas as aplicações para produção, execute:

```bash
yarn build
```

Para construir uma aplicação específica:

```bash
yarn build --filter=web
```

## Linting

Para verificar a qualidade do código em todo o monorepo, execute:

```bash
yarn lint
```
