#!/usr/bin/env bash

# =============================================================================
# Kahade — Migrasi ke Turborepo Monorepo
# =============================================================================
# Jalankan script ini dari root project kamu (folder yang berisi frontend/ dan backend/)
# Usage: bash migrate-to-monorepo.sh
# =============================================================================

set -e  # Stop jika ada error

# Warna terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

log_info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC}   $1"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_step()    { echo -e "\n${BOLD}${CYAN}===> $1${NC}"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# =============================================================================
# VALIDASI
# =============================================================================

log_step "Validasi environment"

# Pastikan dijalankan dari folder yang benar
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
  log_error "Script harus dijalankan dari root project (folder yang berisi frontend/ dan backend/)"
fi

# Pastikan pnpm terinstall
if ! command -v pnpm &> /dev/null; then
  log_error "pnpm tidak ditemukan. Install dulu: npm install -g pnpm"
fi

log_success "Validasi selesai"

# =============================================================================
# SETUP VARIABEL
# =============================================================================

ROOT_DIR=$(pwd)
FRONTEND_SRC="$ROOT_DIR/frontend/src"
MONO_DIR="$ROOT_DIR/kahade-monorepo"

echo ""
echo -e "${BOLD}Struktur baru akan dibuat di:${NC} $MONO_DIR"
echo ""
read -p "Lanjutkan? (y/N): " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
  echo "Dibatalkan."
  exit 0
fi

# =============================================================================
# STEP 1 — BUAT STRUKTUR FOLDER
# =============================================================================

log_step "Step 1: Membuat struktur folder monorepo"

mkdir -p "$MONO_DIR"/{apps/{landing,dashboard,admin},packages/{ui,utils,types,config}}

# Buat subfolder apps
for app in landing dashboard admin; do
  mkdir -p "$MONO_DIR/apps/$app/src"/{pages,components,contexts,hooks,lib}
  mkdir -p "$MONO_DIR/apps/$app/public"
  mkdir -p "$MONO_DIR/apps/$app/.github"
done

# Buat subfolder packages
for pkg in ui utils types config; do
  mkdir -p "$MONO_DIR/packages/$pkg/src"
done

log_success "Struktur folder selesai"

# =============================================================================
# STEP 2 — ROOT CONFIG FILES
# =============================================================================

log_step "Step 2: Membuat root config files"

# Root package.json
cat > "$MONO_DIR/package.json" << 'EOF'
{
  "name": "kahade",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "dev:landing": "turbo dev --filter=@kahade/landing",
    "dev:dashboard": "turbo dev --filter=@kahade/dashboard",
    "dev:admin": "turbo dev --filter=@kahade/admin",
    "build": "turbo build",
    "build:landing": "turbo build --filter=@kahade/landing",
    "build:dashboard": "turbo build --filter=@kahade/dashboard",
    "build:admin": "turbo build --filter=@kahade/admin",
    "lint": "turbo lint",
    "type-check": "turbo type-check",
    "clean": "turbo clean && rm -rf node_modules"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  },
  "packageManager": "pnpm@9.0.0"
}
EOF

# pnpm-workspace.yaml
cat > "$MONO_DIR/pnpm-workspace.yaml" << 'EOF'
packages:
  - "apps/*"
  - "packages/*"
EOF

# turbo.json
cat > "$MONO_DIR/turbo.json" << 'EOF'
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "type-check": {
      "dependsOn": ["^build"]
    },
    "clean": {
      "cache": false
    }
  }
}
EOF

# Root .gitignore
cat > "$MONO_DIR/.gitignore" << 'EOF'
# Dependencies
node_modules
.pnpm-store

# Build outputs
dist
build
.turbo

# Environment
.env
.env.local
.env.*.local

# Logs
*.log
npm-debug.log*
pnpm-debug.log*

# Editor
.vscode
.idea
*.suo
*.ntvs*
*.njsproj
*.sln

# OS
.DS_Store
Thumbs.db
EOF

log_success "Root config files selesai"

# =============================================================================
# STEP 3 — PACKAGES
# =============================================================================

log_step "Step 3: Setup packages (shared)"

# ─── packages/ui ──────────────────────────────────────────────────────────────

cat > "$MONO_DIR/packages/ui/package.json" << 'EOF'
{
  "name": "@kahade/ui",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "@radix-ui/react-accordion": "^1.2.12",
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-avatar": "^1.1.11",
    "@radix-ui/react-checkbox": "^1.3.3",
    "@radix-ui/react-collapsible": "^1.1.11",
    "@radix-ui/react-context-menu": "^2.2.15",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-hover-card": "^1.1.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-menubar": "^1.1.15",
    "@radix-ui/react-navigation-menu": "^1.2.13",
    "@radix-ui/react-popover": "^1.1.14",
    "@radix-ui/react-progress": "^1.1.8",
    "@radix-ui/react-radio-group": "^1.3.8",
    "@radix-ui/react-scroll-area": "^1.2.9",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.1.7",
    "@radix-ui/react-slider": "^1.2.3",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-switch": "^1.2.6",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toggle": "^1.1.9",
    "@radix-ui/react-toggle-group": "^1.1.10",
    "@radix-ui/react-tooltip": "^1.0.7",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "lucide-react": "^0.312.0",
    "@phosphor-icons/react": "^2.0.15",
    "sonner": "^1.3.1",
    "tailwind-merge": "^2.2.0",
    "tw-animate-css": "^1.4.0"
  },
  "peerDependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tailwindcss": "^4.1.18"
  }
}
EOF

# Copy semua UI components
cp -r "$FRONTEND_SRC/components/ui/." "$MONO_DIR/packages/ui/src/"
cp "$FRONTEND_SRC/components/shared/SectionLabel.tsx" "$MONO_DIR/packages/ui/src/"
cp "$FRONTEND_SRC/components/ErrorBoundary.tsx" "$MONO_DIR/packages/ui/src/"
cp "$FRONTEND_SRC/components/LanguageSwitcher.tsx" "$MONO_DIR/packages/ui/src/"

# Generate index.ts untuk ui package
UI_FILES=$(ls "$MONO_DIR/packages/ui/src/" | grep -E "\.(tsx|ts)$" | sed 's/\.[^.]*$//')
UI_EXPORTS=""
for f in $UI_FILES; do
  UI_EXPORTS="${UI_EXPORTS}export * from './${f}'\n"
done
printf "$UI_EXPORTS" > "$MONO_DIR/packages/ui/src/index.ts"

log_success "packages/ui selesai ($(ls $MONO_DIR/packages/ui/src/*.tsx 2>/dev/null | wc -l) components)"

# ─── packages/types ───────────────────────────────────────────────────────────

cat > "$MONO_DIR/packages/types/package.json" << 'EOF'
{
  "name": "@kahade/types",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  }
}
EOF

