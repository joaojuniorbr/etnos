# Etnos - Plataforma Educacional de Jogos Culturais

> Uma plataforma educacional para crianças de 10 a 12 anos que utiliza **jogos interativos** para ensinar sobre a rica diversidade cultural brasileira.

[![Version](https://img.shields.io/badge/version-1.0.1-blue.svg)](./CHANGELOG.md)
![Node](https://img.shields.io/badge/Node-%3E%3D18-green)
![Yarn](https://img.shields.io/badge/Yarn-1.22.19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue)
![License](https://img.shields.io/badge/license-UNLICENSED-lightgray)

---

## 📋 Visão Geral

O **Etnos** é um monorepo moderno e escalável construído com [Turborepo](https://turbo.build/repo/docs), TypeScript e as melhores práticas de desenvolvimento web. A plataforma é composta por múltiplas aplicações (Next.js, NestJS) e bibliotecas compartilhadas de componentes e utilitários.

### 🎯 Componentes Principais

- **Site Institucional** (`web`) - Apresentação pública da plataforma
- **Painel Administrativo** (`admin`) - Gerenciamento de usuários, jogos e conteúdo
- **Portal do Estudante** (`student`) - Área interativa para crianças jogarem e aprender
- **API REST** (`api`) - Backend com NestJS e Firebase
- **Biblioteca de Componentes** (`ui`) - Componentes React reutilizáveis
- **Biblioteca de Jogos** (`games`) - Jogos educacionais implementados em React
- **Documentação** (`docs`) - Storybook com documentação de componentes

---

## 🚀 Stack Tecnológico

### Frontend
- **Next.js 16** - Framework React com renderização otimizada
- **React 19** - Biblioteca de UI moderna
- **TypeScript 5.9.2** - Type safety
- **Tailwind CSS** - CSS utility-first
- **@tanstack/react-query** - Gerenciamento de estado assíncrono
- **Ant Design** - Componentes UI (admin/web)
- **Firebase SDK** - Autenticação e realtime database
- **Swiper** - Carrosel e slides

### Backend
- **NestJS** - Framework Node.js robusto
- **Passport.js** - Autenticação com Firebase JWT
- **Express** - Server HTTP
- **Firebase Admin SDK** - Acesso ao backend Firebase

### Monorepo & Build
- **Turborepo 2.7** - Orquestrção e caching inteligente
- **Yarn Workspaces** - Gerenciamento de dependências
- **TypeScript** - Type checking centralizado

### Teste
- **Vitest** - Testing framework moderno e rápido
- **@testing-library** - Testing utilities
- **Playwright** - E2E testing
- **Jest** - Testing no backend
- **jsdom** - Ambiente DOM para testes

### Qualidade & DevOps
- **ESLint** - Linting configurável
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **CommitLint** - Validação de commits
- **Docker** - Containerização
- **Google Cloud Build** - CI/CD pipeline
- **Google Cloud Run** - Hospedagem serverless
- **Vercel** - Deploy de apps Next.js
- **SonarQube** - Análise de qualidade de código
- **Semantic Release** - Versionamento automático
- **Chromatic** - Testes visuais e documentação

---

## 📦 Requisitos

- **Node.js** >= 18.x
- **Yarn** >= 1.22.19
- **Git**
- **Docker** (opcional, para container local)

---

## 🛠️ Primeiros Passos

### 1. Clonar o Repositório

```bash
git clone https://github.com/joaojuniorbr/etnos.git
cd etnos
```

### 2. Instalar Dependências

```bash
yarn install
```

### 3. Configurar Variáveis de Ambiente

Crie arquivos `.env.local` para cada aplicação:

#### `apps/web/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:3333
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

#### `apps/admin/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:3333
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

#### `apps/student/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:3333
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

#### `apps/api/.env`
```env
NODE_ENV=development
PORT=3333
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key_json
FIREBASE_CLIENT_EMAIL=your_firebase_service_account@your_project.iam.gserviceaccount.com
```

### 4. Iniciar em Desenvolvimento

```bash
yarn dev
```

Isso iniciará todas as aplicações simultaneamente. Acesse:

- **Web**: http://localhost:3000
- **Admin**: http://localhost:3001
- **Student**: http://localhost:3002
- **API**: http://localhost:3333 (backend)
- **Storybook**: http://localhost:6006

---

## 📁 Estrutura do Monorepo

```
etnos/
├── apps/
│   ├── web/               # Site institucional (Next.js)
│   ├── admin/             # Painel administrativo (Next.js)
│   ├── student/           # Portal do estudante (Next.js)
│   ├── api/               # API REST backend (NestJS)
│   ├── games/             # Biblioteca de jogos (React package)
│   └── docs/              # Storybook e documentação
│
├── packages/
│   ├── ui/                # @etnos/ui - Componentes React
│   ├── tools/             # @etnos/tools - Hooks e utilitários
│   ├── eslint-config/     # @etnos/eslint-config
│   ├── typescript-config/ # @etnos/typescript-config
│   └── tailwind-config/   # @etnos/tailwind-config
│
├── docs-site/             # Documentação MkDocs
├── turbo.json             # Configuração Turborepo
├── package.json           # Root package.json
├── Dockerfile             # Docker para API
├── cloudbuild.yaml        # Pipeline Google Cloud Build
└── README.md              # Este arquivo
```

---

## 📚 Aplicações Detalhadas

### **apps/web** - Site Institucional

Site público com informações sobre a plataforma.

```bash
yarn dev --filter=web          # Desenvolvimento
yarn build --filter=web         # Build
yarn lint --filter=web          # Lint
yarn check-types --filter=web   # Verificar tipos
```

- **Porta**: 3000
- **URL**: http://localhost:3000
- **Tecnologia**: Next.js 16, React 19, Tailwind CSS
- **Dependências**: @etnos/ui, @etnos/tools, Firebase, Ant Design

---

### **apps/admin** - Painel Administrativo

Sistema de gerenciamento da plataforma para administradores.

**Funcionalidades**:
- Gerenciar usuários e permissões
- Criar e editar jogos
- Gerenciar conteúdo educacional
- Visualizar progresso dos estudantes
- Gerenciar escolas e turmas

```bash
yarn dev --filter=admin         # Desenvolvimento
yarn build --filter=admin       # Build
yarn lint --filter=admin        # Lint
yarn check-types --filter=admin # Verificar tipos
```

- **Porta**: 3001
- **URL**: http://localhost:3001
- **Tecnologia**: Next.js 16, React 19, Tailwind CSS, Ant Design
- **Dependências**: @etnos/ui, @etnos/tools

---

### **apps/student** - Portal do Estudante

Plataforma interativa onde crianças acessam jogos e aprendem.

**Funcionalidades**:
- Seleção de personagens/guias culturais
- Acesso aos jogos educacionais
- Acompanhamento de progresso
- Sistema de pontuação e badges
- Integração com biblioteca de jogos

**Rotas Principais**:
- `/` - Home
- `/estudante/jogos` - Seleção de jogos
- `/estudante/jogos/jogo-da-memoria` - Jogo da Memória
- `/estudante/jogos/advinhe` - Adivinhe a Palavra

```bash
yarn dev --filter=student         # Desenvolvimento
yarn build --filter=student       # Build
yarn ink --filter=student        # Lint
yarn check-types --filter=student # Verificar tipos
```

- **Porta**: 3002
- **URL**: http://localhost:3002
- **Tecnologia**: Next.js 16, React 19, @etnos/games
- **Dependências**: @etnos/ui, @etnos/tools, @etnos/games

---

### **apps/api** - API REST Backend

Servidor NestJS que fornece dados e gerencia a lógica de negócio.

**Módulos Principais**:
- `auth/` - Autenticação com Firebase
- `characters/` - Gerenciamento de personagens culturais
- `games/` - Dados e metadados dos jogos
- `schools/` - Informações de escolas
- `media/` - Upload e gerenciamento de mídia
- `email/` - Serviço de envio de emails
- `firebase/` - Integração com Firebase

**Endpoints**:
```
POST   /auth/login              - Login
POST   /auth/register           - Registro
GET    /characters              - Listar personagens
POST   /characters              - Criar personagem
GET    /games                   - Listar jogos
POST   /games                   - Criar jogo
GET    /schools                 - Listar escolas
POST   /media/upload            - Upload de arquivo
```

```bash
yarn dev --filter=api           # Desenvolvimento com watch
yarn build --filter=api         # Build
yarn start --filter=api         # Iniciar produção
yarn test --filter=api          # Rodar testes
yarn lint --filter=api          # Lint
```

- **Porta**: 3333
- **URL**: http://localhost:3333
- **Tecnologia**: NestJS, Express, Firebase Admin SDK
- **Database**: Firebase Firestore

---

### **apps/games** - Biblioteca de Jogos

Componentes React reutilizáveis que implementam os jogos educacionais.

**Jogos Implementados**:
1. **Jogo da Memória** (`MemoryGame`)
   - Encontrar pares de cartas
   - Sistema de pontuação
   - Dificuldades progressivas

2. **Adivinhe a Palavra** (`GuessGame`)
   - Adivinhar palavras
   - Dicas personalizadas
   - Temas culturais

```bash
yarn dev --filter=games                # Desenvolvimento
yarn build --filter=games              # Build completo
yarn build:components --filter=games   # Build TypeScript
yarn build:styles --filter=games       # Build Tailwind CSS
yarn check-types --filter=games        # Verificar tipos
```

- **Tecnologia**: React 19, TypeScript, Tailwind CSS
- **Exporta**: Componentes via `@etnos/games`
- **Consumido por**: `apps/student`

---

### **apps/docs** - Storybook & Documentação

Documentação interativa de componentes usando Storybook.

```bash
yarn dev --filter=@etnos/docs    # Desenvolvimento
yarn build --filter=@etnos/docs  # Build estático
yarn test --filter=@etnos/docs   # Testes das stories
```

- **Porta**: 6006
- **URL Local**: http://localhost:6006
- **URL Produção**: [Chromatic](https://main--691f7645d388cc8aa2a047b6.chromatic.com/?path=/docs/configure-your-project--docs)
- **Tecnologia**: Storybook 8, Vitest, Playwright
- **Integração**: Chromatic para testes visuais

---

## 📦 Pacotes Compartilhados

### **packages/ui** - @etnos/ui

Biblioteca centralizada de componentes React reutilizáveis.

**Estrutura**:
- `@atoms/` - Componentes básicos (Button, Input, etc.)
- `@molecules/` - Componentes compostos (Card, Form, etc.)
- `@organisms/` - Componentes complexos (Header, Footer, etc.)
- `@templates/` - Layouts de página

```bash
yarn build --filter=@etnos/ui      # Build
yarn test --filter=@etnos/ui       # Rodar testes
yarn test --filter=@etnos/ui -- --watch  # Watch mode
yarn test --filter=@etnos/ui -- test:ui  # UI do Vitest
```

- **Testes**: Vitest + @testing-library/react
- **Cobertura**: Relatórios de cobertura
- **Documentação**: Stories no Storybook

---

### **packages/tools** - @etnos/tools

Hooks React customizados e utilitários compartilhados.

**Estrutura**:
- `helpers/` - Funções utilitárias puras
- `hooks/` - React hooks customizados
- `services/` - Classes de serviço (API, Firebase, etc.)
- `firestore/` - Cliente Firestore configurado
- `test/` - Utilitários de teste

```bash
yarn build --filter=@etnos/tools   # Build
yarn test --filter=@etnos/tools    # Rodar testes
yarn test --filter=@etnos/tools -- --watch  # Watch mode
```

- **Testes**: Vitest
- **Cobertura**: Relatórios de cobertura

---

### **packages/eslint-config** - @etnos/eslint-config

Configuração compartilhada do ESLint.

Inclui:
- `base.js` - Regras base JavaScript/TypeScript
- `react-internal.js` - Regras React
- `next.js` - Regras Next.js específicas

---

### **packages/typescript-config** - @etnos/typescript-config

Configurações TypeScript compartilhadas.

Inclui:
- `base.json` - Configuração base
- `nextjs.json` - Configuração Next.js
- `react-library.json` - Configuração para bibliotecas React

---

### **packages/tailwind-config** - @etnos/tailwind-config

Tema e configuração centralizada do Tailwind CSS.

Inclui:
- Paleta de cores
- Tipografia
- Componentes customizados
- Breakpoints

---

## 📝 Scripts RootMondo

Todos os comandos abaixo são executados no contexto do monorepo usando Turborepo.

### Desenvolvimento

```bash
# Iniciar todas as aplicações simultaneamente
yarn dev

# Iniciar aplicações específicas
yarn dev --filter=web
yarn dev --filter=admin
yarn dev --filter=student
yarn dev --filter=api
yarn dev --filter=games
yarn dev --filter=@etnos/ui
yarn dev --filter=@etnos/docs
```

### Build

```bash
# Build de todas as aplicações
yarn build

# Build de aplicação específica
yarn build --filter=web
yarn build --filter=admin
yarn build --filter=student
yarn build --filter=api

# Verificar tipos em tudo
yarn check-types
```

### Testes

```bash
# Rodar todos os testes
yarn test

# Testes com cobertura
yarn test -- --coverage

# Watch mode
yarn test -- --watch

# Testes de aplicação específica
yarn test --filter=@etnos/ui
yarn test --filter=@etnos/tools
```

### Qualidade de Código

```bash
# Lint em tudo
yarn lint

# Lint de aplicação específica
yarn lint --filter=web

# Verificar tipos TypeScript
yarn check-types

# Formatar código
yarn format
```

### Git & Release

```bash
# Commit com commitizen (validação automática)
yarn commit

# Validar commit
yarn commit:check

# Release automática com semântica (CI/CD)
yarn release

# Preparar git hooks (husky)
yarn prepare
```

---

## 🎮 Desenvolvendo Jogos

Os jogos são componentes React em `apps/games` e são consumidos por `apps/student`.

### Estrutura de um Jogo

```typescript
// apps/games/src/games/MyGame/MyGame.tsx
import React from 'react';

interface MyGameProps {
  characterId: string;
  onComplete?: (score: number) => void;
}

export const MyGame: React.FC<MyGameProps> = ({ characterId, onComplete }) => {
  // Implementação do jogo
  return <div>Meu Jogo</div>;
};
```

### Adicionar Novo Jogo

1. Criar arquivo em `apps/games/src/games/MyGame/MyGame.tsx`
2. Implementar componente React
3. Exportar em `apps/games/src/games/index.ts`
4. Adicionar rota em `apps/student/app/jogos/[slug]/page.tsx`
5. Registrar em admin panel

### Rodando Jogos Localmente

```bash
# 1. Iniciar o desenvolvimento geral
yarn dev

# 2. Acessar http://localhost:3002/estudante/jogos
# 3. Selecionar um jogo

# Para desenvolvimento direto na biblioteca
cd apps/games
yarn dev
```

---

## 🧪 Testes

### Visão Geral

O monorepo usa **Vitest** para testes moderno e rápido.

```bash
# Rodar todos os testes
yarn test

# Modo watch
yarn test -- --watch

# Com cobertura
yarn test -- --coverage
```

### Testes por Pacote

#### @etnos/ui - Componentes

```bash
yarn test --filter=@etnos/ui
yarn test --filter=@etnos/ui -- --watch
yarn test --filter=@etnos/ui -- test:ui    # UI visual
```

#### @etnos/tools - Hooks e Serviços

```bash
yarn test --filter=@etnos/tools
yarn test --filter=@etnos/tools -- --watch
```

#### apps/api - Backend

```bash
yarn test --filter=api
yarn test:watch --filter=api
yarn test:cov --filter=api     # Com cobertura
yarn test:e2e --filter=api     # E2E tests
```

#### apps/docs - Storybook Stories

```bash
cd apps/docs
npx vitest
```

### Melhores Práticas

- Use `@testing-library` para testes focados no comportamento
- Mantenha testes próximos aos componentes
- Sempre teste casos de borda (edge cases)
- Aim para >80% de cobertura

---

## 📚 Storybook

Documentação interativa de componentes.

### Rodar Storybook

```bash
# Modo desenvolvimento
yarn dev --filter=@etnos/docs

# Ou entrar na pasta
cd apps/docs
yarn dev
```

**URL**: http://localhost:6006

### Build para Produção

```bash
cd apps/docs
yarn build
```

### Publicação em Chromatic

A publicação é automática via GitHub Actions quando há push para `main`.

**URL Publicada**: [Chromatic Dashboard](https://main--691f7645d388cc8aa2a047b6.chromatic.com/?path=/docs/configure-your-project--docs)

---

## 🚀 Deployment

### Deploying Next.js Apps (Vercel)

As aplicações `web`, `admin` e `student` estão configuradas para deploy em Vercel.

```bash
# Build local
yarn build --filter=web

# Vercel automatically deploys on push to main
```

### Deploying API (Google Cloud Run)

A API é containerizada com Docker e deployada em Cloud Run.

```bash
# Build da image
docker build -t etnos-api .

# Run local
docker run -p 3333:3333 etnos-api

# Deploy automático via Google Cloud Build quando há push
```

**CI/CD Pipeline** (`cloudbuild.yaml`):
1. Build Docker image
2. Push para Artifact Registry
3. Deploy para Cloud Run

---

## 🔧 Troubleshooting

### Portfólio já em uso

Se uma porta estiver em uso:

```bash
# Encontrar processo na porta
lsof -i :3000

# Matar processo
kill -9 <PID>
```

### Limpar cache do Turborepo

```bash
# Remover cache
rm -rf .turbo

# Reconstruir
yarn build
```

### Problemas com dependências

```bash
# Reinstalar tudo
rm -rf node_modules
rm yarn.lock
yarn install
```

### Erro de tipos TypeScript

```bash
# Verificar todos os tipos
yarn check-types

# Reparar tipos em pacote específico
yarn check-types --filter=@etnos/ui
```

---

## 📖 Documentação Adicional

- **MkDocs**: [docs-site/](docs-site/) - Documentação do projeto
- **Figma**: [Protótipo UI/UX](https://www.figma.com/proto/DC1bYnTWGpp1ppCLhuOm1e/Etnos?node-id=2-6&p=f&t=D7YYcgs2oQdpQxIR-1&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=2%3A6)
- **Chromatic**: [Storybook em Produção](https://main--691f7645d388cc8aa2a047b6.chromatic.com/?path=/docs/configure-your-project--docs)
- **GitHub**: [Repositório](https://github.com/joaojuniorbr/etnos)

---

## 📋 Convensões do Projeto

### Commits

Utilizamos **Conventional Commits** para melhor rastreabilidade:

```
feat: adicionar novo jogo
fix: corrigir bug na autenticação
docs: atualizar README
style: formatar código
refactor: reorganizar estrutura
test: adicionar testes
chore: atualizar dependências
```

Use `yarn commit` para criar commits validados.

### Versionamento

- **Semântica**: MAJOR.MINOR.PATCH
- **Automático**: Via `semantic-release`
- **Release** no `main` triggers automático

---

## 🤝 Contribuições

1. Crie uma branch (`git checkout -b feature/amazing-feature`)
2. Commit suas mudanças (`yarn commit`)
3. Push para a branch (`git push origin feature/amazing-feature`)
4. Abra um Pull Request

---

## 📄 Licença

UNLICENSED - Todos os direitos reservados

---

## ✨ Últimas Mudanças

Para ver o histórico completo de mudanças, consulte [CHANGELOG.md](CHANGELOG.md).

**Versão Atual**: 1.0.1 (28 de Fevereiro de 2026)
