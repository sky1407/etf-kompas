export type Variant = "voo" | "fees";

export function resolveVariant(raw: string | string[] | undefined): Variant {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value === "fees" ? "fees" : "voo";
}

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const;
export type Utm = Partial<Record<(typeof UTM_KEYS)[number], string>>;

export function pickUtm(params: Record<string, string | string[] | undefined>): Utm {
  const utm: Utm = {};
  for (const key of UTM_KEYS) {
    const raw = params[key];
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (value) utm[key] = value.slice(0, 100);
  }
  return utm;
}
