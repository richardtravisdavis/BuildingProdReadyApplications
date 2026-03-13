import CresoraLogo from "@/components/cresora-logo";
import { type ReactNode } from "react";

export default function AuthLayout({
  brandContent,
  children,
}: {
  brandContent: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#00273B] via-[#003350] to-[#00273B] flex-col items-center justify-center p-12">
        <CresoraLogo size={80} />
        <h2 className="text-3xl font-bold text-white mt-8">Cresora Commerce</h2>
        {brandContent}
      </div>

      {/* Form panel */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 bg-[#003350]">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8 lg:hidden">
            <CresoraLogo size={48} />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
