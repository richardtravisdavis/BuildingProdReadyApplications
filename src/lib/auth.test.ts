import { describe, it, expect, vi } from "vitest";

// Mock all heavy dependencies so the module can load in test
vi.mock("better-auth", () => ({
  betterAuth: vi.fn(() => ({
    api: {
      getSession: vi.fn(),
      signOut: vi.fn(),
    },
    handler: vi.fn(),
  })),
}));

vi.mock("better-auth/adapters/drizzle", () => ({
  drizzleAdapter: vi.fn(),
}));

vi.mock("better-auth/next-js", () => ({
  nextCookies: vi.fn(() => ({})),
}));

vi.mock("@/db", () => ({
  db: {},
}));

vi.mock("resend", () => ({
  Resend: vi.fn(() => ({
    emails: { send: vi.fn() },
  })),
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}));

describe("auth module", () => {
  it("exports an auth object with api methods", async () => {
    const { auth } = await import("./auth");
    expect(auth).toBeDefined();
    expect(auth.api).toBeDefined();
    expect(auth.api.getSession).toBeDefined();
  });
});
