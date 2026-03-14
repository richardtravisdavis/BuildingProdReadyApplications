"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/components/auth-layout";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await authClient.signIn.email({
      email,
      password,
    });

    if (error) {
      if (error.status === 403) {
        router.push("/verify-email");
        return;
      }
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <AuthLayout
      brandContent={
        <>
          <p className="text-[#68DDDC] mt-4 text-center max-w-md text-lg">
            Stop overpaying for merchant processing. See how much you could save.
          </p>
        </>
      }
    >
      <h2 className="text-2xl font-bold text-white text-center">Welcome back</h2>
      <p className="text-gray-400 text-center mt-2 mb-8">Sign in to your account</p>

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
        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-300">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            className="bg-[#00273B] border-[#00273B]/60 text-white placeholder:text-gray-500 focus:border-[#FC6200] focus:ring-[#FC6200]"
          />
        </div>
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm text-[#FC6200] hover:text-[#FC6200]/80 underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full bg-[#FC6200] hover:bg-[#FC6200]/90 text-white h-11 text-base" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-400">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-[#FC6200] hover:text-[#FC6200]/80 underline">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}
