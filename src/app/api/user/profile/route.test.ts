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
    update: vi.fn(),
  },
}));

vi.mock("@/db/schema", () => ({
  users: { id: "id" },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((col, val) => ({ col, val })),
}));

import { PATCH } from "./route";
import { db } from "@/db";

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost:3000/api/user/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("PATCH /api/user/profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ user: { id: "user-1", name: "Travis", email: "t@test.com" } });

    const updateChain = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue(undefined),
    };
    (db.update as ReturnType<typeof vi.fn>).mockReturnValue(updateChain);
  });

  it("returns 401 if not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await PATCH(makeRequest({ name: "New Name" }));
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 400 if name is empty", async () => {
    const res = await PATCH(makeRequest({ name: "" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeTruthy();
  });

  it("returns 400 if name is missing", async () => {
    const res = await PATCH(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it("updates profile and returns success", async () => {
    const setMock = vi.fn().mockReturnThis();
    const whereMock = vi.fn().mockResolvedValue(undefined);
    (db.update as ReturnType<typeof vi.fn>).mockReturnValue({
      set: setMock,
      where: whereMock,
    });

    const res = await PATCH(makeRequest({ name: "New Name" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.message).toBe("Profile updated");
    expect(setMock).toHaveBeenCalledWith({ name: "New Name" });
  });

  it("trims whitespace from name", async () => {
    const setMock = vi.fn().mockReturnThis();
    (db.update as ReturnType<typeof vi.fn>).mockReturnValue({
      set: setMock,
      where: vi.fn().mockResolvedValue(undefined),
    });

    const res = await PATCH(makeRequest({ name: "  Travis  " }));
    expect(res.status).toBe(200);
    expect(setMock).toHaveBeenCalledWith({ name: "Travis" });
  });

  it("returns 500 on unexpected error", async () => {
    (db.update as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error("DB error");
    });

    const res = await PATCH(makeRequest({ name: "Test" }));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("Something went wrong");
  });
});
