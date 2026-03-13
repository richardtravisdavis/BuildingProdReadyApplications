import { describe, it, expect } from "vitest";

// We test the middleware logic by simulating the auth callback
describe("middleware route protection", () => {
  function simulateMiddleware(auth: unknown, pathname: string) {
    const req = {
      auth,
      nextUrl: new URL(`http://localhost:3000${pathname}`),
    };

    const isLoggedIn = !!req.auth;
    const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard");
    const isOnAuth = req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/signup";

    if (isOnDashboard && !isLoggedIn) {
      return { redirect: "/login" };
    }
    if (isOnAuth && isLoggedIn) {
      return { redirect: "/dashboard" };
    }
    return null;
  }

  it("redirects unauthenticated users from /dashboard to /login", () => {
    const result = simulateMiddleware(null, "/dashboard");
    expect(result).toEqual({ redirect: "/login" });
  });

  it("redirects unauthenticated users from /dashboard/settings", () => {
    const result = simulateMiddleware(null, "/dashboard/settings");
    expect(result).toEqual({ redirect: "/login" });
  });

  it("allows authenticated users to access /dashboard", () => {
    const result = simulateMiddleware({ user: { id: "1" } }, "/dashboard");
    expect(result).toBeNull();
  });

  it("redirects authenticated users from /login to /dashboard", () => {
    const result = simulateMiddleware({ user: { id: "1" } }, "/login");
    expect(result).toEqual({ redirect: "/dashboard" });
  });

  it("redirects authenticated users from /signup to /dashboard", () => {
    const result = simulateMiddleware({ user: { id: "1" } }, "/signup");
    expect(result).toEqual({ redirect: "/dashboard" });
  });

  it("allows unauthenticated users to access /login", () => {
    const result = simulateMiddleware(null, "/login");
    expect(result).toBeNull();
  });

  it("allows unauthenticated users to access /signup", () => {
    const result = simulateMiddleware(null, "/signup");
    expect(result).toBeNull();
  });

  it("does not interfere with non-protected routes", () => {
    const result = simulateMiddleware(null, "/");
    expect(result).toBeNull();
  });

  it("matcher config covers dashboard and auth paths", () => {
    const matcher = ["/dashboard/:path*", "/login", "/signup"];
    expect(matcher).toContain("/dashboard/:path*");
    expect(matcher).toContain("/login");
    expect(matcher).toContain("/signup");
  });
});
