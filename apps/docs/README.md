# 📚 ETNOS - Storybook Documentation

Documentação interativa dos componentes do sistema ETNOS utilizando Storybook.

## 🎯 Sobre

Este projeto contém a documentação visual e interativa de todos os componentes
da biblioteca de UI do ETNOS. Utilizamos o Storybook para desenvolver, testar e
documentar componentes de forma isolada, seguindo a metodologia Atomic Design.

## 🚀 Como Executar

### Desenvolvimento

Para iniciar o Storybook em modo de desenvolvimento:

```bash
npm run dev
```

O Storybook estará disponível em `http://localhost:6006`

### Build

Para gerar a versão estática do Storybook:

```bash
npm run build-storybook
```

Os arquivos serão gerados no diretório `storybook-static/`

## 📦 Componentes Documentados

### ⚛️ Átomos

Componentes básicos e indivisíveis do sistema:

- **Button** - Botão com variações de estilo e estados
- **CharacterCard** - Card para exibição de personagens

### 🧩 Moléculas

Componentes compostos por átomos:

- **Footer** - Rodapé da aplicação
- **ImageMultipleUpload** - Upload de múltiplas imagens
- **ImageUpload** - Upload de imagem única
- **MobileMenu** - Menu mobile responsivo

### 🏗️ Organismos

Componentes complexos compostos por moléculas e átomos:

- **Header** - Cabeçalho da aplicação
- **ImageLibrary** - Biblioteca de gerenciamento de imagens

### 📄 Templates

Estruturas de página completas:

- **MainLayout** - Layout principal da aplicação

## 🛠️ Tecnologias

- **Storybook 10.1.4** - Ferramenta principal de documentação
- **React** - Framework de componentes
- **Vite** - Build tool
- **TailwindCSS 4.1.17** - Framework CSS
- **TypeScript** - Tipagem estática

## 🔌 Addons Instalados

- **@chromatic-com/storybook** - Integração com Chromatic para testes visuais
- **@storybook/addon-docs** - Documentação automática
- **@storybook/addon-a11y** - Testes de acessibilidade
- **@storybook/addon-vitest** - Integração com Vitest para testes

## 🎨 Estrutura do Projeto

```
apps/docs/
├── .storybook/          # Configurações do Storybook
│   ├── __mocks__/       # Mocks para Firebase e Next.js
│   ├── main.ts          # Configuração principal
│   ├── preview.tsx      # Configuração de preview
│   └── vitest.setup.ts  # Setup de testes
├── stories/             # Stories customizadas
│   ├── assets/          # Assets para documentação
│   └── Configure.mdx    # Página de configuração
└── package.json         # Dependências e scripts
```

## 🔧 Configuração

### Variáveis de Ambiente

O projeto utiliza Firebase. Configure as seguintes variáveis no arquivo `.env`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

### Integração com Monorepo

Este projeto faz parte de um monorepo e consome componentes do pacote
`@etnos/ui`. As stories são automaticamente carregadas de:

- `../stories/**/*.mdx`
- `../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)`
- `../../../packages/ui/src/**/*.stories.@(js|jsx|mjs|ts|tsx)`

## 📖 Como Adicionar Novos Componentes

1. Crie seu componente em `packages/ui/src/@[categoria]/[NomeComponente]/`
2. Crie o arquivo de story: `[NomeComponente].stories.tsx`
3. Defina as variações do componente usando CSF (Component Story Format)
4. Execute o Storybook para visualizar

Exemplo de story básica:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MeuComponente } from './MeuComponente';

const meta: Meta<typeof MeuComponente> = {
	title: 'Atoms/MeuComponente',
	component: MeuComponente,
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MeuComponente>;

export const Default: Story = {
	args: {
		// props do componente
	},
};
```

## 🌐 Deploy

O projeto está configurado para deploy no Chromatic. Para publicar:

```bash
npx chromatic --project-token=<seu-token>
```

## 📝 Metodologia Atomic Design

Seguimos a metodologia Atomic Design para organização dos componentes:

1. **Átomos** - Componentes básicos (botões, inputs, labels)
2. **Moléculas** - Combinações simples de átomos
3. **Organismos** - Componentes complexos e funcionais
4. **Templates** - Estruturas de página
5. **Pages** - Instâncias específicas de templates

## 🤝 Contribuindo

1. Crie uma branch para sua feature
2. Desenvolva o componente com sua story
3. Garanta que os testes de acessibilidade passem
4. Submeta um Pull Request

## 📄 Licença

MIT
