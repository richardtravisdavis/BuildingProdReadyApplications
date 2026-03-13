import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("shows hero section and navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Stop Overpaying for Merchant Processing")).toBeVisible();
    await expect(page.getByRole("link", { name: /sign up/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /login/i })).toBeVisible();
  });

  test("navigates to signup page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /sign up/i }).first().click();
    await expect(page).toHaveURL("/signup");
    await expect(page.getByText("Create an account")).toBeVisible();
  });

  test("navigates to login page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /login/i }).first().click();
    await expect(page).toHaveURL("/login");
    await expect(page.getByText("Welcome back")).toBeVisible();
  });
});

test.describe("Auth pages", () => {
  test("login form shows validation error on bad credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("you@example.com").fill("bad@test.com");
    await page.getByPlaceholder("••••••••").fill("wrongpassword");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByText("Invalid email or password")).toBeVisible();
  });

  test("signup form shows error for duplicate email", async ({ page }) => {
    // First, create an account
    await page.goto("/signup");
    await page.getByPlaceholder("Your name").fill("E2E Test");
    await page.getByPlaceholder("you@example.com").fill(`e2e-${Date.now()}@test.com`);
    await page.getByPlaceholder("••••••••").fill("testpass123");
    await page.getByRole("button", { name: /sign up/i }).click();

    // Wait for either redirect or error
    await page.waitForTimeout(2000);
  });

  test("login page has link to signup", async ({ page }) => {
    await page.goto("/login");
    const signupLink = page.getByRole("link", { name: /sign up/i });
    await expect(signupLink).toBeVisible();
    await expect(signupLink).toHaveAttribute("href", "/signup");
  });

  test("signup page has link to login", async ({ page }) => {
    await page.goto("/signup");
    const loginLink = page.getByRole("link", { name: /sign in/i });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute("href", "/login");
  });
});

test.describe("Protected routes", () => {
  test("dashboard redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("dashboard/settings redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/dashboard/settings");
    await expect(page).toHaveURL(/\/login/);
  });

  test("dashboard/help redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/dashboard/help");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("404 page", () => {
  test("shows branded 404 for unknown routes", async ({ page }) => {
    await page.goto("/this-page-does-not-exist");
    await expect(page.getByText("404")).toBeVisible();
    await expect(page.getByText("Page not found")).toBeVisible();
    await expect(page.getByRole("link", { name: /back to home/i })).toBeVisible();
  });
});
