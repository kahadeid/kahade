/**
 * Enhanced EmptyState Component
 * Provides consistent empty state UX across the application
 */

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = 'md',
}: EmptyStateProps) {
  const sizeClasses = {
    sm: {
      container: 'py-8',
      icon: 'w-12 h-12 mb-3',
      title: 'text-base',
      description: 'text-sm',
    },
    md: {
      container: 'py-12',
      icon: 'w-16 h-16 mb-4',
      title: 'text-lg',
      description: 'text-base',
    },
    lg: {
      container: 'py-16',
      icon: 'w-20 h-20 mb-6',
      title: 'text-xl',
      description: 'text-lg',
    },
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center px-4',
        sizeClasses[size].container,
        className
      )}
      role="status"
      aria-live="polite"
    >
      {icon && (
        <div
          className={cn(
            'text-muted-foreground',
            sizeClasses[size].icon
          )}
          aria-hidden="true"
        >
          {icon}
        </div>
      )}

      <h3
        className={cn(
          'font-semibold text-foreground mb-2',
          sizeClasses[size].title
        )}
      >
        {title}
      </h3>

      {description && (
        <p
          className={cn(
            'text-muted-foreground max-w-md mb-6',
            sizeClasses[size].description
          )}
        >
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || 'default'}
              size={size}
            >
              {action.label}
            </Button>
          )}

          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="outline"
              size={size}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Common Empty State Variants
 */

import {
  MagnifyingGlass,
  Inbox,
  FolderOpen,
  Package,
  Users,
  FileText,
  Bell,
  ShoppingCart,
} from '@phosphor-icons/react';

export const EmptyStates = {
  NoSearchResults: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={<MagnifyingGlass weight="regular" className="w-full h-full" />}
      title="No results found"
      description="Try adjusting your search or filter criteria"
      {...props}
    />
  ),

  NoTransactions: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={<Inbox weight="regular" className="w-full h-full" />}
      title="No transactions yet"
      description="You haven't made any transactions. Start by creating your first transaction."
      {...props}
    />
  ),

  NoNotifications: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={<Bell weight="regular" className="w-full h-full" />}
      title="No notifications"
      description="You're all caught up! No new notifications at the moment."
      {...props}
    />
  ),

  NoDocuments: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={<FileText weight="regular" className="w-full h-full" />}
      title="No documents"
      description="Upload or create your first document to get started."
      {...props}
    />
  ),

  NoUsers: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={<Users weight="regular" className="w-full h-full" />}
      title="No users found"
      description="No users match your current filters."
      {...props}
    />
  ),

  NoItems: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={<Package weight="regular" className="w-full h-full" />}
      title="No items"
      description="There are no items to display."
      {...props}
    />
  ),

  EmptyCart: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={<ShoppingCart weight="regular" className="w-full h-full" />}
      title="Your cart is empty"
      description="Add items to your cart to get started."
      {...props}
    />
  ),

  EmptyFolder: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={<FolderOpen weight="regular" className="w-full h-full" />}
      title="This folder is empty"
      description="Add files or create new content."
      {...props}
    />
  ),
};

export default EmptyState;
