# 🚀 BACKEND QUICK START GUIDE

## Prerequisites
- Node.js 18+ installed
- PostgreSQL 14+ installed
- Redis installed (optional for development)
- npm or pnpm

---

## Setup (10 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
```bash
# Create PostgreSQL database
createdb kahade

# Or using psql
psql -U postgres
CREATE DATABASE kahade;
\q
```

### 3. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/kahade?schema=public"
JWT_SECRET=your-super-secret-jwt-key-change-this
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 4. Generate Prisma Client
```bash
npm run prisma:generate
```

### 5. Run Migrations
```bash
npm run prisma:migrate:deploy
```

### 6. (Optional) Seed Database
```bash
npm run seed
```

### 7. Start Development Server
```bash
npm run start:dev
```

### 8. Verify Installation
```bash
# Health check
curl http://localhost:5000/api/health

# API docs (Swagger)
open http://localhost:5000/api/docs
```

---

## 🎉 Success!

Your backend is now running at:
- **API**: http://localhost:5000
- **Swagger Docs**: http://localhost:5000/api/docs
- **Health Check**: http://localhost:5000/api/health
- **Metrics**: http://localhost:9090/metrics

---

## Common Issues

### Issue: "Cannot find module '@nestjs/schedule'"
**Solution**: Run `npm install` (packages were missing, now fixed in package.json)

### Issue: "Prisma Client did not initialize yet"
**Solution**: Run `npm run prisma:generate`

### Issue: "Database connection failed"
**Solution**: Check DATABASE_URL in .env, ensure PostgreSQL is running

### Issue: "Redis connection failed"
**Solution**: 
- Install Redis: `brew install redis` (Mac) or `apt install redis` (Ubuntu)
- Start Redis: `redis-server`
- Or disable Redis features in development

### Issue: "Port 5000 already in use"
**Solution**: Change PORT in .env or kill existing process:
```bash
lsof -ti:5000 | xargs kill -9
```

---

## Development Scripts

```bash
# Start development with hot-reload
npm run start:dev

# Build for production
npm run build

# Start production
npm run start:prod

# Run tests
npm run test

# Run tests with coverage
npm run test:cov

# Run E2E tests
npm run test:e2e

# Format code
npm run format

# Lint code
npm run lint

# Prisma Studio (Database GUI)
npm run prisma:studio
```

---

## Project Structure

```
backend/
├── src/
│   ├── main.ts              # Entry point
│   ├── app.module.ts        # Root module
│   ├── core/                # Business logic
│   │   ├── auth/
│   │   ├── user/
│   │   ├── transaction/
│   │   └── ...
│   ├── common/              # Shared code
│   ├── config/              # Configuration
│   ├── infrastructure/      # Database, cache, queue
│   └── integrations/        # External services
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Database migrations
└── test/                    # E2E tests
```

---

## Environment Variables (Essential)

### Must Configure
- `DATABASE_URL` - PostgreSQL connection
- `JWT_SECRET` - Authentication secret
- `REDIS_HOST` - Redis host (if using cache)

### Optional (Development)
- `PORT` - API port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - Allowed origins

### Production Only
- `SMTP_*` - Email configuration
- `PAYMENT_*` - Payment gateway
- `KYC_*` - KYC provider
- `SENTRY_DSN` - Error tracking

---

## API Documentation

Once running, access Swagger docs at:
**http://localhost:5000/api/docs**

Available endpoints:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/transactions/create` - Create transaction
- `GET /api/wallet/balance` - Get wallet balance
- And many more...

---

## Testing

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

---

## Database Management

```bash
# Create migration
npm run prisma:migrate dev --name migration-name

# Apply migrations
npm run prisma:migrate:deploy

# Reset database (WARNING: deletes all data)
npm run prisma:migrate:reset

# Open Prisma Studio
npm run prisma:studio
```

---

## Production Deployment

1. **Build**:
   ```bash
   npm run build
   ```

2. **Set Production Environment**:
   ```bash
   cp .env.example .env.production
   # Edit .env.production
   ```

3. **Run Migrations**:
   ```bash
   NODE_ENV=production npm run prisma:migrate:deploy
   ```

4. **Start**:
   ```bash
   NODE_ENV=production npm run start:prod
   ```

Or use PM2:
```bash
pm2 start ecosystem.config.js --env production
```

Or use Docker:
```bash
docker-compose up -d
```

---

## Need Help?

1. Check **README.md** for detailed documentation
2. Review **BACKEND_AUDIT_COMPLETE.md** for audit findings
3. Visit API docs at http://localhost:5000/api/docs
4. Check logs in `./logs` directory

---

**Status**: ✅ Build Ready
**Last Updated**: February 15, 2026
**Dependencies**: All included in package.json
