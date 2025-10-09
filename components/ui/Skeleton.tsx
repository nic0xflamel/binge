interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export default function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height
}: SkeletonProps) {
  const baseClasses = 'animate-shimmer bg-gradient-to-r from-sky-100 via-pink-100 to-sky-100 bg-[length:200%_100%]';

  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

// Pre-built skeleton components for common use cases
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-4 animate-fade-in">
      <Skeleton variant="text" className="w-3/4 h-6" />
      <Skeleton variant="text" className="w-1/2 h-4" />
      <Skeleton variant="rectangular" className="w-full h-32 mt-4" />
    </div>
  );
}

export function SkeletonPoster() {
  return (
    <div className="space-y-3">
      <Skeleton variant="rectangular" className="aspect-[2/3] w-full rounded-2xl" />
      <Skeleton variant="text" className="w-3/4 h-4" />
      <Skeleton variant="text" className="w-1/2 h-3" />
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonPoster key={i} />
      ))}
    </div>
  );
}

export function SkeletonHeader() {
  return (
    <header className="bg-sky-500 p-6 shadow-lg">
      <div className="max-w-6xl mx-auto">
        <Skeleton variant="text" className="w-32 h-8 mb-2 bg-sky-400" />
        <Skeleton variant="text" className="w-48 h-4 bg-sky-400" />
      </div>
    </header>
  );
}
