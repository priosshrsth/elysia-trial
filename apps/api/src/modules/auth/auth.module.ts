import Elysia from "elysia";
import { BetterAuthController } from "src/modules/auth/http/better-auth.controller";

export const AuthModule = new Elysia({
  detail: {
    tags: ["Auth"],
  },
}).use(BetterAuthController);
