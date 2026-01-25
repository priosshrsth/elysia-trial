import { fromTypes, openapi } from "@elysiajs/openapi";
import { appConfig } from "src/config/app.config";
import { AuthOpenApi } from "src/modules/auth/lib/auth.openapi";

// export const openApiPlugin = openapi({
//   references: fromTypes(appConfig.NODE_ENV === "production" ? "dist/index.d.ts" : "src/index.ts"),
//   documentation: {},
// });

export const openApiPlugin = openapi({
  references: fromTypes(appConfig.NODE_ENV === "production" ? "dist/main.d.ts" : "src/main.ts"),
  documentation: {
    components: await AuthOpenApi.components,
    paths: await AuthOpenApi.getPaths(),
    security: await AuthOpenApi.getSecurity,
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
      {
        name: "Tasks",
        description: "Tasks related endpoints",
      },
    ],
  },
});
