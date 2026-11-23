import express, { type Express } from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../auth.ts";
import { errorHandler } from "./middlewares/error-handler.ts";
import recipeRoutes from "./modules/recipes/recipe.routes.ts";

const app: Express = express();

// cors antes do handler do Better Auth para que também valha em /api/auth
app.use(cors({ origin: "*" }));

// o handler do Better Auth precisa vir antes do express.json()
app.all("/api/auth/{*any}", toNodeHandler(auth));

app.use(express.json());

app.use("/api/recipes", recipeRoutes);

// sempre o último: converte erros das rotas em respostas JSON
app.use(errorHandler);

export default app;
