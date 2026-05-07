# @etnos/docs (`apps/docs`)

Storybook oficial do monorepo ETNOS para documentação e validação visual da
biblioteca `@etnos/ui`.

## Stack

- Storybook `10.1.4` (`@storybook/react-vite`)
- Vitest + Playwright para testes de stories
- Chromatic para publicação/review visual
- Tailwind CSS 4

## Scripts

```bash
yarn dev
yarn build-storybook
```

Storybook local: `http://localhost:6006`.

## Estrutura

```text
apps/docs/
  .storybook/
    __mocks__/
    main.ts
    preview.tsx
    vitest.setup.ts
  stories/
```

## Componentes documentados (via `@etnos/ui`)

- Átomos: `Button`, `Card`, `CharacterCard`, `Title`
- Moléculas: `Footer`, `ImageUpload`, `ImageMultipleUpload`, `MobileMenu`,
  `NotFound`, `ResetPasswordForm`, `SignUpForm`
- Organismos: `Header`, `ImageLibrary`, `LoginForm`
- Templates: `MainLayout`
- Suporte: `AppProviders`, `AuthProtected`, `UserContext`

## Integração no monorepo

- carrega stories do próprio app e de `packages/ui/src/**/*.stories.*`;
- serve como referência visual para `apps/web`, `apps/admin` e `apps/student`.
