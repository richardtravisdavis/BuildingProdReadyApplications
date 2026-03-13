import { describe, it, expect } from "vitest";
import { scenarioInputsSchema, scenarioNameSchema, createScenarioSchema } from "./scenario-schema";

const validInputs = {
  merchants: 500, avgMonthlyVol: 85000, avgMonthlyTxn: 1200, avgTicket: 71,
  pricingModel: "ic_plus" as const, cpPct: 55, currentMarkupPct: 0.4, currentPerTxn: 0.1,
  flatRate: 2.7, tieredQual: 1.79, tieredMidQual: 2.49, tieredNonQual: 3.49,
  tieredQualPct: 55, tieredMidQualPct: 30, achMonthlyVol: 22000, achMonthlyTxn: 85,
  achPerTxnFee: 0.5, achReturnRate: 1.8, achReturnFee: 3.0, gatewayFeeMonthly: 25,
  pciFeeAnnual: 1200, authRate: 92, cbRate: 0.45, cbFee: 25, returnRate: 1.2,
  avgReturnFee: 0.5, cbLaborHrs: 2, laborRate: 35, fundingDays: 2, costOfCapital: 6,
  apiCostMonthly: 1500, devHrsMonthly: 20, termFee: 5000, hasExclusivity: "yes" as const,
  revenueSharePct: 25, onboardCostPerMerch: 120, merchantChurnRate: 8, avgMerchantLTV: 4200,
  cresoraMarkupPct: 0.2, cresoraPerTxn: 0.07, cresoraFlatRate: 2.45, cresoraAchPerTxn: 0.18,
  cresoraAuthRateLift: 2.5, cresoraRevSharePct: 40, cresoraCbReduction: 20,
  cresoraFundingDays: 1, cresoraOnboardCost: 45, cresoraChurnReduction: 30,
  cresoraApiCost: 0, cresoraDevHrs: 4,
};

describe("scenarioInputsSchema", () => {
  it("accepts valid inputs", () => {
    const result = scenarioInputsSchema.safeParse(validInputs);
    expect(result.success).toBe(true);
  });

  it("rejects negative merchants", () => {
    const result = scenarioInputsSchema.safeParse({ ...validInputs, merchants: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects invalid pricingModel", () => {
    const result = scenarioInputsSchema.safeParse({ ...validInputs, pricingModel: "invalid" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid hasExclusivity", () => {
    const result = scenarioInputsSchema.safeParse({ ...validInputs, hasExclusivity: "maybe" });
    expect(result.success).toBe(false);
  });

  it("rejects missing fields", () => {
    const { merchants: _, ...partial } = validInputs;
    const result = scenarioInputsSchema.safeParse(partial);
    expect(result.success).toBe(false);
  });

  it("rejects percentages over 100 where constrained", () => {
    const result = scenarioInputsSchema.safeParse({ ...validInputs, cpPct: 101 });
    expect(result.success).toBe(false);
  });
});

describe("scenarioNameSchema", () => {
  it("accepts valid name", () => {
    const result = scenarioNameSchema.safeParse("My Scenario");
    expect(result.success).toBe(true);
  });

  it("trims whitespace", () => {
    const result = scenarioNameSchema.safeParse("  My Scenario  ");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe("My Scenario");
  });

  it("rejects empty name", () => {
    const result = scenarioNameSchema.safeParse("");
    expect(result.success).toBe(false);
  });

  it("rejects name over 100 chars", () => {
    const result = scenarioNameSchema.safeParse("a".repeat(101));
    expect(result.success).toBe(false);
  });
});

describe("createScenarioSchema", () => {
  it("accepts valid scenario", () => {
    const result = createScenarioSchema.safeParse({ name: "Test", inputs: validInputs });
    expect(result.success).toBe(true);
  });

  it("rejects missing name", () => {
    const result = createScenarioSchema.safeParse({ inputs: validInputs });
    expect(result.success).toBe(false);
  });

  it("rejects missing inputs", () => {
    const result = createScenarioSchema.safeParse({ name: "Test" });
    expect(result.success).toBe(false);
  });
});
