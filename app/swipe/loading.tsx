import Skeleton from '@/components/ui/Skeleton';

export default function SwipeLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-4">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-4 flex justify-between items-center">
        <div className="h-5 w-32 bg-purple-400 rounded animate-pulse" />
        <div className="h-5 w-16 bg-purple-400 rounded animate-pulse" />
      </div>

      {/* Card Skeleton */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Poster Skeleton */}
          <Skeleton variant="rectangular" className="aspect-[2/3] w-full" />

          {/* Info Skeleton */}
          <div className="p-6 space-y-4">
            <Skeleton variant="text" className="h-7 w-3/4" />
            <Skeleton variant="text" className="h-4 w-1/2" />

            {/* Genres */}
            <div className="flex gap-2">
              <Skeleton variant="rectangular" className="h-8 w-20" />
              <Skeleton variant="rectangular" className="h-8 w-24" />
              <Skeleton variant="rectangular" className="h-8 w-20" />
            </div>

            {/* Overview */}
            <div className="space-y-2">
              <Skeleton variant="text" className="w-full" />
              <Skeleton variant="text" className="w-full" />
              <Skeleton variant="text" className="w-3/4" />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-6">
              <Skeleton variant="rectangular" className="flex-1 h-14" />
              <Skeleton variant="rectangular" className="flex-1 h-14" />
              <Skeleton variant="rectangular" className="flex-1 h-14" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
