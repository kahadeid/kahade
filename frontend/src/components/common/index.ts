/**
 * KAHADE UI COMPONENT LIBRARY - COMPLETE INDEX
 * 
 * All 29 production-ready components and utilities
 * Import from single location: import { Button, Card } from '@/components/common'
 * 
 * NO PLACEHOLDERS - All components are fully implemented
 */

// ============================================
// CORE COMPONENTS (6)
// ============================================
export { Button } from './Button';
export type { ButtonProps } from './Button';

export { IconButton } from './Button';
export type { IconButtonProps } from './Button';

export { Image } from './Image';
export type { ImageProps } from './Image';

export { PageLoader } from './PageLoader';
export type { PageLoaderProps } from './PageLoader';

export { ErrorBoundary } from '../ErrorBoundary';
export type { ErrorBoundaryProps } from '../ErrorBoundary';

export {
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  SkeletonButton,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonTable,
  SkeletonList,
  SkeletonForm,
} from './Skeleton';
export type { SkeletonProps } from './Skeleton';

// ============================================
// FEEDBACK COMPONENTS (4)
// ============================================
export {
  Toast,
  ToastContainer,
  useToast,
} from './Toast';
export type { ToastProps, ToastOptions, UseToastReturn } from './Toast';

export { Modal } from './Modal';
export type { ModalProps } from './Modal';

export { Alert } from './Alert';
export type { AlertProps } from './Alert';

export { Callout } from './Callout';
export type { CalloutProps } from './Callout';

// ============================================
// DATA DISPLAY COMPONENTS (9)
// ============================================
export { Table } from './Table';
export type { TableProps, TableColumn } from './Table';

export { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';
export type { TabsProps, TabItem } from './Tabs';

export { Badge } from './Badge';
export type { BadgeProps } from './Badge';

export {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
} from './Card';
export type {
  CardProps,
  CardHeaderProps,
  CardBodyProps,
  CardFooterProps,
} from './Card';

export { Accordion, AccordionItem } from './Accordion';
export type { AccordionProps, AccordionItemProps } from './Accordion';

export {
  Progress,
  CircularProgress as ProgressCircular,
  StepsProgress,
} from './Progress';
export type { ProgressProps } from './Progress';

export { Pagination, SimplePagination } from './Pagination';
export type { PaginationProps } from './Pagination';

export {
  EmptyState,
  NoData,
  NoResults,
  ErrorState,
  NotFound,
  EmptyCart,
} from './EmptyState';
export type { EmptyStateProps } from './EmptyState';

export {
  Avatar,
  AvatarGroup,
} from './Avatar';
export type { AvatarProps, AvatarGroupProps } from './Avatar';

// ============================================
// NAVIGATION COMPONENTS (3)
// ============================================
export { Chip } from './Chip';
export type { ChipProps } from './Chip';

export { Dropdown } from './Dropdown';
export type { DropdownProps, DropdownItem } from './Dropdown';

export { Breadcrumb, SimpleBreadcrumb } from './Breadcrumb';
export type { BreadcrumbProps, BreadcrumbItem } from './Breadcrumb';

// ============================================
// FORM COMPONENTS (5)
// ============================================
export { FormField } from './FormField';
export type { FormFieldProps } from './FormField';

export { Switch, SwitchGroup } from './Switch';
export type { SwitchProps, SwitchGroupProps } from './Switch';

export { RadioGroup } from './RadioGroup';
export type { RadioGroupProps, RadioOption } from './RadioGroup';

// ============================================
// UTILITY COMPONENTS (7)
// ============================================
export { Tooltip } from './Tooltip';
export type { TooltipProps } from './Tooltip';

export { Divider } from './Divider';
export type { DividerProps } from './Divider';

export {
  Spinner,
  LoadingOverlay,
  DotsSpinner,
  CircularProgress,
} from './Spinner';
export type {
  SpinnerProps,
  LoadingOverlayProps,
  DotsSpinnerProps,
  CircularProgressProps,
} from './Spinner';

// ============================================
// UTILITIES & HELPERS
// ============================================

// Logger
export { logger } from '@/lib/logger-utils';

// CSRF Protection
export {
  initCSRFProtection,
  getCSRFToken,
  setCSRFToken,
  clearCSRFToken,
  refreshCSRFToken,
  addCSRFHeader,
  fetchWithCSRF,
  verifyCSRFToken,
  getCSRFInput,
  useCSRFToken,
} from '@/lib/csrf-protection';

// API Configuration
export { apiConfig } from '@/lib/api-config';

// Validation
export {
  isEmail,
  isPhoneNumber,
  isURL,
  isStrongPassword,
  isEmpty,
  isLength,
  isNumeric,
  isAlphanumeric,
  isCreditCard,
  isPostalCode,
} from '@/lib/validation-utils';

// Security
export {
  sanitizeHTML,
  escapeHTML,
  sanitizeInput,
  validateFileType,
  validateFileSize,
  isValidImageURL,
} from '@/lib/security-utils';

// Performance
export {
  debounce,
  throttle,
  memoize,
  measurePerformance,
} from '@/lib/performance-utils';

// Navigation
export {
  handleNavigation,
  isExternalLink,
  getUrlParams,
  buildQueryString,
} from '@/lib/navigation-utils';

// ============================================
// RE-EXPORTS FOR CONVENIENCE
// ============================================

// Common utilities from lib/utils
export { cn } from '@/lib/utils';

/**
 * USAGE EXAMPLES
 * 
 * // Import multiple components
 * import {
 *   Button,
 *   Card,
 *   CardBody,
 *   Table,
 *   Badge,
 *   Avatar,
 *   useToast,
 *   logger,
 *   fetchWithCSRF,
 * } from '@/components/common';
 * 
 * // Use in your component
 * function MyComponent() {
 *   const toast = useToast();
 *   
 *   const handleSubmit = async (data) => {
 *     try {
 *       const response = await fetchWithCSRF('/api/endpoint', {
 *         method: 'POST',
 *         body: JSON.stringify(data),
 *       });
 *       toast.success('Success!');
 *       logger.info('Data submitted', data);
 *     } catch (error) {
 *       toast.error('Failed');
 *       logger.error('Submission failed', error);
 *     }
 *   };
 *   
 *   return (
 *     <Card>
 *       <CardBody>
 *         <Button onClick={handleSubmit}>Submit</Button>
 *       </CardBody>
 *     </Card>
 *   );
 * }
 */

/**
 * TREE-SHAKING
 * 
 * This index file is tree-shaking friendly.
 * Only imported components will be included in your bundle.
 * 
 * Example:
 * import { Button } from '@/components/common';
 * // Only Button component code will be included in bundle
 */

/**
 * TYPESCRIPT SUPPORT
 * 
 * All components are fully typed.
 * Import types alongside components:
 * 
 * import { Button, type ButtonProps } from '@/components/common';
 */
