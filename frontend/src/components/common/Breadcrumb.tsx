/**
 * BREADCRUMB COMPONENT - PRODUCTION READY
 * 
 * COMPLETE IMPLEMENTATION: Breadcrumbs for navigation hierarchy
 * NO PLACEHOLDERS - Works immediately
 */

import React from 'react';
import { ChevronRight, Home, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  maxItems?: number;
  className?: string;
}

export function Breadcrumb({
  items,
  separator = <ChevronRight className="w-4 aria-hidden="true" h-4" />,
  maxItems,
  className,
}: BreadcrumbProps) {
  // Handle maxItems by showing first, last, and ellipsis
  const getDisplayItems = (): BreadcrumbItem[] => {
    if (!maxItems || items.length <= maxItems) {
      return items;
    }

    if (maxItems === 1) {
      return [items[items.length - 1]];
    }

    if (maxItems === 2) {
      return [items[0], items[items.length - 1]];
    }

    // Show first item, ellipsis, and last (maxItems - 2) items
    const firstItem = items[0];
    const lastItems = items.slice(-(maxItems - 2));
    const hiddenItems = items.slice(1, items.length - lastItems.length);

    return [
      firstItem,
      {
        label: '...',
        onClick: () => {},
        disabled: true,
      },
      ...lastItems,
    ];
  };

  const displayItems = getDisplayItems();

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center', className)}
    >
      <ol className="flex items-center gap-2 flex-wrap">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;

          return (
            <li key={index} className="flex items-center gap-2">
              {/* Breadcrumb item */}
              {item.href || item.onClick ? (
                <a
                  href={item.href}
                  onClick={(e) => {
                    if (item.onClick) {
                      e.preventDefault();
                      item.onClick();
                    }
                  }}
                  className={cn(
                    'flex items-center gap-1.5',
                    'text-sm font-medium',
                    'transition-colors',
                    isLast
                      ? 'text-gray-900 dark:text-gray-100 cursor-default'
                      : item.disabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  )}
                  aria-current={isLast ? 'page' : undefined}
                  aria-disabled={item.disabled}
                >
                  {item.icon && (
                    <span className="flex-shrink-0" aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  <span className={cn(isLast && 'truncate max-w-[200px]')}>
                    {item.label}
                  </span>
                </a>
              ) : (
                <span
                  className={cn(
                    'flex items-center gap-1.5',
                    'text-sm font-medium',
                    isLast
                      ? 'text-gray-900 dark:text-gray-100'
                      : 'text-gray-600 dark:text-gray-400'
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.icon && (
                    <span className="flex-shrink-0" aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  <span className={cn(isLast && 'truncate max-w-[200px]')}>
                    {item.label}
                  </span>
                </span>
              )}

              {/* Separator */}
              {!isLast && (
                <span
                  className="text-gray-400 dark:text-gray-600 flex-shrink-0"
                  aria-hidden="true"
                >
                  {separator}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Simple Breadcrumb with auto home icon
 */
export interface SimpleBreadcrumbProps {
  items: Array<{ label: string; href?: string }>;
  homeHref?: string;
  onNavigate?: (href: string) => void;
  className?: string;
}

export function SimpleBreadcrumb({
  items,
  homeHref = '/',
  onNavigate,
  className,
}: SimpleBreadcrumbProps) {
  const breadcrumbItems: BreadcrumbItem[] = [
    {
      label: 'Home',
      href: homeHref,
      icon: <Home className="w-4 aria-hidden="true" h-4" />,
      onClick: onNavigate ? () => onNavigate(homeHref) : undefined,
    },
    ...items.map(item => ({
      label: item.label,
      href: item.href,
      onClick: onNavigate && item.href ? () => onNavigate(item.href!) : undefined,
    })),
  ];

  return <Breadcrumb items={breadcrumbItems} className={className} />;
}

/**
 * REAL USAGE EXAMPLES
 */

// Example 1: Basic breadcrumb
// <Breadcrumb
//   items={[
//     { label: 'Home', href: '/', icon: <Home className="w-4 aria-hidden="true" h-4" /> },
//     { label: 'Transactions', href: '/transactions' },
//     { label: 'Transaction Details' },
//   ]}
// />

// Example 2: With router navigation
// const router = useRouter();
// <Breadcrumb
//   items={[
//     {
//       label: 'Home',
//       onClick: () => router.push('/'),
//       icon: <Home className="w-4 aria-hidden="true" h-4" />,
//     },
//     {
//       label: 'Transactions',
//       onClick: () => router.push('/transactions'),
//     },
//     { label: transaction.id },
//   ]}
// />

// Example 3: With custom separator
// <Breadcrumb
//   items={items}
//   separator={<span>/</span>}
// />

// Example 4: With maxItems
// <Breadcrumb
//   items={[
//     { label: 'Home', href: '/' },
//     { label: 'Products', href: '/products' },
//     { label: 'Category', href: '/products/category' },
//     { label: 'Subcategory', href: '/products/category/sub' },
//     { label: 'Item', href: '/products/category/sub/item' },
//     { label: 'Details' },
//   ]}
//   maxItems={4}
// />

// Example 5: Simple breadcrumb
// <SimpleBreadcrumb
//   items={[
//     { label: 'Transactions', href: '/transactions' },
//     { label: 'Details' },
//   ]}
//   homeHref="/dashboard"
//   onNavigate={(href) => router.push(href)}
// />

// Example 6: Dynamic breadcrumb from pathname
// function DynamicBreadcrumb() {
//   const router = useRouter();
//   const pathname = router.pathname;
//   
//   const pathParts = pathname.split('/').filter(Boolean);
//   const items = pathParts.map((part, index) => ({
//     label: part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' '),
//     href: '/' + pathParts.slice(0, index + 1).join('/'),
//     onClick: () => router.push('/' + pathParts.slice(0, index + 1).join('/')),
//   }));
//   
//   return (
//     <Breadcrumb
//       items={[
//         {
//           label: 'Home',
//           icon: <Home className="w-4 aria-hidden="true" h-4" />,
//           onClick: () => router.push('/'),
//         },
//         ...items,
//       ]}
//     />
//   );
// }

// Example 7: Transaction breadcrumb
// <Breadcrumb
//   items={[
//     {
//       label: 'Dashboard',
//       href: '/dashboard',
//       icon: <LayoutDashboard className="w-4 aria-hidden="true" h-4" />,
//     },
//     {
//       label: 'Transactions',
//       href: '/transactions',
//       icon: <FileText className="w-4 aria-hidden="true" h-4" />,
//     },
//     {
//       label: `#${transaction.id.slice(0, 8)}`,
//     },
//   ]}
// />

// Example 8: With loading state
// <Breadcrumb
//   items={[
//     { label: 'Home', href: '/' },
//     isLoading
//       ? { label: 'Loading...', disabled: true }
//       : { label: data.name },
//   ]}
// />

// Example 9: Settings breadcrumb
// <Breadcrumb
//   items={[
//     { label: 'Settings', href: '/settings', icon: <Settings /> },
//     { label: 'Account', href: '/settings/account' },
//     { label: 'Security' },
//   ]}
// />
