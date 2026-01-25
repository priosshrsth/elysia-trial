import { timestamp } from "drizzle-orm/pg-core";

/**
 * IMPORTANT:
 * Drizzle column builders are stateful. If you export a single builder instance and reuse it
 * across multiple tables, drizzle-kit may skip/lose columns during schema diff/migrations.
 *
 * Export factories instead, and call them in each table:
 *   createdAt: createdAtField(),
 *   updatedAt: updatedAtField(),
 */
export const timestampField = () => timestamp({ withTimezone: true });

export const createdAtField = timestampField().defaultNow().notNull();

export const getUpdatedAtField = () =>
  timestampField()
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull();
