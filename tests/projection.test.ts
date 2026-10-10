import { test } from "node:test";
import assert from "node:assert/strict";
import { feeGap, futureValue } from "../src/lib/projection";

test("zero return without costs equals contributions", () => {
  assert.equal(futureValue({ monthlyCzk: 1000, years: 10, annualCostPct: 0, grossReturnPct: 0 }), 120000);
});

test("invalid inputs return zero", () => {
  assert.equal(futureValue({ monthlyCzk: -5, years: 10, annualCostPct: 0.1 }), 0);
  assert.equal(futureValue({ monthlyCzk: 1000, years: Number.NaN, annualCostPct: 0.1 }), 0);
});

test("cheaper fund always ends higher", () => {
  const r = feeGap(3000, 20, 0.07, 1.9);
  assert.ok(r.gap > 0);
  assert.equal(r.contributed, 720000);
  assert.ok(Math.abs(r.gap - 283000) < 1000);
});
