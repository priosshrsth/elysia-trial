import { SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";
import { appConfig } from "src/config/app.config";

const client = new SQL(appConfig.DB_URL);
export const db = drizzle({ client, casing: "snake_case" });
