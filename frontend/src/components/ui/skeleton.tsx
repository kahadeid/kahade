import { cn } from '@/lib/ui-utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-black/5',
        className
      )}
      {...props}
    />
  );
}

// Preset skeletons for common use cases
export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-black/5 p-6 space-y-4">
      <Skeleton className="h-14 w-14 rounded-xl" aria-hidden="true" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-3 /4" aria-hidden="true" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5 /6" aria-hidden="true" />
      </div>
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} 
        />
      ))}
    </div>
  );
}
