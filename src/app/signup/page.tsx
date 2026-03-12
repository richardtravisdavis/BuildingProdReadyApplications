"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CresoraLogo from "@/components/cresora-logo";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    // Auto sign-in after signup
    const { signIn } = await import("next-auth/react");
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      router.push("/login");
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
          Get started with the ROI Calculator and discover how much you could save on merchant processing.
        </p>
        <div className="mt-12 space-y-4 max-w-sm">
          <div className="flex items-center gap-3 text-gray-300">
            <div className="w-8 h-8 rounded-full bg-[#FC6200]/20 flex items-center justify-center text-[#FC6200] text-sm font-bold">1</div>
            <span>Create your free account</span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <div className="w-8 h-8 rounded-full bg-[#68DDDC]/20 flex items-center justify-center text-[#68DDDC] text-sm font-bold">2</div>
            <span>Enter your current processing details</span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <div className="w-8 h-8 rounded-full bg-[#FFA622]/20 flex items-center justify-center text-[#FFA622] text-sm font-bold">3</div>
            <span>See your personalized savings report</span>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 bg-[#003350]">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8 lg:hidden">
            <CresoraLogo size={48} />
          </div>
          <h2 className="text-2xl font-bold text-white text-center">Create an account</h2>
          <p className="text-gray-400 text-center mt-2 mb-8">Get started with the ROI Calculator</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <p className="text-sm text-red-400 text-center bg-red-400/10 rounded-lg py-2">{error}</p>
            )}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Your name"
                className="bg-[#00273B] border-[#00273B]/60 text-white placeholder:text-gray-500 focus:border-[#FC6200] focus:ring-[#FC6200]"
              />
            </div>
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
                minLength={8}
                className="bg-[#00273B] border-[#00273B]/60 text-white placeholder:text-gray-500 focus:border-[#FC6200] focus:ring-[#FC6200]"
              />
            </div>
            <Button type="submit" className="w-full bg-[#FC6200] hover:bg-[#FC6200]/90 text-white h-11 text-base" disabled={loading}>
              {loading ? "Creating account..." : "Sign up"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="text-[#FC6200] hover:text-[#FC6200]/80 underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
