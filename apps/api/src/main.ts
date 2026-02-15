import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import z from "zod";
import { appConfig } from "./config/app.config";
import { openApiPlugin } from "./lib/openapi.plugin";
import { AuthModule } from "./modules/auth/auth.module";

export const app = new Elysia()
  .use(cors())
  .onError(({ error, code }) => {
    switch (code) {
      // case "VALIDATION": {
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
      default:
        return error;
    }
  })
  .use(openApiPlugin)
  .use(AuthModule)
  .get(
    "/",
    () => {
      return {
        message: "Api is working!",
      };
    },
    {
      params: z
        .object({
          id: z.uuidv4(),
        })
        // @ts-expect-error
        .default({}),
    },
  )
  .get("/favicon.ico", () => Bun.file("src/../public/favicon.ico"))
  .listen(appConfig.PORT);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
