import { defineConfig, devices } from "@playwright/test";

const port = 3100;
const localBaseUrl = `http://127.0.0.1:${port}`;
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? localBaseUrl;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: `npm run dev:next -- --hostname 127.0.0.1 --port ${port}`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        url: localBaseUrl,
      },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "mobile-chrome", use: { ...devices["Pixel 7"] } },
    { name: "mobile-safari", use: { ...devices["iPhone 15"] } },
  ],
});
