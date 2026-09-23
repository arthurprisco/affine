import express, { type Express } from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../auth.ts";

const app: Express = express();

// cors antes do handler do Better Auth para que também valha em /api/auth
app.use(cors({ origin: "*" }));

// o handler do Better Auth precisa vir antes do express.json()
app.all("/api/auth/{*any}", toNodeHandler(auth));

app.use(express.json());

export default app;