cp "$FRONTEND_SRC/types/index.ts" "$MONO_DIR/packages/types/src/"
cp "$FRONTEND_SRC/types/errors.ts" "$MONO_DIR/packages/types/src/"
cp "$FRONTEND_SRC/types/admin.ts" "$MONO_DIR/packages/types/src/"

cat > "$MONO_DIR/packages/types/src/index.ts" << 'EOF'
export * from './index'
export * from './errors'
export * from './admin'
EOF

# Rename supaya tidak circular (index.ts export dirinya sendiri)
mv "$MONO_DIR/packages/types/src/index.ts" "$MONO_DIR/packages/types/src/exports.ts"
# Re-export dari file utama
mv "$MONO_DIR/packages/types/src/index.ts" "$MONO_DIR/packages/types/src/main.ts" 2>/dev/null || true
# Buat ulang index.ts yang benar
cat > "$MONO_DIR/packages/types/src/index.ts" << 'EOF'
export * from './main'
export * from './errors'
export * from './admin'
EOF
# Rename index yang sudah dicopy
mv "$MONO_DIR/packages/types/src/main.ts" "$MONO_DIR/packages/types/src/core.ts" 2>/dev/null || true

# Lebih simple: copy manual dan buat index baru
rm -f "$MONO_DIR/packages/types/src/index.ts" "$MONO_DIR/packages/types/src/exports.ts" "$MONO_DIR/packages/types/src/main.ts" 2>/dev/null || true
cp "$FRONTEND_SRC/types/index.ts" "$MONO_DIR/packages/types/src/core.ts"
cp "$FRONTEND_SRC/types/errors.ts" "$MONO_DIR/packages/types/src/errors.ts"
cp "$FRONTEND_SRC/types/admin.ts" "$MONO_DIR/packages/types/src/admin.ts"

cat > "$MONO_DIR/packages/types/src/index.ts" << 'EOF'
export * from './core'
export * from './errors'
export * from './admin'
EOF

log_success "packages/types selesai"

# ─── packages/utils ───────────────────────────────────────────────────────────

cat > "$MONO_DIR/packages/utils/package.json" << 'EOF'
{
  "name": "@kahade/utils",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "axios": "^1.6.5",
    "dayjs": "^1.11.19",
    "dompurify": "^3.3.1",
    "zod": "^3.22.4",
    "framer-motion": "^11.0.3"
  },
  "peerDependencies": {
    "react": "^18.2.0"
  }
}
EOF

cp -r "$FRONTEND_SRC/lib/." "$MONO_DIR/packages/utils/src/"

cat > "$MONO_DIR/packages/utils/src/index.ts" << 'EOF'
export * from './utils'
export * from './ui-utils'
export * from './api'
export * from './api-config'
export * from './dayjs'
export * from './logger'
export * from './animations'
export * from './design-tokens'
export * from './secure-storage'
export * from './i18n'
export * from './navigation-utils'
export * from './performance-utils'
export * from './security-utils'
export * from './validation-utils'
export * from './validation/common'
export * from './validation/schemas'
EOF

log_success "packages/utils selesai"

# ─── packages/config ──────────────────────────────────────────────────────────

cat > "$MONO_DIR/packages/config/package.json" << 'EOF'
{
  "name": "@kahade/config",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  }
}
EOF

cp "$FRONTEND_SRC/config/app.config.ts" "$MONO_DIR/packages/config/src/"
cp "$FRONTEND_SRC/config/env.validation.ts" "$MONO_DIR/packages/config/src/"

cat > "$MONO_DIR/packages/config/src/index.ts" << 'EOF'
export * from './app.config'
export * from './env.validation'
EOF

log_success "packages/config selesai"

# =============================================================================
# STEP 4 — COPY SHARED FILES (public, css, vite config, tsconfig)
# =============================================================================

log_step "Step 4: Copy file shared (assets, config)"

for app in landing dashboard admin; do
  # Public folder (fonts, images)
  cp -r "$ROOT_DIR/frontend/public/." "$MONO_DIR/apps/$app/public/"
  # CSS
  cp "$FRONTEND_SRC/index.css" "$MONO_DIR/apps/$app/src/"
  cp "$FRONTEND_SRC/vite-env.d.ts" "$MONO_DIR/apps/$app/src/"
  # Locales
  mkdir -p "$MONO_DIR/apps/$app/src/locales"
  cp "$FRONTEND_SRC/locales/"*.json "$MONO_DIR/apps/$app/src/locales/"
done

log_success "Shared files selesai"

# =============================================================================
# STEP 5 — APP: LANDING
# =============================================================================

log_step "Step 5: Setup apps/landing"

# package.json
cat > "$MONO_DIR/apps/landing/package.json" << 'EOF'
{
  "name": "@kahade/landing",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@kahade/ui": "workspace:*",
    "@kahade/utils": "workspace:*",
    "@kahade/types": "workspace:*",
    "@kahade/config": "workspace:*",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "wouter": "^3.0.0",
    "framer-motion": "^11.0.3",
    "i18next": "^23.7.16",
    "i18next-browser-languagedetector": "^8.2.1",
    "react-i18next": "^14.0.0",
    "@sentry/react": "^8.54.0",
    "tailwindcss": "^4.1.18",
    "@tailwindcss/vite": "^4.1.18",
    "tw-animate-css": "^1.4.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.5",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.11"
  }
}
EOF

