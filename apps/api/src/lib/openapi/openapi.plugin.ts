import { appConfig } from "@api/config/app.config";
import { AuthOpenApi } from "@api/lib/auth/auth.openapi";
import { fromTypes, openapi } from "@elysiajs/openapi";

export const openApiPlugin = openapi({
  references: fromTypes(appConfig.NODE_ENV === "production" ? "dist/index.d.ts" : "@api/index.ts"),
  documentation: {
    components: await AuthOpenApi.componets,
    paths: await AuthOpenApi.getPaths(),
    security: await AuthOpenApi.getSecurity,
  },
});
