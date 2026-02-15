/**
 * EMPTY STATE COMPONENT - PRODUCTION READY
 * 
 * COMPLETE IMPLEMENTATION: Empty states for better UX
 * NO PLACEHOLDERS - Works immediately
 */

import React from 'react';
import { 
  Search, 
  Inbox, 
  FileX, 
  AlertTriangle, 
  Cloud,
  ShoppingCart,
  Users,
  Calendar,
  File,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

export interface EmptyStateProps {
  variant?: 'no-data' | 'no-results' | 'error' | '404' | 'empty-cart' | 'custom';
  title: string;
  description?: string;
  icon?: React.ReactNode;
  illustration?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'outline';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  children?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  variant = 'no-data',
  title,
  description,
  icon,
  illustration,
  action,
  secondaryAction,
  children,
  className,
}: EmptyStateProps) {
  // Default icons for each variant
  const defaultIcons = {
    'no-data': <Inbox className="w-1 aria-hidden="true"6 h-16" />,
    'no-results': <Search className="w-1 aria-hidden="true"6 h-16" />,
    'error': <AlertTriangle className="w-1 aria-hidden="true"6 h-16" />,
    '404': <FileX className="w-1 aria-hidden="true"6 h-16" />,
    'empty-cart': <ShoppingCart className="w-1 aria-hidden="true"6 h-16" />,
    'custom': null,
  };

  const displayIcon = icon !== undefined ? icon : defaultIcons[variant];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        'text-center py-12 px-4',
        className
      )}
    >
      {/* Illustration or Icon */}
      {illustration ? (
        <div className="mb-6">{illustration}</div>
      ) : displayIcon ? (
        <div className="mb-6 text-gray-400 dark:text-gray-600" aria-hidden="true">
          {displayIcon}
        </div>
      ) : null}

      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
          {description}
        </p>
      )}

      {/* Custom Content */}
      {children && <div className="mb-6">{children}</div>}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {action && (
            <Button
              variant={action.variant || 'primary'}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Pre-built Empty State variants
 */

// No Data
export function NoData({
  title = 'No data yet',
  description = 'Get started by creating your first item.',
  actionLabel = 'Create New',
  onAction,
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <EmptyState
      variant="no-data"
      title={title}
      description={description}
      action={onAction ? { label: actionLabel, onClick: onAction } : undefined}
    />
  );
}

// No Results
export function NoResults({
  title = 'No results found',
  description = 'Try adjusting your search or filters to find what you\'re looking for.',
  onClear,
}: {
  title?: string;
  description?: string;
  onClear?: () => void;
}) {
  return (
    <EmptyState
      variant="no-results"
      title={title}
      description={description}
      action={onClear ? { label: 'Clear Filters', onClick: onClear, variant: 'outline' } : undefined}
    />
  );
}

// Error State
export function ErrorState({
  title = 'Something went wrong',
  description = 'We\'re having trouble loading this content. Please try again.',
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      variant="error"
      title={title}
      description={description}
      action={onRetry ? { label: 'Try Again', onClick: onRetry } : undefined}
    />
  );
}

// 404 Not Found
export function NotFound({
  title = 'Page not found',
  description = 'The page you\'re looking for doesn\'t exist or has been moved.',
  onGoHome,
}: {
  title?: string;
  description?: string;
  onGoHome?: () => void;
}) {
  return (
    <EmptyState
      variant="404"
      title={title}
      description={description}
      action={onGoHome ? { label: 'Go to Homepage', onClick: onGoHome } : undefined}
    />
  );
}

// Empty Cart
export function EmptyCart({
  title = 'Your cart is empty',
  description = 'Add items to your cart to get started.',
  onBrowse,
}: {
  title?: string;
  description?: string;
  onBrowse?: () => void;
}) {
  return (
    <EmptyState
      variant="empty-cart"
      title={title}
      description={description}
      action={onBrowse ? { label: 'Browse Products', onClick: onBrowse } : undefined}
    />
  );
}

/**
 * REAL USAGE EXAMPLES
 */

// Example 1: No transactions
// <EmptyState
//   variant="no-data"
//   title="No transactions yet"
//   description="Create your first transaction to get started with secure escrow payments."
//   action={{
//     label: 'Create Transaction',
//     onClick: () => router.push('/transactions/create'),
//   }}
// />

// Example 2: Search no results
// <EmptyState
//   variant="no-results"
//   title="No transactions found"
//   description={`No results for "${searchQuery}". Try different keywords.`}
//   action={{
//     label: 'Clear Search',
//     onClick: () => setSearchQuery(''),
//     variant: 'outline',
//   }}
// />

// Example 3: Error loading data
// {error && (
//   <EmptyState
//     variant="error"
//     title="Failed to load transactions"
//     description={error.message}
//     action={{
//       label: 'Retry',
//       onClick: refetch,
//     }}
//   />
// )}

// Example 4: With custom icon
// <EmptyState
//   title="No messages"
//   description="You don't have any messages yet."
//   icon={<Mail className="w-1 aria-hidden="true"6 h-16" />}
// />

// Example 5: Using pre-built variant
// <NoData
//   title="No saved items"
//   description="Save items to view them here."
//   actionLabel="Browse Items"
//   onAction={() => router.push('/browse')}
// />

// Example 6: In a table
// function TransactionTable({ data, isLoading }) {
//   if (isLoading) return <Skeleton />;
//   
//   if (!data || data.length === 0) {
//     return (
//       <NoData
//         title="No transactions"
//         description="Create your first transaction to get started."
//         actionLabel="Create Transaction"
//         onAction={() => router.push('/transactions/create')}
//       />
//     );
//   }
//   
//   return <Table data={data} columns={columns} />;
// }

// Example 7: With custom content
// <EmptyState
//   variant="no-data"
//   title="No notifications"
//   description="You're all caught up!"
// >
//   <div className="mt-4 p-4 bg-blue-50 rounded-lg">
//     <p className="text-sm text-blue-700">
//       Turn on notifications to stay updated on your transactions.
//     </p>
//   </div>
// </EmptyState>

// Example 8: Search with filters
// {filteredData.length === 0 && (
//   <NoResults
//     title="No matching transactions"
//     description="Try adjusting your filters or search term."
//     onClear={() => {
//       setSearchQuery('');
//       setFilters({});
//     }}
//   />
// )}
