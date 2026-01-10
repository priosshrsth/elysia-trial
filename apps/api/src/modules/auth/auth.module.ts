import Elysia from "elysia";
import { RegisterRoute } from "./http/register.controller";

export const AuthModule = new Elysia({
  detail: {
    tags: ["Auth"],
  },
}).use(RegisterRoute);
