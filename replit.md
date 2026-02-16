# Kahade Platform

## Overview
Kahade is an Indonesian P2P escrow platform (Platform Escrow P2P Terpercaya Indonesia). It provides secure transaction handling with escrow protection, KYC verification, and 24/7 support.

## Current State
- Frontend (React/Vite) is running on port 5000
- Backend (NestJS) is not yet configured to run on Replit
- The app runs in "landing" mode by default (configurable via VITE_APP_MODE)

## Project Architecture

### Frontend (`/frontend`)
- **Framework**: React 18 with TypeScript
- **Build tool**: Vite 5
- **Styling**: Tailwind CSS v4 with custom design system
- **Routing**: Wouter
- **State**: React Context (AuthContext, ThemeContext)
- **i18n**: i18next (Indonesian/English)
- **UI Components**: Radix UI primitives with custom styling
- **Icons**: Phosphor Icons, Lucide React
- **Fonts**: Amazon Ember (custom font files in `/frontend/public/fonts/`)

### Backend (`/backend`)
- **Framework**: NestJS 10
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: JWT with passport
- **Queue**: Bull (Redis-backed)
- **API Docs**: Swagger

### Key Config Files
- `frontend/.env` - Frontend environment variables
- `frontend/vite.config.ts` - Vite config (port 5000, host 0.0.0.0)
- `frontend/src/config/env.validation.ts` - Env var validation with Zod
- `frontend/src/config/app.config.ts` - App mode & URL configuration

### App Modes
- `landing` - Public landing page (default)
- `app` - User dashboard (protected routes)
- `admin` - Admin panel (admin-only routes)

Set via `VITE_APP_MODE` in `frontend/.env`

## Recent Changes
- 2026-02-16: Initial Replit setup
  - Created missing `app.config.ts` with exports (getAppMode, APP_URLS, navigateToApp, navigateToAdmin, canAccessAdmin)
  - Created `vite-env.d.ts` for Vite type declarations
  - Fixed 801 corrupted className attributes (aria-hidden was injected inside className strings)
  - Fixed duplicate aria-hidden attributes across components
  - Fixed Sonner toaster component (removed next-themes dependency)
  - Fixed env validation to handle empty optional URL fields
  - Installed missing npm packages (i18next-browser-languagedetector, react-hook-form, dayjs, radix-ui components, etc.)
  - Created placeholder fonts/style.css
  - Updated VITE_API_BASE_URL to match Replit domain

## User Preferences
- Indonesian language (Bahasa Indonesia) is the primary locale