# Copy landing pages
mkdir -p "$MONO_DIR/apps/landing/src/pages"
cp -r "$FRONTEND_SRC/pages/About.tsx" "$MONO_DIR/apps/landing/src/pages/"
cp -r "$FRONTEND_SRC/pages/ApiDocs.tsx" "$MONO_DIR/apps/landing/src/pages/"
cp -r "$FRONTEND_SRC/pages/Blog.tsx" "$MONO_DIR/apps/landing/src/pages/"
cp -r "$FRONTEND_SRC/pages/BlogDetail.tsx" "$MONO_DIR/apps/landing/src/pages/"
cp -r "$FRONTEND_SRC/pages/Careers.tsx" "$MONO_DIR/apps/landing/src/pages/"
cp -r "$FRONTEND_SRC/pages/Compare.tsx" "$MONO_DIR/apps/landing/src/pages/"
cp -r "$FRONTEND_SRC/pages/Contact.tsx" "$MONO_DIR/apps/landing/src/pages/"
cp -r "$FRONTEND_SRC/pages/Cookies.tsx" "$MONO_DIR/apps/landing/src/pages/"
cp -r "$FRONTEND_SRC/pages/Docs.tsx" "$MONO_DIR/apps/landing/src/pages/"
cp -r "$FRONTEND_SRC/pages/FAQ.tsx" "$MONO_DIR/apps/landing/src/pages/"
cp -r "$FRONTEND_SRC/pages/Feedback.tsx" "$MONO_DIR/apps/landing/src/pages/"
cp -r "$FRONTEND_SRC/pages/Help.tsx" "$MONO_DIR/apps/landing/src/pages/"
cp -r "$FRONTEND_SRC/pages/Home.tsx" "$MONO_DIR/apps/landing/src/pages/"
cp -r "$FRONTEND_SRC/pages/HowItWorks.tsx" "$MONO_DIR/apps/landing/src/pages/"
cp -r "$FRONTEND_SRC/pages/IntegrationDocs.tsx" "$MONO_DIR/apps/landing/src/pages/"
cp -r "$FRONTEND_SRC/pages/Licenses.tsx" "$MONO_DIR/apps/landing/src/pages/"
cp -r "$FRONTEND_SRC/pages/MobileApp.tsx" "$MONO_DIR/apps/landing/src/pages/"
cp -r "$FRONTEND_SRC/pages/NotFound.tsx" "$MONO_DIR/apps/landing/src/pages/"
cp -r "$FRONTEND_SRC/pages/Partners.tsx" "$MONO_DIR/apps/landing/src/pages/"
cp -r "$FRONTEND_SRC/pages/Press.tsx" "$MONO_DIR/apps/landing/src/pages/"
cp -r "$FRONTEND_SRC/pages/Pricing.tsx" "$MONO_DIR/apps/landing/src/pages/"
cp -r "$FRONTEND_SRC/pages/Privacy.tsx" "$MONO_DIR/apps/landing/src/pages/"
cp -r "$FRONTEND_SRC/pages/Security.tsx" "$MONO_DIR/apps/landing/src/pages/"
cp -r "$FRONTEND_SRC/pages/Terms.tsx" "$MONO_DIR/apps/landing/src/pages/"
cp -r "$FRONTEND_SRC/pages/UseCases.tsx" "$MONO_DIR/apps/landing/src/pages/"
cp -r "$FRONTEND_SRC/pages/Whitepaper.tsx" "$MONO_DIR/apps/landing/src/pages/"

# Copy landing components
mkdir -p "$MONO_DIR/apps/landing/src/components/home"
mkdir -p "$MONO_DIR/apps/landing/src/components/layout"
cp -r "$FRONTEND_SRC/components/home/." "$MONO_DIR/apps/landing/src/components/home/"
cp "$FRONTEND_SRC/components/layout/LandingLayout.tsx" "$MONO_DIR/apps/landing/src/components/layout/"
cp "$FRONTEND_SRC/components/layout/Navbar.tsx" "$MONO_DIR/apps/landing/src/components/layout/"
cp "$FRONTEND_SRC/components/layout/Footer.tsx" "$MONO_DIR/apps/landing/src/components/layout/"

# App.tsx untuk landing
cat > "$MONO_DIR/apps/landing/src/App.tsx" << 'EOF'
import { Toaster } from "@kahade/ui"
import { TooltipProvider } from "@kahade/ui"
import { Route, Switch } from "wouter"
import ErrorBoundary from "@kahade/ui/ErrorBoundary"
import { ThemeProvider } from "./contexts/ThemeContext"
import { lazy, Suspense } from "react"
import { Spinner } from "@phosphor-icons/react"

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Spinner className="w-8 h-8 animate-spin text-primary mx-auto" weight="bold" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">Memuat halaman...</p>
      </div>
    </div>
  )
}

// Landing Pages
const Home = lazy(() => import("./pages/Home"))
const About = lazy(() => import("./pages/About"))
const HowItWorks = lazy(() => import("./pages/HowItWorks"))
const Contact = lazy(() => import("./pages/Contact"))
const Pricing = lazy(() => import("./pages/Pricing"))
const Security = lazy(() => import("./pages/Security"))
const UseCases = lazy(() => import("./pages/UseCases"))
const Partners = lazy(() => import("./pages/Partners"))
const Compare = lazy(() => import("./pages/Compare"))
const MobileApp = lazy(() => import("./pages/MobileApp"))
const Blog = lazy(() => import("./pages/Blog"))
const BlogDetail = lazy(() => import("./pages/BlogDetail"))
const Help = lazy(() => import("./pages/Help"))
const FAQ = lazy(() => import("./pages/FAQ"))
const Feedback = lazy(() => import("./pages/Feedback"))
const Careers = lazy(() => import("./pages/Careers"))
const Whitepaper = lazy(() => import("./pages/Whitepaper"))
const Docs = lazy(() => import("./pages/Docs"))
const ApiDocs = lazy(() => import("./pages/ApiDocs"))
const IntegrationDocs = lazy(() => import("./pages/IntegrationDocs"))
const Press = lazy(() => import("./pages/Press"))
const Terms = lazy(() => import("./pages/Terms"))
const Privacy = lazy(() => import("./pages/Privacy"))
const Cookies = lazy(() => import("./pages/Cookies"))
const Licenses = lazy(() => import("./pages/Licenses"))
const NotFound = lazy(() => import("./pages/NotFound"))

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster position="top-right" toastOptions={{ className: "glass-card" }} />
          <Suspense fallback={<PageLoader />}>
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/about" component={About} />
              <Route path="/how-it-works" component={HowItWorks} />
              <Route path="/contact" component={Contact} />
              <Route path="/pricing" component={Pricing} />
              <Route path="/security" component={Security} />
              <Route path="/use-cases" component={UseCases} />
              <Route path="/partners" component={Partners} />
              <Route path="/compare" component={Compare} />
              <Route path="/mobile" component={MobileApp} />
              <Route path="/blog" component={Blog} />
              <Route path="/blog/:slug" component={BlogDetail} />
              <Route path="/help" component={Help} />
              <Route path="/faq" component={FAQ} />
              <Route path="/feedback" component={Feedback} />
              <Route path="/careers" component={Careers} />
              <Route path="/whitepaper" component={Whitepaper} />
              <Route path="/docs" component={Docs} />
              <Route path="/docs/api" component={ApiDocs} />
              <Route path="/docs/integration" component={IntegrationDocs} />
              <Route path="/press" component={Press} />
              <Route path="/terms" component={Terms} />
              <Route path="/privacy" component={Privacy} />
              <Route path="/cookies" component={Cookies} />
              <Route path="/licenses" component={Licenses} />
              <Route component={NotFound} />
            </Switch>
          </Suspense>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
EOF

# main.tsx untuk landing
cat > "$MONO_DIR/apps/landing/src/main.tsx" << 'EOF'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
EOF

# Copy contexts untuk landing
mkdir -p "$MONO_DIR/apps/landing/src/contexts"
cp "$FRONTEND_SRC/contexts/ThemeContext.tsx" "$MONO_DIR/apps/landing/src/contexts/"

