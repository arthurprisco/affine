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

# Migrations
npx drizzle-kit generate   # gera SQL a partir de src/db/schema/
npx drizzle-kit migrate    # aplica no banco de DATABASE_URL
```

`drizzle/` é **versionada** (já contém a migration inicial das tabelas do Better Auth). Num clone novo basta subir o banco e rodar `npx drizzle-kit migrate`; só use `generate` depois de alterar `src/db/schema/`.

Node **22.18+ ou 24 LTS** é requisito rígido: o backend executa `.ts` direto via type stripping nativo. Node antigo falha com `Unknown file extension ".ts"`.

## Banco de dados (Docker)

O Postgres de desenvolvimento roda em Docker (`infra/docker-compose.yaml`, imagem `postgres:17`, container `postgres-dev`, porta 5432, volume `pgdata`). O compose lê `.env` via `env_file` e tem healthcheck (`pg_isready`). `services:up` usa `up -d --wait`, então `npm run dev` só inicia o servidor depois que o banco aceita conexões.

## Variáveis de ambiente (`.env`)

`PORT`, `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, mais `POSTGRES_USER`/`POSTGRES_PASSWORD`/`POSTGRES_DB` (usadas pelo container do Postgres).

`DATABASE_URL` deve ser a URL **literal** (`postgres://user:senha@localhost:5432/db`): o `dotenv` não expande `$VAR`, e uma URL com `$POSTGRES_USER` etc. causa `ERR_INVALID_URL` no `drizzle-kit migrate` e no servidor (o docker compose expande, o que esconde o erro).

## Arquitetura — hoje é só autenticação

`src/server.ts` (dotenv + listen) → `src/app.ts` (Express 5) → `auth.ts` (Better Auth) → `src/db/` (Drizzle + Postgres).

Toda a superfície HTTP atual é o handler catch-all do Better Auth em `/api/auth/{*any}`: sign-up/sign-in por email+senha, sign-out e get-session. **Não há rotas de domínio** (lotes, produtos, etapas) — isso ainda não existe no backend.

Detalhes que não são óbvios:

- Em `app.ts` a ordem é `cors()` → handler do Better Auth → `express.json()`. O handler precisa vir **antes** de `express.json()` (exigência do Better Auth: o body parser consome o stream). Já o `cors()` precisa vir **antes do handler**, senão não se aplica às rotas de auth (o handler encerra a resposta sem chamar `next()`). `trustedOrigins` em `auth.ts` (`exp://`, `affine://`) é outra coisa: é a validação de origem/CSRF do Better Auth e não emite cabeçalhos CORS.
- O backend é ESM (`"type": "module"`) e roda sem build, então **imports relativos precisam da extensão `.ts` explícita** (`import { db } from "./src/db/index.ts"`). Seguir esse padrão em arquivos novos.
- `tsconfig.json` usa `erasableSyntaxOnly` e `verbatimModuleSyntax`: nada de `enum`, `namespace` ou parameter properties; tipos importados com `import type`.
- Schemas Drizzle ficam em `src/db/schema/` (só `auth-schema.ts` por enquanto, com as tabelas `user`/`session`/`account`/`verification` no formato do Better Auth). Tabelas usadas pelo auth também precisam ser passadas no `drizzleAdapter({ schema })` de `auth.ts`.
