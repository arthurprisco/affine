# Visão geral

Affine é um app mobile de gestão de produção e estoque de produtos artesanais (queijos, vinhos etc.): acompanha maturação, etapas de produção e vencimento de lotes.

O repositório tem **dois projetos npm independentes** (não é monorepo, não há workspaces): a raiz é o app Expo e `backend/` é a API. Cada um tem seu próprio `package.json`, `package-lock.json`, `node_modules` e `.env`, e precisa de `npm install` separado.

## Comandos

```bash
# App mobile (raiz)
npm install
npm start            # Metro + QR code para Expo Go
npm run android      # emulador/dispositivo Android
npm run ios          # simulador iOS (só macOS)
npm run web

# Backend: ver backend/CLAUDE.md (dev, services, migrations)
```

Rodar o sistema completo = dois processos em dois terminais (`cd backend && npm run dev` + `npm start` na raiz).

**Não existe setup de testes nem de lint** neste repositório — não invente comandos de `test`/`lint`. A única ferramenta de formatação é o Prettier com `prettier-plugin-tailwindcss` (`.prettierrc`), que ordena as classes NativeWind.

## Variáveis de ambiente

- Raiz `.env`: `EXPO_PUBLIC_API_URL` — precisa ser o **IP da máquina na rede local** (ex.: `http://192.168.x.x:3000`), nunca `localhost`, porque o Expo Go roda no celular. Alterações só valem depois de reiniciar o Metro.

## Arquitetura

### Backend

Hoje é só autenticação (Better Auth + Drizzle + Postgres), sem rotas de domínio. Comandos, banco em Docker, migrations e detalhes de arquitetura estão em `backend/CLAUDE.md`.

### App mobile — navegação em três camadas

`App.tsx` → `src/routes/index.tsx` → `drawer.routes.tsx` ou `auth.routes.tsx`.

`Routes` é o **gate de sessão**: usa `authClient.useSession()`, mostra um spinner enquanto `isPending` e escolhe entre `DrawerRoutes` (logado) e `AuthRoutes` (deslogado). Login/logout não navegam manualmente — a troca de árvore de navegação acontece sozinha quando a sessão muda.

Dentro do app: Drawer (direita, `drawerContent` customizado) envolve uma única tela `Tabs`, que é o bottom-tabs com Home / AllBatches / AddBatch / Planner / Profile. `TabBar` e `NavBar` são componentes próprios passados via `tabBar` e `screenOptions.header`. Como o header pertence ao navegador de tabs, `NavBar` abre o drawer pelo pai: `navigation.getParent()?.openDrawer()`. Pelo mesmo motivo o `DrawerContent` precisa de `getActiveTabRoute()` para descobrir a aba ativa no estado aninhado, e navega com `navigate("Tabs", { screen: route })`.

Auth no cliente: `src/lib/auth-client.ts` cria o `authClient` com o plugin `expoClient` (scheme `affine`, sessão persistida em `expo-secure-store`). **Nunca chamar `/api/auth` na mão** — usar `authClient.signIn.email()`, `signUp.email()`, `signOut()`, `useSession()`. As ações devolvem `{ error }` no resultado em vez de lançar exceção; os hooks `useLogin`, `useRegister` e `useSignOut` já encapsulam esse padrão (estado de `loading`/`error` + mensagens em pt-BR).

### Convenções de UI

Antes de criar ou alterar qualquer componente visual, leia @docs/DESIGN.md

#### Regras inegociáveis

- Telas em `src/screens/`.
- Antes de criar um componente, procure em `src/components/`. Só crie um novo se nenhum servir.
- Usar somente NativeWind (`className`). Não usar `StyleSheet` nem criar `styles.ts`.
- Valores dinâmicos de runtime (ex.: `insets.top`) podem ir em `style` inline.
- Classes condicionais devem ser strings completas, não montadas por interpolação parcial.
- Nunca use cores hex, px de raio/borda ou font-family soltos no componente. Use SEMPRE os tokens do `tailwind.config`.
- Mobile-first: largura de referência 360px, padding lateral da tela 16px.
- Títulos de seção: fonte Purple Purse, CAIXA ALTA, com linhas horizontais dos dois lados (ver SectionTitle).
- Texto de interface: sempre a fonte sans (Poppins).
- Ação principal da tela = botão laranja (primary) de largura total. No máximo 1 por tela.
- Ao terminar um componente, confira contra o checklist no fim de docs/DESIGN.md.

### Estado atual do produto

As telas de domínio são em grande parte **maquetes com dados hardcoded**: `CardProduct` e `CircularProgress` têm arrays fixos dentro do próprio componente, `AddBatch` e `Planner` são stubs de uma linha, e `AllBatches`/`Home` repetem `<CardProduct />` estático. Não existe camada de dados (nem cliente HTTP, nem tabelas de lotes) além do auth. Qualquer feature de lotes precisa ser construída nas duas pontas.
