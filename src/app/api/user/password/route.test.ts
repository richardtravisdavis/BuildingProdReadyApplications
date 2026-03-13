import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: () => ({ success: true, remaining: 10 }),
}));

const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({
  auth: () => mockAuth(),
}));

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@/db/schema", () => ({
  users: { id: "id" },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((col, val) => ({ col, val })),
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn().mockResolvedValue("new_hashed_password"),
  },
}));

import { PATCH } from "./route";
import { db } from "@/db";
import bcrypt from "bcryptjs";

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost:3000/api/user/password", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("PATCH /api/user/password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ user: { id: "user-1", name: "Travis", email: "t@test.com" } });

    const selectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: "user-1", password: "old_hash" }]),
    };
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue(selectChain);

    const updateChain = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue(undefined),
    };
    (db.update as ReturnType<typeof vi.fn>).mockReturnValue(updateChain);

    (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(true);
  });

  it("returns 401 if not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await PATCH(makeRequest({ currentPassword: "old", newPassword: "newpass123" }));
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 400 if currentPassword is missing", async () => {
    const res = await PATCH(makeRequest({ newPassword: "newpass123" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 if newPassword is missing", async () => {
    const res = await PATCH(makeRequest({ currentPassword: "oldpass" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 if newPassword is too short", async () => {
    const res = await PATCH(makeRequest({ currentPassword: "oldpass", newPassword: "short" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("New password must be at least 8 characters");
  });

  it("returns 404 if user not found in database", async () => {
    const selectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    };
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue(selectChain);

    const res = await PATCH(makeRequest({ currentPassword: "oldpass", newPassword: "newpass123" }));
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBe("User not found");
  });

  it("returns 403 if current password is incorrect", async () => {
    (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(false);

    const res = await PATCH(makeRequest({ currentPassword: "wrong", newPassword: "newpass123" }));
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toBe("Current password is incorrect");
  });

  it("changes password and returns success", async () => {
    const setMock = vi.fn().mockReturnThis();
    const whereMock = vi.fn().mockResolvedValue(undefined);
    (db.update as ReturnType<typeof vi.fn>).mockReturnValue({
      set: setMock,
      where: whereMock,
    });

    const res = await PATCH(makeRequest({ currentPassword: "oldpass", newPassword: "newpass123" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.message).toBe("Password changed");
    expect(bcrypt.compare).toHaveBeenCalledWith("oldpass", "old_hash");
    expect(bcrypt.hash).toHaveBeenCalledWith("newpass123", 12);
    expect(setMock).toHaveBeenCalledWith({ password: "new_hashed_password" });
  });

  it("returns 500 on unexpected error", async () => {
    (db.select as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error("DB error");
    });

    const res = await PATCH(makeRequest({ currentPassword: "old", newPassword: "newpass123" }));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("Something went wrong");
  });
});
