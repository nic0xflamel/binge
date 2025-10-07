import { SkeletonGrid } from '@/components/ui/Skeleton';

export default function MatchesLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <header className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="h-4 w-40 bg-purple-400 rounded animate-pulse mb-2" />
          <div className="h-8 w-32 bg-purple-400 rounded animate-pulse mb-1" />
          <div className="h-4 w-48 bg-purple-400 rounded animate-pulse" />
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <SkeletonGrid count={12} />
      </div>
    </div>
  );
}
