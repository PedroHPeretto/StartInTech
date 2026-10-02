import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./test/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "bun run dev",
    url: "http://localhost:5173",
    reuseExistingServer: false,
    timeout: 120 * 1000,
    env: {
      ...process.env,
      VITE_E2E: "true",
      VITE_API_URL: process.env.VITE_API_URL ?? "http://localhost:3000",
      VITE_GOOGLE_CLIENT_ID:
        process.env.VITE_GOOGLE_CLIENT_ID ?? "e2e-google-client-id",
    },
  },
});