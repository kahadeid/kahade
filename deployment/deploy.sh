#!/bin/bash
# =============================================================================
# KAHADE PRODUCTION DEPLOY SCRIPT
# =============================================================================
# Usage: sudo bash deploy.sh
# Requires: Ubuntu 24.04, run as root dari root project (bukan dari deployment/)
#
# Subdomain architecture:
#   kahade.id       → landing page (VITE_APP_MODE=landing)
#   app.kahade.id   → user dashboard (VITE_APP_MODE=app)
#   admin.kahade.id → admin panel (VITE_APP_MODE=admin)
#   api.kahade.id   → NestJS backend API
#
# SSL: Cloudflare Flexible mode (nginx hanya HTTP di backend,
#       Cloudflare yang handle HTTPS ke user)
# =============================================================================

set -euo pipefail

# ── Colors ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
log_info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC}   $1"; }
log_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error()   { echo -e "${RED}[ERR]${NC}  $1" >&2; }
die()         { log_error "$1"; exit 1; }

# ── Paths (auto-detect PROJECT_ROOT) ──────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -d "$SCRIPT_DIR/../backend" ] && [ -d "$SCRIPT_DIR/../frontend" ]; then
    PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
elif [ -d "$SCRIPT_DIR/backend" ] && [ -d "$SCRIPT_DIR/frontend" ]; then
    PROJECT_ROOT="$SCRIPT_DIR"
else
    die "Tidak bisa menentukan PROJECT_ROOT. Pastikan script ada di dalam project Kahade."
fi

DEPLOY_USER="kahade"
DEPLOY_DIR="/var/www/kahade"
BACKUP_DIR="/var/backups/kahade"
LOG_DIR="/var/log/kahade"

# ── BUG FIX: Tambah APP_DOMAIN dan ADMIN_DOMAIN ───────────────────────────────
# Script asli hanya definisi DOMAIN dan API_DOMAIN.
# Tanpa variabel ini, nginx configs untuk app.kahade.id dan admin.kahade.id
# tidak bisa di-generate, dan CORS_ORIGIN tidak mencakup kedua subdomain tersebut.
DOMAIN="kahade.id"
APP_DOMAIN="app.kahade.id"
ADMIN_DOMAIN="admin.kahade.id"
API_DOMAIN="api.kahade.id"

# ── Pre-flight ────────────────────────────────────────────────────────────────
log_info "Starting Kahade deployment..."

[ "$EUID" -ne 0 ] && die "Run as root: sudo bash deploy.sh"

if ! grep -q "Ubuntu 24" /etc/os-release 2>/dev/null; then
    log_warning "Designed for Ubuntu 24.04"
    read -rp "Continue anyway? (y/N): " reply
    [[ ! $reply =~ ^[Yy]$ ]] && exit 1
fi

[ ! -d "$PROJECT_ROOT/backend" ]  && die "backend/ not found in $PROJECT_ROOT"
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
    clamav clamav-daemon

# ── Node.js 20 ───────────────────────────────────────────────────────────────
log_info "Installing Node.js 20..."
if ! command -v node &>/dev/null || [[ "$(node -v)" != v20* ]]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >/dev/null
    apt-get install -y -qq nodejs
fi
log_success "Node $(node -v) / npm $(npm -v)"

# ── pnpm ─────────────────────────────────────────────────────────────────────
log_info "Installing pnpm..."
if ! command -v pnpm &>/dev/null; then
    npm install -g pnpm >/dev/null
fi
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

log_info "Setting up PostgreSQL database..."
read -rsp "Enter database password for user 'kahade_user': " DB_PASSWORD
echo

if echo "$DB_PASSWORD" | grep -qP '[@:/?#\[\]@!$&'"'"'()*+,;=%]' 2>/dev/null; then
    log_warning "Password mengandung karakter URL-khusus. Gunakan password sederhana."
    read -rsp "Masukkan ulang password (a-z, A-Z, 0-9, _-): " DB_PASSWORD
    echo
fi

