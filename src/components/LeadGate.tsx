"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { track } from "@/lib/analytics";
import { formatCzk, futureValue } from "@/lib/projection";
import type { Utm, Variant } from "@/lib/variants";

type Props = {
  usTicker: string;
  twinTicker: string;
  twinTerPct: number;
  monthly: number;
  years: number;
  variant: Variant;
  utm: Utm;
  onSuccess: (result: { emailed: boolean }) => void;
};

const ERRORS: Record<string, string> = {
  invalid_email: "Zkontrolujte prosím e-mail, něco v něm nesedí.",
  rate_limited: "Příliš mnoho pokusů. Zkuste to za pár minut.",
  default: "Nepodařilo se to odeslat. Zkuste to prosím znovu.",
};

const PREVIEW = [
  "Srovnání 6 amerických ETF a jejich evropských verzí",
  "Vývoj vaší investice po 5 letech až do konce",
  "Nákup krok za krokem: ISIN, burza, měna, typ fondu",
  "Daně v ČR na jedné stránce: časový test a limit 100 000 Kč",
];

export function LeadGate({ usTicker, twinTicker, twinTerPct, monthly, years, variant, utm, onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const focused = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          track("gate_viewed", { us_ticker: usTicker });
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [usTicker]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setError("");
    track("lead_submitted", { us_ticker: usTicker, monthly, years });
    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, usTicker, monthly, years, variant, utm, website }),
      });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; emailed?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        const code = data.error ?? "default";
        setError(ERRORS[code] ?? ERRORS.default);
        setStatus("error");
        track("lead_failed", { reason: code });
        return;
      }
      track("lead_succeeded", { us_ticker: usTicker, emailed: Boolean(data.emailed) });
      onSuccess({ emailed: Boolean(data.emailed) });
    } catch {
      setError(ERRORS.default);
      setStatus("error");
      track("lead_failed", { reason: "network" });
    }
  }

  return (
    <div ref={ref} className="overflow-hidden rounded-3xl bg-ink text-paper">
      <div className="p-5 sm:p-7">
        <p className="text-sm font-semibold uppercase tracking-wider text-mint">Zdarma · hned na obrazovce</p>
        <h2 className="mt-2 font-display text-3xl font-bold leading-tight tracking-tight">
          Váš ETF plán: {usTicker} → {twinTicker}
        </h2>
        <ul className="mt-4 space-y-2">
          {PREVIEW.map((item) => (
            <li key={item} className="flex gap-2.5 text-[15px] leading-snug text-paper/90">
              <span aria-hidden className="mt-0.5 text-mint">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div aria-hidden className="relative mx-5 select-none rounded-t-2xl bg-paper/95 px-4 pt-4 text-ink sm:mx-7">
        <div className="num space-y-2 text-sm blur-[3px]">
          <div className="flex justify-between"><span>Rok 5</span><span>{formatCzk(futureValue({ monthlyCzk: monthly, years: 5, annualCostPct: twinTerPct }))}</span></div>
          <div className="flex justify-between"><span>Rok 10</span><span>{formatCzk(futureValue({ monthlyCzk: monthly, years: 10, annualCostPct: twinTerPct }))}</span></div>
          <div className="flex justify-between"><span>ISIN</span><span>IE00•••••••••</span></div>
          <div className="flex justify-between"><span>Burza</span><span>Xetra / LSE</span></div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-paper to-transparent" />
      </div>

      <form onSubmit={submit} className="bg-paper p-5 text-ink sm:p-7" noValidate>
        <label htmlFor="email" className="text-sm font-semibold">
          Kam vám pošleme kopii?
        </label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            required
            placeholder="vas@email.cz"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => {
              if (!focused.current) {
                focused.current = true;
                track("email_focused");
              }
            }}
            aria-invalid={status === "error"}
            aria-describedby="lead-note"
            className="min-h-14 w-full rounded-2xl border-2 border-line bg-white px-4 text-lg outline-none focus:border-pine"
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="min-h-14 shrink-0 rounded-2xl bg-signal px-6 text-lg font-bold text-white transition active:scale-[0.98] disabled:opacity-60"
          >
            {status === "sending" ? "Odesílám…" : "Zobrazit můj plán"}
          </button>
        </div>
        <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label>
            Web
            <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </label>
        </div>
        {status === "error" && (
          <p role="alert" className="mt-2 text-sm font-semibold text-signal">
            {error}
          </p>
        )}
        <p id="lead-note" className="mt-3 text-xs leading-relaxed text-muted">
          Plán uvidíte hned, kopii pošleme e-mailem. Občas pošleme tip k ETF, odhlásíte se jedním klikem.{" "}
          <a href="/soukromi" className="underline underline-offset-2">
            Zpracování údajů
          </a>
        </p>
      </form>
    </div>
  );
}
