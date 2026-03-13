import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: () => ({ success: true, remaining: 10 }),
}));

const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({
  auth: () => mockAuth(),
}));

const mockSelect = vi.fn();
const mockInsert = vi.fn();
vi.mock("@/db", () => ({
  db: {
    select: () => mockSelect(),
    insert: () => mockInsert(),
  },
}));

vi.mock("@/db/schema", () => ({
  scenarios: { userId: "user_id", updatedAt: "updated_at" },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((col, val) => ({ col, val })),
  desc: vi.fn((col) => ({ col, dir: "desc" })),
}));

import { GET, POST } from "./route";

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

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost:3000/api/scenarios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("GET /api/scenarios", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
  });

  it("returns 401 if not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns scenarios list", async () => {
    const rows = [{ id: "s1", name: "Test", inputs: validInputs }];
    mockSelect.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue(rows),
        }),
      }),
    });

    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(rows);
  });
});

describe("POST /api/scenarios", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
  });

  it("returns 401 if not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await POST(makeRequest({ name: "Test", inputs: validInputs }));
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid input", async () => {
    const res = await POST(makeRequest({ name: "", inputs: validInputs }));
    expect(res.status).toBe(400);
  });

  it("returns 400 if max scenarios reached", async () => {
    mockSelect.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(Array(25).fill({})),
      }),
    });

    const res = await POST(makeRequest({ name: "Test", inputs: validInputs }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Maximum 25");
  });

  it("creates scenario successfully", async () => {
    mockSelect.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    });

    const created = { id: "new-id", name: "Test", inputs: validInputs };
    mockInsert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([created]),
      }),
    });

    const res = await POST(makeRequest({ name: "Test", inputs: validInputs }));
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.id).toBe("new-id");
  });
});
