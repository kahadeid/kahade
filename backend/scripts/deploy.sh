#!/bin/bash
# Deployment Automation Scripts (MEDIUM-021)

set -e

echo "🚀 Starting deployment..."

# Configuration
ENV=${1:-production}
BRANCH=${2:-main}

echo "Environment: $ENV"
echo "Branch: $BRANCH"

# 1. Pre-deployment checks
echo "
🔍 Running pre-deployment checks..."

# Check if on correct branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
  echo "❌ Error: Not on $BRANCH branch"
  exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
  echo "❌ Error: Uncommitted changes detected"
  exit 1
fi

# Run tests
echo "
🧪 Running tests..."
npm run test
npm run test:e2e

# Run security audit
echo "
🔒 Running security audit..."
npm audit --production --audit-level=high

# Check TypeScript compilation
echo "
🔨 Checking TypeScript compilation..."
npm run build

# 2. Backup database
echo "
📦 Backing up database..."
./scripts/backup-database.sh

# 3. Pull latest code
echo "
💻 Pulling latest code..."
git pull origin $BRANCH

# 4. Install dependencies
echo "
📦 Installing dependencies..."
npm ci --production

# 5. Run database migrations
echo "
🗃️ Running database migrations..."
npx prisma migrate deploy

# 6. Build application
echo "
🔨 Building application..."
npm run build

# 7. Restart application
echo "
🔄 Restarting application..."
if [ "$ENV" = "production" ]; then
  pm2 restart kahade-api
else
  pm2 restart kahade-api-$ENV
fi

# 8. Health check
echo "
❤️ Running health check..."
sleep 5
HEALTH_STATUS=$(curl -s http://localhost:3000/health | jq -r '.status')

if [ "$HEALTH_STATUS" = "ok" ]; then
  echo "✅ Health check passed"
else
  echo "❌ Health check failed"
  echo "Rolling back..."
  pm2 restart kahade-api --update-env
  exit 1
fi

# 9. Clear caches
echo "
🧹 Clearing caches..."
redis-cli FLUSHDB

echo "
✅ Deployment completed successfully!"
echo "Deployed at: $(date)"

# Usage:
# ./scripts/deploy.sh production main
# ./scripts/deploy.sh staging develop
