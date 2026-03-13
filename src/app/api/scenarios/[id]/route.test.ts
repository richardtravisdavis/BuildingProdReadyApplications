import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: () => ({ success: true, remaining: 10 }),
}));

const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({
  auth: () => mockAuth(),
}));

const mockUpdate = vi.fn();
const mockDelete = vi.fn();
vi.mock("@/db", () => ({
  db: {
    update: () => mockUpdate(),
    delete: () => mockDelete(),
  },
}));

vi.mock("@/db/schema", () => ({
  scenarios: { id: "id", userId: "user_id" },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((col, val) => ({ col, val })),
  and: vi.fn((...args) => ({ and: args })),
}));

import { PATCH, DELETE } from "./route";

const validInputs = {
  merchants: 500, avgMonthlyVol: 85000, avgMonthlyTxn: 1200, avgTicket: 71,
  pricingModel: "ic_plus", cpPct: 55, currentMarkupPct: 0.4, currentPerTxn: 0.1,
  flatRate: 2.7, tieredQual: 1.79, tieredMidQual: 2.49, tieredNonQual: 3.49,
  tieredQualPct: 55, tieredMidQualPct: 30, achMonthlyVol: 22000, achMonthlyTxn: 85,
  achPerTxnFee: 0.5, achReturnRate: 1.8, achReturnFee: 3.0, gatewayFeeMonthly: 25,
  pciFeeAnnual: 1200, authRate: 92, cbRate: 0.45, cbFee: 25, returnRate: 1.2,
  avgReturnFee: 0.5, cbLaborHrs: 2, laborRate: 35, fundingDays: 2, costOfCapital: 6,
  apiCostMonthly: 1500, devHrsMonthly: 20, termFee: 5000, hasExclusivity: "yes",
  revenueSharePct: 25, onboardCostPerMerch: 120, merchantChurnRate: 8, avgMerchantLTV: 4200,
  cresoraMarkupPct: 0.2, cresoraPerTxn: 0.07, cresoraFlatRate: 2.45, cresoraAchPerTxn: 0.18,
  cresoraAuthRateLift: 2.5, cresoraRevSharePct: 40, cresoraCbReduction: 20,
  cresoraFundingDays: 1, cresoraOnboardCost: 45, cresoraChurnReduction: 30,
  cresoraApiCost: 0, cresoraDevHrs: 4,
};

function makeRequest(method: string, body?: Record<string, unknown>) {
  return new Request("http://localhost:3000/api/scenarios/test-id", {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

const params = Promise.resolve({ id: "test-id" });

describe("PATCH /api/scenarios/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
  });

  it("returns 401 if not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await PATCH(makeRequest("PATCH", { name: "Updated" }), { params });
    expect(res.status).toBe(401);
  });

  it("returns 400 for empty update", async () => {
    const res = await PATCH(makeRequest("PATCH", {}), { params });
    expect(res.status).toBe(400);
  });

  it("returns 404 if scenario not found", async () => {
    mockUpdate.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      }),
    });

    const res = await PATCH(makeRequest("PATCH", { name: "Updated" }), { params });
    expect(res.status).toBe(404);
  });

  it("updates scenario successfully", async () => {
    const updated = { id: "test-id", name: "Updated", inputs: validInputs };
    mockUpdate.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([updated]),
        }),
      }),
    });

    const res = await PATCH(makeRequest("PATCH", { name: "Updated" }), { params });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe("Updated");
  });
});

describe("DELETE /api/scenarios/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
  });

  it("returns 401 if not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await DELETE(makeRequest("DELETE"), { params });
    expect(res.status).toBe(401);
  });

  it("returns 404 if scenario not found", async () => {
    mockDelete.mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([]),
      }),
    });

    const res = await DELETE(makeRequest("DELETE"), { params });
    expect(res.status).toBe(404);
  });

  it("deletes scenario successfully", async () => {
    mockDelete.mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: "test-id" }]),
      }),
    });

    const res = await DELETE(makeRequest("DELETE"), { params });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.message).toBe("Scenario deleted");
  });
});
