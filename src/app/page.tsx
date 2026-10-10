import { Explorer } from "@/components/Explorer";
import { bankFundBenchmark, ucitsEtfs } from "@/data/funds";
import { feeGap, formatCzk, formatPct } from "@/lib/projection";
import { pickUtm, resolveVariant, type Variant } from "@/lib/variants";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const heroGap = feeGap(3000, 20, ucitsEtfs.cspx.terPct, bankFundBenchmark.totalPct).gap;

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
        <span className="num text-signal">{formatCzk(heroGap)}</span> zaplatíte navíc ve fondu z banky.
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
    </main>
  );
}
