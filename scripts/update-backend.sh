#!/usr/bin/env bash
# =============================================================================
# KAHADE - UPDATE BACKEND BUILD (Pull + Install + Build + Reload PM2)
# =============================================================================
# Usage:
#   bash scripts/update-backend.sh
#   bash scripts/update-backend.sh --skip-migrate
#   bash scripts/update-backend.sh --no-pull
# =============================================================================

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; NC='\033[0m'
log()     { echo -e "${GREEN}[✔]${NC} $*"; }
info()    { echo -e "${BLUE}[ℹ]${NC} $*"; }
warn()    { echo -e "${YELLOW}[⚠]${NC} $*"; }
error()   { echo -e "${RED}[✘]${NC} $*" >&2; exit 1; }
section() { echo -e "\n${CYAN}═══════════════════════════════════════════${NC}"; echo -e "${CYAN}  $*${NC}"; echo -e "${CYAN}═══════════════════════════════════════════${NC}"; }

SKIP_MIGRATE=false
SKIP_PULL=false
for arg in "$@"; do
  [[ "$arg" == "--skip-migrate" ]] && SKIP_MIGRATE=true
  [[ "$arg" == "--no-pull" ]] && SKIP_PULL=true
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$APP_DIR/.env.production"
ECOSYSTEM_FILE="$APP_DIR/ecosystem.config.prod.js"

[[ -f "$ENV_FILE" ]] || error ".env.production not found: $ENV_FILE"
[[ -f "$ECOSYSTEM_FILE" ]] || error "ecosystem.config.prod.js not found: $ECOSYSTEM_FILE"

section "⚙️  Kahade Backend Update"
info "App dir : $APP_DIR"

# ─── 1. Git pull ──────────────────────────────────────────────────────────────
if [[ "$SKIP_PULL" == "false" ]]; then
  section "1/5 Git Pull"
  cd "$APP_DIR"
  git pull origin "$(git rev-parse --abbrev-ref HEAD)"
  log "Code updated: $(git rev-parse --short HEAD)"
fi

# ─── 2. Install deps ──────────────────────────────────────────────────────────
section "2/5 Dependencies"
cd "$APP_DIR"

if [[ -f "pnpm-lock.yaml" ]] && command -v pnpm >/dev/null 2>&1; then
  pnpm install --frozen-lockfile --prod=false
elif [[ -f "package-lock.json" ]]; then
  npm ci --include=dev
else
  npm install --include=dev
fi
log "Dependencies ready"

# ─── 3. Prisma generate + migrate ─────────────────────────────────────────────
section "3/5 Prisma"
npm run prisma:generate
log "Prisma client generated"

if [[ "$SKIP_MIGRATE" == "false" ]]; then
  info "Running migrations..."
  NODE_ENV=production npm run prisma:migrate:deploy
  log "Migrations applied"
else
  warn "Skipping migrations (--skip-migrate)"
fi

# ─── 4. Build ─────────────────────────────────────────────────────────────────
section "4/5 Build"
NODE_ENV=production npm run build
log "Build complete → $(du -sh dist/ 2>/dev/null | cut -f1)"

# ─── 5. Reload PM2 ────────────────────────────────────────────────────────────
section "5/5 PM2 Reload"
set -a
source "$ENV_FILE"
set +a

if pm2 list | grep -q "kahade-api"; then
  pm2 reload "$ECOSYSTEM_FILE" --update-env
  log "PM2 reloaded (zero-downtime)"
else
  pm2 start "$ECOSYSTEM_FILE" --env production
  log "PM2 started"
fi
pm2 save

# Quick health check
sleep 3
PORT="${PORT:-3000}"
if curl -sf "http://localhost:${PORT}/api/v1/health" > /dev/null 2>&1; then
  log "Health check passed ✅"
else
  warn "Health check pending — check: pm2 logs kahade-api"
fi

section "✅ Backend Updated"
log "Commit: $(git rev-parse --short HEAD 2>/dev/null || echo 'n/a')"
