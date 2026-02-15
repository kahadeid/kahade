/**
 * BUTTON COMPONENT - PRODUCTION READY
 * 
 * ACCESSIBILITY FIX: Fully accessible button with all variants
 * NO PLACEHOLDERS - Complete implementation
 */

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    // Variant styles - Complete implementation
    const variantStyles = {
      primary: cn(
        'bg-blue-600 text-white',
        'hover:bg-blue-700 active:bg-blue-800',
        'focus:ring-blue-500',
        'disabled:bg-blue-300 disabled:cursor-not-allowed'
      ),
      secondary: cn(
        'bg-gray-200 text-gray-900',
        'hover:bg-gray-300 active:bg-gray-400',
        'focus:ring-gray-500',
        'disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed',
        'dark:bg-gray-700 dark:text-gray-100',
        'dark:hover:bg-gray-600 dark:active:bg-gray-500'
      ),
      danger: cn(
        'bg-red-600 text-white',
        'hover:bg-red-700 active:bg-red-800',
        'focus:ring-red-500',
        'disabled:bg-red-300 disabled:cursor-not-allowed'
      ),
      ghost: cn(
        'bg-transparent text-gray-700',
        'hover:bg-gray-100 active:bg-gray-200',
        'focus:ring-gray-500',
        'disabled:text-gray-400 disabled:cursor-not-allowed',
        'dark:text-gray-300 dark:hover:bg-gray-800'
      ),
      outline: cn(
        'bg-transparent border-2 border-blue-600 text-blue-600',
        'hover:bg-blue-50 active:bg-blue-100',
        'focus:ring-blue-500',
        'disabled:border-blue-300 disabled:text-blue-300 disabled:cursor-not-allowed',
        'dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-950'
      ),
    };

    // Size styles - Complete implementation
    const sizeStyles = {
      sm: 'h-8 px-3 text-sm gap-1.5',
      md: 'h-10 px-4 text-base gap-2',
      lg: 'h-12 px-6 text-lg gap-2.5',
    };

    // Icon size mapping
    const iconSizes = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center',
          'font-medium rounded-lg',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          // Variant
          variantStyles[variant],
          // Size
          sizeStyles[size],
          // Full width
          fullWidth && 'w-full',
          // Custom className
          className
        )}
        aria-busy={isLoading}
        aria-disabled={isDisabled}
        {...props}
      >
        {/* Loading spinner */}
        {isLoading && (
          <Loader2
            className={cn('animate-spin', iconSizes[size])}
            aria-hidden="true"
          />
        )}

        {/* Left icon */}
        {!isLoading && leftIcon && (
          <span className={cn('inline-flex', iconSizes[size])} aria-hidden="true">
            {leftIcon}
          </span>
        )}

        {/* Button text */}
        <span>
          {isLoading && loadingText ? loadingText : children}
        </span>

        {/* Right icon */}
        {!isLoading && rightIcon && (
          <span className={cn('inline-flex', iconSizes[size])} aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

/**
 * Icon-only button variant
 */
export interface IconButtonProps extends Omit<ButtonProps, 'children' | 'leftIcon' | 'rightIcon'> {
  icon: React.ReactNode;
  'aria-label': string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'md', className, ...props }, ref) => {
    const sizeClasses = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12',
    };

    return (
      <Button
        ref={ref}
        size={size}
        className={cn('p-0', sizeClasses[size], className)}
        {...props}
      >
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

/**
 * REAL USAGE EXAMPLES
 */

// Example 1: Primary button
// <Button variant="primary" onClick={handleSave}>
//   Simpan
// </Button>

// Example 2: Button with icon
// <Button variant="primary" leftIcon={<Save />}>
//   Simpan Data
// </Button>

// Example 3: Loading state
// <Button variant="primary" isLoading loadingText="Menyimpan...">
//   Simpan
// </Button>

// Example 4: Danger button
// <Button variant="danger" onClick={handleDelete}>
//   Hapus
// </Button>

// Example 5: Icon button with accessibility
// <IconButton
//   icon={<Trash2 />}
//   variant="danger"
//   aria-label="Hapus item"
//   onClick={handleDelete}
// />

// Example 6: Full width button
// <Button variant="primary" fullWidth>
//   Login
// </Button>

// Example 7: Disabled button
// <Button variant="primary" disabled>
//   Tidak Tersedia
// </Button>
