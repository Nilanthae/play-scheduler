import { integer, pgEnum, pgTable, serial, timestamp, unique } from "drizzle-orm/pg-core";

import { groups } from "./groups";
import { users } from "./users";

export const membershipRole = pgEnum("membership_role", ["admin", "member"]);
export const membershipStatus = pgEnum("membership_status", ["active", "inactive"]);

// Links a user to a group with a role. Deactivate (never delete) so history stays (FR-1.3).
export const memberships = pgTable(
  "memberships",
  {
    id: serial("id").primaryKey(),
    groupId: integer("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "restrict" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    role: membershipRole("role").notNull().default("member"),
    status: membershipStatus("status").notNull().default("active"),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("memberships_group_user_unique").on(t.groupId, t.userId)],
);
