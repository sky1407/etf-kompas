export const GROSS_RETURN_PCT = 7;

export type ProjectionInput = {
  monthlyCzk: number;
  years: number;
  annualCostPct: number;
  grossReturnPct?: number;
};

export function futureValue({
  monthlyCzk,
  years,
  annualCostPct,
  grossReturnPct = GROSS_RETURN_PCT,
}: ProjectionInput): number {
  if (!Number.isFinite(monthlyCzk) || monthlyCzk <= 0) return 0;
  if (!Number.isFinite(years) || years <= 0) return 0;
  const months = Math.round(years * 12);
  const netAnnual = (grossReturnPct - annualCostPct) / 100;
  const monthlyRate = Math.pow(1 + netAnnual, 1 / 12) - 1;
  if (Math.abs(monthlyRate) < 1e-12) return monthlyCzk * months;
  return monthlyCzk * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
}

export function feeGap(monthlyCzk: number, years: number, cheapPct: number, expensivePct: number) {
  const cheap = futureValue({ monthlyCzk, years, annualCostPct: cheapPct });
  const expensive = futureValue({ monthlyCzk, years, annualCostPct: expensivePct });
  return {
    contributed: monthlyCzk * Math.round(years * 12),
    cheap,
    expensive,
    gap: cheap - expensive,
  };
}

const czk = new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 });

export function formatCzk(value: number): string {
  return `${czk.format(Math.round(value / 100) * 100)} Kč`;
}

export function formatPct(value: number): string {
  return `${value.toLocaleString("cs-CZ", { maximumFractionDigits: 4 })} %`;
}
