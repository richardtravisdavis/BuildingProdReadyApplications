import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const pathname = req.nextUrl.pathname;
  const isOnDashboard = pathname.startsWith("/dashboard");
  const isOnAuth = pathname === "/login" || pathname === "/signup" || pathname === "/forgot-password" || pathname === "/reset-password";
  const isOnVerifyEmail = pathname.startsWith("/verify-email");
  const isEmailVerified = !!req.auth?.user?.emailVerified;

  // Dashboard: require login + verified email
  if (isOnDashboard && !isLoggedIn) {
    return Response.redirect(new URL("/login", req.nextUrl));
  }

  if (isOnDashboard && isLoggedIn && !isEmailVerified) {
    return Response.redirect(new URL("/verify-email", req.nextUrl));
  }

  // Auth pages: redirect verified users to dashboard
  if (isOnAuth && isLoggedIn && isEmailVerified) {
    return Response.redirect(new URL("/dashboard", req.nextUrl));
  }

  // Auth pages: redirect unverified users to verify-email (except login-related pages they may need)
  if (isOnAuth && isLoggedIn && !isEmailVerified) {
    return Response.redirect(new URL("/verify-email", req.nextUrl));
  }

  // Verify email pages: require login
  if (isOnVerifyEmail && !isLoggedIn) {
    return Response.redirect(new URL("/login", req.nextUrl));
  }

  // Verify email pages: redirect already-verified users to dashboard
  if (isOnVerifyEmail && isLoggedIn && isEmailVerified) {
    return Response.redirect(new URL("/dashboard", req.nextUrl));
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup", "/forgot-password", "/reset-password", "/verify-email", "/verify-email/confirm"],
};
