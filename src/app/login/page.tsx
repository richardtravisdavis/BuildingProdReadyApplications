"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CresoraLogo from "@/components/cresora-logo";

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

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#00273B] via-[#003350] to-[#00273B] flex-col items-center justify-center p-12">
        <CresoraLogo size={80} />
        <h2 className="text-3xl font-bold text-white mt-8">Cresora Commerce</h2>
        <p className="text-[#68DDDC] mt-4 text-center max-w-md text-lg">
          Stop overpaying for merchant processing. See how much you could save.
        </p>
        <div className="mt-12 grid grid-cols-3 gap-6 text-center max-w-sm">
          <div>
            <div className="text-2xl font-bold text-[#FC6200]">50+</div>
            <div className="text-xs text-gray-400 mt-1">ISV Partners</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#68DDDC]">$2.1B</div>
            <div className="text-xs text-gray-400 mt-1">Volume Processed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#FFA622]">38%</div>
            <div className="text-xs text-gray-400 mt-1">Avg Savings</div>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 bg-[#003350]">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8 lg:hidden">
            <CresoraLogo size={48} />
          </div>
          <h2 className="text-2xl font-bold text-white text-center">Welcome back</h2>
          <p className="text-gray-400 text-center mt-2 mb-8">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <p className="text-sm text-red-400 text-center bg-red-400/10 rounded-lg py-2">{error}</p>
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
        </div>
      </div>
    </div>
  );
}
