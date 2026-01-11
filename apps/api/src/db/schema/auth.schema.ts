import { VerificationType } from "@repo/types";
import { relations, sql } from "drizzle-orm";
import { check, index, pgEnum, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { commonAttributes } from "src/db/utils/common-attributes";
import { timestampField } from "src/db/utils/timestamp-field";

export const VerificationActionTypeEnum = pgEnum("verification_action_type", VerificationType);

export const user = pgTable(
  "user",
  {
    ...commonAttributes,
    name: text().notNull(),
    email: text().notNull().unique(),
    userName: text(),
    emailVerifiedAt: timestampField,
    image: text(),
  },
  (table) => [check("userName", sql`char_length(${table.userName}) >= 6`)],
);

export const account = pgTable(
  "account",
  {
    ...commonAttributes,
    externalId: text().notNull(),
    provider: text().notNull(),
    userId: uuid()
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
    userId: uuid()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: VerificationActionTypeEnum().notNull(),
    code: varchar({ length: 8 }).notNull(),
    expiresAt: timestampField.notNull(),
  },
  (table) => [index().on(table.userId)],
);

export const userRelations = relations(user, ({ many }) => ({
  accounts: many(account),
  verifications: many(verification),
}));

export const verificationRelations = relations(verification, ({ one }) => {
  return {
    user: one(user),
  };
});

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user),
}));
