"use client";

import { bankFundBenchmark, ucitsEtfs, usEtfs, type UsEtf } from "@/data/funds";
import { priipsSources, taxSources } from "@/data/facts";
import { track } from "@/lib/analytics";
import { feeGap, formatCzk, formatPct } from "@/lib/projection";

type Props = { fund: UsEtf; monthly: number; years: number; emailed: boolean };

function milestones(years: number): number[] {
  const marks = [];
  for (let y = 5; y < years; y += 5) marks.push(y);
  marks.push(years);
  return marks;
}

export function PlanReport({ fund, monthly, years, emailed }: Props) {
  const twin = ucitsEtfs[fund.twins[0].id];

  function printPlan() {
    track("pdf_downloaded", { us_ticker: fund.ticker });
    window.print();
  }

  async function share() {
    track("cta_clicked", { cta: "share" });
    const data = { title: "ETF Kompas", text: `${fund.ticker} z Česka nekoupíte. Tohle ano:`, url: window.location.origin };
    try {
      if (navigator.share) await navigator.share(data);
      else await navigator.clipboard.writeText(data.url);
    } catch {
      return;
    }
  }

  return (
    <article id="plan" className="scroll-mt-4 rounded-3xl border-2 border-ink bg-white p-5 sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-wider text-gain">
        {emailed ? "Hotovo · kopie je na cestě do e-mailu" : "Hotovo · plán je váš"}
      </p>
      <h2 className="mt-2 font-display text-3xl font-bold leading-tight tracking-tight">
        Váš ETF plán: <span className="num">{fund.ticker}</span> → <span className="num">{twin.ticker}</span>
      </h2>

      <div className="no-print mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={printPlan} className="rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-paper">
          Uložit jako PDF
        </button>
        <button type="button" onClick={share} className="rounded-full border-2 border-ink px-5 py-2.5 text-sm font-bold">
          Poslat kamarádovi
        </button>
      </div>

      <h3 className="mt-8 text-lg font-bold">1. Co koupit místo {fund.ticker}</h3>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[420px] text-left text-sm">
          <thead className="text-muted">
            <tr>
              <th className="py-2 pr-3 font-normal">Fond</th>
              <th className="py-2 pr-3 font-normal">ISIN</th>
              <th className="py-2 pr-3 font-normal">Poplatek</th>
              <th className="py-2 font-normal">Burza (ticker)</th>
            </tr>
          </thead>
          <tbody className="num">
            {fund.twins.map(({ id }) => {
              const t = ucitsEtfs[id];
              return (
                <tr key={id} className="border-t border-line">
                  <td className="py-2 pr-3 font-semibold">{t.ticker}</td>
                  <td className="py-2 pr-3">{t.isin}</td>
                  <td className="py-2 pr-3">{formatPct(t.terPct)}</td>
                  <td className="py-2">Xetra {t.ticker} · LSE {t.lseTicker}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {fund.twins[0].match === "similar" && (
        <p className="mt-2 text-sm text-muted">
          {fund.ticker} sleduje index {fund.index}, který v evropské verzi neexistuje. {twin.ticker} sleduje {twin.index} – je
          mu nejblíž, ale výsledky se budou mírně lišit.
        </p>
      )}

      <h3 className="mt-8 text-lg font-bold">
        2. Vaše investice: <span className="num">{formatCzk(monthly)}</span> měsíčně
      </h3>
      <div className="mt-3 overflow-x-auto">
        <table className="num w-full min-w-[420px] text-left text-sm">
          <thead className="font-sans text-muted">
            <tr>
              <th className="py-2 pr-3 font-normal">Rok</th>
              <th className="py-2 pr-3 font-normal">Vloženo</th>
              <th className="py-2 pr-3 font-normal">{twin.ticker}</th>
              <th className="py-2 pr-3 font-normal">Fond z banky</th>
              <th className="py-2 font-normal">Rozdíl</th>
            </tr>
          </thead>
          <tbody>
            {milestones(years).map((y) => {
              const r = feeGap(monthly, y, twin.terPct, bankFundBenchmark.totalPct);
              return (
                <tr key={y} className="border-t border-line">
                  <td className="py-2 pr-3">{y}</td>
                  <td className="py-2 pr-3">{formatCzk(r.contributed)}</td>
                  <td className="py-2 pr-3 font-semibold">{formatCzk(r.cheap)}</td>
                  <td className="py-2 pr-3">{formatCzk(r.expensive)}</td>
                  <td className="py-2 font-semibold text-signal">{formatCzk(r.gap)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-muted">
        Model s hrubým výnosem 7 % ročně, náklady fondu z banky {formatPct(bankFundBenchmark.totalPct)} ročně (
        <a href={bankFundBenchmark.source.url} target="_blank" rel="noopener noreferrer" className="underline">
          {bankFundBenchmark.source.label}
        </a>
        ). Nejde o předpověď.
      </p>

      <h3 className="mt-8 text-lg font-bold">3. Nákup krok za krokem</h3>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-[15px] leading-snug">
        <li>
          U svého brokera hledejte podle ISIN <span className="num font-semibold">{twin.isin}</span>, ne podle tickeru. Ticker se na
          každé burze liší.
        </li>
        <li>
          Vyberte burzu: na Xetře ({twin.ticker}) se obchoduje v eurech, na LSE ({twin.lseTicker}) v dolarech. Když platíte
          korunami, broker měnu převede. Podívejte se, kolik si za převod účtuje.
        </li>
        <li>
          {twin.distribution === "acc"
            ? "Fond je akumulační: dividendy sám reinvestuje, takže je nedostáváte na účet a neřešíte je v daňovém přiznání."
            : "Fond je distribuční: dividendy vyplácí na účet a v ČR je musíte zdanit."}
        </li>
        <li>Pokud to broker umožňuje, nastavte si pravidelný měsíční nákup. Odpadá rozhodování, kdy je „dobrá chvíle“.</li>
        <li>Držte fond aspoň 3 roky. Pak je zisk z prodeje v ČR osvobozen od daně (viz bod 4).</li>
      </ol>

      <h3 className="mt-8 text-lg font-bold">4. Daně v ČR v kostce</h3>
      <ul className="mt-3 space-y-2 text-[15px] leading-snug">
        <li>
          <strong>Časový test:</strong> prodáte-li ETF držené déle než 3 roky, zisk nedaníte. Od 1. 1. 2026 bez limitu 40 mil. Kč.
        </li>
        <li>
          <strong>Hodnotový test:</strong> pokud za rok prodáte cenné papíry celkem nejvýše za 100 000 Kč (počítá se příjem, ne zisk), je
          příjem osvobozen.
        </li>
        <li>
          <strong>Proč ne americké ETF:</strong> nemají evropský dokument KID, a tak je brokeři v EU drobným investorům nesmí
          prodat (nařízení PRIIPs).
        </li>
      </ul>
      <p className="mt-2 text-xs text-muted">
        Zdroje:{" "}
        {[...taxSources, ...priipsSources].map((s, i) => (
          <span key={s.url}>
            {i > 0 && " · "}
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline">
              {s.label}
            </a>
          </span>
        ))}
        . Nejde o daňové poradenství.
      </p>

      <h3 className="mt-8 text-lg font-bold">5. Všech 6 amerických ETF a jejich evropské verze</h3>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[420px] text-left text-sm">
          <thead className="text-muted">
            <tr>
              <th className="py-2 pr-3 font-normal">NYSE</th>
              <th className="py-2 pr-3 font-normal">Poplatek</th>
              <th className="py-2 pr-3 font-normal">Evropská verze</th>
              <th className="py-2 pr-3 font-normal">Poplatek</th>
              <th className="py-2 font-normal">Index</th>
            </tr>
          </thead>
          <tbody>
            {usEtfs.map((f) => {
              const t = ucitsEtfs[f.twins[0].id];
              return (
                <tr key={f.ticker} className="border-t border-line">
                  <td className="num py-2 pr-3 font-semibold">{f.ticker}</td>
                  <td className="num py-2 pr-3">{formatPct(f.terPct)}</td>
                  <td className="num py-2 pr-3 font-semibold">{t.ticker}</td>
                  <td className="num py-2 pr-3">{formatPct(t.terPct)}</td>
                  <td className="py-2">{f.twins[0].match === "same-index" ? "stejný" : "podobný"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-muted">
        Data k 10. 10. 2026 z justETF, StockAnalysis a State Street. ETF Kompas není broker ani investiční poradce a nic
        neprodává. Investice nese riziko ztráty.
      </p>
    </article>
  );
}
