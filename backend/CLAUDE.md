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

Não há dados reais (projeto acadêmico): o banco é descartável e `db:reset` é o fluxo normal. O `reset.ts` recusa rodar se `NODE_ENV=production` ou se o host de `DATABASE_URL` não for local. O seed cria `demo@affine.dev` e `outro@affine.dev` (senha `affine123`) via `auth.api.signUpEmail` — usuários nunca devem ser inseridos direto nas tabelas, porque a senha fica com hash em `account`. As datas do seed são relativas a hoje, então sempre existem lotes planejados, em maturação, prontos e atrasados.

## Testes (Jest)

`npm test` roda os testes de integração em `tests/*.test.ts`: requisições HTTP reais contra o `app` (via `supertest`) e um Postgres real. Cobrem os endpoints do Better Auth que o app usa (`auth.test.ts`) e os CRUDs de receitas e lotes, incluindo validação, 409 e isolamento entre usuários (`recipes.test.ts`, `batches.test.ts`). `tests/helpers.ts` tem `signedUpAgent()` (cria um usuário e devolve um agent autenticado e o `userId`) e `uniqueEmail()`: use-os nos testes novos.

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

Toda a superfície HTTP atual é o handler catch-all do Better Auth em `/api/auth/{*any}`: sign-up/sign-in por email+senha, sign-out e get-session. Além dele, as rotas de domínio ficam em `src/modules/` (`/api/recipes` e `/api/batches`) e são montadas em `app.ts` **depois** de `express.json()`, seguidas pelo `errorHandler`, que é sempre o último middleware.

### Camadas por módulo

Cada recurso tem uma pasta em `src/modules/<recurso>/` com os arquivos abaixo. Siga o mesmo formato para lotes e os próximos recursos (`src/modules/recipes/` é a referência):

- `*.schemas.ts`: schemas zod do corpo, dos params e da query, mais os tipos inferidos (`z.infer`).
- `*.model.ts`: **só acesso a dados** (Drizzle). Toda consulta filtra por `userId`, e escritas de várias tabelas usam `db.transaction`. Sem regra de negócio e sem `AppError`.
- `*.service.ts`: regras de negócio. Não importa nada do Express, recebe dados já validados e lança `AppError`.
- `*.controller.ts`: faz `schema.parse(req.body/params/query)`, chama o service com `req.user!.id` e devolve o status (200/201/204). Não usa try/catch: o Express 5 repassa rejeições async ao `errorHandler`.
- `*.routes.ts`: `Router` com `router.use(requireAuth)` e as rotas.

Peças compartilhadas:

- `src/middlewares/require-auth.ts`: valida a sessão com `auth.api.getSession({ headers: fromNodeHeaders(req.headers) })` e preenche `req.user` (tipado em `src/types/express.d.ts`). Sem sessão, responde 401.
- `src/errors/app-error.ts`: `AppError(status, message, code)` e o atalho `notFound()`.
- `src/middlewares/error-handler.ts`: converte os erros em `{ error, code, issues? }`. `AppError` vira o status dele, `ZodError` vira 400 `VALIDATION_ERROR` (com `issues`), JSON malformado vira 400 `INVALID_JSON` e o resto vira 500 (com log).
- **Recurso de outro usuário responde 404, nunca 403**, para não revelar que ele existe. O model filtra por `userId` e o service transforma "não achou" em `notFound()`.

### Endpoints de receitas (`/api/recipes`, todos exigem sessão)

| Método | Rota | Observações |
|---|---|---|
| GET | `/` | só as ativas; `?archived=true` lista só as arquivadas. Ordem alfabética, com `steps` |
| GET | `/:id` | receita com `steps` ordenadas por `position` |
| POST | `/` | `{ name, category, description?, steps: [{ name, duration, durationUnit, description?, autoAdvance? }] }` → 201 |
| PUT | `/:id` | mesmo corpo do POST; **substitui** a receita e todas as etapas |
| PATCH | `/:id/archive`, `/:id/unarchive` | preenche ou limpa `archivedAt` |
| DELETE | `/:id` | 204; **409 `RECIPE_HAS_BATCHES`** se houver lotes (o cliente deve arquivar) |

`maturationDays` é sempre calculado no service: a soma das etapas convertida em dias e **arredondada para cima** (`totalDays()` de `src/shared/duration.ts`; se o cliente enviar o campo, ele é ignorado). `position` segue a ordem do array `steps`.

Detalhes que não são óbvios:

