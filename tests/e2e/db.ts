import { neon } from "@neondatabase/serverless";

export const TEST_EMAIL_PREFIX = "e2e-test";

export function testDb() {
  const url = process.env.DATABASE_URL;
  return url ? neon(url) : null;
}

export async function deleteTestLeads(): Promise<number> {
  const sql = testDb();
  if (!sql) return 0;
  const rows = await sql`DELETE FROM leads WHERE email LIKE ${TEST_EMAIL_PREFIX + "%"} RETURNING 1`;
  return rows.length;
}
