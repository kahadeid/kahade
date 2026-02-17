# Kahade Platform - Enterprise Escrow Platform

## Overview
Kahade is an enterprise-grade P2P escrow platform built with a NestJS backend and React (Vite) frontend. It provides secure transaction handling, KYC verification, wallet management, and dispute resolution.

## Project Architecture
- **Frontend**: React + Vite + Tailwind CSS v4, served on port 5000
- **Backend**: NestJS with Prisma ORM, runs on port 3001
- **Database**: PostgreSQL (Replit-managed via DATABASE_URL)
- **Proxy**: Frontend proxies `/api` requests to backend on port 3001

## Directory Structure
```
/backend       - NestJS backend API
  /src         - Source code (modules, controllers, services)
  /prisma      - Database schema and migrations
  /.env        - Environment configuration
/frontend      - React + Vite frontend
  /src         - React components, pages, hooks
```

## Key Configuration
- Backend port: 3001 (configured in backend/.env)
- Frontend port: 5000 (configured in frontend/vite.config.ts)
- Vite proxies `/api` to `http://localhost:3001`
- CORS: All origins allowed in development mode
- Redis: Disabled (REDIS_ENABLED=false), using in-memory fallback
- Database: Prisma with PostgreSQL, migrations applied

## Running
Single workflow runs both:
- `cd backend && npm run start:dev` (backend with hot reload)
- `cd frontend && npm run dev` (Vite dev server)

## Deployment
- Build: Frontend `npm run build`, Backend `nest build`
- Production: Backend serves on port 5000 with `node dist/main`
