import { useEffect, useState, RefObject } from 'react';

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
}

/**
 * Custom hook for triggering animations on scroll
 * Uses IntersectionObserver for performance
 * 
 * @param ref - React ref to the element to observe
 * @param options - IntersectionObserver options
 * @returns boolean indicating if element is visible
 * 
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 * const isVisible = useScrollAnimation(ref, { threshold: 0.2 });
 */
export function useScrollAnimation(
  ref: RefObject<HTMLElement>,
  options: UseScrollAnimationOptions = {}
) {
  const { threshold = 0.1, rootMargin = '-50px' } = options;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold, rootMargin }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref, threshold, rootMargin]);

  return isVisible;
}

/**
 * Hook for progressive reveal animations
 * Returns opacity and transform values for staggered animations
 */
export function useStaggerAnimation(index: number, baseDelay = 0) {
  const delay = baseDelay + (index * 0.1);
  
  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { 
      duration: 0.5, 
      delay,
      ease: [0.21, 0.47, 0.32, 0.98]
    }
  };
}
