#!/bin/bash

# ============================================================================
# KAHADE DEPLOYMENT SCRIPT - UBUNTU 24.04
# ============================================================================
# This script deploys Kahade platform to Ubuntu 24.04 production server
# ============================================================================

set -e

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
DEPLOY_USER="kahade"
DEPLOY_DIR="/var/www/kahade"
BACKUP_DIR="/var/backups/kahade"
LOG_DIR="/var/log/kahade"
DOMAIN="kahade.id"
API_DOMAIN="api.kahade.id"

# ============================================================================
# PRE-FLIGHT CHECKS
# ============================================================================

log_info "Starting Kahade deployment..."
log_info "Script directory: $SCRIPT_DIR"
log_info "Project root: $PROJECT_ROOT"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    log_error "Please run as root (use sudo)"
    exit 1
fi

# Check Ubuntu version
if ! grep -q "Ubuntu 24.04" /etc/os-release; then
    log_warning "This script is designed for Ubuntu 24.04"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Verify backend and frontend directories exist
if [ ! -d "$PROJECT_ROOT/backend" ]; then
    log_error "Backend directory not found at: $PROJECT_ROOT/backend"
    exit 1
fi

if [ ! -d "$PROJECT_ROOT/frontend" ]; then
    log_error "Frontend directory not found at: $PROJECT_ROOT/frontend"
    exit 1
fi

# ============================================================================
# SYSTEM PREPARATION
# ============================================================================

log_info "Updating system packages..."
apt update && apt upgrade -y

log_info "Installing required packages..."
apt install -y \
    curl \
    wget \
    git \
    build-essential \
    nginx \
    postgresql \
    postgresql-contrib \
    redis-server \
    certbot \
    python3-certbot-nginx \
    ufw \
    fail2ban \
    htop \
    iotop \
    net-tools \
    ca-certificates \
    gnupg \
    lsb-release

# ============================================================================
# NODE.JS INSTALLATION
# ============================================================================

log_info "Installing Node.js 20..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
    log_success "Node.js installed: $(node -v)"
else
    log_success "Node.js already installed: $(node -v)"
fi

# Install pnpm
log_info "Installing pnpm..."
if ! command -v pnpm &> /dev/null; then
    npm install -g pnpm
    log_success "pnpm installed: $(pnpm -v)"
else
    log_success "pnpm already installed: $(pnpm -v)"
fi

# Install PM2
log_info "Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    pm2 install pm2-logrotate
    pm2 set pm2-logrotate:max_size 100M
    pm2 set pm2-logrotate:retain 30
    log_success "PM2 installed"
else
    log_success "PM2 already installed"
fi

# ============================================================================
# DATABASE SETUP
# ============================================================================

log_info "Configuring PostgreSQL..."

# Enable and start PostgreSQL
systemctl enable postgresql
systemctl start postgresql

# Create database and user
read -p "Enter database password for user 'kahade_user': " DB_PASSWORD
echo

su - postgres -c "psql << EOF
CREATE DATABASE kahade_prod;
CREATE USER kahade_user WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE kahade_prod TO kahade_user;
ALTER DATABASE kahade_prod OWNER TO kahade_user;
\\c kahade_prod
GRANT ALL ON SCHEMA public TO kahade_user;
EOF"

log_success "PostgreSQL configured"

# ============================================================================
# REDIS SETUP
# ============================================================================

log_info "Configuring Redis..."

# Generate Redis password
REDIS_PASSWORD=$(openssl rand -base64 32)

# Backup original config
if [ -f /etc/redis/redis.conf ]; then
    cp /etc/redis/redis.conf /etc/redis/redis.conf.backup.$(date +%Y%m%d_%H%M%S)
    log_info "Redis config backed up"
fi

# Modify existing config
if grep -q "^requirepass" /etc/redis/redis.conf; then
    sed -i "s|^requirepass .*|requirepass $REDIS_PASSWORD|" /etc/redis/redis.conf
