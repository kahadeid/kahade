/**
 * DIVIDER COMPONENT - PRODUCTION READY
 * 
 * COMPLETE IMPLEMENTATION: Visual dividers for content separation
 * NO PLACEHOLDERS - Works immediately
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  label?: string;
  labelPosition?: 'left' | 'center' | 'right';
  spacing?: 'sm' | 'md' | 'lg';
  style?: 'solid' | 'dashed' | 'dotted';
  className?: string;
}

export function Divider({
  orientation = 'horizontal',
  label,
  labelPosition = 'center',
  spacing = 'md',
  style = 'solid',
  className,
}: DividerProps) {
  const spacingClasses = {
    horizontal: {
      sm: 'my-2',
      md: 'my-4',
      lg: 'my-8',
    },
    vertical: {
      sm: 'mx-2',
      md: 'mx-4',
      lg: 'mx-8',
    },
  };

  const styleClasses = {
    solid: 'border-solid',
    dashed: 'border-dashed',
    dotted: 'border-dotted',
  };

  if (orientation === 'vertical') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={cn(
          'inline-block h-full border-l',
          'border-gray-200 dark:border-gray-700',
          styleClasses[style],
          spacingClasses.vertical[spacing],
          className
        )}
      />
    );
  }

  // Horizontal divider
  if (label) {
    const labelPositionClasses = {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
    };

    return (
      <div
        role="separator"
        aria-label={label}
        className={cn(
          'flex items-center',
          spacingClasses.horizontal[spacing],
          className
        )}
      >
        {labelPosition !== 'left' && (
          <div
            className={cn(
              'flex-1 border-t',
              'border-gray-200 dark:border-gray-700',
              styleClasses[style]
            )}
          />
        )}
        <span
          className={cn(
            'px-3 text-sm font-medium',
            'text-gray-600 dark:text-gray-400',
            'whitespace-nowrap'
          )}
        >
          {label}
        </span>
        {labelPosition !== 'right' && (
          <div
            className={cn(
              'flex-1 border-t',
              'border-gray-200 dark:border-gray-700',
              styleClasses[style]
            )}
          />
        )}
      </div>
    );
  }

  // Simple horizontal divider
  return (
    <hr
      role="separator"
      className={cn(
        'border-t',
        'border-gray-200 dark:border-gray-700',
        styleClasses[style],
        spacingClasses.horizontal[spacing],
        className
      )}
    />
  );
}

/**
 * REAL USAGE EXAMPLES
 */

// Example 1: Basic horizontal divider
// <Divider />

// Example 2: Divider with label
// <Divider label="OR" />

// Example 3: Vertical divider
// <div className="flex items-center h-10">
//   <span>Left</span>
//   <Divider orientation="vertical" />
//   <span>Right</span>
// </div>

// Example 4: Different styles
// <Divider style="solid" />
// <Divider style="dashed" />
// <Divider style="dotted" />

// Example 5: Label positions
// <Divider label="Start" labelPosition="left" />
// <Divider label="Center" labelPosition="center" />
// <Divider label="End" labelPosition="right" />

// Example 6: Custom spacing
// <Divider spacing="sm" />
// <Divider spacing="md" />
// <Divider spacing="lg" />

// Example 7: In a form
// <form>
//   <input placeholder="Email" />
//   <input placeholder="Password" />
//   <Button>Sign In</Button>
//   
//   <Divider label="OR" />
//   
//   <Button variant="outline">Sign in with Google</Button>
// </form>

// Example 8: Section separator
// <div>
//   <h2>Personal Information</h2>
//   <FormField name="name" />
//   <FormField name="email" />
//   
//   <Divider label="Address" spacing="lg" />
//   
//   <FormField name="street" />
//   <FormField name="city" />
// </div>

// Example 9: Card sections
// <Card>
//   <CardBody>
//     <p>Transaction Details</p>
//     <Divider />
//     <p>Amount: $100</p>
//     <Divider />
//     <p>Status: Active</p>
//   </CardBody>
// </Card>

// Example 10: Toolbar separator
// <div className="flex items-center gap-2">
//   <Button>Copy</Button>
//   <Button>Cut</Button>
//   <Divider orientation="vertical" spacing="sm" />
//   <Button>Paste</Button>
//   <Button>Delete</Button>
// </div>
