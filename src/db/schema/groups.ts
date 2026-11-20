import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

// One row per play group. v1 has one group, but the table keeps the
// relation so more groups can be added later (requirements decision 6).
export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  // Display zone for schedules and dates (NFR-3). Times are stored in UTC.
  timezone: text("timezone").notNull().default("Asia/Colombo"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
