# Pacotes compartilhados

## Visão geral

Os pacotes em `packages/` concentram código reutilizável entre apps. Apps não
devem duplicar lógica de HTTP, tipos ou componentes que já existem aqui.

![Mapa de alto nível](./files/packages.png)

## Pacotes de produto

### `@etnos/ui`

Design system web: componentes Atomic Design, `AppProviders`, `MainLayout`,
`AuthProtected`, formulários compartilhados.

- integra `MixpanelProvider` para apps Next;
- usa Ant Design + Tailwind conforme o app.

### `@etnos/tools`

Hooks e serviços para apps web:

| Área        | Exemplos                                           |
| ----------- | -------------------------------------------------- |
| Auth        | `useAuth`, `authSession`                           |
| Personagens | `useCharacter`                                     |
| Jogos       | `useGames`, `useGameScore`, `useMemoryGameContent` |
| Escolas     | serviços de escola e onboarding                    |

É a camada preferida para novas integrações HTTP no frontend web.

### `@etnos/core`

Cliente HTTP, storage de sessão e serviços usados pelo **mobile**. Espelha parte
do que `tools` faz na web, adaptado ao React Native.

### `@etnos/types`

Contratos TypeScript compartilhados: usuário, escola, personagem, jogos, mídia.
Fonte única para alinhar API e frontends.

### `@etnos/analytics`

SDK Mixpanel unificado (web e native). Ver [Analytics](analytics-architecture.md).

### `@etnos/games`

Biblioteca React de jogos (`GuessGame`, `MemoryGame`, modais de NPS e placar).
Consumida por `student`; lógica de rede fica em `tools` ou no host.

## Pacotes de infraestrutura

| Pacote                     | Uso                            |
| -------------------------- | ------------------------------ |
| `@etnos/typescript-config` | Presets `tsconfig` do monorepo |
| `@etnos/eslint-config`     | Regras de lint compartilhadas  |
| `@etnos/tailwind-config`   | Tokens e preset Tailwind       |

## `@etnos/performance`

Testes de carga com **k6** (não é dependência de runtime dos apps). Ver
[Testes de performance](performance-tests.md).

## Convenções

- importar pacotes pelo nome `@etnos/<pacote>`;
- tipos de domínio novos entram primeiro em `@etnos/types`;
- eventos de analytics passam por `@etnos/analytics`, nunca pelo SDK direto;
- apps Next que usam pacotes com `NEXT_PUBLIC_*` precisam de
  `transpilePackages` no `next.config.ts`.
