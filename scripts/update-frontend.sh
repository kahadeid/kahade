#!/usr/bin/env bash
# =============================================================================
# KAHADE - UPDATE FRONTEND (Pull → Rsync → Install → Build → Deploy)
# =============================================================================
# Usage (dari repo root atau folder mana saja):
#   bash scripts/update-frontend.sh
#   bash scripts/update-frontend.sh --no-pull   (skip git pull)
#
# Struktur server:
#   Repo     : ~/kahade/                          (git pull di sini)
#   Deployed : /var/www/kahade/frontend/          (install + build di sini)
#   Nginx    : root /var/www/kahade/frontend/dist (hasil build)
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
SKIP_PULL=false
for arg in "$@"; do
  [[ "$arg" == "--no-pull" ]] && SKIP_PULL=true
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

FRONTEND_SRC="$REPO_ROOT/frontend"          # source code di git repo
FRONTEND_DEPLOY="/var/www/kahade/frontend"   # lokasi running di server
DEPLOY_USER="kahade"

[[ -d "$FRONTEND_SRC"    ]] || error "Frontend source tidak ditemukan: $FRONTEND_SRC"
[[ -d "$FRONTEND_DEPLOY" ]] || error "Frontend deploy dir tidak ditemukan: $FRONTEND_DEPLOY — jalankan deploy.sh dulu"
# .env.production frontend dibuat oleh deploy.sh, harus sudah ada
[[ -f "$FRONTEND_DEPLOY/.env.production" ]] || \
  warn ".env.production tidak ditemukan di $FRONTEND_DEPLOY — VITE vars mungkin salah"

section "🎨 Kahade Frontend Update"
info "Repo     : $REPO_ROOT"
info "Deployed : $FRONTEND_DEPLOY"
info "Nginx    : /var/www/kahade/frontend/dist"

# ─── 1. Git pull ──────────────────────────────────────────────────────────────
if [[ "$SKIP_PULL" == "false" ]]; then
  section "1/4 Git Pull"
  cd "$REPO_ROOT"
  git pull origin "$(git rev-parse --abbrev-ref HEAD)"
  log "Code updated: $(git rev-parse --short HEAD)"
else
  info "Skipping git pull (--no-pull)"
fi

# ─── 2. Rsync source → deploy dir ─────────────────────────────────────────────
# PENTING: exclude .env* agar .env.production yang dibuat deploy.sh tidak tertimpa
section "2/4 Rsync Source → Deploy"
rsync -a --delete \
  --exclude='.env*' \
  --exclude='node_modules' \
  --exclude='dist' \
  "$FRONTEND_SRC/" "$FRONTEND_DEPLOY/"

chown -R "$DEPLOY_USER:$DEPLOY_USER" "$FRONTEND_DEPLOY"
# Pastikan nginx tetap bisa baca (FIX permission deploy.sh)
chmod 755 "$FRONTEND_DEPLOY"
log "Source synced ke $FRONTEND_DEPLOY"

# ─── 3. Install + Build ────────────────────────────────────────────────────────
section "3/4 Install + Build"
sudo -u "$DEPLOY_USER" bash -c "
  cd '$FRONTEND_DEPLOY'

  # Install dependencies
  if [[ -f pnpm-lock.yaml ]] && command -v pnpm >/dev/null 2>&1; then
    pnpm install --frozen-lockfile 2>&1 | tail -5 \
      || pnpm install 2>&1 | tail -5
  elif [[ -f package-lock.json ]]; then
    npm ci
  else
    npm install
  fi

  # Build
  NODE_ENV=production pnpm run build 2>&1 | tail -10
"

[[ -d "$FRONTEND_DEPLOY/dist" ]] || error "dist/ tidak ada setelah build"
BUILD_SIZE=$(du -sh "$FRONTEND_DEPLOY/dist/" 2>/dev/null | cut -f1 || echo "?")
log "Build complete → $BUILD_SIZE"

# ─── 4. Reload nginx ──────────────────────────────────────────────────────────
section "4/4 Reload Nginx"
if nginx -t 2>/dev/null; then
  nginx -s reload
  log "Nginx reloaded"
else
  error "Nginx config test gagal — periksa: nginx -t"
fi

section "✅ Frontend Updated"
log "Commit : $(git -C "$REPO_ROOT" rev-parse --short HEAD 2>/dev/null || echo 'n/a')"
log "Size   : $BUILD_SIZE"
log "URL    : https://kahade.id"
