import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import ROICalculator from "@/components/roi-calculator";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="bg-gradient-to-r from-indigo-950 via-gray-900 to-gray-950 border-b border-indigo-900/40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <div className="flex items-center gap-3 mb-0.5">
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">
                Pillar 1 · Embedded Commerce & Transaction Orchestration
              </span>
            </div>
            <h1 className="text-xl font-bold text-white">
              Cresora Commerce{" "}
              <span className="text-indigo-400">ROI Calculator</span>
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              ISV Portfolio Analysis · Card + ACH Multi-Rail Modeling
              {session.user.name ? ` · ${session.user.name}` : ""}
            </p>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <Button
              variant="ghost"
              type="submit"
              className="text-gray-400 hover:text-white"
            >
              Sign out
            </Button>
          </form>
        </div>
      </nav>

      <main>
        <ROICalculator />
      </main>
    </div>
  );
}