# index.html untuk landing
cat > "$MONO_DIR/apps/landing/index.html" << 'EOF'
<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Kahade - Platform Escrow P2P Terpercaya Indonesia</title>
    <meta name="description" content="Kahade adalah platform escrow P2P terpercaya di Indonesia. Transaksi aman dengan perlindungan escrow, verifikasi KYC, dan dukungan 24/7." />
    <link rel="icon" type="image/svg+xml" href="/images/logo.svg" />
    <meta name="theme-color" content="#FFFFFF" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

# .env.example untuk landing
cat > "$MONO_DIR/apps/landing/.env.example" << 'EOF'
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Kahade
VITE_APP_DOMAIN=https://app.kahade.id
VITE_ENABLE_ANALYTICS=false
VITE_ANALYTICS_ENDPOINT=
VITE_ANALYTICS_WEBSITE_ID=
VITE_SENTRY_DSN=
VITE_SENTRY_ENVIRONMENT=development
EOF

# vite.config.ts
cat > "$MONO_DIR/apps/landing/vite.config.ts" << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
EOF

# tsconfig.json
cat > "$MONO_DIR/apps/landing/tsconfig.json" << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
EOF

log_success "apps/landing selesai"

# =============================================================================
# STEP 6 — APP: DASHBOARD
# =============================================================================

log_step "Step 6: Setup apps/dashboard"

cat > "$MONO_DIR/apps/dashboard/package.json" << 'EOF'
{
  "name": "@kahade/dashboard",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@kahade/ui": "workspace:*",
    "@kahade/utils": "workspace:*",
    "@kahade/types": "workspace:*",
    "@kahade/config": "workspace:*",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "wouter": "^3.0.0",
    "axios": "^1.6.5",
    "dayjs": "^1.11.19",
    "dompurify": "^3.3.1",
    "react-hook-form": "^7.71.1",
    "@hookform/resolvers": "^5.2.2",
    "zod": "^3.22.4",
    "recharts": "^2.10.3",
    "framer-motion": "^11.0.3",
    "i18next": "^23.7.16",
    "i18next-browser-languagedetector": "^8.2.1",
    "react-i18next": "^14.0.0",
    "@sentry/react": "^8.54.0",
    "tailwindcss": "^4.1.18",
    "@tailwindcss/vite": "^4.1.18"
  },
  "devDependencies": {
    "@types/node": "^20.11.5",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "@types/dompurify": "^3.0.5",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.11"
  }
}
EOF

# Copy dashboard pages
mkdir -p "$MONO_DIR/apps/dashboard/src/pages/auth"
mkdir -p "$MONO_DIR/apps/dashboard/src/pages/dashboard/messaging"
mkdir -p "$MONO_DIR/apps/dashboard/src/pages/dashboard/support"
cp -r "$FRONTEND_SRC/pages/auth/." "$MONO_DIR/apps/dashboard/src/pages/auth/"
cp -r "$FRONTEND_SRC/pages/dashboard/." "$MONO_DIR/apps/dashboard/src/pages/dashboard/"
cp "$FRONTEND_SRC/pages/NotFound.tsx" "$MONO_DIR/apps/dashboard/src/pages/"
cp "$FRONTEND_SRC/pages/Unauthorized.tsx" "$MONO_DIR/apps/dashboard/src/pages/"

# Copy dashboard components
mkdir -p "$MONO_DIR/apps/dashboard/src/components/layout"
mkdir -p "$MONO_DIR/apps/dashboard/src/components/auth"
mkdir -p "$MONO_DIR/apps/dashboard/src/components/wallet"
cp "$FRONTEND_SRC/components/layout/DashboardLayout.tsx" "$MONO_DIR/apps/dashboard/src/components/layout/"
cp "$FRONTEND_SRC/components/layout/BottomNavigation.tsx" "$MONO_DIR/apps/dashboard/src/components/layout/"
cp "$FRONTEND_SRC/components/auth/ProtectedRoute.tsx" "$MONO_DIR/apps/dashboard/src/components/auth/"
cp -r "$FRONTEND_SRC/components/wallet/." "$MONO_DIR/apps/dashboard/src/components/wallet/"

# Copy contexts, hooks
mkdir -p "$MONO_DIR/apps/dashboard/src/contexts"
mkdir -p "$MONO_DIR/apps/dashboard/src/hooks"
cp "$FRONTEND_SRC/contexts/AuthContext.tsx" "$MONO_DIR/apps/dashboard/src/contexts/"
cp "$FRONTEND_SRC/contexts/ThemeContext.tsx" "$MONO_DIR/apps/dashboard/src/contexts/"
cp -r "$FRONTEND_SRC/hooks/." "$MONO_DIR/apps/dashboard/src/hooks/"

# App.tsx untuk dashboard
cat > "$MONO_DIR/apps/dashboard/src/App.tsx" << 'EOF'
import { Toaster } from "@kahade/ui"
import { TooltipProvider } from "@kahade/ui"
import { Route, Switch } from "wouter"
import ErrorBoundary from "@kahade/ui/ErrorBoundary"
import { ThemeProvider } from "./contexts/ThemeContext"
import { AuthProvider } from "./contexts/AuthContext"
import { ProtectedRoute } from "./components/auth/ProtectedRoute"
import { lazy, Suspense } from "react"
import { Spinner } from "@phosphor-icons/react"

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Spinner className="w-8 h-8 animate-spin text-primary mx-auto" weight="bold" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">Memuat halaman...</p>
      </div>
    </div>
  )
}

// Auth Pages
const Login = lazy(() => import("./pages/auth/Login"))
const Register = lazy(() => import("./pages/auth/Register"))
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"))
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"))
const OAuthCallback = lazy(() => import("./pages/auth/OAuthCallback"))

