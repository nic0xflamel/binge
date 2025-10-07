import { SkeletonCard, SkeletonGrid } from '@/components/ui/Skeleton';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <header className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="h-8 w-32 bg-purple-400 rounded animate-pulse mb-2" />
          <div className="h-4 w-48 bg-purple-400 rounded animate-pulse" />
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Quick Actions Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>

        {/* Recent Matches Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-6" />
          <SkeletonGrid count={6} />
        </div>

        {/* Settings Section */}
        <SkeletonCard />
      </div>
    </div>
  );
}
