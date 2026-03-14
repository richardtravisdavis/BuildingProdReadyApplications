import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const pathname = request.nextUrl.pathname;
  const isOnDashboard = pathname.startsWith("/dashboard");
  const isOnAuth = ["/login", "/signup", "/forgot-password", "/reset-password"].includes(pathname);
  const isOnVerifyEmail = pathname.startsWith("/verify-email");

  if (isOnDashboard && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isOnDashboard && session && !session.user.emailVerified) {
    return NextResponse.redirect(new URL("/verify-email", request.url));
  }

  if (isOnAuth && session?.user.emailVerified) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isOnAuth && session && !session.user.emailVerified) {
    return NextResponse.redirect(new URL("/verify-email", request.url));
  }

  if (isOnVerifyEmail && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isOnVerifyEmail && session?.user.emailVerified) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup", "/forgot-password", "/reset-password", "/verify-email", "/verify-email/confirm"],
};
