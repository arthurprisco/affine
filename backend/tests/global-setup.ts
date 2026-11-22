import { execSync } from "node:child_process";
import pg from "pg";
import { testDatabaseUrl } from "./test-db.ts";

/** Recria o banco de teste do zero e aplica as migrations de `drizzle/`. */
export default async function globalSetup() {
  const testUrl = new URL(testDatabaseUrl());
  const dbName = testUrl.pathname.slice(1);

  // conecta no banco de dev só para (re)criar o de teste
  const admin = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await admin.connect();
  await admin.query(`DROP DATABASE IF EXISTS "${dbName}" WITH (FORCE)`);
  await admin.query(`CREATE DATABASE "${dbName}"`);
  await admin.end();

  execSync("npx drizzle-kit migrate", {
    env: { ...process.env, DATABASE_URL: testUrl.toString() },
    stdio: "ignore",
  });
}
