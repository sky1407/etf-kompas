import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = neon(url);
const schema = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");
const statements = schema
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean);

try {
  for (const statement of statements) await sql.query(statement);
  const [{ count }] = await sql.query("SELECT count(*)::int AS count FROM leads");
  console.log(`schema applied, leads: ${count}`);
} catch (error) {
  console.error("migration failed:", error instanceof Error ? error.message : error);
  process.exit(1);
}
