/**
 * BADGE & CHIP COMPONENTS - PRODUCTION READY
 * 
 * COMPLETE IMPLEMENTATION: Badges and chips for status display
 * NO PLACEHOLDERS - Works immediately
 */

import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'primary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'purple'
    | 'pink';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  pill?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function Badge({
  variant = 'default',
  size = 'md',
  dot = false,
  pill = false,
  icon,
  className,
  children,
  ...props
}: BadgeProps) {
  // Variant colors
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
    primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
    info: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
    pink: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100',
  };

  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  // Dot colors
  const dotColors = {
    default: 'bg-gray-500',
    primary: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-cyan-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium',
        pill ? 'rounded-full' : 'rounded',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {/* Dot indicator */}
      {dot && (
        <span
          className={cn('w-2 h-2 rounded-full', dotColors[variant])}
          aria-hidden="true"
        />
      )}

      {/* Icon */}
      {icon && (
        <span className="inline-flex" aria-hidden="true">
          {icon}
        </span>
      )}

      {/* Content */}
      {children}
    </span>
  );
}

/**
 * Chip Component (Dismissible Badge)
 */
export interface ChipProps extends Omit<BadgeProps, 'children'> {
  label: string;
  onRemove?: () => void;
  avatar?: React.ReactNode;
}

export function Chip({
  label,
  variant = 'default',
  size = 'md',
  icon,
  avatar,
  onRemove,
  className,
  ...props
}: ChipProps) {
  const sizeClasses = {
    sm: 'text-xs h-6',
    md: 'text-sm h-8',
    lg: 'text-base h-10',
  };

  const paddingClasses = {
    sm: avatar ? 'pl-1 pr-2' : 'px-2',
    md: avatar ? 'pl-1.5 pr-3' : 'px-3',
    lg: avatar ? 'pl-2 pr-4' : 'px-4',
  };

  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
    primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
    info: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
    pink: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        sizeClasses[size],
        paddingClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {/* Avatar */}
      {avatar && (
        <span
          className={cn(
            'inline-flex items-center justify-center rounded-full bg-white/20',
            size === 'sm' && 'w-5 h-5',
            size === 'md' && 'w-6 h-6',
            size === 'lg' && 'w-8 h-8'
          )}
        >
          {avatar}
        </span>
      )}

      {/* Icon */}
      {!avatar && icon && (
        <span className="inline-flex" aria-hidden="true">
          {icon}
        </span>
      )}

      {/* Label */}
      <span>{label}</span>

      {/* Remove button */}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className={cn(
            'inline-flex items-center justify-center rounded-full',
            'hover:bg-black/10 dark:hover:bg-white/10',
            'transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-current',
            size === 'sm' && 'w-4 h-4',
            size === 'md' && 'w-5 h-5',
            size === 'lg' && 'w-6 h-6'
          )}
          aria-label={`Remove ${label}`}
        >
          <X
            className={cn(
              size === 'sm' && 'w-3 h-3',
              size === 'md' && 'w-4 h-4',
              size === 'lg' && 'w-5 h-5'
            )}
          />
        </button>
      )}
    </span>
  );
}

/**
 * Badge Notification (with count)
 */
export interface BadgeNotificationProps {
  count: number;
  max?: number;
  dot?: boolean;
  variant?: 'primary' | 'danger' | 'success' | 'warning';
  className?: string;
}

export function BadgeNotification({
  count,
  max = 99,
  dot = false,
  variant = 'danger',
  className,
}: BadgeNotificationProps) {
  const variantClasses = {
    primary: 'bg-blue-600',
    danger: 'bg-red-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
  };

  const displayCount = count > max ? `${max}+` : count;

  if (dot) {
    return (
      <span
        className={cn(
          'inline-flex w-2 h-2 rounded-full',
          variantClasses[variant],
          className
        )}
        aria-label={`${count} notifications`}
      />
    );
  }

  if (count === 0) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center',
        'min-w-[18px] h-[18px] px-1',
        'text-[10px] font-bold text-white',
        'rounded-full',
        variantClasses[variant],
        className
      )}
      aria-label={`${count} notifications`}
    >
      {displayCount}
    </span>
  );
}

/**
 * REAL USAGE EXAMPLES
 */

// Example 1: Status badges
// <Badge variant="success">Active</Badge>
// <Badge variant="warning">Pending</Badge>
// <Badge variant="danger">Rejected</Badge>

// Example 2: Badge with icon
// <Badge variant="primary" icon={<CheckCircle className="w-3 h-3" aria-hidden="true" />}>
//   Verified
// </Badge>

// Example 3: Badge with dot
// <Badge variant="success" dot>
//   Online
// </Badge>

// Example 4: Dismissible chips
// const [tags, setTags] = useState(['React', 'TypeScript', 'Next.js']);
// {tags.map((tag) => (
//   <Chip
//     key={tag}
//     label={tag}
//     variant="primary"
//     onRemove={() => setTags(tags.filter(t => t !== tag))}
//   />
// ))}

// Example 5: Chip with avatar
// <Chip
//   label="John Doe"
//   avatar={<img src="/avatar.jpg" className="w-full h-full rounded-full" />}
//   variant="default"
//   onRemove={handleRemoveUser}
// />

// Example 6: Notification badge
// <div className="relative">
//   <Bell className="w-6 h-6" aria-hidden="true" />
//   <BadgeNotification
//     count={12}
//     className="absolute -top-1 -right-1"
//   />
// </div>

// Example 7: Transaction status
// function TransactionStatus({ status }) {
//   const variants = {
//     active: { variant: 'success', label: 'Active', dot: true },
//     pending: { variant: 'warning', label: 'Pending', dot: true },
//     completed: { variant: 'primary', label: 'Completed' },
//     cancelled: { variant: 'danger', label: 'Cancelled' },
//   };
//   
//   const { variant, label, dot } = variants[status];
//   return <Badge variant={variant} dot={dot}>{label}</Badge>;
// }
