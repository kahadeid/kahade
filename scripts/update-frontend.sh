#!/usr/bin/env bash
# =============================================================================
# KAHADE - UPDATE SEMUA FRONTEND (Landing + App + Admin)
# =============================================================================
# Usage:
#   sudo bash scripts/update-frontend.sh              # pull + build semua 3
#   sudo bash scripts/update-frontend.sh --no-pull    # skip git pull
#   sudo bash scripts/update-frontend.sh --variant landing  # hanya landing
#   sudo bash scripts/update-frontend.sh --variant app      # hanya app
#   sudo bash scripts/update-frontend.sh --variant admin    # hanya admin
#
# Untuk update satu subdomain saja, lebih mudah pakai script khusus:
#   sudo bash scripts/update-landing.sh
#   sudo bash scripts/update-app.sh
#   sudo bash scripts/update-admin.sh
# =============================================================================

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; NC='\033[0m'
log()     { echo -e "${GREEN}[✔]${NC} $*"; }
info()    { echo -e "${BLUE}[ℹ]${NC} $*"; }
warn()    { echo -e "${YELLOW}[⚠]${NC} $*"; }
error()   { echo -e "${RED}[✘]${NC} $*" >&2; exit 1; }
section() { echo -e "\n${CYAN}═══════════════════════════════════════════${NC}"; echo -e "${CYAN}  $*${NC}"; echo -e "${CYAN}═══════════════════════════════════════════${NC}"; }

# ── Flags ─────────────────────────────────────────────────────────────────────
SKIP_PULL=false
BUILD_VARIANT="all"   # all | landing | app | admin

while [[ $# -gt 0 ]]; do
    case "$1" in
        --no-pull)  SKIP_PULL=true; shift ;;
        --variant)  BUILD_VARIANT="${2:-all}"; shift 2 ;;
        *)          shift ;;
    esac
done

# ── Paths ──────────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ -d "$SCRIPT_DIR/../backend" && -d "$SCRIPT_DIR/../frontend" ]]; then
    REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
elif [[ -d "$SCRIPT_DIR/backend" && -d "$SCRIPT_DIR/frontend" ]]; then
    REPO_ROOT="$SCRIPT_DIR"
else
    error "Tidak bisa menemukan repo root."
fi

FRONTEND_SRC="$REPO_ROOT/frontend"
DEPLOY_USER="kahade"
DOMAIN="kahade.id"
APP_DOMAIN="app.kahade.id"
ADMIN_DOMAIN="admin.kahade.id"
API_DOMAIN="api.kahade.id"

# Direktori dist untuk masing-masing variant
DIST_LANDING="/var/www/kahade/frontend"
DIST_APP="/var/www/kahade/frontend-app"
DIST_ADMIN="/var/www/kahade/frontend-admin"

[[ -d "$FRONTEND_SRC" ]] || error "Frontend source tidak ditemukan: $FRONTEND_SRC"
for dir in "$DIST_LANDING" "$DIST_APP" "$DIST_ADMIN"; do
    [[ -d "$dir" ]] || error "Deploy dir tidak ada: $dir — jalankan deploy.sh dulu"
done

section "🎨 Kahade Frontend Update — variant: ${BUILD_VARIANT}"
info "Repo   : $REPO_ROOT"
info "Deploy : $DIST_LANDING (landing), $DIST_APP (app), $DIST_ADMIN (admin)"

# ── 1. Git pull ────────────────────────────────────────────────────────────────
if [[ "$SKIP_PULL" == "false" ]]; then
    section "1/4 Git Pull"
    cd "$REPO_ROOT"
    git pull origin "$(git rev-parse --abbrev-ref HEAD)"
    log "Code updated: $(git rev-parse --short HEAD)"
else
    info "Skipping git pull (--no-pull)"
fi

# ── 2. Rsync source → working dir (di DIST_LANDING karena install di sana) ────
section "2/4 Rsync Source"
rsync -a --delete \
    --exclude='.env*' \
    --exclude='node_modules' \
    --exclude='dist' \
    "$FRONTEND_SRC/" "$DIST_LANDING/"

chown -R "$DEPLOY_USER:$DEPLOY_USER" "$DIST_LANDING"
chmod 755 "$DIST_LANDING"
log "Source synced"

# ── 3. Install dependencies (sekali, dipakai untuk semua 3 build) ─────────────
section "3/4 Install Dependencies"

# Hapus node_modules lama dulu — mencegah error "Cannot read properties of null"
# yang terjadi ketika node_modules dari deploy sebelumnya corrupt/incompatible
rm -rf "$DIST_LANDING/node_modules"
log "node_modules lama dihapus"

# Pastikan pnpm ada di PATH untuk user kahade
PNPM_BIN="$(command -v pnpm 2>/dev/null || echo '/usr/local/bin/pnpm')"

