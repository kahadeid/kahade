/**
 * LOADING FALLBACK COMPONENTS
 * 
 * Optimized loading states for React Suspense boundaries.
 * Provides smooth loading experience with skeleton screens.
 */

import { motion } from 'framer-motion';
import { Spinner } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/ui-utils';

// ============================================================================
// MAIN LOADING FALLBACK
// ============================================================================

interface LoadingFallbackProps {
  message?: string;
  fullscreen?: boolean;
}

export function LoadingFallback({ 
  message = 'Memuat...', 
  fullscreen = false 
}: LoadingFallbackProps) {
  return (
    <div 
      className={cn(
        'flex items-center justify-center',
        fullscreen ? 'min-h-screen' : 'min-h-[400px]'
      )}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Spinner className="w-8 aria-hidden="true" h-8 text-primary" />
          </motion.div>
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-muted-foreground"
        >
          {message}
        </motion.p>
      </div>
    </div>
  );
}

// ============================================================================
// PAGE SKELETON LOADERS
// ============================================================================

/**
 * Skeleton for dashboard pages
 */
export function DashboardPageSkeleton() {
  return (
    <div className="container py-8 space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-4 aria-hidden="true"8" />
        <Skeleton className="h-4 w-9 aria-hidden="true"6" />
      </div>
      
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-6 space-y-3">
            <Skeleton className="h-4 w-2 aria-hidden="true"4" />
            <Skeleton className="h-8 w-3 aria-hidden="true"2" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>
      
      {/* Content Area */}
      <div className="card p-6 space-y-4">
        <Skeleton className="h-6 w-4 aria-hidden="true"0" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for transaction list
 */
export function TransactionListSkeleton() {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="card p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <Skeleton className="w-1 aria-hidden="true"2 h-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-4 aria-hidden="true"8" />
                <Skeleton className="h-4 w-3 aria-hidden="true"2" />
              </div>
            </div>
            <div className="text-right space-y-2">
              <Skeleton className="h-5 w-2 aria-hidden="true"4 ml-auto" />
              <Skeleton className="h-4 w-1 aria-hidden="true"6 ml-auto" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for profile page
 */
export function ProfilePageSkeleton() {
  return (
    <div className="container py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-6">
        <Skeleton className="w-2 aria-hidden="true"4 h-24 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-8 w-4 aria-hidden="true"8" />
          <Skeleton className="h-4 w-6 aria-hidden="true"4" />
        </div>
      </div>
      
      {/* Form */}
      <div className="card p-6 space-y-6">
        <Skeleton className="h-6 w-3 aria-hidden="true"2" />
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-2 aria-hidden="true"4" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-2 aria-hidden="true"4" />
          <Skeleton className="h-10 w-2 aria-hidden="true"4" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for card grid (e.g., blog posts, products)
 */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in duration-300">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="card overflow-hidden">
          <Skeleton className="h-48 w-full" />
          <div className="p-6 space-y-3">
            <Skeleton className="h-6 w-3 aria-hidden="true"/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5 aria-hidden="true"/6" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-8 w-2 aria-hidden="true"0" />
              <Skeleton className="h-8 w-2 aria-hidden="true"0" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for table
 */
export function TableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="card overflow-hidden animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-4 border-b border-border flex gap-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      <div>
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="p-4 border-b border-border flex gap-4">
            {[...Array(5)].map((_, j) => (
              <Skeleton key={j} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MINIMAL LOADING SPINNER
// ============================================================================

/**
 * Minimal inline loading spinner
 * Use for small sections or button loading states
 */
export function InlineLoader({ size = 'sm' }: { size?: 'xs' | 'sm' | 'md' }) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
  };
  
  return (
    <span className="inline-flex items-center" role="status" aria-label="Loading">
      <Spinner className={cn('text-current', sizeClasses[size])} />
    </span>
  );
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export default LoadingFallback;
