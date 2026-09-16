import express, { type Express } from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../auth.ts";

const app: Express = express();

app.all("/api/auth/{*any}", toNodeHandler(auth));

app.use(express.json());

app.use(cors({ origin: "*" }));

export default app;
