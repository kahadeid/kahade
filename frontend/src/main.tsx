import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Initialize validated environment variables FIRST
import { env, isFeatureEnabled } from '@/config/env.validation';

// Initialize i18n for internationalization
import '@/lib/i18n';

// Import design system utilities
import { theme } from '@/lib/design-tokens';
import { animations } from '@/lib/animations';
import { cn } from '@/lib/ui-utils';

/**
 * Development-only global utilities
 * Only expose in development environment for debugging
 */
if (import.meta.env.DEV) {
  // Make utilities globally available for easier debugging
  declare global {
    interface Window {
      __KAHADE_DEV__: {
        theme: typeof theme;
        animations: typeof animations;
        cn: typeof cn;
        env: typeof env;
      };
    }
  }

  window.__KAHADE_DEV__ = {
    theme,
    animations,
    cn,
    env,
  };
  
}

/**
 * Load analytics script dynamically if enabled and configured
 * Uses validated environment variables
 */
if (isFeatureEnabled('VITE_ENABLE_ANALYTICS')) {
  const analyticsEndpoint = env.VITE_ANALYTICS_ENDPOINT;
  const analyticsWebsiteId = env.VITE_ANALYTICS_WEBSITE_ID;

  if (analyticsEndpoint && analyticsWebsiteId) {
    try {
      const script = document.createElement('script');
      script.defer = true;
      script.src = `${analyticsEndpoint}/umami`;
      script.setAttribute('data-website-id', analyticsWebsiteId);
      script.onerror = () => {
        console.error('[Analytics] Failed to load analytics script');
      };
      document.body.appendChild(script);
    } catch (error) {
    }
  } else {
  }
}

/**
 * Initialize Sentry for error tracking if enabled
 */
if (isFeatureEnabled('VITE_ENABLE_ERROR_REPORTING') && env.VITE_SENTRY_DSN) {
  import('@sentry/react').then((Sentry) => {
    Sentry.init({
      dsn: env.VITE_SENTRY_DSN,
      environment: env.VITE_SENTRY_ENVIRONMENT,
      tracesSampleRate: env.VITE_SENTRY_TRACES_SAMPLE_RATE,
      beforeSend(event) {
        // Don't send events in development
        if (import.meta.env.DEV) {
          return null;
        }
        return event;
      },
    });
  }).catch((error) => {
    console.error('[Sentry] Failed to initialize error tracking:', error);
  });
}

/**
 * Mount React application
 */
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Failed to find root element. Ensure index.html contains <div id="root"></div>');
}

createRoot(rootElement).render(<App />);
