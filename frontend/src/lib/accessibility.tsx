/**
 * ACCESSIBILITY UTILITIES
 * WCAG 2.1 AAA Compliant Components and Helpers
 * 
 * @version 2.0.0
 * @date 2026-02-14
 */

import { useEffect, useRef } from 'react';

/**
 * Accessibility Helper Functions
 */
export const a11yUtils = {
  /**
   * Generate unique ID for aria-describedby
   */
  generateId: (prefix: string = 'a11y') => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },
  
  /**
   * Announce to screen readers
   */
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },
  
  /**
   * Trap focus within a component (for modals, dialogs)
   */
  trapFocus: (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    };
    
    element.addEventListener('keydown', handleTabKey);
    firstFocusable.focus();
    
    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  },
};

/**
 * Accessibility Hook: Focus Management
 */
export function useFocusManagement(shouldFocus: boolean = false) {
  const ref = useRef<HTMLElement>(null);
  
  useEffect(() => {
    if (shouldFocus && ref.current) {
      ref.current.focus();
    }
  }, [shouldFocus]);
  
  return ref;
}

/**
 * Accessibility Hook: Keyboard Navigation
 */
export function useKeyboardNavigation(
  onEscape?: () => void,
  onEnter?: () => void
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onEscape) {
        onEscape();
      }
      if (event.key === 'Enter' && onEnter) {
        onEnter();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onEscape, onEnter]);
}

/**
 * Accessibility Hook: Announce Route Changes
 */
export function useRouteAnnouncement(location: string) {
  useEffect(() => {
    a11yUtils.announce(`Navigated to ${location}`, 'polite');
  }, [location]);
}

/**
 * ARIA Label Builder
 * Helps create comprehensive aria labels
 */
export const ariaLabel = {
  button: {
    close: (context: string = 'dialog') => ({
      'aria-label': `Close ${context}`,
    }),
    submit: (form: string) => ({
      'aria-label': `Submit ${form}`,
    }),
    delete: (item: string) => ({
      'aria-label': `Delete ${item}`,
    }),
    edit: (item: string) => ({
      'aria-label': `Edit ${item}`,
    }),
    more: () => ({
      'aria-label': 'More options',
      'aria-haspopup': 'menu' as const,
    }),
  },
  
  icon: {
    decorative: () => ({
      'aria-hidden': true as const,
      role: 'presentation' as const,
    }),
    meaningful: (label: string) => ({
      'aria-label': label,
      role: 'img' as const,
    }),
  },
  
  input: (label: string, required: boolean = false, error?: string) => ({
    'aria-label': label,
    'aria-required': required,
    'aria-invalid': !!error,
    'aria-describedby': error ? a11yUtils.generateId('error') : undefined,
  }),
  
  status: (status: string) => ({
    role: 'status' as const,
    'aria-live': 'polite' as const,
    'aria-label': status,
  }),
};

/**
 * Focus Visible Classes
 * Consistent focus indicators
 */
export const focusClasses = {
  ring: 'focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2',
  ringInside: 'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black',
  outline: 'focus:outline-2 focus:outline-black focus:outline-offset-2',
  underline: 'focus:outline-none focus:border-b-2 focus:border-black',
};

/**
 * Skip to Content Link
 * Helps keyboard users skip navigation
 */
export function SkipToContent({ contentId = 'main-content' }: { contentId?: string }) {
  return (
    <a
      href={`#${contentId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-black focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
    >
      Skip to main content
    </a>
  );
}

/**
 * Live Region Announcer Component
 */
export function LiveRegion({ 
  message, 
  priority = 'polite' 
}: { 
  message: string; 
  priority?: 'polite' | 'assertive' 
}) {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}

/**
 * Visually Hidden Component
 * Hides content visually but keeps it for screen readers
 */
export function VisuallyHidden({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
}

/**
 * Accessible Icon Button
 */
interface IconButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
}

export function AccessibleIconButton({
  icon,
  label,
  onClick,
  className = '',
  variant = 'default',
}: IconButtonProps) {
  const variants = {
    default: 'bg-black text-white hover:bg-neutral-800',
    ghost: 'hover:bg-neutral-100',
    outline: 'border border-neutral-300 hover:bg-neutral-50',
  };
  
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`
        inline-flex items-center justify-center
        rounded-lg p-2
        transition-all
        focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2
        ${variants[variant]}
        ${className}
      `}
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  );
}

/**
 * Accessible Link
 * External links with proper attributes
 */
interface AccessibleLinkProps {
  href: string;
  children: React.ReactNode;
  external?: boolean;
  className?: string;
}

export function AccessibleLink({ 
  href, 
  children, 
  external = false,
  className = '' 
}: AccessibleLinkProps) {
  const externalProps = external ? {
    target: '_blank',
    rel: 'noopener noreferrer',
    'aria-label': `${children} (opens in new tab)`,
  } : {};
  
  return (
    <a
      href={href}
      className={`
        underline underline-offset-2
        hover:text-neutral-700
        focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:rounded
        ${className}
      `}
      {...externalProps}
    >
      {children}
      {external && (
        <VisuallyHidden> (opens in new tab)</VisuallyHidden>
      )}
    </a>
  );
}

/**
 * Form Error Message
 */
export function FormError({ 
  error, 
  id 
}: { 
  error?: string; 
  id: string 
}) {
  if (!error) return null;
  
  return (
    <p
      id={id}
      role="alert"
      className="mt-1 text-sm text-error-600"
    >
      {error}
    </p>
  );
}

/**
 * Loading State Announcement
 */
export function LoadingAnnouncement({ loading }: { loading: boolean }) {
  return (
    <LiveRegion 
      message={loading ? 'Loading...' : 'Content loaded'} 
      priority="polite" 
    />
  );
}

/**
 * Accessible Table
 */
export function AccessibleTable({ 
  caption,
  headers,
  data,
}: {
  caption: string;
  headers: string[];
  data: Record<string, any>[];
}) {
  return (
    <table className="min-w-full divide-y divide-neutral-200">
      <caption className="sr-only">{caption}</caption>
      <thead className="bg-neutral-50">
        <tr>
          {headers.map((header, index) => (
            <th
              key={index}
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-neutral-200">
        {data.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {headers.map((header, cellIndex) => (
              <td
                key={cellIndex}
                className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900"
              >
                {row[header.toLowerCase()]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default {
  a11yUtils,
  ariaLabel,
  focusClasses,
  SkipToContent,
  LiveRegion,
  VisuallyHidden,
  AccessibleIconButton,
  AccessibleLink,
  FormError,
  LoadingAnnouncement,
  AccessibleTable,
  useFocusManagement,
  useKeyboardNavigation,
  useRouteAnnouncement,
};
