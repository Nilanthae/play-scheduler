import { defineConfig, devices } from "@playwright/test";

const port = 3000;

// Chromium only, to keep CI minutes low (see T-008).
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm run dev",
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
  },
});
