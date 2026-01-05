/// <reference types="bun-types/test-globals" />

// Global test setup
import { afterAll, beforeAll } from "bun:test";
import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/bun-sql/migrator";
import { appConfig } from "src/config/app.config";
import { db } from "src/db";

beforeAll(async () => {
  console.log(appConfig);
  // apply migration for drizzle
  await migrate(db, { migrationsFolder: "./drizzle" });
});

afterAll(async () => {
  // truncate all tables
  const result = await db.execute(sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`);

  if (result.length > 0) {
    // Disable foreign key checks temporarily
    await db.execute(sql`SET session_replication_role = 'replica'`);

    for (const row of result) {
      if (row.tablename !== "__drizzle_migrations") {
        await db.execute(sql.raw(`TRUNCATE TABLE "${row.tablename}" CASCADE`));
      }
    }

    // Re-enable foreign key checks
    await db.execute(sql`SET session_replication_role = 'origin'`);
  }
});
