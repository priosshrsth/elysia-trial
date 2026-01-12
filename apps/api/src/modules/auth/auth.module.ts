import Elysia from "elysia";
import { RegisterController } from "./http/register.controller";

export const AuthModule = new Elysia({
  detail: {
    tags: ["Auth"],
  },
}).use(RegisterController);
