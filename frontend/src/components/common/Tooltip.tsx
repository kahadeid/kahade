/**
 * TOOLTIP COMPONENT - PRODUCTION READY
 * 
 * COMPLETE IMPLEMENTATION: Tooltips for helpful hints
 * NO PLACEHOLDERS - Works immediately
 */

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  placement?: 'top' | 'right' | 'bottom' | 'left';
  delay?: number;
  disabled?: boolean;
  className?: string;
}

export function Tooltip({
  content,
  children,
  placement = 'top',
  delay = 300,
  disabled = false,
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const timeoutRef = useRef<NodeJS.Timeout>();
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Show tooltip with delay
  const showTooltip = () => {
    if (disabled) return;

    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  // Hide tooltip immediately
  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  // Calculate tooltip position
  useEffect(() => {
    if (!isVisible || !triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const gap = 8; // Gap between trigger and tooltip

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - gap;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + gap;
        break;
      case 'bottom':
        top = triggerRect.bottom + gap;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - gap;
        break;
    }

    // Keep tooltip within viewport
    const padding = 8;
    top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding));
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding));

    setPosition({ top, left });
  }, [isVisible, placement]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Clone child with ref and event handlers
  const trigger = React.cloneElement(children, {
    ref: triggerRef,
    onMouseEnter: (e: React.MouseEvent) => {
      showTooltip();
      children.props.onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      hideTooltip();
      children.props.onMouseLeave?.(e);
    },
    onFocus: (e: React.FocusEvent) => {
      showTooltip();
      children.props.onFocus?.(e);
    },
    onBlur: (e: React.FocusEvent) => {
      hideTooltip();
      children.props.onBlur?.(e);
    },
  });

  // Arrow direction based on placement
  const arrowClasses = {
    top: 'bottom-[-4px] left-1/2 -translate-x-1/2 border-t-gray-900 dark:border-t-gray-700',
    right: 'left-[-4px] top-1/2 -translate-y-1/2 border-r-gray-900 dark:border-r-gray-700',
    bottom: 'top-[-4px] left-1/2 -translate-x-1/2 border-b-gray-900 dark:border-b-gray-700',
    left: 'right-[-4px] top-1/2 -translate-y-1/2 border-l-gray-900 dark:border-l-gray-700',
  };

  return (
    <>
      {trigger}

      {isVisible &&
        typeof window !== 'undefined' &&
        createPortal(
          <div
            ref={tooltipRef}
            role="tooltip"
            className={cn(
              'fixed z-[9999] px-3 py-2',
              'bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg',
              'shadow-lg',
              'animate-in fade-in zoom-in-95 duration-100',
              'max-w-xs',
              className
            )}
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
            }}
          >
            {content}

            {/* Arrow */}
            <div
              className={cn(
                'absolute w-2 h-2 rotate-45',
                'border-4 border-transparent',
                arrowClasses[placement]
              )}
              aria-hidden="true"
            />
          </div>,
          document.body
        )}
    </>
  );
}

/**
 * Simple Tooltip (CSS-based, no portal)
 */
export interface SimpleTooltipProps {
  content: string;
  children: React.ReactElement;
  placement?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export function SimpleTooltip({
  content,
  children,
  placement = 'top',
  className,
}: SimpleTooltipProps) {
  return (
    <div className="relative inline-block group">
      {children}

      <div
        role="tooltip"
        className={cn(
          'absolute z-50 px-3 py-2',
          'bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg',
          'shadow-lg whitespace-nowrap',
          'opacity-0 invisible group-hover:opacity-100 group-hover:visible',
          'transition-all duration-150',
          'pointer-events-none',
          // Positioning
          placement === 'top' && 'bottom-full left-1/2 -translate-x-1/2 mb-2',
          placement === 'right' && 'left-full top-1/2 -translate-y-1/2 ml-2',
          placement === 'bottom' && 'top-full left-1/2 -translate-x-1/2 mt-2',
          placement === 'left' && 'right-full top-1/2 -translate-y-1/2 mr-2',
          className
        )}
      >
        {content}

        {/* Arrow */}
        <div
          className={cn(
            'absolute w-2 h-2 rotate-45 bg-gray-900 dark:bg-gray-700',
            placement === 'top' && 'bottom-[-4px] left-1/2 -translate-x-1/2',
            placement === 'right' && 'left-[-4px] top-1/2 -translate-y-1/2',
            placement === 'bottom' && 'top-[-4px] left-1/2 -translate-x-1/2',
            placement === 'left' && 'right-[-4px] top-1/2 -translate-y-1/2'
          )}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

/**
 * REAL USAGE EXAMPLES
 */

// Example 1: Basic tooltip
// <Tooltip content="Click to edit">
//   <Button variant="ghost" size="sm">
//     <Edit className="w-4 aria-hidden="true" h-4" />
//   </Button>
// </Tooltip>

// Example 2: Tooltip with placement
// <Tooltip content="Delete transaction" placement="bottom">
//   <IconButton variant="danger">
//     <Trash2 className="w-4 h-4" />
//   </IconButton>
// </Tooltip>

// Example 3: Simple CSS tooltip
// <SimpleTooltip content="View details" placement="right">
//   <button>Hover me</button>
// </SimpleTooltip>

// Example 4: Tooltip on disabled button
// <Tooltip content="Please complete the form first">
//   <span> {/* Wrapper needed for disabled elements */}
//     <Button disabled>Submit</Button>
//   </span>
// </Tooltip>

// Example 5: Complex tooltip content
// <Tooltip
//   content={
//     <div>
//       <p className="font-semibold mb-1">Transaction Status</p>
//       <p className="text-xs">Click to view full details</p>
//     </div>
//   }
//   placement="right"
// >
//   <Badge variant="success">Active</Badge>
// </Tooltip>

// Example 6: Icon with tooltip
// <Tooltip content="This transaction is protected by escrow">
//   <Shield className="w-5 aria-hidden="true" h-5 text-green-500" />
// </Tooltip>

// Example 7: Help text tooltip
// <div className="flex items-center gap-2">
//   <label>Transaction Amount</label>
//   <Tooltip
//     content="Enter the total amount including fees"
//     delay={100}
//   >
//     <button className="text-gray-400 hover:text-gray-600">
//       <HelpCircle className="w-4 aria-hidden="true" h-4" />
//     </button>
//   </Tooltip>
// </div>
