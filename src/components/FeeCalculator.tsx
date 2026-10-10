"use client";

import { bankFundBenchmark, type UcitsEtf } from "@/data/funds";
import { feeGap, formatCzk, formatPct, GROSS_RETURN_PCT } from "@/lib/projection";

export const MONTHLY_PRESETS = [1000, 3000, 5000, 10000] as const;

type Props = {
  twin: UcitsEtf;
  monthly: number;
  years: number;
  onChange: (next: { monthly?: number; years?: number }) => void;
};

export function FeeCalculator({ twin, monthly, years, onChange }: Props) {
  const result = feeGap(monthly, years, twin.terPct, bankFundBenchmark.totalPct);
  const maxValue = Math.max(result.cheap, 1);

  return (
    <div className="rounded-3xl border border-line bg-white/60 p-5 sm:p-7">
      <p className="text-sm font-semibold uppercase tracking-wider text-muted">Kolik budete investovat?</p>

      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Měsíční částka">
        {MONTHLY_PRESETS.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={monthly === value}
            onClick={() => onChange({ monthly: value })}
            className={`num rounded-full px-4 py-2 text-sm font-semibold transition ${
              monthly === value ? "bg-ink text-paper" : "bg-paper-2 text-ink"
            }`}
          >
            {value.toLocaleString("cs-CZ")} Kč
          </button>
        ))}
      </div>

      <label className="mt-5 block">
        <span className="flex items-baseline justify-between text-sm">
          <span className="text-muted">Měsíčně</span>
          <span className="num text-base font-semibold">{monthly.toLocaleString("cs-CZ")} Kč</span>
        </span>
        <input
          type="range"
          min={500}
          max={30000}
          step={500}
          value={monthly}
          onChange={(e) => onChange({ monthly: Number(e.target.value) })}
          className="mt-2 w-full accent-pine"
        />
      </label>

      <label className="mt-4 block">
        <span className="flex items-baseline justify-between text-sm">
          <span className="text-muted">Jak dlouho</span>
          <span className="num text-base font-semibold">{years} let</span>
        </span>
        <input
          type="range"
          min={5}
          max={40}
          step={1}
          value={years}
          onChange={(e) => onChange({ years: Number(e.target.value) })}
          className="mt-2 w-full accent-pine"
        />
      </label>

      <div className="mt-6 space-y-3">
        <Bar
          label={`${twin.ticker} (${formatPct(twin.terPct)} ročně)`}
          value={result.cheap}
          max={maxValue}
          tone="gain"
        />
        <Bar
          label={`Průměrný fond z banky (${formatPct(bankFundBenchmark.totalPct)} ročně)`}
          value={result.expensive}
          max={maxValue}
          tone="muted"
        />
      </div>

      <div className="mt-5 rounded-2xl bg-signal/10 p-4">
        <p className="text-sm text-ink/80">Rozdíl, který vám zůstane v kapse</p>
        <p className="num text-4xl font-semibold text-signal sm:text-5xl" aria-live="polite">
          {formatCzk(result.gap)}
        </p>
        <p className="mt-1 text-sm text-ink/70">
          Vložíte celkem <span className="num">{formatCzk(result.contributed)}</span>.
        </p>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted">
        Modelový výpočet: hrubý výnos {GROSS_RETURN_PCT} % ročně pro oba fondy, liší se jen náklady. Náklady průměrného
        akciového fondu (ne-ETF) v EU {formatPct(bankFundBenchmark.ongoingPct)} průběžně +{" "}
        {formatPct(bankFundBenchmark.entryPctPerYear)} vstupní poplatky v přepočtu na rok, zdroj:{" "}
        <a
          href={bankFundBenchmark.source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
        >
          {bankFundBenchmark.source.label}
        </a>
        . Minulé ani modelové výnosy nejsou zárukou budoucích.
      </p>
    </div>
  );
}

function Bar({ label, value, max, tone }: { label: string; value: number; max: number; tone: "gain" | "muted" }) {
  const width = `${Math.max(4, Math.round((value / max) * 100))}%`;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-ink/80">{label}</span>
        <span className="num shrink-0 font-semibold">{formatCzk(value)}</span>
      </div>
      <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-paper-2">
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${tone === "gain" ? "bg-gain" : "bg-muted/50"}`}
          style={{ width }}
        />
      </div>
    </div>
  );
}
