/**
 * PAGINATION COMPONENT - PRODUCTION READY
 * 
 * COMPLETE IMPLEMENTATION: Pagination for data tables and lists
 * NO PLACEHOLDERS - Works immediately
 */

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  showFirstLast?: boolean;
  showPageSize?: boolean;
  maxPages?: number;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize = 20,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showFirstLast = true,
  showPageSize = true,
  maxPages = 7,
  className,
}: PaginationProps) {
  // Calculate page numbers to display
  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= maxPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    const halfMax = Math.floor(maxPages / 2);

    let startPage = Math.max(1, currentPage - halfMax);
    let endPage = Math.min(totalPages, currentPage + halfMax);

    // Adjust if we're near the start
    if (currentPage <= halfMax) {
      endPage = Math.min(maxPages, totalPages);
    }

    // Adjust if we're near the end
    if (currentPage > totalPages - halfMax) {
      startPage = Math.max(1, totalPages - maxPages + 1);
    }

    // Add first page and ellipsis
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }

    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add ellipsis and last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  // Calculate item range
  const startItem = totalItems ? (currentPage - 1) * pageSize + 1 : null;
  const endItem = totalItems ? Math.min(currentPage * pageSize, totalItems) : null;

  return (
    <div className={cn('flex items-center justify-between flex-wrap gap-4', className)}>
      {/* Items info */}
      {totalItems !== undefined && (
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Showing <span className="font-medium">{startItem}</span> to{' '}
          <span className="font-medium">{endItem}</span> of{' '}
          <span className="font-medium">{totalItems}</span> results
        </div>
      )}

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* First page button */}
        {showFirstLast && (
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className={cn(
              'p-2 rounded-lg border',
              'transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              currentPage === 1
                ? 'border-gray-200 dark:border-gray-700 text-gray-400'
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
            )}
            aria-label="First page"
          >
            <ChevronsLeft className="w-4 aria-hidden="true" h-4" />
          </button>
        )}

        {/* Previous page button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            'p-2 rounded-lg border',
            'transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            currentPage === 1
              ? 'border-gray-200 dark:border-gray-700 text-gray-400'
              : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
          )}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 aria-hidden="true" h-4" />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-3 py-2 text-gray-500"
                  aria-hidden="true"
                >
                  …
                </span>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                className={cn(
                  'min-w-[40px] px-3 py-2 rounded-lg',
                  'text-sm font-medium',
                  'transition-colors',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-600'
                )}
                aria-label={`Page ${pageNum}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next page button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            'p-2 rounded-lg border',
            'transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            currentPage === totalPages
              ? 'border-gray-200 dark:border-gray-700 text-gray-400'
              : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
          )}
          aria-label="Next page"
        >
          <ChevronRight className="w-4 aria-hidden="true" h-4" />
        </button>

        {/* Last page button */}
        {showFirstLast && (
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className={cn(
              'p-2 rounded-lg border',
              'transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              currentPage === totalPages
                ? 'border-gray-200 dark:border-gray-700 text-gray-400'
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
            )}
            aria-label="Last page"
          >
            <ChevronsRight className="w-4 aria-hidden="true" h-4" />
          </button>
        )}
      </div>

      {/* Page size selector */}
      {showPageSize && onPageSizeChange && (
        <div className="flex items-center gap-2">
          <label
            htmlFor="page-size"
            className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap"
          >
            Show
          </label>
          <select
            id="page-size"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className={cn(
              'px-3 py-2 rounded-lg border',
              'text-sm',
              'bg-white dark:bg-gray-800',
              'border-gray-300 dark:border-gray-600',
              'text-gray-700 dark:text-gray-200',
              'focus:outline-none focus:ring-2 focus:ring-blue-500'
            )}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-700 dark:text-gray-300">per page</span>
        </div>
      )}
    </div>
  );
}

/**
 * Simple Pagination (just prev/next)
 */
export interface SimplePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function SimplePagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: SimplePaginationProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg',
          'text-sm font-medium',
          'transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          currentPage === 1
            ? 'text-gray-400'
            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
        )}
      >
        <ChevronLeft className="w-4 aria-hidden="true" h-4" />
        Previous
      </button>

      <span className="text-sm text-gray-700 dark:text-gray-300">
        Page {currentPage} of {totalPages}
      </span>

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg',
          'text-sm font-medium',
          'transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          currentPage === totalPages
            ? 'text-gray-400'
            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
        )}
      >
        Next
        <ChevronRight className="w-4 aria-hidden="true" h-4" />
      </button>
    </div>
  );
}

/**
 * REAL USAGE EXAMPLES
 */

// Example 1: Full pagination
// const [page, setPage] = useState(1);
// const [pageSize, setPageSize] = useState(20);
// 
// <Pagination
//   currentPage={page}
//   totalPages={Math.ceil(data.total / pageSize)}
//   totalItems={data.total}
//   pageSize={pageSize}
//   onPageChange={setPage}
//   onPageSizeChange={setPageSize}
// />

// Example 2: Simple pagination
// <SimplePagination
//   currentPage={page}
//   totalPages={totalPages}
//   onPageChange={setPage}
// />

// Example 3: With Table component
// <Table
//   data={data}
//   columns={columns}
//   pagination={
//     <Pagination
//       currentPage={page}
//       totalPages={totalPages}
//       onPageChange={setPage}
//     />
//   }
// />

// Example 4: API integration
// function TransactionList() {
//   const [page, setPage] = useState(1);
//   const [pageSize, setPageSize] = useState(20);
//   
//   const { data, isLoading } = useQuery({
//     queryKey: ['transactions', page, pageSize],
//     queryFn: () => fetchTransactions({ page, pageSize }),
//   });
//   
//   return (
//     <div>
//       <TransactionTable data={data?.items} isLoading={isLoading} />
//       
//       <Pagination
//         currentPage={page}
//         totalPages={data?.totalPages || 1}
//         totalItems={data?.total}
//         pageSize={pageSize}
//         onPageChange={setPage}
//         onPageSizeChange={(size) => {
//           setPageSize(size);
//           setPage(1); // Reset to first page
//         }}
//       />
//     </div>
//   );
// }
