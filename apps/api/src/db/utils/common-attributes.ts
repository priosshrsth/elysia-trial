import { text } from "drizzle-orm/pg-core";
import { timestampField } from "src/db/utils/timestamp-field";

export const commonAttributes = {
  id: text().primaryKey(),
  createdAt: timestampField.defaultNow().notNull(),
  updatedAt: timestampField.$onUpdate(() => /* @__PURE__ */ new Date()).notNull(),
};
