# Kahade - Enterprise Escrow Platform

## Overview
Kahade is an enterprise-grade escrow platform built with a NestJS backend and React (Vite) frontend. It provides secure transaction escrow services with features including KYC, wallet management, dispute resolution, messaging, and payment gateway integration.

## Project Architecture
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS v4 (port 5000)
  - Uses wouter for routing, axios for API calls, i18next for localization (Indonesian/English)
  - Radix UI components with shadcn-style patterns
  - Located in `/frontend`
- **Backend**: NestJS 10 + Prisma ORM + PostgreSQL (port 3001)
  - RESTful API with versioning, Swagger docs at `/api/docs`
  - Modular architecture: core/, infrastructure/, integrations/, security/, jobs/
  - Located in `/backend`
- **Database**: PostgreSQL (Replit built-in, Neon-backed)
  - Prisma ORM with migrations in `/backend/prisma/migrations`

## Key Configuration
- Frontend Vite dev server: `0.0.0.0:5000` with `allowedHosts: true`
- Backend NestJS: `0.0.0.0:3001`
- Vite proxy: `/api` -> `http://localhost:3001`
- Frontend env: `/frontend/.env` (VITE_API_BASE_URL=/api)
- Backend env: `/backend/.env` (DATABASE_URL from Replit env)
- CORS configured for Replit domain
- Redis disabled (in-memory fallback for cache/queues)

## Recent Changes
- 2026-02-16: Initial Replit setup
  - Installed missing npm dependencies (nodemailer, otplib, qrcode, etc.)
  - Fixed CacheModule missing import
  - Created stub email/notification processors
  - Fixed IsBigInt validator (not in class-validator)
  - Allowed empty SMTP_HOST/SMTP_USER in env validation
  - Relaxed VITE_API_BASE_URL validation to accept relative paths
  - Configured DATABASE_URL to use Replit PostgreSQL
  - Ran Prisma migrations

## User Preferences
- None recorded yet
