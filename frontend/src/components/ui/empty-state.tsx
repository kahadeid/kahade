import { ReactNode } from "react";
import { cn } from "@/lib/ui-utils";
import { Button } from "./button";

// ============================================================================
// EMPTY STATE COMPONENT
// Provides consistent empty state displays across the application
// ============================================================================

interface EmptyStateProps {
  /** Icon to display */
  icon?: ReactNode;
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Primary action button */
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary";
  };
  /** Secondary action button */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** Additional content */
  children?: ReactNode;
  /** Custom class name */
  className?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  children,
  className,
  size = "md",
}: EmptyStateProps) {
  const sizeClasses = {
    sm: {
      container: "py-8",
      icon: "w-10 h-10",
      title: "text-base",
      description: "text-sm",
    },
    md: {
      container: "py-12",
      icon: "w-12 h-12",
      title: "text-lg",
      description: "text-sm",
    },
    lg: {
      container: "py-16",
      icon: "w-16 h-16",
      title: "text-xl",
      description: "text-base",
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        sizes.container,
        className,
      )}
    >
      {icon && (
        <div
          className={cn(
            "mb-4 text-muted-foreground/50",
            sizes.icon,
          )}
        >
          {icon}
        </div>
      )}
      <h3 className={cn("font-semibold text-foreground", sizes.title)}>
        {title}
      </h3>
      {description && (
        <p
          className={cn(
            "mt-2 max-w-sm text-muted-foreground",
            sizes.description,
          )}
        >
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="mt-6 flex items-center gap-3">
          {action && (
            <Button
              variant={action.variant || "default"}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="ghost" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}

// Pre-built empty state variants

interface EmptyStateVariantProps {
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function NoDataEmptyState({ action, className }: EmptyStateVariantProps) {
  return (
    <EmptyState
      icon={
        <svg
          className="w-full h-full"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      }
      title="No data found"
      description="There's nothing to display here yet."
      action={action}
      className={className}
    />
  );
}

export function NoResultsEmptyState({
  action,
  className,
}: EmptyStateVariantProps) {
  return (
    <EmptyState
      icon={
        <svg
          className="w-full h-full"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      }
      title="No results found"
      description="Try adjusting your search or filter to find what you're looking for."
      action={action ? { ...action, variant: "outline" } : undefined}
      className={className}
    />
  );
}

export function ErrorEmptyState({
  action,
  className,
}: EmptyStateVariantProps) {
  return (
    <EmptyState
      icon={
        <svg
          className="w-full h-full text-destructive/50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      }
      title="Something went wrong"
      description="We encountered an error while loading this content. Please try again."
      action={action ? { ...action, label: action.label || "Try again" } : undefined}
      className={className}
    />
  );
}

export default EmptyState;
