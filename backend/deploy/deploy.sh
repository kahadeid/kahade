#!/usr/bin/env bash
# =============================================================================
# KAHADE BACKEND - PRODUCTION DEPLOY SCRIPT
# =============================================================================
# Usage:
#   ./deploy/deploy.sh              → Full production deploy
#   ./deploy/deploy.sh --skip-migrate  → Skip DB migrations
#   ./deploy/deploy.sh --rollback   → Rollback to previous PM2 version
# =============================================================================

set -euo pipefail

# ─── Colors ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; NC='\033[0m'

log()     { echo -e "${GREEN}[✔]${NC} $*"; }
info()    { echo -e "${BLUE}[ℹ]${NC} $*"; }
warn()    { echo -e "${YELLOW}[⚠]${NC} $*"; }
error()   { echo -e "${RED}[✘]${NC} $*" >&2; }
section() { echo -e "\n${CYAN}══════════════════════════════════════════════${NC}"; echo -e "${CYAN}  $*${NC}"; echo -e "${CYAN}══════════════════════════════════════════════${NC}"; }

# ─── Args ─────────────────────────────────────────────────────────────────────
SKIP_MIGRATE=false
ROLLBACK=false
for arg in "$@"; do
  case "$arg" in
    --skip-migrate) SKIP_MIGRATE=true ;;
    --rollback)     ROLLBACK=true ;;
  esac
done

# ─── Paths ────────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$APP_DIR/.env.production"
ECOSYSTEM_FILE="$APP_DIR/ecosystem.config.prod.js"
LOG_DIR="/var/log/kahade"
UPLOAD_DIR="/var/www/kahade/uploads"
BACKUP_DIR="/var/backups/kahade"

# ─── Rollback ─────────────────────────────────────────────────────────────────
if [[ "$ROLLBACK" == "true" ]]; then
  section "🔄 Rolling Back"
  cd "$APP_DIR"
  pm2 revert "$ECOSYSTEM_FILE" 2>/dev/null || { error "PM2 rollback failed"; exit 1; }
  log "Rollback complete"
  exit 0
fi

section "🚀 Kahade Production Deployment"
info "App dir  : $APP_DIR"
info "Env file : $ENV_FILE"
info "Started  : $(date '+%Y-%m-%d %H:%M:%S %Z')"

# ─── 1. Pre-flight checks ─────────────────────────────────────────────────────
section "1/9 Pre-flight Checks"

# Node version
NODE_VER=$(node -e "process.exit(parseInt(process.versions.node.split('.')[0]) < 18 ? 1 : 0)" 2>&1 && node --version)
log "Node: $NODE_VER"

# PM2 installed
command -v pm2 >/dev/null 2>&1 || { error "PM2 not found. Install: npm i -g pm2"; exit 1; }
log "PM2: $(pm2 --version)"

# .env.production exists
[[ -f "$ENV_FILE" ]] || { error ".env.production not found at $ENV_FILE"; exit 1; }
log ".env.production found"

# Ecosystem config exists
[[ -f "$ECOSYSTEM_FILE" ]] || { error "ecosystem.config.prod.js not found"; exit 1; }
log "ecosystem.config.prod.js found"

# Required env vars
source "$ENV_FILE" 2>/dev/null || { error "Cannot load $ENV_FILE"; exit 1; }

REQUIRED_VARS=(DATABASE_URL JWT_SECRET JWT_REFRESH_SECRET COOKIE_SECRET ENCRYPTION_KEY)
for var in "${REQUIRED_VARS[@]}"; do
  val="${!var:-}"
  if [[ -z "$val" ]]; then
    error "Required env var missing: $var"
    exit 1
  fi
  # Warn if still using dev/placeholder values
  if [[ "$val" == *"dev-"* ]] || [[ "$val" == *"[REQUIRED"* ]]; then
    error "Env var $var still has placeholder/dev value! Update .env.production"
    exit 1
  fi
done
log "All required env vars set"

# ─── 2. Create directories ────────────────────────────────────────────────────
section "2/9 Directories"
for dir in "$LOG_DIR" "$UPLOAD_DIR" "$BACKUP_DIR"; do
  if [[ ! -d "$dir" ]]; then
    sudo mkdir -p "$dir"
    sudo chown "$(whoami)":"$(whoami)" "$dir"
    log "Created: $dir"
  else
    info "Exists:  $dir"
  fi
