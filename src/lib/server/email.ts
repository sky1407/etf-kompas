import "server-only";
import { bankFundBenchmark, ucitsEtfs, usEtfs } from "@/data/funds";
import { feeGap, formatCzk, formatPct } from "@/lib/projection";
import type { LeadInput } from "@/lib/lead-schema";

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch] ?? ch);

function renderPlan(lead: LeadInput, siteUrl: string): { subject: string; html: string } {
  const fund = usEtfs.find((f) => f.ticker === lead.usTicker) ?? usEtfs[0];
  const twins = fund.twins.map(({ id }) => ucitsEtfs[id]);
  const gap = feeGap(lead.monthly, lead.years, twins[0].terPct, bankFundBenchmark.totalPct);
  const rows = twins
    .map(
      (t) =>
        `<tr><td style="padding:6px 8px;font-weight:600">${escapeHtml(t.ticker)}</td><td style="padding:6px 8px">${escapeHtml(t.isin)}</td><td style="padding:6px 8px">${formatPct(t.terPct)}</td></tr>`,
    )
    .join("");
  return {
    subject: `Váš ETF plán: ${fund.ticker} → ${twins[0].ticker}`,
    html: `<div style="font-family:Arial,sans-serif;color:#0f1f1a;max-width:560px">
<h1 style="font-size:22px">${escapeHtml(fund.ticker)} z Česka nekoupíte. Tohle ano.</h1>
<table style="border-collapse:collapse;border:1px solid #d8cfbf">${rows}</table>
<p>Při ${formatCzk(lead.monthly)} měsíčně na ${lead.years} let ušetříte proti průměrnému fondu z banky přibližně <strong>${formatCzk(gap.gap)}</strong> (model, hrubý výnos 7 % ročně).</p>
<p>Celý plán s postupem nákupu a daněmi: <a href="${escapeHtml(siteUrl)}">${escapeHtml(siteUrl)}</a></p>
<p style="font-size:12px;color:#5b6863">Nejde o investiční doporučení. Odhlásit se můžete odpovědí na tento e-mail.</p>
</div>`,
  };
}

export async function sendPlanEmail(lead: LeadInput, siteUrl: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !from) return false;
  const { subject, html } = renderPlan(lead, siteUrl);
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [lead.email], subject, html }),
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) {
      console.error("resend failed", response.status);
      return false;
    }
    return true;
  } catch (error) {
    console.error("resend error", error);
    return false;
  }
}
