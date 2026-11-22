// Apaga todo o banco de desenvolvimento (tabelas e histórico de migrations).
// Uso: npm run db:reset (que em seguida roda as migrations e o seed).
import "dotenv/config";
import pg from "pg";

const url = new URL(process.env.DATABASE_URL!);

if (
  process.env.NODE_ENV === "production" ||
  !["localhost", "127.0.0.1"].includes(url.hostname)
) {
  console.error(
    `db:reset recusado: só roda em banco local (host atual: ${url.hostname}).`,
  );
  process.exit(1);
}

const client = new pg.Client({ connectionString: url.toString() });
await client.connect();
await client.query(`
  DROP SCHEMA IF EXISTS drizzle CASCADE;
  DROP SCHEMA public CASCADE;
  CREATE SCHEMA public;
`);
await client.end();

console.log("Banco zerado.");