done

# ─── 3. Pull latest code ──────────────────────────────────────────────────────
section "3/9 Git Pull"
cd "$APP_DIR"

if git rev-parse --git-dir > /dev/null 2>&1; then
  CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
  info "Branch: $CURRENT_BRANCH"
  git fetch origin
  git pull origin "$CURRENT_BRANCH"
  log "Code updated: $(git rev-parse --short HEAD)"
else
  warn "Not a git repo – skipping git pull"
fi

# ─── 4. Install dependencies ──────────────────────────────────────────────────
section "4/9 Dependencies"

# Detect package manager (prefer npm since engines field specifies npm)
if [[ -f "pnpm-lock.yaml" ]] && command -v pnpm >/dev/null 2>&1; then
  info "Using pnpm"
  pnpm install --frozen-lockfile --prod=false
elif [[ -f "package-lock.json" ]]; then
  info "Using npm ci"
  npm ci --include=dev
else
  info "Using npm install"
  npm install --include=dev
fi
log "Dependencies installed"

# ─── 5. Generate Prisma client ────────────────────────────────────────────────
section "5/9 Prisma Generate"
npm run prisma:generate
log "Prisma client generated"

# ─── 6. Database migrations ───────────────────────────────────────────────────
section "6/9 Database Migrations"

if [[ "$SKIP_MIGRATE" == "true" ]]; then
  warn "Skipping migrations (--skip-migrate flag)"
else
  # Test DB connection first
  info "Testing database connection..."
  NODE_ENV=production node -e "
    const { PrismaClient } = require('@prisma/client');
    const p = new PrismaClient();
    p.\$connect().then(() => { console.log('DB OK'); p.\$disconnect(); process.exit(0); })
      .catch(e => { console.error('DB Error:', e.message); process.exit(1); });
  " || { error "Database connection failed. Check DATABASE_URL in .env.production"; exit 1; }

  npm run prisma:migrate:deploy
  log "Migrations applied"
fi

# ─── 7. Build application ─────────────────────────────────────────────────────
section "7/9 Build"
NODE_ENV=production npm run build
log "Build complete → $(du -sh dist/ 2>/dev/null | cut -f1) dist"

# ─── 8. Start / Reload PM2 ───────────────────────────────────────────────────
section "8/9 PM2 Reload"

# Load .env.production into current shell so PM2 picks it up
set -a
source "$ENV_FILE"
set +a

if pm2 list | grep -q "kahade-api"; then
  info "Reloading existing PM2 process..."
  pm2 reload "$ECOSYSTEM_FILE" --update-env
else
  info "Starting PM2 for the first time..."
  pm2 start "$ECOSYSTEM_FILE"
fi

# Save PM2 process list (for startup)
pm2 save
log "PM2 process saved"

# ─── 9. Health check ─────────────────────────────────────────────────────────
section "9/9 Health Check"
PORT="${PORT:-3000}"
HEALTH_URL="http://localhost:${PORT}/api/v1/health"
MAX_WAIT=60
WAIT=0

info "Waiting for app to start (max ${MAX_WAIT}s)..."
until curl -sf "$HEALTH_URL" > /dev/null 2>&1; do
  sleep 2
  WAIT=$((WAIT + 2))
  if [[ $WAIT -ge $MAX_WAIT ]]; then
    error "Health check failed after ${MAX_WAIT}s: $HEALTH_URL"
    error "PM2 logs:"
    pm2 logs kahade-api --lines 30 --nostream 2>/dev/null || true
    exit 1
  fi
  echo -n "."
done
echo ""

HEALTH_RESP=$(curl -sf "$HEALTH_URL" 2>/dev/null || echo '{}')
log "Health check passed: $HEALTH_RESP"

# ─── Done ─────────────────────────────────────────────────────────────────────
section "✅ Deployment Complete"
log "Time     : $(date '+%Y-%m-%d %H:%M:%S %Z')"
log "Commit   : $(git rev-parse --short HEAD 2>/dev/null || echo 'n/a')"
log "Process  : $(pm2 list | grep kahade-api | awk '{print $10}' | head -1)"
log "App URL  : http://localhost:${PORT}/api/v1"
log "Health   : $HEALTH_URL"
echo ""
info "Run 'pm2 logs kahade-api' to tail logs"
info "Run 'pm2 monit' for live monitoring"