sudo -u "$DEPLOY_USER" bash -c "
    export PATH='/usr/local/bin:/usr/bin:/bin'
    cd '$DIST_LANDING'
    if [[ -f pnpm-lock.yaml ]] && command -v pnpm >/dev/null 2>&1; then
        pnpm install --frozen-lockfile 2>&1 | tail -5 \
            || pnpm install 2>&1 | tail -5
    elif [[ -f pnpm-lock.yaml ]]; then
        '$PNPM_BIN' install 2>&1 | tail -5
    else
        npm install
    fi
"
log "Dependencies ready"

# ── 4. Build setiap variant ────────────────────────────────────────────────────
section "4/4 Build"

VITE_BUILD_TIME="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

_build_variant() {
    local MODE="$1"
    local OUT_DIR="$2"
    local LABEL="$3"

    info "Building: ${LABEL} (VITE_APP_MODE=${MODE})..."

    cat > "$DIST_LANDING/.env.production.local" << ENVFILE
VITE_APP_ENV=production
VITE_APP_MODE=${MODE}
VITE_APP_NAME=Kahade
VITE_APP_VERSION=1.0.0
VITE_API_BASE_URL=https://${API_DOMAIN}/api/v1
VITE_API_URL=https://${API_DOMAIN}/api/v1
VITE_WS_URL=wss://${API_DOMAIN}
VITE_WS_PATH=/socket.io
VITE_LANDING_DOMAIN=https://${DOMAIN}
VITE_APP_DOMAIN=https://${APP_DOMAIN}
VITE_ADMIN_DOMAIN=https://${ADMIN_DOMAIN}
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_ERROR_REPORTING=false
VITE_ENABLE_PWA=false
VITE_ENABLE_CSP=true
VITE_DEFAULT_LOCALE=id
VITE_SUPPORTED_LOCALES=id,en
VITE_BUILD_TIME=${VITE_BUILD_TIME}
ENVFILE

    sudo -u "$DEPLOY_USER" bash -c "cd '$DIST_LANDING' && NODE_ENV=production pnpm run build" 2>&1 | tail -5 \
        || error "Build gagal untuk mode: ${MODE}"

    [[ -d "$DIST_LANDING/dist" ]] || error "dist/ tidak ada setelah build ${MODE}"

    # Pindahkan hasil build ke direktori tujuan
    rm -rf "$OUT_DIR/dist"
    mkdir -p "$OUT_DIR"
    mv "$DIST_LANDING/dist" "$OUT_DIR/dist"
    chown -R "$DEPLOY_USER:$DEPLOY_USER" "$OUT_DIR/dist"
    chmod -R 755 "$OUT_DIR/dist"

    local SIZE
    SIZE=$(du -sh "$OUT_DIR/dist" 2>/dev/null | cut -f1 || echo "?")
    log "${LABEL} → ${OUT_DIR}/dist (${SIZE})"
}

case "$BUILD_VARIANT" in
    landing) _build_variant "landing" "$DIST_LANDING" "Landing (kahade.id)" ;;
    app)     _build_variant "app"     "$DIST_APP"     "App (app.kahade.id)" ;;
    admin)   _build_variant "admin"   "$DIST_ADMIN"   "Admin (admin.kahade.id)" ;;
    all)
        _build_variant "landing" "$DIST_LANDING" "Landing (kahade.id)"
        _build_variant "app"     "$DIST_APP"     "App (app.kahade.id)"
        _build_variant "admin"   "$DIST_ADMIN"   "Admin (admin.kahade.id)"
        ;;
    *) error "Variant tidak dikenal: $BUILD_VARIANT. Pilih: all | landing | app | admin" ;;
esac

# Cleanup env override
rm -f "$DIST_LANDING/.env.production.local"

# ── Reload nginx ───────────────────────────────────────────────────────────────
if nginx -t 2>/dev/null; then
    nginx -s reload
    log "Nginx reloaded"
else
    warn "Nginx config test gagal — cek: nginx -t"
fi

section "✅ Frontend Update Selesai"
log "Commit  : $(git -C "$REPO_ROOT" rev-parse --short HEAD 2>/dev/null || echo 'n/a')"
log "Variant : $BUILD_VARIANT"
echo
info "URLs:"
[[ "$BUILD_VARIANT" == "all" || "$BUILD_VARIANT" == "landing" ]] && info "  Landing → https://${DOMAIN}"
[[ "$BUILD_VARIANT" == "all" || "$BUILD_VARIANT" == "app"     ]] && info "  App     → https://${APP_DOMAIN}"
[[ "$BUILD_VARIANT" == "all" || "$BUILD_VARIANT" == "admin"   ]] && info "  Admin   → https://${ADMIN_DOMAIN}"
