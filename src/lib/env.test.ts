import { describe, it, expect, vi, beforeEach } from "vitest";

describe("env validation", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("exports env object when all vars are present", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://test");
    vi.stubEnv("AUTH_SECRET", "secret123");

    const { env } = await import("./env");
    expect(env.DATABASE_URL).toBe("postgresql://test");
    expect(env.AUTH_SECRET).toBe("secret123");

    vi.unstubAllEnvs();
  });

  it("throws when DATABASE_URL is missing", async () => {
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("AUTH_SECRET", "secret123");

    await expect(import("./env")).rejects.toThrow("Missing required environment variable: DATABASE_URL");

    vi.unstubAllEnvs();
  });

  it("throws when AUTH_SECRET is missing", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://test");
    vi.stubEnv("AUTH_SECRET", "");

    await expect(import("./env")).rejects.toThrow("Missing required environment variable: AUTH_SECRET");

    vi.unstubAllEnvs();
  });
});
