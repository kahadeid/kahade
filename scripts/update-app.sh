#!/usr/bin/env bash
# =============================================================================
# KAHADE - UPDATE USER DASHBOARD (app.kahade.id)
# =============================================================================
# Usage:
#   sudo bash scripts/update-app.sh           # pull + build
#   sudo bash scripts/update-app.sh --no-pull # skip git pull
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec bash "$SCRIPT_DIR/update-frontend.sh" --variant app "$@"
