import type { auth } from "../../auth.ts";

declare global {
  namespace Express {
    interface Request {
      /** Preenchido pelo middleware `requireAuth`. */
      user?: typeof auth.$Infer.Session.user;
    }
  }
}

export {};
