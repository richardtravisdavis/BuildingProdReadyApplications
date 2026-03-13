"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex-1 flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-4">!</div>
        <h1 className="text-xl font-bold text-white mb-2">Something went wrong</h1>
        <p className="text-gray-400 text-sm mb-6">
          {error.message || "An error occurred loading this page."}
        </p>
        <button
          onClick={reset}
          className="px-6 py-2.5 bg-[#FC6200] text-white text-sm font-medium rounded-lg hover:bg-[#FC6200]/90 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
