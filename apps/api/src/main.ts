import { fromTypes, openapi } from "@elysiajs/openapi";
import { Elysia, ValidationError } from "elysia";
import { appConfig } from "src/config/app.config";
import { AuthModule } from "./modules/auth/auth.module";

export const app = new Elysia()
  .onError(({ error }) => {
    if (error instanceof ValidationError) {
      console.log(error.all);
      // try {
      //   const errors = error.all as z.core.$ZodIssue[];
      //   return {
      //     message: error.message,
      //     errors: z.treeifyError({ issues: errors } as z.core.$ZodError),
      //   };
      // } catch (er) {
      //   console.log(er.message);
      // }
      const errors = new Map(
        error.all.flatMap((issue) => {
          const valueError =
            "path" in issue ? (issue as unknown as { path: string; message: string; code: string }) : null;
          if (valueError) {
            return [[valueError.path, valueError.message]];
          }
          return [];
        }),
      );

      const parsedError = JSON.parse(error.message);

      console.log(parsedError);

      return {
        message: error.message,
        errors,
      };
    }

    return error;
  })
  .use(
    openapi({
      references: fromTypes(appConfig.NODE_ENV === "production" ? "dist/index.d.ts" : "src/index.ts"),
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
