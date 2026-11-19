import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

// The client is created on first use, not at import time, so `next build`
// can load routes that touch the database without DATABASE_URL being set.
let client: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function getDb() {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local.");
    }
    client = drizzle(neon(url), { schema });
  }
  return client;
}
