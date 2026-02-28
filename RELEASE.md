# Processo de Release com Semantic Release

Este projeto usa `semantic-release` para versionar automaticamente, gerar `CHANGELOG.md`, criar tag e publicar release no GitHub.

## Como funciona

1. Desenvolver em branch de feature/fix.
2. Abrir Pull Request para `main`.
3. Fazer merge com `Rebase and merge` (ou `Merge commit` sem squash).
4. Após o `push` na `main`, o workflow `Release` executa.
5. O `semantic-release` analisa os commits desde a última tag:
   - calcula próxima versão
   - atualiza `CHANGELOG.md`
   - atualiza versões em `package.json`
   - cria commit `chore(release): x.y.z [skip ci]`
   - cria tag e release no GitHub

## Regra importante com Rebase/Merge

Com `rebase and merge` ou `merge commit`, os commits individuais da branch vão para a `main`.
Por isso, quem define a versão/changelog são as mensagens dos commits (e nao o título da PR).

Exemplos válidos de commit:

- `feat(api): adicionar endpoint de autenticação`
- `fix(web): corrigir erro de paginação`
- `docs(readme): atualizar instruções de setup`
- `refactor(ui): simplificar provider de tema`

Se os commits nao forem semânticos, o release pode nao ser gerado como esperado.

## Tipos que geram release

- `feat` -> `minor`
- `fix` -> `patch`
- `perf` -> `patch`
- `refactor` -> `patch`
- `docs` -> `patch`
- `style` -> `patch`
- `BREAKING CHANGE` ou `!` -> `major`

## Arquivos de configuração

- `.releaserc.json`
- `.github/workflows/release.yml`
- `.github/workflows/pr-title.yml`

## Teste local antes da pipeline

Para validar sem publicar release:

```bash
GITHUB_TOKEN=seu_token_aqui yarn release --dry-run --no-ci
```

O comando mostra:

- qual versão seria gerada
- notas/changelog que seriam montadas
- quais plugins seriam executados

## Padrao de commit no projeto

Este repositório usa:

- `commitizen` com `cz-conventional-changelog`
- `commitlint` com `@commitlint/config-conventional`
- hook `husky` em `commit-msg`

Para criar commit no formato correto:

```bash
yarn commit
```

Formato esperado:

```text
type(scope): assunto
```

Exemplo:

```text
feat(home): adiciona area "Como funciona o Etnos"
```

## Pré-requisitos no GitHub

- Workflow permissions com `contents: write` (já definido no workflow).
- Branch protection da `main` deve permitir push do `GITHUB_TOKEN` do GitHub Actions para o commit automático de release.
