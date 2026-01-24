import Elysia from "elysia";
import { BetterAuthController } from "src/modules/auth/http/better-auth.controller";
import { auth } from "src/modules/auth/lib/auth";

export const AuthModule = new Elysia({
  detail: {
    tags: ["Auth"],
  },
})
  .mount("/api/v1", auth.handler)
  .use(BetterAuthController);