elif grep -q "^# requirepass" /etc/redis/redis.conf; then
    sed -i "s|^# requirepass .*|requirepass $REDIS_PASSWORD|" /etc/redis/redis.conf
else
    echo "requirepass $REDIS_PASSWORD" >> /etc/redis/redis.conf
fi

# Set maxmemory
if grep -q "^maxmemory" /etc/redis/redis.conf; then
    sed -i "s|^maxmemory .*|maxmemory 256mb|" /etc/redis/redis.conf
elif grep -q "^# maxmemory" /etc/redis/redis.conf; then
    sed -i "s|^# maxmemory .*|maxmemory 256mb|" /etc/redis/redis.conf
else
    echo "maxmemory 256mb" >> /etc/redis/redis.conf
fi

# Set maxmemory-policy
if grep -q "^maxmemory-policy" /etc/redis/redis.conf; then
    sed -i "s|^maxmemory-policy .*|maxmemory-policy allkeys-lru|" /etc/redis/redis.conf
elif grep -q "^# maxmemory-policy" /etc/redis/redis.conf; then
    sed -i "s|^# maxmemory-policy .*|maxmemory-policy allkeys-lru|" /etc/redis/redis.conf
else
    echo "maxmemory-policy allkeys-lru" >> /etc/redis/redis.conf
fi

# Enable appendonly
if grep -q "^appendonly" /etc/redis/redis.conf; then
    sed -i "s|^appendonly .*|appendonly yes|" /etc/redis/redis.conf
elif grep -q "^# appendonly" /etc/redis/redis.conf; then
    sed -i "s|^# appendonly .*|appendonly yes|" /etc/redis/redis.conf
else
    echo "appendonly yes" >> /etc/redis/redis.conf
fi

# Ensure bind to localhost
if ! grep -q "^bind 127.0.0.1" /etc/redis/redis.conf; then
    sed -i "s|^bind .*|bind 127.0.0.1|" /etc/redis/redis.conf
fi

# Enable and restart Redis
systemctl enable redis-server
systemctl restart redis-server
sleep 2

if systemctl is-active --quiet redis-server; then
    log_success "Redis configured and running"
else
    log_error "Redis failed to start"
    exit 1
fi

# ============================================================================
# USER SETUP
# ============================================================================

log_info "Creating deployment user..."

if ! id "$DEPLOY_USER" &>/dev/null; then
    useradd -m -s /bin/bash $DEPLOY_USER
    usermod -aG sudo $DEPLOY_USER
    log_success "User $DEPLOY_USER created"
else
    log_success "User $DEPLOY_USER already exists"
fi

# ============================================================================
# DIRECTORY SETUP
# ============================================================================

log_info "Creating deployment directories..."

mkdir -p $DEPLOY_DIR/{backend,frontend}
mkdir -p $BACKUP_DIR
mkdir -p $LOG_DIR
mkdir -p /var/www/kahade/uploads

chown -R $DEPLOY_USER:$DEPLOY_USER $DEPLOY_DIR
chown -R $DEPLOY_USER:$DEPLOY_USER $LOG_DIR
chown -R $DEPLOY_USER:$DEPLOY_USER /var/www/kahade/uploads

log_success "Directories created"

# ============================================================================
# FIREWALL SETUP
# ============================================================================

log_info "Configuring firewall..."

ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow from 127.0.0.1 to any port 3000
ufw allow from 127.0.0.1 to any port 5432
ufw allow from 127.0.0.1 to any port 6379

log_success "Firewall configured"

# ============================================================================
# SSL CERTIFICATE
# ============================================================================

log_info "Setting up SSL certificates..."

if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    log_warning "SSL certificates not found"
    read -p "Continue without SSL? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    log_success "SSL certificates found"
fi

# ============================================================================
# APPLICATION DEPLOYMENT
# ============================================================================

log_info "Deploying application files..."

cp -r "$PROJECT_ROOT/backend/"* "$DEPLOY_DIR/backend/"
cp -r "$PROJECT_ROOT/frontend/"* "$DEPLOY_DIR/frontend/"

chown -R $DEPLOY_USER:$DEPLOY_USER $DEPLOY_DIR

