#!/usr/bin/env bash
# =============================================================================
# KAHADE - CHECK ERRORS & SYSTEM HEALTH
# =============================================================================
# Usage:
#   bash scripts/check-errors.sh           → Full check
#   bash scripts/check-errors.sh --pm2     → PM2 logs only
#   bash scripts/check-errors.sh --db      → Database only
#   bash scripts/check-errors.sh --quick   → Quick status only
# =============================================================================

set -uo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; MAGENTA='\033[0;35m'; NC='\033[0m'
ok()      { echo -e "${GREEN}  ✔ ${NC}$*"; }
fail()    { echo -e "${RED}  ✘ ${NC}$*"; ERRORS=$((ERRORS+1)); }
warn()    { echo -e "${YELLOW}  ⚠ ${NC}$*"; WARNINGS=$((WARNINGS+1)); }
info()    { echo -e "${BLUE}  ℹ ${NC}$*"; }
section() { echo -e "\n${CYAN}═══════════════════════════════════════════${NC}"; echo -e "${CYAN}  $*${NC}"; echo -e "${CYAN}═══════════════════════════════════════════${NC}"; }

ERRORS=0
WARNINGS=0
CHECK_ALL=true
CHECK_PM2=false
CHECK_DB=false
CHECK_QUICK=false

for arg in "$@"; do
  case "$arg" in
    --pm2)   CHECK_PM2=true;  CHECK_ALL=false ;;
    --db)    CHECK_DB=true;   CHECK_ALL=false ;;
    --quick) CHECK_QUICK=true; CHECK_ALL=false ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$APP_DIR/.env.production"
PORT="${PORT:-3000}"

[[ -f "$ENV_FILE" ]] && source "$ENV_FILE" 2>/dev/null || true

# =============================================================================
# QUICK STATUS
# =============================================================================
if [[ "$CHECK_ALL" == "true" || "$CHECK_QUICK" == "true" ]]; then
section "🩺 Quick Status"

# PM2 process
if pm2 list 2>/dev/null | grep -q "kahade-api.*online"; then
  STATUS=$(pm2 list 2>/dev/null | grep "kahade-api" | awk '{print $10}')
  CPU=$(pm2 list 2>/dev/null | grep "kahade-api" | awk '{print $14}')
  MEM=$(pm2 list 2>/dev/null | grep "kahade-api" | awk '{print $16}')
  ok "PM2: online | CPU: $CPU | RAM: $MEM | Status: $STATUS"
else
  fail "PM2: kahade-api is NOT running"
fi

# HTTP health
if curl -sf --max-time 5 "http://localhost:${PORT}/api/v1/health" > /dev/null 2>&1; then
  RESP=$(curl -sf --max-time 5 "http://localhost:${PORT}/api/v1/health" 2>/dev/null)
  ok "HTTP health: $RESP"
else
  fail "HTTP health check FAILED: http://localhost:${PORT}/api/v1/health"
fi

# Disk space
DISK=$(df -h / | awk 'NR==2{print $5}' | tr -d '%')
if [[ "$DISK" -gt 90 ]]; then
  fail "Disk usage CRITICAL: ${DISK}%"
elif [[ "$DISK" -gt 75 ]]; then
  warn "Disk usage HIGH: ${DISK}%"
else
  ok "Disk: ${DISK}% used"
fi

# Memory
MEM_FREE=$(free -m | awk 'NR==2{printf "%s/%s MB (%.0f%%)", $3,$2,$3*100/$2}')
MEM_PCT=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [[ "$MEM_PCT" -gt 90 ]]; then
  fail "Memory CRITICAL: $MEM_FREE"
elif [[ "$MEM_PCT" -gt 75 ]]; then
  warn "Memory HIGH: $MEM_FREE"
else
  ok "Memory: $MEM_FREE"
fi
fi

# =============================================================================
# PM2 LOGS CHECK
# =============================================================================
if [[ "$CHECK_ALL" == "true" || "$CHECK_PM2" == "true" ]]; then
section "📋 PM2 Process & Logs"

pm2 list 2>/dev/null || warn "PM2 not available"

echo -e "\n${MAGENTA}── Last 30 lines (pm2-error.log) ──${NC}"
if [[ -f "/var/log/kahade/pm2-error.log" ]]; then
  tail -30 /var/log/kahade/pm2-error.log
  # Count errors in last hour
  ERROR_COUNT=$(grep "$(date '+%Y-%m-%d %H')" /var/log/kahade/pm2-error.log 2>/dev/null | wc -l || echo 0)
  [[ "$ERROR_COUNT" -gt 50 ]] && fail "High error rate: $ERROR_COUNT errors in last hour" || \
    ok "Errors this hour: $ERROR_COUNT"
else
  warn "Log file not found: /var/log/kahade/pm2-error.log"
fi

echo -e "\n${MAGENTA}── PM2 restart count ──${NC}"
RESTARTS=$(pm2 list 2>/dev/null | grep "kahade-api" | awk '{print $12}' || echo "?")
if [[ "$RESTARTS" =~ ^[0-9]+$ ]] && [[ "$RESTARTS" -gt 10 ]]; then
  warn "High restart count: $RESTARTS — check logs for crash reason"
else
  ok "Restart count: $RESTARTS"
fi
fi

# =============================================================================
# DATABASE CHECK
# =============================================================================
if [[ "$CHECK_ALL" == "true" || "$CHECK_DB" == "true" ]]; then
section "🗄️  Database"