DB_PASSWORD_URLENC="$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.stdin.read().strip(), safe=''))" <<< "$DB_PASSWORD")"
DB_PASSWORD_ESCAPED="$(echo "$DB_PASSWORD" | sed "s/'/''/g")"

su - postgres -c "psql -v ON_ERROR_STOP=0" <<SQL 2>/dev/null || true
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'kahade_user') THEN
    CREATE USER kahade_user WITH ENCRYPTED PASSWORD '$DB_PASSWORD_ESCAPED';
  ELSE
    ALTER USER kahade_user WITH ENCRYPTED PASSWORD '$DB_PASSWORD_ESCAPED';
  END IF;
END
\$\$;
SQL

su - postgres -c "psql -v ON_ERROR_STOP=0 -c \"CREATE DATABASE kahade_prod OWNER kahade_user;\"" 2>/dev/null || true
su - postgres -c "psql -c \"GRANT ALL PRIVILEGES ON DATABASE kahade_prod TO kahade_user;\"" 2>/dev/null || true
su - postgres -c "psql -d kahade_prod -c \"GRANT ALL ON SCHEMA public TO kahade_user;\"" 2>/dev/null || true
log_success "PostgreSQL configured"

# ── Redis ─────────────────────────────────────────────────────────────────────
log_info "Configuring Redis..."
REDIS_PASSWORD="$(openssl rand -hex 32)"
REDIS_CONF="/etc/redis/redis.conf"
cp "$REDIS_CONF" "${REDIS_CONF}.bak.$(date +%Y%m%d%H%M%S)" 2>/dev/null || true

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
systemctl start  clamav-daemon 2>/dev/null || log_warning "clamav-daemon tidak start, file scanning mungkin terdegradasi"

# ── Deploy user & directories ─────────────────────────────────────────────────
if ! id "$DEPLOY_USER" &>/dev/null; then
    useradd -m -s /bin/bash "$DEPLOY_USER"
fi

# BUG FIX: Tambah direktori untuk 3 frontend dist (landing, app, admin)
# Script asli hanya buat $DEPLOY_DIR/frontend tanpa memperhitungkan kebutuhan
# 3 dist terpisah untuk 3 subdomain.
mkdir -p \
    "$DEPLOY_DIR/backend" \
    "$DEPLOY_DIR/frontend" \
    "$DEPLOY_DIR/frontend-app" \
    "$DEPLOY_DIR/frontend-admin" \
    "$BACKUP_DIR" \
    "$LOG_DIR" \
    "/var/www/kahade/uploads" \
    "/var/www/kahade/uploads/avatars" \
    "/var/www/kahade/uploads/kyc" \
    "/var/www/certbot"

chown -R "$DEPLOY_USER:$DEPLOY_USER" "$DEPLOY_DIR" "$LOG_DIR" "/var/www/kahade/uploads"
chmod 700 "/var/www/kahade/uploads"

# nginx (www-data) harus bisa baca semua 3 frontend dist
usermod -aG "$DEPLOY_USER" www-data
chmod 755 "$DEPLOY_DIR"
chmod 755 "$DEPLOY_DIR/frontend"
chmod 755 "$DEPLOY_DIR/frontend-app"
chmod 755 "$DEPLOY_DIR/frontend-admin"
log_success "nginx (www-data) ditambahkan ke group $DEPLOY_USER"

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
COOKIE_SECRET="$(openssl rand -hex 16)"
CSRF_SECRET="$(openssl rand -hex 16)"
ENCRYPTION_KEY="$(openssl rand -hex 16)"
BANK_ENCRYPTION_KEY="$(openssl rand -hex 32)"
KYC_ENCRYPTION_KEY="$(openssl rand -hex 32)"
ENCRYPTION_IV="$(openssl rand -hex 8)"
REDIS_URL="redis://:${REDIS_PASSWORD}@localhost:6379/0"

# ── Write .env.production ─────────────────────────────────────────────────────
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
DATABASE_URL=postgresql://kahade_user:${DB_PASSWORD_URLENC}@localhost:5432/kahade_prod?schema=public&connection_limit=20&pool_timeout=30
DATABASE_POOL_MIN=5
DATABASE_POOL_MAX=20

