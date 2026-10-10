import { expect, test } from "@playwright/test";
import { TEST_EMAIL_PREFIX } from "./db";

const normalize = (text: string) => text.replace(/\s+/g, " ").trim();

test.describe("hero matches the ad", () => {
  test("ad B (?ad=voo)", async ({ page }) => {
    await page.goto("/?ad=voo&utm_source=e2e");
    await expect(page.locator("h1")).toHaveText(/VOO z Česka\s+nekoupíte\.\s+Tohle ano\./);
  });

  test("ad A (?ad=fees)", async ({ page }) => {
    await page.goto("/?ad=fees&utm_source=e2e");
    expect(normalize(await page.locator("h1").innerText())).toBe("O 283 000 Kč přijdete ve fondu z banky.");
  });
});

const counterparts: Record<string, string> = { VOO: "SXR8", SPY: "SXR8", IVV: "SXR8", VTI: "XD9U", VT: "VWCE", SCHD: "SPYD" };

test("every NYSE fund shows its UCITS counterpart", async ({ page }) => {
  await page.goto("/");
  for (const [us, ucits] of Object.entries(counterparts)) {
    await page.getByRole("radio", { name: new RegExp(`^${us}\\b`) }).click();
    await expect(page.locator("#nahrada")).toContainText(ucits);
  }
});

test("full funnel: fund → calculator → email → plan", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => msg.type() === "error" && consoleErrors.push(msg.text()));

  await page.goto("/?ad=voo&utm_source=e2e");
  await page.getByRole("radio", { name: /^VOO\b/ }).click();
  await page.getByRole("button", { name: "5 000 Kč" }).click();
  await page.locator("#kalkulacka input[type=range]").nth(1).fill("30");
  const gap = await page.locator("#kalkulacka [aria-live]").innerText();
  expect(gap.replace(/\s/g, "")).toBe("1638100Kč");

  await page.locator("#ziskat").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Zobrazit můj plán" }).click();
  await expect(page.locator("form [role=alert]")).toContainText("e-mail");

  await page.fill("#email", `${TEST_EMAIL_PREFIX}+funnel@example.com`);
  await page.getByRole("button", { name: "Zobrazit můj plán" }).click();

  const plan = page.locator("#plan");
  await expect(plan).toBeVisible({ timeout: 10_000 });
  await expect(plan).toContainText("Váš ETF plán: VOO → SXR8");
  await expect(plan).toContainText("IE00B5BMR087");
  await expect(plan).toContainText("Časový test");

  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await expect(page.locator(".fixed").first()).toHaveAttribute("aria-hidden", "true");
  expect(consoleErrors).toEqual([]);
});

test("privacy page is reachable", async ({ page }) => {
  await page.goto("/soukromi");
  await expect(page.locator("h1")).toHaveText("Zpracování osobních údajů");
});
