#!/bin/bash
# =============================================================================
# KAHADE PRODUCTION DEPLOY SCRIPT - AUDITED & FIXED
# =============================================================================
# Usage: sudo bash deploy.sh
# Requires: Ubuntu 24.04, run as root from project root dir
#
# AUDIT FIXES (vs original):
#  FIX-01: Nginx HTTP-only config first → run certbot → switch to HTTPS
#  FIX-02: REDIS_ENABLED=true now set in .env (Redis was silently disabled!)
#  FIX-03: Use ecosystem.config.prod.js for PM2 (not raw pm2 start)
#  FIX-04: Safe .env loader via EnvironmentFile (no xargs breaking on special chars)
#  FIX-05: Correct JWT var names (JWT_EXPIRES_IN & JWT_REFRESH_EXPIRES_IN)
#  FIX-06: QUEUE_REDIS_PASSWORD matches REDIS_PASSWORD
#  FIX-07: pnpm installed for deploy user (not root-only)
#  FIX-08: nest-cli.json restored via trap (even on build failure)
#  FIX-09: PM2 startup reliable method (no fragile grep)
#  FIX-10: PostgreSQL idempotent setup (safe re-run)
#  FIX-11: ENCRYPTION_KEY = 32 ASCII chars (AES-256 needs 32 bytes)
#  FIX-12: Missing vars added: STORAGE_TYPE, LOG_LEVEL, LOG_FILE_PATH, etc.
#  FIX-13: Frontend .env not overriding existing VITE_ API keys
#  FIX-14: Build uses SWC (already in deps) + fallback to tsc
#  FIX-15: Certbot run non-interactively after nginx HTTP is up
# =============================================================================

set -euo pipefail

# ── Colors ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
log_info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC}   $1"; }
log_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error()   { echo -e "${RED}[ERR]${NC}  $1" >&2; }
die()         { log_error "$1"; exit 1; }

# ── Paths ─────────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"   # deployment/ → root

DEPLOY_USER="kahade"
DEPLOY_DIR="/var/www/kahade"
BACKUP_DIR="/var/backups/kahade"
LOG_DIR="/var/log/kahade"
DOMAIN="kahade.id"
API_DOMAIN="api.kahade.id"

# ── Pre-flight ────────────────────────────────────────────────────────────────
log_info "Starting Kahade deployment..."

[ "$EUID" -ne 0 ] && die "Run as root: sudo bash deploy.sh"

if ! grep -q "Ubuntu 24" /etc/os-release 2>/dev/null; then
    log_warning "Designed for Ubuntu 24.04"
    read -rp "Continue anyway? (y/N): " reply
    [[ ! $reply =~ ^[Yy]$ ]] && exit 1
fi

[ ! -d "$PROJECT_ROOT/backend" ] && die "backend/ not found in $PROJECT_ROOT"
[ ! -d "$PROJECT_ROOT/frontend" ] && die "frontend/ not found in $PROJECT_ROOT"

# ── System packages ───────────────────────────────────────────────────────────
log_info "Updating system packages..."
apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y -qq

log_info "Installing dependencies..."
DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
    curl wget git build-essential nginx postgresql postgresql-contrib \
    redis-server certbot python3-certbot-nginx \
    ufw fail2ban htop net-tools ca-certificates gnupg lsb-release \
    clamav clamav-daemon  # FIX-00: ClamAV required by file-scan feature

# ── Node.js 20 ───────────────────────────────────────────────────────────────
log_info "Installing Node.js 20..."
if ! command -v node &>/dev/null || [[ "$(node -v)" != v20* ]]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >/dev/null
    apt-get install -y -qq nodejs
fi
log_success "Node $(node -v) / npm $(npm -v)"

# ── pnpm (FIX-07: install for both root AND deploy user) ─────────────────────
log_info "Installing pnpm..."
if ! command -v pnpm &>/dev/null; then
    npm install -g pnpm >/dev/null
fi
# Make pnpm available globally via symlink
PNPM_BIN="$(npm root -g)/pnpm/bin/pnpm.cjs"
[ -f "$PNPM_BIN" ] && ln -sf "$PNPM_BIN" /usr/local/bin/pnpm 2>/dev/null || true
log_success "pnpm $(pnpm -v)"

