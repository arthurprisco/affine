import { betterAuth } from "better-auth";
import { expo } from "@better-auth/expo";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./src/db/index.ts";
import {
  user,
  account,
  session,
  verification,
} from "./src/db/schema/auth-schema.ts";

export const auth = betterAuth({
  plugins: [expo()],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, account, session, verification },
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: ["exp://", "affine://"],
});
