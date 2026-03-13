import type { Metadata } from "next";
import { auth, signOut } from "@/lib/auth";
import DashboardSidebar from "@/components/dashboard-sidebar";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <div className="min-h-screen bg-[#00273B] flex">
      <DashboardSidebar
        userName={session?.user?.name}
        signOutAction={signOutAction}
      />
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
}
