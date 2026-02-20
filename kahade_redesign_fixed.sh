#!/usr/bin/env bash
# =============================================================================
# KAHADE — COMPLETE REDESIGN v3.3 (FIXED)
# Single-file plain-text installer
#
# FIXES APPLIED vs original:
#   [FIX-01] DashboardLayout wrapper ditambahkan ke 11 halaman dashboard
#             (Dashboard, Transactions, TransactionDetail, CreateTransaction,
#              Wallet, Notifications, Profile, Settings, KYCVerification,
#              BankAccounts, MFASettings)
#   [FIX-02] MFASettings: lucide-react diganti @phosphor-icons/react,
#             redesign penuh dengan design system Kahade
#   [FIX-03] Route paths diperbaiki: /dashboard/... → path benar
#             (/dashboard/transactions → /transactions, dll.)
#   [FIX-04] Dashboard.tsx: nama hardcoded "Ahmad!" diganti dengan
#             useAuth() untuk nama user yang sesungguhnya
#   [FIX-05] Dashboard.tsx: import useAuth + DashboardLayout ditambahkan
# Design System + 16 Public + 4 Auth + 13 Dashboard + 11 Admin + 25 UI Components
#
# USAGE:
#   cd kahade-master
#   bash kahade_redesign_complete.sh
# =============================================================================
set -euo pipefail

if   [ -d "frontend/src" ]; then
  ROOT="$(pwd)"
elif [ -d "$(dirname "${BASH_SOURCE[0]}")/frontend/src" ]; then
  ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
else
  echo "ERROR: Jalankan dari folder kahade-master (yang berisi 'frontend/')"
  echo "       cd kahade-master && bash /path/to/kahade_redesign_complete.sh"
  exit 1
fi
SRC="$ROOT/frontend/src"

G='\033[0;32m'; C='\033[0;36m'; Y='\033[1;33m'; N='\033[0m'
ok()   { echo -e "${G}  ✓ $1${N}"; }
step() { echo -e ""; echo -e "${C}══ $1 ══${N}"; }
warn() { echo -e "${Y}  ! $1${N}"; }

echo ""
echo "========================================================================"
echo -e "${C}  KAHADE REDESIGN v3.3 — COMPLETE INSTALLER${N}"
echo "========================================================================"

step "DESIGN SYSTEM"
# DESIGN SYSTEM — index.css
mkdir -p "$(dirname "$SRC/index.css")"
cat > "$SRC/index.css" << 'KAHADE_EOF'
@import url('/fonts/style.css');
@import "tailwindcss";
@import "tw-animate-css";

/* 
 * ========================================================================
 * KAHADE DESIGN SYSTEM - PROFESSIONAL EDITION V2.0
 * ========================================================================
 * 
 * DESIGN PHILOSOPHY:
 * - Powerful, bold, and exclusive aesthetic
 * - High contrast black & white with strategic accents
 * - Generous spacing for premium feel
 * - Strong visual hierarchy with fluid typography
 * - Sophisticated micro-interactions
 * - Amazon Ember typography system
 * - Accessibility-first approach
 * - Performance-optimized animations
 * 
 * STRUCTURE:
 * 1. Font Definitions
 * 2. CSS Variables & Design Tokens
 * 3. Root Theme Configuration
 * 4. Base Styles
 * 5. Component Patterns
 * 6. Utility Classes
 * 7. Animation Library
 * 8. Responsive Patterns
 * ========================================================================
 */

/* ========================================================================
   1. FONT DEFINITIONS
   ======================================================================== */

@font-face {
  font-family: 'Amazon Ember';
  font-style: normal;
  font-weight: 100;
  font-display: swap;
  src: local('Amazon Ember Thin'), url('/fonts/Amazon Ember Thin.woff') format('woff');
}

@font-face {
  font-family: 'Amazon Ember';
  font-style: normal;
  font-weight: 300;
  font-display: swap;
  src: local('Amazon Ember Light'), url('/fonts/Amazon Ember Light.woff') format('woff');
}

@font-face {
  font-family: 'Amazon Ember';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: local('Amazon Ember Regular'), url('/fonts/Amazon Ember.woff') format('woff');
}

@font-face {
  font-family: 'Amazon Ember';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: local('Amazon Ember Medium'), url('/fonts/Amazon Ember Medium.woff') format('woff');
}

@font-face {
  font-family: 'Amazon Ember';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: local('Amazon Ember Bold'), url('/fonts/Amazon Ember Bold.woff') format('woff');
}

@font-face {
  font-family: 'Amazon Ember';
  font-style: normal;
  font-weight: 900;
  font-display: swap;
  src: local('Amazon Ember Heavy'), url('/fonts/Amazon Ember Heavy.woff') format('woff');
}

/* Display Variant for Large Text */
@font-face {
  font-family: 'Amazon Ember Display';
  font-style: normal;
  font-weight: 300;
  font-display: swap;
  src: local('Amazon Ember Display Light'), url('/fonts/Amazon Ember Display Light.woff') format('woff');
}

@font-face {
  font-family: 'Amazon Ember Display';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: local('Amazon Ember Display Regular'), url('/fonts/Amazon Ember Display.woff') format('woff');
}

@font-face {
  font-family: 'Amazon Ember Display';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: local('Amazon Ember Display Medium'), url('/fonts/Amazon Ember Display Medium.woff') format('woff');
}

@font-face {
  font-family: 'Amazon Ember Display';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: local('Amazon Ember Display Bold'), url('/fonts/Amazon Ember Display Bold.woff') format('woff');
}

@font-face {
  font-family: 'Amazon Ember Display';
  font-style: normal;
  font-weight: 900;
  font-display: swap;
  src: local('Amazon Ember Display Heavy'), url('/fonts/Amazon Ember Display Heavy.woff') format('woff');
}

/* Monospace Variant for Code */
@font-face {
  font-family: 'Amazon Ember Mono';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: local('Amazon Ember Mono'), url('/fonts/Amazon Ember Mono.woff') format('woff');
}

@font-face {
  font-family: 'Amazon Ember Mono';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: local('Amazon Ember Mono Bold'), url('/fonts/Amazon Ember Mono Bold.woff') format('woff');
}

/* ========================================================================
   2. CSS VARIABLES & DESIGN TOKENS
   ======================================================================== */

@theme inline {
  /* AUDIT FIX #7: Typography - Better fallback system */
  --font-sans: 'Amazon Ember', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --font-display: 'Amazon Ember Display', 'Amazon Ember', system-ui, -apple-system, sans-serif;
  --font-mono: 'Amazon Ember Mono', 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  
  /* Radius Scale */
  --radius-xs: calc(var(--radius) - 6px);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius: 0.75rem;
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
  --radius-3xl: calc(var(--radius) + 16px);
  --radius-full: 9999px;
  
  /* Spacing Scale (Enhanced) */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
  --spacing-3xl: 4rem;
  --spacing-4xl: 6rem;
  --spacing-5xl: 8rem;
  
  /* Elevation System */
  --elevation-1: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --elevation-2: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --elevation-3: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --elevation-4: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --elevation-5: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --elevation-6: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  
  /* Animation Timing */
  --duration-instant: 100ms;
  --duration-fast: 200ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  --duration-slower: 700ms;
  --duration-slowest: 1000ms;
  
  /* Easing Functions */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Color Tokens */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
  
  /* Z-Index Scale */
  --z-base: 0;
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
}

/* ========================================================================
   3. ROOT THEME CONFIGURATION
   ======================================================================== */

:root {
  /* Base Radius */
  --radius: 0.75rem;
  
  /* Exclusive Light Theme - High Contrast */
  --background: #FFFFFF;
  --foreground: #0A0A0A;
  
  --card: #FFFFFF;
  --card-foreground: #0A0A0A;
  
  --popover: #FFFFFF;
  --popover-foreground: #0A0A0A;
  
  --primary: #0A0A0A;
  --primary-foreground: #FFFFFF;
  
  --secondary: #F8F8F8;
  --secondary-foreground: #0A0A0A;
  
  --muted: #F5F5F5;
  --muted-foreground: #737373;
  
  --accent: #0A0A0A;
  --accent-foreground: #FFFFFF;
  
  --destructive: #DC2626;
  --destructive-foreground: #FFFFFF;
  
  --success: #10B981;
  --success-foreground: #FFFFFF;
  
  --warning: #F59E0B;
  --warning-foreground: #FFFFFF;
  
  --info: #3B82F6;
  --info-foreground: #FFFFFF;
  
  --border: #E8E8E8;
  --input: #E8E8E8;
  --ring: #0A0A0A;
  
  /* Chart Colors - Sophisticated Palette */
  --chart-1: #0A0A0A;
  --chart-2: #10B981;
  --chart-3: #F59E0B;
  --chart-4: #6366F1;
  --chart-5: #EC4899;
  
  /* Sidebar */
  --sidebar: #FAFAFA;
  --sidebar-foreground: #0A0A0A;
  --sidebar-primary: #0A0A0A;
  --sidebar-primary-foreground: #FFFFFF;
  --sidebar-accent: #F0F0F0;
  --sidebar-accent-foreground: #0A0A0A;
  --sidebar-border: #E8E8E8;
  --sidebar-ring: #0A0A0A;
  
  /* Semantic Colors */
  --color-success-subtle: #ECFDF5;
  --color-warning-subtle: #FEF3C7;
  --color-error-subtle: #FEF2F2;
  --color-info-subtle: #EFF6FF;
}

/* Dark Mode - Applied when .dark class is on <html> */
.dark {
  --background: #0A0A0A;
  --foreground: #FAFAFA;
  
  --card: #141414;
  --card-foreground: #FAFAFA;
  
  --popover: #141414;
  --popover-foreground: #FAFAFA;
  
  --primary: #FAFAFA;
  --primary-foreground: #0A0A0A;
  
  --secondary: #1A1A1A;
  --secondary-foreground: #FAFAFA;
  
  --muted: #1A1A1A;
  --muted-foreground: #A3A3A3;
  
  --accent: #FAFAFA;
  --accent-foreground: #0A0A0A;
  
  --border: #2A2A2A;
  --input: #2A2A2A;
  --ring: #FAFAFA;
  
  --sidebar: #141414;
  --sidebar-foreground: #FAFAFA;
  --sidebar-border: #2A2A2A;
}

/* ========================================================================
   4. BASE STYLES
   ======================================================================== */

@layer base {
  /* Universal Reset */
  *,
  *::before,
  *::after {
  @apply border-border;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
  
  /* Scrollbar Styling */
  * {
  scrollbar-width: thin;
  scrollbar-color: #E8E8E8 transparent;
}
  
  *::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  *::-webkit-scrollbar-track {
    background: transparent;
  }
  
  *::-webkit-scrollbar-thumb {
    background: #E8E8E8;
    border-radius: 4px;
    transition: background var(--duration-fast) var(--ease-out);
  }
  
  *::-webkit-scrollbar-thumb:hover {
    background: #CCCCCC;
  }
  
  /* Hide scrollbar for clean UI when needed */
  .no-scrollbar {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  
  /* AUDIT FIX #8: HTML & Body - overflow-x only on body, not html (prevents sticky breaking) */
  html {
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
  }
  
  body {
    @apply bg-background text-foreground antialiased;
    font-family: var(--font-sans);
    min-height: 100vh;
    min-height: 100dvh;
    background: var(--background);
    line-height: 1.6;
    font-feature-settings: "kern" 1, "liga" 1;
    overflow-x: hidden;
  }
  
  /* AUDIT FIX #1 & #2: Typography Scale - Removed text-wrap: pretty global, adjusted clamp() for mobile */
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-display);
    font-weight: 700;
    letter-spacing: -0.03em;
    color: var(--foreground);
    line-height: 1.1;
    margin-bottom: 0.5em;
    /* REMOVED: text-wrap: pretty; - causes 1-word-per-line on narrow containers */
  }
  
  /* AUDIT FIX #2: Reduced minimum values in clamp() to prevent oversized text on mobile */
  h1 {
    font-size: clamp(1.5rem, 4vw + 0.5rem, 4.5rem);
    letter-spacing: -0.04em;
    line-height: 1.05;
  }
  
  h2 {
    font-size: clamp(1.375rem, 3.5vw + 0.25rem, 3.5rem);
    letter-spacing: -0.035em;
    line-height: 1.1;
  }
  
  h3 {
    font-size: clamp(1.125rem, 2.5vw + 0.25rem, 2.5rem);
    line-height: 1.15;
  }
  
  h4 {
    font-size: clamp(1.125rem, 2vw, 2rem);
    line-height: 1.2;
  }
  
  h5 {
    font-size: clamp(1rem, 1.5vw, 1.5rem);
    line-height: 1.3;
  }
  
  h6 {
    font-size: clamp(0.9375rem, 1vw, 1.25rem);
    line-height: 1.4;
  }
  
  /* Paragraph & Text */
  p {
    line-height: 1.7;
    margin-bottom: 1em;
    /* REMOVED: text-wrap: pretty; - let browser handle naturally */
  }
  
  p:last-child {
    margin-bottom: 0;
  }
  
  /* Links */
  a {
    color: inherit;
    text-decoration: none;
    transition: all var(--duration-fast) var(--ease-out);
  }
  
  a:focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
    border-radius: 2px;
  }
  
  /* Lists */
  ul, ol {
    padding-left: 1.5em;
    margin-bottom: 1em;
  }
  
  li {
    margin-bottom: 0.5em;
  }
  
  /* Code & Pre */
  code, pre, .font-mono {
    font-family: var(--font-mono);
    font-variant-ligatures: normal;
  }
  
  code {
    padding: 0.125rem 0.375rem;
    background: var(--muted);
    border-radius: var(--radius-sm);
    font-size: 0.875em;
  }
  
  pre {
    padding: 1rem;
    background: var(--muted);
    border-radius: var(--radius);
    overflow-x: auto;
    margin-bottom: 1em;
  }
  
  pre code {
    padding: 0;
    background: none;
    border-radius: 0;
  }

  /* Interactive Elements */
  button:not(:disabled),
  [role="button"]:not([aria-disabled="true"]),
  [type="button"]:not(:disabled),
  [type="submit"]:not(:disabled),
  [type="reset"]:not(:disabled),
  a[href],
  select:not(:disabled),
  input[type="checkbox"]:not(:disabled),
  input[type="radio"]:not(:disabled),
  summary {
    @apply cursor-pointer;
  }
  
  button:disabled,
  [role="button"][aria-disabled="true"],
  [type="button"]:disabled,
  [type="submit"]:disabled,
  [type="reset"]:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  
  /* Selection */
  ::selection {
    background: var(--primary);
    color: var(--primary-foreground);
  }
  
  /* Focus Visible */
  :focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
  }
  
  /* Images */
  img, picture, video, canvas, svg {
    display: block;
    max-width: 100%;
    height: auto;
  }
  
  /* Form Elements */
  input, button, textarea, select {
    font: inherit;
    color: inherit;
  }
  
  /* Remove default button styles */
  button {
    background: none;
    border: none;
    padding: 0;
    font: inherit;
    cursor: pointer;
  }
  
  /* Table */
  table {
    border-collapse: collapse;
    width: 100%;
  }
  
  /* HR */
  hr {
    border: none;
    border-top: 1px solid var(--border);
    margin: 2rem 0;
  }
}

/* ========================================================================
   5. COMPONENT PATTERNS
   ======================================================================== */

@layer components {
  /* ===== CONTAINER SYSTEM ===== */
  .container {
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    max-width: 100%;
  }

  @media (min-width: 640px) {
    .container {
      padding-left: 2rem;
      padding-right: 2rem;
      max-width: 640px;
    }
  }

  @media (min-width: 768px) {
    .container {
      max-width: 768px;
    }
  }

  @media (min-width: 1024px) {
    .container {
      padding-left: 3rem;
      padding-right: 3rem;
      max-width: 1024px;
    }
  }

  @media (min-width: 1280px) {
    .container {
      max-width: 1280px;
    }
  }
  
  @media (min-width: 1536px) {
    .container {
      max-width: 1536px;
    }
  }
  
  .container-narrow {
    max-width: 1200px;
  }
  
  .container-tight {
    max-width: 960px;
  }

  .flex-fix {
    min-height: 0;
    min-width: 0;
  }
  
  /* ===== SECTION SPACING SYSTEM ===== */
  .section-padding {
    padding-top: 4rem;
    padding-bottom: 4rem;
  }
  
  @media (min-width: 768px) {
    .section-padding {
      padding-top: 6rem;
      padding-bottom: 6rem;
    }
  }
  
  @media (min-width: 1024px) {
    .section-padding {
      padding-top: 8rem;
      padding-bottom: 8rem;
    }
  }
  
  @media (min-width: 1280px) {
    .section-padding {
      padding-top: 10rem;
      padding-bottom: 10rem;
    }
  }
  
  .section-padding-lg {
    padding-top: 6rem;
    padding-bottom: 6rem;
  }
  
  @media (min-width: 768px) {
    .section-padding-lg {
      padding-top: 8rem;
      padding-bottom: 8rem;
    }
  }
  
  @media (min-width: 1024px) {
    .section-padding-lg {
      padding-top: 12rem;
      padding-bottom: 12rem;
    }
  }
  
  .section-padding-sm {
    padding-top: 3rem;
    padding-bottom: 3rem;
  }
  
  @media (min-width: 768px) {
    .section-padding-sm {
      padding-top: 4rem;
      padding-bottom: 4rem;
    }
  }
  
  /* ===== SECTION HEADER PATTERNS ===== */
  .section-header {
    text-align: center;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 3rem;
  }
  
  @media (min-width: 768px) {
    .section-header {
      margin-bottom: 4rem;
    }
  }
  
  @media (min-width: 1024px) {
    .section-header {
      margin-bottom: 5rem;
    }
  }
  
  .section-label {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: var(--primary);
    color: var(--primary-foreground);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    border-radius: var(--radius-full);
    margin-bottom: 1.5rem;
    transition: all var(--duration-normal) var(--ease-out);
  }
  
  .section-label:hover {
    transform: translateY(-2px);
    box-shadow: var(--elevation-3);
  }
  
  .section-title {
    font-size: clamp(2rem, 4vw + 0.5rem, 3.5rem);
    font-weight: 700;
    letter-spacing: -0.03em;
    color: var(--foreground);
    margin-bottom: 1.5rem;
    line-height: 1.1;
  }
  
  .section-description {
    font-size: clamp(1rem, 2vw, 1.125rem);
    color: var(--muted-foreground);
    line-height: 1.7;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }
  
  /* ===== EXCLUSIVE BUTTON SYSTEM ===== */
  .btn-primary {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1rem 2rem;
    border-radius: var(--radius);
    font-weight: 600;
    font-size: 0.9375rem;
    background: var(--primary);
    color: var(--primary-foreground);
    border: none;
    overflow: hidden;
    transition: all var(--duration-normal) var(--ease-out);
    box-shadow: var(--elevation-2);
  }

  .btn-primary--nav {
    padding-block: 0.6rem;
  }
  
  .btn-primary::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%);
    opacity: 0;
    transition: opacity var(--duration-normal) var(--ease-out);
  }
  
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: var(--elevation-4);
  }
  
  .btn-primary:hover::before {
    opacity: 1;
  }
  
  .btn-primary:active {
    transform: translateY(0);
    box-shadow: var(--elevation-2);
  }
  
  .btn-secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1rem 2rem;
    border-radius: var(--radius);
    font-weight: 600;
    font-size: 0.9375rem;
    border: 2px solid var(--border);
    background: transparent;
    color: var(--foreground);
    transition: all var(--duration-normal) var(--ease-out);
  }
  
  .btn-secondary:hover {
    border-color: var(--foreground);
    background: var(--foreground);
    color: var(--background);
    transform: translateY(-2px);
    box-shadow: var(--elevation-3);
  }
  
  .btn-secondary:active {
    transform: translateY(0);
  }
  
  .btn-outline {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1rem 2rem;
    border-radius: var(--radius);
    font-weight: 600;
    font-size: 0.9375rem;
    border: 2px solid var(--primary);
    background: transparent;
    color: var(--primary);
    transition: all var(--duration-normal) var(--ease-out);
  }
  
  .btn-outline:hover {
    background: var(--primary);
    color: var(--primary-foreground);
    transform: translateY(-2px);
    box-shadow: var(--elevation-4);
  }
  
  .btn-outline:active {
    transform: translateY(0);
  }
  
  .btn-ghost {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: var(--radius);
    font-weight: 500;
    font-size: 0.9375rem;
    background: transparent;
    color: var(--muted-foreground);
    border: none;
    transition: all var(--duration-fast) var(--ease-out);
  }
  
  .btn-ghost:hover {
    background: var(--muted);
    color: var(--foreground);
  }
  
  /* Button Sizes */
  .btn-lg {
    padding: 1.25rem 2.5rem;
    font-size: 1rem;
  }
  
  .btn-sm {
    padding: 0.625rem 1.25rem;
    font-size: 0.875rem;
  }
  
  .btn-xs {
    padding: 0.5rem 1rem;
    font-size: 0.8125rem;
  }
  
  /* ===== CARD PATTERNS ===== */
  .card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    transition: all var(--duration-normal) var(--ease-out);
  }
  
  .card-hover:hover {
    transform: translateY(-4px);
    box-shadow: var(--elevation-5);
    border-color: var(--foreground);
  }
  
  .card-premium {
    background: var(--card);
    border: 2px solid var(--border);
    border-radius: var(--radius-xl);
    padding: 2rem;
    box-shadow: var(--elevation-3);
  }
  
  .card-subtle {
    background: var(--muted);
    border: none;
    border-radius: var(--radius-lg);
    padding: 1.5rem;
  }
  
  /* ===== INPUT PATTERNS ===== */
  .input-base {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid var(--input);
    border-radius: var(--radius);
    background: var(--background);
    color: var(--foreground);
    font-size: 0.9375rem;
    transition: all var(--duration-fast) var(--ease-out);
  }
  
  .input-base:focus {
    outline: none;
    border-color: var(--ring);
    box-shadow: 0 0 0 3px rgba(10, 10, 10, 0.1);
  }
  
  .input-base::placeholder {
    color: var(--muted-foreground);
  }
  
  /* ===== BADGE PATTERNS ===== */
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.75rem;
    border-radius: var(--radius-full);
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .badge-primary {
    background: var(--primary);
    color: var(--primary-foreground);
  }
  
  .badge-secondary {
    background: var(--secondary);
    color: var(--secondary-foreground);
  }
  
  .badge-success {
    background: var(--color-success-subtle);
    color: var(--success);
  }
  
  .badge-warning {
    background: var(--color-warning-subtle);
    color: var(--warning);
  }
  
  .badge-error {
    background: var(--color-error-subtle);
    color: var(--destructive);
  }
  
  /* ===== DIVIDER PATTERNS ===== */
  .divider {
    height: 1px;
    background: var(--border);
    margin: 2rem 0;
  }
  
  .divider-vertical {
    width: 1px;
    height: 100%;
    background: var(--border);
    margin: 0 1rem;
  }
  
  /* ===== BACKDROP PATTERNS ===== */
  .backdrop {
    backdrop-filter: blur(8px);
    background: rgba(255, 255, 255, 0.8);
  }
  
  .backdrop-dark {
    backdrop-filter: blur(8px);
    background: rgba(10, 10, 10, 0.8);
  }
  
  /* ===== GLASSMORPHISM ===== */
  .glass {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
  

  .glass-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(12px) saturate(160%);
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
    border-radius: var(--radius-lg);
  }

  .glass-dark {
    background: rgba(10, 10, 10, 0.7);
    backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
}

/* ========================================================================
   6. UTILITY CLASSES
   ======================================================================== */

@layer utilities {
  /* AUDIT FIX #1: Removed problematic text-wrap classes that cause layout issues */
  
  /* Truncate */
  .truncate-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .truncate-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .truncate-4 {
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  /* Gradient Text */
  .gradient-text {
    background: linear-gradient(135deg, var(--foreground) 0%, var(--muted-foreground) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  /* Smooth Scroll */
  .smooth-scroll {
    scroll-behavior: smooth;
  }
  
  /* Safe Area */
  .safe-top {
    padding-top: env(safe-area-inset-top);
  }
  
  .safe-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }
  
  .safe-left {
    padding-left: env(safe-area-inset-left);
  }
  
  .safe-right {
    padding-right: env(safe-area-inset-right);
  }
  
  /* Aspect Ratios */
  .aspect-square {
    aspect-ratio: 1 / 1;
  }
  
  .aspect-video {
    aspect-ratio: 16 / 9;
  }
  
  .aspect-portrait {
    aspect-ratio: 3 / 4;
  }
  
  /* Centering */
  .center-absolute {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  
  .center-x {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }
  
  .center-y {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }

  .bg-grid {
    background-image: linear-gradient(to right, rgb(0 0 0 / 0.05) 1px, transparent 1px),
                      linear-gradient(to bottom, rgb(0 0 0 / 0.05) 1px, transparent 1px);
    background-size: 4rem 4rem;
  }
}

/* ========================================================================
   7. ANIMATION LIBRARY
   ======================================================================== */

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

@keyframes bounce-subtle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Animation Classes */
.animate-fade-in {
  animation: fadeIn var(--duration-normal) var(--ease-out);
}

.animate-slide-in-up {
  animation: slideInUp var(--duration-normal) var(--ease-out);
}

.animate-slide-in-down {
  animation: slideInDown var(--duration-normal) var(--ease-out);
}

.animate-slide-in-left {
  animation: slideInLeft var(--duration-normal) var(--ease-out);
}

.animate-slide-in-right {
  animation: slideInRight var(--duration-normal) var(--ease-out);
}

.animate-scale-in {
  animation: scaleIn var(--duration-normal) var(--ease-spring);
}

.animate-pulse {
  animation: pulse var(--duration-slower) ease-in-out infinite;
}

.animate-shimmer {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.2) 20%,
    rgba(255, 255, 255, 0.5) 60%,
    rgba(255, 255, 255, 0)
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}

.animate-bounce-subtle {
  animation: bounce-subtle var(--duration-slow) ease-in-out infinite;
}

.animate-rotate {
  animation: rotate var(--duration-slowest) linear infinite;
}

/* Delay Classes */
.delay-100 {
  animation-delay: 100ms;
}

.delay-200 {
  animation-delay: 200ms;
}

.delay-300 {
  animation-delay: 300ms;
}

.delay-500 {
  animation-delay: 500ms;
}

/* ========================================================================
   8. RESPONSIVE PATTERNS
   ======================================================================== */

/* Mobile-First Responsive Typography */
@media (max-width: 640px) {
  .section-padding {
    padding-top: 3rem;
    padding-bottom: 3rem;
  }
  
  .section-header {
    margin-bottom: 2rem;
  }
}

/* Tablet Optimizations */
@media (min-width: 641px) and (max-width: 1024px) {
  .hide-tablet {
    display: none;
  }
}

/* Desktop Optimizations */
@media (min-width: 1025px) {
  .hide-desktop {
    display: none;
  }
}

/* Mobile-Only */

@media (max-width: 640px) {
  .show-desktop {
    display: none;
  }
}

/* Print Styles */
@media print {
  .no-print {
    display: none !important;
  }
  
  body {
    background: white;
    color: black;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* ========================================================================
   END OF KAHADE DESIGN SYSTEM V2.0
   ======================================================================== */

/* ========================================================================
   KAHADE UI FIX - ADDITIONAL DESIGN TOKENS
   Added: 2026-02-14
   ======================================================================== */

@layer base {
  :root {
    /* WCAG AAA Compliant Colors */
    --color-white: #FFFFFF;
    --color-neutral-50: #FAFAFA;
    --color-neutral-100: #F5F5F5;
    --color-neutral-200: #E8E8E8;
    --color-neutral-300: #D4D4D4;
    --color-neutral-400: #A3A3A3;
    --color-neutral-500: #737373;
    --color-neutral-600: #525252;
    --color-neutral-700: #404040;
    --color-neutral-800: #262626;
    --color-neutral-900: #171717;
    
    /* Semantic Colors */
    --color-success: #22C55E;
    --color-error: #EF4444;
    --color-warning: #F59E0B;
    --color-info: #3B82F6;
  }
}

/* Focus Visible Utilities */
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2;
}

.focus-ring-inset {
  @apply focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black;
}

/* Screen Reader Only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.sr-only-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
/* High Contrast Mode Support */
@media (prefers-contrast: high) {
  :root {
    --color-neutral-600: #000000;
  }
}


/* Enhanced Focus Indicators for Accessibility */
.focus-visible-ring {
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2;
}

.focus-visible-ring-white {
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black;
}

/* ========================================================================
   MOBILE RESPONSIVE FIXES — Added 2026 (MOBILE-FIX-2026)
   Fixes issues found in mobile audit:
   - Overflow prevention
   - Table horizontal scroll styling
   - Narrow screen padding improvements
   - Category filter scrollability
   ======================================================================== */

@layer base {
  /* Prevent any element from causing horizontal overflow */
  html, body {
    overflow-x: hidden;
    max-width: 100vw;
  }
  
  /* Ensure images never break layout */
  img {
    max-width: 100%;
    height: auto;
  }
}

@layer utilities {
  /* Horizontal scroll with snap for filter rows */
  .overflow-x-scroll-snap {
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
  }
  
  /* Table scroll area — give breathing room for scrollbar */
  .table-scroll-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 0.5rem;
  }
  
  /* Mobile-safe container with guaranteed minimum padding */
  .container-safe {
    padding-left: max(1rem, env(safe-area-inset-left));
    padding-right: max(1rem, env(safe-area-inset-right));
  }
}

/* Mobile-specific overrides */
@media (max-width: 639px) {
  /* Container: ensure enough but not excessive padding on tiny screens */
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  /* Section titles: cap size more aggressively on very small screens */
  .section-title {
    font-size: clamp(1.5rem, 5vw + 0.5rem, 3rem);
  }
  
  /* Grid gaps: reduce on mobile to prevent cards being too cramped */
  .gap-8 {
    gap: 1.25rem;
  }
  
  /* Card padding: slightly reduce for small screens */
  .card {
    padding: 1rem;
  }
  
  /* Comparison table scroll hint via gradient */
  .overflow-x-auto {
    -webkit-overflow-scrolling: touch;
  }
  
  /* Hero grid: stack properly on very small screens */
  .grid.lg\:grid-cols-\[1\.05fr_0\.95fr\] {
    grid-template-columns: 1fr;
  }
  
  /* Ensure buttons in button groups don't overflow */
  .flex-col.sm\:flex-row > a,
  .flex-col.sm\:flex-row > button {
    width: 100%;
  }
  
  /* Pricing / comparison tables: ensure scroll hint gradient */
  [class*="min-w-["] {
    /* handled by parent overflow-x-auto */
  }
}

/* sm breakpoint container: don't constrain too much */
@media (min-width: 640px) and (max-width: 767px) {
  .container {
    max-width: 100%;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}

/* ========================================================================
   CRITICAL FIX — TAILWIND V4 TEXT-WRAP OVERRIDE (TW4-FIX-V2-2026)
   TW v4 preflight adds text-wrap:balance to headings & text-wrap:pretty
   to paragraphs. On narrow mobile screens this causes 1-word-per-line.
   ======================================================================== */
h1, h2, h3, h4, h5, h6,
p, li, dt, dd, blockquote, caption, figcaption, label, span, div {
  text-wrap: unset !important;
}
pre {
  max-width: 100%;
  width: 100%;
  box-sizing: border-box;
  white-space: pre-wrap !important;
  word-break: break-word;
  overflow-wrap: break-word;
  overflow-x: auto;
}
a.block {
  display: block !important;
}
@media (max-width: 639px) {
  * { text-wrap: unset !important; -webkit-text-wrap: unset !important; }
  pre, code { font-size: 0.7rem !important; max-width: 100%; white-space: pre-wrap !important; }
}

/* ========================================================================
   REDESIGN ADDITIONS v3.3 — Kahade UI/UX Redesign (Februari 2026)
   ======================================================================== */

/* ────────────────────────────────────────────────────────────────────────
   FIX (v3.3): .badge, .badge-* utility classes
   ──────────────────────────────────────────────────────────────────────── */
@layer utilities {
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.125rem 0.625rem;
    border-radius: 9999px;
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    border-width: 1px;
    border-style: solid;
  }
  .badge-primary   { background-color: var(--primary); color: var(--primary-foreground); border-color: var(--primary); }
  .badge-secondary { background-color: var(--neutral-100, #f5f5f5); color: var(--neutral-700, #404040); border-color: var(--neutral-200, #e8e8e8); }
  .badge-success   { background-color: color-mix(in srgb, var(--success) 10%, transparent); color: var(--success); border-color: color-mix(in srgb, var(--success) 20%, transparent); }
  .badge-warning   { background-color: color-mix(in srgb, var(--warning) 10%, transparent); color: var(--warning); border-color: color-mix(in srgb, var(--warning) 20%, transparent); }
  .badge-error     { background-color: color-mix(in srgb, var(--destructive) 10%, transparent); color: var(--destructive); border-color: color-mix(in srgb, var(--destructive) 20%, transparent); }
  .badge-info      { background-color: rgba(14,165,233,0.1); color: #0ea5e9; border-color: rgba(14,165,233,0.2); }
}

/* ────────────────────────────────────────────────────────────────────────
   Section Padding Utilities
   ──────────────────────────────────────────────────────────────────────── */
@layer utilities {
  .section-padding-hero {
    padding-top: 10rem;
    padding-bottom: 10rem;
  }
  .section-padding-lg {
    padding-top: 8rem;
    padding-bottom: 8rem;
  }
  .section-padding-md {
    padding-top: 6rem;
    padding-bottom: 6rem;
  }
  .section-padding-sm {
    padding-top: 4rem;
    padding-bottom: 4rem;
  }

  @media (max-width: 1023px) {
    .section-padding-hero { padding-top: 6rem; padding-bottom: 6rem; }
    .section-padding-lg   { padding-top: 6rem; padding-bottom: 6rem; }
    .section-padding-md   { padding-top: 4rem; padding-bottom: 4rem; }
    .section-padding-sm   { padding-top: 3rem; padding-bottom: 3rem; }
  }

  @media (max-width: 639px) {
    .section-padding-hero { padding-top: 4rem; padding-bottom: 4rem; }
    .section-padding-lg   { padding-top: 4rem; padding-bottom: 4rem; }
    .section-padding-md   { padding-top: 3rem; padding-bottom: 3rem; }
    .section-padding-sm   { padding-top: 2rem; padding-bottom: 2rem; }
  }
}

/* ────────────────────────────────────────────────────────────────────────
   Section Header, Title, Label CSS classes
   ──────────────────────────────────────────────────────────────────────── */
@layer utilities {
  .section-header {
    text-align: center;
    max-width: 720px;
    margin-left: auto;
    margin-right: auto;
  }
  .section-header.align-left {
    text-align: left;
    margin-left: 0;
  }
  .section-title {
    font-size: clamp(2rem, 4vw + 0.5rem, 4.5rem);
    font-weight: 900;
    letter-spacing: -0.04em;
    line-height: 1.05;
    color: var(--foreground);
  }
  .section-label {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 1rem;
    border-radius: 9999px;
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    background-color: var(--primary);
    color: var(--primary-foreground);
    margin-bottom: 1rem;
  }
}

/* ────────────────────────────────────────────────────────────────────────
   .card dan .card-hover base classes
   ──────────────────────────────────────────────────────────────────────── */
@layer components {
  .card {
    background-color: var(--card);
    color: var(--card-foreground);
    border: 1px solid var(--border);
    border-radius: var(--radius-l, 1rem);
    box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04);
  }
  .card-hover {
    transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
    cursor: pointer;
  }
  .card-hover:hover {
    transform: translateY(-6px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.12), 0 16px 48px rgba(0,0,0,0.08);
    border-color: var(--neutral-300, #d4d4d4);
  }
}

/* ────────────────────────────────────────────────────────────────────────
   btn-* classes — standardized button system
   ──────────────────────────────────────────────────────────────────────── */
@layer components {
  .btn-primary {
    @apply inline-flex items-center justify-center gap-2 px-5 py-2.5
           bg-primary text-primary-foreground text-sm font-semibold rounded-xl
           transition-all duration-200
           hover:opacity-90 hover:-translate-y-0.5
           active:translate-y-0
           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
           focus-visible:ring-offset-2
           disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0;
  }
  .btn-secondary {
    @apply inline-flex items-center justify-center gap-2 px-5 py-2.5
           bg-transparent text-foreground text-sm font-semibold rounded-xl
           border border-border
           transition-all duration-200
           hover:bg-muted hover:-translate-y-0.5
           active:translate-y-0
           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground
           focus-visible:ring-offset-2
           disabled:opacity-50 disabled:cursor-not-allowed;
  }
  .btn-ghost {
    @apply inline-flex items-center justify-center gap-2 px-4 py-2
           bg-transparent text-foreground text-sm font-medium rounded-xl
           transition-all duration-200
           hover:bg-muted
           disabled:opacity-50 disabled:cursor-not-allowed;
  }
  /* FIX (v3.3): .btn-destructive — direferensikan di DisputeDetail, ConfirmDialog */
  .btn-destructive {
    @apply inline-flex items-center justify-center gap-2 px-5 py-2.5
           bg-destructive text-white text-sm font-semibold rounded-xl
           transition-all duration-200
           hover:bg-destructive/90 hover:-translate-y-0.5
           active:translate-y-0
           disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0;
  }
  .btn-sm { @apply px-3 py-1.5 text-xs rounded-lg; }
  .btn-lg { @apply px-7 py-3.5 text-base rounded-2xl; }
}

/* ────────────────────────────────────────────────────────────────────────
   no-scrollbar utility
   ──────────────────────────────────────────────────────────────────────── */
@layer utilities {
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
}

/* ────────────────────────────────────────────────────────────────────────
   Safe area insets untuk bottom sheet mobile
   ──────────────────────────────────────────────────────────────────────── */
@layer utilities {
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }
  .pt-safe {
    padding-top: env(safe-area-inset-top, 0px);
  }
}

/* ────────────────────────────────────────────────────────────────────────
   Toast progress animation — scaleX (GPU-composited)
   ──────────────────────────────────────────────────────────────────────── */
@keyframes toastProgress {
  from { transform: scaleX(1); }
  to   { transform: scaleX(0); }
}

/* ────────────────────────────────────────────────────────────────────────
   Bento Grid System
   ──────────────────────────────────────────────────────────────────────── */
@layer utilities {
  .bento-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: minmax(200px, auto);
    gap: 1.5rem;
  }

  @media (max-width: 1023px) {
    .bento-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 639px) {
    .bento-grid {
      grid-template-columns: 1fr;
    }
  }

  .bento-large { grid-column: span 1; grid-row: span 2; }
  .bento-wide { grid-column: span 3; }
  .bento-wide-2 { grid-column: span 2; }

  @media (max-width: 1023px) {
    .bento-wide   { grid-column: span 2; }
    /* FIX (v3.2): bento-wide-2 override agar tidak keluar dari 2-col grid */
    .bento-wide-2 { grid-column: span 2; }
    .bento-large  { grid-row: span 1; }
  }

  @media (max-width: 639px) {
    .bento-wide, .bento-wide-2, .bento-large { grid-column: span 1; grid-row: span 1; }
  }
}

/* ────────────────────────────────────────────────────────────────────────
   Split Screen Layouts
   ──────────────────────────────────────────────────────────────────────── */
@layer utilities {
  .split-screen {
    display: grid;
    min-height: 100vh;
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 1023px) {
    .split-screen {
      grid-template-columns: 1fr;
      min-height: auto;
    }
  }

  /* FIX (v3.2): Tambahkan mobile override untuk asymm classes */
  .split-screen-asymm-left {
    grid-template-columns: 0.45fr 0.55fr;
  }

  .split-screen-asymm-right {
    grid-template-columns: 0.55fr 0.45fr;
  }

  @media (max-width: 1023px) {
    .split-screen-asymm-left,
    .split-screen-asymm-right {
      grid-template-columns: 1fr;
    }
  }
}

/* ────────────────────────────────────────────────────────────────────────
   Text Gradient
   ──────────────────────────────────────────────────────────────────────── */
@layer utilities {
  .text-gradient-primary {
    background: linear-gradient(135deg, #0A0A0A 0%, #525252 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

/* ────────────────────────────────────────────────────────────────────────
   Marquee animations
   ──────────────────────────────────────────────────────────────────────── */
@keyframes marquee-left {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes marquee-right {
  from { transform: translateX(-50%); }
  to { transform: translateX(0); }
}

.animate-marquee-left {
  animation: marquee-left 30s linear infinite;
}

.animate-marquee-right {
  animation: marquee-right 30s linear infinite;
}

.animate-marquee-left:hover,
.animate-marquee-right:hover {
  animation-play-state: paused;
}

/* ────────────────────────────────────────────────────────────────────────
   Shine effect — GPU-composited (FIX v3.2: translateX bukan left)
   ──────────────────────────────────────────────────────────────────────── */
@keyframes shine {
  0%   { transform: translateX(-200%); }
  100% { transform: translateX(300%); }
}

.shine-effect {
  position: relative;
  overflow: hidden;
}

.shine-effect::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 60%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255,255,255,0.08) 50%,
    transparent 100%
  );
  animation: shine 3s ease-in-out infinite;
  will-change: transform;
}

/* ────────────────────────────────────────────────────────────────────────
   Shimmer skeleton — GPU-composited (FIX v3.3: will-change pada ::after)
   ──────────────────────────────────────────────────────────────────────── */
@keyframes shimmer {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.skeleton-shimmer {
  position: relative;
  overflow: hidden;
  background-color: #f0f0f0;
}

.skeleton-shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255,255,255,0.6) 50%,
    transparent 100%
  );
  animation: shimmer 1.5s ease-in-out infinite;
  will-change: transform; /* FIX (v3.3): GPU-composited */
}

/* ────────────────────────────────────────────────────────────────────────
   Gradient border — FIX: hex langsung (bukan var())
   ──────────────────────────────────────────────────────────────────────── */
.gradient-border {
  position: relative;
  background-clip: padding-box;
  border: 2px solid transparent;
  background-origin: border-box;
  background-image: linear-gradient(#FFFFFF, #FFFFFF),
                    linear-gradient(135deg, #0A0A0A 0%, #525252 100%);
}

.dark .gradient-border {
  background-image: linear-gradient(#0A0A0A, #0A0A0A),
                    linear-gradient(135deg, #FFFFFF 0%, #A3A3A3 100%);
}

/* ────────────────────────────────────────────────────────────────────────
   Floating label input
   ──────────────────────────────────────────────────────────────────────── */
.input-floating {
  position: relative;
}

.input-floating input {
  padding-top: 1.5rem;
  padding-bottom: 0.5rem;
}

.input-floating label {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.9375rem;
  color: var(--muted-foreground);
  transition: all 0.2s ease;
  pointer-events: none;
}

.input-floating input:focus + label,
.input-floating input:not(:placeholder-shown) + label {
  top: 0.625rem;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--muted-foreground);
}

/* ────────────────────────────────────────────────────────────────────────
   Number counter
   ──────────────────────────────────────────────────────────────────────── */
.stat-number {
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum';
}

/* ────────────────────────────────────────────────────────────────────────
   Shadow scale — @layer utilities agar bisa dipakai sebagai Tailwind className
   ──────────────────────────────────────────────────────────────────────── */
@layer utilities {
  .shadow-E1 { box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); }
  .shadow-E2 { box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04); }
  .shadow-E3 { box-shadow: 0 4px 12px rgba(0,0,0,0.12), 0 8px 32px rgba(0,0,0,0.08); }
  .shadow-E4 { box-shadow: 0 8px 24px rgba(0,0,0,0.15), 0 16px 48px rgba(0,0,0,0.1); }
  .shadow-E5 { box-shadow: 0 20px 60px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.15); }
  .shadow-E6 { box-shadow: 0 32px 80px rgba(0,0,0,0.25); }
}

/* Tailwind @theme additions */
@theme inline {
  --spacing-hero: 10rem;
  --spacing-section: 8rem;
  --spacing-section-sm: 6rem;

  /* FIX: Nilai absolut, bukan calc() */
  --radius-4xl: 2rem;
  --radius-5xl: 2.5rem;

  --leading-tighter: 1.05;
  --leading-tight: 1.15;
  --leading-relaxed: 1.7;
  --leading-loose: 1.85;

  --tracking-tightest: -0.05em;
  --tracking-tighter: -0.04em;
  --tracking-tight: -0.03em;
  --tracking-display: -0.02em;

  /* FIX: --info color token */
  --info: #0ea5e9;
  --info-foreground: #ffffff;

  /* FIX (v3.2): radius tokens yang hilang */
  --radius-xs: 0.375rem;
  --radius-s:  0.5rem;
  --radius-m:  0.75rem;
  --radius-l:  1rem;
  --radius-xl: 1.25rem;
  --radius-2xl: 1.5rem;
  --radius-3xl: 2rem;

  /* FIX (v3.2): --neutral-300 */
  --neutral-300: #d4d4d4;
}
KAHADE_EOF
ok "DESIGN SYSTEM — index.css"

# DESIGN SYSTEM — animations.ts
mkdir -p "$(dirname "$SRC/lib/animations.ts")"
cat > "$SRC/lib/animations.ts" << 'KAHADE_EOF'
// src/lib/animations.ts — EXTENDED VERSION v3.3
// FIX (v3.3): import WAJIB di PALING ATAS file, SEBELUM semua export.
import { useState, useEffect, useRef } from 'react';
import type { Variants } from 'framer-motion';

// =============================================================================
// FADE ANIMATIONS
// =============================================================================

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] }
  },
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  },
  exit: {
    opacity: 0,
    y: 24,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] }
  },
};

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  },
  exit: {
    opacity: 0,
    y: -24,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] }
  },
};

export const fadeInLeft: Variants = {
  initial: { opacity: 0, x: -32 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  },
  exit: {
    opacity: 0,
    x: -32,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] }
  },
};

export const fadeInRight: Variants = {
  initial: { opacity: 0, x: 32 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  },
  exit: {
    opacity: 0,
    x: 32,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] }
  },
};

// =============================================================================
// SCALE ANIMATIONS
// =============================================================================

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.92 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] }
  },
};

export const blurIn: Variants = {
  initial: { opacity: 0, filter: 'blur(10px)' },
  animate: {
    opacity: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  exit: {
    opacity: 0,
    filter: 'blur(10px)',
    transition: { duration: 0.3, ease: 'easeIn' }
  },
};

// =============================================================================
// SLIDE ANIMATIONS
// =============================================================================

export const slideInDown: Variants = {
  initial: { opacity: 0, y: -10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.15, ease: [0.4, 0, 1, 1] }
  },
};

export const slideUp: Variants = {
  initial: { y: '100%' },
  animate: {
    y: 0,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  },
  exit: {
    y: '100%',
    transition: { duration: 0.25, ease: [0.4, 0, 1, 1] }
  },
};

// =============================================================================
// STAGGER ANIMATIONS
// =============================================================================

// FIX (v3.3): staggerContainer — flat structure (tidak nested `variants` key)
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    }
  }
};
// Cara pemakaian — whileInView (lebih sering dipakai):
// <motion.div variants={staggerContainer} initial="initial" whileInView="animate"
//             viewport={{ once: true, margin: "0px 0px -80px 0px" }}>

// FIX (v3.3): staggerItem — flat structure
export const staggerItem: Variants = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  }
};

export const scrollReveal: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  },
};

// =============================================================================
// SPECIAL EFFECTS
// =============================================================================

export const rotateIn: Variants = {
  initial: { opacity: 0, rotate: -10, scale: 0.9 },
  animate: {
    opacity: 1,
    rotate: 0,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  exit: {
    opacity: 0,
    rotate: 10,
    scale: 0.9,
    transition: { duration: 0.3, ease: 'easeIn' }
  },
};

export const bounceIn: Variants = {
  initial: { opacity: 0, scale: 0.3 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
      duration: 0.6,
    }
  },
  exit: {
    opacity: 0,
    scale: 0.5,
    transition: { duration: 0.2 }
  },
};

export const flipIn: Variants = {
  initial: { opacity: 0, rotateX: -90 },
  animate: {
    opacity: 1,
    rotateX: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  exit: {
    opacity: 0,
    rotateX: 90,
    transition: { duration: 0.3, ease: 'easeIn' }
  },
};

export const expandVertical: Variants = {
  initial: { height: 0, opacity: 0 },
  animate: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: { duration: 0.3 },
      opacity: { duration: 0.25, delay: 0.05 },
    }
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.3 },
      opacity: { duration: 0.2 },
    }
  },
};

// =============================================================================
// VIEWPORT SETTINGS
// =============================================================================

export const viewport = {
  once: true,
  margin: "0px 0px -80px 0px"
};

// =============================================================================
// SPRING ANIMATIONS
// =============================================================================

export const spring = {
  type: "spring",
  stiffness: 400,
  damping: 30
};

export const softSpring = {
  type: "spring",
  stiffness: 200,
  damping: 25
};

// =============================================================================
// PAGE TRANSITION
// =============================================================================

export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] }
};

// =============================================================================
// useCountUp HOOK
// FIX (v3.3): Definisi hook ini — direferensikan di TrustSignals tapi tidak ada.
// Import: import { useCountUp } from '@/lib/animations';
// =============================================================================

export function useCountUp(target: number, duration: number = 2.5, enabled: boolean = true) {
  const [count, setCount] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    startTime.current = null;

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = (timestamp - startTime.current) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration, enabled]);

  return count;
}

// =============================================================================
// ALL ANIMATIONS OBJECT
// =============================================================================

export const animations = {
  fadeIn, fadeInUp, fadeInDown, fadeInLeft, fadeInRight,
  scaleIn, blurIn,
  slideInDown, slideUp,
  scrollReveal,
  staggerContainer, staggerItem,
  rotateIn, bounceIn, flipIn,
  expandVertical,
};
KAHADE_EOF
ok "DESIGN SYSTEM — animations.ts"

step "SHARED"
# SHARED — SectionLabel
mkdir -p "$(dirname "$SRC/components/shared/SectionLabel.tsx")"
cat > "$SRC/components/shared/SectionLabel.tsx" << 'KAHADE_EOF'
import React from 'react';
import { cn } from '@/lib/ui-utils';

// FIX (v3.3): TypeScript interface lengkap untuk SectionLabel
interface SectionLabelProps {
  children: React.ReactNode;
  icon?: React.ElementType;  // prop tetap lowercase di interface
  variant?: 'dark' | 'light';
  className?: string;
}

export function SectionLabel({ children, icon: Icon, variant = 'dark', className }: SectionLabelProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-2 px-4 py-1.5 rounded-full',
      'text-[0.6875rem] font-bold tracking-widest uppercase mb-4',
      variant === 'dark'
        ? 'bg-primary text-primary-foreground'
        : 'bg-neutral-100 text-neutral-600 border border-neutral-200',
      className
    )}>
      {/* FIX: Icon sudah di-destructure ke PascalCase — aman sebagai JSX */}
      {Icon && <Icon className="w-3.5 h-3.5" weight="fill" />}
      {children}
    </span>
  );
}

export default SectionLabel;
KAHADE_EOF
ok "SHARED — SectionLabel"

step "HOME"
# HOME — HeroSection
mkdir -p "$(dirname "$SRC/components/home/HeroSection.tsx")"
cat > "$SRC/components/home/HeroSection.tsx" << 'KAHADE_EOF'
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import {
  ArrowRight, Play, ShieldCheck, IdentificationBadge,
  Clock, Scales, Wallet, ChartLineUp, Lock, CheckCircle
} from '@phosphor-icons/react';
import { cn } from '@/lib/ui-utils';
import { fadeInUp, staggerContainer, staggerItem, viewport } from '@/lib/animations';
import { compliancePartners } from './HomeData';

const liveActivities = [
  '🟢 Transaksi #KHD-2483 selesai · Rp 5.200.000 diamankan',
  '🟢 Dana cair ke penjual dalam 8 jam',
  '🔵 Pengguna baru bergabung dari Surabaya',
  '🟢 Sengketa diselesaikan dalam 2 hari',
  '🟢 Transaksi #KHD-2491 dikonfirmasi · Rp 12.000.000',
];

const heroStats = [
  { value: '98%', label: 'Kepuasan', icon: CheckCircle },
  { value: '<12j', label: 'Pencairan', icon: Clock },
  { value: '0.8%', label: 'Sengketa', icon: Scales },
  { value: '50M+', label: 'Diamankan', icon: Wallet },
];

const trustBadges = [
  { label: 'OJK Compliant', icon: IdentificationBadge },
  { label: 'Bank Indonesia', icon: ShieldCheck },
  { label: 'ISO 27001', icon: Lock },
  { label: 'KYC Verified', icon: CheckCircle },
];

export default function HeroSection() {
  const [activityIndex, setActivityIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActivityIndex(i => (i + 1) % liveActivities.length), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="section-padding-hero relative overflow-hidden">
      {/* Background grid — LEBIH SUBTLE (opacity 30%) */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: 'radial-gradient(var(--neutral-200, #e8e8e8) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          opacity: 0.3,
        }}
      />
      {/* Gradient blobs */}
      <div className="absolute -top-20 right-0 w-[520px] h-[520px] bg-gradient-radial from-muted to-transparent rounded-full blur-3xl opacity-70 pointer-events-none" aria-hidden="true" />
      <div className="absolute -bottom-24 left-0 w-[360px] h-[360px] bg-gradient-radial from-muted to-transparent rounded-full blur-3xl opacity-40 pointer-events-none" aria-hidden="true" />

      <div className="container relative z-10">
        <motion.div
          className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-16 items-center"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* ── KIRI ── */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <motion.div variants={staggerItem} className="mb-8 flex justify-center lg:justify-start">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                              border border-neutral-200 bg-background shadow-sm
                              text-xs font-semibold tracking-wide text-neutral-600
                              hover:border-neutral-400 transition-colors cursor-default">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                10.000+ Pengguna Aktif
              </div>
            </motion.div>

            {/* Headline — clamp(2.75rem, 5.5vw + 1rem, 6.5rem) */}
            <motion.h1
              variants={staggerItem}
              className="font-display font-black leading-[1.0] tracking-[-0.05em] mb-8"
              style={{ fontSize: 'clamp(2.75rem, 5.5vw + 1rem, 6.5rem)' }}
            >
              <span className="block text-foreground">Mengurangi</span>
              <span className="block text-foreground">Penipuan.</span>
              <span className="block mt-2 md:mt-3 relative">
                <span className="relative z-10 text-foreground">Meningkatkan</span>
                {' '}
                <span className="relative z-10 text-foreground">Kepercayaan.</span>
                <motion.div
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.7, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute -bottom-1 left-0 right-0 h-[10px] bg-primary/10 rounded-full"
                  style={{ transformOrigin: 'left center' }}
                />
              </span>
            </motion.h1>

            {/* Lead text */}
            <motion.p
              variants={staggerItem}
              className="text-muted-foreground mb-8 leading-relaxed"
              style={{ fontSize: 'clamp(1.0625rem, 1.5vw, 1.25rem)' }}
            >
              Kahade menahan dana Anda hingga transaksi selesai dengan sempurna.
              Aman, transparan, dan terpercaya.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={staggerItem}
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-10"
            >
              <Link href="/register">
                <button className="btn-primary btn-lg w-full sm:w-auto">
                  Mulai Transaksi
                  <ArrowRight className="w-5 h-5" weight="bold" />
                </button>
              </Link>
              <button
                className="btn-secondary btn-lg w-full sm:w-auto"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Play className="w-4 h-4" weight="fill" />
                Lihat Demo
              </button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              variants={staggerItem}
              className="flex flex-wrap gap-2 justify-center lg:justify-start"
            >
              {trustBadges.map(({ label, icon: BadgeIcon }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg
                             border border-border bg-background text-xs font-medium"
                >
                  <BadgeIcon className="w-4 h-4 text-muted-foreground" weight="duotone" />
                  <span>{label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── KANAN — Hero Card ── */}
          <motion.div
            variants={staggerItem}
            className="relative"
          >
            <div className="card shadow-E6 border-2 border-border rounded-[20px] p-6 md:p-8 bg-background">
              {/* Live activity pulse */}
              <div className="mb-6 p-3 bg-muted rounded-xl">
                <motion.p
                  key={activityIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="text-xs text-muted-foreground"
                >
                  {liveActivities[activityIndex]}
                </motion.p>
              </div>

              {/* Transaction header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Escrow Terlindungi</p>
                  <p className="text-sm font-bold mt-0.5">Transaksi #KHD-2451</p>
                </div>
                <span className="badge badge-success">● Aktif</span>
              </div>

              {/* Amount */}
              <p className="text-3xl font-black tracking-tight mb-6">Rp 12.500.000</p>

              {/* Stats grid 2x2 */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {heroStats.map(({ value, label, icon: StatIcon }) => (
                  <div key={label} className="bg-muted rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <StatIcon className="w-3.5 h-3.5 text-muted-foreground" weight="duotone" />
                      <span className="text-[0.625rem] font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
                    </div>
                    <p className="text-lg font-black tracking-tight">{value}</p>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-muted-foreground">Dana Aman</span>
                  <span className="text-xs font-bold">Rp 50M+</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 0.82 }}
                    transition={{ delay: 0.5, duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
                    className="h-full bg-success rounded-full origin-left"
                    style={{ transformOrigin: 'left center', willChange: 'transform' }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="flex flex-col items-center mt-16 text-muted-foreground"
        >
          <span className="text-xs font-medium mb-2">Scroll untuk jelajahi</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          >
            <ArrowRight className="w-4 h-4 rotate-90" weight="bold" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
KAHADE_EOF
ok "HOME — HeroSection"

# HOME — TrustSignals
mkdir -p "$(dirname "$SRC/components/home/TrustSignals.tsx")"
cat > "$SRC/components/home/TrustSignals.tsx" << 'KAHADE_EOF'
import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CurrencyDollar, Users, Lightning, Clock
} from '@phosphor-icons/react';
import { useCountUp } from '@/lib/animations';

const signals = [
  {
    icon: CurrencyDollar,
    label: 'Dana Diamankan',
    numericValue: 50,
    prefix: 'Rp ',
    suffix: 'M+',
  },
  {
    icon: Users,
    label: 'Pengguna Aktif',
    numericValue: 10000,
    prefix: '',
    suffix: '+',
  },
  {
    icon: Lightning,
    label: 'Uptime Sistem',
    numericValue: 99,
    prefix: '',
    suffix: '.9%',
  },
  {
    icon: Clock,
    label: 'Rata-rata Cair',
    numericValue: 12,
    prefix: '< ',
    suffix: ' Jam',
  },
];

const activities = [
  '🟢 Transaksi #KHD-2483 selesai · Rp 5.200.000 diamankan',
  '🟢 Dana cair ke penjual dalam 8 jam',
  '🔵 Pengguna baru bergabung dari Surabaya',
  '🟢 Sengketa diselesaikan dalam 2 hari',
  '🟢 Transaksi #KHD-2491 dikonfirmasi · Rp 12.000.000',
  '🟢 Transaksi #KHD-2499 selesai · Rp 3.800.000 diamankan',
  '🔵 Pengguna baru bergabung dari Medan',
  '🟢 KYC #U-3841 disetujui',
];

function StatCard({
  icon: Icon, label, numericValue, prefix, suffix, index
}: typeof signals[0] & { index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const count = useCountUp(numericValue, 2.5, visible);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="flex flex-col items-center md:items-start gap-2 px-6 py-6
                 border-r border-border last:border-r-0 first:border-l-0"
    >
      <div className="flex items-center gap-2">
        {(() => { const SignalIcon = Icon; return (
          <SignalIcon className="w-5 h-5 text-success" weight="fill" />
        ); })()}
        <span className="text-[0.6875rem] font-semibold tracking-widest uppercase text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="text-4xl md:text-5xl font-black tracking-tight stat-number">
        {prefix}{count}{suffix}
      </p>
    </motion.div>
  );
}

function ActivityMarquee() {
  return (
    <div className="overflow-hidden border-t border-border py-3 bg-background">
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="flex gap-12 whitespace-nowrap text-sm text-muted-foreground"
        style={{ willChange: 'transform' }}
      >
        {[...activities, ...activities].map((a, i) => (
          <span key={i} className="shrink-0">{a}</span>
        ))}
      </motion.div>
    </div>
  );
}

export default function TrustSignals() {
  return (
    <section className="border-y border-border bg-muted">
      {/* Stats bar */}
      <div className="container py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
          {signals.map((signal, index) => (
            <StatCard key={signal.label} {...signal} index={index} />
          ))}
        </div>
      </div>

      {/* Live activity marquee */}
      <ActivityMarquee />
    </section>
  );
}
KAHADE_EOF
ok "HOME — TrustSignals"

# HOME — ProblemSection
mkdir -p "$(dirname "$SRC/components/home/ProblemSection.tsx")"
cat > "$SRC/components/home/ProblemSection.tsx" << 'KAHADE_EOF'
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Warning, XCircle, ArrowRight } from '@phosphor-icons/react';
import { cn } from '@/lib/ui-utils';
import { fadeInUp, staggerContainer, staggerItem, viewport } from '@/lib/animations';
import { buyerRisks, sellerRisks } from './HomeData';

export default function ProblemSection() {
  return (
    <section className="section-padding-lg bg-background">
      <div className="container">
        <div className="grid lg:grid-cols-[0.4fr_0.6fr] gap-12 lg:gap-20">
          {/* ── KIRI — Sticky heading ── */}
          <motion.div
            {...fadeInUp}
            className="lg:sticky lg:top-28 lg:self-start"
          >
            <span className="badge badge-error mb-6">
              ⚠ Masalah Nyata
            </span>
            <h2
              className="font-black tracking-tight leading-[1.05] mb-6 text-foreground"
              style={{ fontSize: 'clamp(2rem, 4vw + 0.5rem, 3.5rem)' }}
            >
              Risiko ada di kedua sisi.
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg mb-8">
              Tanpa perlindungan yang tepat, setiap transaksi online adalah pertaruhan.
            </p>
            <Link href="#how-it-works">
              <button className="btn-secondary">
                Lihat Solusi
                <ArrowRight className="w-4 h-4" weight="bold" />
              </button>
            </Link>
          </motion.div>

          {/* ── KANAN — Risk cards ── */}
          <div className="space-y-6">
            {/* Buyer risks */}
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={viewport}
              className="rounded-2xl bg-muted border-l-4 border-destructive p-6 md:p-8"
            >
              <motion.div variants={staggerItem} className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-destructive" weight="fill" />
                </div>
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase text-destructive">Risiko Pembeli</p>
                  <p className="text-lg font-bold">Uang pergi, barang tak datang</p>
                </div>
              </motion.div>
              <ul className="space-y-3">
                {buyerRisks.map((risk, i) => (
                  <motion.li
                    key={i}
                    variants={staggerItem}
                    className="flex items-start gap-3 text-sm text-muted-foreground"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 shrink-0" />
                    {risk}
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Seller risks */}
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={viewport}
              className="rounded-2xl bg-muted border-l-4 border-warning p-6 md:p-8"
            >
              <motion.div variants={staggerItem} className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                  <Warning className="w-5 h-5 text-warning" weight="fill" />
                </div>
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase text-warning">Risiko Penjual</p>
                  <p className="text-lg font-bold">Barang terkirim, uang tak cair</p>
                </div>
              </motion.div>
              <ul className="space-y-3">
                {sellerRisks.map((risk, i) => (
                  <motion.li
                    key={i}
                    variants={staggerItem}
                    className="flex items-start gap-3 text-sm text-muted-foreground"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-warning mt-2 shrink-0" />
                    {risk}
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Solution banner */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewport}
              className="rounded-2xl bg-primary text-primary-foreground overflow-hidden"
            >
              <div className="grid md:grid-cols-[1fr_auto] gap-0 items-center">
                <div className="p-6 md:p-8">
                  <p className="text-xs font-bold tracking-widest uppercase opacity-60 mb-3">Solusi Kahade</p>
                  <h3 className="text-2xl font-black mb-3">Kahade menghilangkan semua risiko ini.</h3>
                  <p className="text-primary-foreground/70 text-sm leading-relaxed mb-6">
                    Dana ditahan aman hingga kedua pihak puas. Tidak ada lagi risiko, hanya kepercayaan.
                  </p>
                  <Link href="/register">
                    <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                                       bg-white text-black text-sm font-semibold
                                       hover:bg-neutral-100 transition-colors">
                      Mulai Transaksi Aman
                      <ArrowRight className="w-4 h-4" weight="bold" />
                    </button>
                  </Link>
                </div>

                {/* Flow animation */}
                <div className="hidden md:flex items-center justify-center w-48 h-full bg-white/5 p-6">
                  <div className="flex flex-col items-center gap-2 text-xs text-center">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-lg">💰</div>
                    <div className="w-px h-6 bg-white/20" />
                    <div className="w-12 h-12 rounded-full bg-success/20 border border-success/40 flex items-center justify-center text-lg">🔒</div>
                    <p className="text-white/60 font-medium">Kahade</p>
                    <div className="w-px h-6 bg-white/20" />
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-lg">📦</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
KAHADE_EOF
ok "HOME — ProblemSection"

# HOME — FeaturesSection
mkdir -p "$(dirname "$SRC/components/home/FeaturesSection.tsx")"
cat > "$SRC/components/home/FeaturesSection.tsx" << 'KAHADE_EOF'
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowRight } from '@phosphor-icons/react';
import { cn } from '@/lib/ui-utils';
import { staggerContainer, staggerItem, viewport } from '@/lib/animations';
import { features } from './HomeData';
import { SectionLabel } from '@/components/shared/SectionLabel';

export default function FeaturesSection() {
  const feature1 = features[0];
  const smallFeatures = features.slice(1, 5);
  const feature6 = features[5];

  return (
    <section className="section-padding-lg bg-background" id="features">
      <div className="container">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          className="section-header mb-12"
        >
          <SectionLabel>Platform</SectionLabel>
          <h2 className="section-title mb-4">
            Semua yang Anda butuhkan, dalam satu platform
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-xl mx-auto">
            Dari keamanan setara bank hingga resolusi sengketa — Kahade melindungi setiap transaksi Anda.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={viewport}
          className="bento-grid"
        >
          {/* Feature 1: LARGE (row-span-2) */}
          <motion.div
            variants={staggerItem}
            className="bento-large card card-hover p-8 flex flex-col bg-background border-2 border-border group"
          >
            {(() => {
              const Feature1Icon = feature1.icon;
              return (
                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <Feature1Icon weight="bold" className="w-8 h-8 text-primary-foreground" />
                </div>
              );
            })()}
            <h3 className="text-2xl font-bold mb-4 tracking-tight">{feature1.title}</h3>
            <p className="text-muted-foreground leading-relaxed flex-1">{feature1.description}</p>
            {/* Large visual */}
            <div className="mt-8 rounded-2xl bg-muted h-44 flex items-center justify-center">
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
                  {(() => {
                    const F1Icon = feature1.icon;
                    return <F1Icon className="w-7 h-7 text-success" weight="duotone" />;
                  })()}
                </div>
                <p className="text-xs text-muted-foreground font-medium">Dana Aman & Terlindungi</p>
              </div>
            </div>
          </motion.div>

          {/* Features 2-5: Small */}
          {smallFeatures.map((f) => {
            const FeatureIcon = f.icon;
            return (
              <motion.div
                key={f.title}
                variants={staggerItem}
                className="card card-hover p-6 group"
              >
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-105 transition-all duration-300">
                  <FeatureIcon
                    weight="bold"
                    className="w-6 h-6 text-foreground group-hover:text-primary-foreground transition-colors duration-300"
                  />
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{f.description}</p>
              </motion.div>
            );
          })}

          {/* Feature 6: Wide */}
          {feature6 && (() => {
            const Feature6Icon = feature6.icon;
            return (
              <motion.div
                variants={staggerItem}
                className="bento-wide card card-hover p-8 flex flex-col md:flex-row gap-8 items-center group bg-primary text-primary-foreground border-none"
              >
                <div className="flex-1">
                  <Feature6Icon weight="bold" className="w-10 h-10 mb-4 opacity-80" />
                  <h3 className="text-xl font-bold mb-3">{feature6.title}</h3>
                  <p className="text-primary-foreground/70 leading-relaxed">{feature6.description}</p>
                  <Link href="/features">
                    <button className="inline-flex items-center gap-2 mt-5 text-sm font-semibold hover:underline underline-offset-4">
                      Pelajari lebih lanjut <ArrowRight className="w-4 h-4" weight="bold" />
                    </button>
                  </Link>
                </div>
                <div className="w-full md:w-72 h-48 rounded-2xl bg-primary-foreground/10 flex items-center justify-center shrink-0">
                  <Feature6Icon weight="thin" className="w-24 h-24 opacity-20" />
                </div>
              </motion.div>
            );
          })()}
        </motion.div>
      </div>
    </section>
  );
}
KAHADE_EOF
ok "HOME — FeaturesSection"

# HOME — HowItWorksSection
mkdir -p "$(dirname "$SRC/components/home/HowItWorksSection.tsx")"
cat > "$SRC/components/home/HowItWorksSection.tsx" << 'KAHADE_EOF'
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/ui-utils';
import { steps } from './HomeData';
import { SectionLabel } from '@/components/shared/SectionLabel';

interface StepPreviewProps {
  step: number;
}

function StepPreview({ step }: StepPreviewProps) {
  const stepPreviews: Record<number, React.ReactNode> = {
    0: (
      <div className="space-y-3">
        <div className="h-9 bg-muted rounded-lg animate-pulse" />
        <div className="h-9 bg-muted rounded-lg animate-pulse" />
        <div className="flex gap-2">
          <div className="h-9 bg-muted rounded-lg animate-pulse flex-1" />
          <div className="h-9 bg-primary/10 rounded-lg w-24" />
        </div>
        <p className="text-xs text-muted-foreground text-center pt-2">Form buat transaksi — nama, nilai, durasi</p>
      </div>
    ),
    1: (
      <div className="bg-muted rounded-xl p-4 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Virtual Account BCA</p>
        <p className="font-mono text-lg font-bold tracking-widest">8277-XXXX-XXXX-0001</p>
        <p className="text-xs text-muted-foreground">Nominal: <strong>Rp 5.200.000</strong></p>
        <div className="flex items-center gap-2 text-xs text-warning">
          <span>⏰</span><span>Berlaku 2 jam</span>
        </div>
      </div>
    ),
    2: (
      <div className="space-y-2">
        {['Transaksi dibuat', 'Dana disimpan', 'Penjual dikonfirmasi'].map((label, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <span className="text-sm">{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-primary animate-pulse flex items-center justify-center">
            <span className="text-white text-xs">●</span>
          </div>
          <span className="text-sm font-semibold text-primary">Menunggu konfirmasi</span>
        </div>
      </div>
    ),
    3: (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
          <span className="text-3xl">📦</span>
        </div>
        <p className="text-sm text-muted-foreground">Barang sudah diterima?</p>
        <button className="btn-primary w-full">✓ Konfirmasi Terima Barang</button>
      </div>
    ),
    4: (
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto">
          <span className="text-white text-2xl">✓</span>
        </div>
        <p className="font-bold text-success">Transaksi Selesai!</p>
        <p className="text-sm text-muted-foreground">
          Dana <strong>Rp 5.070.000</strong> telah dikirim ke penjual.
        </p>
      </div>
    ),
  };

  return (
    <div className="min-h-[160px] flex flex-col justify-center">
      {stepPreviews[step] ?? (
        <div className="text-center text-sm text-muted-foreground">Preview untuk langkah {step + 1}</div>
      )}
    </div>
  );
}

export default function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  // FIX (v3.3): pause-on-hover
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveStep(prev => (prev + 1) % steps.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <section
      className="section-padding-lg bg-muted"
      id="how-it-works"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container">
        {/* Heading */}
        <div className="section-header mb-12">
          <SectionLabel variant="light">Cara Kerja</SectionLabel>
          <h2 className="section-title">5 langkah transaksi aman</h2>
        </div>

        {/* Step tabs — FIX: role="tablist" + ARIA */}
        <div
          role="tablist"
          aria-label="Langkah-langkah proses"
          className="flex gap-2 overflow-x-auto pb-2 mb-3 no-scrollbar"
        >
          {steps.map((step, i) => (
            <button
              key={step.step}
              role="tab"
              aria-selected={activeStep === i}
              aria-controls={`step-panel-${i}`}
              id={`step-tab-${i}`}
              onClick={() => setActiveStep(i)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold',
                'whitespace-nowrap transition-all duration-200 shrink-0',
                activeStep === i
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-background text-muted-foreground hover:text-foreground hover:bg-neutral-100'
              )}
            >
              <span className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                activeStep === i ? 'bg-primary-foreground/20' : 'bg-muted'
              )}>
                {i + 1}
              </span>
              {step.title}
            </button>
          ))}
        </div>

        {/* Progress bar — FIX: scaleX (GPU-composited) */}
        <div className="h-1 bg-border rounded-full mb-10 overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full origin-left"
            animate={{ scaleX: (activeStep + 1) / steps.length }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            style={{ transformOrigin: 'left center', willChange: 'transform' }}
          />
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center"
          >
            {/* Left: step detail */}
            <div
              role="tabpanel"
              id={`step-panel-${activeStep}`}
              aria-labelledby={`step-tab-${activeStep}`}
            >
              <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-3 block">
                Langkah {activeStep + 1} dari {steps.length}
              </span>
              <h3 className="text-3xl font-bold mb-4 tracking-tight">{steps[activeStep].title}</h3>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                {steps[activeStep].description}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                  disabled={activeStep === 0}
                  className="btn-secondary btn-sm disabled:opacity-40"
                >
                  ← Sebelumnya
                </button>
                <button
                  onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
                  disabled={activeStep === steps.length - 1}
                  className="btn-primary btn-sm disabled:opacity-40"
                >
                  Selanjutnya →
                </button>
              </div>
            </div>

            {/* Right: preview */}
            <div className="card p-6 md:p-8 bg-background shadow-E4 border-2 border-border">
              <div className="flex items-center gap-3 mb-6">
                {(() => {
                  const StepIcon = steps[activeStep].icon;
                  return (
                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                      <StepIcon weight="bold" className="w-6 h-6 text-primary-foreground" />
                    </div>
                  );
                })()}
                <div>
                  <p className="font-bold">{steps[activeStep].title}</p>
                  <p className="text-xs text-muted-foreground">Preview interaksi</p>
                </div>
              </div>
              <StepPreview step={activeStep} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
KAHADE_EOF
ok "HOME — HowItWorksSection"

# HOME — PricingSection
mkdir -p "$(dirname "$SRC/components/home/PricingSection.tsx")"
cat > "$SRC/components/home/PricingSection.tsx" << 'KAHADE_EOF'
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import { Check, ArrowRight } from '@phosphor-icons/react';
import { cn } from '@/lib/ui-utils';
import { staggerContainer, staggerItem, viewport } from '@/lib/animations';
import { pricingPlans } from './HomeData';
import { SectionLabel } from '@/components/shared/SectionLabel';

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section className="section-padding-lg bg-background" id="pricing">
      <div className="container">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          className="section-header mb-10"
        >
          <SectionLabel>Harga</SectionLabel>
          <h2 className="section-title mb-4">Harga yang Jelas & Transparan</h2>
          <p className="text-muted-foreground text-lg">Tidak ada biaya tersembunyi. Selalu.</p>
        </motion.div>

        {/* Toggle */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-1 p-1.5 bg-muted rounded-full border border-border">
            <button
              onClick={() => setIsYearly(false)}
              className={cn(
                'px-5 py-2 rounded-full text-sm font-semibold transition-all',
                !isYearly ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
              )}
            >
              Bulanan
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={cn(
                'px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2',
                isYearly ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
              )}
            >
              Tahunan
              <span className="text-[0.625rem] font-bold bg-success text-white px-1.5 py-0.5 rounded-full">-20%</span>
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={viewport}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start"
        >
          {pricingPlans.map((plan, i) => {
            const isPopular = i === 1;
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            return (
              <motion.div
                key={plan.name}
                variants={staggerItem}
                className={cn(
                  'relative rounded-2xl border-2 p-8 flex flex-col',
                  isPopular
                    ? 'border-primary bg-primary/5 scale-[1.03] shadow-E4'
                    : 'border-border bg-background'
                )}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="badge badge-primary px-4 py-1.5 shadow-md">⭐ Paling Populer</span>
                  </div>
                )}

                <p className="text-sm font-bold tracking-widest uppercase text-muted-foreground mb-3">{plan.name}</p>
                <p className="text-muted-foreground text-sm mb-6 leading-relaxed">{plan.description}</p>

                {/* Price with animation */}
                <div className="mb-8">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isYearly ? 'yearly' : 'monthly'}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {price === 0 ? (
                        <p className="text-4xl font-black tracking-tight">Gratis</p>
                      ) : (
                        <div>
                          <span className="text-lg font-semibold text-muted-foreground">Rp </span>
                          <span className="text-4xl font-black tracking-tight">{price.toLocaleString('id-ID')}</span>
                          <span className="text-sm text-muted-foreground">/bulan</span>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className="w-4 h-4 text-success shrink-0 mt-0.5" weight="bold" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link href={plan.monthlyPrice === 0 ? '/register' : plan.name === 'Enterprise' ? '/contact' : '/register'}>
                  <button className={cn(
                    'w-full flex items-center justify-center gap-2',
                    isPopular ? 'btn-primary' : 'btn-secondary'
                  )}>
                    {plan.monthlyPrice === 0 ? 'Mulai Gratis' :
                     plan.name === 'Enterprise' ? 'Hubungi Kami' : 'Coba 14 Hari Gratis'}
                    <ArrowRight className="w-4 h-4" weight="bold" />
                  </button>
                </Link>
                {isPopular && (
                  <p className="text-xs text-muted-foreground text-center mt-3">Tidak butuh kartu kredit</p>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Platform fee note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={viewport}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          Platform fee: <strong className="text-foreground">2.5% per transaksi</strong> (min. Rp 2.500, maks. Rp 250.000)
        </motion.p>

        {/* Social proof avatar stack */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          className="flex items-center gap-3 justify-center mt-6 text-sm text-muted-foreground"
        >
          <div className="flex -space-x-2">
            {['AR', 'SW', 'MB', 'DK', 'RT'].map((initials, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-neutral-300 border-2 border-background flex items-center justify-center text-xs font-bold text-neutral-600"
              >
                {initials}
              </div>
            ))}
          </div>
          <span>Dipercaya <strong className="text-foreground">8.000+</strong> pengguna aktif</span>
        </motion.div>
      </div>
    </section>
  );
}
KAHADE_EOF
ok "HOME — PricingSection"

# HOME — TestimonialsSection
mkdir -p "$(dirname "$SRC/components/home/TestimonialsSection.tsx")"
cat > "$SRC/components/home/TestimonialsSection.tsx" << 'KAHADE_EOF'
import { motion } from 'framer-motion';
import { Star } from '@phosphor-icons/react';
import { cn } from '@/lib/ui-utils';
import { viewport } from '@/lib/animations';
import { SectionLabel } from '@/components/shared/SectionLabel';

const testimonials = [
  { name: 'Ahmad Rizki', role: 'Penjual Online', rating: 5, avatar: 'AR', content: 'Kahade membuat transaksi online jadi jauh lebih aman. Pembeli percaya dan saya tidak khawatir lagi soal penipuan.' },
  { name: 'Siti Wahyuni', role: 'Freelancer Desainer', rating: 5, avatar: 'SW', content: 'Sebagai freelancer, saya sering khawatir soal pembayaran. Dengan Kahade, klien saya lebih percaya dan pembayaran selalu tepat waktu.' },
  { name: 'Budi Santoso', role: 'Pembeli Online', rating: 5, avatar: 'BS', content: 'Pernah kena tipu sekali sebelum pakai Kahade. Sekarang saya tidak akan belanja online tanpa escrow dari Kahade.' },
  { name: 'Dewi Kurnia', role: 'Pemilik Toko Online', rating: 5, avatar: 'DK', content: 'Fitur resolusi sengketa sangat membantu. Tim Kahade profesional dan adil dalam menangani masalah.' },
  { name: 'Rudi Hermawan', role: 'Developer Freelance', rating: 5, avatar: 'RH', content: 'API Kahade mudah diintegrasikan. Dokumentasinya lengkap dan tim support sangat responsif.' },
  { name: 'Maya Putri', role: 'Importir Barang', rating: 5, avatar: 'MP', content: 'Untuk transaksi nilai besar, Kahade adalah pilihan terbaik. Dana saya terlindungi dengan baik.' },
  { name: 'Faisal Rahman', role: 'Pengusaha Muda', rating: 5, avatar: 'FR', content: 'Proses cepat, aman, dan transparan. Kahade benar-benar mengubah cara saya berbisnis online.' },
  { name: 'Linda Susanti', role: 'Penjual Properti', rating: 4, avatar: 'LS', content: 'Untuk transaksi properti, kepercayaan adalah segalanya. Kahade memberikan rasa aman yang tidak bisa digantikan.' },
  { name: 'Hendra Gunawan', role: 'Pedagang Elektronik', rating: 5, avatar: 'HG', content: 'Pelanggan saya lebih puas karena mereka tahu uang mereka aman. Penjualan meningkat 40% sejak pakai Kahade.' },
  { name: 'Rina Maharani', role: 'Kreator Konten', rating: 5, avatar: 'RM', content: 'Untuk brand deal dan kolaborasi, Kahade memastikan semua pihak memenuhi kewajiban mereka.' },
];

function TestimonialMarquee({ items, direction = 'left' }: {
  items: typeof testimonials;
  direction?: 'left' | 'right';
}) {
  return (
    <div className="overflow-hidden">
      <motion.div
        animate={{ x: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'] }}
        transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
        className="flex gap-6 w-max"
        style={{ willChange: 'transform' }}
      >
        {[...items, ...items].map((t, i) => (
          <div
            key={i}
            className="w-80 shrink-0 card p-6 hover:shadow-E3 transition-shadow duration-300"
          >
            <div className="flex gap-1 mb-4">
              {[...Array(t.rating)].map((_, j) => (
                <Star key={j} weight="fill" className="w-4 h-4 text-warning" />
              ))}
            </div>
            <blockquote className="text-sm text-muted-foreground leading-relaxed mb-5 line-clamp-4">
              "{t.content}"
            </blockquote>
            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">
                {t.avatar}
              </div>
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function TestimonialsSection() {
  const firstHalf = testimonials.slice(0, 5);
  const secondHalf = testimonials.slice(5);

  return (
    <section className="section-padding-lg bg-background overflow-hidden">
      <div className="container mb-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          {/* Left: heading */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
          >
            <SectionLabel variant="light">Testimoni</SectionLabel>
            <h2 className="section-title">
              Dipercaya ribuan<br className="hidden md:block" /> pengguna
            </h2>
          </motion.div>

          {/* Right: rating overview */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={viewport}
            className="flex flex-col items-start md:items-end"
          >
            <div className="flex gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} weight="fill" className="w-5 h-5 text-warning" />
              ))}
            </div>
            <p className="text-3xl font-black">4.9<span className="text-lg font-medium text-muted-foreground">/5</span></p>
            <p className="text-sm text-muted-foreground">2.100+ ulasan</p>

            {/* Rating bars */}
            <div className="mt-4 space-y-1.5 w-40">
              {[{ stars: 5, pct: 87 }, { stars: 4, pct: 11 }, { stars: 3, pct: 2 }].map(({ stars, pct }) => (
                <div key={stars} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-10">{stars} ★</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-warning rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Marquee rows */}
      <div className="space-y-6">
        <TestimonialMarquee items={firstHalf} direction="left" />
        <TestimonialMarquee items={secondHalf} direction="right" />
      </div>

      {/* CTA */}
      <div className="container mt-12 text-center">
        <a href="/blog" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4">
          Lihat semua ulasan →
        </a>
      </div>
    </section>
  );
}
KAHADE_EOF
ok "HOME — TestimonialsSection"

# HOME — FinalCTA
mkdir -p "$(dirname "$SRC/components/home/FinalCTA.tsx")"
cat > "$SRC/components/home/FinalCTA.tsx" << 'KAHADE_EOF'
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowRight, CheckCircle } from '@phosphor-icons/react';
import { staggerContainer, staggerItem, viewport } from '@/lib/animations';

const trustItems = [
  '10K+ Pengguna Aktif',
  'Rp 50M+ Dana Aman',
  '99.9% Uptime',
  '< 12 Jam Pencairan',
];

export default function FinalCTA() {
  return (
    <section
      className="section-padding-lg relative overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.04) 0%, transparent 60%), #0A0A0A',
      }}
    >
      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        aria-hidden="true"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-[1fr_auto] gap-12 lg:gap-20 items-center">
          {/* Left: Text content */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={viewport}
          >
            <motion.h2
              variants={staggerItem}
              className="font-black leading-[1.05] tracking-tight text-white mb-6"
              style={{ fontSize: 'clamp(2.5rem, 4vw + 1rem, 5.5rem)' }}
            >
              Siap mengamankan transaksi Anda?
            </motion.h2>
            <motion.p
              variants={staggerItem}
              className="text-white/60 text-lg leading-relaxed mb-2"
            >
              Tidak butuh kartu kredit.
            </motion.p>
            <motion.p
              variants={staggerItem}
              className="text-white/60 text-lg leading-relaxed mb-10"
            >
              Setup dalam 5 menit.
            </motion.p>
            <motion.div
              variants={staggerItem}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/register">
                <button className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl
                                   bg-white text-black text-base font-semibold
                                   hover:bg-neutral-100 transition-colors">
                  Mulai Gratis
                  <ArrowRight className="w-5 h-5" weight="bold" />
                </button>
              </Link>
              <Link href="/contact">
                <button className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl
                                   border border-white/30 text-white text-base font-semibold
                                   hover:border-white/60 transition-colors">
                  Hubungi Sales
                </button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right: Trust stats panel */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={viewport}
            transition={{ delay: 0.2 }}
            className="border border-white/10 bg-white/5 rounded-2xl p-6 w-full lg:w-72"
          >
            <p className="text-xs font-bold tracking-widest uppercase text-white/40 mb-5">Platform Stats</p>
            <div className="space-y-4">
              {trustItems.map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={viewport}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle className="w-5 h-5 text-success shrink-0" weight="fill" />
                  <span className="text-sm text-white/80 font-medium">{item}</span>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-white/10">
              <p className="text-xs text-white/40 leading-relaxed">
                Bergabunglah dengan ribuan pengguna yang sudah mempercayai Kahade untuk transaksi aman mereka.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
KAHADE_EOF
ok "HOME — FinalCTA"

step "LAYOUT"
# LAYOUT — Navbar
mkdir -p "$(dirname "$SRC/components/layout/Navbar.tsx")"
cat > "$SRC/components/layout/Navbar.tsx" << 'KAHADE_EOF'
/*
 * KAHADE NAVBAR - OPTIMIZED EDITION V2.0
 * 
 * Improvements:
 * - Uses design system utilities (animations, cn, ariaProps)
 * - Enhanced accessibility (keyboard nav, ARIA labels)
 * - Performance optimized (useMemo, useCallback)
 * - Better code organization
 * - Reduced inline styles
 * 
 * Bug #5 fix: Mega menu width changed from w-[600px] fixed to w-[min(600px,calc(100vw-2rem))]
 * to prevent horizontal overflow on mobile viewports.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  List, X, CaretDown, CaretRight, 
  Rocket, ShieldCheck, Users, CreditCard, ChartLine, Headset,
  BookOpen, FileText, Question, Newspaper, Buildings, Briefcase,
  ArrowRight, ArrowUpRight
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { APP_URLS, canAccessAdmin, navigateToApp, navigateToAdmin } from '@/config/app.config';
import { LanguageSwitcher, LanguageSwitcherCompact } from '@/components/LanguageSwitcher';
import { cn, ariaProps, keyboardNav } from '@/lib/ui-utils';
import { fadeIn, slideInDown } from '@/lib/animations';

// Mega Menu Data - Memoized for performance
const megaMenuData = {
  product: {
    label: 'Produk',
    sections: [
      {
        title: 'Platform',
        links: [
          { href: '/#features', label: 'Fitur', icon: Rocket, description: 'Jelajahi semua fitur platform' },
          { href: '/#security', label: 'Keamanan', icon: ShieldCheck, description: 'Perlindungan setara enterprise' },
          { href: '/#pricing', label: 'Harga', icon: CreditCard, description: 'Rencana harga transparan' },
        ]
      },
      {
        title: 'Solusi',
        links: [
          { href: '/use-cases', label: 'Marketplace', icon: Users, description: 'Untuk marketplace online' },
          { href: '/use-cases#freelance', label: 'Freelancer', icon: Briefcase, description: 'Pembayaran freelance yang aman' },
          { href: '/contact', label: 'Enterprise', icon: Buildings, description: 'Solusi enterprise kustom' },
        ]
      }
    ],
    featured: {
      title: 'Rilis Terbaru',
      description: 'Kenalkan Kahade Mobile App - Transaksi aman di mana saja',
      href: '/mobile-app',
      badge: 'Baru'
    }
  },
  resources: {
    label: 'Sumber Daya',
    sections: [
      {
        title: 'Pelajari',
        links: [
          { href: '/blog', label: 'Blog', icon: Newspaper, description: 'Berita dan update terbaru' },
          { href: '/how-it-works', label: 'Cara Kerja', icon: BookOpen, description: 'Panduan langkah demi langkah' },
          { href: '/faq', label: 'FAQ', icon: Question, description: 'Jawaban pertanyaan umum' },
        ]
      },
      {
        title: 'Dokumentasi',
        links: [
          { href: '/help#api', label: 'Dokumentasi API', icon: FileText, description: 'Dokumentasi untuk developer' },
          { href: '/help#integration', label: 'Panduan Integrasi', icon: ChartLine, description: 'Tutorial integrasi' },
          { href: '/help', label: 'Pusat Bantuan', icon: Headset, description: 'Sumber bantuan 24/7' },
        ]
      }
    ]
  },
  company: {
    label: 'Perusahaan',
    links: [
      { href: '/about', label: 'Tentang Kami' },
      { href: '/careers', label: 'Karier' },
      { href: '/contact', label: 'Kontak' },
      { href: '/press', label: 'Pers' },
    ]
  }
};

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [expandedMobileMenu, setExpandedMobileMenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const navRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll detection for blur effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard handlers
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveMenu(null);
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleDashboardClick = useCallback(() => {
    if (canAccessAdmin(user)) {
      navigateToAdmin();
    } else {
      navigateToApp();
    }
  }, [user]);

  const handleMenuEnter = useCallback((menuKey: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setActiveMenu(menuKey);
  }, []);

  const handleMenuLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 150);
  }, []);

  const toggleMobileSubmenu = useCallback((menuKey: string) => {
    setExpandedMobileMenu(prev => prev === menuKey ? null : menuKey);
  }, []);

  const closeAllMenus = useCallback(() => {
    setActiveMenu(null);
    setIsMobileMenuOpen(false);
  }, []);

  // Memoize navbar classes for performance - NO GLASS, NO SHADOW
  const navClasses = useMemo(() => cn(
    'fixed top-0 left-0 right-0 z-50 py-3 md:py-4 transition-all duration-300',
    'bg-[#FFFFFF] border-b border-[#E8E8E8]'
  ), []);

  return (
    <>
      <nav
        ref={navRef}
        className={navClasses}
        role="navigation"
        aria-label="Navigasi utama"
      >
        <div className="container flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="block flex items-center shrink-0 relative z-10">
            <img 
              src="/images/logo.svg" 
              alt="Kahade - Platform Escrow Terpercaya" 
              className="h-8 w-auto"
              width={120}
              height={32}
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {/* Product - Mega Menu */}
            <NavMenuItem
              menuKey="product"
              label="Produk"
              activeMenu={activeMenu}
              onMenuEnter={handleMenuEnter}
              onMouseLeave={handleMenuLeave}
            >
              <MegaMenuProduct
                data={megaMenuData.product}
                onClose={closeAllMenus}
                onMouseEnter={() => handleMenuEnter('product')}
                onMouseLeave={handleMenuLeave}
              />
            </NavMenuItem>

            {/* Resources - Mega Menu */}
            <NavMenuItem
              menuKey="resources"
              label="Sumber Daya"
              activeMenu={activeMenu}
              onMenuEnter={handleMenuEnter}
              onMouseLeave={handleMenuLeave}
            >
              <MegaMenuResources
                data={megaMenuData.resources}
                onClose={closeAllMenus}
                onMouseEnter={() => handleMenuEnter('resources')}
                onMouseLeave={handleMenuLeave}
              />
            </NavMenuItem>

            {/* Company - Simple Dropdown */}
            <NavMenuItem
              menuKey="company"
              label="Perusahaan"
              activeMenu={activeMenu}
              onMenuEnter={handleMenuEnter}
              onMouseLeave={handleMenuLeave}
            >
              <SimpleDropdown
                links={megaMenuData.company.links}
                onClose={closeAllMenus}
                onMouseEnter={() => handleMenuEnter('company')}
                onMouseLeave={handleMenuLeave}
              />
            </NavMenuItem>
          </div>

          {/* CTA Buttons - Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <LanguageSwitcher />
            {isAuthenticated ? (
              <Button 
                onClick={handleDashboardClick}
                className="btn-primary"
                {...ariaProps('Pergi ke dashboard')}
              >
                Dashboard
                <ArrowRight className="ml-2 w-4 h-4" weight="bold" aria-hidden="true" />
              </Button>
            ) : (
              <>
                <Link href="/login" className="block block">
                  <Button 
                    variant="ghost" 
                    className="btn-ghost"
                    {...ariaProps('Masuk ke akun Anda')}
                  >
                    Masuk
                  </Button>
                </Link>
                <Link href="/register" className="block block">
                  <Button 
                    className="btn-primary"
                    {...ariaProps('Buat akun baru')}
                  >
                    Mulai
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile: CTA + Hamburger */}
          <div className="flex lg:hidden items-center gap-3">
            {!isAuthenticated && (
              <Link href="/register" className="block block">
                <Button className="btn-primary btn-xs">
                  Mulai
                </Button>
              </Link>
            )}
            {isAuthenticated && (
              <Button 
                onClick={handleDashboardClick}
                className="btn-primary btn-xs"
              >
                Dashboard
              </Button>
            )}
            <button
              className="p-2 hover:bg-muted rounded-lg transition-colors relative z-10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              {...ariaProps(
                isMobileMenuOpen ? 'Tutup menu' : 'Buka menu',
                undefined,
                isMobileMenuOpen
              )}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" weight="bold" aria-hidden="true" />
              ) : (
                <List className="w-6 h-6" weight="bold" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <MobileMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            expandedMenu={expandedMobileMenu}
            onToggleMenu={toggleMobileSubmenu}
            isAuthenticated={isAuthenticated}
            onDashboardClick={handleDashboardClick}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface NavMenuItemProps {
  menuKey: string;
  label: string;
  activeMenu: string | null;
  onMenuEnter: (key: string) => void;
  onMouseLeave: () => void;
  children: React.ReactNode;
}

function NavMenuItem({ menuKey, label, activeMenu, onMenuEnter, onMouseLeave, children }: NavMenuItemProps) {
  const isActive = activeMenu === menuKey;
  
  return (
    <div 
      className="relative"
      onMouseEnter={() => onMenuEnter(menuKey)}
      onMouseLeave={onMouseLeave}
    >
      <button
        className={cn(
          'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
          isActive 
            ? 'text-foreground bg-muted' 
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        )}
        aria-expanded={isActive}
        aria-haspopup="true"
        onKeyDown={keyboardNav({
          onEnter: () => onMenuEnter(menuKey),
          onEscape: onMouseLeave,
        })}
      >
        {label}
        <CaretDown 
          className={cn(
            'w-4 h-4 transition-transform duration-200',
            isActive && 'rotate-180'
          )} 
          weight="bold" 
          aria-hidden="true"
        />
      </button>
      
      <AnimatePresence>
        {isActive && children}
      </AnimatePresence>
    </div>
  );
}

interface MegaMenuProductProps {
  data: typeof megaMenuData.product;
  onClose: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function MegaMenuProduct({ data, onClose, onMouseEnter, onMouseLeave }: MegaMenuProductProps) {
  return (
    // Bug #5 fix: w-[min(600px,calc(100vw-2rem))] prevents horizontal overflow on mobile
    <motion.div
      {...slideInDown}
      className="absolute top-full left-0 mt-2 w-[min(600px,calc(100vw-2rem))] bg-popover rounded-lg border border-border p-6 shadow-lg"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="grid grid-cols-2 gap-8">
        {data.sections.map((section) => (
          <div key={section.title}>
            <h4 className="section-label text-xs mb-4">
              {section.title}
            </h4>
            <div className="space-y-1">
              {section.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block flex items-start gap-4 p-2 rounded-lg hover:bg-muted transition-all duration-200 group"
                  onClick={onClose}
                >
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
                    <link.icon className="w-5 h-5" weight="bold" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">
                      {link.label}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {link.description}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Featured Section */}
      <div className="mt-6 pt-6 border-t border-border">
        <Link
          href={data.featured.href}
          className="block flex items-center justify-between p-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 group"
          onClick={onClose}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{data.featured.title}</span>
              <span className="badge badge-secondary">
                {data.featured.badge}
              </span>
            </div>
            <p className="text-xs text-primary-foreground/70 mt-1">
              {data.featured.description}
            </p>
          </div>
          <ArrowUpRight 
            className="w-5 h-5 text-primary-foreground/70 group-hover:text-primary-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" 
            weight="bold" 
            aria-hidden="true"
          />
        </Link>
      </div>
    </motion.div>
  );
}

interface MegaMenuResourcesProps {
  data: typeof megaMenuData.resources;
  onClose: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function MegaMenuResources({ data, onClose, onMouseEnter, onMouseLeave }: MegaMenuResourcesProps) {
  return (
    // Bug #5 fix: w-[min(500px,calc(100vw-2rem))] prevents horizontal overflow on mobile
    <motion.div
      {...slideInDown}
      className="absolute top-full left-0 mt-2 w-[min(500px,calc(100vw-2rem))] bg-popover rounded-lg border border-border p-6 shadow-lg"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="grid grid-cols-2 gap-8">
        {data.sections.map((section) => (
          <div key={section.title}>
            <h4 className="section-label text-xs mb-4">
              {section.title}
            </h4>
            <div className="space-y-1">
              {section.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block flex items-start gap-4 p-2 rounded-lg hover:bg-muted transition-all duration-200 group"
                  onClick={onClose}
                >
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
                    <link.icon className="w-5 h-5" weight="bold" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">
                      {link.label}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {link.description}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

interface SimpleDropdownProps {
  links: Array<{ href: string; label: string }>;
  onClose: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function SimpleDropdown({ links, onClose, onMouseEnter, onMouseLeave }: SimpleDropdownProps) {
  return (
    <motion.div
      {...slideInDown}
      className="absolute top-full left-0 mt-2 w-48 bg-popover rounded-lg border border-border p-2 shadow-md"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="block px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all duration-200"
          onClick={onClose}
        >
          {link.label}
        </Link>
      ))}
    </motion.div>
  );
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  expandedMenu: string | null;
  onToggleMenu: (key: string) => void;
  isAuthenticated: boolean;
  onDashboardClick: () => void;
}

function MobileMenu({ 
  isOpen, 
  onClose, 
  expandedMenu, 
  onToggleMenu, 
  isAuthenticated, 
  onDashboardClick 
}: MobileMenuProps) {
  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-0 bg-background z-50 lg:hidden overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Menu navigasi mobile"
    >
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
        <img src="/images/logo.svg" alt="Kahade" className="h-7 w-auto" />
        <button
          onClick={onClose}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          {...ariaProps('Tutup menu')}
        >
          <X className="w-6 h-6" weight="bold" aria-hidden="true" />
        </button>
      </div>

      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Bahasa</span>
          <LanguageSwitcherCompact />
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="p-6 space-y-2" aria-label="Navigasi utama mobile">
        {/* Product */}
        <MobileMenuItem
          title="Produk"
          menuKey="product"
          isExpanded={expandedMenu === 'product'}
          onToggle={onToggleMenu}
        >
          {megaMenuData.product.sections.flatMap(s => s.links).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="block flex items-center gap-4 px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <link.icon className="w-5 h-5" weight="bold" aria-hidden="true" />
              {link.label}
            </Link>
          ))}
        </MobileMenuItem>
        
        {/* Resources */}
        <MobileMenuItem
          title="Sumber Daya"
          menuKey="resources"
          isExpanded={expandedMenu === 'resources'}
          onToggle={onToggleMenu}
        >
          {megaMenuData.resources.sections.flatMap(s => s.links).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="block flex items-center gap-4 px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <link.icon className="w-5 h-5" weight="bold" aria-hidden="true" />
              {link.label}
            </Link>
          ))}
        </MobileMenuItem>
        
        {/* Company */}
        <MobileMenuItem
          title="Perusahaan"
          menuKey="company"
          isExpanded={expandedMenu === 'company'}
          onToggle={onToggleMenu}
        >
          {megaMenuData.company.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="block px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </MobileMenuItem>
      </nav>
      
      {/* CTA Section */}
      <div className="p-6 border-t border-border space-y-4">
        {isAuthenticated ? (
          <Button 
            onClick={() => {
              onDashboardClick();
              onClose();
            }}
            className="btn-primary w-full"
          >
            Dashboard
          </Button>
        ) : (
          <>
            <Link href="/register" onClick={onClose}>
              <Button className="btn-primary w-full">
                Mulai
              </Button>
            </Link>
            <Link href="/login" onClick={onClose}>
              <Button variant="outline" className="w-full">
                Masuk
              </Button>
            </Link>
          </>
        )}
      </div>
    </motion.div>
  );
}

interface MobileMenuItemProps {
  title: string;
  menuKey: string;
  isExpanded: boolean;
  onToggle: (key: string) => void;
  children: React.ReactNode;
}

function MobileMenuItem({ title, menuKey, isExpanded, onToggle, children }: MobileMenuItemProps) {
  return (
    <div>
      <button
        onClick={() => onToggle(menuKey)}
        className="w-full flex items-center justify-between px-4 py-3 text-left font-semibold hover:bg-muted rounded-lg transition-colors"
        aria-expanded={isExpanded}
        onKeyDown={keyboardNav({
          onEnter: () => onToggle(menuKey),
          onSpace: () => onToggle(menuKey),
        })}
      >
        {title}
        <CaretDown 
          className={cn(
            'w-5 h-5 transition-transform',
            isExpanded && 'rotate-180'
          )} 
          weight="bold" 
          aria-hidden="true"
        />
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pl-4 py-2 space-y-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
KAHADE_EOF
ok "LAYOUT — Navbar"

# LAYOUT — Footer
mkdir -p "$(dirname "$SRC/components/layout/Footer.tsx")"
cat > "$SRC/components/layout/Footer.tsx" << 'KAHADE_EOF'
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import {
  FacebookLogo, TwitterLogo, InstagramLogo, LinkedinLogo,
  Lock, ShieldCheck, Certificate, FileText
} from '@phosphor-icons/react';
import { cn } from '@/lib/ui-utils';
import { staggerContainer, staggerItem, viewport } from '@/lib/animations';

const footerLinks = {
  produk: [
    { label: 'Fitur', href: '/features' },
    { label: 'Harga', href: '/pricing' },
    { label: 'Keamanan', href: '/security' },
    { label: 'Integrasi', href: '/integration-docs' },
  ],
  perusahaan: [
    { label: 'Tentang', href: '/about' },
    { label: 'Karir', href: '/careers' },
    { label: 'Kontak', href: '/contact' },
    { label: 'Pers', href: '/press' },
  ],
  sumberDaya: [
    { label: 'Blog', href: '/blog' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Cara Kerja', href: '/how-it-works' },
    { label: 'Dokumentasi', href: '/api-docs' },
  ],
  legal: [
    { label: 'Privasi', href: '/privacy' },
    { label: 'Syarat', href: '/terms' },
    { label: 'Cookie', href: '/cookies' },
    { label: 'Lisensi', href: '/licenses' },
  ],
};

const complianceBadges = [
  { icon: Lock, label: 'SSL 256-bit' },
  { icon: Certificate, label: 'OJK Compliant' },
  { icon: ShieldCheck, label: 'Bank-grade Security' },
  { icon: FileText, label: 'ISO 27001' },
];

const socialLinks = [
  { icon: FacebookLogo, href: '#', label: 'Facebook' },
  { icon: TwitterLogo, href: '#', label: 'Twitter/X' },
  { icon: InstagramLogo, href: '#', label: 'Instagram' },
  { icon: LinkedinLogo, href: '#', label: 'LinkedIn' },
];

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container">
        {/* Top section: Description + Newsletter */}
        <div className="grid md:grid-cols-2 gap-12 py-16 border-b border-primary-foreground/10">
          {/* Left: Logo + tagline */}
          <div>
            <Link href="/">
              <span className="font-display font-black text-2xl tracking-tight text-white">KAHADE</span>
            </Link>
            <p className="text-primary-foreground/60 text-sm leading-relaxed mt-3 max-w-xs">
              Membangun kepercayaan di setiap transaksi. PT Kawal Hak Dengan Aman — platform escrow terpercaya Indonesia.
            </p>
          </div>

          {/* Right: Newsletter */}
          <div>
            <p className="text-sm font-semibold text-white mb-1">Tetap update</p>
            <p className="text-xs text-primary-foreground/60 mb-4">
              Berita keamanan & fitur terbaru Kahade, langsung ke inbox Anda.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Alamat email Anda..."
                className="flex-1 bg-white/10 border border-white/20 text-white placeholder:text-white/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/50 transition-colors"
              />
              <button className="px-4 py-2.5 bg-white text-black text-sm font-semibold rounded-xl hover:bg-neutral-100 transition-colors whitespace-nowrap">
                Berlangganan →
              </button>
            </div>
            <p className="text-xs text-primary-foreground/40 mt-2">Tidak ada spam. Berhenti kapan saja.</p>
          </div>
        </div>

        {/* Links grid */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={viewport}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-b border-primary-foreground/10"
        >
          {(Object.entries({
            'PRODUK': footerLinks.produk,
            'PERUSAHAAN': footerLinks.perusahaan,
            'SUMBER DAYA': footerLinks.sumberDaya,
            'LEGAL': footerLinks.legal,
          })).map(([heading, links]) => (
            <motion.div key={heading} variants={staggerItem}>
              <p className="text-[0.6875rem] font-bold tracking-widest uppercase text-primary-foreground/50 mb-4">
                {heading}
              </p>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href}>
                      <span className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors cursor-pointer">
                        {label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Compliance badges */}
        <div className="flex flex-wrap gap-3 py-6 border-b border-primary-foreground/10">
          {complianceBadges.map(({ icon: BadgeIcon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary-foreground/20 text-xs font-semibold text-primary-foreground/60"
            >
              <BadgeIcon className="w-3.5 h-3.5" weight="bold" />
              {label}
            </div>
          ))}
        </div>

        {/* Bottom: Copyright + Social */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-6">
          <p className="text-xs text-primary-foreground/40">
            © {new Date().getFullYear()} PT Kawal Hak Dengan Aman. Hak cipta dilindungi.
          </p>

          <div className="flex items-center gap-4">
            {/* Language switcher placeholder */}
            <div className="flex gap-2 text-xs text-primary-foreground/40">
              <button className="hover:text-primary-foreground transition-colors">🌐 ID</button>
              <button className="hover:text-primary-foreground transition-colors">EN</button>
            </div>

            {/* Social links */}
            <div className="flex gap-3">
              {socialLinks.map(({ icon: SocialIcon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-primary-foreground/60 hover:text-primary-foreground hover:scale-110 transition-all"
                >
                  <SocialIcon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
KAHADE_EOF
ok "LAYOUT — Footer"

# LAYOUT — DashboardLayout
mkdir -p "$(dirname "$SRC/components/layout/DashboardLayout.tsx")"
cat > "$SRC/components/layout/DashboardLayout.tsx" << 'KAHADE_EOF'
/*
 * KAHADE DASHBOARD LAYOUT - Professional Responsive Design
 * 
 * Design Philosophy:
 * - Mobile: Full-screen content with bottom navigation on main pages only
 * - Mobile: Arrow back header for non-main pages
 * - Tablet: Collapsible sidebar with optimized content area
 * - Desktop: Full sidebar with spacious content layout
 * - Consistent spacing, typography, and visual hierarchy
 * - Smooth transitions between breakpoints
 * - Auto scroll to top on page navigation
 */

import { ReactNode, useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  House, Receipt, Wallet, Bell, User, Gear,
  SignOut, CaretRight, Plus, MagnifyingGlass,
  Bank, IdentificationCard, Users, Scales, ClockCounterClockwise,
  CaretDown, ArrowLeft
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/ui-utils';
import BottomNavigation from './BottomNavigation';
import { LanguageSwitcherCompact } from '@/components/LanguageSwitcher';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

// Main navigation items for desktop/tablet sidebar
const mainNavItems = [
  { href: '/', icon: House, label: 'Beranda' },
  { href: '/transactions', icon: Receipt, label: 'Pesanan' },
  { href: '/wallet', icon: Wallet, label: 'Dompet' },
  { href: '/bank-accounts', icon: Bank, label: 'Rekening Bank' },
];

// Secondary navigation items for desktop/tablet sidebar
const secondaryNavItems = [
  { href: '/disputes', icon: Scales, label: 'Sengketa' },
  { href: '/referrals', icon: Users, label: 'Referral' },
  { href: '/kyc', icon: IdentificationCard, label: 'Verifikasi KYC' },
  { href: '/activity', icon: ClockCounterClockwise, label: 'Log Aktivitas' },
];

// Bottom navigation items for desktop/tablet sidebar
const bottomNavItems = [
  { href: '/notifications', icon: Bell, label: 'Notifikasi' },
  { href: '/profile', icon: User, label: 'Profil' },
  { href: '/settings', icon: Gear, label: 'Pengaturan' },
];

// Pages where bottom navigation should be shown (main pages)
const MAIN_PAGES = ['/', '/transactions', '/wallet', '/profile'];

export default function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Check if current page is a main page (should show bottom nav)
  const isMainPage = MAIN_PAGES.some(page => {
    if (page === '/') {
      return location === '/';
    }
    return location === page;
  });

  // Scroll to top when location changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, [location]);

  const handleLogout = async () => {
    await logout();
    setLocation('/');
  };

  const handleGoBack = () => {
    // Use browser history to go back
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback to home if no history
      setLocation('/');
    }
  };

  // Navigation item component
  const NavItem = ({ item, collapsed = false }: { 
    item: typeof mainNavItems[0]; 
    collapsed?: boolean;
  }) => {
    const isActive = item.href === '/' 
      ? location === '/' 
      : location.startsWith(item.href);
    
    return (
      <Link href={item.href}>
        <motion.div
          whileTap={{ scale: 0.98 }}
          className={cn(
            'flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200',
            isActive
              ? 'bg-black text-white shadow-lg shadow-black/20'
              : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
            collapsed && 'justify-center px-3'
          )}
          title={collapsed ? item.label : undefined}
        >
          /* FIX (v3.2): item.icon as JSX invalid — harus destructure ke PascalCase */ <item.icon 
            className={cn("w-5 h-5 shrink-0", isActive && "text-white")} 
            weight={isActive ? 'fill' : 'regular'} 
          />
          {!collapsed && (
            <span className="font-medium text-[15px]">{item.label}</span>
          )}
        </motion.div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex bg-card">
      {/* ========== DESKTOP SIDEBAR ========== */}
      <aside 
        className={cn(
          "hidden lg:flex flex-col border-r border-border bg-card transition-all duration-300 ease-out",
          isSidebarCollapsed ? "w-[72px]" : "w-[280px]"
        )}
      >
        {/* Logo Section */}
        <div className={cn(
          "h-16 flex items-center justify-between border-b border-border",
          isSidebarCollapsed ? "px-3" : "px-5"
        )}>
          <Link href="/" className="block flex items-center gap-3">
            {isSidebarCollapsed ? (
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
            ) : (
              <img 
                src="/images/logo.svg" 
                alt="Kahade" 
                className="h-8 w-auto"
              />
            )}
          </Link>
          {!isSidebarCollapsed && (
            <button
              onClick={() => setIsSidebarCollapsed(true)}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              aria-label="Sembunyikan sidebar"
            >
              <CaretRight className="w-4 h-4 rotate-180 text-neutral-500" aria-hidden="true" weight="bold" />
            </button>
          )}
        </div>
        
        {/* Quick Action Button */}
        <div className={cn("p-4", isSidebarCollapsed && "px-3")}>
          <Link href="/transactions/new" className="block block">
            <Button className={cn(
              "w-full h-12 bg-black hover:bg-black/90 text-white rounded-xl font-semibold shadow-lg shadow-black/20 transition-all",
              isSidebarCollapsed ? "px-0 justify-center" : "justify-center gap-2"
            )}>
              <Plus className="w-5 h-5" aria-hidden="true" weight="bold" />
              {!isSidebarCollapsed && <span>Order Baru</span>}
            </Button>
          </Link>
        </div>
        
        {/* Main Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {/* Main Items */}
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <NavItem key={item.href} item={item} collapsed={isSidebarCollapsed} />
            ))}
          </div>
          
          {/* Divider */}
          <div className={cn("my-4 h-px bg-neutral-200", isSidebarCollapsed ? "mx-1" : "mx-2")} />
          
          {/* Secondary Items */}
          <div className="space-y-1">
            {secondaryNavItems.map((item) => (
              <NavItem key={item.href} item={item} collapsed={isSidebarCollapsed} />
            ))}
          </div>
          
          {/* Divider */}
          <div className={cn("my-4 h-px bg-neutral-200", isSidebarCollapsed ? "mx-1" : "mx-2")} />
          
          {/* Bottom Items */}
          <div className="space-y-1">
            {bottomNavItems.map((item) => (
              <NavItem key={item.href} item={item} collapsed={isSidebarCollapsed} />
            ))}
          </div>
        </nav>
        
        {/* Expand Button (when collapsed) */}
        {isSidebarCollapsed && (
          <div className="p-3 border-t border-border">
            <button
              onClick={() => setIsSidebarCollapsed(false)}
              className="w-full p-2 hover:bg-neutral-100 rounded-xl transition-colors flex items-center justify-center"
              aria-label="Tampilkan sidebar"
            >
              <CaretRight className="w-5 h-5 text-neutral-500" aria-hidden="true" weight="bold" />
            </button>
          </div>
        )}
        
        {/* User Section (when expanded) */}
        {!isSidebarCollapsed && (
          <div className="p-4 border-t border-border">
            {/* User Card */}
            <div className="flex items-center gap-4 p-2 rounded-xl bg-neutral-50 mb-3">
              <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white font-bold">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-black truncate">{user?.username || 'User'}</div>
                <div className="text-xs text-neutral-600 truncate">{user?.email}</div>
              </div>
            </div>
            
            {/* Language Switcher */}
            <div className="flex items-center justify-between px-4 py-2 mb-2">
              <span className="text-sm text-neutral-600">Bahasa</span>
              <LanguageSwitcherCompact />
            </div>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-neutral-600 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <SignOut className="w-5 h-5" aria-hidden="true" weight="bold" />
              <span className="font-medium">Keluar</span>
            </button>
          </div>
        )}
      </aside>
      
      {/* ========== TABLET SIDEBAR (md breakpoint) ========== */}
      <aside className="hidden md:flex lg:hidden flex-col w-[72px] border-r border-border bg-card">
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-border">
          <Link href="/" className="block block">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">K</span>
            </div>
          </Link>
        </div>
        
        {/* Quick Action */}
        <div className="p-3">
          <Link href="/transactions/new" className="block block">
            <Button className="w-full h-12 bg-black hover:bg-black/90 text-white rounded-xl px-0 justify-center shadow-lg shadow-black/20">
              <Plus className="w-5 h-5" aria-hidden="true" weight="bold" />
            </Button>
          </Link>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto">
          {[...mainNavItems, ...secondaryNavItems].map((item) => {
            const isActive = item.href === '/' 
              ? location === '/' 
              : location.startsWith(item.href);
            
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'flex items-center justify-center p-2 rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-black text-white shadow-lg shadow-black/20'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  )}
                  title={item.label}
                >
                  /* FIX (v3.2): item.icon as JSX invalid — harus destructure ke PascalCase */ <item.icon className="w-5 h-5" weight={isActive ? 'fill' : 'regular'} />
                </motion.div>
              </Link>
            );
          })}
        </nav>
        
        {/* Bottom Items */}
        <div className="p-2 border-t border-border space-y-1">
          {bottomNavItems.map((item) => {
            const isActive = location.startsWith(item.href);
            
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    'flex items-center justify-center p-2 rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-black text-white'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  )}
                  title={item.label}
                >
                  /* FIX (v3.2): item.icon as JSX invalid — harus destructure ke PascalCase */ <item.icon className="w-5 h-5" weight={isActive ? 'fill' : 'regular'} />
                </div>
              </Link>
            );
          })}
          
          {/* User Avatar */}
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="w-full flex items-center justify-center p-2 rounded-xl hover:bg-neutral-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white font-bold text-sm">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
          </button>
        </div>
      </aside>
      
      {/* ========== MAIN CONTENT ========== */}
      <main ref={mainContentRef} className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Mobile Header - Only show on non-main pages with back button */}
        {!isMainPage && (
          <header className="sticky top-0 z-30 h-14 border-b border-border bg-background/95 backdrop-blur-xl md:hidden">
            <div className="flex items-center h-full px-4">
              {/* Back Button */}
              <button
                onClick={handleGoBack}
                className="flex items-center justify-center w-10 h-10 -ml-2 rounded-xl hover:bg-neutral-100 transition-colors"
                aria-label="Kembali"
              >
                <ArrowLeft className="w-6 h-6 text-black" aria-hidden="true" weight="bold" />
              </button>
              
              {/* Page Title */}
              <div className="flex-1 ml-2">
                {title && <h1 className="text-lg font-bold text-black truncate">{title}</h1>}
              </div>
            </div>
          </header>
        )}

        {/* Top Header Bar - Desktop/Tablet only */}
        <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/95 backdrop-blur-xl hidden md:block">
          <div className="flex items-center justify-between h-full px-4 md:px-6 lg:px-8">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              {/* Page Title */}
              <div>
                {title && <h1 className="text-xl font-bold text-black">{title}</h1>}
                {subtitle && <p className="text-sm text-neutral-600">{subtitle}</p>}
              </div>
            </div>
            
            {/* Right Section */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Search - Desktop/Tablet */}
              <div className="hidden md:flex relative">
                <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" aria-hidden="true" />
                <Input
                  type="search"
                  placeholder="Cari..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 w-48 lg:w-[240px] h-10 bg-neutral-100 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:bg-card transition-all"
                />
              </div>
              
              {/* Notifications */}
              <Link href="/notifications" className="block block">
                <button className="relative p-2.5 hover:bg-neutral-100 rounded-xl transition-colors">
                  <Bell className="w-5 h-5 text-neutral-600" aria-hidden="true" weight="bold" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-black rounded-full ring-2 ring-white" />
                </button>
              </Link>
              
              {/* Profile Dropdown - Desktop */}
              <div className="relative hidden md:block">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 hover:bg-neutral-100 rounded-xl transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center text-white font-bold text-sm">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <CaretDown className={cn(
                    "w-4 h-4 text-neutral-600 transition-transform hidden lg:block",
                    isProfileDropdownOpen && "rotate-180"
                  )} weight="bold" />
                </button>
                
                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-[240px] bg-card rounded-2xl border border-border shadow-2xl shadow-black/10 z-50 overflow-hidden"
                      >
                        {/* User Info */}
                        <div className="p-4 border-b border-border">
                          <div className="font-semibold text-black">{user?.username || 'User'}</div>
                          <div className="text-sm text-neutral-600">{user?.email}</div>
                        </div>
                        
                        {/* Menu Items */}
                        <div className="p-2">
                          <Link
                            href="/profile"
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center gap-4 px-3 py-2.5 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                          >
                            <User className="w-5 h-5" aria-hidden="true" weight="bold" />
                            <span className="font-medium">Profil</span>
                          </Link>
                          <Link
                            href="/settings"
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center gap-4 px-3 py-2.5 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                          >
                            <Gear className="w-5 h-5" aria-hidden="true" weight="bold" />
                            <span className="font-medium">Pengaturan</span>
                          </Link>
                        </div>
                        
                        {/* Logout */}
                        <div className="p-2 border-t border-border">
                          <button
                            onClick={() => {
                              setIsProfileDropdownOpen(false);
                              handleLogout();
                            }}
                            className="w-full flex items-center gap-4 px-3 py-2.5 rounded-xl text-neutral-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <SignOut className="w-5 h-5" aria-hidden="true" weight="bold" />
                            <span className="font-medium">Keluar</span>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <div className={cn(
          "flex-1 p-4 md:p-6 lg:p-8",
          isMainPage ? "pb-24 md:pb-8" : "pb-8"
        )}>
          {children}
        </div>
      </main>
      
      {/* Mobile Bottom Navigation - Only on main pages */}
      <BottomNavigation />
    </div>
  );
}
KAHADE_EOF
ok "LAYOUT — DashboardLayout"

# LAYOUT — AdminLayout
mkdir -p "$(dirname "$SRC/components/layout/AdminLayout.tsx")"
cat > "$SRC/components/layout/AdminLayout.tsx" << 'KAHADE_EOF'
/*
 * KAHADE ADMIN LAYOUT
 * 
 * Features:
 * - Admin sidebar with nested menus
 * - Top bar with global search, notifications, admin profile menu
 * - Enterprise feel while staying minimalist
 * - Phosphor Icons only
 */

import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  House, Users, ArrowsLeftRight, Warning, FileText, Gear,
  SignOut, List, X, CaretRight, CaretDown, MagnifyingGlass,
  Bell, ChartBar, ShieldCheck, Database, ClockCounterClockwise,
  UserCircleGear, Sliders, Key, Globe, IdentificationCard,
  ArrowDown, Tag, Wallet
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/ui-utils';

// Navigation item interface
interface NavItemType {
  href: string;
  icon: React.ElementType;
  label: string;
  children?: NavItemType[];
}

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

// Nested navigation structure
const navSections = [
  {
    title: 'Ikhtisar',
    items: [
      { href: '/', icon: House, label: 'Dashboard' },
    ]
  },
  {
    title: 'Manajemen',
    items: [
      { href: '/users', icon: Users, label: 'Pengguna' },
      { href: '/kyc', icon: IdentificationCard, label: 'Verifikasi KYC' },
      { href: '/transactions', icon: ArrowsLeftRight, label: 'Transaksi' },
      { href: '/disputes', icon: Warning, label: 'Sengketa' },
      { href: '/withdrawals', icon: ArrowDown, label: 'Penarikan' },
      { href: '/deposits', icon: Wallet, label: 'Setoran' },
    ]
  },
  {
    title: 'Analitik',
    items: [
      { href: '/reports', icon: ChartBar, label: 'Laporan' },
    ]
  },
  {
    title: 'Pemasaran',
    items: [
      { href: '/promos', icon: Tag, label: 'Promosi' },
    ]
  },
  {
    title: 'Sistem',
    items: [
      { href: '/audit-logs', icon: ClockCounterClockwise, label: 'Log Audit' },
      { href: '/settings', icon: Gear, label: 'Pengaturan' },
    ]
  },
];

export default function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setLocation('/');
  };

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev => 
      prev.includes(label) 
        ? prev.filter(l => l !== label)
        : [...prev, label]
    );
  };

  const isMenuExpanded = (label: string) => expandedMenus.includes(label);

  const isActive = (href: string) => {
    if (href === '/') return location === '/';
    return location.startsWith(href);
  };

  const renderNavItem = (item: NavItemType, isMobile = false) => {
    if (item.children) {
      const isExpanded = isMenuExpanded(item.label);
      const hasActiveChild = item.children.some((child: NavItemType) => isActive(child.href));
      
      return (
        <div key={item.label}>
          <button
            onClick={() => toggleMenu(item.label)}
            className={cn(
              'flex items-center gap-4 w-full px-4 py-3 rounded-lg transition-all',
              hasActiveChild
                ? 'bg-accent/10 text-accent'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            )}
          >
            <item.icon className="w-5 h-5" weight={hasActiveChild ? 'fill' : 'regular'} />
            <span className="font-medium flex-1 text-left">{item.label}</span>
            <CaretDown className={cn(
              "w-4 h-4 transition-transform",
              isExpanded && "rotate-180"
            )} />
          </button>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pl-12 py-1 space-y-1">
                  {item.children.map((child: NavItemType) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={isMobile ? () => setIsSidebarOpen(false) : undefined}
                      className={cn(
                        'block px-4 py-2 rounded-lg text-sm transition-colors',
                        isActive(child.href)
                          ? 'bg-accent/10 text-accent font-medium'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      )}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={isMobile ? () => setIsSidebarOpen(false) : undefined}
        className={cn(
          'flex items-center gap-4 px-4 py-3 rounded-lg transition-all',
          isActive(item.href)
            ? 'bg-accent/10 text-accent'
            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
        )}
      >
        <item.icon className="w-5 h-5" weight={isActive(item.href) ? 'fill' : 'regular'} />
        <span className="font-medium">{item.label}</span>
        {isActive(item.href) && <CaretRight className="w-4 h-4 ml-auto" aria-hidden="true" />}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex bg-neutral-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-border bg-card">
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <Link href="/" className="block flex items-center gap-3">
            <img src="/images/logo.svg" alt="Kahade" className="h-8 w-auto" />
            <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-600 rounded-md">
              ADMIN
            </span>
          </Link>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.title}>
              <div className="px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {section.title}
              </div>
              <div className="space-y-1">
                {section.items.map((item) => renderNavItem(item))}
              </div>
            </div>
          ))}
        </nav>
        
        {/* User Info & Actions */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-semibold">
              A
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">Admin</div>
              <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <a href={import.meta.env.VITE_APP_URL || 'https://app.kahade.id'} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <Globe className="w-4 h-4 mr-2" aria-hidden="true" />
                User View
              </Button>
            </a>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={handleLogout}
            >
              <SignOut className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </aside>
      
      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-card border-r border-border z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-4 flex items-center justify-between border-b border-border sticky top-0 bg-card">
                <Link href="/" className="block flex items-center gap-2">
                  <img src="/images/logo.svg" alt="Kahade" className="h-8 w-auto" />
                  <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-600 rounded-md">
                    ADMIN
                  </span>
                </Link>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 hover:bg-secondary rounded-lg"
                >
                  <X className="w-5 h-5" weight="bold" aria-hidden="true" />
                </button>
              </div>
              
              <nav className="p-4 space-y-6">
                {navSections.map((section) => (
                  <div key={section.title}>
                    <div className="px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {section.title}
                    </div>
                    <div className="space-y-1">
                      {section.items.map((item) => renderNavItem(item, true))}
                    </div>
                  </div>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 border-b border-border bg-card">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button 
                className="lg:hidden p-2 hover:bg-secondary rounded-lg"
                onClick={() => setIsSidebarOpen(true)}
              >
                <List className="w-6 h-6" aria-hidden="true" weight="bold" />
              </button>
              <div>
                {title && <h1 className="text-xl font-bold">{title}</h1>}
                {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Global Search */}
              <div className="hidden md:flex relative">
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  type="search"
                  placeholder="Cari pengguna, transaksi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-80 bg-secondary border-0"
                />
              </div>
              
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" aria-hidden="true" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </Button>
              
              {/* Admin Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-sm font-semibold">
                    A
                  </div>
                  <span className="hidden sm:block text-sm font-medium">Admin</span>
                  <CaretDown className={cn(
                    "w-4 h-4 transition-transform hidden sm:block",
                    isProfileDropdownOpen && "rotate-180"
                  )} />
                </button>
                
                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-card rounded-lg border border-border shadow-lg py-2 z-50"
                    >
                      <div className="px-4 py-2 border-b border-border">
                        <div className="font-medium"> Administrator</div>
                        <div className="text-sm text-muted-foreground truncate">{user?.email}</div>
                      </div>
                      <Link
                        href="/settings/general"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-4 px-4 py-2.5 text-sm hover:bg-secondary transition-colors"
                      >
                        <Gear className="w-4 h-4" aria-hidden="true" />
                        System Settings
                      </Link>
                      <Link
                        href="/audit-logs"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-4 px-4 py-2.5 text-sm hover:bg-secondary transition-colors"
                      >
                        <ClockCounterClockwise className="w-4 h-4" aria-hidden="true" />
                        Audit Logs
                      </Link>
                      <div className="border-t border-border mt-2 pt-2">
                        <Link
                          href="/app"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-4 px-4 py-2.5 text-sm hover:bg-secondary transition-colors"
                        >
                          <Globe className="w-4 h-4" aria-hidden="true" />
                          Switch to User View
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-4 px-4 py-2.5 text-sm text-destructive hover:bg-secondary transition-colors w-full"
                        >
                          <SignOut className="w-4 h-4" aria-hidden="true" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
KAHADE_EOF
ok "LAYOUT — AdminLayout"

step "UI"
# UI — button
mkdir -p "$(dirname "$SRC/components/ui/button.tsx")"
cat > "$SRC/components/ui/button.tsx" << 'KAHADE_EOF'
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/ui-utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold",
    "transition-all duration-200 select-none cursor-pointer",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-[1.125rem] [&_svg]:shrink-0",
    "active:scale-[0.99]",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm rounded-xl hover:bg-primary/90 hover:-translate-y-[2px] hover:shadow-md focus-visible:ring-primary",
        destructive: "bg-destructive text-white shadow-sm rounded-xl hover:bg-destructive/90 hover:-translate-y-[2px] focus-visible:ring-destructive",
        outline: "border-2 border-border bg-transparent text-foreground rounded-xl hover:border-foreground hover:bg-foreground hover:text-background hover:-translate-y-[2px] focus-visible:ring-foreground",
        secondary: "border border-border bg-background text-foreground rounded-xl hover:border-foreground/50 hover:bg-muted focus-visible:ring-foreground",
        ghost: "bg-transparent text-muted-foreground rounded-xl hover:text-foreground hover:bg-muted focus-visible:ring-foreground",
        link: "text-primary underline-offset-4 hover:underline focus-visible:ring-primary",
      },
      size: {
        xs: "h-7 px-3 py-1 text-xs rounded-lg gap-1",
        sm: "h-9 px-4 py-2 text-sm rounded-xl",
        default: "h-11 px-6 py-3 text-[0.9375rem]",
        lg: "h-12 px-8 py-3 text-base rounded-xl",
        xl: "h-14 px-10 py-4 text-lg rounded-2xl",
        icon: "size-10 rounded-xl p-0",
        "icon-sm": "size-8 rounded-lg p-0",
        "icon-lg": "size-12 rounded-xl p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

function Button({
  className, variant, size, asChild = false, ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
KAHADE_EOF
ok "UI — button"

# UI — badge
mkdir -p "$(dirname "$SRC/components/ui/badge.tsx")"
cat > "$SRC/components/ui/badge.tsx" << 'KAHADE_EOF'
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/ui-utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[0.6875rem] font-bold tracking-wide uppercase border",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground border-primary",
        secondary: "bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700",
        success: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
        warning: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
        error: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
        info: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
        outline: "border-2 border-foreground text-foreground bg-transparent",
      },
    },
    defaultVariants: { variant: "secondary" },
  }
);

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  icon?: React.ElementType;
  label?: string;
}

function Badge({ className, variant, icon: Icon, label, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {Icon && <Icon size={10} weight="fill" />}
      {label ?? children}
    </span>
  );
}

export { Badge, badgeVariants };
KAHADE_EOF
ok "UI — badge"

# UI — card
mkdir -p "$(dirname "$SRC/components/ui/card.tsx")"
cat > "$SRC/components/ui/card.tsx" << 'KAHADE_EOF'
import * as React from "react";
import { cn } from "@/lib/ui-utils";

function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card",
        "shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_16px_rgba(0,0,0,0.04)]",
        "transition-all duration-200",
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;
}

function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-bold leading-none tracking-tight", className)} {...props} />;
}

function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center p-6 pt-0", className)} {...props} />;
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
KAHADE_EOF
ok "UI — card"

# UI — input
mkdir -p "$(dirname "$SRC/components/ui/input.tsx")"
cat > "$SRC/components/ui/input.tsx" << 'KAHADE_EOF'
import * as React from "react";
import { cn } from "@/lib/ui-utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-12 w-full rounded-xl border-2 border-border bg-background px-4",
        "text-[0.9375rem] text-foreground placeholder:text-muted-foreground",
        "transition-all duration-150",
        "focus:outline-none focus:border-foreground focus:ring-0",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className
      )}
      {...props}
    />
  );
}

export { Input };
KAHADE_EOF
ok "UI — input"

# UI — textarea
mkdir -p "$(dirname "$SRC/components/ui/textarea.tsx")"
cat > "$SRC/components/ui/textarea.tsx" << 'KAHADE_EOF'
import * as React from "react";
import { cn } from "@/lib/ui-utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex min-h-[100px] w-full rounded-xl border-2 border-border bg-background px-4 py-3",
        "text-[0.9375rem] text-foreground placeholder:text-muted-foreground",
        "transition-all duration-150 resize-y",
        "focus:outline-none focus:border-foreground focus:ring-0",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
KAHADE_EOF
ok "UI — textarea"

# UI — select
mkdir -p "$(dirname "$SRC/components/ui/select.tsx")"
cat > "$SRC/components/ui/select.tsx" << 'KAHADE_EOF'
import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { CaretDown, CaretUp, Check } from "@phosphor-icons/react";
import { cn } from "@/lib/ui-utils";

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

function SelectTrigger({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "flex h-12 w-full items-center justify-between rounded-xl border-2 border-border bg-background px-4",
        "text-[0.9375rem] text-foreground placeholder:text-muted-foreground",
        "transition-all duration-150 cursor-pointer",
        "focus:outline-none focus:border-foreground",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "[&>span]:line-clamp-1",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <CaretDown size={16} className="text-muted-foreground shrink-0" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({ className, children, position = "popper", ...props }: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className={cn(
          "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-xl border border-border bg-background shadow-[0_8px_32px_rgba(0,0,0,0.12)]",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
          position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1 w-[var(--radix-select-trigger-width)]",
          className
        )}
        position={position}
        {...props}
      >
        <SelectPrimitive.Viewport className={cn("p-1", position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]")}>
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return <SelectPrimitive.Label className={cn("px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider", className)} {...props} />;
}

function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-lg py-2.5 pl-9 pr-3 text-sm font-medium outline-none",
        "transition-colors duration-100",
        "focus:bg-muted focus:text-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <span className="absolute left-3 flex h-4 w-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check size={14} weight="bold" className="text-primary" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return <SelectPrimitive.Separator className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />;
}

export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator };
KAHADE_EOF
ok "UI — select"

# UI — checkbox
mkdir -p "$(dirname "$SRC/components/ui/checkbox.tsx")"
cat > "$SRC/components/ui/checkbox.tsx" << 'KAHADE_EOF'
import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "@phosphor-icons/react";
import { cn } from "@/lib/ui-utils";

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        "peer h-5 w-5 shrink-0 rounded-md border-2 border-border bg-background",
        "transition-all duration-150 cursor-pointer",
        "hover:border-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-primary data-[state=checked]:border-primary",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-primary-foreground">
        <Check size={12} weight="bold" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
KAHADE_EOF
ok "UI — checkbox"

# UI — switch
mkdir -p "$(dirname "$SRC/components/ui/switch.tsx")"
cat > "$SRC/components/ui/switch.tsx" << 'KAHADE_EOF'
import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/ui-utils";

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent",
        "cursor-pointer transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-primary data-[state=unchecked]:bg-neutral-300 dark:data-[state=unchecked]:bg-neutral-600",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm",
          "ring-0 transition-transform duration-200",
          "data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
KAHADE_EOF
ok "UI — switch"

# UI — dialog
mkdir -p "$(dirname "$SRC/components/ui/dialog.tsx")"
cat > "$SRC/components/ui/dialog.tsx" << 'KAHADE_EOF'
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "@phosphor-icons/react";
import { cn } from "@/lib/ui-utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

function DialogOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn("fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className)}
      {...props}
    />
  );
}

function DialogContent({ className, children, ...props }: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
          "w-full max-w-lg bg-background rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)]",
          "border border-border overflow-hidden",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
          "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
          "duration-200",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors opacity-70 hover:opacity-100 focus:outline-none">
          <X size={16} weight="bold" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1.5 px-6 py-5 border-b border-border", className)} {...props} />;
}

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/30", className)} {...props} />;
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn("text-lg font-bold leading-none", className)} {...props} />;
}

function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

function DialogBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 py-5", className)} {...props} />;
}

export { Dialog, DialogTrigger, DialogClose, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogBody };
KAHADE_EOF
ok "UI — dialog"

# UI — alert
mkdir -p "$(dirname "$SRC/components/ui/alert.tsx")"
cat > "$SRC/components/ui/alert.tsx" << 'KAHADE_EOF'
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/ui-utils";
import { Info, CheckCircle, Warning, XCircle, X } from "@phosphor-icons/react";

const alertVariants = cva("flex gap-3 p-4 rounded-xl border", {
  variants: {
    variant: {
      info: "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800",
      success: "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800",
      warning: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800",
      error: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800",
    },
  },
  defaultVariants: { variant: "info" },
});

const textCls: Record<string,string> = {
  info: "text-blue-800 dark:text-blue-300",
  success: "text-green-800 dark:text-green-300",
  warning: "text-yellow-800 dark:text-yellow-300",
  error: "text-red-800 dark:text-red-300",
};
const iconMap = { info: Info, success: CheckCircle, warning: Warning, error: XCircle };

interface AlertProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  title?: string;
  description?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ElementType;
}

function Alert({ className, variant = "info", title, description, dismissible, onDismiss, icon, children, ...props }: AlertProps) {
  const AlertIcon = icon ?? iconMap[variant ?? "info"];
  const text = textCls[variant ?? "info"];
  return (
    <div className={cn(alertVariants({ variant }), className)} {...props}>
      <AlertIcon weight="fill" size={18} className={cn("shrink-0 mt-0.5", text)} />
      <div className="flex-1">
        {title && <p className={cn("font-semibold text-sm mb-1", text)}>{title}</p>}
        {description && <p className={cn("text-sm", text)}>{description}</p>}
        {children && <div className={cn("text-sm", text)}>{children}</div>}
      </div>
      {dismissible && (
        <button onClick={onDismiss} className={cn("w-5 h-5 shrink-0 hover:opacity-80 transition-opacity", text)}>
          <X size={16} weight="bold" />
        </button>
      )}
    </div>
  );
}

function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("font-semibold text-sm mb-1", className)} {...props} />;
}

function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm", className)} {...props} />;
}

export { Alert, AlertTitle, AlertDescription };
KAHADE_EOF
ok "UI — alert"

# UI — skeleton
mkdir -p "$(dirname "$SRC/components/ui/skeleton.tsx")"
cat > "$SRC/components/ui/skeleton.tsx" << 'KAHADE_EOF'
import { cn } from "@/lib/ui-utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean;
}

function Skeleton({ className, shimmer = false, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("rounded-xl bg-muted", shimmer ? "skeleton-shimmer" : "animate-pulse", className)}
      {...props}
    />
  );
}

function SkeletonCard() {
  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  );
}

function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-border bg-muted/30"><Skeleton className="h-8 w-64" /></div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <Skeleton className="w-8 h-8 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-2/5" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function SkeletonMetrics({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-5 space-y-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonTable, SkeletonMetrics };
KAHADE_EOF
ok "UI — skeleton"

# UI — spinner
mkdir -p "$(dirname "$SRC/components/ui/spinner.tsx")"
cat > "$SRC/components/ui/spinner.tsx" << 'KAHADE_EOF'
import { cn } from "@/lib/ui-utils";

interface SpinnerProps {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = { xs: "w-3 h-3", sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" };

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <div
      className={cn(
        "rounded-full border-2 border-current border-t-transparent animate-spin",
        sizeMap[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}
KAHADE_EOF
ok "UI — spinner"

# UI — sonner
mkdir -p "$(dirname "$SRC/components/ui/sonner.tsx")"
cat > "$SRC/components/ui/sonner.tsx" << 'KAHADE_EOF'
import { Toaster as Sonner, ToasterProps } from "sonner";

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="system"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: [
            "group toast flex items-center gap-3",
            "bg-background border border-border rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)]",
            "px-4 py-3 w-80",
            "data-[type=success]:border-green-200 dark:data-[type=success]:border-green-800",
            "data-[type=error]:border-red-200 dark:data-[type=error]:border-red-800",
            "data-[type=warning]:border-yellow-200 dark:data-[type=warning]:border-yellow-800",
          ].join(" "),
          title: "font-semibold text-sm text-foreground",
          description: "text-xs text-muted-foreground mt-0.5",
          actionButton: "btn-primary text-xs px-3 py-1.5 h-auto",
          cancelButton: "btn-secondary text-xs px-3 py-1.5 h-auto",
          closeButton: "text-muted-foreground hover:text-foreground",
        },
      }}
      {...props}
    />
  );
}
KAHADE_EOF
ok "UI — sonner"

# UI — empty-state
mkdir -p "$(dirname "$SRC/components/ui/empty-state.tsx")"
cat > "$SRC/components/ui/empty-state.tsx" << 'KAHADE_EOF'
import { cn } from "@/lib/ui-utils";

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void; variant?: "primary" | "secondary" };
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-8 text-center", className)}>
      {Icon && (
        <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
          <Icon size={40} className="text-muted-foreground" weight="thin" />
        </div>
      )}
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      {description && <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-6">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className={action.variant === "secondary" ? "btn-secondary" : "btn-primary"}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
KAHADE_EOF
ok "UI — empty-state"

# UI — radio-group
mkdir -p "$(dirname "$SRC/components/ui/radio-group.tsx")"
cat > "$SRC/components/ui/radio-group.tsx" << 'KAHADE_EOF'
import * as React from "react";
import { cn } from "@/lib/ui-utils";

// FIX (v3.3): Radio Button — peer-checked:scale-100 pada GRANDCHILD peer tidak bekerja.
// Sama dengan checkbox — inner dot di dalam outer ring div tidak terjangkau.
// Solusi: Gunakan absolute-positioned siblings dengan inset-[5px] untuk inner dot.

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, id, ...props }, ref) => {
    const internalId = id || React.useId();

    return (
      <label
        htmlFor={internalId}
        className={cn(
          "flex items-center gap-3 cursor-pointer group select-none",
          props.disabled && "cursor-not-allowed opacity-60",
          className
        )}
      >
        <div className="relative flex items-center justify-center shrink-0 w-5 h-5">
          {/* Hidden input */}
          <input
            ref={ref}
            id={internalId}
            type="radio"
            className="peer sr-only"
            {...props}
          />
          {/* FIX: outer ring — sibling langsung dari <input peer> */}
          <div
            className={cn(
              "w-5 h-5 rounded-full border-2 border-border",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2",
              "peer-checked:border-primary",
              "peer-disabled:opacity-50",
              "transition-all duration-150"
            )}
          />
          {/* FIX: inner dot — absolute sibling dengan inset-[5px] (tidak grandchild) */}
          <div
            className={cn(
              "absolute rounded-full bg-primary",
              "scale-0 peer-checked:scale-100",
              "transition-transform duration-150",
              "pointer-events-none"
            )}
            style={{ inset: '5px' }}
          />
        </div>
        {label && (
          <span className="text-sm font-medium leading-none">
            {label}
          </span>
        )}
      </label>
    );
  }
);

Radio.displayName = "Radio";

// RadioGroup container
export interface RadioGroupProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'vertical' | 'horizontal';
}

function RadioGroup({ children, className, orientation = 'vertical' }: RadioGroupProps) {
  return (
    <div
      role="radiogroup"
      className={cn(
        orientation === 'vertical' ? 'flex flex-col gap-3' : 'flex flex-row flex-wrap gap-4',
        className
      )}
    >
      {children}
    </div>
  );
}

export { Radio, RadioGroup };
KAHADE_EOF
ok "UI — radio-group"

# UI — avatar
mkdir -p "$(dirname "$SRC/components/ui/avatar.tsx")"
cat > "$SRC/components/ui/avatar.tsx" << 'KAHADE_EOF'
import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/lib/utils";

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
KAHADE_EOF
ok "UI — avatar"

# UI — tabs
mkdir -p "$(dirname "$SRC/components/ui/tabs.tsx")"
cat > "$SRC/components/ui/tabs.tsx" << 'KAHADE_EOF'
import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
KAHADE_EOF
ok "UI — tabs"

# UI — progress
mkdir -p "$(dirname "$SRC/components/ui/progress.tsx")"
cat > "$SRC/components/ui/progress.tsx" << 'KAHADE_EOF'
import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="bg-primary h-full w-full flex-1 transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
KAHADE_EOF
ok "UI — progress"

# UI — tooltip
mkdir -p "$(dirname "$SRC/components/ui/tooltip.tsx")"
cat > "$SRC/components/ui/tooltip.tsx" << 'KAHADE_EOF'
import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/ui-utils";

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-foreground text-background animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="bg-foreground fill-foreground z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
KAHADE_EOF
ok "UI — tooltip"

# UI — dropdown-menu
mkdir -p "$(dirname "$SRC/components/ui/dropdown-menu.tsx")"
cat > "$SRC/components/ui/dropdown-menu.tsx" << 'KAHADE_EOF'
import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  );
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  );
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  );
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  );
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className
      )}
      {...props}
    />
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  );
}

function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
        className
      )}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
KAHADE_EOF
ok "UI — dropdown-menu"

# UI — underline-tabs
mkdir -p "$(dirname "$SRC/components/ui/underline-tabs.tsx")"
cat > "$SRC/components/ui/underline-tabs.tsx" << 'KAHADE_EOF'
/*
 * UNDERLINE TABS COMPONENT
 * 
 * Clean, minimal tab design with:
 * - Active tab: Black text with bold font and underline
 * - Inactive tab: Gray text
 * - Smooth transition animations
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/ui-utils';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface UnderlineTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function UnderlineTabs({ tabs, activeTab, onTabChange, className }: UnderlineTabsProps) {
  return (
    <div className={cn("border-b border-neutral-200", className)}>
      <div className="flex gap-6 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative pb-3 text-sm font-medium whitespace-nowrap transition-colors duration-200",
                isActive 
                  ? "text-foreground font-semibold" 
                  : "text-neutral-500 hover:text-neutral-600"
              )}
            >
              <span className="flex items-center gap-2">
                {tab.label}
                {tab.count !== undefined && (
                  <span className={cn(
                    "px-1.5 py-0.5 text-xs rounded-full",
                    isActive 
                      ? "bg-black text-white" 
                      : "bg-neutral-100 text-neutral-600"
                  )}>
                    {tab.count}
                  </span>
                )}
              </span>
              
              {/* Active Underline */}
              {isActive && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-black"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Simple version without animation for SSR compatibility
export function UnderlineTabsSimple({ tabs, activeTab, onTabChange, className }: UnderlineTabsProps) {
  return (
    <div className={cn("border-b border-neutral-200", className)}>
      <div className="flex gap-6 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative pb-3 text-sm font-medium whitespace-nowrap transition-colors duration-200",
                isActive 
                  ? "text-foreground font-semibold border-b-2 border-black" 
                  : "text-neutral-500 hover:text-neutral-600"
              )}
            >
              <span className="flex items-center gap-2">
                {tab.label}
                {tab.count !== undefined && (
                  <span className={cn(
                    "px-1.5 py-0.5 text-xs rounded-full",
                    isActive 
                      ? "bg-black text-white" 
                      : "bg-neutral-100 text-neutral-600"
                  )}>
                    {tab.count}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default UnderlineTabs;
KAHADE_EOF
ok "UI — underline-tabs"

# UI — alert-dialog
mkdir -p "$(dirname "$SRC/components/ui/alert-dialog.tsx")"
cat > "$SRC/components/ui/alert-dialog.tsx" << 'KAHADE_EOF'
import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

function AlertDialog({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

function AlertDialogTrigger({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  );
}

function AlertDialogPortal({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  );
}

function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  );
}

function AlertDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        )}
        {...props}
      />
    </AlertDialogPortal>
  );
}

function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  );
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  );
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action>) {
  return (
    <AlertDialogPrimitive.Action
      className={cn(buttonVariants(), className)}
      {...props}
    />
  );
}

function AlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return (
    <AlertDialogPrimitive.Cancel
      className={cn(buttonVariants({ variant: "outline" }), className)}
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
KAHADE_EOF
ok "UI — alert-dialog"

# UI — label
mkdir -p "$(dirname "$SRC/components/ui/label.tsx")"
cat > "$SRC/components/ui/label.tsx" << 'KAHADE_EOF'
import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "@/lib/ui-utils";

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Label };
KAHADE_EOF
ok "UI — label"

# UI — sheet
mkdir -p "$(dirname "$SRC/components/ui/sheet.tsx")"
cat > "$SRC/components/ui/sheet.tsx" << 'KAHADE_EOF'
"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left";
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          side === "right" &&
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
          side === "left" &&
            "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
          side === "top" &&
            "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b",
          side === "bottom" &&
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t",
          className
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
KAHADE_EOF
ok "UI — sheet"

# UI — accordion
mkdir -p "$(dirname "$SRC/components/ui/accordion.tsx")"
cat > "$SRC/components/ui/accordion.tsx" << 'KAHADE_EOF'
import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Accordion({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b last:border-b-0", className)}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
      {...props}
    >
      <div className={cn("pt-0 pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
KAHADE_EOF
ok "UI — accordion"

# UI — separator
mkdir -p "$(dirname "$SRC/components/ui/separator.tsx")"
cat > "$SRC/components/ui/separator.tsx" << 'KAHADE_EOF'
import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "@/lib/utils";

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className
      )}
      {...props}
    />
  );
}

export { Separator };
KAHADE_EOF
ok "UI — separator"

step "PUBLIC"
# PUBLIC — About
mkdir -p "$(dirname "$SRC/pages/About.tsx")"
cat > "$SRC/pages/About.tsx" << 'KAHADE_EOF'
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Target, Eye, Heart, Globe, Lightning, ArrowRight,
  Users, Buildings, MapPin, Envelope, LinkedinLogo, CheckCircle,
  Clock, Medal, Handshake
} from '@phosphor-icons/react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { fadeInUp, staggerContainer, staggerItem, viewport } from '@/lib/animations';

const stats = [
  { label: 'Pengguna Aktif', value: '10.000+' },
  { label: 'Dana Diamankan', value: 'Rp 50M+' },
  { label: 'Uptime', value: '99.9%' },
  { label: 'Rating', value: '4.9/5' },
];

const values = [
  { icon: ShieldCheck, title: 'Keamanan Utama', description: 'Enkripsi setara bank dan autentikasi multi-faktor melindungi setiap transaksi Anda dari ancaman digital.' },
  { icon: Eye, title: 'Transparansi Penuh', description: 'Semua biaya, proses, dan status transaksi ditampilkan secara jelas tanpa biaya tersembunyi.' },
  { icon: Handshake, title: 'Kepercayaan Bersama', description: 'Membangun ekosistem di mana pembeli dan penjual merasa aman dalam setiap interaksi.' },
  { icon: Lightning, title: 'Inovasi Tanpa Henti', description: 'Terus berkembang menghadirkan teknologi terbaru untuk pengalaman transaksi yang semakin baik.' },
];

const timeline = [
  { year: '2023', title: 'Kahade Didirikan', description: 'PT Kawal Hak Dengan Aman resmi berdiri dengan visi membangun kepercayaan digital Indonesia.' },
  { year: '2023 Q3', title: 'Peluncuran Beta', description: 'Versi beta diluncurkan dengan 500 pengguna awal. Feedback positif dari transaksi perdana.' },
  { year: '2024 Q1', title: '1.000 Pengguna', description: 'Melampaui 1.000 pengguna terdaftar dan Rp 5 Miliar dana yang diamankan.' },
  { year: '2024 Q3', title: 'Fitur Sengketa', description: 'Peluncuran sistem resolusi sengketa otomatis dengan tingkat penyelesaian 98%.' },
  { year: '2025', title: '10.000+ Pengguna', description: 'Melampaui 10.000 pengguna aktif dengan dana yang diamankan melebihi Rp 50 Miliar.' },
];

const team = [
  { name: 'Ahmad Rizki', role: 'CEO & Co-Founder', quote: 'Kepercayaan adalah fondasi dari setiap transaksi yang sukses.' },
  { name: 'Sari Dewi', role: 'CTO & Co-Founder', quote: 'Teknologi yang kuat adalah kunci membangun kepercayaan di era digital.' },
  { name: 'Budi Santoso', role: 'COO', quote: 'Operasional yang solid memastikan setiap pengguna mendapat pengalaman terbaik.' },
  { name: 'Maya Putri', role: 'Head of Product', quote: 'Produk yang baik dimulai dari memahami masalah nyata pengguna.' },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* SECTION 1: HERO — EDITORIAL */}
      <section className="bg-primary text-primary-foreground pt-24 pb-24 md:pb-32">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[0.6fr_0.4fr] gap-16 items-center">
            <motion.div variants={staggerContainer} initial="initial" animate="animate">
              <motion.div variants={staggerItem}>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 text-sm font-medium mb-8">
                  Tentang Kami
                </span>
              </motion.div>
              <motion.h1 variants={staggerItem} className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-none mb-6">
                Membangun<br />Kepercayaan<br />di Setiap<br />
                <span className="text-white/70">Transaksi.</span>
              </motion.h1>
              <motion.p variants={staggerItem} className="text-primary-foreground/60 text-sm uppercase tracking-widest">
                PT Kawal Hak Dengan Aman
              </motion.p>
            </motion.div>

            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
              <motion.div variants={staggerItem} className="grid grid-cols-1 gap-3">
                {[
                  { label: 'Tahun Berdiri', value: '2023' },
                  { label: 'Lokasi', value: 'Jakarta, Indonesia' },
                  { label: 'Status', value: 'Aktif & Berkembang' },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between py-3 border-b border-white/10">
                    <span className="text-primary-foreground/60 text-sm">{item.label}</span>
                    <span className="font-semibold text-sm">{item.value}</span>
                  </div>
                ))}
              </motion.div>
              <motion.p variants={staggerItem} className="text-primary-foreground/80 leading-relaxed">
                Kami adalah tim dengan visi membangun ekosistem transaksi online yang jujur dan aman untuk semua orang Indonesia.
              </motion.p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 2: STATS BAR */}
      <section className="border-y bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            {stats.map((stat) => (
              <div key={stat.label} className="py-8 px-6 text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: MISI & VISI — SPLIT PANEL */}
      <section>
        <div className="grid md:grid-cols-2">
          <div className="bg-muted px-8 md:px-16 py-16 md:py-24">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Misi</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Mendorong kepercayaan digital Indonesia</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Mendorong kepercayaan digital di Indonesia dengan menyediakan platform escrow yang aman, transparan, dan mudah digunakan — memungkinkan jutaan orang bertransaksi online dengan tenang.
            </p>
          </div>
          <div className="bg-primary text-primary-foreground px-8 md:px-16 py-16 md:py-24">
            <p className="text-xs uppercase tracking-widest text-primary-foreground/60 mb-4">Visi</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Platform escrow paling tepercaya di Asia Tenggara</h2>
            <p className="text-primary-foreground/80 leading-relaxed text-lg">
              Menjadi platform escrow paling tepercaya di Asia Tenggara, di mana setiap orang — dari penjual kecil hingga perusahaan besar — bisa bertransaksi dengan penuh keyakinan.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 4: VALUES */}
      <section className="section-padding-lg">
        <div className="container mx-auto px-4">
          <motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={viewport}>
            <motion.div variants={staggerItem} className="text-center mb-16">
              <span className="badge badge-secondary mb-4">Nilai Kami</span>
              <h2 className="text-3xl md:text-4xl font-bold">Yang Kami Pegang Teguh</h2>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
              {values.map((value) => {
                const Icon = value.icon;
                return (
                  <motion.div key={value.title} variants={staggerItem} className="text-center">
                    <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <Icon size={32} className="text-primary" weight="duotone" />
                    </div>
                    <h3 className="font-bold text-lg mb-3">{value.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 5: TIMELINE */}
      <section className="section-padding-lg bg-muted/40">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={viewport}>
            <motion.div variants={staggerItem} className="text-center mb-16">
              <span className="badge badge-secondary mb-4">Perjalanan Kami</span>
              <h2 className="text-3xl md:text-4xl font-bold">Dari Ide ke Kenyataan</h2>
            </motion.div>
            <div className="relative">
              <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-px" />
              <div className="space-y-8">
                {timeline.map((item, i) => (
                  <motion.div key={i} variants={staggerItem} className={`relative flex gap-6 md:gap-0 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                    <div className={`hidden md:block md:w-1/2 ${i % 2 === 0 ? 'pr-12 text-right' : 'pl-12 text-left'}`}>
                      <span className="text-xs font-bold uppercase tracking-widest text-primary">{item.year}</span>
                      <h3 className="font-bold text-lg mt-1 mb-2">{item.title}</h3>
                      <p className="text-muted-foreground text-sm">{item.description}</p>
                    </div>
                    <div className="absolute left-[14px] md:left-1/2 top-1 w-3 h-3 rounded-full bg-primary border-2 border-background md:-translate-x-1.5" />
                    <div className="pl-10 md:hidden">
                      <span className="text-xs font-bold uppercase tracking-widest text-primary">{item.year}</span>
                      <h3 className="font-bold text-lg mt-1 mb-2">{item.title}</h3>
                      <p className="text-muted-foreground text-sm">{item.description}</p>
                    </div>
                    <div className="hidden md:block md:w-1/2" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 6: TEAM */}
      <section className="section-padding-lg">
        <div className="container mx-auto px-4">
          <motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={viewport}>
            <motion.div variants={staggerItem} className="text-center mb-16">
              <span className="badge badge-secondary mb-4">Tim Kami</span>
              <h2 className="text-3xl md:text-4xl font-bold">Orang-orang di Balik Kahade</h2>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member) => (
                <motion.div key={member.name} variants={staggerItem} className="card p-6 text-center group hover:shadow-E3 transition-all duration-300">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">{member.name.charAt(0)}</span>
                  </div>
                  <div className="border-t border-border pt-4 mb-3">
                    <h3 className="font-bold">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                  <div className="border-t border-border pt-3">
                    <p className="text-sm text-muted-foreground italic">"{member.quote}"</p>
                  </div>
                  <button className="mt-4 flex items-center gap-1 text-sm text-primary mx-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    <LinkedinLogo size={16} /> LinkedIn
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 7: LEGAL INFO */}
      <section className="section-padding-md bg-muted/40">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="border border-border rounded-2xl p-8">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Informasi Hukum</p>
            <h3 className="font-bold text-lg mb-4">PT Kawal Hak Dengan Aman</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-primary" />
                <span>Gg. Abot, Cihideung Udik, Kec. Ciampea, Kabupaten Bogor, Jawa Barat 16620</span>
              </div>
              <div className="flex items-center gap-3">
                <Envelope size={16} className="shrink-0 text-primary" />
                <span>halo@kahade.id</span>
              </div>
              <div className="flex items-center gap-3">
                <Buildings size={16} className="shrink-0 text-primary" />
                <span>NPWP: —  &nbsp;|&nbsp;  NIB: —</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
KAHADE_EOF
ok "PUBLIC — About"

# PUBLIC — ApiDocs
mkdir -p "$(dirname "$SRC/pages/ApiDocs.tsx")"
cat > "$SRC/pages/ApiDocs.tsx" << 'KAHADE_EOF'
import { useState } from 'react';
import { motion } from 'framer-motion';
import { CopySimple, Check, Code, Webhook, Key, CaretRight } from '@phosphor-icons/react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const nav = [
  { section: 'Pengenalan', items: ['Ikhtisar', 'Autentikasi', 'Rate Limits'] },
  { section: 'Transaksi', items: ['Buat Transaksi', 'Ambil Transaksi', 'Update Status', 'Batalkan'] },
  { section: 'Pembayaran', items: ['Virtual Account', 'QRIS', 'Konfirmasi Manual'] },
  { section: 'Webhooks', items: ['Setup Webhook', 'Event Types', 'Verifikasi Signature'] },
  { section: 'Referensi', items: ['Status Codes', 'Error Codes', 'Sandbox'] },
];

const codeExample = `// Buat transaksi baru
const response = await fetch('https://api.kahade.id/v1/transactions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Pembelian Laptop Gaming',
    amount: 15000000,
    currency: 'IDR',
    buyer_email: 'pembeli@email.com',
    seller_email: 'penjual@email.com',
    description: 'Laptop ASUS ROG, kondisi baru, garansi resmi',
    deadline_days: 14,
  }),
});

const transaction = await response.json();
console.log(transaction.id); // "KHD-2025-001234"`;

const responseExample = `{
  "id": "KHD-2025-001234",
  "status": "pending_payment",
  "title": "Pembelian Laptop Gaming",
  "amount": 15000000,
  "currency": "IDR",
  "fee": 375000,
  "net_amount": 14625000,
  "buyer": {
    "email": "pembeli@email.com",
    "verified": true
  },
  "seller": {
    "email": "penjual@email.com",
    "verified": true
  },
  "payment": {
    "virtual_account": "7008 1234 5678 9012",
    "expired_at": "2025-01-20T17:00:00Z"
  },
  "created_at": "2025-01-15T10:30:00Z"
}`;

function CodeBlock({ code, lang = 'javascript' }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative bg-neutral-950 rounded-xl overflow-hidden border border-neutral-800">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-800">
        <span className="text-xs text-neutral-400 font-medium">{lang}</span>
        <button onClick={copy} className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors">
          {copied ? <Check size={14} className="text-green-400" /> : <CopySimple size={14} />}
          {copied ? 'Disalin!' : 'Salin'}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
        <code className="text-neutral-100">{code}</code>
      </pre>
    </div>
  );
}

export default function ApiDocs() {
  const [activeSection, setActiveSection] = useState('Buat Transaksi');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 fixed top-16 bottom-0 left-0 overflow-y-auto border-r border-border bg-muted/20 pt-8 pb-16">
          <div className="px-4">
            {nav.map(({ section, items }) => (
              <div key={section} className="mb-6">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 px-3">{section}</p>
                {items.map(item => (
                  <button
                    key={item}
                    onClick={() => setActiveSection(item)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all mb-0.5 flex items-center gap-2 ${
                      activeSection === item ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {activeSection === item && <CaretRight size={12} />}
                    {item}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </aside>

        {/* Content */}
        <main className="lg:ml-64 flex-1 min-h-screen">
          <div className="max-w-[1100px] mx-auto px-6 py-12">
            {/* Hero */}
            <div className="mb-12 pb-12 border-b">
              <div className="flex items-center gap-2 mb-4">
                <Code size={20} className="text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">API Documentation</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Kahade Developer API</h1>
              <p className="text-muted-foreground text-lg mb-6">Integrasikan sistem escrow Kahade ke dalam platform Anda dengan REST API yang sederhana dan powerful.</p>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-medium">v1.0 Stable</span>
                <span className="px-3 py-1.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm font-medium">REST API</span>
                <span className="px-3 py-1.5 bg-muted rounded-full text-sm font-medium">JSON</span>
              </div>
            </div>

            {/* Authentication */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Autentikasi</h2>
              <p className="text-muted-foreground mb-4">Semua permintaan API harus menyertakan API Key Anda dalam header <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">Authorization</code>.</p>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6 flex items-start gap-3">
                <Key size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 dark:text-amber-300">Jangan pernah menyertakan API Key di frontend atau kode publik. Gunakan hanya di server-side.</p>
              </div>
              <CodeBlock code={`Authorization: Bearer kh_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`} lang="HTTP Header" />
            </section>

            {/* Create Transaction */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg text-sm font-bold font-mono">POST</span>
                <h2 className="text-2xl font-bold">Buat Transaksi</h2>
              </div>
              <p className="text-muted-foreground mb-6">Membuat transaksi escrow baru antara pembeli dan penjual.</p>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-semibold mb-3 text-muted-foreground">REQUEST</p>
                  <CodeBlock code={codeExample} lang="JavaScript" />
                </div>
                <div>
                  <p className="text-sm font-semibold mb-3 text-muted-foreground">RESPONSE 201</p>
                  <CodeBlock code={responseExample} lang="JSON" />
                </div>
              </div>
            </section>

            {/* Webhooks */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <Webhook size={24} className="text-primary" />
                <h2 className="text-2xl font-bold">Webhooks</h2>
              </div>
              <p className="text-muted-foreground mb-6">Kahade akan mengirimkan notifikasi ke URL webhook Anda saat status transaksi berubah.</p>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { event: 'transaction.created', desc: 'Transaksi baru dibuat' },
                  { event: 'payment.received', desc: 'Pembayaran dari pembeli diterima' },
                  { event: 'transaction.completed', desc: 'Transaksi selesai, dana dicairkan' },
                  { event: 'dispute.opened', desc: 'Sengketa dibuka oleh salah satu pihak' },
                ].map(({ event, desc }) => (
                  <div key={event} className="card p-4">
                    <code className="text-sm font-mono text-primary">{event}</code>
                    <p className="text-xs text-muted-foreground mt-1">{desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Sandbox */}
            <section className="bg-muted/40 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-3">Sandbox Environment</h2>
              <p className="text-muted-foreground mb-4">Test integrasi Anda tanpa uang nyata menggunakan sandbox environment kami.</p>
              <div className="flex gap-3 flex-wrap">
                <code className="bg-background border border-border px-3 py-2 rounded-lg text-sm font-mono">https://sandbox.api.kahade.id/v1</code>
                <span className="px-3 py-1.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-lg text-sm font-medium">Prefix key: kh_test_</span>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
KAHADE_EOF
ok "PUBLIC — ApiDocs"

# PUBLIC — Blog
mkdir -p "$(dirname "$SRC/pages/Blog.tsx")"
cat > "$SRC/pages/Blog.tsx" << 'KAHADE_EOF'
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Clock } from '@phosphor-icons/react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { staggerContainer, staggerItem, fadeInUp, viewport } from '@/lib/animations';

const filters = ['Semua', 'Keamanan', 'Tips Transaksi', 'Update', 'Bisnis'];

const posts = [
  { id: 1, category: 'Keamanan', title: '7 Tips Transaksi Online yang Aman di Era Digital', excerpt: 'Bertransaksi online kini semakin mudah, tapi risiko penipuan juga meningkat. Pelajari 7 langkah konkret melindungi diri Anda.', author: 'Tim Kahade', date: '15 Jan 2025', readTime: 5 },
  { id: 2, category: 'Tips Transaksi', title: 'Panduan Lengkap Menggunakan Escrow untuk Freelancer', excerpt: 'Sebagai freelancer, escrow adalah cara terbaik memastikan pembayaran. Begini cara menggunakannya secara efektif.', author: 'Sari Dewi', date: '10 Jan 2025', readTime: 8 },
  { id: 3, category: 'Update', title: 'Kahade v2.0: Fitur Resolusi Sengketa AI Hadir!', excerpt: 'Update terbesar dalam sejarah Kahade. AI kami kini bisa membantu menyelesaikan sengketa dalam waktu kurang dari 24 jam.', author: 'Tim Product', date: '5 Jan 2025', readTime: 4 },
  { id: 4, category: 'Bisnis', title: 'Mengapa UMKM Perlu Menggunakan Escrow', excerpt: 'UMKM sering kehilangan pelanggan karena masalah kepercayaan. Escrow adalah solusi yang affordable untuk semua skala bisnis.', author: 'Ahmad Rizki', date: '28 Des 2024', readTime: 6 },
  { id: 5, category: 'Keamanan', title: 'Kenali Modus Penipuan Online yang Paling Umum', excerpt: 'Dari fake rekber hingga manipulation invoice — kenali modusnya sebelum jadi korban. Panduan lengkap dari tim keamanan kami.', author: 'Tim Keamanan', date: '20 Des 2024', readTime: 7 },
  { id: 6, category: 'Tips Transaksi', title: 'Cara Menulis Deskripsi Transaksi yang Baik', excerpt: 'Deskripsi transaksi yang jelas mencegah kesalahpahaman dan mempercepat proses. Ini template yang bisa Anda gunakan.', author: 'Maya Putri', date: '15 Des 2024', readTime: 3 },
  { id: 7, category: 'Bisnis', title: 'Integrasi Kahade API untuk Platform Marketplace', excerpt: 'Panduan teknis untuk developer yang ingin mengintegrasikan sistem escrow Kahade ke dalam platform mereka sendiri.', author: 'Tim Engineering', date: '10 Des 2024', readTime: 12 },
];

const featured = posts[0];
const regularPosts = posts.slice(1);

const categoryColor: Record<string, string> = {
  Keamanan: 'badge-error',
  'Tips Transaksi': 'badge-success',
  Update: 'badge-primary',
  Bisnis: 'badge-secondary',
};

export default function Blog() {
  const [activeFilter, setActiveFilter] = useState('Semua');

  const filtered = activeFilter === 'Semua'
    ? regularPosts
    : regularPosts.filter(p => p.category === activeFilter);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO */}
      <section className="pt-24 pb-12 border-b bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <span className="badge badge-secondary mb-4">Blog</span>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">Blog Kahade</h1>
            <p className="text-muted-foreground text-lg">Tips, update, dan insight untuk transaksi online yang aman.</p>
          </motion.div>
        </div>
      </section>

      {/* FEATURED POST */}
      <section className="section-padding-md">
        <div className="container mx-auto px-4">
          <motion.div variants={fadeInUp} initial="initial" whileInView="animate" viewport={viewport}>
            <div className="grid md:grid-cols-[0.55fr_0.45fr] gap-8 bg-muted/30 rounded-3xl overflow-hidden border border-border">
              <div className="aspect-[4/3] md:aspect-auto bg-gradient-to-br from-primary/20 to-primary/5 min-h-[280px]" />
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <span className={`badge ${categoryColor[featured.category] || 'badge-secondary'} mb-4 self-start`}>{featured.category}</span>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">{featured.title}</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">{featured.excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <span>{featured.author}</span><span>·</span>
                  <span>{featured.date}</span><span>·</span>
                  <span className="flex items-center gap-1"><Clock size={14} />{featured.readTime} menit</span>
                </div>
                <button className="btn-primary self-start">Baca Selengkapnya <ArrowRight size={16} /></button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FILTER + GRID */}
      <section className="section-padding-md">
        <div className="container mx-auto px-4">
          {/* Filter Bar */}
          <div className="flex gap-2 flex-wrap mb-10">
            {filters.map(f => (
              <button
                key={f} onClick={() => setActiveFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeFilter === f ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
              >
                {f}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filtered.map((post) => (
                <motion.article key={post.id} variants={staggerItem} className="group cursor-pointer">
                  <div className="rounded-2xl overflow-hidden mb-4 aspect-video bg-gradient-to-br from-primary/10 to-muted border border-border group-hover:border-primary transition-colors" />
                  <span className={`badge ${categoryColor[post.category] || 'badge-secondary'} mb-3`}>{post.category}</span>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">{post.excerpt}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{post.author}</span><span>·</span>
                    <span>{post.date}</span><span>·</span>
                    <span className="flex items-center gap-1"><Clock size={12} />{post.readTime} mnt</span>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              Belum ada artikel dalam kategori ini.
            </div>
          )}

          <div className="text-center mt-12">
            <button className="btn-secondary">Muat Lebih Banyak</button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
KAHADE_EOF
ok "PUBLIC — Blog"

# PUBLIC — BlogDetail
mkdir -p "$(dirname "$SRC/pages/BlogDetail.tsx")"
cat > "$SRC/pages/BlogDetail.tsx" << 'KAHADE_EOF'
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { TwitterLogo, LinkedinLogo, Link as LinkIcon, Clock, User, ArrowRight, ArrowLeft } from '@phosphor-icons/react';
import { Link } from 'wouter';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const toc = [
  { id: 'intro', label: 'Pendahuluan' },
  { id: 'masalah', label: 'Masalah Utama' },
  { id: 'solusi', label: 'Solusi Kahade' },
  { id: 'tips', label: 'Tips Praktis' },
  { id: 'kesimpulan', label: 'Kesimpulan' },
];

const relatedPosts = [
  { title: '7 Tips Transaksi Online yang Aman', category: 'Keamanan', date: '10 Jan 2025', readTime: 5 },
  { title: 'Cara Menggunakan Escrow untuk Freelancer', category: 'Tips Transaksi', date: '5 Jan 2025', readTime: 8 },
  { title: 'Kenali Modus Penipuan Online', category: 'Keamanan', date: '28 Des 2024', readTime: 7 },
];

export default function BlogDetail() {
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const articleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const el = articleRef.current;
      if (!el) return;
      const { top, height } = el.getBoundingClientRect();
      const scrolled = Math.max(0, Math.min(1, (-top) / (height - window.innerHeight)));
      setProgress(scrolled * 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-50">
        <div className="h-full bg-primary transition-all duration-75" style={{ width: `${progress}%` }} />
      </div>

      <Navbar />

      {/* HERO */}
      <section className="pt-24 pb-12 border-b">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link href="/blog">
              <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
                <ArrowLeft size={16} /> Kembali ke Blog
              </button>
            </Link>
            <span className="badge badge-error mb-4">Keamanan</span>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
              Panduan Lengkap Keamanan Transaksi Online di Indonesia
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5"><User size={14} /><span>Tim Keamanan Kahade</span></div>
              <span>·</span><span>15 Januari 2025</span>
              <span>·</span><div className="flex items-center gap-1"><Clock size={14} /><span>8 menit baca</span></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Image */}
      <div className="w-full aspect-[21/9] bg-gradient-to-r from-primary/20 to-primary/5 max-h-96" />

      {/* CONTENT LAYOUT */}
      <div ref={articleRef} className="container mx-auto px-4 max-w-[1200px] py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_140px] gap-12">
          {/* TOC Sticky */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Daftar Isi</p>
              <nav className="space-y-2">
                {toc.map((item) => (
                  <a key={item.id} href={`#${item.id}`} className="block text-sm text-muted-foreground hover:text-primary transition-colors py-1">
                    {item.label}
                  </a>
                ))}
              </nav>
              <div className="mt-6 pt-6 border-t">
                <p className="text-xs text-muted-foreground mb-2">Progress</p>
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          </aside>

          {/* Article */}
          <article className="prose prose-neutral dark:prose-invert max-w-none" style={{ fontSize: '1.0625rem', lineHeight: 1.8 }}>
            <section id="intro">
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '2em', marginBottom: '0.75em' }}>Pendahuluan</h2>
              <p style={{ marginBottom: '1.5em' }}>Transaksi online di Indonesia terus berkembang pesat. Namun seiring dengan pertumbuhan ini, ancaman penipuan juga semakin canggih. Dalam panduan ini, kami akan membahas cara-cara konkret untuk melindungi diri Anda dalam bertransaksi online.</p>
            </section>
            <section id="masalah">
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '2em', marginBottom: '0.75em' }}>Masalah Utama</h2>
              <p style={{ marginBottom: '1.5em' }}>Salah satu masalah terbesar dalam transaksi online adalah ketiadaan jaminan bagi kedua pihak. Pembeli takut barang tidak dikirim, penjual takut pembayaran tidak masuk. Kondisi ini menciptakan hambatan kepercayaan yang merugikan semua pihak.</p>
              <blockquote style={{ borderLeft: '4px solid var(--color-primary)', paddingLeft: '1.5rem', fontStyle: 'italic', color: 'var(--color-muted-foreground)', margin: '2em 0' }}>
                "Lebih dari 60% pembeli online Indonesia pernah mengalami atau menghindari transaksi karena khawatir dengan keamanannya." — Survei Internal Kahade 2024
              </blockquote>
            </section>
            <section id="solusi">
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '2em', marginBottom: '0.75em' }}>Solusi Kahade</h2>
              <p style={{ marginBottom: '1.5em' }}>Escrow adalah jawaban untuk masalah ini. Dengan escrow, dana pembeli ditahan oleh pihak ketiga yang terpercaya — dalam hal ini Kahade — hingga semua syarat transaksi terpenuhi.</p>
              <pre style={{ backgroundColor: '#0a0a0a', color: '#f5f5f5', padding: '1.5rem', borderRadius: '0.75rem', overflow: 'auto', fontSize: '0.875rem', border: '1px solid #262626', marginBottom: '1.5em' }}>
                <code>{`// Contoh flow transaksi Kahade
Pembeli deposit → Dana ditahan Kahade
Penjual kirim barang → Bukti upload
Pembeli konfirmasi → Dana dicairkan ✓`}</code>
              </pre>
            </section>
            <section id="tips">
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '2em', marginBottom: '0.75em' }}>Tips Praktis</h2>
              <p style={{ marginBottom: '1em' }}>Beberapa langkah yang bisa Anda lakukan segera:</p>
              <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', marginBottom: '1.5em' }}>
                <li style={{ marginBottom: '0.5em' }}>Selalu gunakan platform escrow untuk transaksi di atas Rp 500.000</li>
                <li style={{ marginBottom: '0.5em' }}>Verifikasi identitas penjual sebelum melakukan pembayaran</li>
                <li style={{ marginBottom: '0.5em' }}>Simpan semua bukti komunikasi dan pembayaran</li>
                <li style={{ marginBottom: '0.5em' }}>Aktifkan notifikasi email/SMS untuk setiap transaksi</li>
              </ul>
            </section>
            <section id="kesimpulan">
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '2em', marginBottom: '0.75em' }}>Kesimpulan</h2>
              <p style={{ marginBottom: '1.5em' }}>Keamanan transaksi online adalah tanggung jawab bersama. Dengan menggunakan alat yang tepat seperti escrow, Anda bisa bertransaksi dengan tenang. Kahade hadir untuk memastikan setiap transaksi Anda terlindungi dari awal hingga selesai.</p>
            </section>
          </article>

          {/* Share Panel */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Bagikan</p>
              <div className="space-y-2">
                {[
                  { icon: TwitterLogo, label: 'Twitter' },
                  { icon: LinkedinLogo, label: 'LinkedIn' },
                ].map(({ icon: Icon, label }) => (
                  <button key={label} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:border-primary hover:text-primary transition-all text-sm">
                    <Icon size={16} /> {label}
                  </button>
                ))}
                <button onClick={copyLink} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:border-primary hover:text-primary transition-all text-sm">
                  <LinkIcon size={16} /> {copied ? 'Disalin!' : 'Copy Link'}
                </button>
              </div>
              <div className="mt-6 pt-6 border-t">
                <p className="text-xs text-muted-foreground">Estimasi</p>
                <p className="text-sm font-semibold mt-1">8 mnt baca</p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Author Bio */}
      <section className="border-t py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="flex items-center gap-4 p-6 bg-muted/30 rounded-2xl">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-primary font-bold text-xl">T</span>
            </div>
            <div>
              <p className="font-bold">Tim Keamanan Kahade</p>
              <p className="text-sm text-muted-foreground">Tim keamanan kami terdiri dari para ahli di bidang cybersecurity dan fintech, berkomitmen menjaga keamanan setiap transaksi pengguna Kahade.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      <section className="section-padding-md bg-muted/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl font-bold mb-8">Artikel Terkait</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedPosts.map((post) => (
              <div key={post.title} className="card p-5 group cursor-pointer hover:border-primary transition-colors">
                <div className="aspect-video rounded-xl bg-gradient-to-br from-primary/10 to-muted mb-4" />
                <span className="badge badge-secondary mb-2">{post.category}</span>
                <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2 mb-2">{post.title}</h3>
                <p className="text-xs text-muted-foreground">{post.date} · {post.readTime} mnt</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding-md">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h2 className="text-2xl font-bold mb-4">Mulai transaksi aman bersama Kahade</h2>
          <p className="text-muted-foreground mb-6">Bergabung dengan 10.000+ pengguna yang sudah mempercayakan transaksinya kepada kami.</p>
          <Link href="/register">
            <button className="btn-primary">Daftar Gratis <ArrowRight size={16} /></button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
KAHADE_EOF
ok "PUBLIC — BlogDetail"

# PUBLIC — Careers
mkdir -p "$(dirname "$SRC/pages/Careers.tsx")"
cat > "$SRC/pages/Careers.tsx" << 'KAHADE_EOF'
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CurrencyDollar, HouseLine, BookOpen, FirstAid,
  Lightning, Target, ArrowRight, Briefcase, MapPin, Clock
} from '@phosphor-icons/react';
import { Link } from 'wouter';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { staggerContainer, staggerItem, fadeInUp, viewport } from '@/lib/animations';

const benefits = [
  { icon: CurrencyDollar, title: 'Gaji Kompetitif', description: 'Kompensasi di atas rata-rata industri, disesuaikan dengan pengalaman.' },
  { icon: HouseLine, title: 'Remote Fleksibel', description: 'Kerja dari mana saja. Kami percaya hasil lebih penting dari lokasi.' },
  { icon: BookOpen, title: 'Learning Budget', description: 'Rp 5 juta/tahun untuk kursus, buku, dan konferensi pilihan Anda.' },
  { icon: FirstAid, title: 'Health Insurance', description: 'BPJS Kesehatan penuh + asuransi swasta untuk Anda dan keluarga.' },
  { icon: Lightning, title: 'Fast Growth', description: 'Bergabung lebih awal berarti dampak lebih besar dan karier yang cepat.' },
  { icon: Target, title: 'Real Impact', description: 'Setiap baris kode Anda melindungi ribuan transaksi nyata setiap hari.' },
];

const filters = ['Semua', 'Engineering', 'Product', 'Marketing', 'Operations', 'Design'];

const jobs = [
  { title: 'Frontend Engineer', dept: 'Engineering', type: 'Full Time', location: 'Jakarta / Remote', badge: 'Remote' },
  { title: 'Backend Engineer (Node.js)', dept: 'Engineering', type: 'Full Time', location: 'Jakarta / Remote', badge: 'Remote' },
  { title: 'Product Manager', dept: 'Product', type: 'Full Time', location: 'Jakarta', badge: 'Onsite' },
  { title: 'UI/UX Designer', dept: 'Design', type: 'Full Time', location: 'Remote', badge: 'Remote' },
  { title: 'Growth Marketing Manager', dept: 'Marketing', type: 'Full Time', location: 'Jakarta / Remote', badge: 'Hybrid' },
  { title: 'Customer Success Lead', dept: 'Operations', type: 'Full Time', location: 'Jakarta', badge: 'Onsite' },
];

const badgeColor: Record<string, string> = {
  Remote: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Onsite: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Hybrid: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

export default function Careers() {
  const [activeFilter, setActiveFilter] = useState('Semua');

  const filtered = activeFilter === 'Semua' ? jobs : jobs.filter(j => j.dept === activeFilter);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO */}
      <section className="bg-primary text-primary-foreground pt-24 pb-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[1fr_auto] gap-16 items-center">
            <motion.div variants={staggerContainer} initial="initial" animate="animate">
              <motion.span variants={staggerItem} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 text-sm font-medium mb-8">
                Bergabung dengan Tim
              </motion.span>
              <motion.h1 variants={staggerItem} className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                Bergabung dengan tim<br />yang membangun<br />masa depan transaksi<br />
                <span className="text-white/60">digital Indonesia.</span>
              </motion.h1>
              <motion.div variants={staggerItem} className="flex flex-wrap gap-3 mt-8">
                <button className="btn-secondary bg-white text-primary hover:bg-white/90">
                  Lihat Lowongan <ArrowRight size={16} />
                </button>
                <button className="border border-white/20 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors">
                  Tentang Budaya
                </button>
              </motion.div>
            </motion.div>
            <motion.div variants={fadeInUp} initial="initial" animate="animate" className="grid grid-cols-2 gap-4 min-w-[240px]">
              {[
                { label: 'Ukuran Tim', value: '25+' },
                { label: 'Remote Friendly', value: 'Ya' },
                { label: 'Tahun Berdiri', value: '2023' },
                { label: 'Stage', value: 'Seed' },
              ].map(item => (
                <div key={item.label} className="bg-white/10 rounded-xl p-4">
                  <div className="text-xl font-bold">{item.value}</div>
                  <div className="text-xs text-white/60 mt-0.5">{item.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* BENEFITS BENTO */}
      <section className="section-padding-lg">
        <div className="container mx-auto px-4">
          <motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={viewport}>
            <motion.div variants={staggerItem} className="text-center mb-14">
              <span className="badge badge-secondary mb-4">Kenapa Kahade?</span>
              <h2 className="text-3xl md:text-4xl font-bold">Lebih dari Sekadar Pekerjaan</h2>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-6">
              {benefits.map((b) => {
                const Icon = b.icon;
                return (
                  <motion.div key={b.title} variants={staggerItem} className="card p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                      <Icon size={24} className="text-primary" weight="duotone" />
                    </div>
                    <h3 className="font-bold mb-2">{b.title}</h3>
                    <p className="text-sm text-muted-foreground">{b.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* JOB LISTINGS */}
      <section className="section-padding-lg bg-muted/40">
        <div className="container mx-auto px-4">
          <motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={viewport}>
            <motion.div variants={staggerItem} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div>
                <span className="badge badge-secondary mb-3">Lowongan Kerja</span>
                <h2 className="text-3xl md:text-4xl font-bold">Posisi Terbuka</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                      activeFilter === f
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background border border-border hover:border-primary'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </motion.div>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFilter}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                {filtered.map((job) => (
                  <div key={job.title} className="card p-5 flex items-center justify-between group hover:border-primary transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                        <Briefcase size={20} className="text-primary" weight="duotone" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-semibold">{job.title}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeColor[job.badge]}`}>{job.badge}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{job.dept} · {job.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin size={14} />{job.location}
                      </div>
                      <ArrowRight size={18} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div className="text-center py-16 text-muted-foreground">
                    Tidak ada lowongan untuk departemen ini saat ini.
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* CULTURE SECTION */}
      <section className="section-padding-lg">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <motion.div variants={fadeInUp} initial="initial" whileInView="animate" viewport={viewport}>
            <span className="badge badge-secondary mb-6">Budaya Kerja</span>
            <blockquote className="text-3xl md:text-4xl font-bold leading-relaxed mb-8">
              "Kami percaya bahwa tim yang bahagia menghasilkan produk yang luar biasa."
            </blockquote>
            <p className="text-muted-foreground text-lg">— Ahmad Rizki, CEO Kahade</p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
KAHADE_EOF
ok "PUBLIC — Careers"

# PUBLIC — Compare
mkdir -p "$(dirname "$SRC/pages/Compare.tsx")"
cat > "$SRC/pages/Compare.tsx" << 'KAHADE_EOF'
import { motion } from 'framer-motion';
import { CheckCircle, X, ArrowRight, Star } from '@phosphor-icons/react';
import { Link } from 'wouter';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { fadeInUp, staggerContainer, staggerItem, viewport } from '@/lib/animations';

const rows = [
  { feature: 'Perlindungan Escrow', kahade: true, kompetitor: true, transfer: false },
  { feature: 'Verifikasi Identitas KYC', kahade: true, kompetitor: '-', transfer: false },
  { feature: 'Resolusi Sengketa', kahade: true, kompetitor: '-', transfer: false },
  { feature: 'Biaya Platform', kahade: '2.5%', kompetitor: '3%', transfer: 'Gratis*' },
  { feature: 'Kecepatan Pencairan', kahade: '< 12 jam', kompetitor: '24-48 jam', transfer: '1-3 hari' },
  { feature: 'Support 24/7', kahade: true, kompetitor: '-', transfer: false },
  { feature: 'Akses API', kahade: true, kompetitor: false, transfer: false },
  { feature: 'Notifikasi Real-time', kahade: true, kompetitor: true, transfer: false },
  { feature: 'Mobile App', kahade: true, kompetitor: false, transfer: '-' },
  { feature: 'Audit Log', kahade: true, kompetitor: false, transfer: false },
];

const renderVal = (val: boolean | string, isKahade = false) => {
  if (typeof val === 'boolean') {
    return val
      ? <CheckCircle size={20} className="text-green-600 mx-auto" weight="fill" />
      : <X size={20} className="text-red-500/40 mx-auto" />;
  }
  return <span className={`text-sm font-medium ${isKahade ? 'text-primary font-bold' : ''}`}>{val}</span>;
};

const advantages = [
  { title: 'Tercepat', desc: 'Pencairan dalam 12 jam, bukan berhari-hari.' },
  { title: 'Teraman', desc: 'Verifikasi KYC + 2FA + enkripsi SSL 256-bit.' },
  { title: 'Terlengkap', desc: 'Escrow + sengketa + API + mobile app dalam satu platform.' },
];

export default function Compare() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO */}
      <section className="bg-primary text-primary-foreground pt-24 pb-20 text-center">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            <motion.span variants={staggerItem} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 text-sm font-medium mb-8">
              Perbandingan
            </motion.span>
            <motion.h1 variants={staggerItem} className="text-4xl md:text-6xl font-bold mb-6">Mengapa Kahade Lebih Unggul</motion.h1>
            <motion.p variants={staggerItem} className="text-primary-foreground/70 text-lg">Perbandingan jujur dengan alternatif yang ada di pasaran.</motion.p>
          </motion.div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="section-padding-lg">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div variants={fadeInUp} initial="initial" whileInView="animate" viewport={viewport}>
            <div className="border border-border rounded-2xl overflow-hidden shadow-E2">
              {/* Header */}
              <div className="grid grid-cols-4">
                <div className="p-5 bg-muted/50" />
                <div className="p-5 bg-primary/5 border-x border-primary/20 text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Star size={16} className="text-primary" weight="fill" />
                    <span className="font-bold text-primary">KAHADE</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Platform Escrow</span>
                </div>
                <div className="p-5 bg-muted/30 text-center border-r border-border">
                  <div className="font-bold text-sm mb-1">Kompetitor A</div>
                  <span className="text-xs text-muted-foreground">Rekber biasa</span>
                </div>
                <div className="p-5 text-center">
                  <div className="font-bold text-sm mb-1">Transfer Biasa</div>
                  <span className="text-xs text-muted-foreground">Bank/e-wallet</span>
                </div>
              </div>
              {/* Rows */}
              {rows.map((row, i) => (
                <div key={i} className={`grid grid-cols-4 border-t border-border ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                  <div className="p-4 text-sm text-muted-foreground">{row.feature}</div>
                  <div className="p-4 bg-primary/5 border-x border-primary/20 flex items-center justify-center">
                    {renderVal(row.kahade, true)}
                  </div>
                  <div className="p-4 flex items-center justify-center border-r border-border">
                    {renderVal(row.kompetitor)}
                  </div>
                  <div className="p-4 flex items-center justify-center">
                    {renderVal(row.transfer)}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-4">*Transfer biasa tidak memiliki perlindungan. Risiko penipuan ditanggung pengguna sendiri.</p>
          </motion.div>
        </div>
      </section>

      {/* ADVANTAGES */}
      <section className="section-padding-lg bg-muted/40">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={viewport}>
            <motion.h2 variants={staggerItem} className="text-3xl font-bold text-center mb-10">Keunggulan Kahade</motion.h2>
            <div className="grid md:grid-cols-3 gap-6">
              {advantages.map((adv) => (
                <motion.div key={adv.title} variants={staggerItem} className="card p-6 text-center">
                  <div className="text-2xl font-black text-primary mb-3">{adv.title}</div>
                  <p className="text-muted-foreground text-sm">{adv.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding-md">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">Siap beralih ke Kahade?</h2>
          <p className="text-muted-foreground mb-8">Bergabung gratis, tanpa kartu kredit. Coba sendiri perbedaannya.</p>
          <Link href="/register">
            <button className="btn-primary px-8 py-3.5 text-base">
              Daftar Gratis <ArrowRight size={18} />
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
KAHADE_EOF
ok "PUBLIC — Compare"

# PUBLIC — Contact
mkdir -p "$(dirname "$SRC/pages/Contact.tsx")"
cat > "$SRC/pages/Contact.tsx" << 'KAHADE_EOF'
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Envelope, Phone, MapPin, PaperPlaneTilt, Clock,
  LinkedinLogo, TwitterLogo, InstagramLogo, CheckCircle, ArrowRight
} from '@phosphor-icons/react';
import { Link } from 'wouter';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { fadeInUp, viewport } from '@/lib/animations';

const topics = [
  'Pertanyaan Umum',
  'Kerjasama Bisnis',
  'Teknis & API',
  'Keluhan & Sengketa',
  'Lainnya',
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', topic: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] grid md:grid-cols-[0.45fr_0.55fr]">
        {/* LEFT — Dark Info Panel */}
        <div className="bg-primary text-primary-foreground px-8 md:px-14 py-16 md:py-24 flex flex-col justify-center">
          <motion.div variants={fadeInUp} initial="initial" animate="animate" className="max-w-sm">
            <p className="text-primary-foreground/60 text-xs uppercase tracking-widest mb-8">Hubungi Kami</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Kami siap<br />membantu Anda.
            </h1>
            <p className="text-primary-foreground/70 mb-12 leading-relaxed">
              Ada pertanyaan, masukan, atau ingin bermitra? Tim Kahade siap merespons dalam 24 jam kerja.
            </p>
            <div className="space-y-5 mb-12">
              {[
                { icon: Envelope, label: 'halo@kahade.id' },
                { icon: Phone, label: '+62 811-127-812' },
                { icon: MapPin, label: 'Jakarta, Indonesia' },
                { icon: Clock, label: 'Sen–Jum, 09:00–18:00 WIB' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 text-primary-foreground/80">
                  <Icon size={18} />
                  <span className="text-sm">{label}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 pt-6 flex items-center gap-4">
              {[LinkedinLogo, TwitterLogo, InstagramLogo].map((Icon, i) => (
                <button key={i} className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* RIGHT — Contact Form */}
        <div className="bg-background px-8 md:px-14 py-16 md:py-24 flex flex-col justify-center">
          {submitted ? (
            <motion.div variants={fadeInUp} initial="initial" animate="animate" className="max-w-md text-center mx-auto">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={32} className="text-green-600" weight="fill" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Pesan Terkirim!</h2>
              <p className="text-muted-foreground mb-6">Kami akan menghubungi Anda dalam 24 jam. Cek inbox email Anda.</p>
              <button onClick={() => setSubmitted(false)} className="btn-secondary">Kirim Pesan Lain</button>
            </motion.div>
          ) : (
            <motion.div variants={fadeInUp} initial="initial" animate="animate" className="max-w-md">
              <h2 className="text-2xl font-bold mb-2">Kirim Pesan</h2>
              <p className="text-muted-foreground text-sm mb-8">Biasanya kami merespons dalam 24 jam kerja.</p>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Nama Lengkap</label>
                  <input
                    type="text" required placeholder="Ahmad Rizki"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                    value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Email</label>
                  <input
                    type="email" required placeholder="ahmad@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                    value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Topik</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm appearance-none"
                    value={form.topic} onChange={e => setForm({...form, topic: e.target.value})}
                  >
                    <option value="">Pilih topik...</option>
                    {topics.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Pesan</label>
                  <textarea
                    required rows={5} placeholder="Tulis pesan Anda di sini..."
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm resize-none"
                    value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                  />
                </div>
                <button type="submit" className="btn-primary w-full">
                  <PaperPlaneTilt size={18} />
                  Kirim Pesan
                </button>
                <div className="text-center">
                  <Link href="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1">
                    Atau cari jawaban di FAQ <ArrowRight size={14} />
                  </Link>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
KAHADE_EOF
ok "PUBLIC — Contact"

# PUBLIC — FAQ
mkdir -p "$(dirname "$SRC/pages/FAQ.tsx")"
cat > "$SRC/pages/FAQ.tsx" << 'KAHADE_EOF'
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CaretDown, MagnifyingGlass, ArrowRight } from '@phosphor-icons/react';
import { Link } from 'wouter';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { fadeInUp, viewport } from '@/lib/animations';

const faqData: Record<string, { q: string; a: string }[]> = {
  Umum: [
    { q: 'Apa itu Kahade?', a: 'Kahade adalah platform escrow digital yang mengamankan transaksi online antara pembeli dan penjual. Dana pembeli ditahan oleh Kahade hingga kedua pihak puas dengan transaksi, baru kemudian dana dicairkan ke penjual.' },
    { q: 'Siapa yang bisa menggunakan Kahade?', a: 'Siapapun yang ingin bertransaksi online dengan aman. Baik individual, UMKM, maupun perusahaan besar. Daftar gratis hanya butuh beberapa menit.' },
    { q: 'Apakah Kahade terdaftar secara resmi?', a: 'Ya. Kahade beroperasi di bawah PT Kawal Hak Dengan Aman yang terdaftar resmi di Indonesia. Kami mematuhi regulasi OJK dan Bank Indonesia.' },
  ],
  Transaksi: [
    { q: 'Bagaimana cara membuat transaksi?', a: 'Masuk ke dashboard, klik "Transaksi Baru", masukkan detail transaksi dan undang pihak lain melalui email atau link. Pihak lain akan menerima undangan dan bisa bergabung.' },
    { q: 'Berapa lama proses pencairan dana?', a: 'Setelah pembeli mengkonfirmasi penerimaan barang/jasa, dana akan dicairkan ke penjual dalam waktu kurang dari 12 jam pada hari kerja.' },
    { q: 'Apa yang terjadi jika ada sengketa?', a: 'Jika ada perselisihan, Anda bisa membuka sengketa dari halaman detail transaksi. Tim mediasi Kahade akan meninjau bukti dari kedua pihak dan memberikan keputusan dalam 3-5 hari kerja.' },
    { q: 'Bisakah transaksi dibatalkan?', a: 'Transaksi bisa dibatalkan jika belum ada pembayaran atau jika kedua pihak setuju untuk membatalkan. Dana akan dikembalikan ke pembeli dalam 1-3 hari kerja.' },
  ],
  Pembayaran: [
    { q: 'Metode pembayaran apa yang tersedia?', a: 'Kami mendukung transfer bank (semua bank di Indonesia melalui virtual account), QRIS, dan beberapa e-wallet. Metode pembayaran terus kami tambah.' },
    { q: 'Berapa biaya platform Kahade?', a: 'Biaya platform adalah 2.5% dari nilai transaksi, ditanggung oleh penjual. Tidak ada biaya tersembunyi. Gunakan kalkulator di halaman Harga untuk estimasi.' },
    { q: 'Apakah dana saya aman di Kahade?', a: 'Dana pengguna disimpan di rekening terpisah (escrow) yang tidak bercampur dengan dana operasional perusahaan. Rekening ini diaudit secara berkala.' },
  ],
  Keamanan: [
    { q: 'Bagaimana Kahade melindungi data saya?', a: 'Kami menggunakan enkripsi SSL 256-bit untuk semua data yang ditransmisikan, dan AES-256 untuk data yang disimpan. Infrastruktur kami di-audit secara berkala oleh pihak ketiga independen.' },
    { q: 'Apa itu verifikasi KYC?', a: 'KYC (Know Your Customer) adalah proses verifikasi identitas untuk memastikan keamanan semua pengguna. Caranya mudah: upload foto KTP dan selfie, proses otomatis dalam beberapa menit.' },
    { q: 'Apakah ada autentikasi dua faktor?', a: 'Ya, kami sangat menyarankan mengaktifkan 2FA melalui aplikasi authenticator (Google Authenticator, Authy). Aktifkan di Pengaturan → Keamanan.' },
  ],
  Akun: [
    { q: 'Bagaimana cara mendaftar?', a: 'Klik "Daftar Gratis" di halaman utama, masukkan email dan password, verifikasi email, lalu lengkapi profil Anda. Seluruh proses hanya 5 menit.' },
    { q: 'Lupa password, apa yang harus dilakukan?', a: 'Klik "Lupa Password" di halaman login, masukkan email Anda, dan kami akan mengirimkan link reset password. Link berlaku selama 1 jam.' },
    { q: 'Bisakah saya memiliki beberapa akun?', a: 'Satu akun per identitas (KTP). Jika Anda memiliki kebutuhan bisnis yang berbeda, hubungi tim kami untuk solusi enterprise.' },
  ],
};

const categories = Object.keys(faqData);

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState('Umum');
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  let searchTimer: ReturnType<typeof setTimeout>;
  const handleSearch = (val: string) => {
    setSearch(val);
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => setDebouncedSearch(val), 300);
  };

  const filteredItems = useMemo(() => {
    if (!debouncedSearch) return faqData[activeCategory] || [];
    const q = debouncedSearch.toLowerCase();
    return Object.values(faqData).flat().filter(
      item => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
    );
  }, [activeCategory, debouncedSearch]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO */}
      <section className="bg-muted/50 pt-24 pb-12 border-b">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <span className="badge badge-secondary mb-4">FAQ</span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Pertanyaan yang Sering Ditanyakan</h1>
            <div className="relative">
              <MagnifyingGlass size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text" value={search} onChange={e => handleSearch(e.target.value)}
                placeholder="Cari pertanyaan..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* TWO-PANEL */}
      <section className="section-padding-lg">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Mobile: Horizontal scroll pills */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-8 md:hidden no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat} onClick={() => { setActiveCategory(cat); setSearch(''); setDebouncedSearch(''); }}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-[220px_1fr] gap-12">
            {/* Desktop Sticky Sidebar */}
            <div className="hidden md:block">
              <div className="sticky top-24 space-y-1">
                {categories.map(cat => (
                  <button
                    key={cat} onClick={() => { setActiveCategory(cat); setSearch(''); setDebouncedSearch(''); }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeCategory === cat ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div>
              {debouncedSearch && (
                <p className="text-sm text-muted-foreground mb-6">
                  {filteredItems.length} hasil untuk "<strong>{debouncedSearch}</strong>"
                </p>
              )}
              {!debouncedSearch && (
                <h2 className="text-2xl font-bold mb-6">{activeCategory}</h2>
              )}
              <div className="space-y-2">
                {filteredItems.map((item, i) => (
                  <div key={i} className="border border-border rounded-xl overflow-hidden group">
                    <button
                      onClick={() => setOpenItem(openItem === `${activeCategory}-${i}` ? null : `${activeCategory}-${i}`)}
                      className="w-full text-left flex items-center justify-between gap-4 p-5 hover:text-primary transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center shrink-0 transition-colors">
                          <CaretDown
                            size={14}
                            className={`transition-transform duration-300 ${openItem === `${activeCategory}-${i}` ? 'rotate-180' : ''}`}
                          />
                        </div>
                        <span className="font-semibold text-sm md:text-base">{item.q}</span>
                      </div>
                    </button>
                    {openItem === `${activeCategory}-${i}` && (
                      <div className="px-5 pb-5 pl-14 text-muted-foreground text-sm leading-relaxed">
                        {item.a}
                      </div>
                    )}
                  </div>
                ))}
                {filteredItems.length === 0 && (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground mb-4">Tidak ada hasil untuk "{debouncedSearch}".</p>
                    <p className="text-sm text-muted-foreground">Coba kata lain atau</p>
                    <Link href="/contact" className="text-primary font-medium text-sm inline-flex items-center gap-1 mt-1">
                      hubungi kami <ArrowRight size={14} />
                    </Link>
                  </div>
                )}
              </div>

              {!debouncedSearch && (
                <div className="mt-12 bg-muted/40 rounded-2xl p-8 text-center">
                  <p className="text-muted-foreground mb-3">Tidak menemukan jawaban yang dicari?</p>
                  <Link href="/contact">
                    <button className="btn-primary">Hubungi Support <ArrowRight size={16} /></button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
KAHADE_EOF
ok "PUBLIC — FAQ"

# PUBLIC — Help
mkdir -p "$(dirname "$SRC/pages/Help.tsx")"
cat > "$SRC/pages/Help.tsx" << 'KAHADE_EOF'
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Rocket, CreditCard, ShieldCheck, Briefcase, User, Code,
  MagnifyingGlass, ArrowRight, ChatCircle, Ticket, Envelope, Eye
} from '@phosphor-icons/react';
import { Link } from 'wouter';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { staggerContainer, staggerItem, fadeInUp, viewport } from '@/lib/animations';

const categories = [
  { icon: Rocket, title: 'Memulai', count: 8, description: 'Panduan dasar untuk pengguna baru.' },
  { icon: CreditCard, title: 'Pembayaran', count: 12, description: 'Metode pembayaran, deposit, dan pencairan.' },
  { icon: ShieldCheck, title: 'Keamanan', count: 6, description: 'KYC, 2FA, dan perlindungan akun.' },
  { icon: Briefcase, title: 'Transaksi', count: 15, description: 'Cara membuat dan mengelola transaksi.' },
  { icon: User, title: 'Akun', count: 9, description: 'Profil, pengaturan, dan preferensi.' },
  { icon: Code, title: 'API & Dev', count: 20, description: 'Dokumentasi teknis untuk developer.' },
];

const popularArticles = [
  { title: 'Cara membuat transaksi pertama Anda', views: '12.4K', category: 'Memulai' },
  { title: 'Mengapa verifikasi KYC dibutuhkan?', views: '8.9K', category: 'Keamanan' },
  { title: 'Metode pembayaran yang tersedia', views: '7.2K', category: 'Pembayaran' },
  { title: 'Cara mengajukan sengketa transaksi', views: '5.6K', category: 'Transaksi' },
  { title: 'Mengaktifkan autentikasi dua faktor', views: '4.3K', category: 'Keamanan' },
];

const quickLinks = ['Cara Memulai', 'Transaksi', 'Pembayaran', 'Keamanan'];

export default function Help() {
  const [search, setSearch] = useState('');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO */}
      <section className="bg-primary text-primary-foreground pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            <motion.h1 variants={staggerItem} className="text-4xl md:text-5xl font-bold mb-6">
              Pusat Bantuan Kahade
            </motion.h1>
            <motion.p variants={staggerItem} className="text-primary-foreground/70 mb-8">
              Temukan jawaban, panduan, dan dukungan yang Anda butuhkan.
            </motion.p>
            <motion.div variants={staggerItem} className="relative mb-8">
              <MagnifyingGlass size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Cari artikel, panduan, atau FAQ..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-white/30 shadow-E3"
              />
            </motion.div>
            <motion.div variants={staggerItem} className="flex flex-wrap gap-2 justify-center">
              {quickLinks.map(ql => (
                <button key={ql} className="px-4 py-1.5 rounded-full border border-white/20 text-sm hover:bg-white/10 transition-colors">
                  {ql}
                </button>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CATEGORY GRID */}
      <section className="section-padding-lg">
        <div className="container mx-auto px-4">
          <motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={viewport}>
            <motion.div variants={staggerItem} className="text-center mb-12">
              <h2 className="text-3xl font-bold">Jelajahi Kategori</h2>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <motion.div key={cat.title} variants={staggerItem} className="card p-6 group hover:border-primary cursor-pointer transition-all hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Icon size={24} className="text-primary" weight="duotone" />
                      </div>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">{cat.count} artikel</span>
                    </div>
                    <h3 className="font-bold mb-1 group-hover:text-primary transition-colors">{cat.title}</h3>
                    <p className="text-sm text-muted-foreground">{cat.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* POPULAR ARTICLES */}
      <section className="section-padding-lg bg-muted/40">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={viewport}>
            <motion.div variants={staggerItem} className="mb-8">
              <h2 className="text-2xl font-bold">Artikel Terpopuler</h2>
            </motion.div>
            <div className="space-y-3">
              {popularArticles.map((article, i) => (
                <motion.div key={i} variants={staggerItem} className="card p-4 flex items-center justify-between group hover:border-primary cursor-pointer transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-muted-foreground/30 w-8 text-center">{i + 1}</span>
                    <div>
                      <p className="font-medium text-sm group-hover:text-primary transition-colors">{article.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{article.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Eye size={12} /> {article.views}</span>
                    <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CONTACT SUPPORT CTA */}
      <section className="section-padding-md">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <motion.div variants={fadeInUp} initial="initial" whileInView="animate" viewport={viewport}>
            <h2 className="text-2xl font-bold mb-3">Tidak menemukan jawaban?</h2>
            <p className="text-muted-foreground mb-8">Tim dukungan kami siap membantu Anda.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary">
                <ChatCircle size={18} /> Chat Live
              </button>
              <Link href="/support">
                <button className="btn-secondary">
                  <Ticket size={18} /> Kirim Tiket
                </button>
              </Link>
              <a href="mailto:halo@kahade.id">
                <button className="btn-secondary">
                  <Envelope size={18} /> Email
                </button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
KAHADE_EOF
ok "PUBLIC — Help"

# PUBLIC — HowItWorks
mkdir -p "$(dirname "$SRC/pages/HowItWorks.tsx")"
cat > "$SRC/pages/HowItWorks.tsx" << 'KAHADE_EOF'
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus, CurrencyDollar, Package, CheckCircle, Wallet,
  ShoppingCart, Laptop, House, Car, ArrowRight, Question
} from '@phosphor-icons/react';
import { Link } from 'wouter';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { staggerContainer, staggerItem, fadeInUp, viewport } from '@/lib/animations';

const steps = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Buat Transaksi',
    description: 'Pembeli atau penjual membuat transaksi di Kahade. Tentukan nilai, deskripsi barang/jasa, dan undang pihak lainnya via email atau link. Seluruh proses kurang dari 5 menit.',
    detail: 'Anda mengisi formulir sederhana: nama barang/jasa, nilai transaksi, dan syarat-syarat yang harus dipenuhi. Pihak lain akan menerima email undangan untuk bergabung.',
  },
  {
    number: '02',
    icon: CurrencyDollar,
    title: 'Pembeli Deposit',
    description: 'Pembeli melakukan deposit ke rekening escrow Kahade yang aman. Dana tidak dapat diakses oleh siapapun hingga transaksi selesai. Konfirmasi instan.',
    detail: 'Tersedia berbagai metode pembayaran: transfer bank via virtual account, QRIS, dan e-wallet. Dana langsung dikonfirmasi dan status transaksi berubah ke "Dana Diterima".',
  },
  {
    number: '03',
    icon: Package,
    title: 'Penjual Kirim',
    description: 'Setelah dana terkonfirmasi, penjual dapat mengirimkan barang atau memulai pengerjaan jasa dengan tenang. Upload bukti pengiriman ke platform.',
    detail: 'Penjual mendapat notifikasi bahwa dana sudah aman di escrow dan dapat segera mengirimkan barang. Semua bukti pengiriman dan tracking bisa diupload langsung ke platform.',
  },
  {
    number: '04',
    icon: CheckCircle,
    title: 'Pembeli Konfirmasi',
    description: 'Setelah menerima barang/jasa dengan memuaskan, pembeli mengkonfirmasi di aplikasi. Proses konfirmasi mudah dan cepat.',
    detail: 'Pembeli memeriksa barang/jasa, lalu menekan tombol "Konfirmasi Selesai". Jika ada masalah, pembeli dapat mengajukan sengketa dengan menyertakan bukti.',
  },
  {
    number: '05',
    icon: Wallet,
    title: 'Dana Dicairkan',
    description: 'Setelah konfirmasi, dana otomatis dicairkan ke rekening penjual dalam waktu kurang dari 12 jam. Transaksi selesai, semua pihak puas.',
    detail: 'Dana langsung masuk ke saldo wallet penjual di Kahade. Penjual dapat menarik dana ke rekening bank kapan saja. Biaya platform (2.5%) dipotong otomatis dari jumlah pencairan.',
  },
];

const useCases = [
  { icon: ShoppingCart, label: 'Belanja Online', description: 'Aman bertransaksi dengan penjual yang belum dikenal.' },
  { icon: Laptop, label: 'Jasa Freelance', description: 'Jaminan pembayaran untuk freelancer dan klien.' },
  { icon: House, label: 'Properti', description: 'Transaksi sewa atau jual-beli properti yang aman.' },
  { icon: Car, label: 'Otomotif', description: 'Beli-jual kendaraan dengan perlindungan penuh.' },
];

const miniFaqs = [
  { q: 'Berapa biaya menggunakan Kahade?', a: 'Biaya platform adalah 2.5% dari nilai transaksi, ditanggung oleh penjual. Tidak ada biaya tersembunyi.' },
  { q: 'Berapa lama proses pencairan dana?', a: 'Setelah konfirmasi pembeli, dana dicairkan dalam kurang dari 12 jam pada hari kerja.' },
  { q: 'Apa yang terjadi jika ada sengketa?', a: 'Anda bisa mengajukan sengketa, tim mediasi kami akan meninjau dan memberikan keputusan dalam 3-5 hari.' },
  { q: 'Apakah dana saya aman?', a: 'Dana disimpan di rekening escrow terpisah yang diaudit secara berkala. Tidak bisa diakses oleh siapapun kecuali sesuai kondisi transaksi.' },
  { q: 'Bisa digunakan untuk bisnis apa saja?', a: 'Kahade cocok untuk semua jenis transaksi online: marketplace, freelance, properti, otomotif, dan masih banyak lagi.' },
];

export default function HowItWorks() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO */}
      <section className="bg-primary text-primary-foreground pt-24 pb-20">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            <motion.span variants={staggerItem} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 text-sm font-medium mb-8">
              Cara Kerja
            </motion.span>
            <motion.h1 variants={staggerItem} className="text-4xl md:text-6xl font-bold mb-6">
              Cara Kerja Kahade<br />dalam 5 Langkah
            </motion.h1>
            <motion.p variants={staggerItem} className="text-primary-foreground/70 text-lg mb-8">
              Sistem escrow yang sederhana, transparan, dan melindungi semua pihak.
            </motion.p>
            <motion.div variants={staggerItem}>
              <Link href="/register">
                <button className="bg-white text-primary font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors inline-flex items-center gap-2">
                  Mulai Sekarang <ArrowRight size={18} />
                </button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FLOW VISUAL */}
      <section className="py-12 border-b overflow-hidden bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-0 overflow-x-auto no-scrollbar">
            {['Pembeli', 'Buat Transaksi', 'Deposit', 'Kahade Escrow', 'Konfirmasi', 'Pencairan', 'Penjual'].map((step, i, arr) => (
              <div key={step} className="flex items-center shrink-0">
                <div className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap ${
                  step === 'Kahade Escrow' ? 'bg-primary text-primary-foreground' : 'bg-background border border-border'
                }`}>{step}</div>
                {i < arr.length - 1 && <div className="w-6 h-px bg-border mx-1" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DETAILED STEPS */}
      <section className="section-padding-lg">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={viewport} className="space-y-12">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div key={i} variants={staggerItem} className={`grid md:grid-cols-2 gap-8 items-center ${i % 2 === 1 ? 'md:grid-flow-dense' : ''}`}>
                  <div className={i % 2 === 1 ? 'md:col-start-2' : ''}>
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-5xl font-black text-primary/20">{step.number}</span>
                      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                        <Icon size={24} className="text-primary" weight="duotone" />
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold mb-3">{step.title}</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">{step.description}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-4">{step.detail}</p>
                  </div>
                  <div className={`bg-gradient-to-br from-primary/10 to-muted rounded-3xl aspect-video border border-border flex items-center justify-center ${i % 2 === 1 ? 'md:col-start-1 md:row-start-1' : ''}`}>
                    <Icon size={64} className="text-primary/30" weight="thin" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* USE CASES */}
      <section className="section-padding-lg bg-muted/40">
        <div className="container mx-auto px-4">
          <motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={viewport}>
            <motion.div variants={staggerItem} className="text-center mb-12">
              <span className="badge badge-secondary mb-3">Cocok Untuk</span>
              <h2 className="text-3xl font-bold">Berbagai Kebutuhan Transaksi</h2>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {useCases.map((uc) => {
                const Icon = uc.icon;
                return (
                  <motion.div key={uc.label} variants={staggerItem} className="card p-6 text-center group hover:border-primary hover:-translate-y-1 transition-all">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon size={28} className="text-primary" weight="duotone" />
                    </div>
                    <h3 className="font-bold mb-2">{uc.label}</h3>
                    <p className="text-sm text-muted-foreground">{uc.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* MINI FAQ */}
      <section className="section-padding-lg">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={viewport}>
            <motion.div variants={staggerItem} className="text-center mb-10">
              <span className="badge badge-secondary mb-3">FAQ</span>
              <h2 className="text-3xl font-bold">Pertanyaan Umum</h2>
            </motion.div>
            <div className="space-y-2">
              {miniFaqs.map((faq, i) => (
                <motion.div key={i} variants={staggerItem} className="border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4 hover:text-primary transition-colors"
                  >
                    <span className="font-semibold text-sm">{faq.q}</span>
                    <Question size={20} className={`shrink-0 transition-transform ${openFaq === i ? 'rotate-45' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                        className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="section-padding-md bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">Siap bertransaksi dengan aman?</h2>
          <p className="text-primary-foreground/70 mb-8">Daftar gratis dan buat transaksi pertama Anda dalam 5 menit.</p>
          <Link href="/register">
            <button className="bg-white text-primary font-semibold px-8 py-3.5 rounded-xl hover:bg-white/90 transition-colors inline-flex items-center gap-2">
              Mulai Gratis <ArrowRight size={18} />
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
KAHADE_EOF
ok "PUBLIC — HowItWorks"

# PUBLIC — MobileApp
mkdir -p "$(dirname "$SRC/pages/MobileApp.tsx")"
cat > "$SRC/pages/MobileApp.tsx" << 'KAHADE_EOF'
import { motion } from 'framer-motion';
import {
  DeviceMobile, BellRinging, ShieldCheck, Lightning,
  Star, ArrowRight, GooglePlayLogo, AppStoreLogo
} from '@phosphor-icons/react';
import { Link } from 'wouter';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { staggerContainer, staggerItem, fadeInUp, viewport } from '@/lib/animations';

const appFeatures = [
  { icon: BellRinging, title: 'Notifikasi Real-time', desc: 'Dapat notifikasi instan setiap ada update transaksi.' },
  { icon: ShieldCheck, title: 'Biometrik & 2FA', desc: 'Login dengan Face ID atau fingerprint untuk keamanan ekstra.' },
  { icon: Lightning, title: 'Pembayaran QRIS', desc: 'Bayar dan konfirmasi transaksi langsung dari kamera.' },
  { icon: DeviceMobile, title: 'Offline-ready', desc: 'Cek status transaksi bahkan saat koneksi lemah.' },
];

const screens = [
  { label: 'Dashboard', bg: 'from-primary/20 to-primary/5' },
  { label: 'Buat Transaksi', bg: 'from-purple-500/20 to-purple-500/5' },
  { label: 'Status', bg: 'from-green-500/20 to-green-500/5' },
  { label: 'Wallet', bg: 'from-orange-500/20 to-orange-500/5' },
];

const reviews = [
  { name: 'Budi S.', rating: 5, text: 'Akhirnya ada rekber yang beneran aman dan cepet. Udah 20+ transaksi, ga ada masalah.' },
  { name: 'Dewi P.', rating: 5, text: 'Sebagai freelancer, ini solusi terbaik. Klien juga senang karena transparan.' },
  { name: 'Ahmad R.', rating: 4, text: 'Aplikasinya smooth, UX-nya bagus. Pencairan cepat sesuai janji.' },
];

export default function MobileApp() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO */}
      <section className="bg-primary text-primary-foreground pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={staggerContainer} initial="initial" animate="animate">
              <motion.span variants={staggerItem} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 text-sm font-medium mb-8">
                Kahade Mobile
              </motion.span>
              <motion.h1 variants={staggerItem} className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Kahade di<br />genggaman Anda
              </motion.h1>
              <motion.p variants={staggerItem} className="text-primary-foreground/70 text-lg mb-10">
                Kelola semua transaksi escrow Anda dari smartphone. Kapan saja, di mana saja, dengan keamanan penuh.
              </motion.p>
              <motion.div variants={staggerItem} className="flex flex-wrap gap-4">
                <button className="flex items-center gap-3 bg-white text-primary px-5 py-3 rounded-xl font-semibold hover:bg-white/90 transition-colors">
                  <AppStoreLogo size={24} /> App Store
                </button>
                <button className="flex items-center gap-3 bg-white text-primary px-5 py-3 rounded-xl font-semibold hover:bg-white/90 transition-colors">
                  <GooglePlayLogo size={24} /> Play Store
                </button>
              </motion.div>
              <motion.p variants={staggerItem} className="text-primary-foreground/50 text-sm mt-4">
                iOS 14+ · Android 8.0+
              </motion.p>
            </motion.div>

            {/* Phone Mockup */}
            <motion.div variants={fadeInUp} initial="initial" animate="animate" className="flex justify-center">
              <div className="w-64 h-[500px] bg-white/10 rounded-[3rem] border-4 border-white/20 flex items-center justify-center shadow-E6 relative">
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-white/20 rounded-full" />
                <div className="text-center">
                  <DeviceMobile size={64} className="text-white/30 mx-auto mb-4" />
                  <p className="text-white/40 text-sm">Mockup App</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section-padding-lg">
        <div className="container mx-auto px-4">
          <motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={viewport}>
            <motion.div variants={staggerItem} className="text-center mb-12">
              <span className="badge badge-secondary mb-3">Fitur Unggulan</span>
              <h2 className="text-3xl font-bold">Semua yang Anda Butuhkan</h2>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {appFeatures.map((f) => {
                const Icon = f.icon;
                return (
                  <motion.div key={f.title} variants={staggerItem} className="card p-6 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon size={24} className="text-primary" weight="duotone" />
                    </div>
                    <h3 className="font-bold mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* SCREENS SHOWCASE */}
      <section className="section-padding-lg bg-muted/40 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div variants={fadeInUp} initial="initial" whileInView="animate" viewport={viewport} className="text-center mb-10">
            <h2 className="text-3xl font-bold">Tampilan Aplikasi</h2>
          </motion.div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 justify-center">
            {screens.map((s) => (
              <div key={s.label} className="shrink-0 w-44">
                <div className={`bg-gradient-to-b ${s.bg} rounded-3xl border border-border h-80 flex items-end p-4`}>
                  <span className="text-xs font-semibold bg-background/80 px-2 py-1 rounded-full">{s.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="section-padding-lg">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={viewport}>
            <motion.div variants={staggerItem} className="text-center mb-10">
              <div className="flex items-center justify-center gap-2 mb-2">
                {[...Array(5)].map((_, i) => <Star key={i} size={24} className="text-yellow-500" weight="fill" />)}
              </div>
              <div className="text-4xl font-bold mb-1">4.8<span className="text-2xl text-muted-foreground">/5</span></div>
              <p className="text-muted-foreground text-sm">Dari 500+ ulasan di App Store & Play Store</p>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-5">
              {reviews.map((r) => (
                <motion.div key={r.name} variants={staggerItem} className="card p-6">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(r.rating)].map((_, i) => <Star key={i} size={14} className="text-yellow-500" weight="fill" />)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">"{r.text}"</p>
                  <p className="text-sm font-semibold">{r.name}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* DOWNLOAD CTA */}
      <section className="section-padding-md bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">Download sekarang, gratis!</h2>
          <p className="text-primary-foreground/70 mb-8">Tersedia di iOS dan Android. Tidak perlu kartu kredit untuk mulai.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button className="flex items-center gap-3 bg-white text-primary px-6 py-3 rounded-xl font-semibold hover:bg-white/90 transition-colors">
              <AppStoreLogo size={24} /> App Store
            </button>
            <button className="flex items-center gap-3 bg-white text-primary px-6 py-3 rounded-xl font-semibold hover:bg-white/90 transition-colors">
              <GooglePlayLogo size={24} /> Play Store
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
KAHADE_EOF
ok "PUBLIC — MobileApp"

# PUBLIC — Partners
mkdir -p "$(dirname "$SRC/pages/Partners.tsx")"
cat > "$SRC/pages/Partners.tsx" << 'KAHADE_EOF'
import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, PaperPlaneTilt } from '@phosphor-icons/react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { staggerContainer, staggerItem, fadeInUp, viewport } from '@/lib/animations';

const partnerBenefits = [
  'Co-marketing dan promosi bersama',
  'Akses ke API dan webhook eksklusif',
  'Dedicated partnership manager',
  'Revenue share yang kompetitif',
  'Priority support dan SLA',
  'Co-branding opportunities',
];

const tiers = [
  { name: 'Bronze', min: '0', desc: 'Untuk bisnis yang baru bergabung dalam ekosistem Kahade.', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  { name: 'Silver', min: '50', desc: 'Untuk partner aktif dengan volume transaksi signifikan.', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  { name: 'Gold', min: '500', desc: 'Untuk partner strategis dengan komitmen jangka panjang.', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
];

export default function Partners() {
  const [form, setForm] = useState({ company: '', name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO */}
      <section className="bg-primary text-primary-foreground pt-24 pb-20">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            <motion.span variants={staggerItem} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 text-sm font-medium mb-8">
              Kemitraan
            </motion.span>
            <motion.h1 variants={staggerItem} className="text-4xl md:text-6xl font-bold mb-6">Ekosistem Partner Kahade</motion.h1>
            <motion.p variants={staggerItem} className="text-primary-foreground/70 text-lg">
              Bergabunglah dengan ekosistem mitra kami dan tumbuh bersama platform escrow terpercaya Indonesia.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* PARTNER TIERS */}
      <section className="section-padding-lg">
        <div className="container mx-auto px-4">
          <motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={viewport}>
            <motion.div variants={staggerItem} className="text-center mb-14">
              <span className="badge badge-secondary mb-3">Program Kemitraan</span>
              <h2 className="text-3xl md:text-4xl font-bold">Tingkatan Partner</h2>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              {tiers.map((tier) => (
                <motion.div key={tier.name} variants={staggerItem} className="card p-8 text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold mb-4 ${tier.color}`}>{tier.name}</span>
                  <div className="text-3xl font-bold mb-1">Rp {tier.min}M+</div>
                  <p className="text-xs text-muted-foreground mb-4">Volume transaksi/bulan</p>
                  <p className="text-sm text-muted-foreground">{tier.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Benefits */}
            <motion.div variants={staggerItem} className="bg-muted/40 rounded-3xl p-10">
              <h3 className="text-2xl font-bold text-center mb-8">Keuntungan Menjadi Partner</h3>
              <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {partnerBenefits.map((b) => (
                  <div key={b} className="flex items-center gap-3">
                    <CheckCircle size={20} className="text-green-600 shrink-0" weight="fill" />
                    <span className="text-sm">{b}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* INQUIRY FORM */}
      <section className="section-padding-lg bg-muted/40">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div variants={fadeInUp} initial="initial" whileInView="animate" viewport={viewport}>
            <div className="text-center mb-10">
              <span className="badge badge-secondary mb-3">Daftar</span>
              <h2 className="text-3xl font-bold">Mulai Kemitraan</h2>
              <p className="text-muted-foreground mt-2">Tim kami akan menghubungi Anda dalam 2 hari kerja.</p>
            </div>
            {submitted ? (
              <div className="card p-10 text-center">
                <CheckCircle size={48} className="text-green-600 mx-auto mb-4" weight="fill" />
                <h3 className="font-bold text-xl mb-2">Formulir Terkirim!</h3>
                <p className="text-muted-foreground">Tim partnership kami akan menghubungi Anda segera.</p>
              </div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); setSubmitted(true); }} className="card p-8 space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Nama Perusahaan</label>
                    <input type="text" required placeholder="PT Maju Jaya" className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" value={form.company} onChange={e => setForm({...form, company: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Nama PIC</label>
                    <input type="text" required placeholder="Ahmad Rizki" className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Email Bisnis</label>
                  <input type="email" required placeholder="pic@perusahaan.com" className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Ceritakan Kebutuhan Anda</label>
                  <textarea rows={4} placeholder="Kami adalah platform e-commerce dengan 10.000 transaksi/bulan dan ingin mengintegrasikan escrow..." className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none" value={form.message} onChange={e => setForm({...form, message: e.target.value})} />
                </div>
                <button type="submit" className="btn-primary w-full">
                  <PaperPlaneTilt size={18} /> Kirim Formulir
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
KAHADE_EOF
ok "PUBLIC — Partners"

# PUBLIC — Press
mkdir -p "$(dirname "$SRC/pages/Press.tsx")"
cat > "$SRC/pages/Press.tsx" << 'KAHADE_EOF'
import { motion } from 'framer-motion';
import { ArrowRight, DownloadSimple, Envelope } from '@phosphor-icons/react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { staggerContainer, staggerItem, fadeInUp, viewport } from '@/lib/animations';

const pressReleases = [
  { date: '15 Januari 2025', title: 'Kahade Mencapai 10.000 Pengguna Aktif', summary: 'Platform escrow Kahade mengumumkan pencapaian 10.000 pengguna aktif dengan total dana yang diamankan melebihi Rp 50 Miliar.' },
  { date: '2 Oktober 2024', title: 'Kahade Luncurkan Fitur Resolusi Sengketa AI', summary: 'Fitur baru berbasis kecerdasan buatan memungkinkan penyelesaian sengketa otomatis dalam waktu kurang dari 24 jam.' },
  { date: '10 Juli 2024', title: 'Kahade Raih Pendanaan Seed dari Investor Lokal', summary: 'Pendanaan akan digunakan untuk pengembangan produk dan ekspansi ke kota-kota besar di Indonesia.' },
];

const mediaLogos = ['Kompas', 'Bisnis Indonesia', 'TechInAsia', 'DailySocial', 'CNBC Indonesia', 'Forbes Indonesia', 'Katadata', 'Kontan'];

export default function Press() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO */}
      <section className="bg-primary text-primary-foreground pt-24 pb-20">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            <motion.span variants={staggerItem} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 text-sm font-medium mb-8">
              Media & Pers
            </motion.span>
            <motion.h1 variants={staggerItem} className="text-4xl md:text-6xl font-bold mb-6">Kahade di Media</motion.h1>
            <motion.p variants={staggerItem} className="text-primary-foreground/70 text-lg">
              Liputan terbaru tentang platform escrow terpercaya Indonesia.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* MEDIA LOGOS MARQUEE */}
      <section className="border-y bg-muted/30 py-8 overflow-hidden">
        <motion.div
          className="flex gap-12 whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          {[...mediaLogos, ...mediaLogos].map((logo, i) => (
            <div key={i} className="text-lg font-bold text-muted-foreground/40 shrink-0">{logo}</div>
          ))}
        </motion.div>
      </section>

      {/* PRESS RELEASES */}
      <section className="section-padding-lg">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={viewport}>
            <motion.div variants={staggerItem} className="mb-10">
              <span className="badge badge-secondary mb-3">Siaran Pers</span>
              <h2 className="text-3xl font-bold">Berita Terbaru</h2>
            </motion.div>
            <div className="space-y-4">
              {pressReleases.map((pr) => (
                <motion.div key={pr.title} variants={staggerItem} className="card p-6 group hover:border-primary transition-colors cursor-pointer">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">{pr.date}</p>
                      <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{pr.title}</h3>
                      <p className="text-muted-foreground text-sm">{pr.summary}</p>
                    </div>
                    <ArrowRight size={20} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* MEDIA KIT + CONTACT */}
      <section className="section-padding-md bg-muted/40">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card p-8">
              <h3 className="font-bold text-xl mb-3">Media Kit</h3>
              <p className="text-muted-foreground text-sm mb-6">Unduh logo, panduan merek, dan aset visual resmi Kahade.</p>
              <button className="btn-primary">
                <DownloadSimple size={18} /> Unduh Media Kit
              </button>
            </div>
            <div className="card p-8">
              <h3 className="font-bold text-xl mb-3">Kontak Pers</h3>
              <p className="text-muted-foreground text-sm mb-3">Tim komunikasi kami siap membantu keperluan liputan Anda.</p>
              <div className="flex items-center gap-2 text-sm text-primary font-medium">
                <Envelope size={16} /> pers@kahade.id
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
KAHADE_EOF
ok "PUBLIC — Press"

# PUBLIC — Pricing
mkdir -p "$(dirname "$SRC/pages/Pricing.tsx")"
cat > "$SRC/pages/Pricing.tsx" << 'KAHADE_EOF'
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X, ArrowRight, Question } from '@phosphor-icons/react';
import { Link } from 'wouter';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { staggerContainer, staggerItem, fadeInUp, viewport } from '@/lib/animations';

const plans = [
  {
    name: 'Pemula',
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: 'Untuk individu yang baru mencoba escrow.',
    cta: 'Mulai Gratis',
    popular: false,
    features: [
      { text: '5 transaksi/bulan', included: true },
      { text: 'Biaya platform 2.5%', included: true },
      { text: 'Virtual account & QRIS', included: true },
      { text: 'Support email', included: true },
      { text: 'Dukungan prioritas', included: false },
      { text: 'Akses API', included: false },
      { text: 'Branding kustom', included: false },
    ],
  },
  {
    name: 'Profesional',
    monthlyPrice: 99000,
    yearlyPrice: 79000,
    description: 'Untuk UMKM dan freelancer aktif.',
    cta: 'Mulai Sekarang',
    popular: true,
    features: [
      { text: 'Transaksi tidak terbatas', included: true },
      { text: 'Biaya platform 2.5%', included: true },
      { text: 'Semua metode pembayaran', included: true },
      { text: 'Dukungan prioritas 24/7', included: true },
      { text: 'Akses API penuh', included: true },
      { text: 'Branding kustom', included: true },
      { text: 'SLA 99.9%', included: false },
    ],
  },
  {
    name: 'Enterprise',
    monthlyPrice: null,
    yearlyPrice: null,
    description: 'Untuk perusahaan dengan volume tinggi.',
    cta: 'Hubungi Sales',
    popular: false,
    features: [
      { text: 'Volume tidak terbatas', included: true },
      { text: 'Biaya custom (negosiasi)', included: true },
      { text: 'Semua metode pembayaran', included: true },
      { text: 'Dukungan dedicated 24/7', included: true },
      { text: 'Akses API + webhook', included: true },
      { text: 'White-label tersedia', included: true },
      { text: 'SLA 99.9% + manajer akun', included: true },
    ],
  },
];

const comparisonFeatures = [
  { feature: 'Transaksi/bulan', pemula: '5', profesional: 'Tidak terbatas', enterprise: 'Tidak terbatas' },
  { feature: 'Biaya platform', pemula: '2.5%', profesional: '2.5%', enterprise: 'Custom' },
  { feature: 'Dukungan prioritas', pemula: false, profesional: true, enterprise: true },
  { feature: 'Akses API', pemula: false, profesional: true, enterprise: true },
  { feature: 'Branding kustom', pemula: false, profesional: true, enterprise: true },
  { feature: 'SLA 99.9%', pemula: false, profesional: false, enterprise: true },
  { feature: 'Manajer akun', pemula: false, profesional: false, enterprise: true },
];

const pricingFaqs = [
  { q: 'Apakah ada uji coba gratis?', a: 'Ya! Paket Pemula sepenuhnya gratis dan tidak memerlukan kartu kredit. Anda bisa mencoba Kahade tanpa risiko.' },
  { q: 'Bisakah saya ganti paket kapan saja?', a: 'Tentu. Anda bisa upgrade atau downgrade paket kapan saja. Perubahan berlaku di awal periode billing berikutnya.' },
  { q: 'Apakah biaya 2.5% bisa dinegosiasi?', a: 'Untuk paket Enterprise dengan volume tinggi, biaya platform bisa dinegosiasikan. Hubungi tim sales kami.' },
  { q: 'Apa yang terjadi jika melebihi batas transaksi?', a: 'Di paket Pemula, Anda akan diminta upgrade ke Profesional. Tidak ada biaya tambahan yang mengejutkan.' },
];

function formatRupiah(num: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
}

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);
  const [txValue, setTxValue] = useState(5000000);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const fee = txValue * 0.025;
  const net = txValue - fee;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO */}
      <section className="bg-primary text-primary-foreground pt-24 pb-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            <motion.h1 variants={staggerItem} className="text-4xl md:text-6xl font-bold mb-4">
              Harga yang Jelas.<br />
              <span className="text-white/60">Tidak Ada Kejutan.</span>
            </motion.h1>
            <motion.p variants={staggerItem} className="text-primary-foreground/70 text-lg mb-10">
              Mulai gratis, upgrade sesuai kebutuhan.
            </motion.p>
            <motion.div variants={staggerItem} className="inline-flex items-center gap-1 bg-white/10 rounded-full p-1">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${!isYearly ? 'bg-white text-primary' : 'text-white/70'}`}
              >
                Bulanan
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${isYearly ? 'bg-white text-primary' : 'text-white/70'}`}
              >
                Tahunan
                <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">-20%</span>
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* PRICING CARDS */}
      <section className="section-padding-lg">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => {
              const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
              return (
                <div key={plan.name} className={`card p-8 relative flex flex-col ${plan.popular ? 'border-primary ring-2 ring-primary/20 shadow-E4' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="badge badge-primary text-xs px-3">Paling Populer</span>
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="font-bold text-xl mb-1">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                  <div className="mb-6">
                    <AnimatePresence mode="wait">
                      <motion.div key={isYearly ? 'yearly' : 'monthly'} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                        {price === null ? (
                          <div className="text-3xl font-bold">Custom</div>
                        ) : price === 0 ? (
                          <div className="text-3xl font-bold">Gratis</div>
                        ) : (
                          <div>
                            <span className="text-3xl font-bold">{formatRupiah(price)}</span>
                            <span className="text-sm text-muted-foreground">/bulan</span>
                            {isYearly && <div className="text-xs text-green-600 mt-1">Hemat {formatRupiah((plan.monthlyPrice! - price) * 12)}/tahun</div>}
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  <div className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <div key={f.text} className="flex items-center gap-3">
                        {f.included
                          ? <CheckCircle size={18} className="text-green-600 shrink-0" weight="fill" />
                          : <X size={18} className="text-muted-foreground/40 shrink-0" />
                        }
                        <span className={`text-sm ${f.included ? '' : 'text-muted-foreground/60'}`}>{f.text}</span>
                      </div>
                    ))}
                  </div>
                  <Link href={plan.name === 'Enterprise' ? '/contact' : '/register'}>
                    <button className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}>
                      {plan.cta}
                    </button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CALCULATOR */}
      <section className="section-padding-lg bg-muted/40">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div variants={fadeInUp} initial="initial" whileInView="animate" viewport={viewport}>
            <div className="bg-background rounded-3xl p-8 md:p-12 border border-border shadow-E2">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-2xl font-bold mb-6">Kalkulator Biaya</h2>
                  <div className="mb-6">
                    <label className="text-sm font-medium mb-2 block">Nilai Transaksi</label>
                    <input
                      type="range" min={500000} max={100000000} step={500000}
                      value={txValue} onChange={e => setTxValue(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Rp 500K</span><span>{formatRupiah(txValue)}</span><span>Rp 100M</span>
                    </div>
                  </div>
                  <div className="bg-muted rounded-xl px-4 py-3">
                    <input
                      type="number" value={txValue} onChange={e => setTxValue(Number(e.target.value))}
                      className="w-full bg-transparent text-lg font-semibold focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between py-3 border-b border-border text-sm">
                    <span className="text-muted-foreground">Nilai transaksi</span>
                    <span className="font-semibold">{formatRupiah(txValue)}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-border text-sm">
                    <span className="text-muted-foreground">Biaya platform (2.5%)</span>
                    <span className="font-semibold text-red-600">- {formatRupiah(fee)}</span>
                  </div>
                  <div className="flex justify-between py-3 text-sm font-bold">
                    <span>Total diterima penjual</span>
                    <span className="text-green-600">{formatRupiah(net)}</span>
                  </div>
                  <Link href="/register">
                    <button className="btn-primary w-full mt-2">
                      Mulai Transaksi <ArrowRight size={16} />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="section-padding-lg">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div variants={fadeInUp} initial="initial" whileInView="animate" viewport={viewport}>
            <h2 className="text-3xl font-bold text-center mb-10">Perbandingan Fitur</h2>
            <div className="border border-border rounded-2xl overflow-hidden">
              <div className="grid grid-cols-4 bg-muted/50">
                <div className="p-4 font-medium text-sm">Fitur</div>
                {['Pemula', 'Profesional', 'Enterprise'].map(p => (
                  <div key={p} className={`p-4 font-bold text-sm text-center ${p === 'Profesional' ? 'bg-primary/5 border-x border-primary/20 text-primary' : ''}`}>{p}</div>
                ))}
              </div>
              {comparisonFeatures.map((row, i) => (
                <div key={i} className={`grid grid-cols-4 border-t border-border ${i % 2 === 0 ? '' : 'bg-muted/20'}`}>
                  <div className="p-4 text-sm text-muted-foreground">{row.feature}</div>
                  {[row.pemula, row.profesional, row.enterprise].map((val, j) => (
                    <div key={j} className={`p-4 text-sm text-center ${j === 1 ? 'bg-primary/5 border-x border-primary/20' : ''}`}>
                      {typeof val === 'boolean'
                        ? val ? <CheckCircle size={18} className="text-green-600 mx-auto" weight="fill" /> : <X size={18} className="text-muted-foreground/40 mx-auto" />
                        : val
                      }
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* PRICING FAQ */}
      <section className="section-padding-lg bg-muted/40">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-10">Pertanyaan Harga</h2>
          <div className="space-y-2">
            {pricingFaqs.map((faq, i) => (
              <div key={i} className="border border-border rounded-xl overflow-hidden bg-background">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full text-left p-5 flex items-center justify-between gap-4 hover:text-primary transition-colors">
                  <span className="font-semibold text-sm">{faq.q}</span>
                  <Question size={18} className={`shrink-0 transition-transform ${openFaq === i ? 'rotate-45' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                      <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{faq.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ENTERPRISE CTA */}
      <section className="section-padding-md bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">Butuh solusi enterprise?</h2>
          <p className="text-primary-foreground/70 mb-8">Volume besar, kebutuhan kustom, SLA ketat? Kami punya solusinya. Hubungi tim sales kami sekarang.</p>
          <Link href="/contact">
            <button className="bg-white text-primary font-semibold px-8 py-3.5 rounded-xl hover:bg-white/90 transition-colors inline-flex items-center gap-2">
              Hubungi Sales <ArrowRight size={18} />
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
KAHADE_EOF
ok "PUBLIC — Pricing"

# PUBLIC — Security
mkdir -p "$(dirname "$SRC/pages/Security.tsx")"
cat > "$SRC/pages/Security.tsx" << 'KAHADE_EOF'
import { motion } from 'framer-motion';
import {
  ShieldCheck, Lock, IdentificationCard, ClipboardText,
  Robot, Database, ArrowRight, DownloadSimple,
  Certificate, Detective, SealCheck
} from '@phosphor-icons/react';
import { Link } from 'wouter';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { staggerContainer, staggerItem, fadeInUp, viewport } from '@/lib/animations';

const badges = ['SSL 256-bit', 'OJK Compliant', 'ISO 27001', 'Bank-grade Security'];

const features = [
  {
    icon: ShieldCheck, title: 'Enkripsi SSL 256-bit', large: true,
    description: 'Semua data yang ditransmisikan dienkripsi menggunakan SSL 256-bit — standar yang sama digunakan oleh bank-bank besar dunia. Data yang tersimpan dienkripsi dengan AES-256.',
  },
  { icon: Lock, title: '2FA Wajib', description: 'Autentikasi dua faktor melindungi akun Anda bahkan jika password bocor.' },
  { icon: IdentificationCard, title: 'Verifikasi KYC', description: 'Semua pengguna diverifikasi identitasnya untuk mencegah penipuan.' },
  { icon: ClipboardText, title: 'Audit Log Lengkap', description: 'Setiap aksi tercatat. Transparency penuh untuk ketenangan Anda.' },
  { icon: Robot, title: 'Deteksi Fraud AI', description: 'Sistem AI kami memantau transaksi 24/7 untuk aktivitas mencurigakan.' },
  {
    icon: Database, title: 'Disaster Recovery', wide: true,
    description: 'Infrastruktur multi-region dengan backup otomatis setiap jam. RTO < 4 jam, RPO < 1 jam. Uptime SLA 99.9% dengan monitoring real-time.',
  },
];

const compliance = [
  { icon: Certificate, name: 'OJK', desc: 'Terdaftar di Otoritas Jasa Keuangan Republik Indonesia.' },
  { icon: SealCheck, name: 'ISO 27001', desc: 'Standar internasional untuk keamanan informasi.' },
  { icon: Detective, name: 'KYC/AML', desc: 'Patuh pada regulasi Know Your Customer dan Anti Money Laundering.' },
  { icon: Database, name: 'Bank Indonesia', desc: 'Mengikuti panduan dan regulasi Bank Indonesia untuk fintech.' },
];

export default function Security() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO */}
      <section className="bg-primary text-primary-foreground pt-24 pb-20">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            <motion.h1 variants={staggerItem} className="text-4xl md:text-6xl font-bold mb-6">
              Keamanan setara bank.<br />
              <span className="text-white/60">Untuk semua orang.</span>
            </motion.h1>
            <motion.p variants={staggerItem} className="text-primary-foreground/70 text-lg mb-10">
              Kami menerapkan standar keamanan tertinggi agar setiap transaksi Anda terlindungi.
            </motion.p>
            <motion.div variants={staggerItem} className="flex flex-wrap gap-3 justify-center">
              {badges.map(b => (
                <span key={b} className="px-4 py-2 bg-white/10 rounded-full text-sm font-medium border border-white/20">{b}</span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* SECURITY FEATURES BENTO */}
      <section className="section-padding-lg">
        <div className="container mx-auto px-4">
          <motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={viewport}>
            <motion.div variants={staggerItem} className="text-center mb-14">
              <span className="badge badge-secondary mb-3">Teknologi Keamanan</span>
              <h2 className="text-3xl md:text-4xl font-bold">Berlapis, Komprehensif, Terpercaya</h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
              {features.map((f) => {
                const Icon = f.icon;
                const spanClass = f.large ? 'md:col-span-2 md:row-span-2' : f.wide ? 'md:col-span-2' : '';
                return (
                  <motion.div key={f.title} variants={staggerItem} className={`card p-6 ${spanClass}`}>
                    <div className={`${f.large ? 'w-16 h-16' : 'w-12 h-12'} bg-primary/10 rounded-2xl flex items-center justify-center mb-4`}>
                      <Icon size={f.large ? 32 : 24} className="text-primary" weight="duotone" />
                    </div>
                    <h3 className={`font-bold mb-2 ${f.large ? 'text-xl' : ''}`}>{f.title}</h3>
                    <p className={`text-muted-foreground ${f.large ? 'text-base leading-relaxed' : 'text-sm'}`}>{f.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* COMPLIANCE */}
      <section className="section-padding-lg bg-muted/40">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={viewport}>
            <motion.div variants={staggerItem} className="text-center mb-12">
              <span className="badge badge-secondary mb-3">Regulasi & Kepatuhan</span>
              <h2 className="text-3xl font-bold">Kami Mematuhi Standar Tertinggi</h2>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {compliance.map((c) => {
                const Icon = c.icon;
                return (
                  <motion.div key={c.name} variants={staggerItem} className="card p-6 text-center">
                    <Icon size={32} className="text-primary mx-auto mb-3" weight="duotone" />
                    <h3 className="font-bold mb-2">{c.name}</h3>
                    <p className="text-xs text-muted-foreground">{c.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECURITY REPORT */}
      <section className="section-padding-md">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <motion.div variants={fadeInUp} initial="initial" whileInView="animate" viewport={viewport}>
            <h2 className="text-2xl font-bold mb-3">Transparansi Total</h2>
            <p className="text-muted-foreground mb-6">Unduh laporan keamanan dan audit kami yang tersedia untuk publik.</p>
            <button className="btn-secondary">
              <DownloadSimple size={18} /> Unduh Laporan Keamanan
            </button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
KAHADE_EOF
ok "PUBLIC — Security"

# PUBLIC — UseCases
mkdir -p "$(dirname "$SRC/pages/UseCases.tsx")"
cat > "$SRC/pages/UseCases.tsx" << 'KAHADE_EOF'
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Laptop, House, Car,
  CheckCircle, ArrowRight, TrendUp, Clock, ShieldCheck
} from '@phosphor-icons/react';
import { Link } from 'wouter';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { staggerContainer, staggerItem, fadeInUp, viewport } from '@/lib/animations';

const useCases = [
  {
    icon: ShoppingCart,
    title: 'Marketplace & E-commerce',
    shortDesc: 'Transaksi aman dengan penjual yang belum dikenal.',
    stats: [{ label: 'Pengguna', value: '6.000+' }, { label: 'Avg. Transaksi', value: 'Rp 2.5M' }, { label: 'Sukses', value: '99.8%' }],
    description: 'Di marketplace, pembeli sering ragu bertransaksi dengan penjual baru. Kahade menghilangkan keraguan itu dengan menjamin dana pembeli aman hingga barang diterima.',
    benefits: [
      'Pembeli bisa belanja dari penjual mana pun dengan tenang',
      'Penjual mendapat jaminan pembayaran sebelum kirim barang',
      'Sengketa diselesaikan secara adil oleh tim mediasi',
      'Riwayat transaksi lengkap untuk referensi future',
    ],
    color: 'from-blue-500/20 to-blue-500/5',
  },
  {
    icon: Laptop,
    title: 'Jasa Freelance',
    shortDesc: 'Jaminan pembayaran untuk freelancer dan klien.',
    stats: [{ label: 'Freelancer', value: '2.000+' }, { label: 'Avg. Proyek', value: 'Rp 5M' }, { label: 'On-time', value: '97%' }],
    description: 'Freelancer sering menghadapi klien yang kabur setelah pekerjaan selesai. Klien pun takut membayar di muka tanpa jaminan hasil. Kahade menyelesaikan kedua masalah ini.',
    benefits: [
      'Milestone payment — bayar bertahap sesuai progress',
      'Freelancer mulai kerja setelah dana aman di escrow',
      'Klien bayar hanya jika pekerjaan sesuai brief',
      'Kontrak digital yang legally binding',
    ],
    color: 'from-purple-500/20 to-purple-500/5',
  },
  {
    icon: House,
    title: 'Properti',
    shortDesc: 'Transaksi sewa atau jual-beli properti yang aman.',
    stats: [{ label: 'Transaksi', value: '500+' }, { label: 'Avg. Nilai', value: 'Rp 50M' }, { label: 'Waktu Selesai', value: '< 3 hari' }],
    description: 'Transaksi properti melibatkan nilai besar dan banyak pihak. Kahade memastikan proses berjalan lancar dengan dana yang aman hingga semua syarat terpenuhi.',
    benefits: [
      'Cocok untuk booking fee, uang muka, hingga full payment',
      'Integrasi notaris dan agen properti',
      'Dokumen legal tersimpan aman di platform',
      'Pencairan otomatis saat kondisi terpenuhi',
    ],
    color: 'from-green-500/20 to-green-500/5',
  },
  {
    icon: Car,
    title: 'Otomotif & Barang Besar',
    shortDesc: 'Beli-jual kendaraan dengan perlindungan penuh.',
    stats: [{ label: 'Kendaraan', value: '800+' }, { label: 'Avg. Nilai', value: 'Rp 80M' }, { label: 'Dispute Rate', value: '< 1%' }],
    description: 'Jual-beli kendaraan bekas online berisiko tinggi. Kahade memastikan pembeli mendapat kendaraan sesuai deskripsi dan penjual mendapat pembayaran penuh.',
    benefits: [
      'Dana aman hingga inspeksi kendaraan selesai',
      'Periode inspeksi 3-7 hari yang fleksibel',
      'Coverage untuk motor, mobil, hingga alat berat',
      'Integrasi cek BPKB dan STNK digital',
    ],
    color: 'from-orange-500/20 to-orange-500/5',
  },
];

export default function UseCases() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO */}
      <section className="bg-primary text-primary-foreground pt-24 pb-20 text-center">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            <motion.span variants={staggerItem} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 text-sm font-medium mb-8">
              Kasus Penggunaan
            </motion.span>
            <motion.h1 variants={staggerItem} className="text-4xl md:text-6xl font-bold mb-6">
              Kahade untuk<br />Berbagai Kebutuhan
            </motion.h1>
            <motion.p variants={staggerItem} className="text-primary-foreground/70 text-lg">
              Satu platform, ratusan jenis transaksi yang bisa dilindungi.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* USE CASE CARDS 2x2 */}
      <section className="section-padding-lg">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {useCases.map((uc, i) => {
              const Icon = uc.icon;
              const isActive = active === i;
              return (
                <motion.div key={i} variants={staggerItem} initial="initial" whileInView="animate" viewport={viewport}>
                  <div
                    className={`card overflow-hidden cursor-pointer transition-all duration-300 ${isActive ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50 hover:-translate-y-1'}`}
                    onClick={() => setActive(isActive ? null : i)}
                  >
                    <div className={`bg-gradient-to-br ${uc.color} p-8 pb-6`}>
                      <div className="flex items-start justify-between mb-6">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                          <Icon size={32} className="text-foreground" weight="duotone" />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          {uc.stats.map(s => (
                            <div key={s.label} className="text-center">
                              <div className="text-lg font-bold">{s.value}</div>
                              <div className="text-xs text-muted-foreground">{s.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <h2 className="text-xl font-bold mb-2">{uc.title}</h2>
                      <p className="text-muted-foreground text-sm">{uc.shortDesc}</p>
                    </div>
                    <div className="px-8 py-4 flex items-center justify-between text-sm font-medium text-primary">
                      <span>{isActive ? 'Tutup detail' : 'Lihat detail'}</span>
                      <ArrowRight size={16} className={`transition-transform ${isActive ? 'rotate-90' : ''}`} />
                    </div>

                    {/* Detail Accordion */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="px-8 pb-8 pt-4 border-t border-border">
                            <p className="text-muted-foreground text-sm mb-5 leading-relaxed">{uc.description}</p>
                            <div className="space-y-2.5">
                              {uc.benefits.map((b) => (
                                <div key={b} className="flex items-start gap-3">
                                  <CheckCircle size={18} className="text-green-600 shrink-0 mt-0.5" weight="fill" />
                                  <span className="text-sm">{b}</span>
                                </div>
                              ))}
                            </div>
                            <Link href="/register">
                              <button className="btn-primary mt-6">
                                Mulai Sekarang <ArrowRight size={16} />
                              </button>
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="section-padding-lg bg-muted/40">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={viewport} className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { icon: TrendUp, value: 'Rp 50M+', label: 'Dana Diamankan' },
              { icon: Clock, label: 'Rata-rata Pencairan', value: '< 12 jam' },
              { icon: ShieldCheck, label: 'Tingkat Keberhasilan', value: '99.8%' },
            ].map(({ icon: Icon, value, label }) => (
              <motion.div key={label} variants={staggerItem} className="text-center">
                <Icon size={32} className="text-primary mx-auto mb-3" weight="duotone" />
                <div className="text-3xl font-bold mb-1">{value}</div>
                <div className="text-sm text-muted-foreground">{label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
KAHADE_EOF
ok "PUBLIC — UseCases"

step "AUTH"
# AUTH — Login
mkdir -p "$(dirname "$SRC/pages/auth/Login.tsx")"
cat > "$SRC/pages/auth/Login.tsx" << 'KAHADE_EOF'
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Eye, EyeSlash, GoogleLogo, AppleLogo, ArrowLeft,
  ShieldCheck, Lightning, Clock, Star, ArrowRight
} from '@phosphor-icons/react';
import { Link } from 'wouter';
import { staggerContainer, staggerItem } from '@/lib/animations';

const features = [
  { icon: ShieldCheck, text: 'Enkripsi SSL 256-bit' },
  { icon: Lightning, text: 'Pencairan dalam 12 jam' },
  { icon: Clock, text: 'Support 24/7' },
];

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', remember: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
  };

  return (
    <div className="min-h-screen grid md:grid-cols-[0.45fr_0.55fr]">
      {/* LEFT — Form */}
      <div className="bg-background px-8 md:px-14 py-12 flex flex-col justify-center">
        <div className="max-w-sm mx-auto w-full">
          <Link href="/">
            <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-10 transition-colors">
              <ArrowLeft size={16} /> kahade.id
            </button>
          </Link>

          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            <motion.h1 variants={staggerItem} className="text-3xl font-bold mb-1">Selamat Datang</motion.h1>
            <motion.h1 variants={staggerItem} className="text-3xl font-bold text-muted-foreground mb-8">Kembali</motion.h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email</label>
                <input
                  type="email" required placeholder="email@contoh.com"
                  value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full h-12 px-4 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-foreground transition-colors text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'} required placeholder="Password Anda"
                    value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                    className="w-full h-12 px-4 pr-12 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-foreground transition-colors text-sm"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.remember} onChange={e => setForm({...form, remember: e.target.checked})} className="w-4 h-4 accent-primary rounded" />
                  <span className="text-sm text-muted-foreground">Ingat saya</span>
                </label>
                <Link href="/forgot-password" className="text-sm font-medium hover:text-primary transition-colors">
                  Lupa password?
                </Link>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full h-12 text-base">
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sedang masuk...
                  </span>
                ) : (
                  <span className="flex items-center gap-2 justify-center">Masuk <ArrowRight size={18} /></span>
                )}
              </button>
            </form>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">Atau</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="space-y-3">
              <button className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-border rounded-xl text-sm font-semibold hover:bg-muted hover:border-neutral-300 transition-all duration-200 active:scale-[0.99]">
                <GoogleLogo size={20} /> Lanjutkan dengan Google
              </button>
              <button className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-border rounded-xl text-sm font-semibold hover:bg-muted hover:border-neutral-300 transition-all duration-200 active:scale-[0.99]">
                <AppleLogo size={20} /> Lanjutkan dengan Apple
              </button>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Belum punya akun?{' '}
              <Link href="/register" className="font-semibold text-foreground hover:text-primary transition-colors">
                Buat akun gratis
              </Link>
            </p>
          </motion.div>
        </div>
      </div>

      {/* RIGHT — Brand Visual */}
      <div className="hidden md:flex bg-primary text-primary-foreground flex-col justify-center px-14 py-12">
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-md">
          <motion.div variants={staggerItem} className="text-3xl font-black mb-2">KAHADE</motion.div>
          <motion.p variants={staggerItem} className="text-primary-foreground/60 text-sm mb-12">Platform Escrow Terpercaya Indonesia</motion.p>

          <motion.blockquote variants={staggerItem} className="text-xl font-semibold leading-relaxed mb-8">
            "Ribuan pengguna mempercayai Kahade untuk transaksi online mereka."
          </motion.blockquote>

          {/* Avatar stack + rating */}
          <motion.div variants={staggerItem} className="flex items-center gap-4 mb-12 pb-12 border-b border-white/10">
            <div className="flex -space-x-2">
              {['A','B','C','D','E'].map((l, i) => (
                <div key={i} className="w-9 h-9 rounded-full bg-white/20 border-2 border-primary flex items-center justify-center text-xs font-bold">{l}</div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} weight="fill" className="text-yellow-400" />)}
              </div>
              <p className="text-xs text-primary-foreground/60">4.9/5 · 2.100+ ulasan</p>
            </div>
          </motion.div>

          <motion.div variants={staggerItem} className="space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Icon size={16} />
                </div>
                <span className="text-sm text-primary-foreground/80">{text}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
KAHADE_EOF
ok "AUTH — Login"

# AUTH — Register
mkdir -p "$(dirname "$SRC/pages/auth/Register.tsx")"
cat > "$SRC/pages/auth/Register.tsx" << 'KAHADE_EOF'
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeSlash, GoogleLogo, AppleLogo, ArrowLeft, ArrowRight,
  Check, ShieldCheck, Star, Lightning, Clock
} from '@phosphor-icons/react';
import { Link } from 'wouter';
import { staggerContainer, staggerItem } from '@/lib/animations';

const steps = ['Info Dasar', 'Kontak', 'Preferensi', 'Verifikasi'];

const preferences = ['Membeli dari marketplace', 'Menjual produk', 'Jasa freelance', 'Keperluan bisnis'];

interface StepContentProps {
  step: number;
  data: Record<string, any>;
  onChange: (key: string, val: any) => void;
}

function StepContent({ step, data, onChange }: StepContentProps) {
  const [showPwd, setShowPwd] = useState(false);

  if (step === 0) return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-1.5 block">Nama Lengkap</label>
        <input type="text" placeholder="Ahmad Rizki" value={data.name || ''} onChange={e => onChange('name', e.target.value)}
          className="w-full h-12 px-4 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-foreground transition-colors text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium mb-1.5 block">Email</label>
        <input type="email" placeholder="email@contoh.com" value={data.email || ''} onChange={e => onChange('email', e.target.value)}
          className="w-full h-12 px-4 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-foreground transition-colors text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium mb-1.5 block">Password</label>
        <div className="relative">
          <input type={showPwd ? 'text' : 'password'} placeholder="Min. 8 karakter" value={data.password || ''} onChange={e => onChange('password', e.target.value)}
            className="w-full h-12 px-4 pr-12 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-foreground transition-colors text-sm" />
          <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
            {showPwd ? <EyeSlash size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
    </div>
  );

  if (step === 1) return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-1.5 block">Nomor HP</label>
        <input type="tel" placeholder="+62 812-XXXX-XXXX" value={data.phone || ''} onChange={e => onChange('phone', e.target.value)}
          className="w-full h-12 px-4 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-foreground transition-colors text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium mb-1.5 block">Kota</label>
        <input type="text" placeholder="Jakarta" value={data.city || ''} onChange={e => onChange('city', e.target.value)}
          className="w-full h-12 px-4 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-foreground transition-colors text-sm" />
      </div>
    </div>
  );

  if (step === 2) return (
    <div className="space-y-3">
      <p className="text-sm font-semibold mb-4">Saya akan menggunakan Kahade untuk:</p>
      {preferences.map(opt => {
        const selected = (data.prefs || []).includes(opt);
        return (
          <label key={opt} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border-2 border-border hover:border-primary/50 transition-colors">
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${selected ? 'bg-primary border-primary' : 'border-border'}`}>
              {selected && <Check size={12} className="text-primary-foreground" weight="bold" />}
            </div>
            <span className="text-sm">{opt}</span>
            <input type="checkbox" className="sr-only" checked={selected} onChange={() => {
              const curr = data.prefs || [];
              onChange('prefs', selected ? curr.filter((p: string) => p !== opt) : [...curr, opt]);
            }} />
          </label>
        );
      })}
    </div>
  );

  if (step === 3) return (
    <div className="text-center space-y-6">
      <div>
        <p className="font-semibold mb-2">Verifikasi Email</p>
        <p className="text-sm text-muted-foreground">Masukkan kode 6 digit yang dikirim ke {data.email || 'email Anda'}</p>
      </div>
      <div className="flex justify-center gap-2">
        {[...Array(6)].map((_, i) => (
          <input key={i} type="text" maxLength={1}
            className="w-11 h-14 rounded-xl border-2 border-border text-center text-xl font-bold focus:outline-none focus:border-foreground transition-colors bg-background"
            onKeyUp={e => {
              if (e.key !== 'Backspace' && (e.target as HTMLInputElement).value) {
                const next = (e.target as HTMLElement).nextSibling as HTMLInputElement;
                if (next) next.focus();
              }
            }}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Tidak menerima kode?{' '}
        <button className="text-foreground font-semibold hover:underline">Kirim ulang</button>
      </p>
    </div>
  );

  return null;
}

export default function Register() {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<Record<string, any>>({});

  const updateData = (key: string, val: any) => setData(prev => ({ ...prev, [key]: val }));

  return (
    <div className="min-h-screen grid md:grid-cols-[0.45fr_0.55fr]">
      {/* LEFT — Form */}
      <div className="bg-background px-8 md:px-14 py-12 flex flex-col justify-center">
        <div className="max-w-sm mx-auto w-full">
          <Link href="/">
            <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-10 transition-colors">
              <ArrowLeft size={16} /> kahade.id
            </button>
          </Link>

          <h1 className="text-3xl font-bold mb-1">Buat Akun</h1>
          <h1 className="text-3xl font-bold text-muted-foreground mb-8">Gratis</h1>

          {/* Progress bar */}
          <div className="h-1 bg-muted rounded-full mb-6 overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} />
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-1 mb-8">
            {steps.map((step, i) => (
              <div key={step} className="flex items-center gap-1 flex-1">
                <div className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${i <= currentStep ? 'text-foreground' : 'text-muted-foreground'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i < currentStep ? 'bg-green-600 text-white' : i === currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {i < currentStep ? <Check size={12} weight="bold" /> : i + 1}
                  </div>
                  <span className="hidden sm:block">{step}</span>
                </div>
                {i < steps.length - 1 && <div className={`flex-1 h-[2px] rounded-full transition-colors duration-500 mx-1 ${i < currentStep ? 'bg-green-600' : 'bg-muted'}`} />}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <StepContent step={currentStep} data={data} onChange={updateData} />
            </motion.div>
          </AnimatePresence>

          <div className={`flex gap-3 mt-6 ${currentStep > 0 ? 'flex-row' : 'flex-col'}`}>
            {currentStep > 0 && (
              <button onClick={() => setCurrentStep(s => s - 1)} className="btn-secondary flex-1">
                <ArrowLeft size={16} /> Kembali
              </button>
            )}
            <button
              onClick={() => currentStep < steps.length - 1 ? setCurrentStep(s => s + 1) : null}
              className="btn-primary flex-1"
            >
              {currentStep === steps.length - 1 ? 'Selesai Daftar' : 'Lanjut'}
              <ArrowRight size={16} />
            </button>
          </div>

          {currentStep === 0 && (
            <>
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-border" /><span className="text-xs text-muted-foreground">Atau</span><div className="flex-1 h-px bg-border" />
              </div>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-border rounded-xl text-sm font-semibold hover:bg-muted transition-all">
                  <GoogleLogo size={20} /> Lanjutkan dengan Google
                </button>
              </div>
            </>
          )}

          <p className="text-center text-sm text-muted-foreground mt-5">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-semibold text-foreground hover:text-primary transition-colors">Masuk</Link>
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="hidden md:flex bg-primary text-primary-foreground flex-col justify-center px-14 py-12">
        <div className="max-w-md">
          <div className="text-3xl font-black mb-2">KAHADE</div>
          <p className="text-primary-foreground/60 text-sm mb-12">Platform Escrow Terpercaya Indonesia</p>
          <blockquote className="text-xl font-semibold leading-relaxed mb-8">
            "Daftar gratis dan mulai transaksi aman dalam 5 menit."
          </blockquote>
          <div className="flex items-center gap-4 mb-12 pb-12 border-b border-white/10">
            <div className="flex -space-x-2">
              {['A','B','C','D','E'].map((l, i) => (
                <div key={i} className="w-9 h-9 rounded-full bg-white/20 border-2 border-primary flex items-center justify-center text-xs font-bold">{l}</div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} weight="fill" className="text-yellow-400" />)}
              </div>
              <p className="text-xs text-primary-foreground/60">4.9/5 · 10.000+ pengguna</p>
            </div>
          </div>
          <div className="space-y-4">
            {[{ icon: ShieldCheck, text: 'Verifikasi identitas aman' }, { icon: Lightning, text: 'Setup dalam 5 menit' }, { icon: Clock, text: 'Transaksi pertama gratis' }].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0"><Icon size={16} /></div>
                <span className="text-sm text-primary-foreground/80">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
KAHADE_EOF
ok "AUTH — Register"

# AUTH — ForgotPassword
mkdir -p "$(dirname "$SRC/pages/auth/ForgotPassword.tsx")"
cat > "$SRC/pages/auth/ForgotPassword.tsx" << 'KAHADE_EOF'
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Envelope, CheckCircle, Key } from '@phosphor-icons/react';
import { Link } from 'wouter';
import { fadeInUp } from '@/lib/animations';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    let c = 45;
    setCountdown(c);
    const t = setInterval(() => { c--; setCountdown(c); if (c <= 0) clearInterval(t); }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/login">
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-10 transition-colors">
            <ArrowLeft size={16} /> Kembali ke Login
          </button>
        </Link>

        {!submitted ? (
          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <Key size={32} className="text-primary" weight="duotone" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Lupa Password?</h1>
            <p className="text-muted-foreground text-sm mb-8">
              Masukkan email Anda dan kami akan mengirimkan tautan reset password.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email</label>
                <div className="relative">
                  <Envelope size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email" required placeholder="email@contoh.com" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-foreground transition-colors text-sm"
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full h-12">Kirim Tautan Reset</button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-6">
              Kembali ke{' '}<Link href="/login" className="font-semibold text-foreground hover:text-primary transition-colors">Login</Link>
            </p>
          </motion.div>
        ) : (
          <motion.div variants={fadeInUp} initial="initial" animate="animate" className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <CheckCircle size={32} className="text-green-600" weight="fill" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Email Terkirim!</h1>
            <p className="text-muted-foreground text-sm mb-2">
              Periksa inbox <strong>{email}</strong> untuk tautan reset.
            </p>
            <p className="text-xs text-muted-foreground mb-8">(Juga cek folder spam)</p>
            {countdown > 0 ? (
              <p className="text-sm text-muted-foreground">
                Kirim ulang dalam: <span className="font-semibold text-foreground">0:{countdown.toString().padStart(2, '0')}</span>
              </p>
            ) : (
              <button onClick={() => { setSubmitted(false); setCountdown(0); }} className="btn-secondary">
                Kirim Ulang
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
KAHADE_EOF
ok "AUTH — ForgotPassword"

# AUTH — ResetPassword
mkdir -p "$(dirname "$SRC/pages/auth/ResetPassword.tsx")"
cat > "$SRC/pages/auth/ResetPassword.tsx" << 'KAHADE_EOF'
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeSlash, CheckCircle, LockKey } from '@phosphor-icons/react';
import { Link } from 'wouter';
import { fadeInUp } from '@/lib/animations';

export default function ResetPassword() {
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [done, setDone] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password === form.confirm) setDone(true);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {!done ? (
          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <LockKey size={32} className="text-primary" weight="duotone" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
            <p className="text-muted-foreground text-sm mb-8">Buat password baru yang kuat untuk akun Anda.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Password Baru</label>
                <div className="relative">
                  <input type={showPwd ? 'text' : 'password'} required minLength={8} placeholder="Min. 8 karakter" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                    className="w-full h-12 px-4 pr-12 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-foreground transition-colors text-sm" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPwd ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Konfirmasi Password</label>
                <div className="relative">
                  <input type={showConfirm ? 'text' : 'password'} required placeholder="Ulangi password" value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})}
                    className={`w-full h-12 px-4 pr-12 rounded-xl border-2 bg-background focus:outline-none focus:border-foreground transition-colors text-sm ${form.confirm && form.password !== form.confirm ? 'border-destructive' : 'border-border'}`} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showConfirm ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {form.confirm && form.password !== form.confirm && (
                  <p className="text-xs text-destructive mt-1">Password tidak cocok</p>
                )}
              </div>
              <button type="submit" className="btn-primary w-full h-12" disabled={!form.password || form.password !== form.confirm}>
                Reset Password
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div variants={fadeInUp} initial="initial" animate="animate" className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 mx-auto">
              <CheckCircle size={32} className="text-green-600" weight="fill" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Password Berhasil Diubah!</h1>
            <p className="text-muted-foreground text-sm mb-8">Gunakan password baru Anda untuk masuk.</p>
            <Link href="/login">
              <button className="btn-primary w-full">Masuk Sekarang</button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
KAHADE_EOF
ok "AUTH — ResetPassword"

step "DASHBOARD"
# DASHBOARD — Dashboard
mkdir -p "$(dirname "$SRC/pages/dashboard/Dashboard.tsx")"
cat > "$SRC/pages/dashboard/Dashboard.tsx" << 'KAHADE_EOF'
import { motion } from 'framer-motion';
import {
  Wallet, ArrowsClockwise, CheckCircle, Star,
  Plus, ArrowDown, ArrowUp, FileText, ArrowRight,
  TrendUp, TrendDown, Clock, ShieldCheck
} from '@phosphor-icons/react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Link } from 'wouter';
import { staggerContainer, staggerItem, viewport } from '@/lib/animations';

const metrics = [
  { icon: Wallet, label: 'Saldo Dompet', value: 'Rp 2.500.000', delta: '+Rp 500K', positive: true },
  { icon: ArrowsClockwise, label: 'Transaksi Aktif', value: '3', delta: 'Dalam proses', positive: null },
  { icon: CheckCircle, label: 'Selesai', value: '47', delta: '+5 bulan ini', positive: true },
  { icon: Star, label: 'Reward Poin', value: '1.250', delta: 'Level: Gold', positive: null },
];

const recentTransactions = [
  { id: 'KHD-2451', title: 'Laptop ASUS ROG', amount: 'Rp 5.200.000', status: 'active', label: 'Aktif', party: '@seller_081' },
  { id: 'KHD-2449', title: 'Jasa Logo Design', amount: 'Rp 800.000', status: 'completed', label: 'Selesai', party: '@jasa_design' },
  { id: 'KHD-2447', title: 'iPhone 15 Pro', amount: 'Rp 12.000.000', status: 'pending', label: 'Menunggu', party: '@iphone_store' },
];

const activities = [
  { text: 'Dana masuk Rp 2.5M dari #KHD-2449', time: '2 jam lalu', icon: TrendUp, color: 'text-green-600' },
  { text: 'Transaksi #KHD-2451 dikonfirmasi', time: '5 jam lalu', icon: CheckCircle, color: 'text-blue-600' },
  { text: 'KYC Anda telah disetujui', time: 'Kemarin', icon: ShieldCheck, color: 'text-primary' },
  { text: 'Reward 50 pts dari transaksi selesai', time: 'Kemarin', icon: Star, color: 'text-yellow-500' },
];

const quickActions = [
  { label: 'Transaksi Baru', icon: Plus, href: '/transactions/new', primary: true },
  { label: 'Deposit', icon: ArrowDown, href: '/deposit', primary: false },
  { label: 'Tarik Dana', icon: ArrowUp, href: '/wallet', primary: false },
  { label: 'Laporan', icon: FileText, href: '/activity', primary: false },
];

const statusStyles: Record<string, string> = {
  active: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  dispute: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const now = new Date();
const hour = now.getHours();
const greeting = hour < 12 ? 'pagi' : hour < 17 ? 'siang' : 'malam';

export default function Dashboard() {
  const { user } = useAuth();
  const userName = user?.name || user?.fullName || 'Pengguna';
  return (
    <DashboardLayout>
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div variants={staggerContainer} initial="initial" animate="animate">
        {/* Header */}
        <motion.div variants={staggerItem} className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Selamat {greeting}, {userName}! 👋</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <Link href="/transactions/new">
            <button className="btn-primary">
              <Plus size={18} /> Transaksi Baru
            </button>
          </Link>
        </motion.div>

        {/* Metric Cards */}
        <motion.div variants={staggerItem} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="card p-5 hover:shadow-E3 transition-shadow duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon size={20} className="text-primary" weight="duotone" />
                  </div>
                  {m.positive !== null && (
                    <span className={`text-xs font-semibold flex items-center gap-0.5 ${m.positive ? 'text-green-600' : 'text-red-600'}`}>
                      {m.positive ? <TrendUp size={12} /> : <TrendDown size={12} />}
                      {m.delta}
                    </span>
                  )}
                </div>
                <p className="text-2xl font-black tracking-tight">{m.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{m.label}</p>
                {m.positive === null && <p className="text-xs text-muted-foreground">{m.delta}</p>}
              </div>
            );
          })}
        </motion.div>

        {/* Main Grid */}
        <motion.div variants={staggerItem} className="grid lg:grid-cols-[1fr_380px] gap-6 mb-6">
          {/* Recent Transactions */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold">Transaksi Terbaru</h2>
              <Link href="/transactions" className="text-sm text-primary hover:underline flex items-center gap-1">
                Lihat semua <ArrowRight size={14} />
              </Link>
            </div>
            <div className="space-y-3">
              {recentTransactions.map((tx) => (
                <Link key={tx.id} href={`/transactions/${tx.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {tx.id.slice(-3)}
                      </div>
                      <div>
                        <p className="font-medium text-sm group-hover:text-primary transition-colors">{tx.title}</p>
                        <p className="text-xs text-muted-foreground">#{tx.id} · {tx.party}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{tx.amount}</p>
                      <span className={`text-[0.625rem] font-semibold px-2 py-0.5 rounded-full ${statusStyles[tx.status]}`}>{tx.label}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="card p-6">
            <h2 className="font-bold mb-5">Aktivitas Terkini</h2>
            <div className="space-y-4">
              {activities.map((act, i) => {
                const Icon = act.icon;
                return (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <Icon size={16} className={act.color} />
                    </div>
                    <div>
                      <p className="text-sm leading-snug">{act.text}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Clock size={10} />{act.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={staggerItem}>
          <h2 className="font-bold mb-4">Aksi Cepat</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((qa) => {
              const Icon = qa.icon;
              return (
                <Link key={qa.label} href={qa.href}>
                  <div className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all hover:-translate-y-0.5 ${qa.primary ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90' : 'bg-background border-border hover:border-primary hover:shadow-E2'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${qa.primary ? 'bg-white/20' : 'bg-muted'}`}>
                      <Icon size={20} className={qa.primary ? 'text-white' : 'text-primary'} weight="duotone" />
                    </div>
                    <span className="text-sm font-semibold">{qa.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </div>
    </DashboardLayout>
  );
}
KAHADE_EOF
ok "DASHBOARD — Dashboard"

# DASHBOARD — Transactions
mkdir -p "$(dirname "$SRC/pages/dashboard/Transactions.tsx")"
cat > "$SRC/pages/dashboard/Transactions.tsx" << 'KAHADE_EOF'
import { useState } from 'react';
import { Link } from 'wouter';
import {
  Plus, MagnifyingGlass, FunnelSimple, ArrowRight,
  CaretLeft, CaretRight, ArrowDown
} from '@phosphor-icons/react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const tabs = ['Semua', 'Aktif', 'Selesai', 'Dibatalkan', 'Sengketa'];
const mockTx = [
  { id: 'KHD-2451', title: 'Laptop ASUS ROG', party: '@seller_081', city: 'Jakarta', amount: 'Rp 5.200.000', status: 'active', label: 'Aktif', age: '2 hari lagi' },
  { id: 'KHD-2449', title: 'Jasa Logo Design', party: '@jasa_design', city: 'Bandung', amount: 'Rp 800.000', status: 'completed', label: 'Selesai', age: '3 hari lalu' },
  { id: 'KHD-2447', title: 'iPhone 15 Pro', party: '@iphone_store', city: 'Surabaya', amount: 'Rp 12.000.000', status: 'pending', label: 'Menunggu', age: '1 hari lagi' },
  { id: 'KHD-2440', title: 'Jasa Video Editing', party: '@editor_pro', city: 'Yogyakarta', amount: 'Rp 2.500.000', status: 'completed', label: 'Selesai', age: '5 hari lalu' },
  { id: 'KHD-2435', title: 'Kamera Sony A7R', party: '@camera_store', city: 'Jakarta', amount: 'Rp 18.000.000', status: 'dispute', label: 'Sengketa', age: '7 hari lalu' },
  { id: 'KHD-2430', title: 'Macbook Air M2', party: '@mac_seller', city: 'Jakarta', amount: 'Rp 15.000.000', status: 'cancelled', label: 'Dibatalkan', age: '10 hari lalu' },
];
const statusStyles: Record<string, string> = {
  active: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  dispute: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  cancelled: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400',
};
export default function Transactions() {
  const [activeTab, setActiveTab] = useState('Semua');
  const [search, setSearch] = useState('');
  const filtered = mockTx.filter(tx => activeTab === 'Semua' || tx.label === activeTab).filter(tx => !search || tx.title.toLowerCase().includes(search.toLowerCase()) || tx.id.toLowerCase().includes(search.toLowerCase()));
  return (
    <DashboardLayout>
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Transaksi</h1>
        <Link href="/transactions/new"><button className="btn-primary"><Plus size={18} /> Transaksi Baru</button></Link>
      </div>
      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl mb-5 overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>{tab}</button>
        ))}
      </div>
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <MagnifyingGlass size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Cari transaksi..." value={search} onChange={e => setSearch(e.target.value)} className="w-full h-10 pl-10 pr-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
        </div>
        <button className="btn-secondary gap-2 px-3"><FunnelSimple size={16} /> Filter</button>
        <button className="btn-secondary gap-2 px-3"><ArrowDown size={16} /> Export</button>
      </div>
      <div className="hidden md:block card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Transaksi</th>
              <th className="text-left p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Pihak Lawan</th>
              <th className="text-right p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Nilai</th>
              <th className="text-center p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Status</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((tx) => (
              <tr key={tx.id} className="hover:bg-muted/30 transition-colors group">
                <td className="p-4"><p className="font-semibold">{tx.title}</p><p className="text-xs text-muted-foreground">#{tx.id} · {tx.age}</p></td>
                <td className="p-4"><p className="font-medium">{tx.party}</p><p className="text-xs text-muted-foreground">{tx.city}</p></td>
                <td className="p-4 text-right font-semibold">{tx.amount}</td>
                <td className="p-4 text-center"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[tx.status]}`}>{tx.label}</span></td>
                <td className="p-4">
                  <Link href={`/transactions/${tx.id}`}><button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-muted"><ArrowRight size={16} className="text-muted-foreground" /></button></Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="py-16 text-center text-muted-foreground text-sm">Tidak ada transaksi ditemukan.</div>}
      </div>
      <div className="md:hidden space-y-3">
        {filtered.map((tx) => (
          <Link key={tx.id} href={`/transactions/${tx.id}`}>
            <div className="card p-4 flex items-center justify-between gap-3">
              <div><p className="font-semibold text-sm">{tx.title}</p><p className="text-xs text-muted-foreground">#{tx.id} · {tx.party}</p><span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1.5 inline-block ${statusStyles[tx.status]}`}>{tx.label}</span></div>
              <div className="text-right shrink-0"><p className="font-bold text-sm">{tx.amount}</p><p className="text-xs text-muted-foreground mt-0.5">{tx.age}</p></div>
            </div>
          </Link>
        ))}
      </div>
      {filtered.length > 0 && (
        <div className="flex items-center justify-between mt-5 text-sm text-muted-foreground">
          <span>Menampilkan 1–{filtered.length} dari {mockTx.length} transaksi</span>
          <div className="flex items-center gap-1">
            <button className="p-2 rounded-lg hover:bg-muted transition-colors"><CaretLeft size={16} /></button>
            <button className="w-8 h-8 rounded-lg bg-primary text-primary-foreground text-sm font-semibold">1</button>
            <button className="p-2 rounded-lg hover:bg-muted transition-colors"><CaretRight size={16} /></button>
          </div>
        </div>
      )}
    </div>
  </DashboardLayout>
  );
}
KAHADE_EOF
ok "DASHBOARD — Transactions"

# DASHBOARD — TransactionDetail
mkdir -p "$(dirname "$SRC/pages/dashboard/TransactionDetail.tsx")"
cat > "$SRC/pages/dashboard/TransactionDetail.tsx" << 'KAHADE_EOF'
import { useState } from 'react';
import {
  ArrowLeft, Check, FileText, Image, Clock, Warning,
  Lightning, ChatCircle, PaperclipHorizontal, PaperPlaneTilt,
  ShieldCheck, CheckCircle
} from '@phosphor-icons/react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Link } from 'wouter';

const timeline = [
  { title: 'Transaksi dibuat', timestamp: '18 Feb 2026, 10:30', completed: true, active: false },
  { title: 'Dana disimpan di escrow', timestamp: '18 Feb 2026, 11:05', completed: true, active: false, note: 'Pembayaran Rp 5.200.000 diterima' },
  { title: 'Penjual dikonfirmasi', timestamp: '19 Feb 2026, 09:15', completed: true, active: false },
  { title: 'Menunggu konfirmasi pembeli', timestamp: 'Menunggu', completed: false, active: true },
  { title: 'Dana dilepas ke penjual', timestamp: 'Belum', completed: false, active: false },
];

const messages = [
  { sender: 'seller', text: 'Barang sudah saya kirim via JNE', time: '19 Feb, 09:15', own: false },
  { sender: 'seller', text: 'No resi: JNE-2024-XXXXX', time: '19 Feb, 09:16', own: false },
  { sender: 'me', text: 'Terima kasih, akan saya cek', time: '19 Feb, 10:30', own: true },
  { sender: 'me', text: 'Barang sudah sampai, kondisi baik 👍', time: '20 Feb, 14:00', own: true },
];

export default function TransactionDetail() {
  const [message, setMessage] = useState('');

  return (
    <DashboardLayout>
    <div className="p-6 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/dashboard"><span className="hover:text-foreground cursor-pointer">Dashboard</span></Link>
        <span>/</span>
        <Link href="/transactions"><span className="hover:text-foreground cursor-pointer">Transaksi</span></Link>
        <span>/</span>
        <span className="text-foreground font-medium">#KHD-2451</span>
      </div>

      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl font-bold">Transaksi #KHD-2451</h1>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">● Aktif</span>
            </div>
            <p className="text-lg font-semibold mb-1">Laptop ASUS ROG Strix G15</p>
            <p className="text-sm text-muted-foreground">Dibuat: 18 Feb 2026 · Berakhir: 25 Feb 2026</p>
          </div>
          <button className="btn-ghost gap-2 text-sm text-muted-foreground border border-border hover:border-destructive hover:text-destructive">
            <Warning size={16} /> Laporkan Masalah
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        {/* LEFT */}
        <div className="space-y-6">
          {/* Timeline */}
          <div className="card p-6">
            <h2 className="font-bold mb-6">Status Transaksi</h2>
            <div className="space-y-0 relative">
              {timeline.map((event, i) => (
                <div key={i} className="flex gap-4 relative">
                  {i < timeline.length - 1 && (
                    <div className={`absolute left-[19px] top-10 bottom-0 w-[2px] ${event.completed ? 'bg-green-500' : 'bg-border'}`} />
                  )}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 ${event.completed ? 'bg-green-600 text-white' : event.active ? 'bg-primary text-primary-foreground animate-pulse' : 'bg-muted text-muted-foreground'}`}>
                    {event.completed ? <Check size={16} weight="bold" /> : <Clock size={16} />}
                  </div>
                  <div className="pb-8 flex-1 pt-1">
                    <p className={`text-sm font-semibold ${event.active ? 'text-primary' : ''}`}>{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.timestamp}</p>
                    {event.note && <p className="text-xs text-muted-foreground mt-1.5 bg-muted px-3 py-2 rounded-lg">{event.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="card p-6">
            <h2 className="font-bold mb-4">Pesan Transaksi</h2>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.own ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${msg.own ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted text-foreground rounded-bl-sm'}`}>
                    {msg.text}
                    <span className={`text-[0.625rem] block text-right mt-1 ${msg.own ? 'opacity-60' : 'text-muted-foreground'}`}>{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 border-t border-border pt-4">
              <button className="p-2 rounded-xl hover:bg-muted transition-colors"><PaperclipHorizontal size={18} className="text-muted-foreground" /></button>
              <input type="text" value={message} onChange={e => setMessage(e.target.value)} placeholder="Tulis pesan..." className="flex-1 px-4 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              <button className="p-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"><PaperPlaneTilt size={18} /></button>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
          {/* Summary */}
          <div className="card p-6">
            <h2 className="font-bold mb-4">Ringkasan Transaksi</h2>
            <div className="space-y-3 text-sm">
              {[['Nilai Transaksi', 'Rp 5.200.000'], ['Biaya Platform (2.5%)', 'Rp 130.000'], ['Total Pembayaran', 'Rp 5.330.000']].map(([label, val], i) => (
                <div key={i} className={`flex justify-between ${i === 2 ? 'border-t border-border pt-3 font-bold text-base' : ''}`}>
                  <span className="text-muted-foreground">{label}</span>
                  <span>{val}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Pembeli</span><span className="font-medium">Ahmad Rizki</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Penjual</span><span className="font-medium">@seller_081</span></div>
            </div>
          </div>

          {/* Attachments */}
          <div className="card p-6">
            <h2 className="font-bold mb-4">Lampiran</h2>
            <div className="space-y-2">
              {[{ icon: FileText, name: 'Invoice.pdf', size: '124 KB' }, { icon: Image, name: 'Foto_produk.jpg', size: '2.1 MB' }].map(({ icon: Icon, name, size }) => (
                <div key={name} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                  <Icon size={20} className="text-primary shrink-0" weight="duotone" />
                  <div><p className="text-sm font-medium">{name}</p><p className="text-xs text-muted-foreground">{size}</p></div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="card p-6 space-y-3">
            <h2 className="font-bold mb-2">Aksi</h2>
            <button className="w-full btn-primary gap-2 justify-center">
              <CheckCircle size={18} /> Konfirmasi Terima
            </button>
            <button className="w-full btn-secondary gap-2 justify-center">
              <Lightning size={18} /> Perpanjang Waktu
            </button>
            <button className="w-full py-2.5 rounded-xl border border-destructive/30 text-destructive text-sm font-semibold hover:bg-destructive/5 transition-colors flex items-center justify-center gap-2">
              <Warning size={18} /> Buka Sengketa
            </button>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
  );
}
KAHADE_EOF
ok "DASHBOARD — TransactionDetail"

# DASHBOARD — CreateTransaction
mkdir -p "$(dirname "$SRC/pages/dashboard/CreateTransaction.tsx")"
cat > "$SRC/pages/dashboard/CreateTransaction.tsx" << 'KAHADE_EOF'
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowLeft, ArrowRight, UploadSimple, X } from '@phosphor-icons/react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const steps = ['Detail', 'Pihak Lawan', 'Lampiran', 'Konfirmasi'];

function fee(val: number) { return Math.round(val * 0.025); }
function fmt(n: number) { return new Intl.NumberFormat('id-ID').format(n); }

export default function CreateTransaction() {
  const [step, setStep] = useState(0);
  const [drag, setDrag] = useState(false);
  const [files, setFiles] = useState<string[]>([]);
  const [data, setData] = useState({ title: '', desc: '', amount: 5000000, days: 7, feeSplit: 'seller', counterEmail: '', note: '' });

  const update = (k: string, v: any) => setData(p => ({ ...p, [k]: v }));

  return (
    <DashboardLayout>
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Buat Transaksi Baru</h1>
      <p className="text-muted-foreground text-sm mb-8">Lengkapi detail transaksi escrow Anda</p>

      {/* Step indicator */}
      <div className="flex items-center gap-1 mb-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-1 flex-1">
            <div className={`flex items-center gap-1.5 text-xs font-medium ${i <= step ? 'text-foreground' : 'text-muted-foreground'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${i < step ? 'bg-green-600 text-white' : i === step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {i < step ? <Check size={13} weight="bold" /> : i + 1}
              </div>
              <span className="hidden sm:block">{s}</span>
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-[2px] rounded-full mx-1 ${i < step ? 'bg-green-600' : 'bg-muted'}`} />}
          </div>
        ))}
      </div>

      <div className="card p-8">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>

            {step === 0 && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold mb-6">Detail Transaksi</h2>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Nama Produk / Jasa</label>
                  <input type="text" placeholder="cth: Laptop ASUS ROG" value={data.title} onChange={e => update('title', e.target.value)} className="w-full h-12 px-4 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-foreground transition-colors text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Deskripsi</label>
                  <textarea rows={3} placeholder="Deskripsi detail produk/jasa..." value={data.desc} onChange={e => update('desc', e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-foreground transition-colors text-sm resize-none" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Nilai Transaksi</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">Rp</span>
                    <input type="number" value={data.amount} onChange={e => update('amount', Number(e.target.value))} className="w-full h-12 pl-10 pr-4 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-foreground transition-colors text-sm" />
                  </div>
                  {data.amount > 0 && <p className="text-xs text-muted-foreground mt-1">Biaya platform: Rp {fmt(fee(data.amount))}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium mb-3 block">Durasi Escrow: <span className="text-primary font-bold">{data.days} hari</span></label>
                  <input type="range" min={1} max={30} value={data.days} onChange={e => update('days', Number(e.target.value))} className="w-full accent-primary" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>1 hari</span><span>30 hari</span></div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-3 block">Siapa yang menanggung biaya?</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[['seller', 'Penjual'], ['buyer', 'Pembeli'], ['split', 'Dibagi']].map(([val, label]) => (
                      <button key={val} type="button" onClick={() => update('feeSplit', val)} className={`py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${data.feeSplit === val ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'}`}>{label}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold mb-6">Pihak Lawan Transaksi</h2>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Email atau Username</label>
                  <input type="email" placeholder="penjual@email.com" value={data.counterEmail} onChange={e => update('counterEmail', e.target.value)} className="w-full h-12 px-4 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-foreground transition-colors text-sm" />
                  <p className="text-xs text-muted-foreground mt-1">Mereka akan menerima undangan via email</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Catatan (opsional)</label>
                  <textarea rows={4} placeholder="Pesan untuk pihak lawan..." value={data.note} onChange={e => update('note', e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-foreground transition-colors text-sm resize-none" />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold mb-6">Lampiran (Opsional)</h2>
                <div
                  onDrop={e => { e.preventDefault(); setDrag(false); const f = Array.from(e.dataTransfer.files).map(f => f.name); setFiles(p => [...p, ...f]); }}
                  onDragOver={e => { e.preventDefault(); setDrag(true); }}
                  onDragLeave={() => setDrag(false)}
                  className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${drag ? 'border-primary bg-primary/5' : 'border-border hover:border-primary hover:bg-primary/5'}`}
                >
                  <UploadSimple size={40} className="mx-auto mb-4 text-muted-foreground" weight="thin" />
                  <p className="font-semibold mb-1">Drag & drop file di sini</p>
                  <p className="text-sm text-muted-foreground mb-4">PNG, JPG, PDF hingga 10MB</p>
                  <button type="button" className="btn-secondary text-sm px-4 py-2">Pilih dari perangkat</button>
                </div>
                {files.length > 0 && (
                  <div className="space-y-2">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl text-sm">
                        <span>{f}</span>
                        <button onClick={() => setFiles(p => p.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive transition-colors"><X size={16} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold mb-6">Review & Konfirmasi</h2>
                <div className="bg-muted/50 rounded-2xl p-5 space-y-3 text-sm">
                  {[['Produk/Jasa', data.title || '—'], ['Nilai Transaksi', `Rp ${fmt(data.amount)}`], ['Biaya Platform (2.5%)', `Rp ${fmt(fee(data.amount))}`], ['Durasi', `${data.days} hari`], ['Pihak Lawan', data.counterEmail || '—']].map(([label, val]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-semibold">{val}</span>
                    </div>
                  ))}
                  <div className="border-t border-border pt-3 flex justify-between font-bold text-base">
                    <span>Total Pembayaran</span>
                    <span className="text-primary">Rp {fmt(data.amount + fee(data.amount))}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Dengan membuat transaksi, Anda menyetujui Syarat & Ketentuan Kahade.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className={`flex gap-3 mt-8 ${step > 0 ? '' : 'justify-end'}`}>
          {step > 0 && <button onClick={() => setStep(s => s - 1)} className="btn-secondary flex-1"><ArrowLeft size={16} /> Kembali</button>}
          <button onClick={() => step < steps.length - 1 ? setStep(s => s + 1) : null} className="btn-primary flex-1">
            {step === steps.length - 1 ? 'Buat Transaksi' : 'Lanjut'} {step < steps.length - 1 && <ArrowRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  </DashboardLayout>
  );
}
KAHADE_EOF
ok "DASHBOARD — CreateTransaction"

# DASHBOARD — Wallet
mkdir -p "$(dirname "$SRC/pages/dashboard/Wallet.tsx")"
cat > "$SRC/pages/dashboard/Wallet.tsx" << 'KAHADE_EOF'
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowUp, ArrowsLeftRight, CopySimple, Check, Clock } from '@phosphor-icons/react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { staggerContainer, staggerItem } from '@/lib/animations';

const txHistory = [
  { type: 'deposit', label: 'Deposit dari BCA', amount: '+Rp 1.000.000', date: '20 Feb 2026 · 14:23', color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
  { type: 'incoming', label: 'Dana cair dari #KHD-2449', amount: '+Rp 800.000', date: '19 Feb 2026 · 18:00', color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
  { type: 'outgoing', label: 'Escrow #KHD-2451', amount: '-Rp 5.200.000', date: '18 Feb 2026 · 11:05', color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
  { type: 'withdrawal', label: 'Penarikan ke BCA *1234', amount: '-Rp 2.000.000', date: '15 Feb 2026 · 10:00', color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
];

const filters = ['Semua', 'Deposit', 'Penarikan', 'Dana Masuk', 'Dana Keluar'];
const vaNumber = '7008 1234 5678 9012';

export default function Wallet() {
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [showDeposit, setShowDeposit] = useState(false);
  const [copied, setCopied] = useState(false);
  const [countdown] = useState('01:45:32');

  const copyVA = () => { navigator.clipboard.writeText(vaNumber.replace(/\s/g, '')); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <DashboardLayout>
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Dompet</h1>

      {/* Balance Card */}
      <motion.div variants={staggerContainer} initial="initial" animate="animate">
        <motion.div variants={staggerItem} className="bg-primary text-primary-foreground rounded-3xl p-8 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <p className="text-primary-foreground/60 text-sm mb-2">Saldo Dompet Anda</p>
          <p className="text-4xl font-black mb-6">Rp 2.500.000</p>
          <div className="flex gap-3 flex-wrap relative z-10">
            <button onClick={() => setShowDeposit(true)} className="flex items-center gap-2 bg-white text-primary px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-white/90 transition-colors">
              <ArrowDown size={18} /> Deposit
            </button>
            <button className="flex items-center gap-2 bg-white/10 border border-white/20 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-white/20 transition-colors">
              <ArrowUp size={18} /> Tarik
            </button>
            <button className="flex items-center gap-2 bg-white/10 border border-white/20 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-white/20 transition-colors">
              <ArrowsLeftRight size={18} /> Transfer
            </button>
          </div>
        </motion.div>

        {/* VA Box (shown after deposit clicked) */}
        {showDeposit && (
          <motion.div variants={staggerItem} className="card p-6 mb-6 border-primary/30 bg-primary/5">
            <p className="font-bold mb-4">Transfer ke Virtual Account BCA:</p>
            <div className="flex items-center justify-between bg-background border-2 border-border rounded-xl px-4 py-3 mb-3">
              <span className="text-xl font-black tracking-widest">{vaNumber}</span>
              <button onClick={copyVA} className="ml-4 flex items-center gap-1.5 text-sm text-primary font-semibold">
                {copied ? <Check size={16} /> : <CopySimple size={16} />} {copied ? 'Disalin!' : 'Salin'}
              </button>
            </div>
            <p className="text-sm font-semibold mb-1">Nominal TEPAT: <span className="text-primary">Rp 1.000.000</span></p>
            <p className="text-xs text-muted-foreground mb-3">(Jangan lebih atau kurang)</p>
            <div className="flex items-center gap-2 text-sm text-orange-600">
              <Clock size={16} /><span>Berlaku hingga: <strong>{countdown}</strong></span>
            </div>
          </motion.div>
        )}

        {/* Filter + History */}
        <motion.div variants={staggerItem}>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-4">
            {filters.map(f => (
              <button key={f} onClick={() => setActiveFilter(f)} className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeFilter === f ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}>{f}</button>
            ))}
          </div>
          <div className="card overflow-hidden">
            {txHistory.map((tx, i) => (
              <div key={i} className="flex items-center justify-between p-4 border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.color}`}>
                    {tx.type === 'deposit' || tx.type === 'incoming' ? <ArrowDown size={18} /> : <ArrowUp size={18} />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{tx.label}</p>
                    <p className="text-xs text-muted-foreground">{tx.date}</p>
                  </div>
                </div>
                <span className={`font-bold text-sm ${tx.amount.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{tx.amount}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  </DashboardLayout>
  );
}
KAHADE_EOF
ok "DASHBOARD — Wallet"

# DASHBOARD — Notifications
mkdir -p "$(dirname "$SRC/pages/dashboard/Notifications.tsx")"
cat > "$SRC/pages/dashboard/Notifications.tsx" << 'KAHADE_EOF'
import { useState } from 'react';
import { Bell, ShieldCheck, CreditCard, ArrowsClockwise, Warning, Info } from '@phosphor-icons/react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const tabs = ['Semua', 'Belum Dibaca', 'Transaksi', 'Keamanan', 'Sistem'];

const notifs = [
  { id: 1, icon: ShieldCheck, title: 'Transaksi #KHD-2451 dikonfirmasi', body: 'Dana Rp 5.200.000 akan dicairkan dalam 24 jam', time: '2 menit lalu', read: false, type: 'Transaksi', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
  { id: 2, icon: CreditCard, title: 'Deposit Rp 1.000.000 berhasil', body: 'Dana telah ditambahkan ke dompet Anda', time: '1 jam lalu', read: true, type: 'Transaksi', color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
  { id: 3, icon: ShieldCheck, title: 'KYC Anda telah disetujui', body: 'Akun Anda kini terverifikasi penuh', time: 'Kemarin', read: true, type: 'Keamanan', color: 'text-primary bg-primary/10' },
  { id: 4, icon: Warning, title: 'Sengketa #KHD-2435 diproses', body: 'Tim mediasi sedang meninjau kasus Anda', time: 'Kemarin', read: false, type: 'Transaksi', color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
  { id: 5, icon: Info, title: 'Update fitur baru tersedia', body: 'Kahade v2.1 hadir dengan peningkatan keamanan', time: '3 hari lalu', read: true, type: 'Sistem', color: 'text-muted-foreground bg-muted' },
];

export default function Notifications() {
  const [activeTab, setActiveTab] = useState('Semua');
  const [readAll, setReadAll] = useState(false);

  const filtered = notifs.filter(n => {
    if (activeTab === 'Semua') return true;
    if (activeTab === 'Belum Dibaca') return !n.read && !readAll;
    return n.type === activeTab;
  });

  return (
    <DashboardLayout>
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifikasi</h1>
        <button onClick={() => setReadAll(true)} className="text-sm text-primary hover:underline">Tandai semua dibaca</button>
      </div>

      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl mb-5 overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>{tab}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="py-24 text-center">
          <Bell size={48} className="text-muted-foreground/30 mx-auto mb-4" weight="thin" />
          <p className="font-semibold text-muted-foreground">Tidak ada notifikasi baru</p>
          <p className="text-sm text-muted-foreground mt-1">Anda akan mendapat notifikasi untuk transaksi dan update akun</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => {
            const Icon = n.icon;
            const isUnread = !n.read && !readAll;
            return (
              <div key={n.id} className={`card p-4 flex items-start gap-4 transition-colors ${isUnread ? 'border-primary/20 bg-primary/2' : ''}`}>
                {isUnread && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.color}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${isUnread ? 'font-bold' : 'font-semibold'}`}>{n.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{n.body}</p>
                  <p className="text-xs text-muted-foreground mt-1.5">{n.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  </DashboardLayout>
  );
}
KAHADE_EOF
ok "DASHBOARD — Notifications"

# DASHBOARD — Profile
mkdir -p "$(dirname "$SRC/pages/dashboard/Profile.tsx")"
cat > "$SRC/pages/dashboard/Profile.tsx" << 'KAHADE_EOF'
import { useState } from 'react';
import { Link } from 'wouter';
import { ShieldCheck, Warning, PencilSimple, CalendarBlank, Star } from '@phosphor-icons/react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const tabs = ['Info Pribadi', 'Keamanan', 'Notifikasi', 'Privasi'];

const kycStatus = 'verified'; // or 'pending'

export default function Profile() {
  const [activeTab, setActiveTab] = useState('Info Pribadi');

  return (
    <DashboardLayout>
    <div className="p-6 max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl font-black text-primary">A</div>
            <div>
              <h1 className="text-xl font-bold">Ahmad Rizki</h1>
              <p className="text-muted-foreground text-sm">ahmad@email.com</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><CalendarBlank size={12} /> Bergabung Jan 2024</span>
                <span className="flex items-center gap-1"><Star size={12} className="text-yellow-500" weight="fill" /> Level: Gold</span>
              </div>
            </div>
          </div>
          <button className="btn-secondary gap-2 text-sm"><PencilSimple size={16} /> Edit Profil</button>
        </div>

        {/* KYC Status */}
        <div className={`mt-5 rounded-xl p-4 border-2 flex items-center gap-4 ${kycStatus === 'verified' ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' : 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'}`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${kycStatus === 'verified' ? 'bg-green-600' : 'bg-yellow-500'} text-white`}>
            {kycStatus === 'verified' ? <ShieldCheck size={24} weight="fill" /> : <Warning size={24} weight="fill" />}
          </div>
          <div className="flex-1">
            <p className="font-bold">{kycStatus === 'verified' ? 'Identitas Terverifikasi' : 'Verifikasi Diperlukan'}</p>
            <p className="text-sm text-muted-foreground">{kycStatus === 'verified' ? 'Akun Anda telah terverifikasi penuh.' : 'Verifikasi KYC untuk transaksi tanpa batas.'}</p>
          </div>
          {kycStatus !== 'verified' && (
            <Link href="/kyc"><button className="btn-primary btn-sm text-sm">Verifikasi →</button></Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl mb-5 overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-1 ${activeTab === tab ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>{tab}</button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="card p-6">
        {activeTab === 'Info Pribadi' && (
          <div className="space-y-5">
            <h2 className="font-bold">Informasi Pribadi</h2>
            {[['Nama Lengkap', 'Ahmad Rizki', false], ['Email', 'ahmad@email.com', true], ['No. HP', '+62 812-XXXX-XXXX', true], ['Kota', 'Jakarta Selatan', false], ['Bio', '—', false]].map(([label, val, verified]) => (
              <div key={String(label)} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                  <p className="font-medium">{val}</p>
                </div>
                {verified && <span className="text-xs font-semibold text-green-600 flex items-center gap-1"><ShieldCheck size={12} /> Terverifikasi</span>}
              </div>
            ))}
          </div>
        )}
        {activeTab === 'Keamanan' && (
          <div className="space-y-5">
            <h2 className="font-bold">Keamanan Akun</h2>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="font-medium">Password</p>
                <p className="text-xs text-muted-foreground">Terakhir diubah: 3 bulan lalu</p>
              </div>
              <button className="btn-secondary text-sm">Ubah</button>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="font-medium">Autentikasi 2 Faktor</p>
                <p className="text-xs text-muted-foreground">Aktif via Google Authenticator</p>
              </div>
              <button className="btn-secondary text-sm">Kelola</button>
            </div>
            <Link href="/security"><button className="btn-ghost text-sm text-primary">Kelola keamanan lanjutan →</button></Link>
          </div>
        )}
        {activeTab === 'Notifikasi' && (
          <div className="space-y-4">
            <h2 className="font-bold mb-4">Preferensi Notifikasi</h2>
            {[['Transaksi baru', true, true, false], ['Dana masuk', true, true, false], ['Sengketa', true, true, true], ['Newsletter', false, false, false]].map(([label, email, push, sms]) => (
              <div key={String(label)} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <span className="text-sm">{label}</span>
                <div className="flex items-center gap-6 text-xs text-muted-foreground">
                  <span>Email <span className={email ? 'text-green-600 font-bold' : ''}>●</span></span>
                  <span>Push <span className={push ? 'text-green-600 font-bold' : ''}>●</span></span>
                  <span>SMS <span className={sms ? 'text-green-600 font-bold' : ''}>●</span></span>
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'Privasi' && (
          <div className="space-y-4">
            <h2 className="font-bold">Pengaturan Privasi</h2>
            <p className="text-sm text-muted-foreground">Kelola bagaimana data Anda digunakan di platform Kahade.</p>
            {[['Tampilkan profil publik', true], ['Izinkan pencarian berdasarkan email', false], ['Bagikan data anonim untuk peningkatan layanan', true]].map(([label, val]) => (
              <div key={String(label)} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <span className="text-sm">{label}</span>
                <div className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${val ? 'bg-primary' : 'bg-muted'}`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform m-0.5 ${val ? 'translate-x-5' : ''}`} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </DashboardLayout>
  );
}
KAHADE_EOF
ok "DASHBOARD — Profile"

# DASHBOARD — Settings
mkdir -p "$(dirname "$SRC/pages/dashboard/Settings.tsx")"
cat > "$SRC/pages/dashboard/Settings.tsx" << 'KAHADE_EOF'
import { useState } from 'react';
import { Sun, Moon, Globe, Clock, ShieldCheck, Bell, Lock, CreditCard, Code, Trash } from '@phosphor-icons/react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const sidebarTabs = ['Umum', 'Keamanan', 'Notifikasi', 'Privasi', 'Billing', 'API Keys'];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('Umum');
  const [darkMode, setDarkMode] = useState(false);

  return (
    <DashboardLayout>
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Pengaturan</h1>
      <div className="grid md:grid-cols-[200px_1fr] gap-6">
        {/* Sidebar */}
        <div className="space-y-1">
          {sidebarTabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>{tab}</button>
          ))}
        </div>

        {/* Content */}
        <div className="card p-6">
          {activeTab === 'Umum' && (
            <div className="space-y-6">
              <h2 className="font-bold text-lg">Pengaturan Umum</h2>
              <div className="space-y-4">
                {[
                  { label: 'Bahasa', value: 'Bahasa Indonesia', icon: Globe },
                  { label: 'Zona Waktu', value: 'WIB (UTC+7)', icon: Clock },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-center justify-between py-3 border-b border-border">
                    <div className="flex items-center gap-3">
                      <Icon size={18} className="text-muted-foreground" />
                      <div><p className="font-medium text-sm">{label}</p><p className="text-xs text-muted-foreground">{value}</p></div>
                    </div>
                    <select className="text-sm border border-border rounded-lg px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30">
                      <option>{value}</option>
                    </select>
                  </div>
                ))}
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    {darkMode ? <Moon size={18} className="text-muted-foreground" /> : <Sun size={18} className="text-muted-foreground" />}
                    <div><p className="font-medium text-sm">Tema</p><p className="text-xs text-muted-foreground">{darkMode ? 'Gelap' : 'Terang'}</p></div>
                  </div>
                  <div className="flex items-center gap-1 bg-muted p-1 rounded-full">
                    {[false, true].map(mode => (
                      <button key={String(mode)} onClick={() => setDarkMode(mode)} className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${darkMode === mode ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}>
                        {mode ? <Moon size={12} /> : <Sun size={12} />} {mode ? 'Gelap' : 'Terang'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button className="btn-primary">Simpan Perubahan</button>
            </div>
          )}

          {activeTab === 'Keamanan' && (
            <div className="space-y-5">
              <h2 className="font-bold text-lg">Keamanan Akun</h2>
              <div className="space-y-3">
                {[
                  { icon: Lock, title: 'Ubah Password', desc: 'Terakhir diubah 3 bulan lalu', btn: 'Ubah', color: '' },
                  { icon: ShieldCheck, title: 'Autentikasi 2 Faktor', desc: 'Aktif via Google Authenticator', btn: 'Kelola', color: 'text-green-600' },
                  { icon: Globe, title: 'Sesi Aktif', desc: '2 perangkat aktif', btn: 'Kelola', color: '' },
                ].map(({ icon: Icon, title, desc, btn, color }) => (
                  <div key={title} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Icon size={20} className={color || 'text-muted-foreground'} />
                      <div><p className="font-medium text-sm">{title}</p><p className="text-xs text-muted-foreground">{desc}</p></div>
                    </div>
                    <button className="btn-secondary text-sm">{btn}</button>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-5">
                <h3 className="font-semibold text-sm mb-3">Riwayat Login Terakhir</h3>
                {[['Chrome · Windows', 'Jakarta, ID', '5 menit lalu', true], ['Safari · iPhone', 'Jakarta, ID', '2 hari lalu', false]].map(([device, loc, time, current]) => (
                  <div key={String(device)} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                    <div><p className="text-sm font-medium">{device} {current && <span className="text-xs text-green-600 ml-1">● Aktif sekarang</span>}</p><p className="text-xs text-muted-foreground">{loc} · {time}</p></div>
                    {!current && <button className="text-xs text-destructive hover:underline">Cabut akses</button>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Notifikasi' && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg">Preferensi Notifikasi</h2>
              <div className="grid grid-cols-4 gap-2 text-xs text-center text-muted-foreground pb-2 border-b border-border">
                <span className="text-left text-sm font-medium text-foreground">Kategori</span>
                <span>Email</span><span>Push</span><span>SMS</span>
              </div>
              {[['Transaksi baru', true, true, false], ['Dana masuk', true, true, false], ['Sengketa', true, true, true], ['Update keamanan', true, false, true], ['Newsletter', false, false, false]].map(([label, ...vals]) => (
                <div key={String(label)} className="grid grid-cols-4 gap-2 items-center py-2.5 border-b border-border last:border-0">
                  <span className="text-sm">{label}</span>
                  {vals.map((v, i) => (
                    <div key={i} className="flex justify-center">
                      <div className={`w-9 h-5 rounded-full transition-colors cursor-pointer ${v ? 'bg-primary' : 'bg-muted'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform m-0.5 ${v ? 'translate-x-4' : ''}`} />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'Billing' && (
            <div className="space-y-5">
              <h2 className="font-bold text-lg">Billing & Langganan</h2>
              <div className="bg-muted/50 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <div><p className="font-bold">Paket Pemula</p><p className="text-sm text-muted-foreground">Gratis selamanya</p></div>
                  <span className="badge badge-success">Aktif</span>
                </div>
              </div>
              <button className="btn-primary">Upgrade ke Profesional</button>
            </div>
          )}

          {activeTab === 'API Keys' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg">API Keys</h2>
                <button className="btn-primary text-sm">+ Buat Key Baru</button>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-300">
                ⚠ Jangan bagikan API key Anda. Gunakan hanya di server-side.
              </div>
              <div className="card p-4">
                <div className="flex items-center justify-between">
                  <div><p className="font-medium text-sm">Production Key</p><p className="text-xs font-mono text-muted-foreground mt-1">kh_live_••••••••••••••••</p></div>
                  <div className="flex gap-2">
                    <button className="btn-secondary text-xs p-1.5"><Code size={14} /></button>
                    <button className="btn-secondary text-xs p-1.5 hover:border-destructive hover:text-destructive"><Trash size={14} /></button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Privasi' && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg">Pengaturan Privasi</h2>
              {[['Tampilkan profil publik', true], ['Izinkan pencarian berdasarkan email', false], ['Bagikan data anonim untuk peningkatan layanan', true]].map(([label, val]) => (
                <div key={String(label)} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <span className="text-sm">{label}</span>
                  <div className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${val ? 'bg-primary' : 'bg-muted'}`}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform m-0.5 ${val ? 'translate-x-5' : ''}`} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  </DashboardLayout>
  );
}
KAHADE_EOF
ok "DASHBOARD — Settings"

# DASHBOARD — KYCVerification
mkdir -p "$(dirname "$SRC/pages/dashboard/KYCVerification.tsx")"
cat > "$SRC/pages/dashboard/KYCVerification.tsx" << 'KAHADE_EOF'
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadSimple, Check, ArrowRight, ArrowLeft, CheckCircle, X } from '@phosphor-icons/react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const steps = ['Tipe ID', 'Upload Dokumen', 'Selfie', 'Info Tambahan', 'Review'];
const idTypes = [{ value: 'ktp', label: 'KTP', desc: 'Kartu Tanda Penduduk' }, { value: 'passport', label: 'Paspor', desc: 'Paspor Indonesia / Internasional' }, { value: 'sim', label: 'SIM', desc: 'Surat Izin Mengemudi' }];

function UploadZone({ label, tips }: { label: string; tips: string[] }) {
  const [file, setFile] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  return (
    <div>
      <p className="text-sm font-medium mb-2">{label}</p>
      {file ? (
        <div className="border-2 border-green-500 bg-green-50 dark:bg-green-900/20 rounded-2xl p-6 flex items-center gap-4">
          <CheckCircle size={32} className="text-green-600" weight="fill" />
          <div><p className="font-semibold text-green-700 dark:text-green-400">{file}</p><p className="text-xs text-muted-foreground">File diterima</p></div>
          <button onClick={() => setFile(null)} className="ml-auto text-muted-foreground hover:text-destructive"><X size={18} /></button>
        </div>
      ) : (
        <div
          onDrop={e => { e.preventDefault(); setDrag(false); setFile(e.dataTransfer.files[0]?.name || null); }}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${drag ? 'border-primary bg-primary/5' : 'border-border hover:border-primary hover:bg-primary/5'}`}
        >
          <UploadSimple size={36} className="mx-auto mb-3 text-muted-foreground" weight="thin" />
          <p className="font-semibold text-sm mb-1">Drag & drop atau klik untuk pilih</p>
          <p className="text-xs text-muted-foreground mb-4">JPG, PNG, PDF · Maks 5MB</p>
          <div className="text-xs text-left bg-muted rounded-xl p-3 space-y-1">
            {tips.map((t, i) => (
              <p key={i} className={`flex items-center gap-2 ${t.startsWith('✗') ? 'text-red-500' : 'text-muted-foreground'}`}>{t}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function KYCVerification() {
  const [step, setStep] = useState(0);
  const [idType, setIdType] = useState('ktp');
  const [address, setAddress] = useState('');
  const [purpose, setPurpose] = useState('');

  return (
    <DashboardLayout>
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Verifikasi Identitas</h1>
      <p className="text-muted-foreground text-sm mb-8">Verifikasi diperlukan untuk transaksi tanpa batas</p>

      {/* Step indicator */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto no-scrollbar">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-1 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs transition-all ${i < step ? 'bg-green-600 text-white' : i === step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {i < step ? <Check size={12} weight="bold" /> : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${i <= step ? 'text-foreground' : 'text-muted-foreground'}`}>{s}</span>
            </div>
            {i < steps.length - 1 && <div className={`w-6 h-[2px] rounded-full mx-1 ${i < step ? 'bg-green-600' : 'bg-muted'}`} />}
          </div>
        ))}
      </div>

      <div className="card p-8">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            {step === 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold mb-4">Pilih Tipe Identitas</h2>
                {idTypes.map(t => (
                  <button key={t.value} type="button" onClick={() => setIdType(t.value)} className={`w-full text-left p-4 rounded-xl border-2 transition-all ${idType === t.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${idType === t.value ? 'border-primary' : 'border-border'}`}>
                        {idType === t.value && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{t.label}</p>
                        <p className="text-xs text-muted-foreground">{t.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold mb-4">Upload Dokumen</h2>
                <UploadZone label="Foto KTP (Depan)" tips={['✓ Pastikan semua teks terbaca jelas', '✓ Pencahayaan cukup', '✓ Tidak ada pantulan atau bayangan', '✗ Foto tidak buram atau terpotong']} />
                {idType === 'ktp' && (
                  <UploadZone label="Foto KTP (Belakang)" tips={['✓ Semua teks terbaca', '✓ Tidak ada pantulan', '✗ Tidak terpotong']} />
                )}
              </div>
            )}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold mb-4">Foto Selfie</h2>
                <p className="text-sm text-muted-foreground">Foto selfie memegang KTP Anda agar kami bisa memverifikasi identitas.</p>
                <UploadZone label="Selfie dengan ID" tips={['✓ Wajah terlihat jelas', '✓ KTP terbaca', '✓ Pencahayaan cukup', '✗ Tidak menggunakan kacamata hitam atau masker']} />
              </div>
            )}
            {step === 3 && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold mb-4">Informasi Tambahan</h2>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Alamat sesuai KTP</label>
                  <textarea rows={3} value={address} onChange={e => setAddress(e.target.value)} placeholder="Jl. Contoh No. 1, Kota, Provinsi" className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-foreground transition-colors text-sm resize-none" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Tujuan Penggunaan</label>
                  <select value={purpose} onChange={e => setPurpose(e.target.value)} className="w-full h-12 px-4 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-foreground transition-colors text-sm appearance-none">
                    <option value="">Pilih tujuan...</option>
                    <option>Transaksi personal</option>
                    <option>Bisnis UMKM</option>
                    <option>Freelance</option>
                    <option>Investasi</option>
                  </select>
                </div>
              </div>
            )}
            {step === 4 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold mb-4">Review & Submit</h2>
                <div className="bg-muted/50 rounded-2xl p-5 space-y-3 text-sm">
                  {[['Tipe ID', idTypes.find(t => t.value === idType)?.label || '—'], ['Dokumen', 'Diupload ✓'], ['Selfie', 'Diupload ✓'], ['Alamat', address || '—'], ['Tujuan', purpose || '—']].map(([label, val]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium">{val}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-sm text-blue-800 dark:text-blue-300">
                  ℹ Proses verifikasi memakan waktu 24–48 jam. Kami akan mengirimkan notifikasi ke email Anda.
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className={`flex gap-3 mt-8 ${step > 0 ? '' : 'justify-end'}`}>
          {step > 0 && <button onClick={() => setStep(s => s - 1)} className="btn-secondary flex-1"><ArrowLeft size={16} /> Kembali</button>}
          <button onClick={() => step < steps.length - 1 ? setStep(s => s + 1) : null} className="btn-primary flex-1">
            {step === steps.length - 1 ? 'Kirim Verifikasi' : 'Lanjut'} {step < steps.length - 1 && <ArrowRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  </DashboardLayout>
  );
}
KAHADE_EOF
ok "DASHBOARD — KYCVerification"

# DASHBOARD — BankAccounts
mkdir -p "$(dirname "$SRC/pages/dashboard/BankAccounts.tsx")"
cat > "$SRC/pages/dashboard/BankAccounts.tsx" << 'KAHADE_EOF'
import { useState } from 'react';
import { Plus, DotsThree, Bank, X } from '@phosphor-icons/react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const accounts = [
  { bank: 'BCA', number: '**** 1234', name: 'Ahmad Rizki', isDefault: true },
  { bank: 'Mandiri', number: '**** 5678', name: 'Ahmad Rizki', isDefault: false },
];

export default function BankAccounts() {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ bank: '', number: '', name: '' });

  return (
    <DashboardLayout>
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Rekening Bank</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola rekening bank untuk penarikan dana</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary"><Plus size={18} /> Tambah Rekening</button>
      </div>

      {accounts.length > 0 ? (
        <div className="space-y-3">
          {accounts.map((acc, i) => (
            <div key={i} className={`card p-5 flex items-center justify-between ${acc.isDefault ? 'border-primary/30 bg-primary/2' : ''}`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
                  <Bank size={24} className="text-muted-foreground" weight="duotone" />
                </div>
                <div>
                  <p className="font-bold">{acc.bank} {acc.number}</p>
                  <p className="text-sm text-muted-foreground">a.n. {acc.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {acc.isDefault && <span className="badge badge-success text-xs">Default</span>}
                <button className="p-2 rounded-xl hover:bg-muted transition-colors"><DotsThree size={20} /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center">
          <Bank size={48} className="text-muted-foreground/30 mx-auto mb-4" weight="thin" />
          <p className="font-semibold text-muted-foreground">Belum ada rekening tersimpan</p>
          <p className="text-sm text-muted-foreground mt-1 mb-6">Tambahkan rekening untuk menarik dana</p>
          <button onClick={() => setShowAdd(true)} className="btn-primary"><Plus size={18} /> Tambah Rekening Bank</button>
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-background rounded-3xl p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-lg">Tambah Rekening Bank</h2>
              <button onClick={() => setShowAdd(false)} className="p-2 rounded-xl hover:bg-muted transition-colors"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Pilih Bank</label>
                <select value={form.bank} onChange={e => setForm({...form, bank: e.target.value})} className="w-full h-12 px-4 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-foreground text-sm appearance-none">
                  <option value="">Pilih bank...</option>
                  {['BCA', 'BRI', 'BNI', 'Mandiri', 'BSI', 'CIMB Niaga', 'Permata'].map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Nomor Rekening</label>
                <input type="text" placeholder="1234567890" value={form.number} onChange={e => setForm({...form, number: e.target.value})} className="w-full h-12 px-4 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-foreground text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Nama Pemilik Rekening</label>
                <input type="text" placeholder="Sesuai buku tabungan" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full h-12 px-4 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-foreground text-sm" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1">Batal</button>
                <button className="btn-primary flex-1">Simpan Rekening</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </DashboardLayout>
  );
}
KAHADE_EOF
ok "DASHBOARD — BankAccounts"

# DASHBOARD — AcceptTransactionInvite
mkdir -p "$(dirname "$SRC/pages/dashboard/AcceptTransactionInvite.tsx")"
cat > "$SRC/pages/dashboard/AcceptTransactionInvite.tsx" << 'KAHADE_EOF'
import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { transactionApi } from '@/lib/api';
import { toast } from 'sonner';

interface InviteTransaction {
  id: string;
  orderNumber: string;
  title: string;
  description: string;
  amount: number;
  status: string;
  initiator?: {
    id: string;
    username?: string;
  };
}


// FIX (v3.3): InviteSkeletonLoader — direferensikan tapi tidak pernah didefinisikan
function InviteSkeletonLoader() {
  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 animate-pulse">
        <div className="h-8 bg-neutral-200 rounded-xl w-3/4 mx-auto" />
        <div className="h-4 bg-neutral-200 rounded-lg w-1/2 mx-auto" />
        <div className="h-48 bg-neutral-200 rounded-2xl" />
        <div className="h-12 bg-neutral-200 rounded-xl" />
      </div>
    </div>
  );
}


// FIX (v3.3): declineInvite function — direferensikan tapi tidak pernah didefinisikan
async function declineInvite(token: string): Promise<void> {
  try {
    await fetch(`/api/v1/invitations/${token}/decline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Failed to decline invite:', err);
    throw err;
  }
}

export default function AcceptTransactionInvite() {
  const { token } = useParams<{ token: string }>();
  const [, setLocation] = useLocation();
  const [invite, setInvite] = useState<InviteTransaction | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvite = async () => {
      if (!token) {
        setError('Invite token tidak ditemukan.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await transactionApi.getInvite(token);
        setInvite(response.data);
      } catch (err: unknown) {
        const messageText =
          err?.response?.data?.message || 'Invite tidak ditemukan atau sudah kedaluwarsa.';
        setError(messageText);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvite();
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;
    setIsSubmitting(true);
    try {
      const response = await transactionApi.acceptInvite(token, message.trim() || undefined);
      toast.success('Transaksi berhasil diterima.');
      const transactionId = response.data?.id;
      if (transactionId) {
        setLocation(`/transactions/${transactionId}`);
      } else {
        setLocation('/transactions');
      }
    } catch (err: unknown) {
      const messageText =
        err?.response?.data?.message || 'Gagal menerima transaksi. Silakan coba lagi.';
      toast.error(messageText);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Terima Undangan" subtitle="Konfirmasi undangan transaksi Anda">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        {isLoading ? (
          <div className="text-gray-500 text-sm">Memuat detail undangan...</div>
        ) : error ? (
          <div className="text-red-500 text-sm">{error}</div>
        ) : invite ? (
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Judul</p>
              <h1 className="text-2xl font-semibold text-gray-900">{invite.title}</h1>
              <p className="mt-2 text-gray-600">{invite.description}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-gray-100 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">Nomor Order</p>
                <p className="mt-1 text-sm font-medium text-gray-900">{invite.orderNumber}</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">Nilai</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  Rp {Number(invite.amount || 0).toLocaleString('id-ID')}
                </p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Pesan untuk pembuat transaksi (opsional)
              </label>
              <Textarea
                className="mt-2"
                placeholder="Tulis pesan singkat..."
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleAccept} disabled={isSubmitting}>
                {isSubmitting ? 'Memproses...' : 'Terima Undangan'}
              </Button>
              <Button variant="outline" onClick={() => setLocation('/transactions')}>
                Lihat Daftar Transaksi
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-gray-500 text-sm">
            Undangan tidak dapat ditampilkan.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
KAHADE_EOF
ok "DASHBOARD — AcceptTransactionInvite"

# DASHBOARD — MFASettings
mkdir -p "$(dirname "$SRC/pages/dashboard/MFASettings.tsx")"
cat > "$SRC/pages/dashboard/MFASettings.tsx" << 'KAHADE_EOF'
import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
  ShieldCheck, DeviceMobile, EnvelopeSimple, Key, Check, X,
  Warning, QrCode, Copy, Eye, EyeSlash, Trash, Monitor, ArrowsClockwise,
  Lock
} from '@phosphor-icons/react';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface MFAStatus {
  enabled: boolean;
  methods: {
    totp: boolean;
    sms: boolean;
    email: boolean;
    webauthn: boolean;
  };
  preferredMethod: string | null;
  backupCodesRemaining: number;
}

interface TrustedDevice {
  id: string;
  deviceName: string | null;
  deviceType: string | null;
  browser: string | null;
  os: string | null;
  lastUsedAt: string;
  lastIpAddress: string | null;
  createdAt: string;
}

export default function MFASettings() {
  const [mfaStatus, setMfaStatus] = useState<MFAStatus | null>(null);
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);

  useEffect(() => {
    loadMFAStatus();
    loadTrustedDevices();
  }, []);

  const loadMFAStatus = async () => {
    try {
      const response = await api.get('/auth/mfa/status');
      setMfaStatus(response.data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const loadTrustedDevices = async () => {
    try {
      const response = await api.get('/auth/mfa/devices');
      const data = response?.data;
      let deviceList: TrustedDevice[] = [];
      if (data) {
        if (Array.isArray(data.devices)) deviceList = data.devices;
        else if (Array.isArray(data.data)) deviceList = data.data;
        else if (Array.isArray(data)) deviceList = data;
      }
      setTrustedDevices(deviceList);
    } catch (error) {
      setTrustedDevices([]);
    }
  };

  const revokeDevice = async (deviceId: string) => {
    if (!confirm('Apakah Anda yakin ingin mencabut kepercayaan perangkat ini?')) return;
    try {
      await api.delete(`/auth/mfa/devices/${deviceId}`);
      loadTrustedDevices();
    } catch (error) {}
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Keamanan Akun" subtitle="Kelola autentikasi dua faktor dan perangkat terpercaya">
      <div className="max-w-3xl mx-auto p-6 space-y-6">

        {/* MFA Status Card */}
        <div className="card p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${mfaStatus?.enabled ? 'bg-green-100 dark:bg-green-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'}`}>
                <ShieldCheck
                  size={24}
                  className={mfaStatus?.enabled ? 'text-green-600' : 'text-yellow-600'}
                  weight="duotone"
                />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Autentikasi Dua Faktor (2FA)</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {mfaStatus?.enabled
                    ? 'Akun Anda dilindungi dengan 2FA'
                    : 'Aktifkan 2FA untuk keamanan tambahan'}
                </p>
                {mfaStatus?.enabled && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Kode cadangan tersisa: <span className="font-semibold text-foreground">{mfaStatus.backupCodesRemaining}</span>
                  </p>
                )}
              </div>
            </div>
            {mfaStatus?.enabled ? (
              <button
                onClick={() => setShowDisableModal(true)}
                className="btn-ghost text-destructive border border-destructive/30 hover:bg-destructive/10 text-sm"
              >
                Nonaktifkan
              </button>
            ) : (
              <button
                onClick={() => setShowSetupModal(true)}
                className="btn-primary text-sm"
              >
                Aktifkan 2FA
              </button>
            )}
          </div>

          {/* MFA Methods */}
          {mfaStatus?.enabled && (
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Metode Aktif</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { key: 'totp', icon: QrCode, label: 'Aplikasi Autentikator (TOTP)', desc: 'Google Authenticator, Authy, dll' },
                  { key: 'sms', icon: DeviceMobile, label: 'SMS OTP', desc: 'Kode via pesan SMS' },
                  { key: 'email', icon: EnvelopeSimple, label: 'Email OTP', desc: 'Kode via email' },
                  { key: 'webauthn', icon: Key, label: 'Security Key (WebAuthn)', desc: 'YubiKey atau biometrik' },
                ].map(({ key, icon: Icon, label, desc }) => {
                  const enabled = mfaStatus?.methods?.[key as keyof typeof mfaStatus.methods];
                  return (
                    <div key={key} className={`flex items-center gap-3 p-3 rounded-xl border ${enabled ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' : 'border-border bg-muted/30'}`}>
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${enabled ? 'bg-green-100 dark:bg-green-900/40' : 'bg-muted'}`}>
                        <Icon size={18} className={enabled ? 'text-green-600' : 'text-muted-foreground'} weight="duotone" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{label}</p>
                        <p className="text-xs text-muted-foreground truncate">{desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${enabled ? 'bg-green-500' : 'bg-muted'}`}>
                        {enabled ? <Check size={12} className="text-white" weight="bold" /> : <X size={12} className="text-muted-foreground" weight="bold" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Trusted Devices */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-lg">Perangkat Terpercaya</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{trustedDevices.length} perangkat terdaftar</p>
            </div>
            <button
              onClick={loadTrustedDevices}
              className="btn-ghost p-2"
              aria-label="Refresh daftar perangkat"
            >
              <ArrowsClockwise size={18} />
            </button>
          </div>

          {trustedDevices.length === 0 ? (
            <div className="py-10 text-center">
              <Monitor size={40} className="text-muted-foreground/30 mx-auto mb-3" weight="thin" />
              <p className="text-sm text-muted-foreground">Tidak ada perangkat terpercaya</p>
            </div>
          ) : (
            <div className="space-y-3">
              {trustedDevices.map((device) => (
                <div key={device.id} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/30 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <Monitor size={20} className="text-muted-foreground" weight="duotone" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {device.deviceName || device.browser || 'Perangkat Tidak Dikenal'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {[device.os, device.browser].filter(Boolean).join(' · ')}
                      {device.lastIpAddress && ` · ${device.lastIpAddress}`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Terakhir digunakan: {new Date(device.lastUsedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <button
                    onClick={() => revokeDevice(device.id)}
                    className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                    aria-label="Cabut kepercayaan perangkat"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Security Tips */}
        <div className="card p-6 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
          <div className="flex items-start gap-3">
            <Lock size={20} className="text-blue-600 shrink-0 mt-0.5" weight="duotone" />
            <div>
              <h3 className="font-semibold text-sm text-blue-800 dark:text-blue-300">Tips Keamanan</h3>
              <ul className="mt-2 space-y-1 text-xs text-blue-700 dark:text-blue-400">
                <li>• Simpan kode cadangan di tempat yang aman</li>
                <li>• Gunakan aplikasi autentikator (TOTP) untuk keamanan terbaik</li>
                <li>• Cabut akses perangkat yang tidak dikenal</li>
                <li>• Jangan bagikan kode OTP kepada siapapun</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* TOTP Setup Modal */}
      {showSetupModal && (
        <TOTPSetupModal
          onClose={() => setShowSetupModal(false)}
          onSuccess={() => { setShowSetupModal(false); loadMFAStatus(); }}
        />
      )}

      {/* Disable MFA Modal */}
      {showDisableModal && (
        <DisableMFAModal
          onClose={() => setShowDisableModal(false)}
          onSuccess={() => { setShowDisableModal(false); loadMFAStatus(); }}
        />
      )}
    </DashboardLayout>
  );
}

function TOTPSetupModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [step, setStep] = useState<'qr' | 'verify' | 'backup'>('qr');
  const [qrCode, setQrCode] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verifyCode, setVerifyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCodes, setShowCodes] = useState(false);
  const [secret, setSecret] = useState('');

  useEffect(() => { initSetup(); }, []);

  const initSetup = async () => {
    try {
      const response = await api.post('/auth/mfa/totp/setup');
      setQrCode(response.data.qrCode);
      setSecret(response.data.secret);
    } catch { setError('Gagal memulai setup. Coba lagi.'); }
  };

  const confirmSetup = async () => {
    if (verifyCode.length !== 6) { setError('Kode harus 6 digit'); return; }
    setLoading(true); setError('');
    try {
      const response = await api.post('/auth/mfa/totp/confirm', { code: verifyCode });
      setBackupCodes(response.data.backupCodes || []);
      setStep('backup');
    } catch { setError('Kode tidak valid. Coba lagi.');
    } finally { setLoading(false); }
  };

  const copyBackupCodes = () => {
    const codes = Array.isArray(backupCodes) ? backupCodes : [];
    navigator.clipboard.writeText(codes.join('\n'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background rounded-2xl shadow-E3 w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-lg">
            {step === 'qr' ? 'Scan QR Code' : step === 'verify' ? 'Verifikasi Kode' : 'Kode Cadangan'}
          </h3>
          <button onClick={onClose} className="btn-ghost p-2"><X size={18} /></button>
        </div>

        {step === 'qr' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Scan QR code ini dengan aplikasi autentikator Anda (Google Authenticator, Authy, dll)</p>
            {qrCode ? (
              <div className="flex justify-center">
                <img src={qrCode} alt="QR Code 2FA" className="w-48 h-48 border border-border rounded-xl p-2" />
              </div>
            ) : (
              <div className="flex justify-center"><div className="w-48 h-48 bg-muted rounded-xl animate-pulse" /></div>
            )}
            {secret && (
              <div className="bg-muted rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Atau masukkan kode manual:</p>
                <p className="font-mono text-sm font-semibold tracking-wider">{secret}</p>
              </div>
            )}
            <button onClick={() => setStep('verify')} className="btn-primary w-full">Lanjutkan Verifikasi</button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Masukkan kode 6 digit dari aplikasi autentikator Anda</p>
            <input
              type="text"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="input text-center text-2xl tracking-widest font-mono w-full"
              autoFocus
            />
            {error && <p className="text-destructive text-sm text-center">{error}</p>}
            <div className="flex gap-3">
              <button onClick={() => setStep('qr')} className="btn-ghost flex-1">Kembali</button>
              <button onClick={confirmSetup} disabled={loading || verifyCode.length !== 6} className="btn-primary flex-1">
                {loading ? 'Memverifikasi...' : 'Verifikasi'}
              </button>
            </div>
          </div>
        )}

        {step === 'backup' && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
              <Warning size={18} className="text-yellow-600 shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-700 dark:text-yellow-400">Simpan kode cadangan ini di tempat aman. Kode ini hanya ditampilkan sekali.</p>
            </div>
            <div className={`relative bg-muted rounded-xl p-4 ${!showCodes ? 'filter blur-sm' : ''}`}>
              <div className="grid grid-cols-2 gap-2">
                {(Array.isArray(backupCodes) ? backupCodes : []).map((code, i) => (
                  <p key={i} className="font-mono text-sm text-center p-1">{code}</p>
                ))}
              </div>
            </div>
            {!showCodes && (
              <button onClick={() => setShowCodes(true)} className="btn-ghost w-full flex items-center justify-center gap-2">
                <Eye size={16} /> Tampilkan Kode Cadangan
              </button>
            )}
            <div className="flex gap-3">
              <button onClick={copyBackupCodes} className="btn-ghost flex-1 flex items-center justify-center gap-2">
                <Copy size={16} /> Salin
              </button>
              <button onClick={onSuccess} className="btn-primary flex-1">Selesai</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DisableMFAModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDisable = async () => {
    if (code.length !== 6) { setError('Masukkan kode 6 digit'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/auth/mfa/disable', { code });
      onSuccess();
    } catch { setError('Kode tidak valid. Coba lagi.');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background rounded-2xl shadow-E3 w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-lg text-destructive">Nonaktifkan 2FA</h3>
          <button onClick={onClose} className="btn-ghost p-2"><X size={18} /></button>
        </div>
        <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 mb-4">
          <Warning size={18} className="text-red-600 shrink-0 mt-0.5" />
          <p className="text-xs text-red-700 dark:text-red-400">Menonaktifkan 2FA akan mengurangi keamanan akun Anda secara signifikan.</p>
        </div>
        <p className="text-sm text-muted-foreground mb-3">Masukkan kode dari aplikasi autentikator untuk konfirmasi:</p>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          className="input text-center text-2xl tracking-widest font-mono w-full mb-2"
          autoFocus
        />
        {error && <p className="text-destructive text-sm text-center mb-3">{error}</p>}
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="btn-ghost flex-1">Batal</button>
          <button onClick={handleDisable} disabled={loading || code.length !== 6} className="flex-1 px-4 py-2 bg-destructive text-white rounded-xl font-medium hover:bg-destructive/90 disabled:opacity-50 transition-colors">
            {loading ? 'Menonaktifkan...' : 'Nonaktifkan 2FA'}
          </button>
        </div>
      </div>
    </div>
  );
}

KAHADE_EOF
ok "DASHBOARD — MFASettings"

# DASHBOARD — Messages
mkdir -p "$(dirname "$SRC/pages/dashboard/messaging/Messages.tsx")"
cat > "$SRC/pages/dashboard/messaging/Messages.tsx" << 'KAHADE_EOF'
import { useState } from 'react';
import { MagnifyingGlass, PaperclipHorizontal, PaperPlaneTilt } from '@phosphor-icons/react';

const conversations = [
  { id: 1, name: '@seller_081', preview: 'Sudah saya kirim via JNE', time: '2 jam lalu', unread: 1, tx: '#KHD-2451', active: true },
  { id: 2, name: 'Kahade Support', preview: 'Tiket #T-089 telah selesai', time: 'Kemarin', unread: 0, tx: 'Support', active: false },
  { id: 3, name: '@jasa_design', preview: 'File sudah saya upload', time: '3 hari lalu', unread: 0, tx: '#KHD-2449', active: false },
];

const messages = [
  { text: 'Barang sudah saya kirim via JNE', time: '19 Feb 09:15', own: false },
  { text: 'No resi: JNE-2024-XXXXX', time: '19 Feb 09:16', own: false },
  { text: 'Terima kasih, akan saya cek', time: '19 Feb 10:30', own: true },
  { text: 'Barang sudah sampai, kondisi baik 👍', time: '20 Feb 14:00', own: true },
];

export default function Messages() {
  const [activeConv, setActiveConv] = useState(1);
  const [msg, setMsg] = useState('');
  const conv = conversations.find(c => c.id === activeConv);

  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* Left — Conversation List */}
      <div className="w-72 border-r border-border flex flex-col shrink-0">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Cari percakapan..." className="w-full h-9 pl-9 pr-3 rounded-xl bg-muted text-sm focus:outline-none" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map(c => (
            <button key={c.id} onClick={() => setActiveConv(c.id)} className={`w-full text-left p-4 border-b border-border hover:bg-muted/50 transition-colors ${activeConv === c.id ? 'bg-muted/50' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${c.active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {c.name.charAt(1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      {c.active && <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />}
                      <p className="font-semibold text-sm truncate">{c.name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{c.tx}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground">{c.time}</p>
                  {c.unread > 0 && <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold mt-1">{c.unread}</span>}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 truncate pl-13">{c.preview}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Right — Chat Window */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm text-primary">
            {conv?.name.charAt(1).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-sm">{conv?.name}</p>
            <p className="text-xs text-muted-foreground">Transaksi {conv?.tx}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.own ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${m.own ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted text-foreground rounded-bl-sm'}`}>
                {m.text}
                <span className={`text-[0.625rem] block text-right mt-1 ${m.own ? 'opacity-60' : 'text-muted-foreground'}`}>{m.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border flex items-center gap-3">
          <button className="p-2 rounded-xl hover:bg-muted transition-colors shrink-0"><PaperclipHorizontal size={20} className="text-muted-foreground" /></button>
          <input type="text" value={msg} onChange={e => setMsg(e.target.value)} placeholder="Tulis pesan..." className="flex-1 h-10 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          <button className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 hover:bg-primary/90 transition-colors">
            <PaperPlaneTilt size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
KAHADE_EOF
ok "DASHBOARD — Messages"

step "ADMIN"
# ADMIN — AdminDashboard
mkdir -p "$(dirname "$SRC/pages/admin/AdminDashboard.tsx")"
cat > "$SRC/pages/admin/AdminDashboard.tsx" << 'KAHADE_EOF'
import { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import {
  Users, ArrowsLeftRight, CurrencyDollar, Warning,
  IdentificationCard, TrendUp, TrendDown, ArrowRight,
  CheckCircle, Clock, Eye, Download
} from '@phosphor-icons/react';
import AdminLayout from '@/components/layout/AdminLayout';
import { staggerContainer, staggerItem } from '@/lib/animations';

const metrics = [
  { icon: Users, label: 'Total Pengguna', value: '10.284', delta: '+284', positive: true },
  { icon: ArrowsLeftRight, label: 'Transaksi Aktif', value: '342', delta: '+18', positive: true },
  { icon: CurrencyDollar, label: 'Total Volume', value: 'Rp 52.4M', delta: '+Rp 2.1M', positive: true },
  { icon: IdentificationCard, label: 'KYC Pending', value: '47', delta: '+12', positive: false },
  { icon: Warning, label: 'Sengketa Aktif', value: '8', delta: '-3', positive: true },
  { icon: TrendUp, label: 'Revenue Hari Ini', value: 'Rp 8.2M', delta: '+12%', positive: true },
];

const recentTx = [
  { id: 'KHD-2451', title: 'Laptop ASUS ROG', buyer: 'ahmad@email.com', seller: 'seller_081', amount: 'Rp 5.200.000', status: 'active', label: 'Aktif' },
  { id: 'KHD-2450', title: 'iPhone 15 Pro', buyer: 'budi@email.com', seller: 'store@email.com', amount: 'Rp 14.500.000', status: 'completed', label: 'Selesai' },
  { id: 'KHD-2449', title: 'Jasa Logo Design', buyer: 'sari@email.com', seller: 'designer@email.com', amount: 'Rp 800.000', status: 'completed', label: 'Selesai' },
  { id: 'KHD-2448', title: 'Kamera Sony A7', buyer: 'rizki@email.com', seller: 'camera@email.com', amount: 'Rp 18.000.000', status: 'dispute', label: 'Sengketa' },
  { id: 'KHD-2447', title: 'MacBook Air M2', buyer: 'maya@email.com', seller: 'apple@email.com', amount: 'Rp 15.000.000', status: 'pending', label: 'Menunggu' },
];

const pendingActions = [
  { label: '47 verifikasi KYC menunggu', href: '/admin/kyc', emoji: '✓', color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' },
  { label: '12 penarikan pending', href: '/admin/withdrawals', emoji: '↓', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
  { label: '8 sengketa perlu tindakan', href: '/admin/disputes', emoji: '⚠', color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
];

const statusCls: Record<string, string> = {
  active: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  dispute: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function AdminDashboard() {
  return (
    <AdminLayout title="Dashboard" subtitle="Ikhtisar platform Kahade">
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">

        <motion.div variants={staggerItem} className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="card p-4 hover:shadow-E3 transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon size={18} className="text-primary" weight="duotone" />
                  </div>
                  <span className={`text-xs font-bold flex items-center gap-0.5 ${m.positive ? 'text-green-600' : 'text-red-600'}`}>
                    {m.positive ? <TrendUp size={11} /> : <TrendDown size={11} />}{m.delta}
                  </span>
                </div>
                <p className="text-xl font-black">{m.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{m.label}</p>
              </div>
            );
          })}
        </motion.div>

        <motion.div variants={staggerItem} className="grid lg:grid-cols-[1fr_300px] gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold">Volume Transaksi</h2>
                <p className="text-xs text-muted-foreground">30 hari terakhir</p>
              </div>
              <select className="text-xs border border-border rounded-lg px-2 py-1.5 bg-background">
                <option>30 hari</option><option>7 hari</option><option>90 hari</option>
              </select>
            </div>
            <div className="flex items-end gap-1 h-40 px-2">
              {[40,55,35,70,60,80,65,90,75,85,95,70,88,92,78,84,96,88,94,80,92,85,98,88,95,90,97,88,94,100].map((h, i) => (
                <div key={i} className="bg-primary/30 hover:bg-primary/60 rounded-t-sm flex-1 transition-colors cursor-pointer" style={{ height: `${h}%` }} title={`Hari ${i+1}`} />
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-bold mb-4">Aksi Diperlukan</h2>
            <div className="space-y-3">
              {pendingActions.map((a) => (
                <Link key={a.label} href={a.href}>
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${a.color}`}>{a.emoji}</div>
                    <p className="text-sm flex-1">{a.label}</p>
                    <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div variants={staggerItem} className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-bold">Transaksi Terbaru</h2>
            <Link href="/admin/transactions">
              <button className="text-sm text-primary hover:underline flex items-center gap-1">Lihat semua <ArrowRight size={14} /></button>
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b border-border">
              <tr>{['ID','Transaksi','Pembeli','Penjual','Nilai','Status',''].map(h => <th key={h} className="px-4 py-3 text-left text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentTx.map((tx) => (
                <tr key={tx.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{tx.id}</td>
                  <td className="px-4 py-3 font-semibold">{tx.title}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{tx.buyer}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{tx.seller}</td>
                  <td className="px-4 py-3 font-semibold">{tx.amount}</td>
                  <td className="px-4 py-3"><span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full ${statusCls[tx.status]}`}>{tx.label}</span></td>
                  <td className="px-4 py-3"><button className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-muted transition-all"><Eye size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

      </motion.div>
    </AdminLayout>
  );
}
KAHADE_EOF
ok "ADMIN — AdminDashboard"

# ADMIN — AdminUsers
mkdir -p "$(dirname "$SRC/pages/admin/AdminUsers.tsx")"
cat > "$SRC/pages/admin/AdminUsers.tsx" << 'KAHADE_EOF'
import { useState } from 'react';
import { MagnifyingGlass, FunnelSimple, Download, Eye, DotsThree } from '@phosphor-icons/react';
import AdminLayout from '@/components/layout/AdminLayout';

const users = [
  { id: 'U-001', name: 'Ahmad Rizki', email: 'ahmad@email.com', kyc: 'verified', status: 'active', joined: '15 Jan 2025', txCount: 47, volume: 'Rp 85.2M' },
  { id: 'U-002', name: 'Sari Dewi', email: 'sari@email.com', kyc: 'pending', status: 'active', joined: '12 Jan 2025', txCount: 12, volume: 'Rp 22.5M' },
  { id: 'U-003', name: 'Budi Santoso', email: 'budi@email.com', kyc: 'verified', status: 'suspended', joined: '8 Jan 2025', txCount: 5, volume: 'Rp 8.1M' },
  { id: 'U-004', name: 'Maya Putri', email: 'maya@email.com', kyc: 'rejected', status: 'active', joined: '5 Jan 2025', txCount: 28, volume: 'Rp 41.3M' },
  { id: 'U-005', name: 'Rizki Fadillah', email: 'rizki@email.com', kyc: 'verified', status: 'active', joined: '2 Jan 2025', txCount: 63, volume: 'Rp 124.7M' },
];

const kycCls: Record<string,string> = {
  verified: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};
const statusCls: Record<string,string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  suspended: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('Semua');
  const tabs = ['Semua', 'Aktif', 'Suspended', 'KYC Pending'];

  const filtered = users.filter(u =>
    (tab === 'Semua' || (tab === 'Aktif' && u.status === 'active') || (tab === 'Suspended' && u.status === 'suspended') || (tab === 'KYC Pending' && u.kyc === 'pending')) &&
    (!search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.includes(search))
  );

  return (
    <AdminLayout title="Manajemen Pengguna" subtitle="Kelola semua pengguna platform">
      <div className="space-y-4">
        <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit">
          {tabs.map(t => <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{t}</button>)}
        </div>
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
            <div className="relative">
              <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari pengguna..." className="pl-9 pr-4 py-2 rounded-xl border border-border text-sm bg-background focus:outline-none w-64" />
            </div>
            <div className="flex gap-2">
              <button className="btn-secondary gap-2 text-sm px-3 py-2"><FunnelSimple size={15} /> Filter</button>
              <button className="btn-secondary gap-2 text-sm px-3 py-2"><Download size={15} /> Export</button>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/20">
              <tr>{['ID','Pengguna','KYC','Status','Bergabung','Transaksi','Volume',''].map(h => <th key={h} className="px-4 py-3 text-left text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{u.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{u.name.charAt(0)}</div>
                      <div><p className="font-semibold leading-none">{u.name}</p><p className="text-xs text-muted-foreground mt-0.5">{u.email}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full capitalize ${kycCls[u.kyc]}`}>{u.kyc}</span></td>
                  <td className="px-4 py-3"><span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full capitalize ${statusCls[u.status]}`}>{u.status}</span></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{u.joined}</td>
                  <td className="px-4 py-3 font-semibold text-center">{u.txCount}</td>
                  <td className="px-4 py-3 font-semibold">{u.volume}</td>
                  <td className="px-4 py-3"><button className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-muted transition-all"><DotsThree size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between px-5 py-3 border-t border-border text-xs text-muted-foreground">
            <span>Menampilkan {filtered.length} dari {users.length} pengguna</span>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
KAHADE_EOF
ok "ADMIN — AdminUsers"

# ADMIN — AdminTransactions
mkdir -p "$(dirname "$SRC/pages/admin/AdminTransactions.tsx")"
cat > "$SRC/pages/admin/AdminTransactions.tsx" << 'KAHADE_EOF'
import { useState } from 'react';
import { MagnifyingGlass, FunnelSimple, Download, Eye } from '@phosphor-icons/react';
import AdminLayout from '@/components/layout/AdminLayout';

const transactions = [
  { id: 'KHD-2451', title: 'Laptop ASUS ROG', buyer: 'ahmad@email.com', seller: 'seller_081', amount: 'Rp 5.200.000', fee: 'Rp 130.000', status: 'active', label: 'Aktif', date: '18 Feb 2026' },
  { id: 'KHD-2450', title: 'iPhone 15 Pro', buyer: 'budi@email.com', seller: 'iphone_store', amount: 'Rp 14.500.000', fee: 'Rp 362.500', status: 'completed', label: 'Selesai', date: '17 Feb 2026' },
  { id: 'KHD-2449', title: 'Jasa Logo Design', buyer: 'sari@email.com', seller: 'jasa_design', amount: 'Rp 800.000', fee: 'Rp 20.000', status: 'completed', label: 'Selesai', date: '16 Feb 2026' },
  { id: 'KHD-2448', title: 'Kamera Sony A7', buyer: 'rizki@email.com', seller: 'camera_store', amount: 'Rp 18.000.000', fee: 'Rp 450.000', status: 'dispute', label: 'Sengketa', date: '15 Feb 2026' },
  { id: 'KHD-2447', title: 'MacBook Air M2', buyer: 'maya@email.com', seller: 'mac_seller', amount: 'Rp 15.000.000', fee: 'Rp 375.000', status: 'pending', label: 'Menunggu', date: '14 Feb 2026' },
  { id: 'KHD-2446', title: 'Jasa Web Dev', buyer: 'dito@email.com', seller: 'webdev_pro', amount: 'Rp 8.000.000', fee: 'Rp 200.000', status: 'cancelled', label: 'Dibatalkan', date: '13 Feb 2026' },
];

const statusCls: Record<string,string> = {
  active: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  dispute: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  cancelled: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400',
};

export default function AdminTransactions() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('Semua');
  const tabs = ['Semua', 'Aktif', 'Selesai', 'Sengketa', 'Pending', 'Dibatalkan'];
  const labelMap: Record<string,string> = { Aktif: 'active', Selesai: 'completed', Sengketa: 'dispute', Pending: 'pending', Dibatalkan: 'cancelled' };
  const filtered = transactions.filter(t => (tab === 'Semua' || t.status === labelMap[tab]) && (!search || t.id.toLowerCase().includes(search.toLowerCase()) || t.title.toLowerCase().includes(search.toLowerCase())));

  return (
    <AdminLayout title="Manajemen Transaksi" subtitle="Monitor semua transaksi platform">
      <div className="space-y-4">
        <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit overflow-x-auto">
          {tabs.map(t => <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${tab === t ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{t}</button>)}
        </div>
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
            <div className="relative">
              <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari transaksi..." className="pl-9 pr-4 py-2 rounded-xl border border-border text-sm bg-background focus:outline-none w-64" />
            </div>
            <div className="flex gap-2">
              <button className="btn-secondary gap-2 text-sm px-3 py-2"><FunnelSimple size={15} /> Filter</button>
              <button className="btn-secondary gap-2 text-sm px-3 py-2"><Download size={15} /> Export</button>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/20">
              <tr>{['ID','Transaksi','Pembeli','Penjual','Nilai','Biaya','Status','Tanggal',''].map(h => <th key={h} className="px-4 py-3 text-left text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(tx => (
                <tr key={tx.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-4 py-3 font-mono text-xs">{tx.id}</td>
                  <td className="px-4 py-3 font-semibold max-w-[140px] truncate">{tx.title}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{tx.buyer}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{tx.seller}</td>
                  <td className="px-4 py-3 font-semibold">{tx.amount}</td>
                  <td className="px-4 py-3 text-green-600 font-semibold">{tx.fee}</td>
                  <td className="px-4 py-3"><span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full ${statusCls[tx.status]}`}>{tx.label}</span></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{tx.date}</td>
                  <td className="px-4 py-3"><button className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-muted transition-all"><Eye size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t border-border text-xs text-muted-foreground">Menampilkan {filtered.length} dari {transactions.length} transaksi</div>
        </div>
      </div>
    </AdminLayout>
  );
}
KAHADE_EOF
ok "ADMIN — AdminTransactions"

# ADMIN — AdminKYC
mkdir -p "$(dirname "$SRC/pages/admin/AdminKYC.tsx")"
cat > "$SRC/pages/admin/AdminKYC.tsx" << 'KAHADE_EOF'
import { useState } from 'react';
import { MagnifyingGlass, CheckCircle, X, Eye, Clock, IdentificationCard } from '@phosphor-icons/react';
import AdminLayout from '@/components/layout/AdminLayout';

const submissions = [
  { id: 'KYC-001', user: 'Ahmad Rizki', email: 'ahmad@email.com', type: 'KTP', submitted: '20 Feb 2026 09:15', status: 'pending', avatar: 'A' },
  { id: 'KYC-002', user: 'Sari Dewi', email: 'sari@email.com', type: 'Paspor', submitted: '20 Feb 2026 08:30', status: 'pending', avatar: 'S' },
  { id: 'KYC-003', user: 'Budi Santoso', email: 'budi@email.com', type: 'KTP', submitted: '19 Feb 2026 17:45', status: 'approved', avatar: 'B' },
  { id: 'KYC-004', user: 'Maya Putri', email: 'maya@email.com', type: 'SIM', submitted: '19 Feb 2026 14:20', status: 'rejected', avatar: 'M' },
  { id: 'KYC-005', user: 'Rizki F.', email: 'rizki@email.com', type: 'KTP', submitted: '18 Feb 2026 11:00', status: 'pending', avatar: 'R' },
];

const statusCls: Record<string,string> = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};
const statusLabel: Record<string,string> = { pending: 'Pending', approved: 'Disetujui', rejected: 'Ditolak' };

export default function AdminKYC() {
  const [tab, setTab] = useState('Semua');
  const [search, setSearch] = useState('');
  const tabs = ['Semua', 'Pending', 'Disetujui', 'Ditolak'];
  const tabMap: Record<string,string> = { Pending: 'pending', Disetujui: 'approved', Ditolak: 'rejected' };
  const filtered = submissions.filter(s => (tab === 'Semua' || s.status === tabMap[tab]) && (!search || s.user.toLowerCase().includes(search.toLowerCase())));
  const pending = submissions.filter(s => s.status === 'pending').length;

  return (
    <AdminLayout title="Verifikasi KYC" subtitle="Review dan proses pengajuan identitas">
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-4">
          {[['Pending', pending, 'yellow'], ['Disetujui Hari Ini', 12, 'green'], ['Ditolak Hari Ini', 3, 'red']].map(([label, val, c]) => (
            <div key={String(label)} className="card p-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c === 'green' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : c === 'yellow' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30' : 'bg-red-100 text-red-600 dark:bg-red-900/30'}`}><IdentificationCard size={20} weight="duotone" /></div>
              <p className="text-2xl font-black">{val}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit">
          {tabs.map(t => <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{t}</button>)}
        </div>
        <div className="card overflow-hidden">
          <div className="flex items-center px-5 py-4 border-b border-border bg-muted/30">
            <div className="relative">
              <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari pengguna..." className="pl-9 pr-4 py-2 rounded-xl border border-border text-sm bg-background focus:outline-none w-64" />
            </div>
          </div>
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/20">
              <tr>{['ID','Pengguna','Tipe ID','Diajukan','Status','Aksi'].map(h => <th key={h} className="px-4 py-3 text-left text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">{s.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{s.avatar}</div>
                      <div><p className="font-semibold leading-none">{s.user}</p><p className="text-xs text-muted-foreground">{s.email}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className="text-xs bg-muted px-2 py-0.5 rounded-full font-medium">{s.type}</span></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{s.submitted}</td>
                  <td className="px-4 py-3"><span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full ${statusCls[s.status]}`}>{statusLabel[s.status]}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Eye size={14} /></button>
                      {s.status === 'pending' && <>
                        <button className="p-1.5 rounded-lg hover:bg-green-100 text-green-600 transition-colors"><CheckCircle size={14} weight="fill" /></button>
                        <button className="p-1.5 rounded-lg hover:bg-red-100 text-red-600 transition-colors"><X size={14} weight="bold" /></button>
                      </>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
KAHADE_EOF
ok "ADMIN — AdminKYC"

# ADMIN — AdminDisputes
mkdir -p "$(dirname "$SRC/pages/admin/AdminDisputes.tsx")"
cat > "$SRC/pages/admin/AdminDisputes.tsx" << 'KAHADE_EOF'
import { useState } from 'react';
import { Eye, Warning, Clock, CheckCircle } from '@phosphor-icons/react';
import AdminLayout from '@/components/layout/AdminLayout';

const disputes = [
  { id: 'D-089', tx: 'KHD-2448', title: 'Kamera Sony A7', buyer: 'rizki@email.com', seller: 'camera_store', amount: 'Rp 18.000.000', reason: 'Barang tidak sesuai deskripsi', status: 'open', priority: 'high', opened: '18 Feb 2026' },
  { id: 'D-088', tx: 'KHD-2440', title: 'Jasa Video Editing', buyer: 'dito@email.com', seller: 'editor_pro', amount: 'Rp 2.500.000', reason: 'Pekerjaan tidak selesai tepat waktu', status: 'reviewing', priority: 'medium', opened: '15 Feb 2026' },
  { id: 'D-087', tx: 'KHD-2430', title: 'MacBook Pro 14', buyer: 'hana@email.com', seller: 'mac_store', amount: 'Rp 28.000.000', reason: 'Barang cacat saat diterima', status: 'resolved', priority: 'high', opened: '12 Feb 2026' },
  { id: 'D-086', tx: 'KHD-2425', title: 'Jasa Desain Interior', buyer: 'andi@email.com', seller: 'interior_pro', amount: 'Rp 12.000.000', reason: 'Kualitas di bawah ekspektasi', status: 'open', priority: 'low', opened: '10 Feb 2026' },
];

const statusCls: Record<string,string> = {
  open: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  reviewing: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  resolved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};
const statusLabel: Record<string,string> = { open: 'Terbuka', reviewing: 'Ditinjau', resolved: 'Selesai' };
const priorityCls: Record<string,string> = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

export default function AdminDisputes() {
  const [tab, setTab] = useState('Semua');
  const tabs = ['Semua', 'Terbuka', 'Ditinjau', 'Selesai'];
  const tabMap: Record<string,string> = { Terbuka: 'open', Ditinjau: 'reviewing', Selesai: 'resolved' };
  const filtered = disputes.filter(d => tab === 'Semua' || d.status === tabMap[tab]);

  return (
    <AdminLayout title="Manajemen Sengketa" subtitle="Review dan selesaikan sengketa pengguna">
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Terbuka', value: disputes.filter(d => d.status === 'open').length, icon: Warning, cls: 'bg-red-100 text-red-600 dark:bg-red-900/30' },
            { label: 'Ditinjau', value: disputes.filter(d => d.status === 'reviewing').length, icon: Clock, cls: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30' },
            { label: 'Selesai Bulan Ini', value: 24, icon: CheckCircle, cls: 'bg-green-100 text-green-600 dark:bg-green-900/30' },
          ].map(({ label, value, icon: Icon, cls }) => (
            <div key={label} className="card p-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${cls}`}><Icon size={20} weight="duotone" /></div>
              <p className="text-2xl font-black">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit">
          {tabs.map(t => <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{t}</button>)}
        </div>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/20">
              <tr>{['ID','Transaksi','Alasan','Pembeli','Penjual','Nilai','Prioritas','Status','Dibuka',''].map(h => <th key={h} className="px-4 py-3 text-left text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(d => (
                <tr key={d.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-4 py-3 font-mono text-xs">{d.id}</td>
                  <td className="px-4 py-3"><p className="font-semibold text-xs">{d.title}</p><p className="text-[0.65rem] text-muted-foreground">{d.tx}</p></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-[150px] truncate">{d.reason}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{d.buyer}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{d.seller}</td>
                  <td className="px-4 py-3 font-semibold text-xs">{d.amount}</td>
                  <td className="px-4 py-3"><span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full capitalize ${priorityCls[d.priority]}`}>{d.priority}</span></td>
                  <td className="px-4 py-3"><span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full ${statusCls[d.status]}`}>{statusLabel[d.status]}</span></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{d.opened}</td>
                  <td className="px-4 py-3"><button className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-muted transition-all"><Eye size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
KAHADE_EOF
ok "ADMIN — AdminDisputes"

# ADMIN — AdminWithdrawals
mkdir -p "$(dirname "$SRC/pages/admin/AdminWithdrawals.tsx")"
cat > "$SRC/pages/admin/AdminWithdrawals.tsx" << 'KAHADE_EOF'
import { useState } from 'react';
import { Download, Eye, CheckCircle, X, ArrowDown } from '@phosphor-icons/react';
import AdminLayout from '@/components/layout/AdminLayout';

const withdrawals = [
  { id: 'WD-201', user: 'Ahmad Rizki', email: 'ahmad@email.com', bank: 'BCA *1234', amount: 'Rp 2.000.000', status: 'pending', requested: '20 Feb 2026 14:00' },
  { id: 'WD-200', user: 'Sari Dewi', email: 'sari@email.com', bank: 'Mandiri *5678', amount: 'Rp 5.500.000', status: 'processing', requested: '20 Feb 2026 11:30' },
  { id: 'WD-199', user: 'Budi Santoso', email: 'budi@email.com', bank: 'BRI *9012', amount: 'Rp 850.000', status: 'completed', requested: '19 Feb 2026 16:45' },
  { id: 'WD-198', user: 'Rizki F.', email: 'rizki@email.com', bank: 'BCA *3456', amount: 'Rp 12.000.000', status: 'completed', requested: '19 Feb 2026 09:00' },
  { id: 'WD-197', user: 'Maya Putri', email: 'maya@email.com', bank: 'BNI *7890', amount: 'Rp 3.200.000', status: 'rejected', requested: '18 Feb 2026 15:20' },
];
const statusCls: Record<string,string> = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};
const statusLabel: Record<string,string> = { pending: 'Pending', processing: 'Diproses', completed: 'Selesai', rejected: 'Ditolak' };

export default function AdminWithdrawals() {
  const [tab, setTab] = useState('Semua');
  const tabs = ['Semua', 'Pending', 'Diproses', 'Selesai', 'Ditolak'];
  const tabMap: Record<string,string> = { Pending: 'pending', Diproses: 'processing', Selesai: 'completed', Ditolak: 'rejected' };
  const filtered = withdrawals.filter(w => tab === 'Semua' || w.status === tabMap[tab]);

  return (
    <AdminLayout title="Manajemen Penarikan" subtitle="Proses permintaan penarikan dana pengguna">
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Pending', value: withdrawals.filter(w => w.status === 'pending').length, cls: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30' },
            { label: 'Diproses', value: withdrawals.filter(w => w.status === 'processing').length, cls: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' },
            { label: 'Selesai Hari Ini', value: 8, cls: 'bg-green-100 text-green-600 dark:bg-green-900/30' },
          ].map(({ label, value, cls }) => (
            <div key={label} className="card p-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${cls}`}><ArrowDown size={20} weight="duotone" /></div>
              <p className="text-2xl font-black">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit">
          {tabs.map(t => <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{t}</button>)}
        </div>
        <div className="card overflow-hidden">
          <div className="flex justify-end px-5 py-4 border-b border-border bg-muted/30">
            <button className="btn-secondary gap-2 text-sm px-3 py-2"><Download size={15} /> Export</button>
          </div>
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/20">
              <tr>{['ID','Pengguna','Bank','Jumlah','Status','Diminta','Aksi'].map(h => <th key={h} className="px-4 py-3 text-left text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(w => (
                <tr key={w.id} className="hover:bg-muted/30 group">
                  <td className="px-4 py-3 font-mono text-xs">{w.id}</td>
                  <td className="px-4 py-3"><p className="font-semibold">{w.user}</p><p className="text-xs text-muted-foreground">{w.email}</p></td>
                  <td className="px-4 py-3 text-xs">{w.bank}</td>
                  <td className="px-4 py-3 font-bold">{w.amount}</td>
                  <td className="px-4 py-3"><span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full ${statusCls[w.status]}`}>{statusLabel[w.status]}</span></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{w.requested}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 rounded-lg hover:bg-muted"><Eye size={14} /></button>
                      {w.status === 'pending' && <>
                        <button className="p-1.5 rounded-lg hover:bg-green-100 text-green-600"><CheckCircle size={14} weight="fill" /></button>
                        <button className="p-1.5 rounded-lg hover:bg-red-100 text-red-600"><X size={14} weight="bold" /></button>
                      </>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
KAHADE_EOF
ok "ADMIN — AdminWithdrawals"

# ADMIN — AdminDeposits
mkdir -p "$(dirname "$SRC/pages/admin/AdminDeposits.tsx")"
cat > "$SRC/pages/admin/AdminDeposits.tsx" << 'KAHADE_EOF'
import { Download, Eye, ArrowDown } from '@phosphor-icons/react';
import AdminLayout from '@/components/layout/AdminLayout';

const deposits = [
  { id: 'DEP-501', user: 'Ahmad Rizki', method: 'BCA Virtual Account', amount: 'Rp 1.000.000', status: 'completed', date: '20 Feb 2026 14:23' },
  { id: 'DEP-500', user: 'Sari Dewi', method: 'QRIS', amount: 'Rp 500.000', status: 'pending', date: '20 Feb 2026 13:10' },
  { id: 'DEP-499', user: 'Budi Santoso', method: 'Mandiri Virtual Account', amount: 'Rp 3.000.000', status: 'completed', date: '19 Feb 2026 18:00' },
  { id: 'DEP-498', user: 'Rizki F.', method: 'BRI Virtual Account', amount: 'Rp 10.000.000', status: 'failed', date: '19 Feb 2026 10:30' },
  { id: 'DEP-497', user: 'Maya Putri', method: 'QRIS', amount: 'Rp 750.000', status: 'completed', date: '18 Feb 2026 09:15' },
];
const statusCls: Record<string,string> = {
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};
const statusLabel: Record<string,string> = { completed: 'Berhasil', pending: 'Pending', failed: 'Gagal' };

export default function AdminDeposits() {
  return (
    <AdminLayout title="Manajemen Deposit" subtitle="Monitor semua deposit masuk ke platform">
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Hari Ini', value: 'Rp 14.5M', cls: 'bg-green-100 text-green-600 dark:bg-green-900/30' },
            { label: 'Pending', value: deposits.filter(d => d.status === 'pending').length, cls: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30' },
            { label: 'Gagal', value: deposits.filter(d => d.status === 'failed').length, cls: 'bg-red-100 text-red-600 dark:bg-red-900/30' },
          ].map(({ label, value, cls }) => (
            <div key={label} className="card p-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${cls}`}><ArrowDown size={20} weight="duotone" /></div>
              <p className="text-2xl font-black">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
        <div className="card overflow-hidden">
          <div className="flex justify-end px-5 py-4 border-b border-border bg-muted/30">
            <button className="btn-secondary gap-2 text-sm px-3 py-2"><Download size={15} /> Export</button>
          </div>
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/20">
              <tr>{['ID','Pengguna','Metode','Jumlah','Status','Waktu',''].map(h => <th key={h} className="px-4 py-3 text-left text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {deposits.map(d => (
                <tr key={d.id} className="hover:bg-muted/30 group">
                  <td className="px-4 py-3 font-mono text-xs">{d.id}</td>
                  <td className="px-4 py-3 font-semibold">{d.user}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{d.method}</td>
                  <td className="px-4 py-3 font-bold text-green-600">{d.amount}</td>
                  <td className="px-4 py-3"><span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full ${statusCls[d.status]}`}>{statusLabel[d.status]}</span></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{d.date}</td>
                  <td className="px-4 py-3"><button className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-muted transition-all"><Eye size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
KAHADE_EOF
ok "ADMIN — AdminDeposits"

# ADMIN — AdminPromos
mkdir -p "$(dirname "$SRC/pages/admin/AdminPromos.tsx")"
cat > "$SRC/pages/admin/AdminPromos.tsx" << 'KAHADE_EOF'
import { useState } from 'react';
import { Plus, Tag, Pencil, Trash } from '@phosphor-icons/react';
import AdminLayout from '@/components/layout/AdminLayout';

const promos = [
  { id: 'PROMO-001', code: 'KAHADE10', type: 'Persentase', value: '10%', minTx: 'Rp 500.000', used: 84, limit: 100, expires: '28 Feb 2026', status: 'active' },
  { id: 'PROMO-002', code: 'GRATIS50K', type: 'Nominal', value: 'Rp 50.000', minTx: 'Rp 1.000.000', used: 200, limit: 200, expires: '15 Feb 2026', status: 'expired' },
  { id: 'PROMO-003', code: 'NEWUSER', type: 'Persentase', value: '5%', minTx: 'Rp 0', used: 456, limit: 1000, expires: '31 Mar 2026', status: 'active' },
  { id: 'PROMO-004', code: 'FLASH25', type: 'Persentase', value: '25%', minTx: 'Rp 2.000.000', used: 0, limit: 50, expires: '25 Feb 2026', status: 'inactive' },
];
const statusCls: Record<string,string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  expired: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400',
  inactive: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};
const statusLabel: Record<string,string> = { active: 'Aktif', expired: 'Kadaluarsa', inactive: 'Nonaktif' };

export default function AdminPromos() {
  return (
    <AdminLayout title="Manajemen Promo" subtitle="Kelola kode voucher dan promosi platform">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="grid grid-cols-3 gap-4 flex-1 mr-4">
            {[
              { label: 'Promo Aktif', value: promos.filter(p => p.status === 'active').length, cls: 'bg-green-100 text-green-600 dark:bg-green-900/30' },
              { label: 'Total Penggunaan', value: '740', cls: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' },
              { label: 'Kadaluarsa', value: promos.filter(p => p.status === 'expired').length, cls: 'bg-muted text-muted-foreground' },
            ].map(({ label, value, cls }) => (
              <div key={label} className="card p-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${cls}`}><Tag size={20} weight="duotone" /></div>
                <p className="text-2xl font-black">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
          <button className="btn-primary shrink-0"><Plus size={18} /> Buat Promo</button>
        </div>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/20">
              <tr>{['ID','Kode','Tipe','Nilai','Min. Transaksi','Penggunaan','Kadaluarsa','Status','Aksi'].map(h => <th key={h} className="px-4 py-3 text-left text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {promos.map(p => (
                <tr key={p.id} className="hover:bg-muted/30 group">
                  <td className="px-4 py-3 font-mono text-xs">{p.id}</td>
                  <td className="px-4 py-3"><span className="font-mono font-bold bg-muted px-2 py-0.5 rounded-lg text-xs">{p.code}</span></td>
                  <td className="px-4 py-3 text-xs">{p.type}</td>
                  <td className="px-4 py-3 font-bold text-primary">{p.value}</td>
                  <td className="px-4 py-3 text-xs">{p.minTx}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-1.5 w-20"><div className="bg-primary h-full rounded-full" style={{ width: `${Math.min((p.used / p.limit) * 100, 100)}%` }} /></div>
                      <span className="text-xs text-muted-foreground">{p.used}/{p.limit}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{p.expires}</td>
                  <td className="px-4 py-3"><span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full ${statusCls[p.status]}`}>{statusLabel[p.status]}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 rounded-lg hover:bg-muted"><Pencil size={14} /></button>
                      <button className="p-1.5 rounded-lg hover:bg-red-100 text-red-600"><Trash size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
KAHADE_EOF
ok "ADMIN — AdminPromos"

# ADMIN — AdminReports
mkdir -p "$(dirname "$SRC/pages/admin/AdminReports.tsx")"
cat > "$SRC/pages/admin/AdminReports.tsx" << 'KAHADE_EOF'
import { useState } from 'react';
import { Download, TrendUp, CurrencyDollar, Users, ArrowsLeftRight } from '@phosphor-icons/react';
import AdminLayout from '@/components/layout/AdminLayout';

const monthlyData = [
  { month: 'Okt', volume: 38.2, tx: 1240, users: 320, revenue: 954 },
  { month: 'Nov', volume: 44.1, tx: 1480, users: 415, revenue: 1102 },
  { month: 'Des', volume: 52.8, tx: 1820, users: 560, revenue: 1320 },
  { month: 'Jan', volume: 48.5, tx: 1620, users: 490, revenue: 1212 },
  { month: 'Feb', volume: 58.3, tx: 1950, users: 620, revenue: 1457 },
];
const maxVol = Math.max(...monthlyData.map(d => d.volume));

export default function AdminReports() {
  const [period, setPeriod] = useState('6 bulan');

  return (
    <AdminLayout title="Laporan & Analitik" subtitle="Data performa platform Kahade">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-1 bg-muted/50 p-1 rounded-xl">
            {['7 hari','30 hari','3 bulan','6 bulan','1 tahun'].map(p => (
              <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${period === p ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{p}</button>
            ))}
          </div>
          <button className="btn-secondary gap-2 text-sm"><Download size={16} /> Unduh Laporan</button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: CurrencyDollar, label: 'Total Volume', value: 'Rp 241.9M', delta: '+21%' },
            { icon: ArrowsLeftRight, label: 'Total Transaksi', value: '8.110', delta: '+18%' },
            { icon: Users, label: 'User Baru', value: '2.405', delta: '+32%' },
            { icon: TrendUp, label: 'Total Revenue', value: 'Rp 6.04M', delta: '+21%' },
          ].map(({ icon: Icon, label, value, delta }) => (
            <div key={label} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center"><Icon size={18} className="text-primary" weight="duotone" /></div>
                <span className="text-xs font-bold text-green-600 flex items-center gap-0.5"><TrendUp size={11} />{delta}</span>
              </div>
              <p className="text-xl font-black">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="card p-6">
          <h2 className="font-bold mb-6">Volume Transaksi per Bulan (Rp Juta)</h2>
          <div className="flex items-end gap-6 h-48">
            {monthlyData.map(d => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-primary">{d.volume}M</span>
                <div className="w-full rounded-t-xl bg-primary/70 hover:bg-primary transition-colors cursor-pointer" style={{ height: `${(d.volume / maxVol) * 160}px` }} />
                <span className="text-xs text-muted-foreground">{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-border font-bold">Detail per Bulan</div>
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/20">
              <tr>{['Bulan','Volume (Rp)','Transaksi','User Baru','Revenue (Rp)'].map(h => <th key={h} className="px-5 py-3 text-left text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {monthlyData.map(d => (
                <tr key={d.month} className="hover:bg-muted/30">
                  <td className="px-5 py-3 font-semibold">{d.month} '25</td>
                  <td className="px-5 py-3">Rp {d.volume}M</td>
                  <td className="px-5 py-3">{d.tx.toLocaleString('id-ID')}</td>
                  <td className="px-5 py-3">{d.users}</td>
                  <td className="px-5 py-3 text-green-600 font-semibold">Rp {d.revenue}K</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
KAHADE_EOF
ok "ADMIN — AdminReports"

# ADMIN — AdminAuditLogs
mkdir -p "$(dirname "$SRC/pages/admin/AdminAuditLogs.tsx")"
cat > "$SRC/pages/admin/AdminAuditLogs.tsx" << 'KAHADE_EOF'
import { useState } from 'react';
import { MagnifyingGlass, Info, CheckCircle, Warning, User } from '@phosphor-icons/react';
import AdminLayout from '@/components/layout/AdminLayout';

const logs = [
  { id: 'LOG-2001', action: 'KYC Approved', actor: 'admin@kahade.id', target: 'ahmad@email.com', details: 'KYC submission KYC-001 approved', severity: 'success', time: '20 Feb 2026 14:35' },
  { id: 'LOG-2000', action: 'User Suspended', actor: 'admin@kahade.id', target: 'budi@email.com', details: 'Account suspended: policy violation', severity: 'warning', time: '20 Feb 2026 13:22' },
  { id: 'LOG-1999', action: 'Withdrawal Approved', actor: 'admin@kahade.id', target: 'WD-201', details: 'Rp 2.000.000 withdrawal approved to BCA *1234', severity: 'info', time: '20 Feb 2026 12:10' },
  { id: 'LOG-1998', action: 'Dispute Resolved', actor: 'admin@kahade.id', target: 'D-087', details: 'Dispute resolved: full refund issued to buyer', severity: 'success', time: '20 Feb 2026 11:05' },
  { id: 'LOG-1997', action: 'Promo Created', actor: 'admin@kahade.id', target: 'FLASH25', details: '25% promo created with limit of 50 uses', severity: 'info', time: '20 Feb 2026 10:30' },
  { id: 'LOG-1996', action: 'Login Failed', actor: 'unknown', target: 'admin panel', details: '5 failed login attempts from IP 192.168.1.100', severity: 'error', time: '20 Feb 2026 09:15' },
];

const severityCls: Record<string,string> = {
  info: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30',
  success: 'bg-green-100 text-green-600 dark:bg-green-900/30',
  warning: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30',
  error: 'bg-red-100 text-red-600 dark:bg-red-900/30',
};
const severityBadge: Record<string,string> = {
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};
const iconMap: Record<string, any> = { info: Info, success: CheckCircle, warning: Warning, error: Warning };

export default function AdminAuditLogs() {
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('Semua');
  const severities = ['Semua','Info','Success','Warning','Error'];
  const filtered = logs.filter(l =>
    (severity === 'Semua' || l.severity === severity.toLowerCase()) &&
    (!search || l.action.toLowerCase().includes(search.toLowerCase()) || l.actor.includes(search))
  );

  return (
    <AdminLayout title="Log Audit" subtitle="Rekam jejak semua aksi admin dan sistem">
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30 flex-wrap gap-3">
          <div className="relative">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari log..." className="pl-9 pr-4 py-2 rounded-xl border border-border text-sm bg-background focus:outline-none w-64" />
          </div>
          <div className="flex gap-1 bg-muted/50 p-1 rounded-xl">
            {severities.map(s => <button key={s} onClick={() => setSeverity(s)} className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${severity === s ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{s}</button>)}
          </div>
        </div>
        <div className="divide-y divide-border">
          {filtered.map(log => {
            const Icon = iconMap[log.severity] || Info;
            return (
              <div key={log.id} className="flex items-start gap-4 px-5 py-4 hover:bg-muted/30 transition-colors">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${severityCls[log.severity]}`}>
                  <Icon size={16} weight="fill" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-sm">{log.action}</span>
                    <span className={`text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full uppercase ${severityBadge[log.severity]}`}>{log.severity}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1.5">{log.details}</p>
                  <div className="flex items-center gap-3 text-[0.65rem] text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1"><User size={10} />{log.actor}</span>
                    <span>→ <span className="font-mono">{log.target}</span></span>
                    <span className="ml-auto font-medium">{log.time}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
KAHADE_EOF
ok "ADMIN — AdminAuditLogs"

# ADMIN — AdminSettings
mkdir -p "$(dirname "$SRC/pages/admin/AdminSettings.tsx")"
cat > "$SRC/pages/admin/AdminSettings.tsx" << 'KAHADE_EOF'
import { useState } from 'react';
import { Gear } from '@phosphor-icons/react';
import AdminLayout from '@/components/layout/AdminLayout';

const sections = ['Umum','Keuangan','Notifikasi','Keamanan','Sistem'];

export default function AdminSettings() {
  const [active, setActive] = useState('Umum');
  const [fee, setFee] = useState('2.5');

  return (
    <AdminLayout title="Pengaturan Platform" subtitle="Konfigurasi sistem dan parameter platform">
      <div className="grid md:grid-cols-[180px_1fr] gap-6">
        <div className="space-y-1">
          {sections.map(s => (
            <button key={s} onClick={() => setActive(s)} className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>{s}</button>
          ))}
        </div>
        <div className="card p-6 space-y-5">
          {active === 'Umum' && (
            <>
              <h2 className="font-bold text-lg">Pengaturan Umum</h2>
              {[['Nama Platform','Kahade'],['Domain','kahade.id'],['Email Support','halo@kahade.id'],['Nomor Support','+62 811-127-812']].map(([label, val]) => (
                <div key={label} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                  <div><p className="font-medium text-sm">{label}</p><p className="text-xs text-muted-foreground">{val}</p></div>
                  <button className="btn-secondary text-xs py-1.5 px-3">Edit</button>
                </div>
              ))}
            </>
          )}
          {active === 'Keuangan' && (
            <>
              <h2 className="font-bold text-lg">Konfigurasi Keuangan</h2>
              <div className="border-b border-border pb-5">
                <p className="font-medium text-sm mb-2">Biaya Platform (%)</p>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                    <input type="number" value={fee} onChange={e => setFee(e.target.value)} step="0.1" min="0" max="10" className="pl-8 pr-4 h-10 rounded-xl border-2 border-border bg-background text-sm focus:outline-none focus:border-foreground w-28" />
                  </div>
                  <p className="text-xs text-muted-foreground">Biaya saat ini: <strong>{fee}%</strong> per transaksi</p>
                </div>
              </div>
              {[['Minimum Deposit','Rp 10.000'],['Minimum Penarikan','Rp 50.000'],['Max Penarikan/Hari','Rp 50.000.000']].map(([label, val]) => (
                <div key={label} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                  <div><p className="font-medium text-sm">{label}</p><p className="text-xs text-muted-foreground">{val}</p></div>
                  <button className="btn-secondary text-xs py-1.5 px-3">Edit</button>
                </div>
              ))}
              <button className="btn-primary">Simpan Konfigurasi</button>
            </>
          )}
          {active === 'Keamanan' && (
            <>
              <h2 className="font-bold text-lg">Pengaturan Keamanan</h2>
              {[['Wajib 2FA untuk Admin', true],['IP Whitelist Aktif', false],['Rate Limit API', true]].map(([label, enabled]) => (
                <div key={String(label)} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                  <p className="font-medium text-sm">{label}</p>
                  <div className={`w-11 h-6 rounded-full cursor-pointer transition-colors ${enabled ? 'bg-primary' : 'bg-muted'}`}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow-sm m-0.5 transition-transform ${enabled ? 'translate-x-5' : ''}`} />
                  </div>
                </div>
              ))}
            </>
          )}
          {(active === 'Notifikasi' || active === 'Sistem') && (
            <div className="py-16 text-center">
              <Gear size={48} className="text-muted-foreground/20 mx-auto mb-4" weight="thin" />
              <p className="font-semibold text-muted-foreground">Pengaturan {active}</p>
              <p className="text-sm text-muted-foreground mt-1">Fitur ini akan tersedia segera.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
KAHADE_EOF
ok "ADMIN — AdminSettings"


echo ""
echo "========================================================================"
echo -e "${G}  SELESAI — 85 file berhasil ditulis (v3.3 Fixed)${N}"
echo "  Target: $ROOT"
echo "========================================================================"
echo ""
echo "  Langkah selanjutnya:"
echo "  1. npm install"
echo "  2. npm run dev"
echo "  3. npm run build   # verifikasi TypeScript"
echo ""
