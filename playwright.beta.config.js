import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  timeout: 30000,
  use: {
    baseURL: "http://127.0.0.1:4175", headless: true, timezoneId: "America/New_York",
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {},
  },
  webServer: { command: "node tests/browser/server.mjs", url: "http://127.0.0.1:4175/beta/", reuseExistingServer: false },
});
