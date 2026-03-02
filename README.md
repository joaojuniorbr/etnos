# Etnos - Plataforma Educacional de Jogos Culturais

> Uma plataforma educacional feita para crianças de **10 a 12 anos**, que usa **jogos interativos** para ensinar sobre a incrível diversidade cultural brasileira 🇧🇷✨

[![Version](https://img.shields.io/badge/version-1.1.1-blue.svg)](./CHANGELOG.md)
![Node](https://img.shields.io/badge/Node-%3E%3D20-green)
![Yarn](https://img.shields.io/badge/Yarn-1.22.19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue)
![License](https://img.shields.io/badge/license-UNLICENSED-lightgray)

---

## 📖 Sobre o Projeto

O **Etnos** é um monorepo moderno, escalável e organizado com muito carinho 💙
Construído com **Turborepo + TypeScript + Next.js + NestJS**, ele reúne várias aplicações e pacotes compartilhados em um único repositório.

A missão? 🎯
Transformar aprendizado cultural em uma experiência divertida, gamificada e envolvente!

---

## 🧩 O que faz parte do Etnos?

### 🖥️ Aplicações

* 🌐 **Site Institucional (`web`)** — Apresentação pública da plataforma
* 🛠️ **Painel Administrativo (`admin`)** — Gerenciamento de usuários, jogos e conteúdos
* 🎒 **Portal do Estudante (`student`)** — Área onde as crianças jogam e aprendem
* 🔐 **API REST (`api`)** — Backend com NestJS + Firebase
* 🎮 **Biblioteca de Jogos (`games`)** — Jogos educacionais em React
* 📚 **Storybook (`docs`)** — Documentação interativa de componentes

---

## 🚀 Stack Tecnológica

### 🎨 Frontend

* Next.js 16
* React 19
* TypeScript 5.9.2
* Tailwind CSS
* Ant Design
* Firebase SDK
* React Query (@tanstack/react-query)
* Swiper

### ⚙️ Backend

* NestJS
* Express
* Passport.js (JWT Firebase)
* Firebase Admin SDK
* Firestore

### 🧠 Monorepo & Build

* Turborepo 2.7
* Yarn Workspaces
* TypeScript compartilhado

### 🧪 Testes

* Vitest
* Testing Library
* Playwright
* Jest (backend)
* jsdom

### 🔎 Qualidade & DevOps

* ESLint
* Prettier
* Husky
* CommitLint
* Docker
* Google Cloud Build
* Google Cloud Run
* Vercel
* SonarQube
* Semantic Release
* Chromatic

---

## 📦 Requisitos

Antes de começar, você vai precisar de:

* Node.js >= 18
* Yarn >= 1.22.19
* Git
* Docker (opcional)

---

## 🛠️ Primeiros Passos

### 1️⃣ Clonar o repositório

```bash
git clone https://github.com/joaojuniorbr/etnos.git
cd etnos
```

### 2️⃣ Instalar as dependências

```bash
yarn install
```

### 3️⃣ Configurar variáveis de ambiente

Crie os arquivos `.env.local` em cada app (`web`, `admin`, `student`) e `.env` na `api`.

Exemplo:

```env
NEXT_PUBLIC_API_URL=http://localhost:3333
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
```

Na API:

```env
NODE_ENV=development
PORT=3333
FIREBASE_PROJECT_ID=your_project
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_email
```

---

### 4️⃣ Rodar o projeto

```bash
yarn dev
```

Isso sobe tudo ao mesmo tempo 🚀

Acesse:

* 🌐 Web → [http://localhost:3000](http://localhost:3000)
* 🛠️ Admin → [http://localhost:3001](http://localhost:3001)
* 🎒 Student → [http://localhost:3002](http://localhost:3002)
* 🔐 API → [http://localhost:3333](http://localhost:3333)
* 📚 Storybook → [http://localhost:6006](http://localhost:6006)

---

## 🗂️ Estrutura do Projeto

```
etnos/
├── apps/
│   ├── web/
│   ├── admin/
│   ├── student/
│   ├── api/
│   ├── games/
│   └── docs/
│
├── packages/
│   ├── ui/
│   ├── tools/
│   ├── eslint-config/
│   ├── typescript-config/
│   └── tailwind-config/
│
├── docs-site/
├── turbo.json
├── package.json
└── README.md
```

Organização é tudo por aqui 😌✨

---

## 🎮 Desenvolvendo Jogos

Os jogos vivem em `apps/games` e são consumidos pelo `student`.

Exemplo básico:

```tsx
interface MyGameProps {
  characterId: string;
  onComplete?: (score: number) => void;
}

export const MyGame = ({ characterId, onComplete }: MyGameProps) => {
  return <div>Meu Jogo 🎉</div>;
};
```

### ➕ Para adicionar um novo jogo:

1. Criar a pasta em `apps/games/src/games`
2. Exportar no `index.ts`
3. Criar rota no `student`
4. Registrar no painel admin

Simples, direto e organizado ✅

---

## 🧪 Testes

Rodar todos:

```bash
yarn test
```

Modo watch:

```bash
yarn test -- --watch
```

Com cobertura:

```bash
yarn test -- --coverage
```

Meta recomendada: **+80% de cobertura** 📊✨

---

## 📚 Storybook

Rodar local:

```bash
yarn dev --filter=@etnos/docs
```

Acesse em:

```
http://localhost:6006
```

Publicação automática via Chromatic 🚀

---

## 🚀 Deploy

### 🌐 Apps Next.js

Deploy automático via **Vercel** ao fazer push na `main`.

### 🔐 API

Containerizada com Docker e publicada no **Google Cloud Run** via Cloud Build.

---

## 🔧 Problemas Comuns

### Porta já está em uso

```bash
lsof -i :3000
kill -9 <PID>
```

### Limpar cache do Turborepo

```bash
rm -rf .turbo
yarn build
```

### Reinstalar dependências

```bash
rm -rf node_modules
rm yarn.lock
yarn install
```

---

## 🧾 Convenções do Projeto

### 📝 Commits

Seguimos **Conventional Commits**:

```
feat: novo jogo
fix: corrigir autenticação
docs: atualizar README
refactor: melhorar estrutura
```

Use:

```bash
yarn commit
```

---

## 🔢 Versionamento

* Padrão: `MAJOR.MINOR.PATCH`
* Release automática com `semantic-release`
* Publicação ao fazer merge na `main`

---

## 🤝 Contribuindo

1. Crie uma branch
2. Faça seus commits (`yarn commit`)
3. Push para o repositório
4. Abra um Pull Request 🚀

---

## 📄 Licença

UNLICENSED
Todos os direitos reservados.

---

## ✨ Versão Atual
Veja todas as mudanças em:
📄 `CHANGELOG.md`