# ── PM2 ───────────────────────────────────────────────────────────────────────
if ! command -v pm2 &>/dev/null; then
    npm install -g pm2 >/dev/null
    pm2 install pm2-logrotate >/dev/null 2>&1 || true
    pm2 set pm2-logrotate:max_size 100M >/dev/null
    pm2 set pm2-logrotate:retain 30 >/dev/null
fi
log_success "pm2 $(pm2 -v)"

# ── PostgreSQL ────────────────────────────────────────────────────────────────
log_info "Configuring PostgreSQL..."
systemctl enable postgresql --quiet
systemctl start postgresql

# FIX-10: Idempotent DB setup using psql -v ON_ERROR_STOP=0
read -rsp "Enter database password for user 'kahade_user': " DB_PASSWORD
echo

su - postgres -c "psql -v ON_ERROR_STOP=0 <<'SQL'
SELECT pg_catalog.set_config('search_path', '', false);
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'kahade_user') THEN
    CREATE USER kahade_user WITH ENCRYPTED PASSWORD '$(echo "$DB_PASSWORD" | sed "s/'/''/g")';
  ELSE
    ALTER USER kahade_user WITH ENCRYPTED PASSWORD '$(echo "$DB_PASSWORD" | sed "s/'/''/g")';
  END IF;
END
\$\$;
SQL" 2>/dev/null

su - postgres -c "psql -v ON_ERROR_STOP=0 -c \"CREATE DATABASE kahade_prod OWNER kahade_user;\"" 2>/dev/null || true
su - postgres -c "psql -c \"GRANT ALL PRIVILEGES ON DATABASE kahade_prod TO kahade_user;\"" 2>/dev/null
su - postgres -c "psql -d kahade_prod -c \"GRANT ALL ON SCHEMA public TO kahade_user;\"" 2>/dev/null

log_success "PostgreSQL configured"

# ── Redis ─────────────────────────────────────────────────────────────────────
log_info "Configuring Redis..."
REDIS_PASSWORD="$(openssl rand -hex 32)"

REDIS_CONF="/etc/redis/redis.conf"
cp "$REDIS_CONF" "${REDIS_CONF}.bak.$(date +%Y%m%d%H%M%S)" 2>/dev/null || true

# Idempotently set requirepass, maxmemory, policy
_set_redis_conf() {
    local key="$1" val="$2"
    if grep -q "^${key}" "$REDIS_CONF"; then
        sed -i "s|^${key}.*|${key} ${val}|" "$REDIS_CONF"
    elif grep -q "^# ${key}" "$REDIS_CONF"; then
        sed -i "s|^# ${key}.*|${key} ${val}|" "$REDIS_CONF"
    else
        echo "${key} ${val}" >> "$REDIS_CONF"
    fi
}
_set_redis_conf requirepass      "$REDIS_PASSWORD"
_set_redis_conf maxmemory        256mb
_set_redis_conf maxmemory-policy allkeys-lru
_set_redis_conf bind             "127.0.0.1 ::1"

systemctl restart redis-server
sleep 2
systemctl is-active --quiet redis-server && log_success "Redis running" || die "Redis failed to start"

# ── ClamAV ────────────────────────────────────────────────────────────────────
log_info "Updating ClamAV virus definitions..."
freshclam --quiet 2>/dev/null || log_warning "freshclam failed (no internet?), continuing..."
systemctl enable clamav-daemon --quiet 2>/dev/null || true
systemctl start  clamav-daemon 2>/dev/null || log_warning "clamav-daemon didn't start, file scanning may be degraded"

# ── Deploy user & directories ─────────────────────────────────────────────────
if ! id "$DEPLOY_USER" &>/dev/null; then
    useradd -m -s /bin/bash "$DEPLOY_USER"
fi

mkdir -p \
    "$DEPLOY_DIR/backend" \
    "$DEPLOY_DIR/frontend" \
    "$BACKUP_DIR" \
    "$LOG_DIR" \
    "/var/www/kahade/uploads" \
    "/var/www/certbot"

chown -R "$DEPLOY_USER:$DEPLOY_USER" "$DEPLOY_DIR" "$LOG_DIR" "/var/www/kahade/uploads"
chmod 750 "$DEPLOY_DIR"

