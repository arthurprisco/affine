import { config } from "dotenv";

config({ quiet: true });

/** DATABASE_URL do .env, com o nome do banco trocado por `<nome>_test`. */
export function testDatabaseUrl(): string {
  const url = new URL(process.env.DATABASE_URL_DEV ?? process.env.DATABASE_URL!);
  url.pathname = `${url.pathname}_test`;
  return url.toString();
}
