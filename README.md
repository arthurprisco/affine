# Affine

Aplicativo mobile de gestão de produção e estoque de produtos artesanais (queijos, vinhos etc.). Permite acompanhar o progresso de maturação, etapas de produção e datas de vencimento de cada lote.

---

## Requisitos

- [Node.js](https://nodejs.org/) 18+
- [Expo Go](https://expo.dev/go) instalado no celular (ou emulador Android/iOS)
- PostgreSQL rodando localmente (ou em nuvem)

---

## Estrutura do projeto

```
affine/
├── backend/   # API REST (Node.js + Express + Prisma)
└── frontend/  # App mobile (React Native + Expo)
```

---

## Backend

### 1. Instalar dependências

```bash
cd backend
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` na pasta `backend/`:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/affine"
JWT_SECRET="sua_chave_secreta_aqui"
```

### 3. Rodar as migrations

```bash
npx prisma migrate dev
npx prisma generate
```

### 4. Iniciar o servidor

```bash
npm run dev
```

O servidor sobe na porta **3000**.

### Rotas disponíveis

| Método | Rota        | Autenticação | Descrição                       |
| ------ | ----------- | ------------ | ------------------------------- |
| POST   | `/register` | Pública      | Cria um novo usuário            |
| POST   | `/login`    | Pública      | Autentica e retorna JWT         |
| GET    | `/me`       | Bearer token | Retorna dados do usuário logado |

---

## Frontend

### 1. Instalar dependências

```bash
cd frontend
npm install
```

### 2. Configurar o IP do servidor

O app precisa apontar para o IP local da sua máquina (onde o backend está rodando). Crie um arquivo `.env` na pasta `frontend/`:

```env
EXPO_PUBLIC_API_URL=http://192.168.x.x:3000
```

Substitua `192.168.x.x` pelo IP da sua máquina na rede local. Para descobrir o IP:

- **Windows:** `ipconfig` no terminal
- **macOS/Linux:** `ifconfig` ou `ip a`

### 3. Iniciar o app

```bash
npm start
```

Escaneie o QR code com o Expo Go no celular.

---
