import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

import { env, isFeatureEnabled } from '@/config/env.validation';

import '@/lib/i18n';

import designTokens from '@/lib/design-tokens';
import { animations } from '@/lib/animations';
import { cn } from '@/lib/ui-utils';

declare global {
 interface Window {
 __KAHADE_DEV__?: Record<string, unknown>;
 }
}

if (import.meta.env.DEV) {
 window.__KAHADE_DEV__ = {
 theme: designTokens,
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
