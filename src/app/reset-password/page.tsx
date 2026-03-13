"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/components/auth-layout";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  return (
    <AuthLayout
      brandContent={
        <p className="text-[#68DDDC] mt-4 text-center max-w-md text-lg">
          Choose a strong password to keep your account secure.
        </p>
      }
    >
      <h2 className="text-2xl font-bold text-white text-center">Reset your password</h2>
      <p className="text-gray-400 text-center mt-2 mb-8">Enter your new password below</p>

      {success ? (
        <div className="text-center space-y-4">
          <p className="text-green-400 bg-green-400/10 rounded-lg py-3 px-4">
            Your password has been reset successfully.
          </p>
          <Link href="/login" className="text-[#FC6200] hover:text-[#FC6200]/80 underline text-sm">
            Back to login
          </Link>
        </div>
      ) : !token ? (
        <div className="text-center space-y-4">
          <p className="text-red-400 bg-red-400/10 rounded-lg py-3 px-4">
            Invalid reset link. The token is missing.
          </p>
          <Link href="/forgot-password" className="text-[#FC6200] hover:text-[#FC6200]/80 underline text-sm">
            Request a new link
          </Link>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <p role="alert" aria-live="polite" className="text-sm text-red-400 text-center bg-red-400/10 rounded-lg py-2">
                {error}
                {error.includes("expired") && (
                  <>
                    {" "}
                    <Link href="/forgot-password" className="underline">Request a new link</Link>
                  </>
                )}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">New password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                minLength={8}
                className="bg-[#00273B] border-[#00273B]/60 text-white placeholder:text-gray-500 focus:border-[#FC6200] focus:ring-[#FC6200]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-300">Confirm password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
                minLength={8}
                className="bg-[#00273B] border-[#00273B]/60 text-white placeholder:text-gray-500 focus:border-[#FC6200] focus:ring-[#FC6200]"
              />
            </div>
            <Button type="submit" className="w-full bg-[#FC6200] hover:bg-[#FC6200]/90 text-white h-11 text-base" disabled={loading}>
              {loading ? "Resetting..." : "Reset password"}
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