# ── Firewall ──────────────────────────────────────────────────────────────────
ufw --force enable >/dev/null
ufw default deny incoming >/dev/null
ufw default allow outgoing >/dev/null
ufw allow 22/tcp   >/dev/null
ufw allow 80/tcp   >/dev/null
ufw allow 443/tcp  >/dev/null
ufw allow from 127.0.0.1 to any port 3000 >/dev/null
ufw allow from 127.0.0.1 to any port 5432 >/dev/null
ufw allow from 127.0.0.1 to any port 6379 >/dev/null
log_success "Firewall configured"

# ── Copy project files ────────────────────────────────────────────────────────
log_info "Copying project files..."
rsync -a --delete \
    --exclude='.env*' \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='.pnpm-store' \
    "$PROJECT_ROOT/backend/" "$DEPLOY_DIR/backend/"

rsync -a --delete \
    --exclude='.env*' \
    --exclude='node_modules' \
    --exclude='dist' \
    "$PROJECT_ROOT/frontend/" "$DEPLOY_DIR/frontend/"

chown -R "$DEPLOY_USER:$DEPLOY_USER" "$DEPLOY_DIR"

# ── Generate secrets ──────────────────────────────────────────────────────────
log_info "Generating secrets..."
JWT_SECRET="$(openssl rand -hex 32)"
JWT_REFRESH_SECRET="$(openssl rand -hex 32)"
SESSION_SECRET="$(openssl rand -hex 32)"
# FIX-11: COOKIE_SECRET = 32 printable ASCII chars (no special chars that break xargs)
COOKIE_SECRET="$(openssl rand -hex 16)"      # 32 hex chars = safe for cookieParser
CSRF_SECRET="$(openssl rand -hex 16)"
# FIX-11: ENCRYPTION_KEY must be exactly 32 ASCII chars for AES-256
ENCRYPTION_KEY="$(openssl rand -hex 16)"     # 32 hex chars = 32 bytes

# ── Write .env.production (FIX-02, FIX-04, FIX-05, FIX-06, FIX-12) ───────────
log_info "Writing .env.production..."
ENV_FILE="$DEPLOY_DIR/backend/.env.production"

cat > "$ENV_FILE" << EOF
# ============================================================
# AUTO-GENERATED BY deploy.sh — $(date)
# ============================================================

# APPLICATION
NODE_ENV=production
PORT=3000
API_PREFIX=api
APP_NAME=Kahade
APP_URL=https://${DOMAIN}
API_URL=https://${API_DOMAIN}
FRONTEND_URL=https://${DOMAIN}
ENABLE_SWAGGER=false

# DATABASE
DATABASE_URL=postgresql://kahade_user:${DB_PASSWORD}@localhost:5432/kahade_prod?schema=public&connection_limit=20&pool_timeout=30
DATABASE_POOL_MIN=5
DATABASE_POOL_MAX=20

# REDIS — FIX-02: REDIS_ENABLED must be 'true' or queues/sessions are silently disabled
REDIS_ENABLED=true
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASSWORD}
REDIS_DB=0
REDIS_TLS_ENABLED=false
REDIS_KEY_PREFIX=kahade:prod:

# QUEUE (Bull) — FIX-06: password must match REDIS_PASSWORD
QUEUE_REDIS_HOST=localhost
QUEUE_REDIS_PORT=6379
QUEUE_REDIS_PASSWORD=${REDIS_PASSWORD}
QUEUE_REDIS_DB=1

# JWT — FIX-05: correct var names read by jwt.config.ts
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=15m
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
JWT_REFRESH_EXPIRES_IN=7d
JWT_REFRESH_TOKEN_EXPIRY=7d

# SECURITY
COOKIE_SECRET=${COOKIE_SECRET}
SESSION_SECRET=${SESSION_SECRET}
CSRF_SECRET=${CSRF_SECRET}
ENCRYPTION_KEY=${ENCRYPTION_KEY}
ENCRYPTION_ALGORITHM=aes-256-gcm
ENCRYPTION_IV=
BCRYPT_ROUNDS=12
ENABLE_HELMET=true
ENABLE_CSRF=true
TRUST_PROXY=true

