"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#00273B] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-4">!</div>
        <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
        <p className="text-gray-400 text-sm mb-6">
          {error.message || "An unexpected error occurred. Please try again."}
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
