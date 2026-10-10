import { z } from "zod";
import { usEtfs } from "@/data/funds";

const tickers = usEtfs.map((f) => f.ticker) as [string, ...string[]];
const utmValue = z.string().trim().max(100).optional();

export const leadSchema = z.object({
  email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
  usTicker: z.enum(tickers),
  monthly: z.number().int().min(500).max(30000),
  years: z.number().int().min(5).max(40),
  variant: z.enum(["voo", "fees"]),
  utm: z
    .object({
      utm_source: utmValue,
      utm_medium: utmValue,
      utm_campaign: utmValue,
      utm_content: utmValue,
    })
    .strict()
    .default({}),
  website: z.string().max(200).optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;