# REDIS
REDIS_ENABLED=true
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASSWORD}
REDIS_DB=0
REDIS_TLS=false
REDIS_TLS_ENABLED=false
REDIS_KEY_PREFIX=kahade:prod:
REDIS_URL=${REDIS_URL}

# QUEUE (Bull)
QUEUE_REDIS_HOST=localhost
QUEUE_REDIS_PORT=6379
QUEUE_REDIS_PASSWORD=${REDIS_PASSWORD}
QUEUE_REDIS_DB=1

# JWT
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
ENCRYPTION_IV=${ENCRYPTION_IV}
BANK_ENCRYPTION_KEY=${BANK_ENCRYPTION_KEY}
KYC_ENCRYPTION_KEY=${KYC_ENCRYPTION_KEY}
BCRYPT_ROUNDS=12
ENABLE_HELMET=true
ENABLE_CSRF=true
TRUST_PROXY=true

# BUG FIX: CORS_ORIGIN harus mencakup SEMUA subdomain yang mengakses API.
# Script asli hanya include kahade.id dan www.kahade.id → API calls dari
# app.kahade.id dan admin.kahade.id di-block dengan CORS error (403).
CORS_ORIGIN=https://${DOMAIN},https://www.${DOMAIN},https://${APP_DOMAIN},https://${ADMIN_DOMAIN}
CORS_ORIGINS=https://${DOMAIN},https://www.${DOMAIN},https://${APP_DOMAIN},https://${ADMIN_DOMAIN}
CORS_CREDENTIALS=true

# RATE LIMITING
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
THROTTLE_TTL=60
THROTTLE_LIMIT=100
THROTTLE_LOGIN_LIMIT=5
THROTTLE_OTP_LIMIT=3

# STORAGE
STORAGE_TYPE=local
UPLOAD_PATH=/var/www/kahade/uploads
UPLOAD_DEST=/var/www/kahade/uploads
AVATAR_UPLOAD_DEST=/var/www/kahade/uploads/avatars
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,application/pdf
ENABLE_FILE_SCAN=true

# LOGGING
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

# EMAIL (SMTP) — Zoho Mail
# 1. Login ke mail.zoho.com → Settings → Mail Accounts → verifikasi@kahade.id
# 2. Settings → Security → App Passwords → buat App Password
# 3. Isi SMTP_PASS dengan App Password tersebut (BUKAN password login Zoho)
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=verifikasi@${DOMAIN}
SMTP_PASS=CHANGE_ME_ZOHO_APP_PASSWORD
SMTP_PASSWORD=CHANGE_ME_ZOHO_APP_PASSWORD
EMAIL_FROM=verifikasi@${DOMAIN}
EMAIL_FROM_NAME=Kahade
SMTP_FROM_NAME=Kahade
SMTP_FROM_EMAIL=verifikasi@${DOMAIN}

# SMS
SMS_PROVIDER=twilio
SMS_API_KEY=CHANGE_ME
SMS_API_SECRET=CHANGE_ME
SMS_FROM=+6281234567890

# PAYMENT GATEWAY — ⚠️ WAJIB diisi sebelum go live
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

# KYC — ⚠️ WAJIB diisi sebelum go live
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
WEBHOOK_SECRET=${JWT_SECRET}

# CACHE
CACHE_TTL=3600
CACHE_MAX_ITEMS=1000

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
MIGRATE_DB_URL="$(grep '^DATABASE_URL=' "$ENV_FILE" | cut -d'=' -f2-)"
sudo -u "$DEPLOY_USER" bash -c "
  cd '$DEPLOY_DIR/backend'
  DATABASE_URL='$MIGRATE_DB_URL' npx prisma generate --schema=./prisma/schema.prisma
" || die "prisma generate failed"
log_success "Prisma client generated"

# ── Backend: Build ────────────────────────────────────────────────────────────
log_info "Building backend..."

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

