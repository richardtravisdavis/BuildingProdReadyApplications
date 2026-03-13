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
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((col, val) => ({ col, val })),
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed_password_123"),
  },
}));

import { POST } from "./route";
import { db } from "@/db";
import bcrypt from "bcryptjs";

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost:3000/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/signup", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: no existing user, insert succeeds
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
    const res = await POST(makeRequest({ password: "12345678" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeTruthy();
  });

  it("returns 400 if password is missing", async () => {
    const res = await POST(makeRequest({ email: "test@example.com" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeTruthy();
  });

  it("returns 400 if email is invalid format", async () => {
    const res = await POST(makeRequest({ email: "not-an-email", password: "12345678" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid email address");
  });

  it("returns 400 if password is too short", async () => {
    const res = await POST(makeRequest({ email: "test@example.com", password: "short" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Password must be at least 8 characters");
  });

  it("returns 409 if user already exists", async () => {
    const selectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: "1", email: "test@example.com" }]),
    };
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue(selectChain);

    const res = await POST(
      makeRequest({ email: "test@example.com", password: "12345678" })
    );
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error).toBe("An account with this email already exists");
  });

  it("creates user with hashed password and returns 201", async () => {
    const valuesMock = vi.fn().mockResolvedValue(undefined);
    (db.insert as ReturnType<typeof vi.fn>).mockReturnValue({ values: valuesMock });

    const res = await POST(
      makeRequest({
        name: "Travis",
        email: "travis@example.com",
        password: "securepass",
      })
    );

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.message).toBe("Account created successfully");
    expect(bcrypt.hash).toHaveBeenCalledWith("securepass", 12);
    expect(valuesMock).toHaveBeenCalledWith({
      name: "Travis",
      email: "travis@example.com",
      password: "hashed_password_123",
    });
  });

  it("sets name to null if not provided", async () => {
    const valuesMock = vi.fn().mockResolvedValue(undefined);
    (db.insert as ReturnType<typeof vi.fn>).mockReturnValue({ values: valuesMock });

    const res = await POST(
      makeRequest({ email: "no-name@example.com", password: "12345678" })
    );

    expect(res.status).toBe(201);
    expect(valuesMock).toHaveBeenCalledWith(
      expect.objectContaining({ name: null })
    );
  });

  it("returns 500 on unexpected error", async () => {
    (db.select as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error("DB connection failed");
    });

    const res = await POST(
      makeRequest({ email: "test@example.com", password: "12345678" })
    );
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("Something went wrong");
  });
});
