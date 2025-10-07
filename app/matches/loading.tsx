import { SkeletonGrid } from '@/components/ui/Skeleton';

export default function MatchesLoading() {
  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-6 pt-8">
        <SkeletonGrid count={12} />
      </div>
    </div>
  );
}
