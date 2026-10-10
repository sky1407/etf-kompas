"use client";

import { useState } from "react";
import { ucitsEtfs, type UsEtf } from "@/data/funds";
import { formatPct } from "@/lib/projection";
import { track } from "@/lib/analytics";

const eurM = new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 });

export function TwinCard({ fund }: { fund: UsEtf }) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copyIsin(isin: string) {
    try {
      await navigator.clipboard.writeText(isin);
      setCopied(isin);
      track("isin_copied", { isin, us_ticker: fund.ticker });
      window.setTimeout(() => setCopied((current) => (current === isin ? null : current)), 1800);
    } catch {
      setCopied(null);
    }
  }

  return (
    <div className="rounded-3xl bg-pine p-5 text-paper shadow-[0_20px_50px_-25px_rgba(18,59,48,0.8)] sm:p-7">
      <div className="flex items-center gap-3">
        <span className="num rounded-lg bg-paper/10 px-2.5 py-1 text-lg font-semibold line-through decoration-signal decoration-2">
          {fund.ticker}
        </span>
        <span className="text-sm text-paper/70">
          {fund.exchange} · {formatPct(fund.terPct)} ročně · pro drobné investory z EU blokováno
        </span>
      </div>

      <p className="mt-4 text-xl font-semibold leading-snug sm:text-2xl">
        {fund.twins[0].match === "same-index"
          ? `Stejný index ${fund.index} koupíte takhle:`
          : `Nejbližší evropská náhrada (index není identický):`}
      </p>

      <ul className="mt-4 space-y-3">
        {fund.twins.map(({ id, match }) => {
          const twin = ucitsEtfs[id];
          return (
            <li key={id} className="rounded-2xl bg-paper p-4 text-ink">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="num text-2xl font-semibold">
                    {twin.ticker}
                    {twin.lseTicker !== twin.ticker && (
                      <span className="ml-2 text-sm font-normal text-muted">na LSE {twin.lseTicker}</span>
                    )}
                  </p>
                  <p className="text-sm text-muted">{twin.name}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    match === "same-index" ? "bg-mint text-pine" : "bg-paper-2 text-muted"
                  }`}
                >
                  {match === "same-index" ? "stejný index" : `index ${twin.index}`}
                </span>
              </div>
              <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
                <div>
                  <dt className="text-muted">Poplatek</dt>
                  <dd className="num font-semibold">{formatPct(twin.terPct)}</dd>
                </div>
                <div>
                  <dt className="text-muted">Dividendy</dt>
                  <dd className="font-semibold">{twin.distribution === "acc" ? "reinvestuje" : "vyplácí"}</dd>
                </div>
                <div>
                  <dt className="text-muted">Velikost</dt>
                  <dd className="num font-semibold">{eurM.format(twin.aumEurM / 1000)} mld. €</dd>
                </div>
              </dl>
              <button
                type="button"
                onClick={() => copyIsin(twin.isin)}
                className="num mt-3 flex w-full items-center justify-between rounded-xl border border-line px-3 py-2.5 text-left text-sm active:bg-paper-2"
              >
                <span>ISIN {twin.isin}</span>
                <span className="font-sans font-semibold text-pine-2">{copied === twin.isin ? "Zkopírováno ✓" : "Kopírovat"}</span>
              </button>
              <a
                href={twin.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-xs text-muted underline underline-offset-2"
              >
                Zdroj: {twin.source.label}, {twin.source.accessed}
              </a>
            </li>
          );
        })}
      </ul>
      <a
        href={fund.source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-block text-xs text-paper/60 underline underline-offset-2"
      >
        Data {fund.ticker}: {fund.source.label}
      </a>
    </div>
  );
}
