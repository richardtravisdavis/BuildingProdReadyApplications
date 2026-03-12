export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#00273B] flex">
      {/* Sidebar skeleton */}
      <aside className="hidden lg:flex w-64 bg-[#00273B] border-r border-[#003350] flex-col">
        <div className="px-5 py-5 border-b border-[#003350] flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#003350] animate-pulse" />
          <div className="space-y-2">
            <div className="w-24 h-3 bg-[#003350] rounded animate-pulse" />
            <div className="w-16 h-2 bg-[#003350] rounded animate-pulse" />
          </div>
        </div>
        <div className="p-3 space-y-2">
          <div className="h-10 bg-[#003350] rounded-lg animate-pulse" />
          <div className="h-10 bg-[#003350]/50 rounded-lg animate-pulse" />
          <div className="h-10 bg-[#003350]/50 rounded-lg animate-pulse" />
        </div>
      </aside>

      {/* Main content skeleton */}
      <div className="flex-1 flex flex-col">
        {/* Header skeleton */}
        <div className="border-b border-[#FC6200]/20 px-6 py-4">
          <div className="w-64 h-3 bg-[#003350] rounded animate-pulse mb-2" />
          <div className="w-48 h-5 bg-[#003350] rounded animate-pulse mb-1" />
          <div className="w-32 h-2 bg-[#003350] rounded animate-pulse" />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6 w-full">
          {/* Tab bar skeleton */}
          <div className="flex gap-2 mb-8 border-b border-[#003350]">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="px-4 py-2.5">
                <div className="w-24 h-4 bg-[#003350] rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* KPI cards skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border border-[#003350] rounded-xl p-4">
                <div className="w-20 h-3 bg-[#003350] rounded animate-pulse mb-3" />
                <div className="w-28 h-6 bg-[#003350] rounded animate-pulse mb-2" />
                <div className="w-16 h-2 bg-[#003350] rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Input sections skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-[#003350]/40 rounded-xl p-4">
                <div className="w-32 h-3 bg-[#003350] rounded animate-pulse mb-2" />
                <div className="w-full h-9 bg-[#003350] rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
