import { defineConfig } from "@playwright/test";

export default defineConfig({
  forbidOnly: Boolean(process.env.CI),
  reporter: "list",
  retries: 0,
  testDir: "./tests/support-browser",
  use: { baseURL: "http://127.0.0.1:3198", trace: "retain-on-failure" },
  webServer: {
    command: "pnpm exec next start --hostname 127.0.0.1 --port 3198",
    reuseExistingServer: false,
    timeout: 30_000,
    url: "http://127.0.0.1:3198/support-demo",
  },
});
