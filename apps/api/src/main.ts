import { fromTypes, openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { appConfig } from "src/config/app.config";
import { AuthModule } from "./modules/auth/auth.module";

export const app = new Elysia()
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
  .use(
    openapi({
      references: fromTypes(appConfig.NODE_ENV === "production" ? "dist/index.d.ts" : "src/main.ts"),
      documentation: {
        info: {
          title: "API Documentation",
          version: "1.0.0",
          description: "API Documentation",
        },
        tags: [
          {
            name: "Auth",
            description: "Authentication related endpoints",
          },
        ],
      },
    }),
  )
  .use(AuthModule)
  .get("/favicon.ico", () => Bun.file("src/../public/favicon.ico"))
  .get("/", () => Bun.file("src/../public/index.html"))
  .get("/elysia+bun.png", () => Bun.file("src/../public/elysia+bun.png"))
  .listen(appConfig.PORT);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
