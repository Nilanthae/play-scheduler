import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema/*.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Empty string is fine for `db:generate`, which doesn't connect.
    url: process.env.DATABASE_URL ?? "",
  },
});