// Dashboard Pages
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"))
const Transactions = lazy(() => import("./pages/dashboard/Transactions"))
const TransactionDetail = lazy(() => import("./pages/dashboard/TransactionDetail"))
const CreateTransaction = lazy(() => import("./pages/dashboard/CreateTransaction"))
const AcceptTransactionInvite = lazy(() => import("./pages/dashboard/AcceptTransactionInvite"))
const Wallet = lazy(() => import("./pages/dashboard/Wallet"))
const Deposit = lazy(() => import("./pages/dashboard/Deposit"))
const BankAccounts = lazy(() => import("./pages/dashboard/BankAccounts"))
const KYCVerification = lazy(() => import("./pages/dashboard/KYCVerification"))
const Disputes = lazy(() => import("./pages/dashboard/Disputes"))
const DisputeDetail = lazy(() => import("./pages/dashboard/DisputeDetail"))
const ActivityLog = lazy(() => import("./pages/dashboard/ActivityLog"))
const Notifications = lazy(() => import("./pages/dashboard/Notifications"))
const Profile = lazy(() => import("./pages/dashboard/Profile"))
const EditProfile = lazy(() => import("./pages/dashboard/EditProfile"))
const Settings = lazy(() => import("./pages/dashboard/Settings"))
const MFASettings = lazy(() => import("./pages/dashboard/MFASettings"))
const Referrals = lazy(() => import("./pages/dashboard/Referrals"))
const RewardPoints = lazy(() => import("./pages/dashboard/RewardPoints"))
const RewardRank = lazy(() => import("./pages/dashboard/RewardRank"))
const RewardMissions = lazy(() => import("./pages/dashboard/RewardMissions"))
const Messages = lazy(() => import("./pages/dashboard/messaging/Messages"))
const SupportTickets = lazy(() => import("./pages/dashboard/support/SupportTickets"))
const NotFound = lazy(() => import("./pages/NotFound"))
const Unauthorized = lazy(() => import("./pages/Unauthorized"))

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster position="top-right" toastOptions={{ className: "glass-card" }} />
            <Suspense fallback={<PageLoader />}>
              <Switch>
                {/* Auth */}
                <Route path="/login" component={Login} />
                <Route path="/register" component={Register} />
                <Route path="/forgot-password" component={ForgotPassword} />
                <Route path="/reset-password" component={ResetPassword} />
                <Route path="/oauth/callback" component={OAuthCallback} />
                {/* Protected */}
                <Route path="/"><ProtectedRoute><Dashboard /></ProtectedRoute></Route>
                <Route path="/transactions"><ProtectedRoute><Transactions /></ProtectedRoute></Route>
                <Route path="/transactions/create"><ProtectedRoute><CreateTransaction /></ProtectedRoute></Route>
                <Route path="/transactions/:id"><ProtectedRoute><TransactionDetail /></ProtectedRoute></Route>
                <Route path="/transactions/invite/:token"><ProtectedRoute><AcceptTransactionInvite /></ProtectedRoute></Route>
                <Route path="/wallet"><ProtectedRoute><Wallet /></ProtectedRoute></Route>
                <Route path="/wallet/deposit"><ProtectedRoute><Deposit /></ProtectedRoute></Route>
                <Route path="/bank-accounts"><ProtectedRoute><BankAccounts /></ProtectedRoute></Route>
                <Route path="/kyc"><ProtectedRoute><KYCVerification /></ProtectedRoute></Route>
                <Route path="/referrals"><ProtectedRoute><Referrals /></ProtectedRoute></Route>
                <Route path="/disputes"><ProtectedRoute><Disputes /></ProtectedRoute></Route>
                <Route path="/disputes/:id"><ProtectedRoute><DisputeDetail /></ProtectedRoute></Route>
                <Route path="/activity"><ProtectedRoute><ActivityLog /></ProtectedRoute></Route>
                <Route path="/notifications"><ProtectedRoute><Notifications /></ProtectedRoute></Route>
                <Route path="/profile"><ProtectedRoute><Profile /></ProtectedRoute></Route>
                <Route path="/profile/edit"><ProtectedRoute><EditProfile /></ProtectedRoute></Route>
                <Route path="/rewards/points"><ProtectedRoute><RewardPoints /></ProtectedRoute></Route>
                <Route path="/rewards/rank"><ProtectedRoute><RewardRank /></ProtectedRoute></Route>
                <Route path="/rewards/missions"><ProtectedRoute><RewardMissions /></ProtectedRoute></Route>
                <Route path="/settings"><ProtectedRoute><Settings /></ProtectedRoute></Route>
                <Route path="/security"><ProtectedRoute><MFASettings /></ProtectedRoute></Route>
                <Route path="/messages"><ProtectedRoute><Messages /></ProtectedRoute></Route>
                <Route path="/support"><ProtectedRoute><SupportTickets /></ProtectedRoute></Route>
                <Route path="/unauthorized" component={Unauthorized} />
                <Route component={NotFound} />
              </Switch>
            </Suspense>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
EOF

# main.tsx
cat > "$MONO_DIR/apps/dashboard/src/main.tsx" << 'EOF'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
EOF

# index.html
cat > "$MONO_DIR/apps/dashboard/index.html" << 'EOF'
<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Kahade - Dashboard</title>
    <meta name="robots" content="noindex, nofollow" />
    <link rel="icon" type="image/svg+xml" href="/images/logo.svg" />
    <meta name="theme-color" content="#FFFFFF" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

# .env.example
cat > "$MONO_DIR/apps/dashboard/.env.example" << 'EOF'
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Kahade
VITE_LANDING_DOMAIN=https://kahade.id
VITE_SENTRY_DSN=
VITE_SENTRY_ENVIRONMENT=development
VITE_GOOGLE_CLIENT_ID=
EOF

# vite.config.ts
cat > "$MONO_DIR/apps/dashboard/vite.config.ts" << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
EOF

cp "$MONO_DIR/apps/landing/tsconfig.json" "$MONO_DIR/apps/dashboard/tsconfig.json"

log_success "apps/dashboard selesai"

# =============================================================================
# STEP 7 — APP: ADMIN
# =============================================================================

log_step "Step 7: Setup apps/admin"

cat > "$MONO_DIR/apps/admin/package.json" << 'EOF'
{
  "name": "@kahade/admin",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@kahade/ui": "workspace:*",
    "@kahade/utils": "workspace:*",
    "@kahade/types": "workspace:*",
    "@kahade/config": "workspace:*",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "wouter": "^3.0.0",
    "axios": "^1.6.5",
    "dayjs": "^1.11.19",
    "react-hook-form": "^7.71.1",
    "@hookform/resolvers": "^5.2.2",
    "zod": "^3.22.4",
    "recharts": "^2.10.3",
    "framer-motion": "^11.0.3",
    "i18next": "^23.7.16",
    "react-i18next": "^14.0.0",
    "@sentry/react": "^8.54.0",
    "tailwindcss": "^4.1.18",
    "@tailwindcss/vite": "^4.1.18"
  },
  "devDependencies": {
    "@types/node": "^20.11.5",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.11"
  }
}
EOF

# Copy admin pages
mkdir -p "$MONO_DIR/apps/admin/src/pages/admin"
mkdir -p "$MONO_DIR/apps/admin/src/pages/auth"
cp -r "$FRONTEND_SRC/pages/admin/." "$MONO_DIR/apps/admin/src/pages/admin/"
cp "$FRONTEND_SRC/pages/auth/Login.tsx" "$MONO_DIR/apps/admin/src/pages/auth/"
cp "$FRONTEND_SRC/pages/auth/ForgotPassword.tsx" "$MONO_DIR/apps/admin/src/pages/auth/"
cp "$FRONTEND_SRC/pages/auth/ResetPassword.tsx" "$MONO_DIR/apps/admin/src/pages/auth/"
cp "$FRONTEND_SRC/pages/NotFound.tsx" "$MONO_DIR/apps/admin/src/pages/"
cp "$FRONTEND_SRC/pages/Unauthorized.tsx" "$MONO_DIR/apps/admin/src/pages/"

