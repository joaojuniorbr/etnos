# Etnos

Este é o monorepo do projeto **Etnos**, uma plataforma educacional para crianças
de 10-12 anos que utiliza jogos para ensinar sobre a rica diversidade cultural
brasileira. O projeto é gerenciado com
[Turborepo](https://turbo.build/repo/docs) para otimizar a performance, e toda a
arquitetura é construída com **TypeScript** para garantir escalabilidade e
segurança de tipos.

## Estrutura do Monorepo

O projeto é organizado em workspaces (`apps`, `packages`, `backend`, `games`),
garantindo um desenvolvimento modular.

### Aplicações Web (`apps`)

Estas são as interfaces de usuário da plataforma, cada uma servindo a um
propósito específico.

- **`web`**: O site principal e público da Etnos. Serve como a página de
  entrada, apresentando a plataforma, a proposta do projeto e informações para
  pais e educadores. Acessível em `http://localhost:3000`.
- **`admin`**: O painel administrativo para gerenciamento completo da
  plataforma. Aqui, a equipe Etnos pode gerenciar usuários, cadastrar novos
  jogos, atualizar conteúdo e monitorar o progresso dos estudantes. Acessível em
  `http://localhost:3001`.
- **`student`**: O portal do estudante. É a interface onde as crianças acessam
  os jogos, acompanham seu progresso e exploram o conteúdo educacional de forma
  interativa. Acessível em `http://localhost:3002`.
- **`docs`**: A documentação técnica e de negócio do projeto, essencial para a
  colaboração da equipe. Acessível em `http://localhost:3030`.

### Jogos (`games`)

Este workspace é dedicado exclusivamente aos jogos educacionais, permitindo que
cada jogo seja desenvolvido e mantido de forma independente.

- `@etnos/game-x`
- `@etnos/game-y`
- ... (Cada jogo será um pacote separado)

### Back-end (`backend`)

Este workspace centraliza a lógica de negócios da aplicação, gerenciando dados e
a comunicação com as interfaces.

- `@etnos/api`: O núcleo do back-end, responsável por toda a comunicação com o
  banco de dados e APIs. Desenvolvido com **NestJS**, garantindo uma arquitetura
  robusta e escalável.

### Pacotes Compartilhados (`packages`)

Pacotes com código reutilizável, garantindo a consistência e a manutenção
simplificada entre as aplicações.

- `@etnos/ui`: Uma biblioteca de componentes React unificada para construir
  interfaces com a mesma identidade visual e experiência de usuário.
- `@etnos/eslint-config`: Configurações de ESLint padrão para manter a qualidade
  e a consistência do código em todo o monorepo.
- `@etnos/typescript-config`: Configurações de TypeScript (`tsconfig.json`) para
  uma verificação de tipos rigorosa e consistente.
- `@etnos/tailwind-config`: Configurações do Tailwind CSS compartilhadas para
  estilização rápida e padronizada.

---

## Mapa da Arquitetura

Aqui está uma representação visual da arquitetura do monorepo, destacando a
organização dos workspaces e seus conteúdos.

```
/etnos
├── apps/
│   ├── web/
│   ├── admin/
│   ├── student/
│   └── docs/
│
├── games/
│   ├── game-cultura-indigena/
│   ├── game-cultura-afrobrasileira/
│   └── ...
│
├── backend/
│   └── api/
│
└── packages/
    ├── ui/
    ├── eslint-config/
    ├── typescript-config/
    └── tailwind-config/
```

Essa estrutura permite que a plataforma escale de forma organizada, com a
possibilidade de adicionar novos jogos ou módulos de back-end sem impactar o
resto do sistema.
