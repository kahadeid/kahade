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
\c kahade_prod
GRANT ALL ON SCHEMA public TO kahade_user;
EOF"

log_success "PostgreSQL configured"

# ============================================================================
# REDIS SETUP (FIXED VERSION - Using | as delimiter)
# ============================================================================

log_info "Configuring Redis..."

# Generate Redis password
REDIS_PASSWORD=$(openssl rand -base64 32)

# Backup original config
if [ -f /etc/redis/redis.conf ]; then
    cp /etc/redis/redis.conf /etc/redis/redis.conf.backup.$(date +%Y%m%d_%H%M%S)
    log_info "Redis config backed up"
fi

# Modify existing config instead of replacing entire file
# FIXED: Using | as delimiter to avoid conflicts with / in base64 passwords
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

# Wait for Redis to start
sleep 2

# Verify Redis is running
if systemctl is-active --quiet redis-server; then
    log_success "Redis configured and running"
else
    log_error "Redis failed to start. Check logs: sudo journalctl -xeu redis-server"
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

# Set permissions
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
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow from 127.0.0.1 to any port 3000  # Backend (localhost only)
ufw allow from 127.0.0.1 to any port 5432  # PostgreSQL (localhost only)
ufw allow from 127.0.0.1 to any port 6379  # Redis (localhost only)

log_success "Firewall configured"

# ============================================================================
# SSL CERTIFICATE
# ============================================================================

log_info "Setting up SSL certificates..."

# Check if certificates exist
if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    log_warning "SSL certificates not found. Please run certbot manually:"
    echo "  certbot --nginx -d $DOMAIN -d www.$DOMAIN -d $API_DOMAIN"
    log_warning "Or continue without SSL (not recommended for production)"
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

# Copy files using absolute paths from project root
log_info "Copying backend from: $PROJECT_ROOT/backend/"
cp -r "$PROJECT_ROOT/backend/"* "$DEPLOY_DIR/backend/"

log_info "Copying frontend from: $PROJECT_ROOT/frontend/"
cp -r "$PROJECT_ROOT/frontend/"* "$DEPLOY_DIR/frontend/"

# Set ownership
chown -R $DEPLOY_USER:$DEPLOY_USER $DEPLOY_DIR

log_success "Application files deployed"

# ============================================================================
# BACKEND SETUP - ENHANCED FOR PRODUCTION
# ============================================================================

log_info "Setting up backend..."

# Create .env file
cat > $DEPLOY_DIR/backend/.env.production << EOF
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://kahade_user:$DB_PASSWORD@localhost:5432/kahade_prod
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

# Cleanup before fresh install
log_info "Cleaning up old dependencies..."
sudo -u $DEPLOY_USER rm -rf node_modules
sudo -u $DEPLOY_USER rm -rf dist
sudo -u $DEPLOY_USER rm -rf .pnpm-store

# Clear pnpm cache
log_info "Clearing pnpm cache..."
sudo -u $DEPLOY_USER pnpm store prune || true

# Install dependencies with production optimizations
log_info "Installing backend dependencies..."
export NODE_ENV=production
sudo -u $DEPLOY_USER NODE_ENV=production pnpm install --prod=false --frozen-lockfile=false --force

if [ $? -ne 0 ]; then
    log_error "Failed to install dependencies"
    log_error "Try running: cd $DEPLOY_DIR/backend && pnpm install --force"
    exit 1
fi

# Generate Prisma Client
log_info "Generating Prisma Client..."
sudo -u $DEPLOY_USER npx prisma generate --schema=./prisma/schema.prisma

if [ $? -ne 0 ]; then
    log_error "Failed to generate Prisma client"
    log_error "Check if prisma/schema.prisma exists and is valid"
    exit 1
fi

# Verify Prisma client was generated (pnpm-compatible check)
log_info "Verifying Prisma client installation..."
if sudo -u $DEPLOY_USER node -e "require('@prisma/client')" 2>/dev/null; then
    log_success "Prisma client generated and importable"
elif [ -d "node_modules/@prisma/client" ] || [ -n "$(find node_modules -type d -name '@prisma' 2>/dev/null)" ]; then
    log_success "Prisma client found in node_modules"
else
    log_error "Prisma client not found or cannot be imported"
    log_error "Tried to import @prisma/client but failed"
    log_error "Check: ls -la node_modules/@prisma/ or find node_modules -name '@prisma'"
    exit 1
fi

# Build backend with production config
log_info "Building backend for production..."

# Use production tsconfig if exists, otherwise regular build
if [ -f "tsconfig.production.json" ]; then
    log_info "Using tsconfig.production.json for build"
    sudo -u $DEPLOY_USER NODE_ENV=production npx nest build -p tsconfig.production.json
else
    log_info "Using default tsconfig.build.json"
    sudo -u $DEPLOY_USER NODE_ENV=production npx nest build
fi

BUILD_EXIT_CODE=$?

if [ $BUILD_EXIT_CODE -ne 0 ]; then
    log_error "Backend build failed with exit code: $BUILD_EXIT_CODE"
    log_error ""
    log_error "Troubleshooting steps:"
    log_error "1. Check TypeScript errors: cd $DEPLOY_DIR/backend && npx tsc --noEmit"
    log_error "2. Verify Prisma schema: npx prisma validate"
    log_error "3. Check for missing dependencies: pnpm install"
    log_error "4. Review build logs above for specific errors"
    exit 1
