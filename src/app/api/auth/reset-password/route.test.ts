import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies before importing the module
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: () => ({ success: true, remaining: 10 }),
}));

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@/db/schema", () => ({
  users: { id: "id", password: "password" },
  passwordResetTokens: { token: "token", usedAt: "usedAt", expiresAt: "expiresAt", id: "id" },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((col, val) => ({ col, val })),
  and: vi.fn((...args: unknown[]) => args),
  isNull: vi.fn((col) => ({ isNull: col })),
  gt: vi.fn((col, val) => ({ gt: col, val })),
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed_new_password"),
  },
}));

import { POST } from "./route";
import { db } from "@/db";
import bcrypt from "bcryptjs";

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost:3000/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/reset-password", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: no valid token found
    const selectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    };
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue(selectChain);

    const updateChain = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue(undefined),
    };
    (db.update as ReturnType<typeof vi.fn>).mockReturnValue(updateChain);
  });

  it("returns 400 if token is missing", async () => {
    const res = await POST(makeRequest({ password: "newpassword123" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeTruthy();
  });

  it("returns 400 if password is too short", async () => {
    const res = await POST(makeRequest({ token: "abc123", password: "short" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Password must be at least 8 characters");
  });

  it("returns 400 if token is invalid or expired", async () => {
    const res = await POST(makeRequest({ token: "invalid-token", password: "newpassword123" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Invalid or expired");
  });

  it("resets password and marks token as used on valid token", async () => {
    const selectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{
        id: "token-123",
        userId: "user-456",
        token: "hashed-token",
        expiresAt: new Date(Date.now() + 3600000),
        usedAt: null,
      }]),
    };
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue(selectChain);

    const setMock = vi.fn().mockReturnThis();
    const whereMock = vi.fn().mockResolvedValue(undefined);
    (db.update as ReturnType<typeof vi.fn>).mockReturnValue({ set: setMock, where: whereMock });

    const res = await POST(makeRequest({ token: "valid-raw-token", password: "newsecurepass" }));

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.message).toBe("Password reset successfully");
    expect(bcrypt.hash).toHaveBeenCalledWith("newsecurepass", 12);
    expect(db.update).toHaveBeenCalled();
  });

  it("returns 500 on unexpected error", async () => {
    (db.select as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error("DB connection failed");
    });

    const res = await POST(makeRequest({ token: "some-token", password: "newpassword123" }));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("Something went wrong");
  });
});
