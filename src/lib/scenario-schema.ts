import { z } from "zod";

export const scenarioInputsSchema = z.object({
  // Card inputs
  merchants: z.number().min(0).max(100000),
  avgMonthlyVol: z.number().min(0),
  avgMonthlyTxn: z.number().min(0),
  avgTicket: z.number().min(0),
  pricingModel: z.enum(["ic_plus", "flat", "tiered"]),
  cpPct: z.number().min(0).max(100),
  currentMarkupPct: z.number().min(0),
  currentPerTxn: z.number().min(0),
  flatRate: z.number().min(0),
  tieredQual: z.number().min(0),
  tieredMidQual: z.number().min(0),
  tieredNonQual: z.number().min(0),
  tieredQualPct: z.number().min(0).max(100),
  tieredMidQualPct: z.number().min(0).max(100),

  // ACH inputs
  achMonthlyVol: z.number().min(0),
  achMonthlyTxn: z.number().min(0),
  achPerTxnFee: z.number().min(0),
  achReturnRate: z.number().min(0).max(100),
  achReturnFee: z.number().min(0),

  // Platform costs
  gatewayFeeMonthly: z.number().min(0),
  pciFeeAnnual: z.number().min(0),
  authRate: z.number().min(0).max(100),
  cbRate: z.number().min(0).max(100),
  cbFee: z.number().min(0),
  returnRate: z.number().min(0).max(100),
  avgReturnFee: z.number().min(0),
  cbLaborHrs: z.number().min(0),
  laborRate: z.number().min(0),
  fundingDays: z.number().min(1).max(7),
  costOfCapital: z.number().min(0),
  apiCostMonthly: z.number().min(0),
  devHrsMonthly: z.number().min(0),
  termFee: z.number().min(0),
  hasExclusivity: z.enum(["yes", "partial", "no"]),
  revenueSharePct: z.number().min(0).max(100),
  onboardCostPerMerch: z.number().min(0),
  merchantChurnRate: z.number().min(0).max(100),
  avgMerchantLTV: z.number().min(0),

  // Cresora assumptions
  cresoraMarkupPct: z.number().min(0),
  cresoraPerTxn: z.number().min(0),
  cresoraFlatRate: z.number().min(0),
  cresoraAchPerTxn: z.number().min(0),
  cresoraAuthRateLift: z.number().min(0),
  cresoraRevSharePct: z.number().min(0).max(100),
  cresoraCbReduction: z.number().min(0).max(100),
  cresoraFundingDays: z.number().min(1).max(5),
  cresoraOnboardCost: z.number().min(0),
  cresoraChurnReduction: z.number().min(0).max(100),
  cresoraApiCost: z.number().min(0),
  cresoraDevHrs: z.number().min(0),
});

export type ScenarioInputs = z.infer<typeof scenarioInputsSchema>;

export const scenarioNameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(100, "Name must be less than 100 characters");

export const createScenarioSchema = z.object({
  name: scenarioNameSchema,
  inputs: scenarioInputsSchema,
});

export const updateScenarioSchema = z.object({
  name: scenarioNameSchema.optional(),
  inputs: scenarioInputsSchema.optional(),
});
