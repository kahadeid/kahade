/**
 * SKELETON LOADERS - COMPREHENSIVE COLLECTION
 * ============================================
 * 
 * Fixes P-004: No Skeleton Loading States
 * 
 * Provides skeleton loaders for:
 * - Dashboard pages
 * - Data tables
 * - Forms
 * - Cards
 * - Lists
 * - Transaction details
 * 
 * Benefits:
 * - Better perceived performance
 * - Reduced layout shift
 * - Professional loading experience
 * - Maintains layout consistency
 */

import { cn } from "@/lib/utils";

// ============================================
// BASE SKELETON COMPONENT
// ============================================

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
      {...props}
    />
  );
}

// ============================================
// DASHBOARD SKELETON
// ============================================

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg border p-6 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chart */}
        <div className="rounded-lg border p-6 space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>

        {/* Recent Activity */}
        <div className="rounded-lg border p-6 space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// TABLE SKELETON
// ============================================

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  showPagination?: boolean;
}

export function TableSkeleton({ 
  rows = 10, 
  columns = 5,
  showHeader = true,
  showPagination = true 
}: TableSkeletonProps) {
  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-10 w-64" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        {/* Table Header */}
        {showHeader && (
          <div className="grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, i) => (
              <div key={i} className="border-b p-4">
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        )}

        {/* Table Rows */}
        <div className="divide-y">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div 
              key={rowIndex} 
              className="grid" 
              style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
            >
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div key={colIndex} className="p-4">
                  <Skeleton className={cn(
                    "h-4",
                    colIndex === 0 ? "w-full" : "w-3/4"
                  )} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// FORM SKELETON
// ============================================

interface FormSkeletonProps {
  fields?: number;
}

export function FormSkeleton({ fields = 6 }: FormSkeletonProps) {
  return (
    <div className="space-y-6 p-6">
      {/* Form Title */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>

      {/* Form Actions */}
      <div className="flex gap-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}

// ============================================
// CARD SKELETON
// ============================================

interface CardSkeletonProps {
  count?: number;
  variant?: "default" | "transaction" | "user";
}

export function CardSkeleton({ count = 3, variant = "default" }: CardSkeletonProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border p-6 space-y-4">
          {variant === "transaction" && (
            <>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </>
          )}

          {variant === "user" && (
            <>
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </>
          )}

          {variant === "default" && (
            <>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-32 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================
// LIST SKELETON
// ============================================

interface ListSkeletonProps {
  items?: number;
  showAvatar?: boolean;
}

export function ListSkeleton({ items = 5, showAvatar = true }: ListSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
          {showAvatar && <Skeleton className="h-12 w-12 rounded-full" />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

// ============================================
// TRANSACTION DETAIL SKELETON
// ============================================

export function TransactionDetailSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>

      {/* Amount Card */}
      <div className="rounded-lg border p-6 space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-12 w-48" />
      </div>

      {/* Details */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Parties */}
        <div className="rounded-lg border p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="rounded-lg border p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
      </div>
    </div>
  );
}

// ============================================
// WALLET SKELETON
// ============================================

export function WalletSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Balance Card */}
      <div className="rounded-lg border p-8 space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-12 w-64" />
        <div className="flex gap-4 pt-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>

      {/* Transactions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <ListSkeleton items={5} showAvatar={false} />
      </div>
    </div>
  );
}

/**
 * USAGE EXAMPLES:
 * ==============
 * 
 * ```tsx
 * // In Dashboard Page
 * {isLoading ? <DashboardSkeleton /> : <DashboardContent />}
 * 
 * // In Transaction List
 * {isLoading ? <TableSkeleton rows={10} columns={6} /> : <TransactionTable />}
 * 
 * // In Form Page
 * {isLoading ? <FormSkeleton fields={8} /> : <TransactionForm />}
 * 
 * // In Card Grid
 * {isLoading ? <CardSkeleton count={6} variant="transaction" /> : <Cards />}
 * ```
 */
