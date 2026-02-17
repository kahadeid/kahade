#!/usr/bin/env bash
# =============================================================================
# KAHADE - MONITOR (Live)
# =============================================================================
# Usage:
#   bash scripts/monitor.sh          → PM2 interactive monitor
#   bash scripts/monitor.sh --logs   → Tail app logs
#   bash scripts/monitor.sh --errors → Tail error logs only
#   bash scripts/monitor.sh --status → One-shot status snapshot
# =============================================================================

set -uo pipefail

case "${1:-}" in
  --logs)
    echo "Tailing PM2 output logs (Ctrl+C to stop)..."
    tail -f /var/log/kahade/pm2-out.log /var/log/kahade/pm2-error.log 2>/dev/null || \
      pm2 logs kahade-api
    ;;
  --errors)
    echo "Tailing PM2 error logs (Ctrl+C to stop)..."
    tail -f /var/log/kahade/pm2-error.log 2>/dev/null || \
      pm2 logs kahade-api --err
    ;;
  --status)
    echo ""
    echo "═══════════════════════ KAHADE STATUS ══════════════════════"
    echo "Time    : $(date)"
    echo "PM2     :"
    pm2 list 2>/dev/null || echo "  PM2 not available"
    echo ""
    echo "Health  :"
    curl -sf "http://localhost:${PORT:-3000}/api/v1/health" 2>/dev/null | \
      python3 -m json.tool 2>/dev/null || echo "  Health endpoint not responding"
    echo ""
    echo "System  :"
    echo "  CPU:  $(top -bn1 | grep 'Cpu(s)' | awk '{print $2}')% used"
    echo "  RAM:  $(free -h | awk 'NR==2{print $3"/"$2}')"
    echo "  Disk: $(df -h / | awk 'NR==2{print $3"/"$2" ("$5")"}')"
    echo "═══════════════════════════════════════════════════════════"
    ;;
  *)
    # Default: PM2 interactive monitor
    pm2 monit
    ;;
esac
