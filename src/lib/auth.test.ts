import { describe, it, expect, vi, beforeEach } from "vitest";

// Track what the authorize function receives
let mockDbResult: unknown[] = [];
let mockBcryptResult = false;

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockImplementation(() => Promise.resolve(mockDbResult)),
    })),
  },
}));

vi.mock("@/db/schema", () => ({
  users: { email: "email" },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(() => Promise.resolve(mockBcryptResult)),
  },
}));

// Mock NextAuth to capture the config and extract the authorize function + callbacks
let capturedAuthorize: (credentials: Record<string, unknown>) => Promise<unknown>;
let capturedCallbacks: {
  jwt: (params: { token: Record<string, unknown>; user?: { id?: string } }) => Promise<Record<string, unknown>>;
  session: (params: { session: { user: Record<string, unknown> }; token: Record<string, unknown> }) => Promise<{ user: Record<string, unknown> }>;
};

vi.mock("next-auth", () => ({
  default: vi.fn((config: {
    providers: Array<{ options?: { authorize?: (creds: Record<string, unknown>) => Promise<unknown> } }>;
    callbacks?: {
      jwt: (params: { token: Record<string, unknown>; user?: { id?: string } }) => Promise<Record<string, unknown>>;
      session: (params: { session: { user: Record<string, unknown> }; token: Record<string, unknown> }) => Promise<{ user: Record<string, unknown> }>;
    };
  }) => {
    const credProvider = config.providers[0];
    if (credProvider?.options?.authorize) {
      capturedAuthorize = credProvider.options.authorize;
    }
    if (config.callbacks) {
      capturedCallbacks = config.callbacks;
    }
    return {
      handlers: {},
      signIn: vi.fn(),
      signOut: vi.fn(),
      auth: vi.fn(),
    };
  }),
}));

vi.mock("next-auth/providers/credentials", () => ({
  default: vi.fn((config: { authorize: (creds: Record<string, unknown>) => Promise<unknown> }) => ({
    options: { authorize: config.authorize },
  })),
}));

// Import to trigger the mock setup
await import("@/lib/auth");

describe("authorize (credentials provider)", () => {
  beforeEach(() => {
    mockDbResult = [];
    mockBcryptResult = false;
  });

  it("returns null if email is missing", async () => {
    const result = await capturedAuthorize({ email: "", password: "pass" });
    expect(result).toBeNull();
  });

  it("returns null if password is missing", async () => {
    const result = await capturedAuthorize({ email: "test@test.com", password: "" });
    expect(result).toBeNull();
  });

  it("returns null if user not found", async () => {
    mockDbResult = [];
    const result = await capturedAuthorize({
      email: "nobody@test.com",
      password: "pass",
    });
    expect(result).toBeNull();
  });

  it("returns null if user has no password (e.g. OAuth account)", async () => {
    mockDbResult = [{ id: "1", name: "Test", email: "test@test.com", password: null }];
    const result = await capturedAuthorize({
      email: "test@test.com",
      password: "pass",
    });
    expect(result).toBeNull();
  });

  it("returns null if password is invalid", async () => {
    mockDbResult = [{ id: "1", name: "Test", email: "test@test.com", password: "hashed" }];
    mockBcryptResult = false;
    const result = await capturedAuthorize({
      email: "test@test.com",
      password: "wrongpass",
    });
    expect(result).toBeNull();
  });

  it("returns user object on valid credentials", async () => {
    mockDbResult = [
      { id: "uuid-123", name: "Travis", email: "travis@test.com", password: "hashed" },
    ];
    mockBcryptResult = true;
    const result = await capturedAuthorize({
      email: "travis@test.com",
      password: "correctpass",
    });
    expect(result).toEqual({
      id: "uuid-123",
      name: "Travis",
      email: "travis@test.com",
    });
  });
});

describe("jwt callback", () => {
  it("adds user id to token on initial sign-in", async () => {
    const token = { sub: "test" };
    const user = { id: "uuid-123" };
    const result = await capturedCallbacks.jwt({ token, user });
    expect(result.id).toBe("uuid-123");
  });

  it("returns token unchanged on subsequent requests (no user)", async () => {
    const token = { sub: "test", id: "uuid-123" };
    const result = await capturedCallbacks.jwt({ token });
    expect(result).toEqual(token);
  });
});

describe("session callback", () => {
  it("adds token id to session user", async () => {
    const session = { user: { name: "Travis", email: "t@t.com" } };
    const token = { id: "uuid-123" };
    const result = await capturedCallbacks.session({ session, token });
    expect(result.user.id).toBe("uuid-123");
  });

  it("returns session unchanged when token has no id", async () => {
    const session = { user: { name: "Travis", email: "t@t.com" } };
    const token = {};
    const result = await capturedCallbacks.session({ session, token });
    expect(result.user.id).toBeUndefined();
  });
});
