import { Elysia } from "elysia";
import { appConfig } from "./config/app.config";
import { authPlugin } from "./lib/auth/auth.macro";
import { openApiPlugin } from "./lib/openapi/openapi.plugin";

const api = new Elysia({
  prefix: "/api",
}).get("/", {
  message: "Hello Elysia",
});

const app = new Elysia()
  .use([authPlugin, openApiPlugin, api])
  .get("/favicon.ico", () => Bun.file("src/../public/favicon.ico"))
  .get("/", () => Bun.file("src/../public/index.html"))
  .get("/elysia+bun.png", () => Bun.file("src/../public/elysia+bun.png"))
  .listen(appConfig.PORT);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
