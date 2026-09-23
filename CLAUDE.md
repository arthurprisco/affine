# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Visão geral

Affine é um app mobile de gestão de produção e estoque de produtos artesanais (queijos, vinhos etc.): acompanha maturação, etapas de produção e vencimento de lotes. Código, comentários e strings de UI são em **pt-BR**.

O repositório tem **dois projetos npm independentes** (não é monorepo, não há workspaces): a raiz é o app Expo e `backend/` é a API. Cada um tem seu próprio `package.json`, `package-lock.json`, `node_modules` e `.env`, e precisa de `npm install` separado.

## Comandos

```bash
# App mobile (raiz)
npm install
npm start            # Metro + QR code para Expo Go
npm run android      # emulador/dispositivo Android
npm run ios          # simulador iOS (só macOS)
npm run web

# Backend (em backend/)
npm install
npm run dev          # node --watch src/server.ts → http://localhost:3000

# Migrations (em backend/)
npx drizzle-kit generate   # gera SQL a partir de src/db/schema/
npx drizzle-kit migrate    # aplica no banco de DATABASE_URL
```

Rodar o sistema completo = dois processos em dois terminais (`cd backend && npm run dev` + `npm start` na raiz).

**Não existe setup de testes nem de lint** neste repositório — não invente comandos de `test`/`lint`. A única ferramenta de formatação é o Prettier com `prettier-plugin-tailwindcss` (`.prettierrc`), que ordena as classes NativeWind.

`backend/drizzle/` está **vazio** (migrations não são versionadas), então num clone novo é obrigatório rodar `generate` antes de `migrate`.

Node **22.18+ ou 24 LTS** é requisito rígido: o backend executa `.ts` direto via type stripping nativo. Node antigo falha com `Unknown file extension ".ts"`.

## Variáveis de ambiente

- Raiz `.env`: `EXPO_PUBLIC_API_URL` — precisa ser o **IP da máquina na rede local** (ex.: `http://192.168.x.x:3000`), nunca `localhost`, porque o Expo Go roda no celular. Alterações só valem depois de reiniciar o Metro.
- `backend/.env`: `PORT`, `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`.

## Arquitetura

### Backend — hoje é só autenticação

`src/server.ts` (dotenv + listen) → `src/app.ts` (Express 5) → `auth.ts` (Better Auth) → `src/db/` (Drizzle + Postgres).

Toda a superfície HTTP atual é o handler catch-all do Better Auth em `/api/auth/{*any}`: sign-up/sign-in por email+senha, sign-out e get-session. **Não há rotas de domínio** (lotes, produtos, etapas) — isso ainda não existe no backend.

Detalhes que não são óbvios:

- Em `app.ts` a ordem é `cors()` → handler do Better Auth → `express.json()`. O handler precisa vir **antes** de `express.json()` (exigência do Better Auth: o body parser consome o stream). Já o `cors()` precisa vir **antes do handler**, senão não se aplica às rotas de auth (o handler encerra a resposta sem chamar `next()`). `trustedOrigins` em `auth.ts` (`exp://`, `affine://`) é outra coisa: é a validação de origem/CSRF do Better Auth e não emite cabeçalhos CORS.
- O backend é ESM (`"type": "module"`) e roda sem build, então **imports relativos precisam da extensão `.ts` explícita** (`import { db } from "./src/db/index.ts"`). Seguir esse padrão em arquivos novos.
- `backend/tsconfig.json` usa `erasableSyntaxOnly` e `verbatimModuleSyntax`: nada de `enum`, `namespace` ou parameter properties; tipos importados com `import type`.
- Schemas Drizzle ficam em `src/db/schema/` (só `auth-schema.ts` por enquanto, com as tabelas `user`/`session`/`account`/`verification` no formato do Better Auth). Tabelas usadas pelo auth também precisam ser passadas no `drizzleAdapter({ schema })` de `auth.ts`.

### App mobile — navegação em três camadas

`App.tsx` → `src/routes/index.tsx` → `drawer.routes.tsx` ou `auth.routes.tsx`.

`Routes` é o **gate de sessão**: usa `authClient.useSession()`, mostra um spinner enquanto `isPending` e escolhe entre `DrawerRoutes` (logado) e `AuthRoutes` (deslogado). Login/logout não navegam manualmente — a troca de árvore de navegação acontece sozinha quando a sessão muda.

Dentro do app: Drawer (direita, `drawerContent` customizado) envolve uma única tela `Tabs`, que é o bottom-tabs com Home / AllBatches / AddBatch / Planner / Profile. `TabBar` e `NavBar` são componentes próprios passados via `tabBar` e `screenOptions.header`. Como o header pertence ao navegador de tabs, `NavBar` abre o drawer pelo pai: `navigation.getParent()?.openDrawer()`. Pelo mesmo motivo o `DrawerContent` precisa de `getActiveTabRoute()` para descobrir a aba ativa no estado aninhado, e navega com `navigate("Tabs", { screen: route })`.

Auth no cliente: `src/lib/auth-client.ts` cria o `authClient` com o plugin `expoClient` (scheme `affine`, sessão persistida em `expo-secure-store`). **Nunca chamar `/api/auth` na mão** — usar `authClient.signIn.email()`, `signUp.email()`, `signOut()`, `useSession()`. As ações devolvem `{ error }` no resultado em vez de lançar exceção; os hooks `useLogin`, `useRegister` e `useSignOut` já encapsulam esse padrão (estado de `loading`/`error` + mensagens em pt-BR).

### Convenções de UI

Organização por pasta: `Componente/index.tsx` + `styles.ts` (+ hooks locais como `useLogin.ts`, `menuItems.ts`). Telas em `src/screens/{auth,app}/<Tela>/`.

Existem **dois sistemas de estilo convivendo** no código:

1. **NativeWind (`className`)** — padrão mais recente: `Button`, `DrawerContent`, telas de Login/Register. Cores vêm de `src/shared/colors.ts`, que o `tailwind.config.js` injeta no tema (`bg-primary`, `text-orange-text-link`, `border-on-primary-faint`…).
2. **`StyleSheet` em `styles.ts` + `src/global/themes.ts`** — telas de `app/` (Home, AllBatches…), `TabBar`, `NavBar`, `Input`.

As duas paletas são duplicadas com nomes diferentes (`themes.colors.secondary` = `colors["primary-orange"]`). Ao mexer em cor, verificar se o arquivo em questão usa NativeWind ou StyleSheet e, se a mudança for de paleta, atualizar os dois. Preferir NativeWind em código novo.

Componentes de terceiros só aceitam `className` depois de `cssInterop(...)` — ver `DrawerScrollView` em `src/components/DrawerContent/index.tsx`.

### Estado atual do produto

As telas de domínio são em grande parte **maquetes com dados hardcoded**: `CardProduct` e `CircularProgress` têm arrays fixos dentro do próprio componente, `AddBatch` e `Planner` são stubs de uma linha, e `AllBatches`/`Home` repetem `<CardProduct />` estático. Não existe camada de dados (nem cliente HTTP, nem tabelas de lotes) além do auth. Qualquer feature de lotes precisa ser construída nas duas pontas.

`docs/` está no `.gitignore` e hoje contém apenas um `RF01-recipes.md` vazio.