sudo -u "$DEPLOY_USER" bash -c "cd '$DEPLOY_DIR/backend' && NODE_ENV=production npx nest build"
BUILD_EXIT=$?

_restore_nestcli
trap - EXIT

[ $BUILD_EXIT -ne 0 ] && die "nest build failed"
[ ! -f "dist/main.js" ] && die "dist/main.js not found after build"
log_success "Backend built → dist/main.js"

# ── Backend: Migrations ───────────────────────────────────────────────────────
log_info "Running database migrations..."
MIGRATE_DB_URL="$(grep '^DATABASE_URL=' "$ENV_FILE" | cut -d'=' -f2-)"
[ -z "$MIGRATE_DB_URL" ] && die "DATABASE_URL tidak ditemukan di $ENV_FILE"

sudo -u "$DEPLOY_USER" bash -c "
  cd '$DEPLOY_DIR/backend'
  DATABASE_URL='$MIGRATE_DB_URL' npx prisma migrate deploy --schema=./prisma/schema.prisma
" || die "DATABASE MIGRATION GAGAL — deploy dibatalkan."
log_success "Semua migrasi database berhasil diterapkan"

log_info "Applying hotfix: disputes.description column..."
sudo -u "$DEPLOY_USER" bash -c "
  DATABASE_URL='$MIGRATE_DB_URL' psql \"\$DATABASE_URL\" -c \
    \"ALTER TABLE disputes ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';\"
" 2>/dev/null \
  || su - postgres -c "psql -d kahade_prod -c \"ALTER TABLE disputes ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';\"" \
  || log_warning "disputes.description hotfix gagal — jalankan manual"
log_success "disputes.description column ready"

# ── Seed: Admin user ──────────────────────────────────────────────────────────
log_info "Creating admin user (if not exists)..."
ADMIN_SEED_PASS="$(openssl rand -base64 18 | tr -d '/+=' | head -c 20)"

sudo -u "$DEPLOY_USER" bash -c "
  cd '$DEPLOY_DIR/backend'
  DATABASE_URL='$MIGRATE_DB_URL' node -e \"
const { PrismaClient } = require('@prisma/client');
const { hash } = require('@node-rs/bcrypt');

