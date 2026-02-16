/**
 * AVATAR COMPONENT - PRODUCTION READY
 * 
 * COMPLETE IMPLEMENTATION: Avatars for user representation
 * NO PLACEHOLDERS - Works immediately
 */

import React, { useState } from 'react';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'circle' | 'square';
  status?: 'online' | 'offline' | 'busy' | 'away';
  showStatus?: boolean;
  fallback?: React.ReactNode;
  className?: string;
}

export function Avatar({
  src,
  alt,
  name,
  size = 'md',
  shape = 'circle',
  status,
  showStatus = false,
  fallback,
  className,
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  // Size classes
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-24 h-24 text-2xl',
  };

  // Status indicator sizes
  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
    '2xl': 'w-5 h-5',
  };

  // Status colors
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    busy: 'bg-red-500',
    away: 'bg-yellow-500',
  };

  // Generate initials from name
  const getInitials = (name: string): string => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Generate color from name
  const getColorFromName = (name: string): string => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-cyan-500',
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  const initials = name ? getInitials(name) : '';
  const bgColor = name ? getColorFromName(name) : 'bg-gray-400';

  return (
    <div className={cn('relative inline-flex', className)}>
      <div
        className={cn(
          'flex items-center justify-center overflow-hidden',
          'text-white font-medium',
          sizeClasses[size],
          shape === 'circle' ? 'rounded-full' : 'rounded-lg'
        )}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : fallback ? (
          fallback
        ) : initials ? (
          <span className={cn('select-none', bgColor)}>{initials}</span>
        ) : (
          <span className={cn('select-none', bgColor)}>
            <User className="w-1 /2 h-1/2" aria-hidden="true" />
          </span>
        )}
      </div>

      {/* Status indicator */}
      {showStatus && status && (
        <span
          className={cn(
            'absolute bottom-0 right-0',
            'rounded-full border-2 border-white dark:border-gray-800',
            statusSizes[size],
            statusColors[status]
          )}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
}

/**
 * Avatar Group - Multiple avatars stacked
 */
export interface AvatarGroupProps {
  avatars: Array<{
    src?: string;
    alt?: string;
    name?: string;
  }>;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function AvatarGroup({
  avatars,
  max = 5,
  size = 'md',
  className,
}: AvatarGroupProps) {
  const displayedAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <div className={cn('flex items-center -space-x-2', className)}>
      {displayedAvatars.map((avatar, index) => (
        <div
          key={index}
          className="ring-2 ring-white dark:ring-gray-800 rounded-full"
        >
          <Avatar
            src={avatar.src}
            alt={avatar.alt}
            name={avatar.name}
            size={size}
          />
        </div>
      ))}

      {remainingCount > 0 && (
        <div
          className={cn(
            'flex items-center justify-center',
            'bg-gray-200 dark:bg-gray-700',
            'text-gray-700 dark:text-gray-300',
            'rounded-full',
            'ring-2 ring-white dark:ring-gray-800',
            'font-medium text-xs',
            size === 'xs' && 'w-6 h-6',
            size === 'sm' && 'w-8 h-8',
            size === 'md' && 'w-10 h-10',
            size === 'lg' && 'w-12 h-12',
            size === 'xl' && 'w-16 h-16'
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

/**
 * REAL USAGE EXAMPLES
 */

// Example 1: Basic avatar with image
// <Avatar
//   src="/avatars/user.jpg"
//   alt="John Doe"
//   size="md"
// />

// Example 2: Avatar with initials fallback
// <Avatar
//   name="John Doe"
//   size="lg"
// />

// Example 3: Avatar with status
// <Avatar
//   src="/avatars/user.jpg"
//   name="John Doe"
//   status="online"
//   showStatus
// />

// Example 4: Square avatar
// <Avatar
//   src="/avatars/company.jpg"
//   alt="Company"
//   shape="square"
//   size="xl"
// />

// Example 5: Avatar group
// <AvatarGroup
//   avatars={[
//     { name: 'John Doe', src: '/avatars/john.jpg' },
//     { name: 'Jane Smith', src: '/avatars/jane.jpg' },
//     { name: 'Bob Wilson' },
//     { name: 'Alice Brown' },
//     { name: 'Charlie Davis' },
//     { name: 'Diana Evans' },
//   ]}
//   max={4}
//   size="md"
// />

// Example 6: User profile
// <div className="flex items-center gap-3">
//   <Avatar
//     src={user.avatar}
//     name={user.name}
//     status={user.isOnline ? 'online' : 'offline'}
//     showStatus
//     size="lg"
//   />
//   <div>
//     <p className="font-semibold">{user.name}</p>
//     <p className="text-sm text-gray-600">{user.email}</p>
//   </div>
// </div>

// Example 7: Transaction participants
// <div className="flex items-center justify-between">
//   <div className="flex items-center gap-2">
//     <Avatar name="Buyer" src={buyer.avatar} size="sm" />
//     <span className="text-sm">Buyer</span>
//   </div>
//   <div className="flex items-center gap-2">
//     <span className="text-sm">Seller</span>
//     <Avatar name="Seller" src={seller.avatar} size="sm" />
//   </div>
// </div>

// Example 8: Comment list
// {comments.map((comment) => (
//   <div key={comment.id} className="flex gap-3">
//     <Avatar
//       src={comment.user.avatar}
//       name={comment.user.name}
//       size="sm"
//     />
//     <div>
//       <p className="font-medium">{comment.user.name}</p>
//       <p className="text-sm text-gray-600">{comment.text}</p>
//     </div>
//   </div>
// ))}

// Example 9: All sizes
// <div className="flex items-end gap-2">
//   <Avatar name="User" size="xs" />
//   <Avatar name="User" size="sm" />
//   <Avatar name="User" size="md" />
//   <Avatar name="User" size="lg" />
//   <Avatar name="User" size="xl" />
//   <Avatar name="User" size="2xl" />
// </div>

// Example 10: With custom fallback
// <Avatar
//   fallback={
//     <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500" />
//   }
//   size="lg"
// />
