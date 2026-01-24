import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { appConfig } from "./config/app.config";
import { openApiPlugin } from "./lib/openapi.plugin";
import { AuthModule } from "./modules/auth/auth.module";
import { TaskModule } from "./modules/task/task.module";

export const app = new Elysia()
  .use(cors())
  .onError(({ error }) => {
    // if (error instanceof ValidationError) {
    //   const data = JSON.parse(error.message) as {
    //     errors: { path: string[]; message: string }[];
    //     message: string;
    //   };
    //   const validationErrors = new Map(data.errors.map((error) => [error.path.join("."), error.message]));
    //   return {
    //     message: data.message,
    //     validationErrors: Object.fromEntries(validationErrors.entries()),
    //   };
    // }

    return error;
  })
  .use(openApiPlugin)
  .use(AuthModule)
  .use(TaskModule)
  .get("/favicon.ico", () => Bun.file("src/../public/favicon.ico"))
  .get("/", () => Bun.file("src/../public/index.html"))
  .get("/elysia+bun.png", () => Bun.file("src/../public/elysia+bun.png"))
  .listen(appConfig.PORT);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
