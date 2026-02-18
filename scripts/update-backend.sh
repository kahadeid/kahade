#!/usr/bin/env bash
# =============================================================================
# KAHADE - UPDATE BACKEND (Pull → Rsync → Install → Build → Reload PM2)
# =============================================================================
# Usage (dari repo root atau folder mana saja):
#   bash scripts/update-backend.sh
#   bash scripts/update-backend.sh --skip-migrate
#   bash scripts/update-backend.sh --no-pull
#
# Struktur server:
#   Repo     : ~/kahade/                          (git pull di sini)
#   Deployed : /var/www/kahade/backend/           (install + build + run PM2)
#   Env file : /var/www/kahade/backend/.env.production
#   PM2 user : kahade
# =============================================================================

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; NC='\033[0m'
log()     { echo -e "${GREEN}[✔]${NC} $*"; }
info()    { echo -e "${BLUE}[ℹ]${NC} $*"; }
warn()    { echo -e "${YELLOW}[⚠]${NC} $*"; }
error()   { echo -e "${RED}[✘]${NC} $*" >&2; exit 1; }
section() { echo -e "\n${CYAN}═══════════════════════════════════════════${NC}"; echo -e "${CYAN}  $*${NC}"; echo -e "${CYAN}═══════════════════════════════════════════${NC}"; }

# ─── Flags ────────────────────────────────────────────────────────────────────
SKIP_MIGRATE=false
SKIP_PULL=false
for arg in "$@"; do
  [[ "$arg" == "--skip-migrate" ]] && SKIP_MIGRATE=true
  [[ "$arg" == "--no-pull"      ]] && SKIP_PULL=true
done

# ─── Paths ────────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Script ada di scripts/ → repo root ada satu level di atas
if [[ -d "$SCRIPT_DIR/../backend" && -d "$SCRIPT_DIR/../frontend" ]]; then
  REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
elif [[ -d "$SCRIPT_DIR/backend" && -d "$SCRIPT_DIR/frontend" ]]; then
  REPO_ROOT="$SCRIPT_DIR"
else
  error "Tidak bisa menemukan repo root. Jalankan dari dalam project Kahade."
fi

BACKEND_SRC="$REPO_ROOT/backend"           # source code di git repo
BACKEND_DEPLOY="/var/www/kahade/backend"   # lokasi running di server
DEPLOY_USER="kahade"

ENV_FILE="$BACKEND_DEPLOY/.env.production"
ECOSYSTEM_FILE="$BACKEND_DEPLOY/ecosystem.config.prod.js"

[[ -d "$BACKEND_SRC"    ]] || error "Backend source tidak ditemukan: $BACKEND_SRC"
[[ -d "$BACKEND_DEPLOY" ]] || error "Backend deploy dir tidak ditemukan: $BACKEND_DEPLOY — jalankan deploy.sh dulu"
[[ -f "$ENV_FILE"       ]] || error ".env.production tidak ditemukan: $ENV_FILE"
[[ -f "$ECOSYSTEM_FILE" ]] || error "ecosystem.config.prod.js tidak ditemukan: $ECOSYSTEM_FILE"

section "⚙️  Kahade Backend Update"
info "Repo     : $REPO_ROOT"
info "Deployed : $BACKEND_DEPLOY"
info "PM2 user : $DEPLOY_USER"

# ─── 1. Git pull ──────────────────────────────────────────────────────────────
if [[ "$SKIP_PULL" == "false" ]]; then
  section "1/5 Git Pull"
  cd "$REPO_ROOT"
  git pull origin "$(git rev-parse --abbrev-ref HEAD)"
  log "Code updated: $(git rev-parse --short HEAD)"
else
  info "Skipping git pull (--no-pull)"
fi

# ─── 2. Rsync source → deploy dir ─────────────────────────────────────────────
# PENTING: exclude .env* agar credentials di server tidak tertimpa oleh repo
section "2/5 Rsync Source → Deploy"
rsync -a --delete \
  --exclude='.env*' \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='.pnpm-store' \
  --exclude='ecosystem.config.prod.js' \
  "$BACKEND_SRC/" "$BACKEND_DEPLOY/"

