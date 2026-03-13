import { describe, it, expect, vi, beforeEach } from "vitest";

describe("env validation", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("exports env object when all vars are present", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://test");
    vi.stubEnv("AUTH_SECRET", "secret123");
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    vi.stubEnv("APP_URL", "http://localhost:3000");

    const { env } = await import("./env");
    expect(env.DATABASE_URL).toBe("postgresql://test");
    expect(env.AUTH_SECRET).toBe("secret123");
    expect(env.RESEND_API_KEY).toBe("re_test_key");
    expect(env.APP_URL).toBe("http://localhost:3000");

    vi.unstubAllEnvs();
  });

  it("throws when DATABASE_URL is missing", async () => {
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("AUTH_SECRET", "secret123");
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    vi.stubEnv("APP_URL", "http://localhost:3000");

    await expect(import("./env")).rejects.toThrow("Missing required environment variable: DATABASE_URL");

    vi.unstubAllEnvs();
  });

  it("throws when AUTH_SECRET is missing", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://test");
    vi.stubEnv("AUTH_SECRET", "");
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    vi.stubEnv("APP_URL", "http://localhost:3000");

    await expect(import("./env")).rejects.toThrow("Missing required environment variable: AUTH_SECRET");

    vi.unstubAllEnvs();
  });
});
