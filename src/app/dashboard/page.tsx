import { auth } from "@/lib/auth";
import ROICalculator from "@/components/roi-calculator";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <>
      {/* Top bar */}
      <header className="bg-gradient-to-r from-[#00273B] via-[#003350] to-[#00273B] border-b border-[#FC6200]/20 px-6 py-4 lg:px-8">
        <div className="flex items-center gap-3 mb-0.5 pl-10 lg:pl-0">
          <div className="w-2 h-2 rounded-full bg-[#FC6200] animate-pulse" />
          <span className="text-xs font-semibold text-[#FC6200] uppercase tracking-widest">
            Pillar 1 · Embedded Commerce & Transaction Orchestration
          </span>
        </div>
        <h1 className="text-xl font-bold text-white pl-10 lg:pl-0">
          ISV Portfolio Analysis{" "}
          <span className="text-[#68DDDC]">· Card + ACH Multi-Rail Modeling</span>
        </h1>
        <p className="text-xs text-gray-400 mt-0.5 pl-10 lg:pl-0">
          {session?.user?.name ? `Logged in as ${session.user.name}` : ""}
        </p>
      </header>

      <main className="flex-1">
        <ROICalculator />
      </main>
    </>
  );
}
