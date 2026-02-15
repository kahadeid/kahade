import { Variants } from 'framer-motion';

/**
 * Animation Library - Kahade Design System
 * 
 * Pre-configured animations for consistent motion design.
 * Based on Material Design motion principles.
 */

// =============================================================================
// FADE ANIMATIONS
// =============================================================================

/**
 * Simple fade in
 * Use for: General purpose fade in
 */
export const fadeIn: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15,
      ease: 'easeIn',
    },
  },
};

/**
 * Fade in from bottom with slide
 * Use for: Cards, modals, bottom sheets
 */
export const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

/**
 * Fade in from left
 * Use for: Sidebar, drawer, side panels
 */
export const fadeInLeft: Variants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

/**
 * Fade in from right
 * Use for: Notifications, toasts
 */
export const fadeInRight: Variants = {
  initial: {
    opacity: 0,
    x: 20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

// =============================================================================
// SCALE ANIMATIONS
// =============================================================================

/**
 * Scale in from center
 * Use for: Dialogs, popovers, tooltips
 */
export const scaleIn: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.15,
      ease: [0.4, 0, 1, 1],
    },
  },
};

/**
 * Blur in effect
 * Use for: Images, media, backgrounds
 */
export const blurIn: Variants = {
  initial: {
    opacity: 0,
    filter: 'blur(10px)',
  },
  animate: {
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    filter: 'blur(10px)',
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
};

// =============================================================================
// SLIDE ANIMATIONS
// =============================================================================

/**
 * Slide down from top
 * Use for: Dropdowns, mega menus, notifications
 */
export const slideInDown: Variants = {
  initial: {
    opacity: 0,
    y: -10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.15,
      ease: [0.4, 0, 1, 1],
    },
  },
};

/**
 * Slide up from bottom
 * Use for: Bottom sheets, mobile menus
 */
export const slideUp: Variants = {
  initial: {
    y: '100%',
  },
  animate: {
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    y: '100%',
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 1, 1],
    },
  },
};

// =============================================================================
// SCROLL ANIMATIONS
// =============================================================================

/**
 * Reveal on scroll
 * Use for: Section reveals, content blocks
 */
export const scrollReveal: Variants = {
  initial: {
    opacity: 0,
    y: 30,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

// =============================================================================
// STAGGER ANIMATIONS
// =============================================================================

/**
 * Container for staggered children
 * Use with staggerItem for lists
 */
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

/**
 * Individual stagger item
 * Use inside staggerContainer
 */
export const staggerItem: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

// =============================================================================
// SPECIAL EFFECTS
// =============================================================================

/**
 * Rotate in
 * Use for: Loaders, spinners, decorative elements
 */
export const rotateIn: Variants = {
  initial: {
    opacity: 0,
    rotate: -10,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    rotate: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    rotate: 10,
    scale: 0.9,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
};

/**
 * Bounce in
 * Use for: Success messages, celebration moments
 */
export const bounceIn: Variants = {
  initial: {
    opacity: 0,
    scale: 0.3,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
      duration: 0.6,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.5,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Flip in
 * Use for: Card flips, reveals
 */
export const flipIn: Variants = {
  initial: {
    opacity: 0,
    rotateX: -90,
  },
  animate: {
    opacity: 1,
    rotateX: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    rotateX: 90,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
};

/**
 * Expand vertically
 * Use for: Accordions, expandable sections
 */
export const expandVertical: Variants = {
  initial: {
    height: 0,
    opacity: 0,
  },
  animate: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: {
        duration: 0.3,
      },
      opacity: {
        duration: 0.25,
        delay: 0.05,
      },
    },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: {
      height: {
        duration: 0.3,
      },
      opacity: {
        duration: 0.2,
      },
    },
  },
};

// =============================================================================
// EXPORT ALL ANIMATIONS AS OBJECT (for main.tsx dev tools)
// =============================================================================

/**
 * All animations exported as a single object
 * Use for: Development tools, debugging, documentation
 */
export const animations = {
  fadeIn,
  fadeInUp,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  blurIn,
  slideInDown,
  slideUp,
  scrollReveal,
  staggerContainer,
  staggerItem,
  rotateIn,
  bounceIn,
  flipIn,
  expandVertical,
};

// =============================================================================
// USAGE EXAMPLES
// =============================================================================

/**
 * Example: Basic fade in
 * 
 * import { motion } from 'framer-motion';
 * import { fadeInUp } from '@/lib/animations';
 * 
 * <motion.div variants={fadeInUp} initial="initial" animate="animate" exit="exit">
 *   Content
 * </motion.div>
 */

/**
 * Example: Staggered list
 * 
 * import { motion } from 'framer-motion';
 * import { staggerContainer, staggerItem } from '@/lib/animations';
 * 
 * <motion.ul variants={staggerContainer} initial="initial" animate="animate">
 *   {items.map(item => (
 *     <motion.li key={item.id} variants={staggerItem}>
 *       {item.name}
 *     </motion.li>
 *   ))}
 * </motion.ul>
 */

/**
 * Example: Scroll reveal
 * 
 * import { motion } from 'framer-motion';
 * import { scrollReveal } from '@/lib/animations';
 * 
 * <motion.section
 *   variants={scrollReveal}
 *   initial="initial"
 *   whileInView="animate"
 *   viewport={{ once: true, margin: "-100px" }}
 * >
 *   Content
 * </motion.section>
 */
