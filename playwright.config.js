import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL: "https://www.flowchera21.bg5.net",
    browserName: "chromium",
    trace: "retain-on-failure",
  },
});
