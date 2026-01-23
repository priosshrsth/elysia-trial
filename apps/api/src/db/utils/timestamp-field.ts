import { timestamp } from "drizzle-orm/pg-core";

export const timestampField = timestamp({ withTimezone: true });
