import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ScenarioManager from "./scenario-manager";
import type { ScenarioInputs } from "@/lib/scenario-schema";

const mockInputs: ScenarioInputs = {
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

const mockScenarios = [
  { id: "s1", name: "Scenario A", inputs: mockInputs, updatedAt: "2026-03-13T00:00:00Z" },
  { id: "s2", name: "Scenario B", inputs: mockInputs, updatedAt: "2026-03-12T00:00:00Z" },
];

describe("ScenarioManager", () => {
  const onLoad = vi.fn();
  const getCurrentInputs = vi.fn(() => mockInputs);

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("renders Save As button", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    render(<ScenarioManager onLoad={onLoad} getCurrentInputs={getCurrentInputs} />);
    expect(screen.getByText("Save As...")).toBeTruthy();
  });

  it("shows name input when Save As is clicked", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    const user = userEvent.setup();
    render(<ScenarioManager onLoad={onLoad} getCurrentInputs={getCurrentInputs} />);

    await user.click(screen.getByText("Save As..."));
    expect(screen.getByPlaceholderText("Scenario name...")).toBeTruthy();
    expect(screen.getByText("Save")).toBeTruthy();
    expect(screen.getByText("Cancel")).toBeTruthy();
  });

  it("hides name input when Cancel is clicked", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    const user = userEvent.setup();
    render(<ScenarioManager onLoad={onLoad} getCurrentInputs={getCurrentInputs} />);

    await user.click(screen.getByText("Save As..."));
    await user.click(screen.getByText("Cancel"));
    expect(screen.getByText("Save As...")).toBeTruthy();
    expect(screen.queryByPlaceholderText("Scenario name...")).toBeNull();
  });

  it("renders Load dropdown when scenarios exist", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockScenarios),
    });

    render(<ScenarioManager onLoad={onLoad} getCurrentInputs={getCurrentInputs} />);

    await waitFor(() => {
      expect(screen.getByText("Load Scenario")).toBeTruthy();
    });
  });

  it("calls onLoad when a scenario is selected", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockScenarios),
    });

    const user = userEvent.setup();
    render(<ScenarioManager onLoad={onLoad} getCurrentInputs={getCurrentInputs} />);

    await waitFor(() => {
      expect(screen.getByText("Scenario A")).toBeTruthy();
    });

    await user.click(screen.getByText("Scenario A"));
    expect(onLoad).toHaveBeenCalledWith(mockInputs);
  });

  it("saves a new scenario via POST", async () => {
    const saved = { id: "new-id", name: "My Test", inputs: mockInputs };

    (global.fetch as ReturnType<typeof vi.fn>)
      // Initial GET
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
      // POST
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(saved) })
      // Re-fetch after save
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([saved]) });

    const user = userEvent.setup();
    render(<ScenarioManager onLoad={onLoad} getCurrentInputs={getCurrentInputs} />);

    await user.click(screen.getByText("Save As..."));
    await user.type(screen.getByPlaceholderText("Scenario name..."), "My Test");
    await user.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/scenarios", expect.objectContaining({
        method: "POST",
      }));
    });
  });

  it("shows error on failed save", async () => {
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
      .mockResolvedValueOnce({ ok: false, json: () => Promise.resolve({ error: "Maximum 25 scenarios allowed." }) });

    const user = userEvent.setup();
    render(<ScenarioManager onLoad={onLoad} getCurrentInputs={getCurrentInputs} />);

    await user.click(screen.getByText("Save As..."));
    await user.type(screen.getByPlaceholderText("Scenario name..."), "Test");
    await user.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(screen.getByText("Maximum 25 scenarios allowed.")).toBeTruthy();
    });
  });

  it("deletes a scenario", async () => {
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockScenarios) })
      // DELETE
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ message: "Deleted" }) })
      // Re-fetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([mockScenarios[1]]) });

    const user = userEvent.setup();
    render(<ScenarioManager onLoad={onLoad} getCurrentInputs={getCurrentInputs} />);

    await waitFor(() => {
      expect(screen.getAllByTitle("Delete")).toHaveLength(2);
    });

    await user.click(screen.getAllByTitle("Delete")[0]);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/scenarios/s1", expect.objectContaining({
        method: "DELETE",
      }));
    });
  });
});
