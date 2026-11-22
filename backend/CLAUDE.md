# CLAUDE.md (backend)

Instruções específicas da API em `backend/`. Visão geral do produto, convenções gerais e o app mobile estão no `CLAUDE.md` da raiz. Este projeto npm é independente do app: tem seu próprio `package.json`, `node_modules` e `.env`.

## Comandos

Todos executados dentro de `backend/`:

```bash
npm install
npm run dev            # sobe o Postgres (services:up) + node --watch src/server.ts → http://localhost:3000
npm run services:up    # docker compose -f infra/docker-compose.yaml up -d --wait
npm run services:stop  # para o container (dados mantidos no volume pgdata)
npm run services:down  # remove o container
npm test               # services:up + Jest (testes de integração HTTP em tests/)

# Banco
npm run db:generate -- --name <nome>  # gera SQL a partir de src/db/schema/
npm run db:migrate                    # aplica as migrations no banco de DATABASE_URL
npm run db:seed                       # povoa um banco recém-migrado (src/db/seed.ts)
npm run db:reset                      # services:up → apaga tudo (src/db/reset.ts) → migrate → seed
```

`drizzle/` é **versionada** (tabelas do Better Auth + tabelas de produção). Num clone novo basta `npm run db:reset`. Depois de alterar `src/db/schema/`, rode `db:generate` e em seguida `db:reset`.

Não há dados reais (projeto acadêmico): o banco é descartável e `db:reset` é o fluxo normal. O `reset.ts` recusa rodar se `NODE_ENV=production` ou se o host de `DATABASE_URL` não for local. O seed cria `demo@affine.dev` e `outro@affine.dev` (senha `affine123`) via `auth.api.signUpEmail` — usuários nunca devem ser inseridos direto nas tabelas, porque a senha fica com hash em `account`. As datas do seed são relativas a hoje, então sempre existem lotes planejados, em maturação, prontos, perto de vencer, vencidos e atrasados.

## Testes (Jest)

`npm test` roda os testes de integração em `tests/*.test.ts`: requisições HTTP reais contra o `app` (via `supertest`) e um Postgres real. Hoje cobrem os endpoints do Better Auth que o app usa (sign-up, sign-in, get-session, sign-out, update-user, change-email, change-password) e o CORS.

- **Banco isolado**: `tests/global-setup.ts` apaga e recria `<POSTGRES_DB>_test` no mesmo container e aplica as migrations; `tests/setup-env.ts` troca `DATABASE_URL` antes de qualquer import do app. O banco de dev (seed) nunca é tocado. Testes novos que importem `src/db` funcionam sem configuração extra.
- **ESM**: o Jest roda com `--experimental-vm-modules` (Better Auth só publica ESM) e transpila TS com `@swc/jest` — `ts-jest` não serve porque não suporta TypeScript 7. Consequência: `jest`, `describe`, `expect` etc. **não são globais**; importe de `@jest/globals` (não há `@types/jest`).
- Cada teste cria seus próprios usuários com email único, então os casos não dependem de ordem; `maxWorkers: 1` porque todos dividem o mesmo banco.
- Feche o pool no fim do arquivo (`afterAll(() => db.$client.end())`), senão o Jest não encerra.

Node **22.18+ ou 24 LTS** é requisito rígido: o backend executa `.ts` direto via type stripping nativo. Node antigo falha com `Unknown file extension ".ts"`.

## Banco de dados (Docker)

O Postgres de desenvolvimento roda em Docker (`infra/docker-compose.yaml`, imagem `postgres:17`, container `postgres-dev`, porta 5432, volume `pgdata`). O compose lê `.env` via `env_file` e tem healthcheck (`pg_isready`). `services:up` usa `up -d --wait`, então `npm run dev` só inicia o servidor depois que o banco aceita conexões.

## Variáveis de ambiente (`.env`)

