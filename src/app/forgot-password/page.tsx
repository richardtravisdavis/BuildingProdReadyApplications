"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/components/auth-layout";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
  }

  return (
    <AuthLayout
      brandContent={
        <p className="text-[#68DDDC] mt-4 text-center max-w-md text-lg">
          Don&apos;t worry, it happens to the best of us. We&apos;ll help you get back in.
        </p>
      }
    >
      <h2 className="text-2xl font-bold text-white text-center">Forgot your password?</h2>
      <p className="text-gray-400 text-center mt-2 mb-8">
        Enter your email and we&apos;ll send you a reset link
      </p>

      {submitted ? (
        <div className="text-center space-y-4">
          <p className="text-green-400 bg-green-400/10 rounded-lg py-3 px-4">
            If an account with that email exists, we sent a password reset link. Check your inbox.
          </p>
          <Link href="/login" className="text-[#FC6200] hover:text-[#FC6200]/80 underline text-sm">
            Back to login
          </Link>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <p role="alert" aria-live="polite" className="text-sm text-red-400 text-center bg-red-400/10 rounded-lg py-2">{error}</p>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="bg-[#00273B] border-[#00273B]/60 text-white placeholder:text-gray-500 focus:border-[#FC6200] focus:ring-[#FC6200]"
              />
            </div>
            <Button type="submit" className="w-full bg-[#FC6200] hover:bg-[#FC6200]/90 text-white h-11 text-base" disabled={loading}>
              {loading ? "Sending..." : "Send reset link"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-400">
            Remember your password?{" "}
            <Link href="/login" className="text-[#FC6200] hover:text-[#FC6200]/80 underline">
              Sign in
            </Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
}
