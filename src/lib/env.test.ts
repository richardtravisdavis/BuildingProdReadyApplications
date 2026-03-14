import { describe, it, expect, vi, beforeEach } from "vitest";

describe("env validation", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("exports env object when all vars are present", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://test");
    vi.stubEnv("BETTER_AUTH_SECRET", "secret123");
    vi.stubEnv("BETTER_AUTH_URL", "http://localhost:3000");
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    vi.stubEnv("EMAIL_FROM", "onboarding@resend.dev");

    const { env } = await import("./env");
    expect(env.DATABASE_URL).toBe("postgresql://test");
    expect(env.BETTER_AUTH_SECRET).toBe("secret123");
    expect(env.BETTER_AUTH_URL).toBe("http://localhost:3000");
    expect(env.RESEND_API_KEY).toBe("re_test_key");
    expect(env.EMAIL_FROM).toBe("onboarding@resend.dev");

    vi.unstubAllEnvs();
  });

  it("throws when DATABASE_URL is missing", async () => {
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("BETTER_AUTH_SECRET", "secret123");
    vi.stubEnv("BETTER_AUTH_URL", "http://localhost:3000");
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    vi.stubEnv("EMAIL_FROM", "onboarding@resend.dev");

    await expect(import("./env")).rejects.toThrow("Missing required environment variable: DATABASE_URL");

    vi.unstubAllEnvs();
  });

  it("throws when BETTER_AUTH_SECRET is missing", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://test");
    vi.stubEnv("BETTER_AUTH_SECRET", "");
    vi.stubEnv("BETTER_AUTH_URL", "http://localhost:3000");
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    vi.stubEnv("EMAIL_FROM", "onboarding@resend.dev");

    await expect(import("./env")).rejects.toThrow("Missing required environment variable: BETTER_AUTH_SECRET");

    vi.unstubAllEnvs();
  });
});
