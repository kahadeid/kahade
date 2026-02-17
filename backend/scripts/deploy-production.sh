#!/bin/bash
# Production Deployment Script - Clean Build Without Swagger

set -e

echo "🚀 Production Build & Deploy"
echo "============================="

# Navigate to backend directory
cd "$(dirname "$0")/.."

echo ""
echo "📁 Working directory: $(pwd)"
echo ""

# 1. Backup original nest-cli.json
echo "💾 Backing up nest-cli.json..."
if [ -f nest-cli.json ]; then
  cp nest-cli.json nest-cli.json.dev.backup
  echo "✅ Backup created: nest-cli.json.dev.backup"
fi

# 2. Use production config (without Swagger plugins)
echo ""
echo "🔧 Switching to production config..."
if [ -f nest-cli.production.json ]; then
  cp nest-cli.production.json nest-cli.json
  echo "✅ Using nest-cli.production.json (Swagger disabled)"
else
  echo "⚠️  nest-cli.production.json not found, using default"
fi

# 3. Clean build directory
echo ""
echo "🧹 Cleaning dist directory..."
rm -rf dist
echo "✅ Cleaned"

# 4. Generate Prisma Client
echo ""
echo "🔧 Generating Prisma Client..."
npx prisma generate
echo "✅ Prisma Client generated"

# 5. Build application
echo ""
echo "🔨 Building application..."
if command -v pnpm &> /dev/null; then
  pnpm build
else
  npm run build
fi
echo "✅ Build successful"

# 6. Restore original config
echo ""
echo "♻️  Restoring original nest-cli.json..."
if [ -f nest-cli.json.dev.backup ]; then
  mv nest-cli.json.dev.backup nest-cli.json
  echo "✅ Development config restored"
fi

# 7. Run database migrations
echo ""
echo "🗃️  Running database migrations..."
npx prisma migrate deploy
echo "✅ Migrations completed"

# 8. Restart PM2 process
echo ""
echo "🔄 Restarting application..."
if pm2 list | grep -q kahade-api; then
  pm2 restart kahade-api --update-env
  echo "✅ Application restarted"
else
  echo "Starting new PM2 process..."
  pm2 start dist/main.js --name kahade-api \
    --env production \
    --max-memory-restart 500M \
    --node-args="--max-old-space-size=460"
  echo "✅ Application started"
fi

# 9. Save PM2 configuration
pm2 save
echo "✅ PM2 configuration saved"

# 10. Health check
echo ""
echo "❤️  Running health check..."
sleep 3

HEALTH_RESPONSE=$(curl -s http://localhost:3000/health 2>/dev/null || echo '{"status":"unknown"}')
HEALTH_STATUS=$(echo $HEALTH_RESPONSE | jq -r '.status' 2>/dev/null || echo "unknown")

if [ "$HEALTH_STATUS" = "ok" ] || [ "$HEALTH_STATUS" = "healthy" ]; then
  echo "✅ Health check passed"
  echo "Response: $HEALTH_RESPONSE"
else
  echo "⚠️  Health check: $HEALTH_STATUS"
  echo "Response: $HEALTH_RESPONSE"
fi

# 11. Show recent logs
echo ""
echo "📝 Recent application logs:"
echo "============================="
pm2 logs kahade-api --lines 15 --nostream

# 12. Summary
echo ""
echo "============================="
echo "✅ Deployment completed!"
echo "============================="
echo "Deployed at: $(date)"
echo ""
echo "Useful commands:"
echo "  📊 Status:     pm2 status"
echo "  📝 Logs:       pm2 logs kahade-api"
echo "  📈 Monitor:    pm2 monit"
echo "  🔄 Restart:    pm2 restart kahade-api"
echo "  ⏹️  Stop:       pm2 stop kahade-api"
echo "============================="