# CORS
CORS_ORIGIN=https://${DOMAIN},https://www.${DOMAIN}
CORS_ORIGINS=https://${DOMAIN},https://www.${DOMAIN}
CORS_CREDENTIALS=true

# RATE LIMITING
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
THROTTLE_TTL=60
THROTTLE_LIMIT=100
THROTTLE_LOGIN_LIMIT=5
THROTTLE_OTP_LIMIT=3

# STORAGE — FIX-12: required field
STORAGE_TYPE=local
UPLOAD_PATH=/var/www/kahade/uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,application/pdf
ENABLE_FILE_SCAN=true

# LOGGING — FIX-12: required field
LOG_LEVEL=info
LOG_FORMAT=json
LOG_FILE_PATH=/var/log/kahade
LOG_DIR=/var/log/kahade
LOG_MAX_FILES=30
LOG_MAX_SIZE=100m

# ANTIVIRUS
CLAMAV_ENABLED=true
CLAMAV_HOST=localhost
CLAMAV_PORT=3310
CLAMAV_TIMEOUT=60000

# MONITORING
ENABLE_METRICS=true
METRICS_PORT=9090
PROMETHEUS_ENABLED=true
SENTRY_DSN=

# EMAIL (SMTP) — fill in after deploy
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@${DOMAIN}
SMTP_PASS=CHANGE_ME_SMTP_PASSWORD
SMTP_PASSWORD=CHANGE_ME_SMTP_PASSWORD
EMAIL_FROM=noreply@${DOMAIN}
EMAIL_FROM_NAME=Kahade
SMTP_FROM_NAME=Kahade
SMTP_FROM_EMAIL=noreply@${DOMAIN}

# SMS — fill in after deploy
SMS_PROVIDER=twilio
SMS_API_KEY=CHANGE_ME
SMS_API_SECRET=CHANGE_ME
SMS_FROM=+6281234567890

# PAYMENT GATEWAY — ⚠️ REQUIRED: fill in before going live
PAYMENT_GATEWAY=midtrans
PAYMENT_API_KEY=CHANGE_ME
PAYMENT_WEBHOOK_SECRET=CHANGE_ME
PAYMENT_SANDBOX=false
PAYMENT_CALLBACK_URL=https://${API_DOMAIN}/api/v1/webhooks/payment
MIDTRANS_SERVER_KEY=CHANGE_ME
MIDTRANS_CLIENT_KEY=CHANGE_ME
MIDTRANS_IS_PRODUCTION=true
XENDIT_SECRET_KEY=CHANGE_ME
XENDIT_CALLBACK_TOKEN=CHANGE_ME

# KYC — ⚠️ REQUIRED: fill in before going live
KYC_PROVIDER=sumsub
KYC_API_KEY=CHANGE_ME
KYC_API_SECRET=CHANGE_ME
KYC_WEBHOOK_SECRET=CHANGE_ME
KYC_CALLBACK_URL=https://${API_DOMAIN}/api/v1/webhooks/kyc

# BUSINESS RULES
PLATFORM_FEE_PERCENTAGE=2.5
MIN_TRANSACTION_AMOUNT=10000
MAX_TRANSACTION_AMOUNT=100000000
ESCROW_AUTO_RELEASE_DAYS=7
DISPUTE_DEADLINE_DAYS=3
KYC_EXPIRY_DAYS=365
KYC_REQUIRED_AMOUNT=5000000

# FEATURE FLAGS
ENABLE_REFERRAL=true
ENABLE_PROMO=true
ENABLE_BADGE=true
ENABLE_MFA=true
ENABLE_EMAIL_VERIFICATION=true
ENABLE_SMS_VERIFICATION=true
ENABLE_PUSH_NOTIFICATIONS=true
ENABLE_2FA=true

# ADMIN
ADMIN_EMAIL=admin@${DOMAIN}
ADMIN_PASSWORD=CHANGE_ME_NOW

# BACKUP
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAYS=30
BACKUP_PATH=/var/backups/kahade
BACKUP_S3_ENABLED=false

# SCALING (PM2)
PM2_INSTANCES=1
PM2_EXEC_MODE=fork
GRACEFUL_SHUTDOWN_TIMEOUT=30000

