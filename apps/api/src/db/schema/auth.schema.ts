import { relations, sql } from "drizzle-orm";
import { boolean, check, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { commonAttributes } from "src/db/utils/common-attributes";
import { timestampField } from "src/db/utils/timestamp-field";

export const user = pgTable(
  "user",
  {
    id: text().primaryKey(),
    name: text().notNull(),
    email: text().notNull().unique(),
    userName: text(),
    emailVerifiedAt: timestampField,
    image: text(),
    createdAt: timestampField.defaultNow().notNull(),
    updatedAt: timestampField
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [check("userName", sql`char_length(${table.userName}) >= 6`)],
);

export const account = pgTable(
  "account",
  {
    ...commonAttributes,
    externalId: text().notNull(),
    provider: text().notNull(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text(),
    refreshToken: text(),
    idToken: text(),
    accessTokenExpiresAt: timestampField,
    refreshTokenExpiresAt: timestampField,
    scope: text(),
    password: text(),
  },
  (table) => [index().on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    ...commonAttributes,
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    action: text(),
    token: text().notNull(),
    expiresAt: timestamp("expires_at").notNull(),
  },
  (table) => [index().on(table.userId)],
);

export const userRelations = relations(user, ({ many }) => ({
  accounts: many(account),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user),
}));
