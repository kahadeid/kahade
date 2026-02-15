/**
 * ACCESSIBLE IMAGE COMPONENT
 * 
 * ACCESSIBILITY FIX [FE-A11Y-001]: Missing Alt Text on Images
 * 
 * This component enforces accessibility best practices for images:
 * - Alt text is REQUIRED (TypeScript enforced)
 * - Lazy loading by default
 * - Error state handling
 * - Loading skeleton
 */

import { useState, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'alt'> {
  /**
   * Alt text for accessibility - REQUIRED
   * Provide descriptive text for screen readers
   */
  alt: string;
  
  /**
   * Fallback image URL if main image fails to load
   */
  fallback?: string;
  
  /**
   * Show loading skeleton before image loads
   */
  showSkeleton?: boolean;
  
  /**
   * Image aspect ratio for skeleton
   */
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto';
}

const aspectRatioClasses = {
  square: 'aspect-square',
  video: 'aspect-video',
  portrait: 'aspect-[3/4]',
  auto: '',
};

/**
 * Accessible Image Component
 * 
 * Usage:
 * ```tsx
 * <Image 
 *   src="/logo.png" 
 *   alt="Kahade Logo" 
 *   className="w-20 h-20"
 * />
 * ```
 */
export function Image({
  src,
  alt,
  fallback = '/images/placeholder.svg',
  showSkeleton = true,
  aspectRatio = 'auto',
  className,
  onError,
  onLoad,
  loading = 'lazy',
  ...props
}: ImageProps) {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageState('loaded');
    onLoad?.(e);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageState('error');
    
    // Try fallback image if available
    if (fallback && currentSrc !== fallback) {
      setCurrentSrc(fallback);
      setImageState('loading');
    }
    
    onError?.(e);
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Loading Skeleton */}
      {showSkeleton && imageState === 'loading' && (
        <div 
          className={cn(
            'absolute inset-0 bg-muted animate-pulse',
            aspectRatioClasses[aspectRatio]
          )}
          aria-hidden="true"
        />
      )}

      {/* Actual Image */}
      <img
        src={currentSrc}
        alt={alt}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-opacity duration-300',
          imageState === 'loaded' ? 'opacity-100' : 'opacity-0',
          className
        )}
        {...props}
      />

      {/* Error State */}
      {imageState === 'error' && currentSrc === fallback && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground text-sm"
          role="img"
          aria-label={alt}
        >
          <span className="text-center px-4">Gambar tidak tersedia</span>
        </div>
      )}
    </div>
  );
}

/**
 * Avatar Image Component
 * Specialized image component for user avatars
 */
interface AvatarImageProps extends Omit<ImageProps, 'aspectRatio'> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  name?: string; // User name for fallback initials
}

const avatarSizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-base',
  xl: 'w-24 h-24 text-xl',
};

export function AvatarImage({
  src,
  alt,
  name,
  size = 'md',
  className,
  ...props
}: AvatarImageProps) {
  const [imageError, setImageError] = useState(false);

  // Get initials from name
  const getInitials = (name?: string): string => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const handleError = () => {
    setImageError(true);
  };

  if (imageError || !src) {
    return (
      <div
        className={cn(
          'rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium',
          avatarSizes[size],
          className
        )}
        role="img"
        aria-label={alt}
      >
        {getInitials(name || alt)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={handleError}
      loading="lazy"
      className={cn(
        'rounded-full object-cover',
        avatarSizes[size],
        className
      )}
      {...props}
    />
  );
}

/**
 * Logo Image Component
 * Specialized component for logos with proper sizing
 */
interface LogoProps extends Omit<ImageProps, 'alt'> {
  variant?: 'light' | 'dark';
}

export function Logo({
  src = '/logo.svg',
  variant = 'light',
  className,
  ...props
}: LogoProps) {
  return (
    <Image
      src={src}
      alt="Kahade Logo - Platform Rekber Terpercaya Indonesia"
      className={cn('h-8 w-auto', className)}
      showSkeleton={false}
      {...props}
    />
  );
}

/**
 * MIGRATION GUIDE
 * 
 * Replace regular img tags with Image component:
 * 
 * Before:
 * <img src={user.avatar} />
 * <img src="/logo.svg" alt="" />
 * 
 * After:
 * <AvatarImage src={user.avatar} alt={`${user.name}'s profile picture`} name={user.name} />
 * <Logo />
 * 
 * For regular images:
 * <Image src="/banner.jpg" alt="Kahade platform banner showing secure transactions" />
 */
