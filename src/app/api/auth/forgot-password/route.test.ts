import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies before importing the module
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: () => ({ success: true, remaining: 10 }),
}));

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
  },
}));

vi.mock("@/db/schema", () => ({
  users: { email: "email" },
  passwordResetTokens: { token: "token" },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((col, val) => ({ col, val })),
}));

vi.mock("@/lib/email", () => ({
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
}));

import { POST } from "./route";
import { db } from "@/db";
import { sendPasswordResetEmail } from "@/lib/email";

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost:3000/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/forgot-password", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: no user found
    const selectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    };
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue(selectChain);
    (db.insert as ReturnType<typeof vi.fn>).mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    });
  });

  it("returns 400 if email is missing", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeTruthy();
  });

  it("returns 400 if email is invalid format", async () => {
    const res = await POST(makeRequest({ email: "not-an-email" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid email address");
  });

  it("returns 200 even if user is not found (anti-enumeration)", async () => {
    const res = await POST(makeRequest({ email: "unknown@example.com" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.message).toContain("If an account");
    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it("sends email and returns 200 when user exists", async () => {
    const selectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: "user-123", email: "test@example.com" }]),
    };
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue(selectChain);

    const res = await POST(makeRequest({ email: "test@example.com" }));
    expect(res.status).toBe(200);
    expect(sendPasswordResetEmail).toHaveBeenCalledWith("test@example.com", expect.any(String));
    expect(db.insert).toHaveBeenCalled();
  });

  it("returns 500 on unexpected error", async () => {
    (db.select as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error("DB connection failed");
    });

    const res = await POST(makeRequest({ email: "test@example.com" }));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("Something went wrong");
  });
});
