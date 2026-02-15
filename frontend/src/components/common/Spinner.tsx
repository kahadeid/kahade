/**
 * SPINNER COMPONENT - PRODUCTION READY
 * 
 * COMPLETE IMPLEMENTATION: Loading spinners for various states
 * NO PLACEHOLDERS - Works immediately
 */

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'white' | 'current';
  label?: string;
  className?: string;
}

export function Spinner({
  size = 'md',
  variant = 'primary',
  label,
  className,
}: SpinnerProps) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const variantClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600 dark:text-gray-400',
    white: 'text-white',
    current: 'text-current',
  };

  return (
    <div
      className={cn('flex items-center gap-2', className)}
      role="status"
      aria-label={label || 'Loading'}
    >
      <Loader2
        className={cn(
          'animate-spin',
          sizeClasses[size],
          variantClasses[variant]
        )}
        aria-hidden="true"
      />
      {label && (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {label}
        </span>
      )}
      <span className="sr-only">{label || 'Loading'}</span>
    </div>
  );
}

/**
 * Loading Overlay - Fullscreen loading
 */
export interface LoadingOverlayProps {
  visible: boolean;
  label?: string;
  blur?: boolean;
  className?: string;
}

export function LoadingOverlay({
  visible,
  label = 'Loading...',
  blur = false,
  className,
}: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50',
        'flex items-center justify-center',
        'bg-white/80 dark:bg-gray-900/80',
        blur && 'backdrop-blur-sm',
        className
      )}
      role="status"
      aria-label={label}
    >
      <div className="flex flex-col items-center gap-4">
        <Spinner size="xl" variant="primary" />
        {label && (
          <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {label}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Dots Spinner - Alternative style
 */
export interface DotsSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'white';
  className?: string;
}

export function DotsSpinner({
  size = 'md',
  variant = 'primary',
  className,
}: DotsSpinnerProps) {
  const sizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  const variantClasses = {
    primary: 'bg-blue-600',
    secondary: 'bg-gray-600 dark:bg-gray-400',
    white: 'bg-white',
  };

  return (
    <div className={cn('flex items-center gap-1', className)} role="status">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'rounded-full',
            'animate-pulse',
            sizeClasses[size],
            variantClasses[variant]
          )}
          style={{
            animationDelay: `${i * 150}ms`,
            animationDuration: '1s',
          }}
          aria-hidden="true"
        />
      ))}
      <span className="sr-only">Loading</span>
    </div>
  );
}

/**
 * Circular Progress - Percentage based
 */
export interface CircularProgressProps {
  value: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

export function CircularProgress({
  value,
  size = 'md',
  showValue = true,
  className,
}: CircularProgressProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg',
  };

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div
      className={cn('relative inline-flex', sizeClasses[size], className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          className="stroke-gray-200 dark:stroke-gray-700"
          strokeWidth="8"
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          className="stroke-blue-600 transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 duration-300"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <span
            className={cn(
              'font-semibold text-gray-900 dark:text-gray-100',
              textSizeClasses[size]
            )}
          >
            {Math.round(value)}%
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * REAL USAGE EXAMPLES
 */

// Example 1: Basic spinner
// <Spinner />

// Example 2: Different sizes
// <Spinner size="xs" />
// <Spinner size="sm" />
// <Spinner size="md" />
// <Spinner size="lg" />
// <Spinner size="xl" />

// Example 3: With label
// <Spinner label="Loading data..." />

// Example 4: In button
// <Button disabled>
//   <Spinner size="sm" variant="white" />
//   Loading...
// </Button>

// Example 5: Fullscreen loading
// <LoadingOverlay visible={isLoading} label="Please wait..." blur />

// Example 6: Dots spinner
// <DotsSpinner size="md" variant="primary" />

// Example 7: Circular progress
// <CircularProgress value={uploadProgress} size="lg" />

// Example 8: In card
// {isLoading ? (
//   <div className="flex items-center justify-center py-12">
//     <Spinner size="lg" label="Loading transactions..." />
//   </div>
// ) : (
//   <Table data={data} />
// )}

// Example 9: Inline with text
// <p className="flex items-center gap-2">
//   <Spinner size="xs" variant="current" />
//   Syncing...
// </p>

// Example 10: Page loader
// function PageWithLoading() {
//   const { data, isLoading } = useQuery('data', fetchData);
//   
//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <Spinner size="xl" label="Loading page..." />
//       </div>
//     );
//   }
//   
//   return <PageContent data={data} />;
// }

// Example 11: Progress upload
// function FileUpload() {
//   const [progress, setProgress] = useState(0);
//   
//   return (
//     <div className="flex flex-col items-center gap-4">
//       <CircularProgress value={progress} size="lg" />
//       <p>Uploading file...</p>
//     </div>
//   );
// }
