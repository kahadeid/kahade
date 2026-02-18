#!/usr/bin/env bash
# =============================================================================
# KAHADE - UPDATE LANDING PAGE (kahade.id)
# =============================================================================
# Usage:
#   sudo bash scripts/update-landing.sh           # pull + build
#   sudo bash scripts/update-landing.sh --no-pull # skip git pull
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec bash "$SCRIPT_DIR/update-frontend.sh" --variant landing "$@"