# Copy admin components
mkdir -p "$MONO_DIR/apps/admin/src/components/layout"
mkdir -p "$MONO_DIR/apps/admin/src/components/auth"
cp "$FRONTEND_SRC/components/layout/AdminLayout.tsx" "$MONO_DIR/apps/admin/src/components/layout/"
cp "$FRONTEND_SRC/components/auth/ProtectedRoute.tsx" "$MONO_DIR/apps/admin/src/components/auth/"

# Copy contexts, hooks
mkdir -p "$MONO_DIR/apps/admin/src/contexts"
mkdir -p "$MONO_DIR/apps/admin/src/hooks"
cp "$FRONTEND_SRC/contexts/AuthContext.tsx" "$MONO_DIR/apps/admin/src/contexts/"
cp "$FRONTEND_SRC/contexts/ThemeContext.tsx" "$MONO_DIR/apps/admin/src/contexts/"
cp -r "$FRONTEND_SRC/hooks/." "$MONO_DIR/apps/admin/src/hooks/"

# App.tsx untuk admin
cat > "$MONO_DIR/apps/admin/src/App.tsx" << 'EOF'
import { Toaster } from "@kahade/ui"
import { TooltipProvider } from "@kahade/ui"
import { Route, Switch } from "wouter"
import ErrorBoundary from "@kahade/ui/ErrorBoundary"
import { ThemeProvider } from "./contexts/ThemeContext"
import { AuthProvider } from "./contexts/AuthContext"
import { ProtectedRoute } from "./components/auth/ProtectedRoute"
import { lazy, Suspense } from "react"
import { Spinner } from "@phosphor-icons/react"

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Spinner className="w-8 h-8 animate-spin text-primary mx-auto" weight="bold" aria-hidden="true" />
    </div>
  )
}

// Auth
const Login = lazy(() => import("./pages/auth/Login"))
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"))
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"))

// Admin Pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"))
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"))
const AdminTransactions = lazy(() => import("./pages/admin/AdminTransactions"))
const AdminDisputes = lazy(() => import("./pages/admin/AdminDisputes"))
const AdminKYC = lazy(() => import("./pages/admin/AdminKYC"))
const AdminWithdrawals = lazy(() => import("./pages/admin/AdminWithdrawals"))
const AdminDeposits = lazy(() => import("./pages/admin/AdminDeposits"))
const AdminPromos = lazy(() => import("./pages/admin/AdminPromos"))
const AdminReports = lazy(() => import("./pages/admin/AdminReports"))
const AdminAuditLogs = lazy(() => import("./pages/admin/AdminAuditLogs"))
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"))
const NotFound = lazy(() => import("./pages/NotFound"))
const Unauthorized = lazy(() => import("./pages/Unauthorized"))

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster position="top-right" toastOptions={{ className: "glass-card" }} />
            <Suspense fallback={<PageLoader />}>
              <Switch>
                <Route path="/login" component={Login} />
                <Route path="/forgot-password" component={ForgotPassword} />
                <Route path="/reset-password" component={ResetPassword} />
                <Route path="/"><ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute></Route>
                <Route path="/users"><ProtectedRoute requireAdmin><AdminUsers /></ProtectedRoute></Route>
                <Route path="/transactions"><ProtectedRoute requireAdmin><AdminTransactions /></ProtectedRoute></Route>
                <Route path="/disputes"><ProtectedRoute requireAdmin><AdminDisputes /></ProtectedRoute></Route>
                <Route path="/kyc"><ProtectedRoute requireAdmin><AdminKYC /></ProtectedRoute></Route>
                <Route path="/withdrawals"><ProtectedRoute requireAdmin><AdminWithdrawals /></ProtectedRoute></Route>
                <Route path="/deposits"><ProtectedRoute requireAdmin><AdminDeposits /></ProtectedRoute></Route>
                <Route path="/promos"><ProtectedRoute requireAdmin><AdminPromos /></ProtectedRoute></Route>
                <Route path="/reports"><ProtectedRoute requireAdmin><AdminReports /></ProtectedRoute></Route>
                <Route path="/audit-logs"><ProtectedRoute requireAdmin><AdminAuditLogs /></ProtectedRoute></Route>
                <Route path="/settings"><ProtectedRoute requireAdmin><AdminSettings /></ProtectedRoute></Route>
                <Route path="/unauthorized" component={Unauthorized} />
                <Route component={NotFound} />
              </Switch>
            </Suspense>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
EOF

cat > "$MONO_DIR/apps/admin/src/main.tsx" << 'EOF'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
EOF

cat > "$MONO_DIR/apps/admin/index.html" << 'EOF'
<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Kahade - Admin Panel</title>
    <meta name="robots" content="noindex, nofollow" />
    <link rel="icon" type="image/svg+xml" href="/images/logo.svg" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

cat > "$MONO_DIR/apps/admin/.env.example" << 'EOF'
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Kahade Admin
VITE_SENTRY_DSN=
VITE_SENTRY_ENVIRONMENT=development
EOF

cp "$MONO_DIR/apps/landing/vite.config.ts" "$MONO_DIR/apps/admin/vite.config.ts"
cp "$MONO_DIR/apps/landing/tsconfig.json" "$MONO_DIR/apps/admin/tsconfig.json"

log_success "apps/admin selesai"

# =============================================================================
# STEP 8 — UPDATE IMPORT PATHS
# =============================================================================

log_step "Step 8: Update import paths di semua apps"