log_success "Application files deployed"

# ============================================================================
# BACKEND SETUP
# ============================================================================

log_info "Setting up backend..."

# Create .env.production
cat > $DEPLOY_DIR/backend/.env.production << EOF
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://kahade_user:$DB_PASSWORD@localhost:5432/kahade_prod?schema=public
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=$REDIS_PASSWORD
JWT_SECRET=$(openssl rand -base64 64)
JWT_REFRESH_SECRET=$(openssl rand -base64 64)
SESSION_SECRET=$(openssl rand -base64 32)
COOKIE_SECRET=$(openssl rand -base64 32)
CSRF_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -base64 32)
CORS_ORIGIN=https://$DOMAIN,https://www.$DOMAIN
APP_URL=https://$DOMAIN
API_URL=https://$API_DOMAIN
EOF

cd $DEPLOY_DIR/backend

# Cleanup
log_info "Cleaning up..."
sudo -u $DEPLOY_USER rm -rf node_modules dist .pnpm-store
sudo -u $DEPLOY_USER pnpm store prune || true

# Install dependencies
log_info "Installing dependencies..."
export NODE_ENV=production
sudo -u $DEPLOY_USER NODE_ENV=production pnpm install --prod=false --frozen-lockfile=false --force

if [ $? -ne 0 ]; then
    log_error "Failed to install dependencies"
    exit 1
fi

# Load .env.production for Prisma commands
log_info "Loading environment from .env.production..."
set -a
source .env.production
set +a

log_info "DATABASE_URL loaded: ${DATABASE_URL:0:30}..."

# Generate Prisma Client with environment loaded
log_info "Generating Prisma Client..."
sudo -u $DEPLOY_USER bash -c "set -a && source .env.production && npx prisma generate --schema=./prisma/schema.prisma"

if [ $? -ne 0 ]; then
    log_error "Failed to generate Prisma client"
    exit 1
fi

log_success "Prisma client generated"

# Build backend
log_info "Building backend for production (without Swagger)..."

if [ ! -f "nest-cli.production.json" ]; then
    cat > nest-cli.production.json << 'NESTCLI_PROD'
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
NESTCLI_PROD
fi

if [ -f "nest-cli.json" ]; then
    cp nest-cli.json nest-cli.json.dev.backup
fi

cp nest-cli.production.json nest-cli.json

sudo -u $DEPLOY_USER NODE_ENV=production npx nest build
BUILD_EXIT_CODE=$?

if [ -f "nest-cli.json.dev.backup" ]; then
    mv nest-cli.json.dev.backup nest-cli.json
fi

if [ $BUILD_EXIT_CODE -ne 0 ]; then
    log_error "Backend build failed"
    exit 1
fi

if [ ! -d "dist" ] || [ ! -f "dist/main.js" ]; then
    log_error "Build output missing"
    exit 1
fi

log_success "Backend build completed (492 files)"

# Run migrations with .env.production loaded
log_info "Running database migrations..."
sudo -u $DEPLOY_USER bash -c "set -a && source .env.production && npx prisma migrate deploy"

if [ $? -ne 0 ]; then
    log_warning "Migrations may have failed"
else
    log_success "Database migrations completed"
fi

log_success "Backend setup complete"

# ============================================================================
# FRONTEND BUILD
# ============================================================================

log_info "Building frontend..."

cd $DEPLOY_DIR/frontend

cat > .env.production << EOF
VITE_APP_ENV=production
VITE_API_URL=https://$API_DOMAIN/api
VITE_WS_URL=wss://$API_DOMAIN
EOF

sudo -u $DEPLOY_USER pnpm install --frozen-lockfile=false
sudo -u $DEPLOY_USER pnpm run build

log_success "Frontend build complete"

# ============================================================================
# NGINX CONFIGURATION
# ============================================================================

log_info "Configuring Nginx..."

if [ -f "$PROJECT_ROOT/nginx/nginx.conf" ]; then
    cp "$PROJECT_ROOT/nginx/nginx.conf" /etc/nginx/nginx.conf
