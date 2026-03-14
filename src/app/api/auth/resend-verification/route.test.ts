import { describe, it, expect, vi, beforeEach } from "vitest";

const mockAuth = vi.fn();

vi.mock("@/lib/auth", () => ({
  auth: () => mockAuth(),
}));

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
  users: { id: "id", email: "email", emailVerified: "emailVerified" },
  emailVerificationTokens: {},
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((col, val) => ({ col, val })),
}));

vi.mock("@/lib/email", () => ({
  sendVerificationEmail: vi.fn().mockResolvedValue(undefined),
}));

import { POST } from "./route";
import { db } from "@/db";
import { sendVerificationEmail } from "@/lib/email";

describe("POST /api/auth/resend-verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockAuth.mockResolvedValue({
      user: { id: "user-123", email: "test@example.com" },
    });

    const selectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{
        id: "user-123",
        email: "test@example.com",
        emailVerified: null,
      }]),
    };
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue(selectChain);

    const insertChain = {
      values: vi.fn().mockResolvedValue(undefined),
    };
    (db.insert as ReturnType<typeof vi.fn>).mockReturnValue(insertChain);
  });

  it("returns 401 if not authenticated", async () => {
    mockAuth.mockResolvedValue(null);

    const res = await POST();
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Authentication required");
  });

  it("returns 400 if email is already verified", async () => {
    const selectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{
        id: "user-123",
        email: "test@example.com",
        emailVerified: new Date(),
      }]),
    };
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue(selectChain);

    const res = await POST();
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Email is already verified");
  });

  it("sends verification email on success", async () => {
    const res = await POST();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.message).toBe("Verification email sent");
    expect(sendVerificationEmail).toHaveBeenCalledWith("test@example.com", expect.any(String));
    expect(db.insert).toHaveBeenCalled();
  });

  it("returns 500 on unexpected error", async () => {
    (db.select as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error("DB connection failed");
    });

    const res = await POST();
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("Something went wrong");
  });
});