`PORT`, `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, mais `POSTGRES_USER`/`POSTGRES_PASSWORD`/`POSTGRES_DB` (usadas pelo container do Postgres).

`DATABASE_URL` deve ser a URL **literal** (`postgres://user:senha@localhost:5432/db`): o `dotenv` não expande `$VAR`, e uma URL com `$POSTGRES_USER` etc. causa `ERR_INVALID_URL` no `drizzle-kit migrate` e no servidor (o docker compose expande, o que esconde o erro).

## Arquitetura

`src/server.ts` (dotenv + listen) → `src/app.ts` (Express 5) → `auth.ts` (Better Auth) → `src/db/` (Drizzle + Postgres).

Toda a superfície HTTP atual é o handler catch-all do Better Auth em `/api/auth/{*any}`: sign-up/sign-in por email+senha, sign-out e get-session. As tabelas de domínio já existem (ver "Modelo de dados"), mas **ainda não há rotas de domínio** nem middleware de sessão.

Detalhes que não são óbvios:

- Em `app.ts` a ordem é `cors()` → handler do Better Auth → `express.json()`. O handler precisa vir **antes** de `express.json()` (exigência do Better Auth: o body parser consome o stream). Já o `cors()` precisa vir **antes do handler**, senão não se aplica às rotas de auth (o handler encerra a resposta sem chamar `next()`). `trustedOrigins` em `auth.ts` (`exp://`, `affine://`) é outra coisa: é a validação de origem/CSRF do Better Auth e não emite cabeçalhos CORS.
- O backend é ESM (`"type": "module"`) e roda sem build, então **imports relativos precisam da extensão `.ts` explícita** (`import { db } from "./src/db/index.ts"`). Seguir esse padrão em arquivos novos.
- `tsconfig.json` usa `erasableSyntaxOnly` e `verbatimModuleSyntax`: nada de `enum`, `namespace` ou parameter properties; tipos importados com `import type`.
- Schemas Drizzle ficam em `src/db/schema/`: `auth-schema.ts` (tabelas `user`/`session`/`account`/`verification` no formato do Better Auth, que também precisam ser passadas no `drizzleAdapter({ schema })` de `auth.ts`) e `production-schema.ts` (domínio). As relations (API `defineRelations` do Drizzle v1) ficam todas em `src/db/relations.ts` e são passadas ao `drizzle()` em `src/db/index.ts`, o que habilita `db.query.<tabela>.findMany({ with })`. Tabela nova precisa entrar lá também.

## Modelo de dados (domínio)

`user` 1─N `recipe` 1─N `step`; `user` 1─N `batch` N─1 `recipe`; `batch` 1─N `batch_step` N─0..1 `step`.

- **recipe**: receita de produto; `maturation_days` (soma das etapas) e `shelf_life_days` (validade depois de pronto). Com lotes ela não pode ser apagada (`batch.recipe_id` é `ON DELETE RESTRICT`): use `archived_at`.
- **step**: etapa-modelo da receita, ordenada por `position` (único por receita).
- **batch**: lote; `code` único por usuário, `quantity` numeric + `unit`, `start_date`, `expiration_date`. Tem `user_id` próprio (para filtrar por sessão sem join), então ao criar um lote é preciso **validar que a receita pertence ao mesmo usuário** — o banco não garante isso.
- **batch_step**: etapa executada do lote. Ao criar o lote, **copie** `position`/`name`/`duration_days` da etapa-modelo (em vez de só referenciar `step_id`, que vira `null` se a etapa for apagada); assim editar a receita não altera o histórico. `planned_date` = fim acumulado das durações a partir de `start_date`; `completed_at` nulo = pendente.
- **Não existe coluna de status**: planejado/em produção/maturando/pronto/vencido/atrasado são derivados de `batch_step` + `expiration_date` + data atual.
- Datas de calendário usam `date` com `mode: "string"` (`YYYY-MM-DD`); ids são `text` com `crypto.randomUUID()`.
