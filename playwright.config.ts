import { defineConfig } from "@playwright/test";

try {
  process.loadEnvFile(".env.local");
} catch {}

const port = Number(process.env.E2E_PORT ?? 3000);

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  globalTeardown: "./tests/e2e/teardown.ts",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? `http://localhost:${port}`,
    browserName: "chromium",
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    screenshot: "only-on-failure",
  },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npm run build && npx next start -p ${port}`,
        port,
        reuseExistingServer: true,
        timeout: 180_000,
      },
});
