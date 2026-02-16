/**
 * CARD COMPONENT - PRODUCTION READY
 * 
 * COMPLETE IMPLEMENTATION: Cards for content display
 * NO PLACEHOLDERS - Works immediately
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from './Skeleton';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'outlined' | 'flat';
  hoverable?: boolean;
  clickable?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Card({
  variant = 'elevated',
  hoverable = false,
  clickable = false,
  isLoading = false,
  className,
  children,
  ...props
}: CardProps) {
  const variantStyles = {
    elevated: 'bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700',
    outlined: 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700',
    flat: 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700',
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          'rounded-lg p-6',
          variantStyles[variant],
          className
        )}
      >
        <Skeleton className="h-6 w-3 /4 mb-4" aria-hidden="true" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5 /6" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg transition-all duration-200',
        variantStyles[variant],
        hoverable && 'hover:shadow-lg hover:-translate-y-0.5',
        clickable && 'cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Card Header
 */
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  avatar?: React.ReactNode;
  children?: React.ReactNode;
}

export function CardHeader({
  title,
  subtitle,
  action,
  avatar,
  className,
  children,
  ...props
}: CardHeaderProps) {
  if (children) {
    return (
      <div
        className={cn('px-6 py-4 border-b border-gray-200 dark:border-gray-700', className)}
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-start gap-4 px-6 py-4',
        'border-b border-gray-200 dark:border-gray-700',
        className
      )}
      {...props}
    >
      {/* Avatar */}
      {avatar && <div className="flex-shrink-0">{avatar}</div>}

      {/* Title & Subtitle */}
      <div className="flex-1 min-w-0">
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {/* Action */}
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

/**
 * Card Body
 */
export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardBody({ className, children, ...props }: CardBodyProps) {
  return (
    <div className={cn('px-6 py-4', className)} {...props}>
      {children}
    </div>
  );
}

/**
 * Card Footer
 */
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  divided?: boolean;
}

export function CardFooter({
  className,
  children,
  divided = true,
  ...props
}: CardFooterProps) {
  return (
    <div
      className={cn(
        'px-6 py-4',
        divided && 'border-t border-gray-200 dark:border-gray-700',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Card Image
 */
export interface CardImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  aspectRatio?: '16/9' | '4/3' | '1/1' | 'auto';
}

export function CardImage({
  aspectRatio = '16/9',
  className,
  alt,
  ...props
}: CardImageProps) {
  const aspectRatioClasses = {
    '16/9': 'aspect-video',
    '4/3': 'aspect-4/3',
    '1/1': 'aspect-square',
    'auto': '',
  };

  return (
    <div className={cn('overflow-hidden rounded-t-lg', aspectRatioClasses[aspectRatio])}>
      <img
        className={cn(
          'w-full h-full object-cover transition-transform duration-300',
          'group-hover:scale-105',
          className
        )}
        alt={alt}
        {...props}
      />
    </div>
  );
}

/**
 * REAL USAGE EXAMPLES
 */

// Example 1: Basic card
// <Card>
//   <CardHeader title="Transaction #12345" subtitle="Created 2 hours ago" />
//   <CardBody>
//     <p>Transaction details go here...</p>
//   </CardBody>
//   <CardFooter>
//     <Button>View Details</Button>
//   </CardFooter>
// </Card>

// Example 2: Card with image
// <Card hoverable clickable onClick={() => router.push('/transaction/123')}>
//   <CardImage src="/transaction-image.jpg" alt="Transaction" />
//   <CardHeader
//     title="MacBook Pro 2024"
//     subtitle="Rp 25.000.000"
//   />
//   <CardBody>
//     <p className="text-sm text-gray-600">Brand new, sealed...</p>
//   </CardBody>
//   <CardFooter>
//     <Badge variant="success">Available</Badge>
//   </CardFooter>
// </Card>

// Example 3: User card with avatar
// <Card variant="outlined">
//   <CardHeader
//     title="John Doe"
//     subtitle="Verified Seller"
//     avatar={
//       <img
//         src="/avatar.jpg"
//         className="w-12 h-12 rounded-full"
//         alt="John Doe"
//       />
//     }
//     action={
//       <Button size="sm" variant="outline">Follow</Button>
//     }
//   />
//   <CardBody>
//     <div className="flex gap-4 text-sm">
//       <div>
//         <span className="font-semibold">120</span>
//         <span className="text-gray-600"> Transactions</span>
//       </div>
//       <div>
//         <span className="font-semibold">4.9</span>
//         <span className="text-gray-600"> Rating</span>
//       </div>
//     </div>
//   </CardBody>
// </Card>

// Example 4: Stats card
// <Card variant="elevated">
//   <CardBody>
//     <div className="flex items-center justify-between">
//       <div>
//         <p className="text-sm text-gray-600">Total Revenue</p>
//         <p className="text-2xl font-bold text-gray-900">
//           {formatCurrency(1250000)}
//         </p>
//       </div>
//       <div className="p-3 bg-green-100 rounded-full">
//         <TrendingUp className="w-6 h-6 text-green-600" aria-hidden="true" />
//       </div>
//     </div>
//     <div className="mt-2 flex items-center gap-1 text-sm">
//       <span className="text-green-600 font-medium">+12.5%</span>
//       <span className="text-gray-600">from last month</span>
//     </div>
//   </CardBody>
// </Card>

// Example 5: Transaction card
// function TransactionCard({ transaction }) {
//   return (
//     <Card hoverable>
//       <CardHeader
//         title={transaction.title}
//         subtitle={`ID: ${transaction.id}`}
//         action={
//           <DropdownButton
//             label="Actions"
//             size="sm"
//             items={[
//               { id: 'view', label: 'View', onClick: handleView },
//               { id: 'edit', label: 'Edit', onClick: handleEdit },
//             ]}
//           />
//         }
//       />
//       <CardBody>
//         <div className="space-y-2 text-sm">
//           <div className="flex justify-between">
//             <span className="text-gray-600">Amount</span>
//             <span className="font-semibold">
//               {formatCurrency(transaction.amount)}
//             </span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-gray-600">Status</span>
//             <Badge variant="success">{transaction.status}</Badge>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-gray-600">Created</span>
//             <span>{timeAgo(transaction.createdAt)}</span>
//           </div>
//         </div>
//       </CardBody>
//       <CardFooter>
//         <div className="flex gap-2">
//           <Button variant="primary" size="sm" fullWidth>
//             Process
//           </Button>
//           <Button variant="outline" size="sm" fullWidth>
//             Cancel
//           </Button>
//         </div>
//       </CardFooter>
//     </Card>
//   );
// }

// Example 6: Loading card
// <Card isLoading />
