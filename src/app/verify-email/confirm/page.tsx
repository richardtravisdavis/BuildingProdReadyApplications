"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import AuthLayout from "@/components/auth-layout";

function VerifyEmailConfirmForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { update } = useSession();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("Invalid verification link. The token is missing.");
      return;
    }

    async function verifyEmail() {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (!res.ok) {
          setStatus("error");
          setError(data.error || "Something went wrong");
          return;
        }

        await update();
        setStatus("success");
      } catch {
        setStatus("error");
        setError("Something went wrong");
      }
    }

    verifyEmail();
  }, [token, update]);

  if (status === "loading") {
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
          Email verified successfully!
        </p>
        <Link
          href="/dashboard"
          className="inline-block bg-[#FC6200] hover:bg-[#FC6200]/90 text-white font-medium py-2 px-6 rounded-md"
        >
          Go to Dashboard
        </Link>
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