update_imports() {
  local dir="$1"

  find "$dir" -type f \( -name "*.tsx" -o -name "*.ts" \) | while read -r file; do
    # ── Shared packages ──────────────────────────────────────────────────────

    # UI components → @kahade/ui
    sed -i "s|from '@/components/ui/[^']*'|from '@kahade/ui'|g" "$file"
    sed -i 's|from "@/components/ui/[^"]*"|from "@kahade/ui"|g' "$file"

    # Shared components → @kahade/ui
    sed -i "s|from '@/components/shared/[^']*'|from '@kahade/ui'|g" "$file"
    sed -i 's|from "@/components/shared/[^"]*"|from "@kahade/ui"|g' "$file"

    # ErrorBoundary → @kahade/ui
    sed -i "s|from '@/components/ErrorBoundary'|from '@kahade/ui/ErrorBoundary'|g" "$file"
    sed -i 's|from "@/components/ErrorBoundary"|from "@kahade/ui/ErrorBoundary"|g' "$file"

    # LanguageSwitcher → @kahade/ui
    sed -i "s|from '@/components/LanguageSwitcher'|from '@kahade/ui'|g" "$file"
    sed -i 's|from "@/components/LanguageSwitcher"|from "@kahade/ui"|g' "$file"

    # lib/* → @kahade/utils
    sed -i "s|from '@/lib/[^']*'|from '@kahade/utils'|g" "$file"
    sed -i 's|from "@/lib/[^"]*"|from "@kahade/utils"|g' "$file"

    # types → @kahade/types
    sed -i "s|from '@/types'|from '@kahade/types'|g" "$file"
    sed -i 's|from "@/types"|from "@kahade/types"|g' "$file"
    sed -i "s|from '@/types/[^']*'|from '@kahade/types'|g" "$file"
    sed -i 's|from "@/types/[^"]*"|from "@kahade/types"|g' "$file"

    # config/* → @kahade/config
    sed -i "s|from '@/config/[^']*'|from '@kahade/config'|g" "$file"
    sed -i 's|from "@/config/[^"]*"|from "@kahade/config"|g' "$file"

    # ── Layout components → relative path ────────────────────────────────────
    # Setiap app punya layout sendiri di components/layout/

    sed -i "s|from '@/components/layout/Navbar'|from '../components/layout/Navbar'|g" "$file"
    sed -i 's|from "@/components/layout/Navbar"|from "../components/layout/Navbar"|g' "$file"

    sed -i "s|from '@/components/layout/Footer'|from '../components/layout/Footer'|g" "$file"
    sed -i 's|from "@/components/layout/Footer"|from "../components/layout/Footer"|g' "$file"

    sed -i "s|from '@/components/layout/LandingLayout'|from '../components/layout/LandingLayout'|g" "$file"
    sed -i 's|from "@/components/layout/LandingLayout"|from "../components/layout/LandingLayout"|g' "$file"

    sed -i "s|from '@/components/layout/DashboardLayout'|from '../components/layout/DashboardLayout'|g" "$file"
    sed -i 's|from "@/components/layout/DashboardLayout"|from "../components/layout/DashboardLayout"|g' "$file"

    sed -i "s|from '@/components/layout/AdminLayout'|from '../components/layout/AdminLayout'|g" "$file"
    sed -i 's|from "@/components/layout/AdminLayout"|from "../components/layout/AdminLayout"|g' "$file"

    sed -i "s|from '@/components/layout/BottomNavigation'|from '../components/layout/BottomNavigation'|g" "$file"
    sed -i 's|from "@/components/layout/BottomNavigation"|from "../components/layout/BottomNavigation"|g' "$file"

    # Auth component
    sed -i "s|from '@/components/auth/ProtectedRoute'|from '../components/auth/ProtectedRoute'|g" "$file"
    sed -i 's|from "@/components/auth/ProtectedRoute"|from "../components/auth/ProtectedRoute"|g' "$file"

    # Wallet components
    sed -i "s|from '@/components/wallet'|from '../components/wallet'|g" "$file"
    sed -i 's|from "@/components/wallet"|from "../components/wallet"|g' "$file"

    # Contexts
    sed -i "s|from '@/contexts/AuthContext'|from '../contexts/AuthContext'|g" "$file"
    sed -i 's|from "@/contexts/AuthContext"|from "../contexts/AuthContext"|g' "$file"

    sed -i "s|from '@/contexts/ThemeContext'|from '../contexts/ThemeContext'|g" "$file"
    sed -i 's|from "@/contexts/ThemeContext"|from "../contexts/ThemeContext"|g' "$file"

    # Hooks
    sed -i "s|from '@/hooks/[^']*'|from '../hooks/useApi'|g" "$file"
    sed -i 's|from "@/hooks/[^"]*"|from "../hooks/useApi"|g' "$file"

    # Pages (relative untuk satu app)
    sed -i "s|from '@/pages/[^']*'|from '../pages/NotFound'|g" "$file"
    sed -i 's|from "@/pages/[^"]*"|from "../pages/NotFound"|g' "$file"
  done
}

update_imports "$MONO_DIR/apps/landing/src"
update_imports "$MONO_DIR/apps/dashboard/src"
update_imports "$MONO_DIR/apps/admin/src"
update_imports "$MONO_DIR/packages/ui/src"
update_imports "$MONO_DIR/packages/utils/src"

log_success "Import paths diupdate"

# =============================================================================
# STEP 9 — GITHUB ACTIONS
# =============================================================================

log_step "Step 9: Setup GitHub Actions CI/CD"

mkdir -p "$MONO_DIR/.github/workflows"

# Deploy Landing
cat > "$MONO_DIR/.github/workflows/deploy-landing.yml" << 'EOF'
name: Deploy Landing

on:
  push:
    branches: [main]
    paths:
      - 'apps/landing/**'
      - 'packages/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v3
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm --filter @kahade/landing build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          VITE_APP_NAME: Kahade
          VITE_APP_DOMAIN: ${{ secrets.VITE_APP_DOMAIN }}

      - name: Deploy to S3
        run: |
          aws s3 sync apps/landing/dist s3://${{ secrets.S3_BUCKET_LANDING }} \
            --delete \
            --cache-control "public, max-age=31536000" \
            --exclude "*.html" \
            --exclude "*.json"
          aws s3 sync apps/landing/dist s3://${{ secrets.S3_BUCKET_LANDING }} \
            --delete \
            --cache-control "no-cache" \
            --include "*.html" \
            --include "*.json"
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_DEFAULT_REGION: ${{ secrets.AWS_REGION }}

      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CF_DISTRIBUTION_LANDING }} \
            --paths "/*"
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_DEFAULT_REGION: ${{ secrets.AWS_REGION }}
EOF

# Deploy Dashboard
cat > "$MONO_DIR/.github/workflows/deploy-dashboard.yml" << 'EOF'
name: Deploy Dashboard

on:
  push:
    branches: [main]
    paths:
      - 'apps/dashboard/**'
      - 'packages/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v3
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm --filter @kahade/dashboard build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          VITE_APP_NAME: Kahade
          VITE_LANDING_DOMAIN: ${{ secrets.VITE_LANDING_DOMAIN }}
          VITE_GOOGLE_CLIENT_ID: ${{ secrets.VITE_GOOGLE_CLIENT_ID }}

      - name: Deploy to S3
        run: |
          aws s3 sync apps/dashboard/dist s3://${{ secrets.S3_BUCKET_DASHBOARD }} \
            --delete \
            --cache-control "public, max-age=31536000" \
            --exclude "*.html" \
            --exclude "*.json"
          aws s3 sync apps/dashboard/dist s3://${{ secrets.S3_BUCKET_DASHBOARD }} \
            --delete \
            --cache-control "no-cache" \
            --include "*.html" \
            --include "*.json"
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_DEFAULT_REGION: ${{ secrets.AWS_REGION }}

      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CF_DISTRIBUTION_DASHBOARD }} \
            --paths "/*"
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_DEFAULT_REGION: ${{ secrets.AWS_REGION }}
EOF