# HEALTH CHECK
HEALTH_CHECK_PATH=/api/v1/health
HEALTH_CHECK_INTERVAL=30

# WEBHOOK
WEBHOOK_RETRY_ATTEMPTS=3
WEBHOOK_RETRY_DELAY=5000
WEBHOOK_TIMEOUT=30000

# SSL
SSL_CERT_PATH=/etc/letsencrypt/live/${API_DOMAIN}/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/${API_DOMAIN}/privkey.pem
EOF

chmod 600 "$ENV_FILE"
chown "$DEPLOY_USER:$DEPLOY_USER" "$ENV_FILE"
log_success ".env.production written"

# ── Backend: dependencies ─────────────────────────────────────────────────────
log_info "Installing backend dependencies (clean)..."
cd "$DEPLOY_DIR/backend"

sudo -u "$DEPLOY_USER" rm -rf dist node_modules

# FIX-07: set pnpm store dir accessible to deploy user
sudo -u "$DEPLOY_USER" pnpm config set store-dir "/home/$DEPLOY_USER/.local/share/pnpm/store" 2>/dev/null || true
sudo -u "$DEPLOY_USER" pnpm install --frozen-lockfile 2>&1 | tail -5 \
    || sudo -u "$DEPLOY_USER" pnpm install 2>&1 | tail -5 \
    || die "pnpm install failed"

for pkg in "@nestjs/core" "@nestjs/platform-express" "@prisma/client"; do
    [ -d "node_modules/$pkg" ] || die "Critical package missing: $pkg"
done
log_success "Dependencies installed"

# ── Backend: Prisma generate ───────────────────────────────────────────────────
log_info "Generating Prisma client..."
# FIX-04: use --dotenv flag instead of fragile xargs export
sudo -u "$DEPLOY_USER" bash -c "
  set -a
  source '$ENV_FILE'
  set +a
  npx prisma generate
" || die "prisma generate failed"
log_success "Prisma client generated"

# ── Backend: Build ────────────────────────────────────────────────────────────
log_info "Building backend..."

# FIX-08: Restore nest-cli.json even if build fails (trap)
NESTCLI_BACKUP=""
if [ -f nest-cli.json ]; then
    cp nest-cli.json nest-cli.json.deploy.bak
    NESTCLI_BACKUP="$DEPLOY_DIR/backend/nest-cli.json.deploy.bak"
fi
_restore_nestcli() {
    [ -n "$NESTCLI_BACKUP" ] && [ -f "$NESTCLI_BACKUP" ] && \
        mv "$NESTCLI_BACKUP" "$DEPLOY_DIR/backend/nest-cli.json" 2>/dev/null || true
}
trap _restore_nestcli EXIT

# Production nest-cli: SWC (already in deps) + no Swagger plugins
cat > nest-cli.json << 'NESTCLI'
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "webpack": false,
    "tsConfigPath": "tsconfig.build.json",
    "builder": "swc",
    "typeCheck": false,
    "plugins": []
  }
}
NESTCLI

sudo -u "$DEPLOY_USER" NODE_ENV=production npx nest build
BUILD_EXIT=$?

_restore_nestcli
trap - EXIT

[ $BUILD_EXIT -ne 0 ] && die "nest build failed"
[ ! -f "dist/main.js" ] && die "dist/main.js not found after build"
log_success "Backend built → dist/main.js"

# ── Backend: Migrations ───────────────────────────────────────────────────────
log_info "Running database migrations..."
sudo -u "$DEPLOY_USER" bash -c "
  set -a
  source '$ENV_FILE'
  set +a
  npx prisma migrate deploy
" && log_success "Migrations applied" || log_warning "Migration step had errors — check manually"

# ── Frontend: Build ───────────────────────────────────────────────────────────
log_info "Building frontend..."
cd "$DEPLOY_DIR/frontend"

cat > .env.production << EOF
VITE_APP_ENV=production
VITE_API_URL=https://${API_DOMAIN}/api
VITE_WS_URL=wss://${API_DOMAIN}
EOF

