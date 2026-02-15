/**
 * LAZY LOADING UTILITIES
 * 
 * Centralized lazy loading configuration for code splitting and performance.
 * Uses React.lazy with Suspense for optimal bundle splitting.
 * 
 * Benefits:
 * - Reduces initial bundle size
 * - Faster initial page load
 * - Better performance metrics (FCP, LCP)
 * - Automatic code splitting by route
 */

import { lazy, ComponentType } from 'react';

/**
 * Enhanced lazy loading with retry logic
 * Automatically retries failed chunk loads (useful for network issues)
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  retries = 3,
  interval = 1000
): React.LazyExoticComponent<T> {
  return lazy(() => {
    return new Promise<{ default: T }>((resolve, reject) => {
      const attemptImport = (retriesLeft: number) => {
        componentImport()
          .then(resolve)
          .catch((error) => {
            if (retriesLeft === 0) {
              reject(error);
              return;
            }
            
            console.warn(
              `Failed to load component, ${retriesLeft} retries left...`,
              error
            );
            
            setTimeout(() => {
              attemptImport(retriesLeft - 1);
            }, interval);
          });
      };
      
      attemptImport(retries);
    });
  });
}

/**
 * Preload a lazy component
 * Useful for prefetching components before navigation
 */
export function preloadComponent(
  componentImport: () => Promise<any>
): void {
  componentImport().catch((error) => {
    console.warn('Failed to preload component:', error);
  });
}

// ============================================================================
// LAZY LOADED ROUTES
// ============================================================================

// Public Pages (Landing)
export const HomePage = lazyWithRetry(
  () => import('@/pages/HomePage')
);

export const AboutPage = lazyWithRetry(
  () => import('@/pages/AboutPage')
);

export const PricingPage = lazyWithRetry(
  () => import('@/pages/PricingPage')
);

export const HowItWorksPage = lazyWithRetry(
  () => import('@/pages/HowItWorksPage')
);

export const ContactPage = lazyWithRetry(
  () => import('@/pages/ContactPage')
);

export const BlogPage = lazyWithRetry(
  () => import('@/pages/BlogPage')
);

export const FAQPage = lazyWithRetry(
  () => import('@/pages/FAQPage')
);

// Auth Pages
export const LoginPage = lazyWithRetry(
  () => import('@/pages/auth/LoginPage')
);

export const RegisterPage = lazyWithRetry(
  () => import('@/pages/auth/RegisterPage')
);

export const ForgotPasswordPage = lazyWithRetry(
  () => import('@/pages/auth/ForgotPasswordPage')
);

export const ResetPasswordPage = lazyWithRetry(
  () => import('@/pages/auth/ResetPasswordPage')
);

export const VerifyEmailPage = lazyWithRetry(
  () => import('@/pages/auth/VerifyEmailPage')
);

// Dashboard Pages
export const DashboardPage = lazyWithRetry(
  () => import('@/pages/dashboard/DashboardPage')
);

export const TransactionsPage = lazyWithRetry(
  () => import('@/pages/dashboard/TransactionsPage')
);

export const TransactionDetailPage = lazyWithRetry(
  () => import('@/pages/dashboard/TransactionDetailPage')
);

export const CreateTransactionPage = lazyWithRetry(
  () => import('@/pages/dashboard/CreateTransactionPage')
);

export const ProfilePage = lazyWithRetry(
  () => import('@/pages/dashboard/ProfilePage')
);

export const SettingsPage = lazyWithRetry(
  () => import('@/pages/dashboard/SettingsPage')
);

export const NotificationsPage = lazyWithRetry(
  () => import('@/pages/dashboard/NotificationsPage')
);

export const WalletPage = lazyWithRetry(
  () => import('@/pages/dashboard/WalletPage')
);

// Admin Pages
export const AdminDashboardPage = lazyWithRetry(
  () => import('@/pages/admin/AdminDashboardPage')
);

export const AdminUsersPage = lazyWithRetry(
  () => import('@/pages/admin/AdminUsersPage')
);

export const AdminTransactionsPage = lazyWithRetry(
  () => import('@/pages/admin/AdminTransactionsPage')
);

export const AdminSettingsPage = lazyWithRetry(
  () => import('@/pages/admin/AdminSettingsPage')
);

// Legal Pages
export const TermsPage = lazyWithRetry(
  () => import('@/pages/legal/TermsPage')
);

export const PrivacyPage = lazyWithRetry(
  () => import('@/pages/legal/PrivacyPage')
);

export const CookiesPage = lazyWithRetry(
  () => import('@/pages/legal/CookiesPage')
);

// Error Pages
export const NotFoundPage = lazyWithRetry(
  () => import('@/pages/NotFoundPage')
);

export const ServerErrorPage = lazyWithRetry(
  () => import('@/pages/ServerErrorPage')
);

// ============================================================================
// PRELOAD HELPERS
// ============================================================================

/**
 * Preload critical routes on user interaction
 * Call this on hover/focus of navigation links
 */
export const preloadCriticalRoutes = () => {
  preloadComponent(() => import('@/pages/auth/LoginPage'));
  preloadComponent(() => import('@/pages/auth/RegisterPage'));
  preloadComponent(() => import('@/pages/dashboard/DashboardPage'));
};

/**
 * Preload dashboard routes after authentication
 */
export const preloadDashboardRoutes = () => {
  preloadComponent(() => import('@/pages/dashboard/TransactionsPage'));
  preloadComponent(() => import('@/pages/dashboard/CreateTransactionPage'));
  preloadComponent(() => import('@/pages/dashboard/ProfilePage'));
  preloadComponent(() => import('@/pages/dashboard/WalletPage'));
};

/**
 * Preload admin routes for admin users
 */
export const preloadAdminRoutes = () => {
  preloadComponent(() => import('@/pages/admin/AdminDashboardPage'));
  preloadComponent(() => import('@/pages/admin/AdminUsersPage'));
  preloadComponent(() => import('@/pages/admin/AdminTransactionsPage'));
};
