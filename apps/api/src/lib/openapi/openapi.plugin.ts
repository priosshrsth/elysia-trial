import openapi, { fromTypes } from "@elysiajs/openapi";
import { appConfig } from "src/config/app.config";
import { AuthOpenApi } from "../auth/auth.openapi";

export const openApiPlugin = openapi({
  references: fromTypes(appConfig.NODE_ENV === "production" ? "dist/index.d.ts" : "src/index.ts"),
  documentation: {
    components: await AuthOpenApi.componets,
    paths: await AuthOpenApi.getPaths(),
    security: await AuthOpenApi.getSecurity,
  },
});
