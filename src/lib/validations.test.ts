import { describe, it, expect } from "vitest";
import { signupSchema, profileSchema, passwordSchema } from "./validations";

describe("signupSchema", () => {
  it("accepts valid signup data", () => {
    const result = signupSchema.safeParse({ email: "test@test.com", password: "password123" });
    expect(result.success).toBe(true);
  });

  it("accepts signup with optional name", () => {
    const result = signupSchema.safeParse({ name: "Travis", email: "test@test.com", password: "password123" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = signupSchema.safeParse({ email: "notanemail", password: "password123" });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = signupSchema.safeParse({ email: "test@test.com", password: "short" });
    expect(result.success).toBe(false);
  });

  it("rejects password over 128 chars", () => {
    const result = signupSchema.safeParse({ email: "test@test.com", password: "a".repeat(129) });
    expect(result.success).toBe(false);
  });
});

describe("profileSchema", () => {
  it("accepts valid name", () => {
    const result = profileSchema.safeParse({ name: "Travis" });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = profileSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects name over 100 chars", () => {
    const result = profileSchema.safeParse({ name: "a".repeat(101) });
    expect(result.success).toBe(false);
  });

  it("trims whitespace from name", () => {
    const result = profileSchema.safeParse({ name: "  Travis  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Travis");
    }
  });
});

describe("passwordSchema", () => {
  it("accepts valid password change", () => {
    const result = passwordSchema.safeParse({ currentPassword: "oldpass123", newPassword: "newpass123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty current password", () => {
    const result = passwordSchema.safeParse({ currentPassword: "", newPassword: "newpass123" });
    expect(result.success).toBe(false);
  });

  it("rejects short new password", () => {
    const result = passwordSchema.safeParse({ currentPassword: "oldpass123", newPassword: "short" });
    expect(result.success).toBe(false);
  });
});
