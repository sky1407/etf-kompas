import { createHash } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { NextResponse, type NextRequest } from "next/server";
import { leadSchema } from "@/lib/lead-schema";
import { sendPlanEmail } from "@/lib/server/email";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 4096;
const RATE_LIMIT_PER_10_MIN = 5;

function hashIp(request: NextRequest): string | null {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const salt = process.env.IP_HASH_SALT;
  if (!ip || !salt) return null;
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export async function POST(request: NextRequest) {
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "too_large" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    const emailInvalid = parsed.error.issues.some((issue) => issue.path[0] === "email");
    return NextResponse.json({ ok: false, error: emailInvalid ? "invalid_email" : "invalid_input" }, { status: 400 });
  }
  const lead = parsed.data;

  if (lead.website) {
    return NextResponse.json({ ok: true, emailed: false });
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set");
    return NextResponse.json({ ok: false, error: "unavailable" }, { status: 503 });
  }

  const sql = neon(databaseUrl);
  const ipHash = hashIp(request);

  try {
    if (ipHash) {
      const [{ count }] = (await sql`
        SELECT count(*)::int AS count FROM leads
        WHERE ip_hash = ${ipHash} AND updated_at > now() - interval '10 minutes'
      `) as { count: number }[];
      if (count >= RATE_LIMIT_PER_10_MIN) {
        return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
      }
    }

    await sql`
      INSERT INTO leads (email, us_ticker, monthly_czk, years, variant, utm, ip_hash)
      VALUES (${lead.email}, ${lead.usTicker}, ${lead.monthly}, ${lead.years}, ${lead.variant}, ${JSON.stringify(lead.utm)}::jsonb, ${ipHash})
      ON CONFLICT (email) DO UPDATE SET
        us_ticker = EXCLUDED.us_ticker,
        monthly_czk = EXCLUDED.monthly_czk,
        years = EXCLUDED.years,
        variant = EXCLUDED.variant,
        ip_hash = EXCLUDED.ip_hash,
        submissions = leads.submissions + 1,
        updated_at = now()
    `;
  } catch (error) {
    console.error("lead insert failed", error);
    return NextResponse.json({ ok: false, error: "storage_failed" }, { status: 500 });
  }

  const emailed = await sendPlanEmail(lead, new URL("/", request.nextUrl.origin).toString());
  return NextResponse.json({ ok: true, emailed });
}
