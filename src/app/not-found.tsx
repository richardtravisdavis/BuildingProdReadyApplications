import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#00273B] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="text-6xl font-bold text-[#FC6200] mb-2">404</div>
        <h1 className="text-2xl font-bold text-white mb-2">Page not found</h1>
        <p className="text-gray-400 text-sm mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2.5 bg-[#FC6200] text-white text-sm font-medium rounded-lg hover:bg-[#FC6200]/90 transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
