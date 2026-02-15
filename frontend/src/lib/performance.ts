/**
 * REACT PERFORMANCE OPTIMIZATION UTILITIES
 * 
 * PERFORMANCE FIX [FE-PERF-001]: React.memo Implementation
 * 
 * This module provides utilities for optimizing React components:
 * - Memo wrapper for expensive components
 * - Custom comparison functions
 * - Performance monitoring
 */

import { memo, ComponentType } from 'react';
import { logger } from './logger';

/**
 * Type-safe React.memo wrapper with optional custom comparison
 * 
 * Usage:
 * ```typescript
 * export const MyComponent = withMemo(({ data }) => {
 *   return <div>{data}</div>;
 * });
 * ```
 */
export function withMemo<P extends object>(
  Component: ComponentType<P>,
  displayName?: string,
  customCompare?: (prevProps: P, nextProps: P) => boolean
): ComponentType<P> {
  const MemoizedComponent = customCompare 
    ? memo(Component, customCompare)
    : memo(Component);
  
  if (displayName) {
    MemoizedComponent.displayName = `Memo(${displayName})`;
  } else if (Component.displayName || Component.name) {
    MemoizedComponent.displayName = `Memo(${Component.displayName || Component.name})`;
  }
  
  return MemoizedComponent;
}

/**
 * Shallow comparison for React.memo
 * Only re-render if props actually changed
 */
export function shallowEqual<P extends object>(prevProps: P, nextProps: P): boolean {
  const prevKeys = Object.keys(prevProps) as Array<keyof P>;
  const nextKeys = Object.keys(nextProps) as Array<keyof P>;
  
  if (prevKeys.length !== nextKeys.length) {
    return false;
  }
  
  for (const key of prevKeys) {
    if (prevProps[key] !== nextProps[key]) {
      return false;
    }
  }
  
  return true;
}

/**
 * Deep comparison for complex props
 * Use sparingly - can be expensive
 */
export function deepEqual<P extends object>(prevProps: P, nextProps: P): boolean {
  return JSON.stringify(prevProps) === JSON.stringify(nextProps);
}

/**
 * Custom comparison that ignores specific props
 * Useful for callback props that change references
 */
export function compareIgnoring<P extends object>(
  ignoreKeys: Array<keyof P>
): (prevProps: P, nextProps: P) => boolean {
  return (prevProps, nextProps) => {
    const prevFiltered = { ...prevProps };
    const nextFiltered = { ...nextProps };
    
    ignoreKeys.forEach(key => {
      delete prevFiltered[key];
      delete nextFiltered[key];
    });
    
    return shallowEqual(prevFiltered, nextFiltered);
  };
}

/**
 * Performance monitoring HOC
 * Logs render time in development
 */
export function withPerformanceMonitoring<P extends object>(
  Component: ComponentType<P>,
  componentName: string
): ComponentType<P> {
  if (!import.meta.env.DEV) {
    return Component;
  }
  
  return (props: P) => {
    const startTime = performance.now();
    
    const result = Component(props);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    if (renderTime > 16) { // Slower than 60fps
      logger.warn(`Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`);
    } else {
      logger.debug(`${componentName} rendered in ${renderTime.toFixed(2)}ms`);
    }
    
    return result;
  };
}

/**
 * Detect unnecessary re-renders
 * Logs when component re-renders with same props
 */
export function withRerenderDetection<P extends object>(
  Component: ComponentType<P>,
  componentName: string
): ComponentType<P> {
  if (!import.meta.env.DEV) {
    return Component;
  }
  
  let previousProps: P | null = null;
  let renderCount = 0;
  
  return (props: P) => {
    renderCount++;
    
    if (previousProps && shallowEqual(previousProps, props)) {
      logger.warn(
        `Unnecessary re-render detected in ${componentName} (render #${renderCount}). ` +
        'Props are the same. Consider using React.memo or checking parent components.'
      );
    }
    
    previousProps = { ...props };
    return Component(props);
  };
}

/**
 * Optimize list components that render many items
 * Combines memo with custom key comparison
 */
export function withListItemMemo<P extends { id: string | number }>(  
  Component: ComponentType<P>
): ComponentType<P> {
  return memo(Component, (prevProps, nextProps) => {
    // Re-render only if id changed or any prop changed
    if (prevProps.id !== nextProps.id) {
      return false;
    }
    return shallowEqual(prevProps, nextProps);
  });
}

/**
 * Performance measurement utilities
 */
export const performance = {
  /**
   * Measure component mount time
   */
  measureMount: (componentName: string, callback: () => void) => {
    const start = window.performance.now();
    callback();
    const end = window.performance.now();
    logger.debug(`${componentName} mounted in ${(end - start).toFixed(2)}ms`);
  },
  
  /**
   * Measure async operation time
   */
  measureAsync: async <T>(label: string, operation: () => Promise<T>): Promise<T> => {
    const start = window.performance.now();
    try {
      const result = await operation();
      const end = window.performance.now();
      logger.debug(`${label} completed in ${(end - start).toFixed(2)}ms`);
      return result;
    } catch (error) {
      const end = window.performance.now();
      logger.error(`${label} failed after ${(end - start).toFixed(2)}ms`, error);
      throw error;
    }
  },
};

/**
 * MIGRATION GUIDE
 * 
 * 1. For simple components:
 * ```typescript
 * const UserCard = ({ user }) => <div>{user.name}</div>;
 * export default withMemo(UserCard, 'UserCard');
 * ```
 * 
 * 2. For list items:
 * ```typescript
 * const ListItem = ({ id, data }) => <div>{data}</div>;
 * export default withListItemMemo(ListItem);
 * ```
 * 
 * 3. With custom comparison:
 * ```typescript
 * const ExpensiveComponent = ({ data, onClick }) => <div>...</div>;
 * export default withMemo(
 *   ExpensiveComponent,
 *   'ExpensiveComponent',
 *   compareIgnoring(['onClick']) // Ignore callback changes
 * );
 * ```
 * 
 * 4. With performance monitoring (dev only):
 * ```typescript
 * let Component = ({ data }) => <div>...</div>;
 * Component = withPerformanceMonitoring(Component, 'SlowComponent');
 * Component = withRerenderDetection(Component, 'SlowComponent');
 * export default Component;
 * ```
 */
