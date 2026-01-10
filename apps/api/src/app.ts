import { Elysia } from "elysia";
import { appConfig } from "./config/app.config";
import { authApp } from "./lib/auth/auth.macro";
import { openApiPlugin } from "./lib/openapi/openapi.plugin";

export const app = new Elysia()
  .use(authApp)
  .use(openApiPlugin)
  .get("/favicon.ico", () => Bun.file("@api/../public/favicon.ico"))
  .get("/", () => Bun.file("@api/../public/index.html"))
  .get("/elysia+bun.png", () => Bun.file("@api/../public/elysia+bun.png"))
  .listen(appConfig.PORT);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
