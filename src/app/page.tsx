import { Explorer } from "@/components/Explorer";
import { StickyCta } from "@/components/StickyCta";
import { priipsSources, taxSources } from "@/data/facts";
import { bankFundBenchmark, ucitsEtfs } from "@/data/funds";
import { feeGap, formatCzk, formatPct } from "@/lib/projection";
import { pickUtm, resolveVariant, type Variant } from "@/lib/variants";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const heroGap = feeGap(3000, 20, ucitsEtfs.cspx.terPct, bankFundBenchmark.totalPct).gap;

const faq = [
  {
    q: "Proč si VOO nebo SPY z Česka nekoupím?",
    a: "Od roku 2018 musí mít každý fond prodávaný drobným investorům v EU dokument KID podle nařízení PRIIPs. Americké fondy ho nevydávají, a tak je evropští brokeři běžným klientům nenabízejí. Výjimkou je status profesionálního klienta, který má ale přísné podmínky.",
  },
  {
    q: "Je evropská verze horší?",
    a: "U S&P 500 sledují CSPX i VUAA přesně stejný index jako VOO. Poplatek je 0,07 % místo 0,03 %, tedy 4 Kč ročně navíc na každých 10 000 Kč. Fondy jsou irské a na dividendy z USA platí srážkovou daň 15 %, stejně jako americký fond.",
  },
  {
    q: "Akumulační, nebo distribuční?",
    a: "Akumulační (Acc) fond dividendy sám reinvestuje. Nic vám nechodí na účet, a tak nemáte co danit ani vykazovat. Pro dlouhodobé investování je to obvykle jednodušší volba.",
  },
  {
    q: "Budu platit daň ze zisku?",
    a: "Pokud ETF držíte déle než 3 roky, zisk z prodeje je v ČR osvobozen (časový test). Osvobozen je také příjem z prodeje cenných papírů do 100 000 Kč za rok.",
  },
  {
    q: "Co je ETF Kompas? Prodáváte něco?",
    a: "Je to bezplatný srovnávač. Nejsme broker ani investiční poradce, fondy neprodáváme a za doporučení konkrétního fondu nedostáváme provizi.",
  },
];

const hero: Record<Variant, { eyebrow: string; title: React.ReactNode; lead: string }> = {
  voo: {
    eyebrow: "Pro investory z Česka",
    title: (
      <>
        VOO z Česka <span className="text-signal">nekoupíte.</span> Tohle ano.
      </>
    ),
    lead: "Americké ETF z burzy NYSE jsou pro drobné investory z EU zablokované. Vyberte fond, který jste chtěli, a hned uvidíte evropskou verzi se stejným indexem a co vás bude stát.",
  },
  fees: {
    eyebrow: "Při 3 000 Kč měsíčně na 20 let",
    title: (
      <>
        O <span className="num text-signal">{formatCzk(heroGap)}</span> přijdete ve fondu z banky.
      </>
    ),
    lead: `Stejný index S&P 500 stojí v ETF ${formatPct(ucitsEtfs.cspx.terPct)} ročně místo průměrných ${formatPct(bankFundBenchmark.totalPct)}. Vyberte fond a spočítejte si to na svých číslech.`,
  },
};

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const variant = resolveVariant(params.ad);
  const utm = pickUtm(params);
  const copy = hero[variant];

  return (
    <main className="mx-auto max-w-2xl px-4 pb-24 pt-5 sm:px-6 sm:pt-10">
      <header className="flex items-center justify-between">
        <span className="font-display text-lg font-extrabold tracking-tight">
          ETF<span className="text-signal">·</span>Kompas
        </span>
        <span className="num text-xs text-muted">data k 10. 10. 2026</span>
      </header>

      <section className="pt-8 sm:pt-14">
        <p className="text-sm font-semibold uppercase tracking-wider text-pine-2">{copy.eyebrow}</p>
        <h1 className="mt-3 font-display text-[2.6rem] font-extrabold leading-[1.02] tracking-tight sm:text-6xl">
          {copy.title}
        </h1>
        <p className="mt-4 text-lg leading-snug text-ink/80">{copy.lead}</p>
        <Explorer variant={variant} utm={utm} />
      </section>

      <section className="mt-14">
        <h2 className="font-display text-3xl font-bold tracking-tight">Časté otázky</h2>
        <div className="mt-4 divide-y divide-line border-y border-line">
          {faq.map((item) => (
            <details key={item.q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
                {item.q}
                <span aria-hidden className="text-2xl text-muted transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 leading-relaxed text-ink/80">{item.a}</p>
            </details>
          ))}
        </div>
        <a href="#ziskat" className="mt-6 flex min-h-14 items-center justify-center rounded-2xl bg-ink text-lg font-bold text-paper">
          Získat můj ETF plán zdarma
        </a>
      </section>

      <footer className="mt-14 space-y-3 text-xs leading-relaxed text-muted">
        <p>
          <strong className="text-ink">Odkud jsou data:</strong> parametry fondů z justETF, StockAnalysis a State Street (k 10.
          10. 2026), náklady fondů z ESMA Market Report 2025, regulace a daně:{" "}
          {[...priipsSources, ...taxSources].map((src, i) => (
            <span key={src.url}>
              {i > 0 && ", "}
              <a href={src.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                {src.label}
              </a>
            </span>
          ))}
          .
        </p>
        <p>
          Obsah slouží ke vzdělávání a není investičním doporučením. Hodnota investice může klesat i stoupat a minulé výnosy
          nezaručují budoucí. <a href="/soukromi" className="underline underline-offset-2">Zpracování osobních údajů</a>
        </p>
      </footer>
      <StickyCta />
    </main>
  );
}
