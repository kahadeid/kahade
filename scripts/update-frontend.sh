#!/usr/bin/env bash
# =============================================================================
# KAHADE - UPDATE FRONTEND (Pull + Build + Deploy)
# =============================================================================
# Usage:
#   bash scripts/update-frontend.sh
#   bash scripts/update-frontend.sh --no-pull   (skip git pull)
# =============================================================================

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; NC='\033[0m'
log()     { echo -e "${GREEN}[✔]${NC} $*"; }
info()    { echo -e "${BLUE}[ℹ]${NC} $*"; }
warn()    { echo -e "${YELLOW}[⚠]${NC} $*"; }
error()   { echo -e "${RED}[✘]${NC} $*" >&2; exit 1; }
section() { echo -e "\n${CYAN}═══════════════════════════════════════════${NC}"; echo -e "${CYAN}  $*${NC}"; echo -e "${CYAN}═══════════════════════════════════════════${NC}"; }

# ─── Config ──────────────────────────────────────────────────────────────────
SKIP_PULL=false
for arg in "$@"; do
  [[ "$arg" == "--no-pull" ]] && SKIP_PULL=true
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
FRONTEND_DIR="${FRONTEND_DIR:-$APP_ROOT/../frontend}"
DEPLOY_DIR="${DEPLOY_DIR:-/var/www/kahade/frontend}"

[[ -d "$FRONTEND_DIR" ]] || error "Frontend dir not found: $FRONTEND_DIR (set FRONTEND_DIR env var)"

section "🎨 Kahade Frontend Update"
info "Frontend: $FRONTEND_DIR"
info "Deploy:   $DEPLOY_DIR"

# ─── 1. Git pull ──────────────────────────────────────────────────────────────
if [[ "$SKIP_PULL" == "false" ]]; then
  section "1/4 Git Pull"
  cd "$APP_ROOT"
  git pull origin "$(git rev-parse --abbrev-ref HEAD)"
  log "Code updated: $(git rev-parse --short HEAD)"
else
  info "Skipping git pull (--no-pull)"
fi

# ─── 2. Install deps ──────────────────────────────────────────────────────────
section "2/4 Install Dependencies"
cd "$FRONTEND_DIR"

if [[ -f "package-lock.json" ]]; then
  npm ci
elif [[ -f "pnpm-lock.yaml" ]] && command -v pnpm >/dev/null 2>&1; then
  pnpm install --frozen-lockfile
else
  npm install
fi
log "Dependencies installed"

# ─── 3. Build ─────────────────────────────────────────────────────────────────
section "3/4 Build"
NODE_ENV=production npm run build
BUILD_SIZE=$(du -sh dist/ 2>/dev/null | cut -f1 || echo "?")
log "Build complete → $BUILD_SIZE"

# ─── 4. Deploy dist ───────────────────────────────────────────────────────────
section "4/4 Deploy Static Files"
mkdir -p "$DEPLOY_DIR"

# Backup current if exists
if [[ -d "$DEPLOY_DIR/dist" ]]; then
  mv "$DEPLOY_DIR/dist" "$DEPLOY_DIR/dist.bak.$(date +%Y%m%d-%H%M%S)"
fi

cp -r dist "$DEPLOY_DIR/"
log "Files deployed to $DEPLOY_DIR/dist"

# Reload nginx to pick up any changes
if command -v nginx >/dev/null 2>&1; then
  sudo nginx -t && sudo nginx -s reload
  log "Nginx reloaded"
fi

section "✅ Frontend Updated"
log "Commit : $(git rev-parse --short HEAD 2>/dev/null || echo 'n/a')"
log "Size   : $BUILD_SIZE"
log "URL    : https://kahade.id"