- Em `app.ts` a ordem é `cors()` → handler do Better Auth → `express.json()`. O handler precisa vir **antes** de `express.json()` (exigência do Better Auth: o body parser consome o stream). Já o `cors()` precisa vir **antes do handler**, senão não se aplica às rotas de auth (o handler encerra a resposta sem chamar `next()`). `trustedOrigins` em `auth.ts` (`exp://`, `affine://`) é outra coisa: é a validação de origem/CSRF do Better Auth e não emite cabeçalhos CORS.
- O backend é ESM (`"type": "module"`) e roda sem build, então **imports relativos precisam da extensão `.ts` explícita** (`import { db } from "./src/db/index.ts"`). Seguir esse padrão em arquivos novos.
- `tsconfig.json` usa `erasableSyntaxOnly` e `verbatimModuleSyntax`: nada de `enum`, `namespace` ou parameter properties; tipos importados com `import type`.
- Schemas Drizzle ficam em `src/db/schema/`: `auth-schema.ts` (tabelas `user`/`session`/`account`/`verification` no formato do Better Auth, que também precisam ser passadas no `drizzleAdapter({ schema })` de `auth.ts`) e `production-schema.ts` (domínio). As relations (API `defineRelations` do Drizzle v1) ficam todas em `src/db/relations.ts` e são passadas ao `drizzle()` em `src/db/index.ts`, o que habilita `db.query.<tabela>.findMany({ with })`. Tabela nova precisa entrar lá também.

## Modelo de dados (domínio)

`user` 1─N `recipe` 1─N `step`; `user` 1─N `batch` N─1 `recipe`; `batch` 1─N `batch_step` N─0..1 `step`.

- **recipe**: receita de produto, com `maturation_days` (soma das etapas em dias, arredondada para cima). **Não existe validade/vencimento** em lugar nenhum: os produtos são maturados (quanto mais envelhecidos, melhor). Com lotes ela não pode ser apagada (`batch.recipe_id` é `ON DELETE RESTRICT`): use `archived_at`.
- **step**: etapa-modelo da receita, ordenada por `position` (único por receita). A duração é `duration` (inteiro ≥ 1) + `duration_unit` (enum pg `duration_unit`: minutos, horas, dias, semanas, meses, anos). As unidades e os fatores de conversão (mês = 30 dias, ano = 365) ficam em `src/shared/duration.ts` e **precisam ficar iguais aos de `src/shared/duration.ts` do app**. `auto_advance` (padrão `false`) marca etapa de espera (maturar, envelhecer), que avança sozinha.
- **batch**: lote; `code` único por usuário, `quantity` numeric + `unit`, `start_date`. Tem `user_id` próprio (para filtrar por sessão sem join), então ao criar um lote é preciso **validar que a receita pertence ao mesmo usuário** — o banco não garante isso.
- **batch_step**: etapa executada do lote. Ao criar o lote, **copie** `position`/`name`/`duration`/`duration_unit`/`auto_advance` da etapa-modelo (em vez de só referenciar `step_id`, que vira `null` se a etapa for apagada); assim editar a receita não altera o histórico. `planned_date` = dia em que a etapa termina, pelo tempo acumulado desde `start_date` (`totalDays` das etapas até ela; etapas de minutos/horas terminam no mesmo dia ou no seguinte); `completed_at` nulo = pendente; `notes` = observação registrada na conclusão.
- **Não existe coluna de status**: planejado/em maturação/atrasado/pronto são derivados de `batch_step` + `start_date` + data atual.
- Datas de calendário usam `date` com `mode: "string"` (`YYYY-MM-DD`); ids são `text` com `crypto.randomUUID()`.

### Endpoints de lotes (`/api/batches`, todos exigem sessão)

Todo lote volta com `steps` (ordenadas por `position`) e `recipe: { id, name, category }`.

| Método | Rota | Observações |
|---|---|---|
| GET | `/` | lotes do usuário, `startDate` mais recente primeiro |
| GET | `/:id` | um lote |
| POST | `/` | `{ recipeId, code, quantity, unit, startDate, notes? }` (data AAAA-MM-DD) → 201. Copia as etapas da receita para `batch_step` com `plannedDate` = dia em que a etapa termina (`planBatchSteps` em `src/shared/schedule.ts`, o mesmo usado pelo seed). 409 `BATCH_CODE_TAKEN` (código repetido do usuário) e 409 `RECIPE_ARCHIVED` |
| PATCH | `/:id/steps/:stepId` | `{ completed: boolean, notes? }`: conclui com a data de hoje ou desfaz. Regras abaixo. 409 `BATCH_NOT_STARTED`, `STEP_OUT_OF_ORDER`, `STEP_ALREADY_COMPLETED`, `STEP_NOT_COMPLETED` |
| DELETE | `/:id` | → 204; as etapas vão em cascata |

### Avanço das etapas (`batch.service.ts` + `src/shared/schedule.ts`)

- **Sequencial**: só a etapa atual (primeira pendente) pode ser concluída e só a última concluída pode ser desfeita. Lote com `startDate` futuro não avança.
- **Manual**: conclusão sempre com a data de hoje, com `notes` opcional. Desfazer mantém `notes`.
- **Recálculo**: depois de concluir ou desfazer, as pendentes são reprevistas a partir do `completedAt` da última concluída (ou do `startDate`), com `replanPending` → `planBatchSteps`. As concluídas não mudam.
- **Automático** (`auto_advance`): etapa automática que é a atual e tem `planned_date <= hoje` é concluída com `completed_at = planned_date`, em cadeia, até a primeira etapa manual ou futura (`dueAutoSteps`). Não há agendador: `list` e `getById` aplicam isso **na leitura** (`advanceDueSteps`) e gravam numa transação. Desfazer uma etapa automática grava `auto_advance = false` naquele lote, senão a próxima leitura a concluiria de novo.
