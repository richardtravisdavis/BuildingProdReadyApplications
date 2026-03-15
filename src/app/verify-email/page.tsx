"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import AuthLayout from "@/components/auth-layout";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleResend() {
    if (!email) return;
    setStatus("loading");
    setMessage("");

    const { error } = await authClient.sendVerificationEmail({
      email,
      callbackURL: "/dashboard",
    });

    if (error) {
      setStatus("error");
      setMessage(error.message ?? "Something went wrong");
      return;
    }

    setStatus("success");
    setMessage("Verification email sent! Check your inbox.");
  }

  return (
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

      {email ? (
        <Button
          onClick={handleResend}
          disabled={status === "loading"}
          className="w-full bg-[#FC6200] hover:bg-[#FC6200]/90 text-white h-11 text-base"
        >
          {status === "loading" ? "Sending..." : "Resend verification email"}
        </Button>
      ) : (
        <p className="text-gray-400 text-sm">
          No email address provided.{" "}
          <Link href="/login" className="text-[#FC6200] hover:text-[#FC6200]/80 underline">
            Back to login
          </Link>
        </p>
      )}

      <Link
        href="/login"
        className="block text-sm text-gray-400 hover:text-gray-300 underline"
      >
        Back to login
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthLayout
      brandContent={
        <p className="text-[#68DDDC] mt-4 text-center max-w-md text-lg">
          One last step — verify your email to access the ROI Calculator.
        </p>
      }
    >
      <Suspense>
        <VerifyEmailContent />
      </Suspense>
    </AuthLayout>
  );
}
