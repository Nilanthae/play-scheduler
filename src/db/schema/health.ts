import { pgTable, serial, timestamp } from "drizzle-orm/pg-core";

// Trivial table used to prove migrations work end to end (T-005).
// timestamptz stores UTC; display converts to Asia/Colombo.
export const health = pgTable("health", {
  id: serial("id").primaryKey(),
  checkedAt: timestamp("checked_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
