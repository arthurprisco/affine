import type { RequestHandler } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../../auth.ts";
import { AppError } from "../errors/app-error.ts";

/** Exige sessão válida do Better Auth e expõe o usuário em `req.user`. */
export const requireAuth: RequestHandler = async (req, _res, next) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  if (!session) throw new AppError(401, "Sessão inválida ou expirada.", "UNAUTHORIZED");

  req.user = session.user;
  next();
};
