import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    { name: "setup", testMatch: /global\.setup\.ts/ },
    {
      name: "authoredA",
      use: { ...devices["Desktop Chrome"], storageState: "e2e/.auth/a.json" },
      dependencies: ["setup"],
      testMatch: /(recruit-create|community|dashboard|states)\.spec\.ts/,
    },
    {
      name: "applicantB",
      use: { ...devices["Desktop Chrome"], storageState: "e2e/.auth/b.json" },
      dependencies: ["setup"],
      testMatch: /recruit-apply\.spec\.ts/,
    },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /(auth|recruit-list|recruit-applicant-management|like-bookmark-viewcount|profile-edit)\.spec\.ts/,
    },
  ],
});