# Deploy Admin
cat > "$MONO_DIR/.github/workflows/deploy-admin.yml" << 'EOF'
name: Deploy Admin

on:
  push:
    branches: [main]
    paths:
      - 'apps/admin/**'
      - 'packages/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v3
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm --filter @kahade/admin build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          VITE_APP_NAME: Kahade Admin

      - name: Deploy to S3
        run: |
          aws s3 sync apps/admin/dist s3://${{ secrets.S3_BUCKET_ADMIN }} \
            --delete \
            --cache-control "public, max-age=31536000" \
            --exclude "*.html" \
            --exclude "*.json"
          aws s3 sync apps/admin/dist s3://${{ secrets.S3_BUCKET_ADMIN }} \
            --delete \
            --cache-control "no-cache" \
            --include "*.html" \
            --include "*.json"
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_DEFAULT_REGION: ${{ secrets.AWS_REGION }}

      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CF_DISTRIBUTION_ADMIN }} \
            --paths "/*"
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_DEFAULT_REGION: ${{ secrets.AWS_REGION }}
EOF

# PR Check (type-check + lint semua apps)
cat > "$MONO_DIR/.github/workflows/pr-check.yml" << 'EOF'
name: PR Check

on:
  pull_request:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v3
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Type check semua apps
        run: pnpm type-check

      - name: Lint semua apps
        run: pnpm lint

      - name: Build semua (pastikan tidak ada error)
        run: pnpm build
        env:
          VITE_API_URL: http://localhost:5000
          VITE_APP_NAME: Kahade
EOF

log_success "GitHub Actions selesai (4 workflows)"

# =============================================================================
# STEP 10 — README
# =============================================================================

log_step "Step 10: Membuat README"

cat > "$MONO_DIR/README.md" << 'EOF'
# Kahade Monorepo

Turborepo monorepo untuk Kahade — Platform Escrow P2P Indonesia.

## Struktur

```
kahade-monorepo/
├── apps/
│   ├── landing/      → kahade.id (halaman publik)
│   ├── dashboard/    → app.kahade.id (halaman user)
│   └── admin/        → admin.kahade.id (panel admin)
├── packages/
│   ├── ui/           → Shared UI components
│   ├── utils/        → Shared utilities & API
│   ├── types/        → Shared TypeScript types
│   └── config/       → Shared config
└── .github/workflows/ → CI/CD GitHub Actions
```

## Perintah

```bash
# Install semua dependencies
pnpm install

# Dev semua sekaligus
pnpm dev

# Dev satu app saja
pnpm dev:landing
pnpm dev:dashboard
pnpm dev:admin

# Build
pnpm build

# Build satu app
pnpm build:landing
pnpm build:dashboard
pnpm build:admin
```

## Setup GitHub Secrets

Tambahkan secrets berikut di repository GitHub:

| Secret | Keterangan |
|--------|-----------|
| `AWS_ACCESS_KEY_ID` | AWS IAM access key |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key |
| `AWS_REGION` | Region AWS (contoh: ap-southeast-1) |
| `VITE_API_URL` | URL backend API |
| `VITE_APP_DOMAIN` | URL dashboard (contoh: https://app.kahade.id) |
| `VITE_LANDING_DOMAIN` | URL landing (contoh: https://kahade.id) |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `S3_BUCKET_LANDING` | Nama S3 bucket untuk landing |
| `S3_BUCKET_DASHBOARD` | Nama S3 bucket untuk dashboard |
| `S3_BUCKET_ADMIN` | Nama S3 bucket untuk admin |
| `CF_DISTRIBUTION_LANDING` | CloudFront distribution ID landing |
| `CF_DISTRIBUTION_DASHBOARD` | CloudFront distribution ID dashboard |
| `CF_DISTRIBUTION_ADMIN` | CloudFront distribution ID admin |

## Setup AWS

1. Buat 3 S3 bucket (landing, dashboard, admin) dengan static website hosting
2. Buat 3 CloudFront distribution yang pointing ke masing-masing S3 bucket
3. Setup custom domain via Route 53 atau CNAME
4. Buat IAM user dengan permission S3 + CloudFront untuk GitHub Actions
EOF

log_success "README selesai"

# =============================================================================
# RINGKASAN
# =============================================================================

echo ""
echo -e "${BOLD}${GREEN}============================================${NC}"
echo -e "${BOLD}${GREEN}  Migrasi selesai!${NC}"
echo -e "${BOLD}${GREEN}============================================${NC}"
echo ""
echo -e "📁 Monorepo dibuat di: ${CYAN}$MONO_DIR${NC}"
echo ""
echo -e "${BOLD}Struktur yang dibuat:${NC}"
echo "  packages/ui       → $(ls $MONO_DIR/packages/ui/src/*.tsx 2>/dev/null | wc -l | tr -d ' ') UI components"
echo "  packages/utils    → $(ls $MONO_DIR/packages/utils/src/*.ts 2>/dev/null | wc -l | tr -d ' ') utility files"
echo "  packages/types    → 3 type files"
echo "  packages/config   → 2 config files"
echo "  apps/landing      → $(ls $MONO_DIR/apps/landing/src/pages/*.tsx 2>/dev/null | wc -l | tr -d ' ') halaman publik"
echo "  apps/dashboard    → $(ls $MONO_DIR/apps/dashboard/src/pages/auth/*.tsx $MONO_DIR/apps/dashboard/src/pages/dashboard/*.tsx 2>/dev/null | wc -l | tr -d ' ') halaman user"
echo "  apps/admin        → $(ls $MONO_DIR/apps/admin/src/pages/admin/*.tsx 2>/dev/null | wc -l | tr -d ' ') halaman admin"
echo "  .github/workflows → 4 CI/CD workflows"
echo ""
echo -e "${BOLD}Langkah selanjutnya:${NC}"
echo "  1. cd kahade-monorepo"
echo "  2. pnpm install"
echo "  3. pnpm dev:landing    ← test landing"
echo "  4. pnpm dev:dashboard  ← test dashboard"
echo "  5. pnpm dev:admin      ← test admin"
echo ""
echo -e "${YELLOW}⚠️  Cek manual jika ada import yang masih menggunakan path lama (@/components/...)${NC}"
echo -e "${YELLOW}   Jalankan: grep -r \"from '@/\" kahade-monorepo/apps/ --include='*.tsx'${NC}"
echo ""
