"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import AuthLayout from "@/components/auth-layout";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleResend() {
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Something went wrong");
        return;
      }

      setStatus("success");
      setMessage("Verification email sent! Check your inbox.");
    } catch {
      setStatus("error");
      setMessage("Something went wrong");
    }
  }

  return (
    <AuthLayout
      brandContent={
        <p className="text-[#68DDDC] mt-4 text-center max-w-md text-lg">
          One last step — verify your email to access the ROI Calculator.
        </p>
      }
    >
      <div className="text-center space-y-6">
        <h2 className="text-2xl font-bold text-white">Verify your email</h2>
        <p className="text-gray-400">
          We sent a verification link to your email address. Please check your inbox and click the link to verify your account.
        </p>

        {status === "success" && (
          <p role="alert" aria-live="polite" className="text-sm text-green-400 bg-green-400/10 rounded-lg py-2">
            {message}
          </p>
        )}

        {status === "error" && (
          <p role="alert" aria-live="polite" className="text-sm text-red-400 bg-red-400/10 rounded-lg py-2">
            {message}
          </p>
        )}

        <Button
          onClick={handleResend}
          disabled={status === "loading"}
          className="w-full bg-[#FC6200] hover:bg-[#FC6200]/90 text-white h-11 text-base"
        >
          {status === "loading" ? "Sending..." : "Resend verification email"}
        </Button>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-sm text-gray-400 hover:text-gray-300 underline"
        >
          Sign out
        </button>
      </div>
    </AuthLayout>
  );
}
