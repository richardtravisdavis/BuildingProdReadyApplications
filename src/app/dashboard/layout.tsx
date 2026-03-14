import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import DashboardSidebar from "@/components/dashboard-sidebar";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  async function signOutAction() {
    "use server";
    const { auth: serverAuth } = await import("@/lib/auth");
    const { headers: getHeaders } = await import("next/headers");
    const hdrs = await getHeaders();
    // Get the session to revoke it
    const currentSession = await serverAuth.api.getSession({ headers: hdrs });
    if (currentSession) {
      // Revoke the session by calling the sign-out endpoint
      await serverAuth.api.signOut({ headers: hdrs });
    }
    const { redirect } = await import("next/navigation");
    redirect("/");
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
