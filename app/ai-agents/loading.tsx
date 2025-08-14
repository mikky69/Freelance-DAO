import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function AIAgentsLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section Skeleton */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <Skeleton className="h-16 w-16 rounded-full mx-auto mb-6 bg-white/20" />
            <Skeleton className="h-12 w-96 mx-auto mb-4 bg-white/20" />
            <Skeleton className="h-6 w-[600px] mx-auto mb-8 bg-white/20" />
            <div className="flex justify-center gap-4">
              <Skeleton className="h-12 w-48 bg-white/20" />
              <Skeleton className="h-12 w-32 bg-white/20" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6 text-center">
                <Skeleton className="w-12 h-12 mx-auto mb-4" />
                <Skeleton className="h-8 w-16 mx-auto mb-2" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Skeleton */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-20" />
              </CardHeader>
              <CardContent className="space-y-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Agents Grid Skeleton */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      <div className="flex items-start space-x-4 flex-1">
                        <Skeleton className="w-16 h-16 rounded-xl" />
                        <div className="flex-1 space-y-3">
                          <Skeleton className="h-6 w-48" />
                          <Skeleton className="h-4 w-full" />
                          <div className="flex gap-2">
                            {[...Array(4)].map((_, j) => (
                              <Skeleton key={j} className="h-6 w-20" />
                            ))}
                          </div>
                          <div className="grid grid-cols-4 gap-4">
                            {[...Array(4)].map((_, j) => (
                              <Skeleton key={j} className="h-4 w-16" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <Skeleton className="h-8 w-32" />
                        <div className="flex space-x-2">
                          <Skeleton className="h-10 w-24" />
                          <Skeleton className="h-10 w-20" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
