import { expect, test, type APIRequestContext } from "@playwright/test";
import { deleteTestLeads, testDb, TEST_EMAIL_PREFIX } from "./db";

const valid = { usTicker: "VOO", monthly: 3000, years: 20, variant: "voo" };
const randomIp = () => `10.${[0, 0, 0].map(() => Math.floor(Math.random() * 250) + 1).join(".")}`;

function post(request: APIRequestContext, data: unknown, ip = randomIp()) {
  return request.post("/api/lead", {
    headers: { "x-forwarded-for": ip },
    data: typeof data === "string" ? data : JSON.stringify(data),
  });
}

test.afterAll(async () => {
  await deleteTestLeads();
});

test("valid lead is stored", async ({ request }) => {
  const res = await post(request, { ...valid, email: `${TEST_EMAIL_PREFIX}@example.com`, utm: { utm_source: "e2e" } });
  expect(res.status()).toBe(200);
  expect(await res.json()).toMatchObject({ ok: true });
});

test("same email in different case updates one row and keeps first UTM", async ({ request }) => {
  const email = `${TEST_EMAIL_PREFIX}+case@example.com`;
  await post(request, { ...valid, email, utm: { utm_source: "first" } });
  const res = await post(request, { ...valid, email: email.toUpperCase() });
  expect(res.status()).toBe(200);
  const sql = testDb();
  test.skip(!sql, "DATABASE_URL not set");
  const rows = (await sql!`SELECT submissions, utm, length(ip_hash) AS ip_len FROM leads WHERE email = ${email}`) as {
    submissions: number;
    utm: Record<string, string>;
    ip_len: number | null;
  }[];
  expect(rows).toHaveLength(1);
  expect(rows[0].submissions).toBe(2);
  expect(rows[0].utm).toEqual({ utm_source: "first" });
  expect(rows[0].ip_len).toBe(64);
});

const rejected: [string, unknown, number, string][] = [
  ["invalid email", { ...valid, email: "not-an-email" }, 400, "invalid_email"],
  ["SQL injection in email", { ...valid, email: "a'); DROP TABLE leads;--@x.cz" }, 400, "invalid_email"],
  ["ticker outside whitelist (QQQ)", { ...valid, usTicker: "QQQ", email: `${TEST_EMAIL_PREFIX}@example.com` }, 400, "invalid_input"],
  ["monthly amount out of range", { ...valid, monthly: 999999, email: `${TEST_EMAIL_PREFIX}@example.com` }, 400, "invalid_input"],
  ["unknown UTM key", { ...valid, utm: { evil: "x" }, email: `${TEST_EMAIL_PREFIX}@example.com` }, 400, "invalid_input"],
  ["malformed JSON", "this is not json", 400, "invalid_json"],
  ["body over 4 kB", { ...valid, email: `${TEST_EMAIL_PREFIX}@example.com`, pad: "a".repeat(5000) }, 413, "too_large"],
];

for (const [name, body, status, error] of rejected) {
  test(`rejects ${name}`, async ({ request }) => {
    const res = await post(request, body);
    expect(res.status()).toBe(status);
    expect(await res.json()).toMatchObject({ ok: false, error });
  });
}

test("honeypot pretends success but stores nothing", async ({ request }) => {
  const email = `${TEST_EMAIL_PREFIX}+bot@example.com`;
  const res = await post(request, { ...valid, email, website: "spam" });
  expect(res.status()).toBe(200);
  const sql = testDb();
  test.skip(!sql, "DATABASE_URL not set");
  const rows = await sql!`SELECT 1 FROM leads WHERE email = ${email}`;
  expect(rows).toHaveLength(0);
});

test("rate limit: 6th submission from one IP within 10 minutes is rejected", async ({ request }) => {
  const ip = randomIp();
  const statuses: number[] = [];
  for (let i = 1; i <= 6; i++) {
    const res = await post(request, { ...valid, email: `${TEST_EMAIL_PREFIX}+rl${i}@example.com` }, ip);
    statuses.push(res.status());
  }
  expect(statuses).toEqual([200, 200, 200, 200, 200, 429]);
});
