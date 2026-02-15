import { useState, useCallback, useMemo } from "react";
import { PaginationMeta, SortConfig, FilterConfig } from "@/types";

// ============================================================================
// USE PAGINATION HOOK
// Provides standardized pagination, sorting, and filtering state management
// ============================================================================

interface UsePaginationOptions {
  /** Initial page number */
  initialPage?: number;
  /** Initial items per page */
  initialLimit?: number;
  /** Initial sort configuration */
  initialSort?: SortConfig;
  /** Initial filter configuration */
  initialFilters?: FilterConfig;
}

interface UsePaginationReturn {
  /** Current page number */
  page: number;
  /** Items per page */
  limit: number;
  /** Sort configuration */
  sort: SortConfig | null;
  /** Filter configuration */
  filters: FilterConfig;
  /** Pagination metadata from API */
  pagination: PaginationMeta | null;
  /** Go to specific page */
  goToPage: (page: number) => void;
  /** Go to next page */
  nextPage: () => void;
  /** Go to previous page */
  prevPage: () => void;
  /** Go to first page */
  firstPage: () => void;
  /** Go to last page */
  lastPage: () => void;
  /** Change items per page */
  setLimit: (limit: number) => void;
  /** Set sort configuration */
  setSort: (sort: SortConfig | null) => void;
  /** Toggle sort direction for a field */
  toggleSort: (field: string) => void;
  /** Set a single filter */
  setFilter: (key: string, value: string | number | boolean | undefined) => void;
  /** Set multiple filters */
  setFilters: (filters: FilterConfig) => void;
  /** Clear all filters */
  clearFilters: () => void;
  /** Update pagination metadata from API response */
  setPagination: (pagination: PaginationMeta) => void;
  /** Reset to initial state */
  reset: () => void;
  /** Get query params for API call */
  getQueryParams: () => Record<string, string | number>;
  /** Check if can go to next page */
  canGoNext: boolean;
  /** Check if can go to previous page */
  canGoPrev: boolean;
  /** Total number of pages */
  totalPages: number;
  /** Total number of items */
  totalItems: number;
}

export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
  const {
    initialPage = 1,
    initialLimit = 20,
    initialSort = null,
    initialFilters = {},
  } = options;

  const [page, setPage] = useState(initialPage);
  const [limit, setLimitState] = useState(initialLimit);
  const [sort, setSort] = useState<SortConfig | null>(initialSort);
  const [filters, setFiltersState] = useState<FilterConfig>(initialFilters);
  const [pagination, setPaginationState] = useState<PaginationMeta | null>(null);

  // Derived values
  const canGoNext = useMemo(() => pagination?.hasNext ?? false, [pagination]);
  const canGoPrev = useMemo(() => pagination?.hasPrev ?? false, [pagination]);
  const totalPages = useMemo(() => pagination?.totalPages ?? 0, [pagination]);
  const totalItems = useMemo(() => pagination?.total ?? 0, [pagination]);

  // Navigation functions
  const goToPage = useCallback(
    (newPage: number) => {
      if (newPage >= 1 && (!pagination || newPage <= pagination.totalPages)) {
        setPage(newPage);
      }
    },
    [pagination],
  );

  const nextPage = useCallback(() => {
    if (canGoNext) {
      setPage((prev) => prev + 1);
    }
  }, [canGoNext]);

  const prevPage = useCallback(() => {
    if (canGoPrev) {
      setPage((prev) => prev - 1);
    }
  }, [canGoPrev]);

  const firstPage = useCallback(() => {
    setPage(1);
  }, []);

  const lastPage = useCallback(() => {
    if (pagination?.totalPages) {
      setPage(pagination.totalPages);
    }
  }, [pagination]);

  // Limit functions
  const setLimit = useCallback((newLimit: number) => {
    setLimitState(newLimit);
    setPage(1); // Reset to first page when changing limit
  }, []);

  // Sort functions
  const toggleSort = useCallback((field: string) => {
    setSort((prev) => {
      if (prev?.field === field) {
        // Toggle direction or clear
        if (prev.direction === "asc") {
          return { field, direction: "desc" };
        }
        return null; // Clear sort
      }
      return { field, direction: "asc" };
    });
    setPage(1); // Reset to first page when changing sort
  }, []);

  // Filter functions
  const setFilter = useCallback((key: string, value: string | number | boolean | undefined) => {
    setFiltersState((prev) => {
      if (value === undefined || value === "") {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: value };
    });
    setPage(1); // Reset to first page when changing filters
  }, []);

  const setFilters = useCallback((newFilters: FilterConfig) => {
    setFiltersState(newFilters);
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({});
    setPage(1);
  }, []);

  // Pagination metadata update
  const setPagination = useCallback((newPagination: PaginationMeta) => {
    setPaginationState(newPagination);
  }, []);

  // Reset function
  const reset = useCallback(() => {
    setPage(initialPage);
    setLimitState(initialLimit);
    setSort(initialSort);
    setFiltersState(initialFilters);
    setPaginationState(null);
  }, [initialPage, initialLimit, initialSort, initialFilters]);

  // Get query params for API call
  const getQueryParams = useCallback(() => {
    const params: Record<string, string | number> = {
      page,
      limit,
    };

    if (sort) {
      params.sortBy = sort.field;
      params.sortOrder = sort.direction;
    }

    // Add non-empty filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        params[key] = value as string | number;
      }
    });

    return params;
  }, [page, limit, sort, filters]);

  return {
    page,
    limit,
    sort,
    filters,
    pagination,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    setLimit,
    setSort,
    toggleSort,
    setFilter,
    setFilters,
    clearFilters,
    setPagination,
    reset,
    getQueryParams,
    canGoNext,
    canGoPrev,
    totalPages,
    totalItems,
  };
}

export default usePagination;
