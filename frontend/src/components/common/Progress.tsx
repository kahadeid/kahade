/**
 * PROGRESS BAR COMPONENTS - PRODUCTION READY
 * 
 * COMPLETE IMPLEMENTATION: Progress bars for loading states
 * NO PLACEHOLDERS - Works immediately
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  showLabel?: boolean;
  label?: string;
  indeterminate?: boolean;
  className?: string;
}

export function Progress({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  label,
  indeterminate = false,
  className,
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  // Size classes
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  // Variant colors
  const variantClasses = {
    default: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    danger: 'bg-red-600',
    info: 'bg-cyan-600',
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Label */}
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="text-gray-700 dark:text-gray-300">
            {label || 'Progress'}
          </span>
          {showLabel && !indeterminate && (
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      {/* Progress bar */}
      <div
        className={cn(
          'w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden',
          sizeClasses[size]
        )}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            variantClasses[variant],
            indeterminate && 'animate-progress-indeterminate'
          )}
          style={{
            width: indeterminate ? '40%' : `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

/**
 * Circular Progress
 */
export interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 64,
  strokeWidth = 4,
  variant = 'default',
  showLabel = false,
  label,
  className,
}: CircularProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  // Variant colors
  const variantColors = {
    default: 'text-blue-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
    info: 'text-cyan-600',
  };

  return (
    <div className={cn('inline-flex flex-col items-center gap-2', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />

          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={cn(
              'transition-all duration-300',
              variantColors[variant]
            )}
          />
        </svg>

        {/* Center label */}
        {showLabel && (
          <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
      </div>

      {/* Bottom label */}
      {label && (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {label}
        </span>
      )}
    </div>
  );
}

/**
 * Progress Steps
 */
export interface Step {
  id: string;
  label: string;
  description?: string;
}

export interface ProgressStepsProps {
  steps: Step[];
  currentStep: number;
  variant?: 'default' | 'success';
  className?: string;
}

export function ProgressSteps({
  steps,
  currentStep,
  variant = 'default',
  className,
}: ProgressStepsProps) {
  const activeColor = variant === 'success' ? 'bg-green-600 border-green-600' : 'bg-blue-600 border-blue-600';
  const activeTextColor = variant === 'success' ? 'text-green-600' : 'text-blue-600';

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <React.Fragment key={step.id}>
              {/* Step */}
              <div className="flex flex-col items-center">
                {/* Circle */}
                <div
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all',
                    isCompleted && cn(activeColor, 'text-white'),
                    isActive && cn('border-blue-600 bg-blue-100 dark:bg-blue-900', activeTextColor),
                    isUpcoming && 'border-gray-300 bg-white dark:bg-gray-800 text-gray-400'
                  )}
                >
                  {isCompleted ? (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>

                {/* Label */}
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      (isCompleted || isActive) ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'
                    )}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2 transition-all',
                    index < currentStep ? activeColor : 'bg-gray-300 dark:bg-gray-700'
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

/**
 * REAL USAGE EXAMPLES
 */

// Example 1: Basic progress bar
// <Progress value={75} showLabel />

// Example 2: File upload progress
// <Progress
//   value={uploadProgress}
//   label="Uploading..."
//   showLabel
//   variant="success"
// />

// Example 3: Indeterminate loading
// <Progress indeterminate label="Processing..." />

// Example 4: Circular progress
// <CircularProgress
//   value={85}
//   showLabel
//   variant="success"
//   label="Completed"
// />

// Example 5: Progress steps
// <ProgressSteps
//   currentStep={1}
//   steps={[
//     { id: '1', label: 'Create Transaction', description: 'Fill details' },
//     { id: '2', label: 'Payment', description: 'Send payment' },
//     { id: '3', label: 'Confirmation', description: 'Wait confirmation' },
//     { id: '4', label: 'Complete', description: 'Transaction done' },
//   ]}
// />

// Example 6: Transaction status with progress
// function TransactionProgress({ transaction }) {
//   const steps = [
//     { id: 'created', label: 'Created' },
//     { id: 'paid', label: 'Paid' },
//     { id: 'shipped', label: 'Shipped' },
//     { id: 'delivered', label: 'Delivered' },
//   ];
//   
//   const currentStepIndex = steps.findIndex(s => s.id === transaction.status);
//   
//   return (
//     <div>
//       <ProgressSteps
//         steps={steps}
//         currentStep={currentStepIndex}
//         variant="success"
//       />
//     </div>
//   );
// }
