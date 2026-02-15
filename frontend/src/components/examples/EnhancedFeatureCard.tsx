/**
 * ========================================================================
 * ENHANCED FEATURE CARD COMPONENT - EXAMPLE
 * ========================================================================
 * 
 * This component demonstrates all best practices:
 * - Design tokens usage
 * - Proper animations
 * - Full accessibility
 * - Responsive design
 * - TypeScript types
 * - Performance optimization
 * 
 * USE THIS AS A TEMPLATE for creating new components!
 * ========================================================================
 */

import { memo, forwardRef } from 'react'
import { motion, type Variants } from 'framer-motion'
import { type IconProps } from '@phosphor-icons/react'
import { cn } from '@/lib/ui-utils'
import { staggerItem } from '@/lib/animations'

/* ========================================================================
   TYPE DEFINITIONS
   ======================================================================== */

export interface FeatureCardProps {
  /** Icon component from Phosphor Icons */
  icon: React.ComponentType<IconProps>
  
  /** Feature title */
  title: string
  
  /** Feature description */
  description: string
  
  /** Optional link destination */
  href?: string
  
  /** Optional badge text (e.g., "NEW", "POPULAR") */
  badge?: string
  
  /** Visual variant */
  variant?: 'default' | 'premium' | 'subtle'
  
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  
  /** Whether card should be interactive (hoverable) */
  interactive?: boolean
  
  /** Custom className */
  className?: string
  
  /** Click handler */
  onClick?: () => void
  
  /** Custom animation variants */
  animationVariants?: Variants
}

/* ========================================================================
   COMPONENT
   ======================================================================== */

export const FeatureCard = memo(
  forwardRef<HTMLDivElement, FeatureCardProps>(
    (
      {
        icon: Icon,
        title,
        description,
        href,
        badge,
        variant = 'default',
        size = 'md',
        interactive = true,
        className,
        onClick,
        animationVariants = staggerItem,
      },
      ref
    ) => {
      // Compute component classes
      const cardClasses = cn(
        // Base styles
        'card',
        
        // Variant styles
        variant === 'premium' && 'card-premium',
        variant === 'subtle' && 'card-subtle',
        
        // Interactive styles
        interactive && 'card-hover cursor-pointer',
        
        // Size styles
        size === 'sm' && 'p-4',
        size === 'md' && 'p-6',
        size === 'lg' && 'p-8',
        
        // Custom classes
        className
      )

      // Icon size based on card size
      const iconSize = {
        sm: 32,
        md: 40,
        lg: 48,
      }[size]

      // Title size based on card size
      const titleSize = {
        sm: 'text-lg',
        md: 'text-xl',
        lg: 'text-2xl',
      }[size]

      // Wrapper component (motion.a if href, motion.div otherwise)
      const Component = href ? motion.a : motion.div

      // Component props
      const componentProps = {
        ref,
        className: cardClasses,
        variants: animationVariants,
        onClick,
        ...(href && {
          href,
          rel: 'noopener noreferrer',
        }),
        // Accessibility
        role: onClick ? 'button' : undefined,
        tabIndex: onClick || href ? 0 : undefined,
        'aria-label': `${title}: ${description}`,
        // Keyboard support
        onKeyDown: (e: React.KeyboardEvent) => {
          if ((e.key === 'Enter' || e.key === ' ') && onClick) {
            e.preventDefault()
            onClick()
          }
        },
      }

      return (
        <Component {...componentProps}>
          {/* Badge */}
          {badge && (
            <span className="badge badge-primary mb-4">
              {badge}
            </span>
          )}

          {/* Icon */}
          <div className="mb-4 text-primary" aria-hidden="true">
            <Icon size={iconSize} weight="duotone" />
          </div>

          {/* Title */}
          <h3 
            className={cn(
              titleSize,
              'font-semibold mb-2 text-foreground',
              interactive && 'group-hover:text-primary transition-colors'
            )}
          >
            {title}
          </h3>

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed">
            {description}
          </p>

          {/* Arrow indicator for links */}
          {href && (
            <div 
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary"
              aria-hidden="true"
            >
              <span>Learn more</span>
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          )}
        </Component>
      )
    }
  )
)

FeatureCard.displayName = 'FeatureCard'

/* ========================================================================
   USAGE EXAMPLES
   ======================================================================== */