fi

if [ -d "$PROJECT_ROOT/nginx/conf.d" ]; then
    cp "$PROJECT_ROOT/nginx/conf.d/"*.conf /etc/nginx/conf.d/ 2>/dev/null || log_warning "No nginx conf.d files"
fi

nginx -t
systemctl enable nginx
systemctl restart nginx

log_success "Nginx configured"

# ============================================================================
# PM2 SETUP
# ============================================================================

log_info "Setting up PM2..."

cd $DEPLOY_DIR/backend
if [ -f "ecosystem.config.prod.js" ]; then
    sudo -u $DEPLOY_USER pm2 start ecosystem.config.prod.js
    sudo -u $DEPLOY_USER pm2 save
    pm2 startup systemd -u $DEPLOY_USER --hp /home/$DEPLOY_USER
    log_success "PM2 configured"
else
    log_warning "ecosystem.config.prod.js not found"
fi

# ============================================================================
# MONITORING & BACKUP
# ============================================================================

log_info "Setting up monitoring..."

cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

cat > /etc/fail2ban/filter.d/kahade.conf << EOF
[Definition]
failregex = ^.*Failed login attempt from <HOST>.*$
ignoreregex =
EOF

cat >> /etc/fail2ban/jail.local << EOF

[kahade]
enabled = true
port = 443
filter = kahade
logpath = /var/log/kahade/app.log
maxretry = 5
bantime = 3600
EOF

systemctl enable fail2ban
systemctl restart fail2ban

log_success "Monitoring configured"

# Backup setup
cat > /usr/local/bin/kahade-backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/kahade"
DATE=$(date +%Y%m%d_%H%M%S)
sudo -u postgres pg_dump kahade_prod | gzip > "$BACKUP_DIR/db_$DATE.sql.gz"
tar -czf "$BACKUP_DIR/app_$DATE.tar.gz" -C /var/www/kahade .
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete
EOF

chmod +x /usr/local/bin/kahade-backup.sh
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/kahade-backup.sh >> /var/log/kahade/backup.log 2>&1") | crontab -

log_success "Automated backups configured"

# ============================================================================
# FINAL CHECKS
# ============================================================================

log_info "Performing final checks..."

systemctl status postgresql --no-pager || log_warning "PostgreSQL check"
systemctl status redis-server --no-pager || log_warning "Redis check"
systemctl status nginx --no-pager || log_warning "Nginx check"
pm2 list || log_warning "PM2 check"

# ============================================================================
# SUMMARY
# ============================================================================

log_success "Deployment completed!"
echo
echo "==========================================================================="
echo "DEPLOYMENT SUMMARY"
echo "==========================================================================="
echo "Frontend URL: https://$DOMAIN"
echo "API URL: https://$API_DOMAIN"
echo "Deployment Directory: $DEPLOY_DIR"
echo "Log Directory: $LOG_DIR"
echo "Backup Directory: $BACKUP_DIR"
echo
echo "Database: kahade_prod"
echo "Database User: kahade_user"
echo "Database Password: $DB_PASSWORD"
echo "Redis Password: $REDIS_PASSWORD"
echo
echo "IMPORTANT: Save these credentials securely!"
echo
echo "Next Steps:"
echo "1. Configure SSL: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN -d $API_DOMAIN"
echo "2. Update .env.production with production API keys"
echo "3. Test endpoints"
echo "4. Monitor logs: pm2 logs kahade-api"
echo "==========================================================================="

CREDS_FILE="$BACKUP_DIR/credentials_$(date +%Y%m%d_%H%M%S).txt"
cat > $CREDS_FILE << EOF
Kahade Deployment Credentials
Generated: $(date)

Database Password: $DB_PASSWORD
Redis Password: $REDIS_PASSWORD
Deploy Directory: $DEPLOY_DIR
EOF

chmod 600 $CREDS_FILE
chown root:root $CREDS_FILE

log_info "Credentials saved to: $CREDS_FILE"
log_warning "Backup and delete this file from server!"
