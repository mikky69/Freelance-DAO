export default function DisputesLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-orange-50/20">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-red-600 via-red-700 to-orange-600">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl animate-pulse" />
                <div>
                  <div className="h-10 w-64 bg-white/20 rounded animate-pulse mb-2" />
                  <div className="h-6 w-48 bg-white/20 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-4 w-96 bg-white/20 rounded animate-pulse" />
            </div>
            <div className="h-12 w-40 bg-white/20 rounded animate-pulse" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Statistics Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
              <div className="flex items-center justify-center mb-3">
                <div className="w-12 h-12 bg-slate-200 rounded-full" />
              </div>
              <div className="h-8 w-16 bg-slate-200 rounded mx-auto mb-2" />
              <div className="h-4 w-24 bg-slate-200 rounded mx-auto mb-1" />
              <div className="h-3 w-20 bg-slate-200 rounded mx-auto" />
            </div>
          ))}
        </div>

        {/* Search and Tabs Skeleton */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 h-10 bg-slate-200 rounded animate-pulse" />
          <div className="h-10 w-32 bg-slate-200 rounded animate-pulse" />
        </div>

        <div className="h-10 w-full bg-slate-200 rounded animate-pulse mb-8" />

        {/* Disputes List Skeleton */}
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border-l-4 border-l-slate-200 p-6 animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-6 w-24 bg-slate-200 rounded" />
                    <div className="h-6 w-32 bg-slate-200 rounded" />
                    <div className="h-6 w-20 bg-slate-200 rounded" />
                  </div>
                  <div className="h-6 w-3/4 bg-slate-200 rounded mb-2" />
                  <div className="h-4 w-full bg-slate-200 rounded mb-1" />
                  <div className="h-4 w-2/3 bg-slate-200 rounded" />
                </div>
                <div className="text-right">
                  <div className="h-8 w-24 bg-slate-200 rounded mb-1" />
                  <div className="h-4 w-20 bg-slate-200 rounded" />
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 mb-4">
                <div className="h-5 w-32 bg-slate-200 rounded mb-3" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-slate-200 rounded-full" />
                      <div>
                        <div className="h-3 w-12 bg-slate-200 rounded mb-1" />
                        <div className="h-4 w-20 bg-slate-200 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-6 mb-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="h-4 w-16 bg-slate-200 rounded" />
                ))}
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <div className="flex-1 h-10 bg-slate-200 rounded" />
                <div className="flex-1 h-10 bg-slate-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
