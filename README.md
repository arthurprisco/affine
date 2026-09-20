# Affine

Aplicativo mobile de gestão de produção e estoque de produtos artesanais (queijos, vinhos etc.). Permite acompanhar o progresso de maturação, etapas de produção e datas de vencimento de cada lote.

---

## Requisitos

- [Node.js](https://nodejs.org/) **22.18+** ou **24 LTS** — o backend executa arquivos `.ts` direto com `node --watch`, o que depende do type stripping nativo
- PostgreSQL rodando localmente (ou em nuvem)
- [Expo Go](https://expo.dev/go) instalado no celular (ou emulador Android/iOS)
- Celular e computador na **mesma rede Wi-Fi** (o app acessa o backend pelo IP local)

---

## Estrutura do projeto

```
affine/
├── backend/        # API (Express 5 + Better Auth + Drizzle ORM + PostgreSQL)
│   ├── auth.ts     # configuração do Better Auth
│   ├── drizzle/    # migrations geradas pelo drizzle-kit
│   └── src/
│       ├── app.ts      # instância do Express
│       ├── server.ts   # entrypoint (porta 3000)
│       └── db/         # conexão e schemas do Drizzle
└── (raiz)          # App mobile (React Native 0.86 + Expo 57 + NativeWind)
    ├── App.tsx
    └── src/
        ├── routes/     # navegação (stack de auth + drawer/tabs do app)
        ├── screens/    # telas (Login, Register, Home, AddBatch, ...)
        └── lib/        # authClient do Better Auth
```

O app mobile fica na **raiz** do repositório; não existe pasta `frontend/`.

---

## Backend

### 1. Instalar dependências

```bash
cd backend
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` dentro de `backend/`:

```env
PORT=3000
DATABASE_URL="postgresql://usuario:senha@localhost:5432/affine"
BETTER_AUTH_SECRET="uma_chave_aleatoria_longa"
BETTER_AUTH_URL="http://localhost:3000"
```

- `BETTER_AUTH_SECRET`: gere com `openssl rand -base64 32` (ou qualquer string aleatória longa).
- `BETTER_AUTH_URL`: URL base onde o backend responde.

### 3. Criar o banco e rodar as migrations

Com o PostgreSQL rodando, crie o banco (uma vez):

```bash
createdb affine
```

Em seguida, gere e aplique as migrations do Drizzle a partir dos schemas em `src/db/schema/`:

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

> `generate` só é necessário quando os schemas mudam. Em um clone novo, se a pasta `drizzle/` já tiver migrations versionadas, basta o `migrate`.

### 4. Iniciar o servidor

```bash
npm run dev
```

O servidor sobe em **http://localhost:3000** (ou na porta definida em `PORT`) e recarrega sozinho a cada alteração graças ao `--watch`.

### Rotas disponíveis

A autenticação é toda servida pelo Better Auth sob o prefixo `/api/auth`:

| Método | Rota                       | Descrição                                |
| ------ | -------------------------- | ---------------------------------------- |
| POST   | `/api/auth/sign-up/email`  | Cria um novo usuário (email + senha)     |
| POST   | `/api/auth/sign-in/email`  | Autentica e cria a sessão                |
| POST   | `/api/auth/sign-out`       | Encerra a sessão                         |
| GET    | `/api/auth/get-session`    | Retorna a sessão/usuário atual           |

No app essas rotas não são chamadas na mão: use o `authClient` (`src/lib/auth-client.ts`), que expõe `authClient.signUp.email()`, `authClient.signIn.email()` e `authClient.useSession()`.

---

## App mobile

### 1. Instalar dependências

Na **raiz** do projeto:

```bash
npm install
```

### 2. Configurar o IP do servidor

O Expo Go roda no celular, então `localhost` aponta para o próprio aparelho — é preciso usar o IP da sua máquina na rede local. Crie um `.env` na raiz:

```env
EXPO_PUBLIC_API_URL=http://192.168.x.x:3000
```

Para descobrir o IP:

- **Windows:** `ipconfig` → campo "Endereço IPv4"
- **macOS/Linux:** `ifconfig` ou `ip a`

> Variáveis do Expo só são lidas na inicialização: depois de alterar o `.env`, reinicie o servidor do Metro.

### 3. Iniciar o app

```bash
npm start
```

Escaneie o QR code com o Expo Go (Android) ou pela Câmera (iOS). Outros atalhos:

```bash
npm run android   # abre no emulador/dispositivo Android
npm run ios       # abre no simulador iOS (apenas macOS)
npm run web       # abre no navegador
```

---

## Rodando tudo de uma vez

São dois processos, em dois terminais:

```bash
# terminal 1
cd backend && npm run dev

# terminal 2 (na raiz)
npm start
```

---

## Problemas comuns

| Sintoma                                            | Causa provável / solução                                                                     |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| App trava na tela de carregamento ou erro de rede   | `EXPO_PUBLIC_API_URL` com IP errado, backend parado, ou celular em outra rede Wi-Fi           |
| Erro de conexão com o banco ao subir o backend      | PostgreSQL não está rodando ou `DATABASE_URL` incorreta                                       |
| `Unknown file extension ".ts"` ao rodar o backend   | Node antigo — atualize para 22.18+ ou 24 LTS                                                   |
| Login/cadastro falha com erro de origem             | Confira `BETTER_AUTH_URL` e os `trustedOrigins` em `backend/auth.ts`                           |
| Tabelas inexistentes nas chamadas de auth           | Rode `npx drizzle-kit migrate` dentro de `backend/`                                            |
| Mudanças no `.env` não surtem efeito                | Reinicie o processo (Metro e/ou backend)                                                       |

> O firewall do Windows pode bloquear conexões vindas do celular na porta 3000. Se o app não conectar mesmo com o IP certo, libere a porta ou permita o Node na rede privada.
