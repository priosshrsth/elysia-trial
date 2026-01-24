import { defineConfig } from "drizzle-kit";
import { appConfig } from "src/config/app.config";

export const drizzleConfig = defineConfig({
  out: "./drizzle",
  schema: "./src/db/schemas/*",
  dialect: "postgresql",
  casing: "snake_case",
  dbCredentials: {
    url: appConfig.DB_URL,
  },
});

export default drizzleConfig;
