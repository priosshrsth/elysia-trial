import { fromTypes, openapi } from "@elysiajs/openapi";
import { appConfig } from "src/config/app.config";

export const openApiPlugin = openapi({
  references: fromTypes(appConfig.NODE_ENV === "production" ? "dist/index.d.ts" : "src/index.ts"),
});
