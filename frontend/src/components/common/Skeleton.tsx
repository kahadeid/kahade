/**
 * SKELETON LOADING COMPONENTS
 * 
 * UX IMPROVEMENT: Better loading states
 * 
 * Usage:
 * ```tsx
 * {isLoading ? <TransactionCardSkeleton /> : <TransactionCard data={data} />}
 * ```
 */

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Base Skeleton component
 */
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-200 dark:bg-gray-700',
        className
      )}
      {...props}
    />
  );
}

/**
 * Skeleton variants for common shapes
 */
export function SkeletonCircle({ className, ...props }: SkeletonProps) {
  return (
    <Skeleton
      className={cn('rounded-full', className)}
      {...props}
    />
  );
}

export function SkeletonText({ className, lines = 1, ...props }: SkeletonProps & { lines?: number }) {
  if (lines === 1) {
    return <Skeleton className={cn('h-4 w-full', className)} {...props} />;
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-3/4' : 'w-full', // Last line shorter
            className
          )}
          {...props}
        />
      ))}
    </div>
  );
}

export function SkeletonButton({ className, ...props }: SkeletonProps) {
  return (
    <Skeleton
      className={cn('h-10 w-24 rounded-lg', className)}
      {...props}
    />
  );
}

/**
 * Common UI patterns
 */

export function SkeletonAvatar({ size = 'md', ...props }: SkeletonProps & { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <SkeletonCircle
      className={cn(sizeClasses[size], props.className)}
    />
  );
}

export function SkeletonCard({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn('p-4 border rounded-lg space-y-3', className)} {...props}>
      <Skeleton className="h-6 w-3 /4" aria-hidden="true" />
      <SkeletonText lines={2} />
      <div className="flex gap-2">
        <SkeletonButton />
        <SkeletonButton />
      </div>
    </div>
  );
}

/**
 * Kahade-specific skeletons
 */

export function TransactionCardSkeleton() {
  return (
    <div className="p-4 border rounded-lg space-y-3 bg-white">
      {/* Header: Avatar + Name */}
      <div className="flex items-center gap-3">
        <SkeletonAvatar size="md" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" aria-hidden="true" /> {/* Name */}
          <Skeleton className="h-4 w-24" aria-hidden="true" /> {/* Status */}
        </div>
        <Skeleton className="h-6 w-20" aria-hidden="true" /> {/* Amount */}
      </div>

      {/* Description */}
      <SkeletonText lines={2} />

      {/* Footer: Date + Actions */}
      <div className="flex items-center justify-between pt-2 border-t">
        <Skeleton className="h-4 w-32" aria-hidden="true" /> {/* Date */}
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded" aria-hidden="true" /> {/* Button 1 */}
          <Skeleton className="h-8 w-20 rounded" aria-hidden="true" /> {/* Button 2 */}
        </div>
      </div>
    </div>
  );
}

export function TransactionListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <TransactionCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function UserCardSkeleton() {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        <SkeletonAvatar size="lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" aria-hidden="true" /> {/* Name */}
          <Skeleton className="h-4 w-48" aria-hidden="true" /> {/* Email */}
          <Skeleton className="h-4 w-24" aria-hidden="true" /> {/* Role */}
        </div>
      </div>
    </div>
  );
}

export function UserListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <UserCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function DisputeCardSkeleton() {
  return (
    <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" aria-hidden="true" /> {/* Icon */}
          <Skeleton className="h-5 w-32" aria-hidden="true" /> {/* Title */}
        </div>
        <Skeleton className="h-6 w-24 rounded-full" aria-hidden="true" /> {/* Status badge */}
      </div>
      <SkeletonText lines={2} />
      <div className="flex gap-2 pt-2">
        <SkeletonButton />
        <SkeletonButton />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Avatar section */}
      <div className="flex items-center gap-4">
        <SkeletonCircle className="w-24 h-24" aria-hidden="true" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-48" aria-hidden="true" />
          <Skeleton className="h-4 w-64" aria-hidden="true" />
        </div>
      </div>

      {/* Info sections */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" aria-hidden="true" /> {/* Label */}
            <Skeleton className="h-10 w-full rounded-lg" /> {/* Input */}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <SkeletonButton className="flex-1" />
        <SkeletonButton className="w-24" aria-hidden="true" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-5 flex-1" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-3 border-b">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-6 border rounded-lg space-y-2">
          <Skeleton className="h-4 w-24" aria-hidden="true" /> {/* Label */}
          <Skeleton className="h-8 w-32" aria-hidden="true" /> {/* Value */}
          <Skeleton className="h-3 w-16" aria-hidden="true" /> {/* Change */}
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('p-6 border rounded-lg space-y-4', className)}>
      <Skeleton className="h-6 w-48" aria-hidden="true" /> {/* Title */}
      <Skeleton className="h-64 w-full" /> {/* Chart area */}
      <div className="flex gap-4 justify-center">
        <Skeleton className="h-4 w-20" aria-hidden="true" /> {/* Legend 1 */}
        <Skeleton className="h-4 w-20" aria-hidden="true" /> {/* Legend 2 */}
        <Skeleton className="h-4 w-20" aria-hidden="true" /> {/* Legend 3 */}
      </div>
    </div>
  );
}

export function NotificationSkeleton() {
  return (
    <div className="p-3 border-b flex gap-3">
      <SkeletonCircle className="w-10 h-10" aria-hidden="true" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-3 /4" aria-hidden="true" />
        <Skeleton className="h-3 w-20" aria-hidden="true" /> {/* Time */}
      </div>
    </div>
  );
}

export function NotificationListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <NotificationSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Page-level skeletons
 */

export function PageSkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" aria-hidden="true" /> {/* Title */}
        <Skeleton className="h-4 w-96" aria-hidden="true" /> {/* Subtitle */}
      </div>

      {/* Stats */}
      <DashboardStatsSkeleton />

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <TransactionListSkeleton />
        </div>
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    </div>
  );
}

/**
 * USAGE EXAMPLES
 * 
 * 1. Simple loading state:
 * ```tsx
 * {isLoading ? <Skeleton className="h-4 w-32" aria-hidden="true" /> : <span>{data}</span>}
 * ```
 * 
 * 2. Card loading:
 * ```tsx
 * {isLoading ? <TransactionCardSkeleton /> : <TransactionCard data={data} />}
 * ```
 * 
 * 3. List loading:
 * ```tsx
 * {isLoading ? <TransactionListSkeleton count={5} /> : <TransactionList data={data} />}
 * ```
 * 
 * 4. With Suspense:
 * ```tsx
 * <Suspense fallback={<TransactionListSkeleton />}>
 *   <TransactionList />
 * </Suspense>
 * ```
 * 
 * 5. Custom skeleton:
 * ```tsx
 * <div className="space-y-3">
 *   <SkeletonAvatar size="lg" />
 *   <SkeletonText lines={3} />
 *   <SkeletonButton />
 * </div>
 * ```
 */
