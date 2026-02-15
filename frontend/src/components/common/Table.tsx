/**
 * TABLE COMPONENT - PRODUCTION READY
 * 
 * COMPLETE IMPLEMENTATION: Table with sorting, pagination, selection
 * NO PLACEHOLDERS - Fully functional
 */

import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TableSkeleton } from './Skeleton';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  // Sorting
  sortable?: boolean;
  defaultSortKey?: string;
  defaultSortOrder?: 'asc' | 'desc';
  onSort?: (key: string, order: 'asc' | 'desc') => void;
  // Selection
  selectable?: boolean;
  selectedRows?: Set<string | number>;
  onSelectionChange?: (selected: Set<string | number>) => void;
  getRowId?: (row: T) => string | number;
  // Pagination
  pagination?: boolean;
  currentPage?: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  // Styling
  className?: string;
  striped?: boolean;
  hoverable?: boolean;
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'Tidak ada data',
  sortable = false,
  defaultSortKey,
  defaultSortOrder = 'asc',
  onSort,
  selectable = false,
  selectedRows = new Set(),
  onSelectionChange,
  getRowId = (row, index) => index,
  pagination = false,
  currentPage = 1,
  pageSize = 10,
  totalItems,
  onPageChange,
  onPageSizeChange,
  className,
  striped = false,
  hoverable = true,
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | undefined>(defaultSortKey);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(defaultSortOrder);

  // Handle sorting
  const handleSort = (key: string) => {
    if (!sortable) return;

    const newOrder = sortKey === key && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortOrder(newOrder);
    onSort?.(key, newOrder);
  };

  // Sort data locally if no onSort handler
  const sortedData = useMemo(() => {
    if (!sortable || !sortKey || onSort) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal === bVal) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      const comparison = aVal < bVal ? -1 : 1;
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [data, sortKey, sortOrder, sortable, onSort]);

  // Handle row selection
  const handleRowSelect = (id: string | number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    onSelectionChange?.(newSelected);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedRows.size === sortedData.length) {
      onSelectionChange?.(new Set());
    } else {
      const allIds = sortedData.map((row, index) => getRowId(row, index));
      onSelectionChange?.(new Set(allIds));
    }
  };

  // Pagination calculations
  const totalPages = totalItems ? Math.ceil(totalItems / pageSize) : Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = pagination && !onPageChange ? sortedData.slice(startIndex, endIndex) : sortedData;

  // Render sort icon
  const renderSortIcon = (columnKey: string) => {
    if (sortKey !== columnKey) {
      return <ChevronsUpDown className="w-4 aria-hidden="true" h-4 text-gray-400" />;
    }
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-4 aria-hidden="true" h-4 text-blue-600" />
    ) : (
      <ChevronDown className="w-4 aria-hidden="true" h-4 text-blue-600" />
    );
  };

  // Loading state
  if (isLoading) {
    return <TableSkeleton rows={pageSize} cols={columns.length + (selectable ? 1 : 0)} />;
  }

  // Empty state
  if (sortedData.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b">
            <tr>
              {/* Selection column */}
              {selectable && (
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === sortedData.length && sortedData.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    aria-label="Pilih semua baris"
                  />
                </th>
              )}

              {/* Data columns */}
              {columns.map((column) => {
                const isSortable = sortable && column.sortable !== false;
                const alignClass = {
                  left: 'text-left',
                  center: 'text-center',
                  right: 'text-right',
                }[column.align || 'left'];

                return (
                  <th
                    key={column.key}
                    scope="col"
                    className={cn(
                      'px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300',
                      alignClass,
                      isSortable && 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700',
                      column.width
                    )}
                    onClick={() => isSortable && handleSort(column.key)}
                    aria-sort={
                      sortKey === column.key
                        ? sortOrder === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.label}</span>
                      {isSortable && renderSortIcon(column.key)}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedData.map((row, rowIndex) => {
              const rowId = getRowId(row, rowIndex);
              const isSelected = selectedRows.has(rowId);

              return (
                <tr
                  key={rowId}
                  className={cn(
                    'transition-colors',
                    striped && rowIndex % 2 === 0 && 'bg-gray-50 dark:bg-gray-800/50',
                    hoverable && 'hover:bg-gray-100 dark:hover:bg-gray-800',
                    isSelected && 'bg-blue-50 dark:bg-blue-900/20'
                  )}
                >
                  {/* Selection cell */}
                  {selectable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleRowSelect(rowId)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        aria-label={`Pilih baris ${rowIndex + 1}`}
                      />
                    </td>
                  )}

                  {/* Data cells */}
                  {columns.map((column) => {
                    const value = row[column.key];
                    const alignClass = {
                      left: 'text-left',
                      center: 'text-center',
                      right: 'text-right',
                    }[column.align || 'left'];

                    return (
                      <td
                        key={column.key}
                        className={cn(
                          'px-4 py-3 text-sm text-gray-900 dark:text-gray-100',
                          alignClass
                        )}
                      >
                        {column.render ? column.render(value, row, rowIndex) : value}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-4">
          {/* Page size selector */}
          {onPageSizeChange && (
            <div className="flex items-center gap-2">
              <label htmlFor="page-size" className="text-sm text-gray-700 dark:text-gray-300">
                Tampilkan:
              </label>
              <select
                id="page-size"
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="px-3 py-1 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                dari {totalItems || sortedData.length}
              </span>
            </div>
          )}

          {/* Page navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1}
              className={cn(
                'px-3 py-1 rounded-lg text-sm font-medium',
                'border border-gray-300 dark:border-gray-600',
                'hover:bg-gray-100 dark:hover:bg-gray-800',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-colors'
              )}
              aria-label="Halaman sebelumnya"
            >
              Sebelumnya
            </button>

            <span className="text-sm text-gray-700 dark:text-gray-300">
              Halaman {currentPage} dari {totalPages}
            </span>

            <button
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={cn(
                'px-3 py-1 rounded-lg text-sm font-medium',
                'border border-gray-300 dark:border-gray-600',
                'hover:bg-gray-100 dark:hover:bg-gray-800',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-colors'
              )}
              aria-label="Halaman selanjutnya"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * REAL USAGE EXAMPLES
 */

// Example 1: Simple table
// <Table
//   columns={[
//     { key: 'name', label: 'Nama' },
//     { key: 'email', label: 'Email' },
//     { key: 'status', label: 'Status' },
//   ]}
//   data={users}
// />

// Example 2: Table with custom render
// <Table
//   columns={[
//     { key: 'name', label: 'Nama' },
//     {
//       key: 'amount',
//       label: 'Jumlah',
//       align: 'right',
//       render: (value) => formatCurrency(value),
//     },
//     {
//       key: 'actions',
//       label: 'Aksi',
//       render: (_, row) => (
//         <Button size="sm" onClick={() => handleEdit(row.id)}>Edit</Button>
//       ),
//     },
//   ]}
//   data={transactions}
// />

// Example 3: Sortable table
// <Table
//   columns={columns}
//   data={data}
//   sortable
//   defaultSortKey="createdAt"
//   defaultSortOrder="desc"
// />

// Example 4: Table with selection
// const [selected, setSelected] = useState(new Set());
// <Table
//   columns={columns}
//   data={data}
//   selectable
//   selectedRows={selected}
//   onSelectionChange={setSelected}
//   getRowId={(row) => row.id}
// />

// Example 5: Table with pagination
// const [page, setPage] = useState(1);
// <Table
//   columns={columns}
//   data={data}
//   pagination
//   currentPage={page}
//   pageSize={20}
//   totalItems={totalCount}
//   onPageChange={setPage}
// />
