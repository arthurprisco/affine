import { testDatabaseUrl } from "./test-db.ts";

// dotenv não sobrescreve variáveis já definidas, então o app passa a usar o banco de teste
process.env.DATABASE_URL_DEV ??= process.env.DATABASE_URL;
process.env.DATABASE_URL = testDatabaseUrl();
