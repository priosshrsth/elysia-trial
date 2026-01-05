import { defineConfig } from "drizzle-kit";
import { appConfig } from "src/config/app.config";

export const drizzleConfig = defineConfig({
  out: "./drizzle",
  schema: "./src/db/schemas/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: appConfig.DB_URL,
  },
});

export default defineConfig;
