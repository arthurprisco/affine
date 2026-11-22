/** @type {import('jest').Config} */
export default {
  testEnvironment: "node",
  // o backend é ESM; Better Auth só publica ESM
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.ts$": [
      "@swc/jest",
      {
        jsc: { parser: { syntax: "typescript" }, target: "es2022" },
        module: { type: "es6" },
      },
    ],
  },
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  // cria/zera o banco de teste e aplica as migrations antes da suíte
  globalSetup: "<rootDir>/tests/global-setup.ts",
  // aponta DATABASE_URL para o banco de teste antes de qualquer import do app
  setupFiles: ["<rootDir>/tests/setup-env.ts"],
  // os testes compartilham um banco; rodar em série evita interferência
  maxWorkers: 1,
};