# Kembalikan kepemilikan ke deploy user setelah rsync (rsync dilakukan sebagai dafenka/root)
chown -R "$DEPLOY_USER:$DEPLOY_USER" "$BACKEND_DEPLOY"
log "Source synced ke $BACKEND_DEPLOY"

# ─── 3. Install dependencies ──────────────────────────────────────────────────
section "3/5 Dependencies"
sudo -u "$DEPLOY_USER" bash -c "
  cd '$BACKEND_DEPLOY'
  if [[ -f pnpm-lock.yaml ]] && command -v pnpm >/dev/null 2>&1; then
    pnpm install --frozen-lockfile 2>&1 | tail -5 \
      || pnpm install 2>&1 | tail -5
  elif [[ -f package-lock.json ]]; then
    npm ci --include=dev
  else
    npm install --include=dev
  fi
"
log "Dependencies ready"

# ─── 4. Prisma generate + migrate ─────────────────────────────────────────────
section "4/5 Prisma"
MIGRATE_DB_URL="$(grep '^DATABASE_URL=' "$ENV_FILE" | cut -d'=' -f2-)"
[[ -z "$MIGRATE_DB_URL" ]] && error "DATABASE_URL tidak ditemukan di $ENV_FILE"

sudo -u "$DEPLOY_USER" bash -c "
  cd '$BACKEND_DEPLOY'
  DATABASE_URL='$MIGRATE_DB_URL' npx prisma generate --schema=./prisma/schema.prisma
"
log "Prisma client generated"

if [[ "$SKIP_MIGRATE" == "false" ]]; then
  info "Running migrations..."
  sudo -u "$DEPLOY_USER" bash -c "
    cd '$BACKEND_DEPLOY'
    DATABASE_URL='$MIGRATE_DB_URL' npx prisma migrate deploy --schema=./prisma/schema.prisma
  "
  log "Migrations applied"
else
  warn "Skipping migrations (--skip-migrate)"
fi

# ─── 5. Build ─────────────────────────────────────────────────────────────────
section "5/6 Build"
sudo -u "$DEPLOY_USER" bash -c "
  cd '$BACKEND_DEPLOY'
  NODE_ENV=production npx nest build
"
[[ -f "$BACKEND_DEPLOY/dist/main.js" ]] || error "dist/main.js tidak ada setelah build"
BUILD_SIZE=$(du -sh "$BACKEND_DEPLOY/dist/" 2>/dev/null | cut -f1 || echo "?")
log "Build complete → $BUILD_SIZE"

# ─── 6. Reload PM2 ────────────────────────────────────────────────────────────
section "6/6 PM2 Reload"

# Source env agar PM2 worker mewarisi semua variable terbaru
if sudo -u "$DEPLOY_USER" pm2 list 2>/dev/null | grep -q "kahade-api"; then
  sudo -u "$DEPLOY_USER" bash -c "
    set -a
    source '$ENV_FILE'
    set +a
    pm2 reload '$ECOSYSTEM_FILE' --update-env
  "
  log "PM2 reloaded (zero-downtime)"
else
  sudo -u "$DEPLOY_USER" bash -c "
    set -a
    source '$ENV_FILE'
    set +a
    pm2 start '$ECOSYSTEM_FILE'
  "
  log "PM2 started"
fi

sudo -u "$DEPLOY_USER" pm2 save --force

# Quick health check
sleep 5
PORT="$(grep '^PORT=' "$ENV_FILE" | cut -d'=' -f2- | tr -d '"' || echo '3000')"
PORT="${PORT:-3000}"
if curl -sf "http://localhost:${PORT}/api/v1/health" > /dev/null 2>&1; then
  log "Health check passed ✅"
else
  warn "Health check belum respond — cek: sudo -u $DEPLOY_USER pm2 logs kahade-api"
fi

section "✅ Backend Updated"
log "Commit : $(git -C "$REPO_ROOT" rev-parse --short HEAD 2>/dev/null || echo 'n/a')"
log "PM2    :"
sudo -u "$DEPLOY_USER" pm2 list
