import { defineConfig } from "@playwright/test";

export default defineConfig({
  forbidOnly: Boolean(process.env.CI),
  reporter: "list",
  retries: 0,
  testDir: "./tests",
  testMatch: ["**/support-browser/*.test.ts", "**/support-static/*.test.ts"],
  use: { baseURL: "http://127.0.0.1:3197", trace: "retain-on-failure" },
  webServer: {
    command:
      "python3 -m http.server 3197 --bind 127.0.0.1 --directory dist-demo",
    reuseExistingServer: false,
    timeout: 30_000,
    url: "http://127.0.0.1:3197/support-demo/",
  },
});