const prisma = new PrismaClient();
async function main() {
  const passwordHash = await hash('$ADMIN_SEED_PASS', 10);
  const user = await prisma.user.upsert({
    where: { email: 'admin@$DOMAIN' },
    update: { isAdmin: true, passwordHash, emailVerifiedAt: new Date() },
    create: {
      username: 'admin',
      email: 'admin@$DOMAIN',
      passwordHash,
      isAdmin: true,
      emailVerifiedAt: new Date(),
    },
  });
  const existingWallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
  if (!existingWallet) {
    await prisma.wallet.create({ data: { userId: user.id, currency: 'IDR' } });
  }
  console.log('Admin user ready: admin@$DOMAIN');
  await prisma.\\\$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
\"
" && log_success "Admin user ready: admin@${DOMAIN}" \
  || log_warning "Admin seed failed — buat manual via prisma studio atau scripts/"

ADMIN_SEED_PASS_FINAL="$ADMIN_SEED_PASS"

# ── Frontend: 3 separate builds ───────────────────────────────────────────────
# BUG FIX: Script asli hanya build SATU frontend dengan VITE_APP_MODE=app
# dan serve dari kahade.id → kahade.id menampilkan dashboard app, BUKAN landing.
# Fix: build 3 kali dengan mode berbeda → 3 direktori dist terpisah.
#
# Strategy: install node_modules sekali, build 3 kali dengan env berbeda.
# Masing-masing build output di-copy ke direktori terpisah.
# ──────────────────────────────────────────────────────────────────────────────
log_info "Installing frontend dependencies (sekali untuk 3 builds)..."
cd "$DEPLOY_DIR/frontend"
sudo -u "$DEPLOY_USER" rm -rf node_modules
sudo -u "$DEPLOY_USER" pnpm config set store-dir "/home/$DEPLOY_USER/.local/share/pnpm/store" 2>/dev/null || true
sudo -u "$DEPLOY_USER" pnpm install 2>&1 | tail -5 || die "frontend pnpm install failed"

# Fungsi helper untuk build satu frontend variant
_build_frontend_variant() {
    local MODE="$1"         # landing | app | admin
    local OUT_DIR="$2"      # direktori tujuan dist hasil build
    local APP_NAME_VAR="$3" # "Kahade" atau "Kahade Admin"
    local VITE_BUILD_TIME
    VITE_BUILD_TIME="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

    log_info "Building frontend variant: ${MODE} → ${OUT_DIR}..."

    # Tulis .env.production.local (override .env.production, tidak di-commit ke git)
    # Variabel VITE_APP_DOMAIN dan VITE_ADMIN_DOMAIN pakai SUBDOMAIN, bukan path.
    # BUG FIX: Script asli menulis:
    #   VITE_APP_DOMAIN=https://${DOMAIN}/dashboard   ← SALAH (path-based)
    #   VITE_ADMIN_DOMAIN=https://${DOMAIN}/admin     ← SALAH (path-based)
    # Seharusnya subdomain:
    #   VITE_APP_DOMAIN=https://app.kahade.id         ← BENAR
    #   VITE_ADMIN_DOMAIN=https://admin.kahade.id     ← BENAR
    cat > "$DEPLOY_DIR/frontend/.env.production.local" << ENVBUILD
VITE_APP_ENV=production
VITE_APP_MODE=${MODE}
VITE_APP_NAME=${APP_NAME_VAR}
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
ENVBUILD

    # Build
    sudo -u "$DEPLOY_USER" bash -c "cd '$DEPLOY_DIR/frontend' && pnpm run build" 2>&1 | tail -10 \
        || die "Frontend build gagal untuk mode: ${MODE}"

    [ ! -d "$DEPLOY_DIR/frontend/dist" ] && die "dist/ missing setelah build mode: ${MODE}"

    # Pindahkan dist ke direktori tujuan
    rm -rf "$OUT_DIR/dist"
    mkdir -p "$OUT_DIR"
    mv "$DEPLOY_DIR/frontend/dist" "$OUT_DIR/dist"
    chmod -R 755 "$OUT_DIR/dist"
    chown -R "$DEPLOY_USER:$DEPLOY_USER" "$OUT_DIR/dist"

    log_success "Frontend ${MODE} built → ${OUT_DIR}/dist"
}

# Build landing (kahade.id)
_build_frontend_variant "landing" "$DEPLOY_DIR/frontend" "Kahade"

# Build app (app.kahade.id)
_build_frontend_variant "app" "$DEPLOY_DIR/frontend-app" "Kahade"

# Build admin (admin.kahade.id)
_build_frontend_variant "admin" "$DEPLOY_DIR/frontend-admin" "Kahade Admin"

# Cleanup env override
rm -f "$DEPLOY_DIR/frontend/.env.production.local"
log_success "Semua 3 frontend variant berhasil di-build"

# ── Nginx: konfigurasi untuk 4 domain (landing, app, admin, api) ──────────────
# BUG FIX: Script asli hanya generate nginx config untuk kahade.id dan api.kahade.id.
# app.kahade.id dan admin.kahade.id tidak memiliki server block → HTTP 444 (no response).
# Fix: generate 4 server blocks terpisah.
#
# SSL: Cloudflare Flexible mode
#   - Cloudflare ↔ user: HTTPS (handle oleh Cloudflare)
#   - Cloudflare ↔ nginx origin: HTTP (nginx hanya listen port 80)
#   - Tidak perlu certbot/SSL certificate di server
#   - Pastikan Cloudflare DNS: semua record → Proxied (🟠)
#   - Pastikan Cloudflare SSL/TLS → Overview → Mode: "Flexible"
# ──────────────────────────────────────────────────────────────────────────────
log_info "Configuring Nginx untuk 4 subdomain..."

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
               application/json application/javascript image/svg+xml;

    limit_req_zone  $binary_remote_addr zone=api_limit:10m  rate=100r/m;
    limit_req_zone  $binary_remote_addr zone=auth_limit:10m rate=20r/m;
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

rm -f /etc/nginx/conf.d/*.conf
rm -f /etc/nginx/sites-enabled/*

# ────────────────────────────────────────────────────
# 1. kahade.id — Landing Page
# ────────────────────────────────────────────────────
cat > /etc/nginx/conf.d/landing.conf << LANDINGCONF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN};

    # Cloudflare real IP passthrough
    set_real_ip_from 103.21.244.0/22;
    set_real_ip_from 103.22.200.0/22;
    set_real_ip_from 103.31.4.0/22;
    set_real_ip_from 104.16.0.0/13;
    set_real_ip_from 104.24.0.0/14;
    set_real_ip_from 108.162.192.0/18;
    set_real_ip_from 131.0.72.0/22;
    set_real_ip_from 141.101.64.0/18;
    set_real_ip_from 162.158.0.0/15;
    set_real_ip_from 172.64.0.0/13;
    set_real_ip_from 173.245.48.0/20;
    set_real_ip_from 188.114.96.0/20;
    set_real_ip_from 190.93.240.0/20;
    set_real_ip_from 197.234.240.0/22;
    set_real_ip_from 198.41.128.0/17;
    real_ip_header CF-Connecting-IP;

    # Redirect www → non-www
    if (\$host = www.${DOMAIN}) {
        return 301 http://${DOMAIN}\$request_uri;
    }

    root ${DEPLOY_DIR}/frontend/dist;
    index index.html;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    access_log /var/log/nginx/landing-access.log main;
    error_log  /var/log/nginx/landing-error.log warn;

    charset utf-8;

    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    location = /service-worker.js {
        expires off;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # SPA routing — landing page TIDAK redirect ke login
    # Semua route jatuh ke index.html, biarkan React Router yang handle
    location / {
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    location ~ /\. { deny all; access_log off; }

    error_page 404 /index.html;
}
LANDINGCONF

# ────────────────────────────────────────────────────
# 2. app.kahade.id — User Dashboard
# ────────────────────────────────────────────────────
cat > /etc/nginx/conf.d/app.conf << APPCONF
server {
    listen 80;
    listen [::]:80;
    server_name ${APP_DOMAIN};

    set_real_ip_from 103.21.244.0/22;
    set_real_ip_from 103.22.200.0/22;
    set_real_ip_from 103.31.4.0/22;
    set_real_ip_from 104.16.0.0/13;
    set_real_ip_from 104.24.0.0/14;
    set_real_ip_from 108.162.192.0/18;
    set_real_ip_from 131.0.72.0/22;
    set_real_ip_from 141.101.64.0/18;
    set_real_ip_from 162.158.0.0/15;
    set_real_ip_from 172.64.0.0/13;
    set_real_ip_from 173.245.48.0/20;
    set_real_ip_from 188.114.96.0/20;
    set_real_ip_from 190.93.240.0/20;
    set_real_ip_from 197.234.240.0/22;
    set_real_ip_from 198.41.128.0/17;
    real_ip_header CF-Connecting-IP;

    root ${DEPLOY_DIR}/frontend-app/dist;
    index index.html;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    access_log /var/log/nginx/app-access.log main;
    error_log  /var/log/nginx/app-error.log warn;

    charset utf-8;

    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    location = /service-worker.js {
        expires off;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # SPA routing — user yang belum login di-redirect ke /login oleh ProtectedRoute (React)
    # bukan oleh nginx. Nginx cukup return index.html untuk semua path.
    location / {
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    location ~ /\. { deny all; access_log off; }

    error_page 404 /index.html;
}
APPCONF

# ────────────────────────────────────────────────────
# 3. admin.kahade.id — Admin Panel
# ────────────────────────────────────────────────────
cat > /etc/nginx/conf.d/admin.conf << ADMINCONF
server {
    listen 80;
    listen [::]:80;
    server_name ${ADMIN_DOMAIN};

    set_real_ip_from 103.21.244.0/22;
    set_real_ip_from 103.22.200.0/22;
    set_real_ip_from 103.31.4.0/22;
    set_real_ip_from 104.16.0.0/13;
    set_real_ip_from 104.24.0.0/14;
    set_real_ip_from 108.162.192.0/18;
    set_real_ip_from 131.0.72.0/22;
    set_real_ip_from 141.101.64.0/18;
    set_real_ip_from 162.158.0.0/15;
    set_real_ip_from 172.64.0.0/13;
    set_real_ip_from 173.245.48.0/20;
    set_real_ip_from 188.114.96.0/20;
    set_real_ip_from 190.93.240.0/20;
    set_real_ip_from 197.234.240.0/22;
    set_real_ip_from 198.41.128.0/17;
    real_ip_header CF-Connecting-IP;

    root ${DEPLOY_DIR}/frontend-admin/dist;
    index index.html;

    # Admin panel: header keamanan lebih strict
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    access_log /var/log/nginx/admin-access.log main;
    error_log  /var/log/nginx/admin-error.log warn;

    charset utf-8;

    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    location = /service-worker.js {
        expires off;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    location / {
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    location ~ /\. { deny all; access_log off; }

    error_page 404 /index.html;
}
ADMINCONF

# ────────────────────────────────────────────────────
# 4. api.kahade.id — Backend API
# ────────────────────────────────────────────────────
cat > /etc/nginx/conf.d/api.conf << APICONF
server {
    listen 80;
    listen [::]:80;
    server_name ${API_DOMAIN};

    set_real_ip_from 103.21.244.0/22;
    set_real_ip_from 103.22.200.0/22;
    set_real_ip_from 103.31.4.0/22;
    set_real_ip_from 104.16.0.0/13;
    set_real_ip_from 104.24.0.0/14;
    set_real_ip_from 108.162.192.0/18;
    set_real_ip_from 131.0.72.0/22;
    set_real_ip_from 141.101.64.0/18;
    set_real_ip_from 162.158.0.0/15;
    set_real_ip_from 172.64.0.0/13;
    set_real_ip_from 173.245.48.0/20;
    set_real_ip_from 188.114.96.0/20;
    set_real_ip_from 190.93.240.0/20;
    set_real_ip_from 197.234.240.0/22;
    set_real_ip_from 198.41.128.0/17;
    real_ip_header CF-Connecting-IP;

    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;

    access_log /var/log/nginx/api-access.log main;
    error_log  /var/log/nginx/api-error.log warn;

    client_max_body_size 10M;

    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        limit_req_status 429;

        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_hide_header X-Powered-By;
        proxy_hide_header Server;

        proxy_connect_timeout 30s;
        proxy_send_timeout    30s;
        proxy_read_timeout    30s;
    }

    location /api/v1/auth/ {
        limit_req zone=auth_limit burst=10 nodelay;
        limit_req_status 429;

        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /api/v1/health {
        access_log off;
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
    }

    location /metrics {
        allow 127.0.0.1;
        deny all;
        proxy_pass http://api_backend;
        proxy_set_header Host \$host;
    }

    location ~ /\. { deny all; access_log off; }
}
APICONF

nginx -t || die "Nginx config test failed"
systemctl enable nginx --quiet
systemctl restart nginx
systemctl is-active --quiet nginx && log_success "Nginx running (4 domains configured)" || die "Nginx failed to start"

# Raise nginx open file limit
mkdir -p /etc/systemd/system/nginx.service.d
cat > /etc/systemd/system/nginx.service.d/override.conf << 'NGINXOVERRIDE'
[Service]
LimitNOFILE=65536
NGINXOVERRIDE
systemctl daemon-reload
systemctl restart nginx
log_success "Nginx LimitNOFILE=65536"

# ── PM2: Start backend ────────────────────────────────────────────────────────
log_info "Starting backend with PM2..."
cd "$DEPLOY_DIR/backend"

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

sudo -u "$DEPLOY_USER" pm2 delete kahade-api 2>/dev/null || true

sudo -u "$DEPLOY_USER" bash -c "
  set -a
  source '$ENV_FILE'
  set +a
  pm2 start ecosystem.config.prod.js
"
sudo -u "$DEPLOY_USER" pm2 save --force

# ── PM2 systemd service ───────────────────────────────────────────────────────
log_info "Configuring PM2 boot startup..."
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

# ── Wait for backend ──────────────────────────────────────────────────────────
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
        sudo -u "$DEPLOY_USER" pm2 logs kahade-api --lines 50 --nostream --err 2>/dev/null || true
        die "Backend startup failed — check logs: pm2 logs kahade-api"
    }
    log_warning "  ...waiting ($i/20)"
done

log_info "Testing health endpoint..."
sleep 3
if curl -fsS "http://localhost:3000/api/v1/health" > /dev/null 2>&1; then
    log_success "Health check passed"
else
    log_warning "Health endpoint belum respond — mungkin masih inisialisasi"
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
Redis URL:           ${REDIS_URL}

JWT Secret:          ${JWT_SECRET}
JWT Refresh Secret:  ${JWT_REFRESH_SECRET}
Session Secret:      ${SESSION_SECRET}
Cookie Secret:       ${COOKIE_SECRET}
CSRF Secret:         ${CSRF_SECRET}
Encryption Key:      ${ENCRYPTION_KEY}
Encryption IV:       ${ENCRYPTION_IV}
Bank Encryption Key: ${BANK_ENCRYPTION_KEY}
KYC Encryption Key:  ${KYC_ENCRYPTION_KEY}

Admin Email:         admin@${DOMAIN}
Admin Password:      ${ADMIN_SEED_PASS_FINAL:-CHANGE_ME_NOW}
  (Ganti password ini SEGERA setelah login pertama!)
========================================
SIMPAN FILE INI DI TEMPAT AMAN. Hapus dari server setelah dicatat.
CREDS
chmod 600 "$CREDS_FILE"

# ── Summary ───────────────────────────────────────────────────────────────────
echo
echo "==========================================================================="
echo "🚀 KAHADE DEPLOYED SUCCESSFULLY"
echo "==========================================================================="
echo
echo "  🌐 Landing:     https://${DOMAIN}        (via Cloudflare)"
echo "  📱 App:         https://${APP_DOMAIN}    (via Cloudflare)"
echo "  🔧 Admin:       https://${ADMIN_DOMAIN}  (via Cloudflare)"
echo "  🔌 API:         https://${API_DOMAIN}/api/v1"
echo "  ❤️  Health:      http://localhost:3000/api/v1/health"
echo
echo "  Frontend dists:"
echo "     Landing → ${DEPLOY_DIR}/frontend/dist"
echo "     App     → ${DEPLOY_DIR}/frontend-app/dist"
echo "     Admin   → ${DEPLOY_DIR}/frontend-admin/dist"
echo
echo "  📋 Status commands:"
echo "     sudo -u kahade pm2 list"
echo "     sudo -u kahade pm2 logs kahade-api --lines 50"
echo "     curl http://localhost:3000/api/v1/health"
echo "     systemctl status nginx redis-server postgresql"
echo
echo "  ⚠️  TODO sebelum go live:"
echo "     1. Edit ${ENV_FILE}"
echo "        Set: SMTP_PASS, MIDTRANS_SERVER_KEY, XENDIT_SECRET_KEY,"
echo "             KYC_API_KEY, KYC_API_SECRET"
echo "     2. sudo -u kahade pm2 restart kahade-api"
echo "     3. Cloudflare DNS: semua record → Proxied (🟠)"
echo "     4. Cloudflare SSL/TLS → Overview → Mode: Flexible"
echo "        (atau Full jika pakai cert di origin)"
echo "     5. Login ke admin panel dan ganti password admin!"
echo "        Admin: admin@${DOMAIN}"
echo "        Pass:  (lihat credentials file di bawah)"
echo
echo "  🔑 Credentials saved to: ${CREDS_FILE}"
echo "==========================================================================="
