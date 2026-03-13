import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock Recharts to avoid canvas/SVG rendering issues in jsdom
vi.mock("recharts", () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div />,
  Cell: () => <div />,
  Legend: () => <div />,
}));

import ROICalculator from "./roi-calculator";

describe("ROICalculator", () => {
  it("renders without crashing", () => {
    render(<ROICalculator />);
    expect(screen.getByText("ISV Portfolio Input")).toBeInTheDocument();
  });

  it("renders all tab buttons", () => {
    render(<ROICalculator />);
    expect(screen.getByText("ISV Portfolio Input")).toBeInTheDocument();
    expect(screen.getByText("ISV ROI Summary")).toBeInTheDocument();
    expect(screen.getByText("Merchant-Level ROI")).toBeInTheDocument();
    expect(screen.getByText("Cresora Assumptions")).toBeInTheDocument();
  });

  it("starts on the ISV Portfolio Input tab", () => {
    render(<ROICalculator />);
    const tab = screen.getByText("ISV Portfolio Input");
    expect(tab.className).toContain("FC6200");
  });

  it("switches to ISV ROI Summary tab and renders content", async () => {
    const user = userEvent.setup();
    render(<ROICalculator />);
    await user.click(screen.getByText("ISV ROI Summary"));
    expect(screen.getByText("ISV ROI Summary").className).toContain("FC6200");
    // Summary tab should show annual savings KPIs
    expect(screen.getByText("Total Annual Savings")).toBeInTheDocument();
    expect(screen.getByText("Total w/ Residual Uplift")).toBeInTheDocument();
    // Should show effective rate section
    expect(screen.getByText(/Blended Effective Rate/)).toBeInTheDocument();
    expect(screen.getByText("Current Effective Rate")).toBeInTheDocument();
    expect(screen.getByText("Cresora Effective Rate")).toBeInTheDocument();
    // Should show cost breakdown
    expect(screen.getByText(/Annual Cost Breakdown/)).toBeInTheDocument();
    // Should show charts
    expect(screen.getAllByTestId("bar-chart").length).toBeGreaterThan(0);
    expect(screen.getAllByTestId("pie-chart").length).toBeGreaterThan(0);
    // Should show ROI Snapshot
    expect(screen.getByText("ROI Snapshot")).toBeInTheDocument();
    expect(screen.getByText("Monthly Savings")).toBeInTheDocument();
    expect(screen.getByText("3-Year Net Value")).toBeInTheDocument();
  });

  it("switches to Merchant-Level ROI tab and renders content", async () => {
    const user = userEvent.setup();
    render(<ROICalculator />);
    await user.click(screen.getByText("Merchant-Level ROI"));
    expect(screen.getByText("Merchant-Level ROI").className).toContain("FC6200");
    // Should show per-merchant KPIs
    expect(screen.getByText("Annual Card Volume")).toBeInTheDocument();
    expect(screen.getByText("Annual ACH Volume")).toBeInTheDocument();
    expect(screen.getByText(/Current Annual Fees/)).toBeInTheDocument();
    expect(screen.getByText("Cresora Annual Fees")).toBeInTheDocument();
    // Should show card/ACH fee breakdown
    expect(screen.getByText("Card Processing Fees")).toBeInTheDocument();
    expect(screen.getByText("ACH Processing Fees")).toBeInTheDocument();
    // Should show savings breakdown
    expect(screen.getByText("Total Annual Savings Breakdown")).toBeInTheDocument();
    expect(screen.getByText("Card Fee Reduction")).toBeInTheDocument();
    expect(screen.getByText("ACH Fee Reduction")).toBeInTheDocument();
    expect(screen.getByText("Auth Rate Lift (Card)")).toBeInTheDocument();
    // Should show portfolio projection chart
    expect(screen.getByText(/Portfolio Projection/)).toBeInTheDocument();
  });

  it("switches to Cresora Assumptions tab and renders content", async () => {
    const user = userEvent.setup();
    render(<ROICalculator />);
    await user.click(screen.getByText("Cresora Assumptions"));
    expect(screen.getByText("Cresora Assumptions").className).toContain("FC6200");
    // Should show adjustment notice
    expect(screen.getByText(/Adjust these to match/)).toBeInTheDocument();
    // Should show assumption sections
    expect(screen.getByText("Cresora Card Pricing")).toBeInTheDocument();
    expect(screen.getByText("Cresora ACH Pricing")).toBeInTheDocument();
    expect(screen.getByText("Performance Improvements")).toBeInTheDocument();
    expect(screen.getByText("Revenue Share")).toBeInTheDocument();
    expect(screen.getByText("Tech & Integration")).toBeInTheDocument();
    // Should show Update ROI Summary button
    expect(screen.getByText("Update ROI Summary →")).toBeInTheDocument();
  });

  it("renders portfolio profile section on input tab", () => {
    render(<ROICalculator />);
    expect(screen.getByText("Portfolio Profile")).toBeInTheDocument();
  });

  it("renders merchants input with default value", () => {
    render(<ROICalculator />);
    expect(screen.getByDisplayValue("500")).toBeInTheDocument();
  });

  it("allows editing number inputs", async () => {
    const user = userEvent.setup();
    render(<ROICalculator />);
    const merchantsInput = screen.getByDisplayValue("500");
    await user.clear(merchantsInput);
    await user.type(merchantsInput, "1000");
    expect(merchantsInput).toHaveValue(1000);
  });

  it("displays calculated KPI values", () => {
    render(<ROICalculator />);
    // With 500 merchants × $85k avg vol, monthly card volume should show $42,500,000
    expect(screen.getByText("$42,500,000")).toBeInTheDocument();
  });

  it("navigates to summary via View ROI Summary button", async () => {
    const user = userEvent.setup();
    render(<ROICalculator />);
    await user.click(screen.getByText("View ROI Summary →"));
    // Should now be on the summary tab
    expect(screen.getByText("Total Annual Savings")).toBeInTheDocument();
  });

  it("shows flat rate input when pricing model changed to flat", async () => {
    const user = userEvent.setup();
    render(<ROICalculator />);
    // Find and change the pricing model select
    const select = screen.getByDisplayValue("Interchange-Plus (IC+)");
    await user.selectOptions(select, "flat");
    expect(screen.getByText(/Flat Rate/)).toBeInTheDocument();
    // IC+ fields should be gone
    expect(screen.queryByText("Current Markup over Interchange")).not.toBeInTheDocument();
  });

  it("shows tiered inputs when pricing model changed to tiered", async () => {
    const user = userEvent.setup();
    render(<ROICalculator />);
    const select = screen.getByDisplayValue("Interchange-Plus (IC+)");
    await user.selectOptions(select, "tiered");
    expect(screen.getByText("Qualified Rate")).toBeInTheDocument();
    expect(screen.getByText("Mid-Qualified Rate")).toBeInTheDocument();
    expect(screen.getByText("Non-Qualified Rate")).toBeInTheDocument();
  });

  it("shows IC+ inputs by default", () => {
    render(<ROICalculator />);
    expect(screen.getByText("Current Markup over Interchange")).toBeInTheDocument();
    expect(screen.getByText("Per-Transaction Fee")).toBeInTheDocument();
  });

  it("renders all input sections on portfolio input tab", () => {
    render(<ROICalculator />);
    expect(screen.getByText("Card Volume & Mix")).toBeInTheDocument();
    expect(screen.getByText("ACH Volume & Pricing")).toBeInTheDocument();
    expect(screen.getByText("Card Pricing Model")).toBeInTheDocument();
    expect(screen.getByText("Platform & Compliance Costs")).toBeInTheDocument();
    expect(screen.getByText("Card Disputes & Returns")).toBeInTheDocument();
    expect(screen.getByText("Cash Flow & Funding")).toBeInTheDocument();
    expect(screen.getByText("Merchant Lifecycle")).toBeInTheDocument();
    expect(screen.getByText("Revenue Share & Contract Terms")).toBeInTheDocument();
  });

  it("shows Cresora assumptions for flat rate when pricing model is flat", async () => {
    const user = userEvent.setup();
    render(<ROICalculator />);
    // Change to flat rate
    const select = screen.getByDisplayValue("Interchange-Plus (IC+)");
    await user.selectOptions(select, "flat");
    // Go to assumptions tab
    await user.click(screen.getByText("Cresora Assumptions"));
    expect(screen.getByText("Cresora Flat Rate")).toBeInTheDocument();
  });

  it("shows Cresora assumptions for tiered when pricing model is tiered", async () => {
    const user = userEvent.setup();
    render(<ROICalculator />);
    const select = screen.getByDisplayValue("Interchange-Plus (IC+)");
    await user.selectOptions(select, "tiered");
    await user.click(screen.getByText("Cresora Assumptions"));
    expect(screen.getByText(/converts to IC\+/)).toBeInTheDocument();
  });

  it("shows exclusivity contract note on summary tab", async () => {
    const user = userEvent.setup();
    render(<ROICalculator />);
    await user.click(screen.getByText("ISV ROI Summary"));
    expect(screen.getByText(/Exclusivity clause restricts/)).toBeInTheDocument();
  });
});
