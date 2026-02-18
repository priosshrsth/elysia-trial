import { migrate } from "drizzle-orm/bun-sql/migrator";
import { db } from "./index";

console.log("Running database migrations...");
await migrate(db, { migrationsFolder: "./drizzle" });
console.log("Migrations complete.");

process.exit(0);