if command -v psql >/dev/null 2>&1; then
  # Connection test
  if sudo -u postgres psql -d kahade_prod -c "SELECT 1;" > /dev/null 2>&1; then
    ok "PostgreSQL: connected"
  else
    fail "PostgreSQL: connection FAILED"
  fi

  # Active connections
  CONN=$(sudo -u postgres psql -d kahade_prod -t -c "SELECT count(*) FROM pg_stat_activity WHERE datname='kahade_prod';" 2>/dev/null | tr -d ' ' || echo "?")
  ok "Active DB connections: $CONN"

  # DB size
  SIZE=$(sudo -u postgres psql -d kahade_prod -t -c "SELECT pg_size_pretty(pg_database_size('kahade_prod'));" 2>/dev/null | tr -d ' ' || echo "?")
  ok "Database size: $SIZE"

  # Long running queries
  LONG=$(sudo -u postgres psql -d kahade_prod -t -c "
    SELECT count(*) FROM pg_stat_activity
    WHERE datname='kahade_prod' AND state='active'
    AND query_start < NOW() - INTERVAL '30 seconds'
    AND query NOT LIKE '%pg_stat%';" 2>/dev/null | tr -d ' ' || echo "0")
  [[ "$LONG" -gt 0 ]] && warn "Long-running queries (>30s): $LONG" || ok "No long-running queries"
else
  warn "psql not found — skip DB check"
fi
fi

# =============================================================================
# FULL CHECKS
# =============================================================================
if [[ "$CHECK_ALL" == "true" ]]; then

section "🔴 Redis"
if command -v redis-cli >/dev/null 2>&1; then
  REDIS_PASS="${REDIS_PASSWORD:-}"
  PING=$( [[ -n "$REDIS_PASS" ]] && redis-cli -a "$REDIS_PASS" PING 2>/dev/null || redis-cli PING 2>/dev/null )
  if [[ "$PING" == "PONG" ]]; then
    MEM_USED=$( [[ -n "$REDIS_PASS" ]] && redis-cli -a "$REDIS_PASS" INFO memory 2>/dev/null | grep "used_memory_human" | cut -d: -f2 | tr -d ' \r' || echo "?" )
    ok "Redis: PONG | Memory: $MEM_USED"
  else
    fail "Redis: no response (PING failed)"
  fi
else
  warn "redis-cli not found — skip Redis check"
fi

section "🌐 Nginx"
if command -v nginx >/dev/null 2>&1; then
  nginx -t 2>&1 && ok "Nginx config: OK" || fail "Nginx config: ERRORS FOUND"
  systemctl is-active --quiet nginx && ok "Nginx service: running" || fail "Nginx service: stopped"
else
  warn "Nginx not found"
fi

section "🔒 SSL Certificate"
DOMAIN="${DOMAIN:-api.kahade.id}"
if command -v openssl >/dev/null 2>&1; then
  CERT_EXPIRY=$(echo | openssl s_client -servername "$DOMAIN" -connect "${DOMAIN}:443" 2>/dev/null \
    | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2 || echo "")
  if [[ -n "$CERT_EXPIRY" ]]; then
    DAYS_LEFT=$(( ( $(date -d "$CERT_EXPIRY" +%s) - $(date +%s) ) / 86400 ))
    if [[ $DAYS_LEFT -lt 14 ]]; then
      fail "SSL cert expires in $DAYS_LEFT days! Run: certbot renew"
    elif [[ $DAYS_LEFT -lt 30 ]]; then
      warn "SSL cert expires in $DAYS_LEFT days"
    else
      ok "SSL cert valid for $DAYS_LEFT days"
    fi
  else
    warn "Could not check SSL cert (DNS may not resolve locally)"
  fi
fi

section "📁 Directories & Permissions"
for dir in "/var/log/kahade" "/var/www/kahade/uploads" "/var/backups/kahade"; do
  if [[ -d "$dir" ]]; then
    PERM=$(stat -c "%U:%G %a" "$dir" 2>/dev/null || echo "?")
    ok "$dir ($PERM)"
  else
    fail "Missing directory: $dir"
  fi
done

section "🔧 Environment Validation"
[[ -f "$ENV_FILE" ]] && ok ".env.production exists" || fail ".env.production MISSING"

# Check no placeholder [REQUIRED] values
if [[ -f "$ENV_FILE" ]]; then
  PLACEHOLDERS=$(grep -c "\[REQUIRED" "$ENV_FILE" 2>/dev/null || echo 0)
  if [[ "$PLACEHOLDERS" -gt 0 ]]; then
    fail "Found $PLACEHOLDERS unfilled [REQUIRED] fields in .env.production"
    grep "\[REQUIRED" "$ENV_FILE" | head -10
  else
    ok "No unfilled [REQUIRED] placeholders"
  fi

  # Check dev secrets leaked to production
  if grep -q "dev-jwt-secret\|dev-cookie-secret\|dev-encryption" "$ENV_FILE" 2>/dev/null; then
    fail "SECURITY: Dev/default secrets found in .env.production!"
  else
    ok "No dev secrets in .env.production"
  fi
fi

fi # CHECK_ALL

# =============================================================================
# SUMMARY
# =============================================================================
section "📊 Summary"
if [[ $ERRORS -gt 0 ]]; then
  echo -e "${RED}  ✘ $ERRORS ERROR(S) found — action required!${NC}"
else
  echo -e "${GREEN}  ✔ No errors detected${NC}"
fi
if [[ $WARNINGS -gt 0 ]]; then
  echo -e "${YELLOW}  ⚠ $WARNINGS WARNING(S) — review recommended${NC}"
fi

exit $ERRORS
