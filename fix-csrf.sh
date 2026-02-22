#!/usr/bin/env bash
# =============================================================================
#  fix-csrf.sh — Auto-fix CSRF token missing issues
#  Usage: bash fix-csrf.sh [path/to/backend]
# =============================================================================

set -euo pipefail

# ── Warna ─────────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

ok()   { echo -e "${GREEN}  ✔${RESET}  $*"; }
info() { echo -e "${CYAN}  ℹ${RESET}  $*"; }
warn() { echo -e "${YELLOW}  ⚠${RESET}  $*"; }
err()  { echo -e "${RED}  ✘${RESET}  $*"; }
step() { echo -e "\n${BOLD}${CYAN}▶ $*${RESET}"; }

# ── Argumen & path ─────────────────────────────────────────────────────────────
BACKEND_DIR="${1:-./backend}"
MAIN_TS="${BACKEND_DIR}/src/main.ts"
COMMON_CSRF="${BACKEND_DIR}/src/common/middleware/csrf.middleware.ts"
BACKUP_SUFFIX=".bak.$(date +%Y%m%d%H%M%S)"

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║        CSRF Fix Script — Kahade          ║${RESET}"
echo -e "${BOLD}╚══════════════════════════════════════════╝${RESET}"

# ── Cek file target ────────────────────────────────────────────────────────────
step "Mengecek file target..."
if [[ ! -f "$MAIN_TS" ]]; then
  err "File tidak ditemukan: $MAIN_TS"
  err "Jalankan script dari root project atau berikan path backend sebagai argumen."
  err "Contoh: bash fix-csrf.sh ./backend"
  exit 1
fi
ok "main.ts ditemukan: $MAIN_TS"

# ── Backup ─────────────────────────────────────────────────────────────────────
step "Membuat backup..."
cp "$MAIN_TS" "${MAIN_TS}${BACKUP_SUFFIX}"
ok "Backup: ${MAIN_TS}${BACKUP_SUFFIX}"

if [[ -f "$COMMON_CSRF" ]]; then
  cp "$COMMON_CSRF" "${COMMON_CSRF}${BACKUP_SUFFIX}"
  ok "Backup: ${COMMON_CSRF}${BACKUP_SUFFIX}"
fi

# ── Fix 1: Tambah x-csrf-token ke allowedHeaders di main.ts ──────────────────
step "Fix 1 — Menambahkan 'x-csrf-token' ke CORS allowedHeaders..."

if grep -q "'x-csrf-token'" "$MAIN_TS"; then
  warn "Header 'x-csrf-token' sudah ada di allowedHeaders. Melewati fix ini."
else
  # Ganti baris X-Idempotency-Key dengan dirinya sendiri + baris baru x-csrf-token
  sed -i "s/'X-Idempotency-Key',/'X-Idempotency-Key',\n      'x-csrf-token',  \/\/ CSRF double-submit pattern/" "$MAIN_TS"

  if grep -q "'x-csrf-token'" "$MAIN_TS"; then
    ok "Header 'x-csrf-token' berhasil ditambahkan ke allowedHeaders."
  else
    err "Gagal menambahkan header. Cek format file main.ts secara manual."
    exit 1
  fi
fi

# ── Fix 2: Perbaiki common/middleware/csrf.middleware.ts (httpOnly: true) ─────
step "Fix 2 — Memperbaiki httpOnly di common/middleware/csrf.middleware.ts..."

if [[ ! -f "$COMMON_CSRF" ]]; then
  warn "File $COMMON_CSRF tidak ditemukan. Melewati fix ini."
else
  if grep -q "httpOnly: true" "$COMMON_CSRF"; then
    # Ganti httpOnly: true → false dan tambah komentar
    sed -i "s/httpOnly: true,/httpOnly: false, \/\/ Harus false agar JS bisa baca token untuk double-submit pattern/" "$COMMON_CSRF"
    ok "httpOnly diubah dari true → false di common csrf middleware."
  else
    warn "httpOnly: true tidak ditemukan di $COMMON_CSRF. Mungkin sudah diperbaiki."
  fi
fi

# ── Verifikasi hasil ────────────────────────────────────────────────────────────
step "Verifikasi hasil..."

echo ""
info "=== Cuplikan allowedHeaders di main.ts ==="
grep -A8 "allowedHeaders" "$MAIN_TS" | head -12

echo ""
if [[ -f "$COMMON_CSRF" ]]; then
  info "=== Cuplikan cookie config di common csrf middleware ==="
  grep -A5 "res.cookie" "$COMMON_CSRF" | head -8
fi

# ── Ringkasan & instruksi frontend ─────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}╔══════════════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}${GREEN}║  ✔  Semua fix berhasil diterapkan!                       ║${RESET}"
echo -e "${BOLD}${GREEN}╚══════════════════════════════════════════════════════════╝${RESET}"
echo ""
echo -e "${BOLD}Yang diubah:${RESET}"
echo "  1. main.ts          → 'x-csrf-token' ditambahkan ke CORS allowedHeaders"
echo "  2. common csrf      → httpOnly diubah false (agar JS bisa baca cookie)"
echo ""
echo -e "${BOLD}Checklist frontend (wajib):${RESET}"
echo "  ① Kirim GET ke endpoint mana saja terlebih dahulu (misal /api/v1/health)"
echo "     agar server menyisipkan cookie XSRF-TOKEN."
echo ""
echo "  ② Baca nilai cookie 'XSRF-TOKEN' dari browser:"
echo "     const token = document.cookie"
echo "       .split('; ')"
echo "       .find(r => r.startsWith('XSRF-TOKEN='))"
echo "       ?.split('=')[1]"
echo ""
echo "  ③ Sertakan token di setiap request mutasi (POST/PUT/PATCH/DELETE):"
echo "     headers: { 'x-csrf-token': token }"
echo ""
echo -e "${BOLD}Jika pakai Axios, set global:${RESET}"
echo "     axios.defaults.withCredentials = true"
echo "     axios.interceptors.request.use(config => {"
echo "       const token = /* baca cookie di atas */"
echo "       if (token) config.headers['x-csrf-token'] = token"
echo "       return config"
echo "     })"
echo ""
echo -e "${YELLOW}  ⚠  Restart server backend setelah fix ini!${RESET}"
echo ""
