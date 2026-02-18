#!/usr/bin/env bash
# =============================================================================
# KAHADE - UPDATE ADMIN PANEL (admin.kahade.id)
# =============================================================================
# Usage:
#   sudo bash scripts/update-admin.sh           # pull + build
#   sudo bash scripts/update-admin.sh --no-pull # skip git pull
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec bash "$SCRIPT_DIR/update-frontend.sh" --variant admin "$@"
