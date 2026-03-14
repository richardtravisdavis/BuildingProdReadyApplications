"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import AuthLayout from "@/components/auth-layout";

function VerifyEmailConfirmForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const hasVerified = useRef(false);

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || hasVerified.current) return;
    hasVerified.current = true;

    async function verifyEmail() {
      setStatus("loading");
      const { error } = await authClient.verifyEmail({
        query: { token: token! },
      });

      if (error) {
        setStatus("error");
        setError(error.message ?? "Invalid or expired verification link.");
        return;
      }

      setStatus("success");
      window.location.href = "/dashboard";
    }

    verifyEmail();
  }, [token]);

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-red-400 bg-red-400/10 rounded-lg py-3 px-4">
          Invalid verification link. The token is missing.
        </p>
        <Link href="/verify-email" className="text-[#FC6200] hover:text-[#FC6200]/80 underline text-sm">
          Resend verification email
        </Link>
      </div>
    );
  }

  if (status === "idle" || status === "loading") {
    return (
      <div className="text-center space-y-4">
        <p className="text-gray-400">Verifying your email...</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="text-center space-y-4">
        <p className="text-green-400 bg-green-400/10 rounded-lg py-3 px-4">
          Email verified successfully! Redirecting...
        </p>
      </div>
    );
  }

  return (
    <div className="text-center space-y-4">
      <p className="text-red-400 bg-red-400/10 rounded-lg py-3 px-4">
        {error}
      </p>
      <Link href="/verify-email" className="text-[#FC6200] hover:text-[#FC6200]/80 underline text-sm">
        Resend verification email
      </Link>
    </div>
  );
}

export default function VerifyEmailConfirmPage() {
  return (
    <AuthLayout
      brandContent={
        <p className="text-[#68DDDC] mt-4 text-center max-w-md text-lg">
          Almost there — confirming your email address.
        </p>
      }
    >
      <h2 className="text-2xl font-bold text-white text-center">Email Verification</h2>
      <p className="text-gray-400 text-center mt-2 mb-8">Confirming your email address</p>

      <Suspense>
        <VerifyEmailConfirmForm />
      </Suspense>
    </AuthLayout>
  );
}
