"use client";

import { useEffect, useRef, useState } from "react";
import { ucitsEtfs, usEtfs } from "@/data/funds";
import { initAnalytics, track } from "@/lib/analytics";
import type { Utm, Variant } from "@/lib/variants";
import { FeeCalculator } from "./FeeCalculator";
import { LeadGate } from "./LeadGate";
import { PlanReport } from "./PlanReport";
import { TwinCard } from "./TwinCard";

type Props = { variant: Variant; utm: Utm };

export function Explorer({ variant, utm }: Props) {
  const [ticker, setTicker] = useState(usEtfs[0].ticker);
  const [monthly, setMonthly] = useState(3000);
  const [years, setYears] = useState(20);
  const [lead, setLead] = useState<{ emailed: boolean } | null>(null);
  const calculatorTouched = useRef(false);
  const viewTracked = useRef(false);

  const fund = usEtfs.find((f) => f.ticker === ticker) ?? usEtfs[0];
  const twin = ucitsEtfs[fund.twins[0].id];

  useEffect(() => {
    if (viewTracked.current) return;
    viewTracked.current = true;
    if (initAnalytics({ variant, ...utm })) track("landing_view");
  }, [variant, utm]);

  useEffect(() => {
    const marks = [25, 50, 75, 100];
    const seen = new Set<number>();
    function onScroll() {
      const doc = document.documentElement;
      const total = doc.scrollHeight - window.innerHeight;
      if (total <= 0) return;
      const pct = (window.scrollY / total) * 100;
      for (const mark of marks) {
        if (pct >= mark - 1 && !seen.has(mark)) {
          seen.add(mark);
          track("scroll_depth", { percent: mark });
        }
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function selectFund(next: string) {
    setTicker(next);
    track("fund_selected", { us_ticker: next });
  }

  function changeCalculator(next: { monthly?: number; years?: number }) {
    if (next.monthly !== undefined) setMonthly(next.monthly);
    if (next.years !== undefined) setYears(next.years);
    if (!calculatorTouched.current) {
      calculatorTouched.current = true;
      track("calculator_used", { us_ticker: ticker });
    }
  }

  return (
    <>
      <div className="mt-7">
        <p className="text-sm font-semibold text-ink/80">Které americké ETF jste chtěli koupit?</p>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6" role="radiogroup" aria-label="Americké ETF">
          {usEtfs.map((f) => {
            const active = f.ticker === ticker;
            return (
              <button
                key={f.ticker}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => selectFund(f.ticker)}
                className={`rounded-2xl border-2 px-2 py-3 text-center transition active:scale-[0.97] ${
                  active ? "border-ink bg-ink text-paper" : "border-line bg-white/50 text-ink"
                }`}
              >
                <span className="num block text-lg font-semibold">{f.ticker}</span>
                <span className={`block truncate text-[11px] ${active ? "text-paper/70" : "text-muted"}`}>{f.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <section id="nahrada" className="mt-6 scroll-mt-6" aria-live="polite">
        <TwinCard fund={fund} />
        <a
          href="#ziskat"
          onClick={() => track("cta_clicked", { cta: "twin_card" })}
          className="mt-3 flex items-center justify-between rounded-2xl border-2 border-ink px-5 py-4 font-bold"
        >
          Chci celý plán nákupu {fund.ticker} → {twin.ticker}
          <span aria-hidden>↓</span>
        </a>
      </section>

      <section id="kalkulacka" className="mt-10 scroll-mt-6">
        <h2 className="font-display text-3xl font-bold leading-tight tracking-tight">
          Kolik vám {twin.ticker} ušetří proti fondu z banky
        </h2>
        <div className="mt-4">
          <FeeCalculator twin={twin} monthly={monthly} years={years} onChange={changeCalculator} />
        </div>
      </section>

      <section id="ziskat" className="mt-10 scroll-mt-4">
        {lead ? (
          <PlanReport fund={fund} monthly={monthly} years={years} emailed={lead.emailed} />
        ) : (
          <LeadGate
            usTicker={fund.ticker}
            twinTicker={twin.ticker}
            twinTerPct={twin.terPct}
            monthly={monthly}
            years={years}
            variant={variant}
            utm={utm}
            onSuccess={(result) => {
              setLead(result);
              window.requestAnimationFrame(() =>
                document.getElementById("plan")?.scrollIntoView({ behavior: "smooth", block: "start" }),
              );
            }}
          />
        )}
      </section>
    </>
  );
}