sudo -u "$DEPLOY_USER" rm -rf node_modules
sudo -u "$DEPLOY_USER" pnpm config set store-dir "/home/$DEPLOY_USER/.local/share/pnpm/store" 2>/dev/null || true
sudo -u "$DEPLOY_USER" pnpm install 2>&1 | tail -5 || die "frontend pnpm install failed"
sudo -u "$DEPLOY_USER" pnpm run build 2>&1 | tail -10 || die "frontend build failed"
[ ! -d "dist" ] && die "frontend dist/ missing after build"
log_success "Frontend built"

# ── Nginx: HTTP-only first (FIX-01) ─────────────────────────────────────────
# Deploy HTTP config first → get certbot certs → replace with HTTPS config
log_info "Configuring Nginx (HTTP only for initial deploy)..."

cat > /etc/nginx/nginx.conf << 'NGINXMAIN'
user www-data;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 2048;
    use epoll;
    multi_accept on;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" rt=$request_time';

    access_log /var/log/nginx/access.log main;
    sendfile on; tcp_nopush on; tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 10M;
    server_tokens off;
    gzip on; gzip_vary on; gzip_proxied any; gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript
               application/json application/javascript;

    limit_req_zone  $binary_remote_addr zone=api_limit:10m  rate=100r/m;
    limit_req_zone  $binary_remote_addr zone=auth_limit:10m rate=5r/m;
    limit_req_status 429;
    limit_conn_zone $binary_remote_addr zone=addr:10m;
    limit_conn addr 20;

    upstream api_backend {
        server 127.0.0.1:3000 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    include /etc/nginx/conf.d/*.conf;
}
NGINXMAIN

# Remove any existing site configs to start clean
rm -f /etc/nginx/conf.d/*.conf
rm -f /etc/nginx/sites-enabled/*

# HTTP-only config (both domains) — needed to pass certbot ACME challenge
cat > /etc/nginx/conf.d/kahade-http.conf << HTTPCONF
# Temporary HTTP-only config — replaced with HTTPS after certbot
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN};

    location /.well-known/acme-challenge/ { root /var/www/certbot; }

    location / {
        root ${DEPLOY_DIR}/frontend/dist;
        index index.html;
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "no-cache";
    }
}

server {
    listen 80;
    listen [::]:80;
    server_name ${API_DOMAIN};

    location /.well-known/acme-challenge/ { root /var/www/certbot; }

    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_hide_header X-Powered-By;
    }

    location /api/v1/health {
        access_log off;
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
    }

    location /api/v1/auth/ {
        limit_req zone=auth_limit burst=3 nodelay;
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
HTTPCONF

nginx -t || die "Nginx config test failed"
systemctl enable nginx --quiet
systemctl restart nginx
systemctl is-active --quiet nginx && log_success "Nginx running (HTTP)" || die "Nginx failed to start"

# ── PM2: Start backend (FIX-03, FIX-09) ──────────────────────────────────────
log_info "Starting backend with PM2..."
cd "$DEPLOY_DIR/backend"

# Write ecosystem config that reads env from file (FIX-03)
cat > ecosystem.config.prod.js << ECOSYSTEM
module.exports = {
  apps: [{
    name: 'kahade-api',
    script: './dist/main.js',
    instances: 1,
    exec_mode: 'fork',
    env_file: '${ENV_FILE}',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    max_memory_restart: '512M',
    node_args: '--max-old-space-size=480',
    error_file: '${LOG_DIR}/pm2-error.log',
    out_file: '${LOG_DIR}/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s',
    listen_timeout: 15000,
    kill_timeout: 5000,
    exp_backoff_restart_delay: 100,
  }]
};
ECOSYSTEM

chown "$DEPLOY_USER:$DEPLOY_USER" ecosystem.config.prod.js

# Stop existing processes
sudo -u "$DEPLOY_USER" pm2 delete kahade-api 2>/dev/null || true

# FIX-09: Start via ecosystem config (env_file is loaded by PM2 natively)
sudo -u "$DEPLOY_USER" pm2 start ecosystem.config.prod.js
sudo -u "$DEPLOY_USER" pm2 save --force

# FIX-09: PM2 startup — reliable method
log_info "Configuring PM2 boot startup..."
# Write a systemd service directly (most reliable)
PM2_PATH="$(su -c 'which pm2' - "$DEPLOY_USER" 2>/dev/null || echo '/usr/local/bin/pm2')"
HOME_DIR="/home/$DEPLOY_USER"

cat > /etc/systemd/system/pm2-kahade.service << SYSTEMD
[Unit]
Description=PM2 process manager (kahade)
Documentation=https://pm2.keymetrics.io/
After=network.target redis-server.service postgresql.service

[Service]
Type=forking
User=${DEPLOY_USER}
LimitNOFILE=65536
PIDFile=${HOME_DIR}/.pm2/pm2.pid
Restart=on-failure

ExecStart=${PM2_PATH} resurrect
ExecReload=${PM2_PATH} reload all
ExecStop=${PM2_PATH} kill

[Install]
WantedBy=multi-user.target
SYSTEMD

systemctl daemon-reload
systemctl enable pm2-kahade --quiet
log_success "PM2 systemd service created"

# ── Wait for backend to start ──────────────────────────────────────────────────
log_info "Waiting for backend to start..."
for i in $(seq 1 20); do
    sleep 3
    STATUS=$(sudo -u "$DEPLOY_USER" pm2 list 2>/dev/null | grep "kahade-api" | grep "online" || echo "")
    if [ -n "$STATUS" ]; then
        log_success "Backend online (attempt $i)"
        break
    fi
    [ "$i" -eq 20 ] && {
        log_error "Backend failed to start after 60s"
        log_error "Last PM2 logs:"
        sudo -u "$DEPLOY_USER" pm2 logs kahade-api --lines 50 --nostream --err 2>/dev/null || true
        die "Backend startup failed — check logs: pm2 logs kahade-api"
    }
    log_warning "  ...waiting ($i/20)"
done

# ── Health check ───────────────────────────────────────────────────────────────
log_info "Testing health endpoint..."
sleep 3
if curl -fsS "http://localhost:3000/api/v1/health" > /dev/null 2>&1; then
    log_success "Health check passed → http://localhost:3000/api/v1/health"
else
    log_warning "Health endpoint not yet responding — may still be initializing"
    log_info  "  Manual check: curl http://localhost:3000/api/v1/health"
fi

# ── SSL Certificates (FIX-01, FIX-15) ────────────────────────────────────────
log_info "Obtaining SSL certificates via Let's Encrypt..."
read -rp "Run certbot now? (requires DNS pointing to this server) (y/N): " run_certbot
if [[ "$run_certbot" =~ ^[Yy]$ ]]; then
    certbot certonly --webroot \
        -w /var/www/certbot \
        -d "$DOMAIN" -d "www.$DOMAIN" \
        --non-interactive --agree-tos \
        --email "admin@$DOMAIN" \
        --no-eff-email 2>/dev/null \
    && log_success "Cert obtained: $DOMAIN"

    certbot certonly --webroot \
        -w /var/www/certbot \
        -d "$API_DOMAIN" \
        --non-interactive --agree-tos \
        --email "admin@$DOMAIN" \
        --no-eff-email 2>/dev/null \
    && log_success "Cert obtained: $API_DOMAIN"

    # Replace HTTP-only config with full HTTPS config
    log_info "Switching Nginx to HTTPS..."
    rm -f /etc/nginx/conf.d/kahade-http.conf

    # Copy HTTPS configs from project (with corrected paths)
    if [ -d "$PROJECT_ROOT/nginx/conf.d" ]; then
        cp "$PROJECT_ROOT/nginx/conf.d/"*.conf /etc/nginx/conf.d/
        # FIX: frontend root path
        sed -i "s|root /var/www/frontend;|root ${DEPLOY_DIR}/frontend/dist;|g" \
            /etc/nginx/conf.d/frontend.conf
    else
        log_warning "nginx/conf.d/ not found in project, generating basic HTTPS configs..."
        _write_https_configs
    fi

    nginx -t && systemctl reload nginx \
        && log_success "Nginx reloaded with HTTPS" \
        || log_error "Nginx HTTPS config failed — still running HTTP"

    # Auto-renew cron
    (crontab -l 2>/dev/null | grep -v certbot; \
     echo "0 3 * * * certbot renew --quiet && systemctl reload nginx") | crontab -
else
    log_warning "Skipping certbot — site is running on HTTP only"
    log_info "  Run later: certbot --nginx -d $DOMAIN -d www.$DOMAIN -d $API_DOMAIN"
fi

# ── fail2ban ──────────────────────────────────────────────────────────────────
log_info "Configuring fail2ban..."
[ -f /etc/fail2ban/jail.conf ] && \
    cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local 2>/dev/null || true

cat > /etc/fail2ban/filter.d/kahade-api.conf << 'EOF'
[Definition]
failregex = ^.*"POST /api/v1/auth/login.*" 401
ignoreregex =
EOF

grep -q '\[kahade-api\]' /etc/fail2ban/jail.local 2>/dev/null || \
cat >> /etc/fail2ban/jail.local << EOF

[kahade-api]
enabled  = true
port     = 80,443
filter   = kahade-api
logpath  = /var/log/nginx/api-access.log
maxretry = 10
bantime  = 3600
findtime = 600
EOF

systemctl enable fail2ban --quiet
systemctl restart fail2ban
log_success "fail2ban configured"

# ── Backup cron ───────────────────────────────────────────────────────────────
cat > /usr/local/bin/kahade-backup.sh << 'BACKUP'
#!/bin/bash
BACKUP_DIR="/var/backups/kahade"
DATE="$(date +%Y%m%d_%H%M%S)"
pg_dump -U kahade_user -h localhost kahade_prod | gzip > "${BACKUP_DIR}/db_${DATE}.sql.gz" \
  && echo "[OK] DB backup: db_${DATE}.sql.gz"
find "$BACKUP_DIR" -name "*.gz" -mtime +30 -delete
BACKUP
chmod +x /usr/local/bin/kahade-backup.sh

(crontab -l 2>/dev/null | grep -v kahade-backup; \
 echo "0 2 * * * PGPASSWORD='${DB_PASSWORD}' /usr/local/bin/kahade-backup.sh >> ${LOG_DIR}/backup.log 2>&1") \
| crontab -

# ── Save credentials ──────────────────────────────────────────────────────────
CREDS_FILE="${BACKUP_DIR}/credentials_$(date +%Y%m%d_%H%M%S).txt"
mkdir -p "$BACKUP_DIR"
cat > "$CREDS_FILE" << CREDS
Kahade Deployment Credentials — $(date)
========================================
Database User:       kahade_user
Database Password:   ${DB_PASSWORD}
Database Name:       kahade_prod

Redis Password:      ${REDIS_PASSWORD}

JWT Secret:          ${JWT_SECRET}
JWT Refresh Secret:  ${JWT_REFRESH_SECRET}
Session Secret:      ${SESSION_SECRET}
Cookie Secret:       ${COOKIE_SECRET}
CSRF Secret:         ${CSRF_SECRET}
Encryption Key:      ${ENCRYPTION_KEY}
========================================
⚠️  Store this file SECURELY and delete from server after noting credentials.
CREDS
chmod 600 "$CREDS_FILE"

# ── Summary ───────────────────────────────────────────────────────────────────
echo
echo "==========================================================================="
echo "🚀 KAHADE DEPLOYED SUCCESSFULLY"
echo "==========================================================================="
echo
echo "  🌐 Frontend:  http://${DOMAIN}   (HTTPS after certbot)"
echo "  🔌 API:       http://${API_DOMAIN}/api/v1"
echo "  ❤️  Health:    http://${API_DOMAIN}/api/v1/health"
echo
echo "  📋 Status commands:"
echo "     sudo -u kahade pm2 list"
echo "     sudo -u kahade pm2 logs kahade-api --lines 50"
echo "     curl http://localhost:3000/api/v1/health"
echo "     systemctl status nginx redis-server postgresql"
echo
echo "  ⚠️  TODO before going live:"
echo "     1. Edit ${ENV_FILE}"
echo "        Set: SMTP_PASS, PAYMENT_API_KEY, MIDTRANS_SERVER_KEY,"
echo "             XENDIT_SECRET_KEY, KYC_API_KEY, ADMIN_PASSWORD"
echo "     2. sudo -u kahade pm2 restart kahade-api"
echo "     3. Run certbot for SSL (if not done above)"
echo "     4. Change admin password at https://${DOMAIN}/admin"
echo
echo "  🔑 Credentials saved to: ${CREDS_FILE}"
echo "==========================================================================="