/*

// Basic usage
<FeatureCard
  icon={ShieldCheck}
  title="Bank-Grade Security"
  description="Your transactions are protected with enterprise-level encryption."
/>

// With badge
<FeatureCard
  icon={Lightning}
  title="Lightning Fast"
  description="Process transactions in seconds, not hours."
  badge="NEW"
/>

// Premium variant
<FeatureCard
  icon={Sparkle}
  title="Premium Features"
  description="Access exclusive tools and priority support."
  variant="premium"
  size="lg"
/>

// With link
<FeatureCard
  icon={BookOpen}
  title="Documentation"
  description="Learn how to integrate our API into your application."
  href="/docs"
/>

// With click handler
<FeatureCard
  icon={Rocket}
  title="Get Started"
  description="Start your first transaction in minutes."
  onClick={() => navigate('/signup')}
/>

// In a grid with stagger animation
import { staggerContainer } from '@/lib/animations'

<motion.div 
  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
  variants={staggerContainer}
  initial="initial"
  animate="animate"
>
  {features.map((feature) => (
    <FeatureCard
      key={feature.title}
      icon={feature.icon}
      title={feature.title}
      description={feature.description}
    />
  ))}
</motion.div>

*/

/* ========================================================================
   ALTERNATIVE: SIMPLE VERSION WITHOUT FRAMER MOTION
   ======================================================================== */

export const SimpleFeatureCard = memo(
  forwardRef<HTMLDivElement, Omit<FeatureCardProps, 'animationVariants'>>(
    (
      {
        icon: Icon,
        title,
        description,
        variant = 'default',
        size = 'md',
        className,
      },
      ref
    ) => {
      const iconSize = { sm: 32, md: 40, lg: 48 }[size]
      const titleSize = { sm: 'text-lg', md: 'text-xl', lg: 'text-2xl' }[size]

      return (
        <div 
          ref={ref}
          className={cn(
            'card',
            variant === 'premium' && 'card-premium',
            variant === 'subtle' && 'card-subtle',
            size === 'sm' && 'p-4',
            size === 'md' && 'p-6',
            size === 'lg' && 'p-8',
            className
          )}
        >
          <div className="mb-4 text-primary">
            <Icon size={iconSize} weight="duotone" />
          </div>
          
          <h3 className={cn(titleSize, 'font-semibold mb-2 text-foreground')}>
            {title}
          </h3>
          
          <p className="text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      )
    }
  )
)

SimpleFeatureCard.displayName = 'SimpleFeatureCard'

/* ========================================================================
   VARIANTS FOR SPECIFIC USE CASES
   ======================================================================== */

// Testimonial Card
export interface TestimonialCardProps {
  quote: string
  author: string
  role: string
  avatar?: string
  rating?: number
  className?: string
}

export const TestimonialCard = memo<TestimonialCardProps>(
  ({ quote, author, role, avatar, rating, className }) => {
    return (
      <motion.div
        className={cn('card card-hover', className)}
        variants={staggerItem}
      >
        {/* Rating */}
        {rating && (
          <div className="flex gap-1 mb-4" aria-label={`Rating: ${rating} out of 5`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                className={cn(
                  'w-5 h-5',
                  i < rating ? 'text-warning' : 'text-gray-300'
                )}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        )}

        {/* Quote */}
        <blockquote className="text-foreground mb-6 leading-relaxed">
          "{quote}"
        </blockquote>

        {/* Author */}
        <div className="flex items-center gap-4">
          {avatar && (
            <img
              src={avatar}
              alt={author}
              className="w-12 h-12 rounded-full object-cover"
            />
          )}
          <div>
            <div className="font-semibold text-foreground">{author}</div>
            <div className="text-sm text-muted-foreground">{role}</div>
          </div>
        </div>
      </motion.div>
    )
  }
)

TestimonialCard.displayName = 'TestimonialCard'

// Stat Card
export interface StatCardProps {
  label: string
  value: string | number
  change?: {
    value: number
    trend: 'up' | 'down'
  }
  icon?: React.ComponentType<IconProps>
  className?: string
}

export const StatCard = memo<StatCardProps>(
  ({ label, value, change, icon: Icon, className }) => {
    return (
      <motion.div
        className={cn('card', className)}
        variants={staggerItem}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="text-sm font-medium text-muted-foreground">
            {label}
          </div>
          {Icon && (
            <div className="text-muted-foreground">
              <Icon size={20} />
            </div>
          )}
        </div>

        <div className="text-3xl font-bold text-foreground mb-2">
          {value}
        </div>

        {change && (
          <div
            className={cn(
              'text-sm font-medium flex items-center gap-1',
              change.trend === 'up' ? 'text-success' : 'text-destructive'
            )}
          >
            <svg
              className={cn(
                'w-4 h-4',
                change.trend === 'down' && 'rotate-180'
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
            <span>{Math.abs(change.value)}%</span>
          </div>
        )}
      </motion.div>
    )
  }
)

StatCard.displayName = 'StatCard'

/* ========================================================================
   EXPORT
   ======================================================================== */

export default FeatureCard

