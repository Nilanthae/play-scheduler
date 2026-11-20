import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

// A person who can sign in. Created on first Google sign-in (T-011).
// Group-specific role and status live in `memberships`.
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  // Stable Google account id ("sub"). Email can change, this does not.
  googleSub: text("google_sub").notNull().unique(),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
