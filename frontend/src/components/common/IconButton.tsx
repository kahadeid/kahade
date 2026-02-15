/**
 * ACCESSIBLE ICON BUTTON COMPONENT
 * 
 * ACCESSIBILITY FIX [FE-A11Y-002]: Buttons Without ARIA Labels
 * 
 * This component enforces accessibility for icon-only buttons:
 * - aria-label is REQUIRED for screen readers
 * - Proper keyboard navigation
 * - Loading and disabled states
 * - Focus visible styles
 */

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from '@phosphor-icons/react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Accessible label for screen readers - REQUIRED
   * Describes what the button does
   */
  'aria-label': string;
  
  /**
   * Icon element to display
   */
  icon?: React.ReactNode;
  
  /**
   * Loading state
   */
  isLoading?: boolean;
  
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Visual variant
   */
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
}

const sizeClasses = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-12 w-12 text-lg',
};

const variantClasses = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
};

/**
 * Accessible Icon Button Component
 * 
 * Usage:
 * ```tsx
 * <IconButton 
 *   icon={<X />} 
 *   aria-label="Close dialog"
 *   onClick={handleClose}
 * />
 * ```
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>((
  {
    'aria-label': ariaLabel,
    icon,
    isLoading = false,
    size = 'md',
    variant = 'ghost',
    className,
    disabled,
    children,
    ...props
  },
  ref
) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      ref={ref}
      type="button"
      aria-label={ariaLabel}
      aria-busy={isLoading}
      aria-disabled={isDisabled}
      disabled={isDisabled}
      className={cn(
        // Base styles
        'inline-flex items-center justify-center rounded-md font-medium',
        'transition-colors focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        // Size
        sizeClasses[size],
        // Variant
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Spinner className="animate-spin" weight="bold" aria-hidden="true" />
      ) : (
        icon || children
      )}
    </button>
  );
});

IconButton.displayName = 'IconButton';

/**
 * Common icon button variants for consistency
 */

interface CloseButtonProps extends Omit<IconButtonProps, 'icon' | 'aria-label'> {
  /**
   * Optional custom aria-label (defaults to "Close")
   */
  'aria-label'?: string;
}

export function CloseButton({ 'aria-label': ariaLabel = 'Tutup', ...props }: CloseButtonProps) {
  return (
    <IconButton
      aria-label={ariaLabel}
      icon={
        <svg
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
            fill="currentColor"
            fillRule="evenodd"
            clipRule="evenodd"
          />
        </svg>
      }
      {...props}
    />
  );
}

interface MenuButtonProps extends Omit<IconButtonProps, 'icon' | 'aria-label'> {
  /**
   * Optional custom aria-label (defaults to "Menu")
   */
  'aria-label'?: string;
  /**
   * Is menu open?
   */
  isOpen?: boolean;
}

export function MenuButton({ 
  'aria-label': ariaLabel,
  isOpen = false,
  ...props 
}: MenuButtonProps) {
  return (
    <IconButton
      aria-label={ariaLabel || (isOpen ? 'Tutup menu' : 'Buka menu')}
      aria-expanded={isOpen}
      icon={
        <svg
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {isOpen ? (
            <path
              d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            />
          ) : (
            <>
              <path
                d="M1.5 3C1.22386 3 1 3.22386 1 3.5C1 3.77614 1.22386 4 1.5 4H13.5C13.7761 4 14 3.77614 14 3.5C14 3.22386 13.7761 3 13.5 3H1.5Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              />
              <path
                d="M1 7.5C1 7.22386 1.22386 7 1.5 7H13.5C13.7761 7 14 7.22386 14 7.5C14 7.77614 13.7761 8 13.5 8H1.5C1.22386 8 1 7.77614 1 7.5Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              />
              <path
                d="M1 11.5C1 11.2239 1.22386 11 1.5 11H13.5C13.7761 11 14 11.2239 14 11.5C14 11.7761 13.7761 12 13.5 12H1.5C1.22386 12 1 11.7761 1 11.5Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              />
            </>
          )}
        </svg>
      }
      {...props}
    />
  );
}

/**
 * MIGRATION GUIDE
 * 
 * Replace icon buttons without labels:
 * 
 * Before:
 * <button onClick={handleClose}>
 *   <X />
 * </button>
 * 
 * After:
 * <IconButton 
 *   icon={<X />} 
 *   aria-label="Close dialog"
 *   onClick={handleClose}
 * />
 * 
 * Or use common variants:
 * <CloseButton onClick={handleClose} />
 * <MenuButton onClick={toggleMenu} isOpen={isOpen} />
 */