fi

# Verify build output
if [ ! -d "dist" ] || [ ! -f "dist/main.js" ]; then
    log_error "Build completed but dist/ directory is missing or incomplete"
    exit 1
fi

log_success "Backend build completed successfully"

# Run migrations
log_info "Running database migrations..."
sudo -u $DEPLOY_USER NODE_ENV=production npx prisma migrate deploy

if [ $? -ne 0 ]; then
    log_warning "Migrations may have failed - check database connectivity"
else
    log_success "Database migrations completed"
fi

log_success "Backend setup complete"

# ============================================================================
# FRONTEND BUILD
# ============================================================================

log_info "Building frontend..."

cd $DEPLOY_DIR/frontend

# Create production env
cat > .env.production << EOF
VITE_APP_ENV=production
VITE_API_URL=https://$API_DOMAIN/api
VITE_WS_URL=wss://$API_DOMAIN
EOF

# Install and build
sudo -u $DEPLOY_USER pnpm install --frozen-lockfile=false
sudo -u $DEPLOY_USER pnpm run build

log_success "Frontend build complete"

# ============================================================================
# NGINX CONFIGURATION
# ============================================================================

log_info "Configuring Nginx..."

# Copy nginx configs using absolute paths
if [ -f "$PROJECT_ROOT/nginx/nginx.conf" ]; then
    cp "$PROJECT_ROOT/nginx/nginx.conf" /etc/nginx/nginx.conf
fi

if [ -d "$PROJECT_ROOT/nginx/conf.d" ]; then
    cp "$PROJECT_ROOT/nginx/conf.d/"*.conf /etc/nginx/conf.d/ 2>/dev/null || log_warning "No nginx conf.d files found"
fi

# Test nginx configuration
nginx -t

# Enable and restart nginx
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
    log_warning "ecosystem.config.prod.js not found, skipping PM2 setup"
fi

# ============================================================================
# MONITORING SETUP
# ============================================================================

log_info "Setting up monitoring..."

# Setup fail2ban
cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Add custom filters for Kahade
cat > /etc/fail2ban/filter.d/kahade.conf << EOF
[Definition]
failregex = ^.*Failed login attempt from <HOST>.*$
            ^.*Too many requests from <HOST>.*$
ignoreregex =
EOF

# Add jail for Kahade
cat >> /etc/fail2ban/jail.local << EOF

[kahade]
enabled = true
port = 443
filter = kahade
logpath = /var/log/kahade/app.log
maxretry = 5
bantime = 3600
findtime = 600
EOF

systemctl enable fail2ban
systemctl restart fail2ban

log_success "Monitoring configured"

# ============================================================================
# BACKUP SETUP
# ============================================================================

log_info "Setting up automated backups..."

# Create backup script
cat > /usr/local/bin/kahade-backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/kahade"
DATE=$(date +%Y%m%d_%H%M%S)

# Database backup
sudo -u postgres pg_dump kahade_prod | gzip > "$BACKUP_DIR/db_$DATE.sql.gz"

# Application backup
tar -czf "$BACKUP_DIR/app_$DATE.tar.gz" -C /var/www/kahade .

# Remove backups older than 30 days
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /usr/local/bin/kahade-backup.sh

# Add cron job
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/kahade-backup.sh >> /var/log/kahade/backup.log 2>&1") | crontab -

log_success "Automated backups configured"

# ============================================================================
# FINAL CHECKS
# ============================================================================

log_info "Performing final checks..."

# Check if services are running
systemctl status postgresql --no-pager || log_warning "PostgreSQL not running"
systemctl status redis-server --no-pager || log_warning "Redis not running"
systemctl status nginx --no-pager || log_warning "Nginx not running"
pm2 list || log_warning "PM2 not running"

# ============================================================================
# DEPLOYMENT SUMMARY
# ============================================================================

log_success "Deployment completed!"
echo
echo "============================================================================"
echo "DEPLOYMENT SUMMARY"
echo "============================================================================"
echo "Frontend URL: https://$DOMAIN"
echo "API URL: https://$API_DOMAIN"
echo "Deployment Directory: $DEPLOY_DIR"
echo "Log Directory: $LOG_DIR"
echo "Backup Directory: $BACKUP_DIR"
echo
echo "Database:"
echo "  Name: kahade_prod"
echo "  User: kahade_user"
echo "  Password: $DB_PASSWORD"
echo
echo "Redis Password: $REDIS_PASSWORD"
echo
echo "IMPORTANT: Save these credentials securely!"
echo
echo "Next Steps:"
echo "1. Configure SSL certificates: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN -d $API_DOMAIN"
echo "2. Update .env files with production API keys (payment, KYC, email, SMS)"
echo "3. Test all endpoints"
echo "4. Monitor logs: pm2 logs"
echo "5. Set up monitoring dashboard (Grafana/Prometheus)"
echo "============================================================================"

# Save credentials to a secure file
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
log_warning "Please backup this file and delete it from the server!"
