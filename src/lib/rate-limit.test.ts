import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { rateLimit } from "./rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows the first request", () => {
    const result = rateLimit("test-1");
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("tracks requests up to the limit", () => {
    for (let i = 0; i < 4; i++) {
      rateLimit("test-2");
    }
    const fifth = rateLimit("test-2");
    expect(fifth.success).toBe(true);
    expect(fifth.remaining).toBe(0);
  });

  it("blocks requests after limit is exceeded", () => {
    for (let i = 0; i < 5; i++) {
      rateLimit("test-3");
    }
    const sixth = rateLimit("test-3");
    expect(sixth.success).toBe(false);
    expect(sixth.remaining).toBe(0);
  });

  it("resets after the time window expires", () => {
    for (let i = 0; i < 5; i++) {
      rateLimit("test-4");
    }
    expect(rateLimit("test-4").success).toBe(false);

    // Advance past the default 60s window
    vi.advanceTimersByTime(61_000);

    const result = rateLimit("test-4");
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("respects custom maxRequests", () => {
    const r1 = rateLimit("test-5", { maxRequests: 2 });
    expect(r1.success).toBe(true);
    const r2 = rateLimit("test-5", { maxRequests: 2 });
    expect(r2.success).toBe(true);
    const r3 = rateLimit("test-5", { maxRequests: 2 });
    expect(r3.success).toBe(false);
  });

  it("respects custom windowMs", () => {
    for (let i = 0; i < 5; i++) {
      rateLimit("test-6", { windowMs: 5000 });
    }
    expect(rateLimit("test-6", { windowMs: 5000 }).success).toBe(false);

    vi.advanceTimersByTime(6000);
    expect(rateLimit("test-6", { windowMs: 5000 }).success).toBe(true);
  });

  it("isolates keys from each other", () => {
    for (let i = 0; i < 5; i++) {
      rateLimit("key-a");
    }
    expect(rateLimit("key-a").success).toBe(false);
    expect(rateLimit("key-b").success).toBe(true);
  });
});
