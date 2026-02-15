/**
 * KAHADE BUTTON SYSTEM
 * Standardized button variants and sizes
 * 
 * @version 2.0.0
 * @date 2026-02-14
 */

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/ui-utils';

/**
 * Button Variants
 */
export const buttonVariants = {
  // Primary action button (black background)
  primary: 'bg-black text-white hover:bg-neutral-800 active:bg-neutral-900',
  
  // Secondary action button (outlined)
  secondary: 'bg-white text-black border-2 border-black hover:bg-neutral-50 active:bg-neutral-100',
  
  // Tertiary action button (ghost)
  ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200',
  
  // Destructive action (red)
  destructive: 'bg-error-600 text-white hover:bg-error-700 active:bg-error-800',
  
  // Success action (green)
  success: 'bg-success-600 text-white hover:bg-success-700 active:bg-success-800',
  
  // Link style
  link: 'bg-transparent text-black underline-offset-4 hover:underline',
  
  // Outlined variant
  outline: 'bg-transparent border border-neutral-300 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400',
} as const;

/**
 * Button Sizes
 */
export const buttonSizes = {
  sm: 'h-9 px-3 text-sm rounded-lg',
  md: 'h-11 px-4 text-base rounded-lg',
  lg: 'h-13 px-6 text-lg rounded-xl',
  icon: 'h-10 w-10 p-0 rounded-lg',
} as const;

/**
 * Base button classes
 */
const baseClasses = `
  inline-flex items-center justify-center
  font-medium
  transition-all duration-200
  focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2
  disabled:opacity-50 disabled:pointer-events-none
  cursor-pointer
`;

export interface StandardButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

/**
 * Standardized Button Component
 */
export const StandardButton = forwardRef<HTMLButtonElement, StandardButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    className,
    children,
    disabled,
    ...props
  }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseClasses,
          buttonVariants[variant],
          buttonSizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading && (
          <span 
            className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        )}
        {leftIcon && !isLoading && (
          <span className="mr-2" aria-hidden="true">{leftIcon}</span>
        )}
        {children}
        {rightIcon && (
          <span className="ml-2" aria-hidden="true">{rightIcon}</span>
        )}
      </button>
    );
  }
);

StandardButton.displayName = 'StandardButton';

/**
 * Button Usage Guide
 */
export const buttonUsageGuide = {
  /**
   * When to use each variant
   */
  usage: {
    primary: [
      'Main call-to-action (e.g., Submit, Save, Create)',
      'Form submission',
      'Primary navigation action',
    ],
    secondary: [
      'Alternative important action',
      'Cancel paired with primary',
      'Secondary navigation',
    ],
    ghost: [
      'Tertiary actions',
      'Icon buttons',
      'Less important actions',
    ],
    destructive: [
      'Delete actions',
      'Irreversible operations',
      'Warning actions',
    ],
    success: [
      'Confirmation actions',
      'Positive feedback',
      'Completion states',
    ],
    link: [
      'Navigation that looks like text',
      'Inline actions in content',
    ],
    outline: [
      'Equal weight options',
      'Filter buttons',
      'Tab-like navigation',
    ],
  },
  
  /**
   * Size guidelines
   */
  sizes: {
    sm: 'Compact spaces, data tables, inline actions',
    md: 'Standard forms and pages (default)',
    lg: 'Landing pages, hero sections, prominent CTAs',
    icon: 'Icon-only buttons (must have aria-label)',
  },
  
  /**
   * Accessibility requirements
   */
  accessibility: {
    required: [
      'Always provide meaningful text or aria-label',
      'Use aria-label for icon-only buttons',
      'Add aria-describedby for additional context',
      'Set aria-disabled="true" when loading',
      'Include loading state announcement',
    ],
    recommended: [
      'Use semantic HTML (<button> not <div>)',
      'Minimum 44x44px touch target on mobile',
      'Clear focus indicators (focus ring)',
      'Disabled state should be obvious visually',
    ],
  },
};

/**
 * Examples
 */
export const ButtonExamples = () => {
  return (
    <div className="space-y-8 p-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Variants</h3>
        <div className="flex flex-wrap gap-4">
          <StandardButton variant="primary">Primary</StandardButton>
          <StandardButton variant="secondary">Secondary</StandardButton>
          <StandardButton variant="ghost">Ghost</StandardButton>
          <StandardButton variant="destructive">Destructive</StandardButton>
          <StandardButton variant="success">Success</StandardButton>
          <StandardButton variant="link">Link</StandardButton>
          <StandardButton variant="outline">Outline</StandardButton>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Sizes</h3>
        <div className="flex flex-wrap items-center gap-4">
          <StandardButton size="sm">Small</StandardButton>
          <StandardButton size="md">Medium</StandardButton>
          <StandardButton size="lg">Large</StandardButton>
          <StandardButton size="icon" aria-label="Icon button">
            →
          </StandardButton>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">States</h3>
        <div className="flex flex-wrap gap-4">
          <StandardButton>Default</StandardButton>
          <StandardButton isLoading>Loading</StandardButton>
          <StandardButton disabled>Disabled</StandardButton>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">With Icons</h3>
        <div className="flex flex-wrap gap-4">
          <StandardButton leftIcon={<span>←</span>}>Back</StandardButton>
          <StandardButton rightIcon={<span>→</span>}>Next</StandardButton>
        </div>
      </div>
    </div>
  );
};

export default StandardButton;
