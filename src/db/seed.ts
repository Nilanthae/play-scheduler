// Demo data: one group and one admin. Safe to run more than once.
// Run with: pnpm run db:seed   (uses DATABASE_URL from .env.local, so run it against dev only)
import { eq } from "drizzle-orm";

import { getDb } from "./index";
import { groups, memberships, users } from "./schema";

const DEMO_GROUP_NAME = "Demo Badminton Group";
const DEMO_ADMIN = {
  googleSub: "demo-admin-google-sub",
  email: "admin@example.com",
  displayName: "Demo Admin",
};

async function seed() {
  const db = getDb();

  // Group: reuse the demo group if it already exists.
  let [group] = await db.select().from(groups).where(eq(groups.name, DEMO_GROUP_NAME));
  if (!group) {
    [group] = await db.insert(groups).values({ name: DEMO_GROUP_NAME }).returning();
  }

  // Admin user.
  let [admin] = await db.select().from(users).where(eq(users.email, DEMO_ADMIN.email));
  if (!admin) {
    [admin] = await db.insert(users).values(DEMO_ADMIN).returning();
  }

  // Membership as admin (unique on group + user, so duplicates are skipped).
  await db
    .insert(memberships)
    .values({ groupId: group.id, userId: admin.id, role: "admin", status: "active" })
    .onConflictDoNothing();

  console.log(
    `Seeded group "${group.name}" (id ${group.id}) with admin ${admin.email} (id ${admin.id}).`,
  );
}

seed().then(
  () => process.exit(0),
  (error: unknown) => {
    console.error("Seed failed:", error);
    process.exit(1);
  },
);
