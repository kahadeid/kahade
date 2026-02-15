// ============================================================================
// HOOKS INDEX
// Central export for all custom hooks
// ============================================================================

// API and data fetching hooks
export { useApi, useApiOnMount } from "./useApi";
export { usePagination } from "./usePagination";

// Performance optimization hooks
export { useDebounce, useDebouncedCallback, useDebounceWithPending } from "./useDebounce";
export { usePersistFn } from "./usePersistFn";

// UI and composition hooks
export { useComposition } from "./useComposition";
export { useIsMobile } from "./useMobile";

// Error handling and utilities
export { useErrorHandler } from "./useErrorHandler";
