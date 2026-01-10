import { appConfig } from "@api/config/app.config";
import { defineConfig } from "drizzle-kit";

export const drizzleConfig = defineConfig({
  out: "./drizzle",
  schema: "./src/db/schemas/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: appConfig.DB_URL,
  },
});

export default defineConfig;
