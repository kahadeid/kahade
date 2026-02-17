#!/bin/bash
# Production Deployment Script - Fixed for Kahade Backend

set -e

echo "🚀 Starting deployment..."

# Configuration
ENV=${1:-production}
BRANCH=${2:-master}  # Changed default from 'main' to 'master'

echo "Environment: $ENV"
echo "Branch: $BRANCH"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Pre-deployment checks
echo ""
echo "🔍 Running pre-deployment checks..."

# Check if on correct branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
  echo -e "${YELLOW}⚠️  Warning: Current branch is $CURRENT_BRANCH, expected $BRANCH${NC}"
  read -p "Continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Deployment cancelled${NC}"
    exit 1
  fi
else
  echo -e "${GREEN}✅ On correct branch: $CURRENT_BRANCH${NC}"
fi

# Check for uncommitted changes (warning only)
if [ -n "$(git status --porcelain)" ]; then
  echo -e "${YELLOW}⚠️  Warning: Uncommitted changes detected${NC}"
  git status --short
  read -p "Continue with uncommitted changes? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Deployment cancelled${NC}"
    exit 1
  fi
fi

# Check if .env file exists
if [ ! -f .env ]; then
  echo -e "${RED}❌ Error: .env file not found${NC}"
  echo "Please create .env file with required environment variables"
  exit 1
fi

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL" .env; then
  echo -e "${RED}❌ Error: DATABASE_URL not found in .env${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Pre-deployment checks passed${NC}"

# 2. Backup database (optional - skip if script doesn't exist)
echo ""
echo "📦 Backing up database..."
if [ -f ./scripts/backup-database.sh ]; then
  ./scripts/backup-database.sh || echo -e "${YELLOW}⚠️  Database backup failed (continuing anyway)${NC}"
else
  echo -e "${YELLOW}⚠️  Backup script not found, skipping backup${NC}"
fi

# 3. Pull latest code (optional)
echo ""
echo "💻 Checking for updates..."
if git diff-index --quiet HEAD --; then
  echo "Pulling latest code from origin/$BRANCH..."
  git pull origin $BRANCH || echo -e "${YELLOW}⚠️  Git pull failed (continuing with local changes)${NC}"
else
  echo -e "${YELLOW}⚠️  Local changes detected, skipping git pull${NC}"
fi

# 4. Install dependencies
echo ""
echo "📦 Installing dependencies..."
if command -v pnpm &> /dev/null; then
  echo "Using pnpm..."
  pnpm install --frozen-lockfile --prod=false
elif command -v npm &> /dev/null; then
  echo "Using npm..."
  npm ci
else
  echo -e "${RED}❌ Error: No package manager found (npm/pnpm)${NC}"
  exit 1
fi

# 5. Generate Prisma Client
echo ""
echo "🔧 Generating Prisma Client..."
npx prisma generate

# 6. Run database migrations
echo ""
echo "🗃️  Running database migrations..."
npx prisma migrate deploy

echo -e "${GREEN}✅ Database migrations completed${NC}"

# 7. Build application
echo ""
echo "🔨 Building application..."
rm -rf dist
pnpm build || npm run build

echo -e "${GREEN}✅ Build completed${NC}"

# 8. Restart application with PM2
echo ""
echo "🔄 Restarting application..."

PM2_APP_NAME="kahade-api"
if [ "$ENV" != "production" ]; then
  PM2_APP_NAME="kahade-api-$ENV"
fi

if pm2 list | grep -q $PM2_APP_NAME; then
  echo "Restarting existing PM2 process: $PM2_APP_NAME"
  pm2 restart $PM2_APP_NAME --update-env
else
  echo "Starting new PM2 process: $PM2_APP_NAME"
  pm2 start dist/main.js --name $PM2_APP_NAME \
    --env $ENV \
    --max-memory-restart 500M \
    --node-args="--max-old-space-size=460"
fi

# Save PM2 configuration
pm2 save

echo -e "${GREEN}✅ Application restarted${NC}"

# 9. Health check
echo ""
echo "❤️  Running health check..."
sleep 5

# Try to get health status
HEALTH_CHECK=$(curl -s http://localhost:3000/health 2>/dev/null || echo '{"status":"unknown"}')
HEALTH_STATUS=$(echo $HEALTH_CHECK | jq -r '.status' 2>/dev/null || echo "unknown")

if [ "$HEALTH_STATUS" = "ok" ] || [ "$HEALTH_STATUS" = "healthy" ]; then
  echo -e "${GREEN}✅ Health check passed${NC}"
  echo "Response: $HEALTH_CHECK"
else
  echo -e "${YELLOW}⚠️  Health check returned: $HEALTH_STATUS${NC}"
  echo "Response: $HEALTH_CHECK"
  echo ""
  echo "Checking application logs..."
  pm2 logs $PM2_APP_NAME --lines 20 --nostream
  echo ""
  echo -e "${YELLOW}⚠️  Please verify application manually${NC}"
fi

# 10. Clear caches (optional)
echo ""
echo "🧹 Clearing caches..."
if command -v redis-cli &> /dev/null; then
  redis-cli FLUSHDB 2>/dev/null || echo -e "${YELLOW}⚠️  Redis cache clear failed (might not be running)${NC}"
else
  echo -e "${YELLOW}⚠️  redis-cli not found, skipping cache clear${NC}"
fi

# 11. Show deployment summary
echo ""
echo "="================================================================="
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo "="================================================================="
echo "Environment:     $ENV"
echo "Branch:          $CURRENT_BRANCH"
echo "Deployed at:     $(date)"
echo "PM2 Process:     $PM2_APP_NAME"
echo ""
echo "Useful commands:"
echo "  📊 Status:     pm2 status"
echo "  📝 Logs:       pm2 logs $PM2_APP_NAME"
echo "  🔄 Restart:    pm2 restart $PM2_APP_NAME"
echo "  ⏹️  Stop:       pm2 stop $PM2_APP_NAME"
echo "  🖥️  Monitor:    pm2 monit"
echo "="================================================================="
echo ""

# Usage examples:
# ./scripts/deploy.sh production master
# ./scripts/deploy.sh staging develop
# ./scripts/deploy.sh development
