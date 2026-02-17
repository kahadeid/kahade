#!/usr/bin/env bash
# =============================================================================
# KAHADE - VPS INITIAL SETUP SCRIPT
# =============================================================================
# Run ONCE on a fresh Ubuntu 22.04/24.04 VPS as root or sudo user.
# Usage:  sudo bash setup.sh
# =============================================================================

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; NC='\033[0m'
log()     { echo -e "${GREEN}[✔]${NC} $*"; }
info()    { echo -e "${BLUE}[ℹ]${NC} $*"; }
warn()    { echo -e "${YELLOW}[⚠]${NC} $*"; }
error()   { echo -e "${RED}[✘]${NC} $*" >&2; exit 1; }
section() { echo -e "\n${CYAN}═══════════════════════════════════════════${NC}"; echo -e "${CYAN}  $*${NC}"; echo -e "${CYAN}═══════════════════════════════════════════${NC}"; }

[[ "$EUID" -ne 0 ]] && error "Please run as root: sudo bash setup.sh"

# ─── Config ──────────────────────────────────────────────────────────────────
APP_USER="${APP_USER:-deploy}"
APP_DIR="/var/www/kahade"
REPO_URL="${REPO_URL:-}"   # Set via env: REPO_URL=https://github.com/... sudo bash setup.sh
DOMAIN="${DOMAIN:-api.kahade.id}"
NODE_VERSION="20"

# ─── System update ────────────────────────────────────────────────────────────
section "1. System Update"
apt-get update -y
apt-get upgrade -y
apt-get install -y curl git wget unzip build-essential software-properties-common \
  ufw fail2ban logrotate certbot python3-certbot-nginx ca-certificates gnupg
log "System packages installed"

# ─── Firewall ─────────────────────────────────────────────────────────────────
section "2. Firewall (UFW)"
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
# Internal ports (Prometheus/Metrics) - restrict to localhost only
ufw deny 9090/tcp
ufw deny 5432/tcp
ufw deny 6379/tcp
echo "y" | ufw enable
log "UFW configured"

# ─── Fail2Ban ─────────────────────────────────────────────────────────────────
section "3. Fail2Ban"
systemctl enable fail2ban
systemctl start fail2ban
log "Fail2Ban enabled"

# ─── Node.js via NVM ──────────────────────────────────────────────────────────
section "4. Node.js $NODE_VERSION"
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
  apt-get install -y nodejs
fi
node --version && npm --version
log "Node.js installed"

# ─── PM2 ──────────────────────────────────────────────────────────────────────
section "5. PM2"
npm install -g pm2
pm2 startup systemd -u "$APP_USER" --hp "/home/$APP_USER" 2>/dev/null || \
  pm2 startup systemd 2>/dev/null || true
log "PM2 installed"

# ─── PostgreSQL ───────────────────────────────────────────────────────────────
section "6. PostgreSQL"
apt-get install -y postgresql postgresql-contrib
systemctl enable postgresql
systemctl start postgresql

# Create DB user and database (idempotent)
sudo -u postgres psql -tc "SELECT 1 FROM pg_user WHERE usename='kahade_user'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE USER kahade_user WITH ENCRYPTED PASSWORD 'CHANGE_THIS_PASSWORD';"
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='kahade_prod'" | grep -q 1 || \
  sudo -u postgres createdb -O kahade_user kahade_prod

# Enable pg_stat_statements for monitoring
sudo -u postgres psql -d kahade_prod -c "CREATE EXTENSION IF NOT EXISTS pg_stat_statements;" 2>/dev/null || true
log "PostgreSQL configured"
warn "IMPORTANT: Change DB password in /etc/postgresql/*/main/pg_hba.conf and .env.production"

# ─── Redis ────────────────────────────────────────────────────────────────────
section "7. Redis"
apt-get install -y redis-server
# Set password and bind to localhost
REDIS_PASS="oyCf7FI98HOv7xmPQco0beyleFwFEQ7S"
sed -i "s/^# requirepass .*/requirepass $REDIS_PASS/" /etc/redis/redis.conf
sed -i "s/^requirepass .*/requirepass $REDIS_PASS/" /etc/redis/redis.conf
sed -i "s/^bind .*/bind 127.0.0.1 ::1/" /etc/redis/redis.conf
systemctl enable redis-server
systemctl restart redis-server
log "Redis configured (password protected, localhost only)"

# ─── Nginx ────────────────────────────────────────────────────────────────────
section "8. Nginx"
apt-get install -y nginx
systemctl enable nginx

# Copy Kahade nginx config
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ -f "$SCRIPT_DIR/nginx.conf" ]]; then
  cp "$SCRIPT_DIR/nginx.conf" /etc/nginx/sites-available/kahade
  ln -sf /etc/nginx/sites-available/kahade /etc/nginx/sites-enabled/kahade
  rm -f /etc/nginx/sites-enabled/default
  nginx -t && systemctl reload nginx
  log "Nginx config applied"
else
  warn "nginx.conf not found at $SCRIPT_DIR/nginx.conf — install manually"
fi

# ─── SSL via Let's Encrypt ────────────────────────────────────────────────────
section "9. SSL (Let's Encrypt)"
if [[ -n "$DOMAIN" ]]; then
  warn "Run manually after DNS propagates:"
  warn "  certbot --nginx -d $DOMAIN -d www.kahade.id --non-interactive --agree-tos -m admin@kahade.id"
else
  warn "DOMAIN not set — skip SSL auto-setup"
fi

# ─── App user & directories ───────────────────────────────────────────────────
section "10. App User & Directories"
id -u "$APP_USER" &>/dev/null || useradd -m -s /bin/bash "$APP_USER"

for dir in "$APP_DIR" "$APP_DIR/uploads" "/var/log/kahade" "/var/backups/kahade"; do
  mkdir -p "$dir"
  chown "$APP_USER":"$APP_USER" "$dir"
done
log "Directories created"

# ─── Clone repo ───────────────────────────────────────────────────────────────
section "11. Clone Repository"
if [[ -n "$REPO_URL" ]]; then
  if [[ ! -d "$APP_DIR/backend" ]]; then
    sudo -u "$APP_USER" git clone "$REPO_URL" "$APP_DIR/source"
    log "Repository cloned"
  else
    info "Already cloned — skipping"
  fi
else
  warn "REPO_URL not set — clone manually to $APP_DIR"
fi

# ─── Logrotate ────────────────────────────────────────────────────────────────
section "12. Logrotate"
cat > /etc/logrotate.d/kahade << 'EOF'
/var/log/kahade/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    sharedscripts
    postrotate
        pm2 reloadLogs 2>/dev/null || true
    endscript
}
EOF
log "Logrotate configured"

# ─── Done ─────────────────────────────────────────────────────────────────────
section "✅ VPS Setup Complete"
log "System   : $(lsb_release -d | cut -f2)"
log "Node     : $(node --version)"
log "PM2      : $(pm2 --version)"
log "Postgres : $(psql --version | head -1)"
log "Redis    : $(redis-server --version | head -1)"
log "Nginx    : $(nginx -v 2>&1)"
echo ""
warn "NEXT STEPS:"
echo "  1. Edit /var/www/kahade/source/backend/.env.production"
echo "     - Update DATABASE_URL with new password"
echo "     - Set all [REQUIRED] fields"
echo "     - Generate ENCRYPTION_IV: openssl rand -hex 8"
echo "  2. Run SSL: certbot --nginx -d $DOMAIN --agree-tos -m admin@kahade.id"
echo "  3. cd /var/www/kahade/source/backend && bash deploy/deploy.sh"
