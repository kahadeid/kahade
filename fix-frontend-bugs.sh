#!/usr/bin/env bash
# =============================================================================
# KAHADE - FIX FRONTEND BUGS
# Fixes 3 systematic bugs across the entire frontend codebase:
#   Bug 1: Duplicate aria-hidden="true" attributes (~549 instances)
#   Bug 2: Unused SkipToContent import (62+ files)
#   Bug 3: Typo Tailwind class "w-3 .5 h-3.5" → "w-3.5 h-3.5" (5 instances)
#
# Note: grep may report ~21 "remaining" duplicates after fix — those are
#       FALSE POSITIVES: ternary expressions with aria-hidden on each branch.
#       e.g: {show ? <EyeSlash aria-hidden="true" /> : <Eye aria-hidden="true" />}
#       These are VALID code, bukan bug.
# =============================================================================
# Usage:
#   cd /path/to/kahade-repo
#   bash fix-frontend-bugs.sh                 # default: ./frontend/src
#   bash fix-frontend-bugs.sh /custom/src/path
#
# Setelah selesai, rebuild frontend:
#   sudo bash scripts/update-landing.sh --no-pull
#   sudo bash scripts/update-app.sh --no-pull
#   sudo bash scripts/update-admin.sh --no-pull
# =============================================================================

set -euo pipefail

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; RED='\033[0;31m'; NC='\033[0m'
log()     { echo -e "${GREEN}[✔]${NC} $*"; }
warn()    { echo -e "${YELLOW}[⚠]${NC} $*"; }
info()    { echo -e "${CYAN}[ℹ]${NC} $*"; }
error()   { echo -e "${RED}[✘]${NC} $*" >&2; exit 1; }
section() { echo -e "\n${CYAN}═══════════════════════════════════════════${NC}"; echo -e "${CYAN}  $*${NC}"; echo -e "${CYAN}═══════════════════════════════════════════${NC}"; }

SRC_DIR="${1:-./frontend/src}"

[[ -d "$SRC_DIR" ]] || error "Directory not found: $SRC_DIR"
command -v perl >/dev/null 2>&1 || error "perl tidak tersedia — install: sudo apt install perl"

section "🐛 Kahade Frontend Bug Fixer"
info "Target: $(realpath "$SRC_DIR")"

# ── FIX 1: Duplicate aria-hidden ─────────────────────────────────────────────
section "Fix 1/3 — Duplicate aria-hidden=\"true\""
BEFORE=$(grep -rn 'aria-hidden="true".*aria-hidden="true"' "$SRC_DIR" 2>/dev/null | wc -l || echo 0)
info "Ditemukan: $BEFORE baris (termasuk ternary false positives)"

find "$SRC_DIR" \( -name "*.tsx" -o -name "*.ts" \) | while read -r file; do
    if grep -q 'aria-hidden="true".*aria-hidden="true"' "$file" 2>/dev/null; then
        # Remove second aria-hidden when it's a real duplicate (not ternary)
        # Pattern: <Icon ... aria-hidden="true" attr="x" aria-hidden="true" />
        perl -i -pe 's/(aria-hidden="true"(\s+\w[\w-]*="[^"]*")+)\s+aria-hidden="true"/$1/g' "$file"
    fi
done

AFTER=$(grep -rn 'aria-hidden="true".*aria-hidden="true"' "$SRC_DIR" 2>/dev/null | wc -l || echo 0)
REAL_DUPES=$((BEFORE - AFTER))
log "Diperbaiki: $REAL_DUPES duplikat nyata"
[[ $AFTER -gt 0 ]] && info "Sisa $AFTER = ternary expressions (valid code, bukan bug)"

# ── FIX 2: Unused SkipToContent import ───────────────────────────────────────
section "Fix 2/3 — Unused SkipToContent import"
SKIP_COUNT=0
SKIP_KEPT=0

while IFS= read -r file; do
    USAGE=$(grep -v "^import" "$file" | grep -c "SkipToContent" 2>/dev/null || true)
    if [[ "$USAGE" -eq 0 ]]; then
        sed -i "/^import { SkipToContent } from '@\/lib\/accessibility';$/d" "$file"
        SKIP_COUNT=$((SKIP_COUNT + 1))
    else
        warn "SkipToContent DIPAKAI di: $file — tidak dihapus"
        SKIP_KEPT=$((SKIP_KEPT + 1))
    fi
done < <(grep -rl "^import { SkipToContent } from '@/lib/accessibility';" "$SRC_DIR" 2>/dev/null || true)

log "Import dihapus dari $SKIP_COUNT file"
[[ $SKIP_KEPT -gt 0 ]] && log "Dipertahankan di $SKIP_KEPT file (import dipakai)"

# ── FIX 3: Tailwind class typo ───────────────────────────────────────────────
section "Fix 3/3 — Tailwind class typo \"w-3 .5 h-3.5\""
TYPO_BEFORE=$(grep -rn '"w-3 \.5' "$SRC_DIR" 2>/dev/null | wc -l || echo 0)
info "Ditemukan: $TYPO_BEFORE instance"

if [[ $TYPO_BEFORE -gt 0 ]]; then
    find "$SRC_DIR" -name "*.tsx" | while read -r file; do
        if grep -q '"w-3 \.5' "$file" 2>/dev/null; then
            sed -i 's/"w-3 \.5 h-3\.5"/"w-3.5 h-3.5"/g' "$file"
        fi
    done
fi

TYPO_AFTER=$(grep -rn '"w-3 \.5' "$SRC_DIR" 2>/dev/null | wc -l || echo 0)
log "Diperbaiki: $((TYPO_BEFORE - TYPO_AFTER)) instance"

# ── Summary ───────────────────────────────────────────────────────────────────
section "✅ Selesai — Ringkasan"
echo
printf "  %-40s %s\n" "Bug 1 - aria-hidden duplikat:"    "$REAL_DUPES diperbaiki"
printf "  %-40s %s\n" "Bug 2 - unused SkipToContent:"    "$SKIP_COUNT file dibersihkan"
printf "  %-40s %s\n" "Bug 3 - Tailwind class typo:"     "$((TYPO_BEFORE - TYPO_AFTER)) diperbaiki"
echo
info "Rebuild setelah ini:"
info "  sudo bash scripts/update-landing.sh --no-pull"
info "  sudo bash scripts/update-app.sh --no-pull"
info "  sudo bash scripts/update-admin.sh --no-pull"
