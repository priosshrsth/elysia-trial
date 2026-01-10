import { appConfig } from "@api/config/app.config";
import { SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";
import * as schema from "./schemas";

const client = new SQL(appConfig.DB_URL);
export const db = drizzle({ client, casing: "snake_case", schema });
