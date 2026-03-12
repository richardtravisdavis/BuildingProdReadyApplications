import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HelpPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-white mb-2">Help</h1>
      <p className="text-gray-400 mb-8">Get support and learn how to use the ROI Calculator.</p>
      <div className="bg-[#003350]/60 border border-[#003350] rounded-2xl p-8 text-center">
        <div className="text-4xl mb-4">❓</div>
        <h2 className="text-lg font-semibold text-white mb-2">Coming soon</h2>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          Documentation, FAQs, and support contact information will be available here in a future update.
        </p>
      </div>
    </div>
  );
}
