import { describe, it, expect } from "vitest";
import { fmt, fmtDollar, fmtPct } from "./roi-calculator";

describe("fmt", () => {
  it("formats numbers with locale separators", () => {
    expect(fmt(1000)).toBe("1,000");
    expect(fmt(1234567)).toBe("1,234,567");
  });

  it("respects decimal places", () => {
    expect(fmt(1234.5678, 2)).toBe("1,234.57");
    expect(fmt(100, 2)).toBe("100.00");
  });

  it("returns em dash for null", () => {
    expect(fmt(null)).toBe("—");
  });

  it("handles zero", () => {
    expect(fmt(0)).toBe("0");
  });

  it("handles negative numbers", () => {
    expect(fmt(-5000)).toBe("-5,000");
  });
});

describe("fmtDollar", () => {
  it("formats as currency with dollar sign", () => {
    expect(fmtDollar(1000)).toBe("$1,000");
    expect(fmtDollar(99.99, 2)).toBe("$99.99");
  });

  it("returns em dash for null", () => {
    expect(fmtDollar(null)).toBe("—");
  });

  it("handles zero", () => {
    expect(fmtDollar(0)).toBe("$0");
  });

  it("handles large numbers", () => {
    expect(fmtDollar(1500000)).toBe("$1,500,000");
  });

  it("handles negative amounts", () => {
    expect(fmtDollar(-250)).toBe("$-250");
  });
});

describe("fmtPct", () => {
  it("formats decimals as percentages", () => {
    expect(fmtPct(0.25)).toBe("25.00%");
    expect(fmtPct(0.0315)).toBe("3.15%");
  });

  it("respects decimal precision", () => {
    expect(fmtPct(0.123456, 4)).toBe("12.3456%");
    expect(fmtPct(0.5, 0)).toBe("50%");
  });

  it("returns em dash for null", () => {
    expect(fmtPct(null)).toBe("—");
  });

  it("handles zero", () => {
    expect(fmtPct(0)).toBe("0.00%");
  });

  it("handles 100%", () => {
    expect(fmtPct(1)).toBe("100.00%");
  });

  it("handles values over 100%", () => {
    expect(fmtPct(1.5)).toBe("150.00%");
  });
});
