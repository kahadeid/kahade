#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

DEPLOY_USER="kahade"
DEPLOY_DIR="/var/www/kahade"
BACKUP_DIR="/var/backups/kahade"
LOG_DIR="/var/log/kahade"
DOMAIN="kahade.id"
API_DOMAIN="api.kahade.id"

log_info "Starting Kahade deployment..."

if [ "$EUID" -ne 0 ]; then 
    log_error "Please run as root (use sudo)"
    exit 1
fi

if ! grep -q "Ubuntu 24.04" /etc/os-release; then
    log_warning "This script is designed for Ubuntu 24.04"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    [[ ! $REPLY =~ ^[Yy]$ ]] && exit 1
fi

[ ! -d "$PROJECT_ROOT/backend" ] && log_error "Backend directory not found" && exit 1
[ ! -d "$PROJECT_ROOT/frontend" ] && log_error "Frontend directory not found" && exit 1

log_info "Updating system packages..."
apt update && apt upgrade -y

apt install -y curl wget git build-essential nginx postgresql \
    postgresql-contrib redis-server certbot python3-certbot-nginx \
    ufw fail2ban htop iotop net-tools ca-certificates gnupg lsb-release

log_info "Installing Node.js 20..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi
log_success "Node.js: $(node -v)"

if ! command -v pnpm &> /dev/null; then
    npm install -g pnpm
fi
log_success "pnpm: $(pnpm -v)"

if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    pm2 install pm2-logrotate
    pm2 set pm2-logrotate:max_size 100M
    pm2 set pm2-logrotate:retain 30
fi

log_info "Configuring PostgreSQL..."
systemctl enable postgresql
systemctl start postgresql

read -p "Enter database password for user 'kahade_user': " DB_PASSWORD
echo

su - postgres -c "psql << EOF
DO \\$\\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'kahade_prod') THEN
        CREATE DATABASE kahade_prod;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'kahade_user') THEN
        CREATE USER kahade_user WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
    ELSE
        ALTER USER kahade_user WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
    END IF;
END
\\$\\$;
GRANT ALL PRIVILEGES ON DATABASE kahade_prod TO kahade_user;
ALTER DATABASE kahade_prod OWNER TO kahade_user;
\\\\c kahade_prod
GRANT ALL ON SCHEMA public TO kahade_user;
EOF"

log_success "PostgreSQL configured"

log_info "Configuring Redis..."
REDIS_PASSWORD=$(openssl rand -hex 32)

if [ -f /etc/redis/redis.conf ]; then
    cp /etc/redis/redis.conf /etc/redis/redis.conf.backup.$(date +%Y%m%d_%H%M%S)
fi

if grep -q "^requirepass" /etc/redis/redis.conf; then
    sed -i "s|^requirepass .*|requirepass $REDIS_PASSWORD|" /etc/redis/redis.conf
elif grep -q "^# requirepass" /etc/redis/redis.conf; then
    sed -i "s|^# requirepass .*|requirepass $REDIS_PASSWORD|" /etc/redis/redis.conf
else
    echo "requirepass $REDIS_PASSWORD" >> /etc/redis/redis.conf
fi

if grep -q "^maxmemory" /etc/redis/redis.conf; then
    sed -i "s|^maxmemory .*|maxmemory 256mb|" /etc/redis/redis.conf
else
    echo "maxmemory 256mb" >> /etc/redis/redis.conf
fi

if grep -q "^maxmemory-policy" /etc/redis/redis.conf; then
    sed -i "s|^maxmemory-policy .*|maxmemory-policy allkeys-lru|" /etc/redis/redis.conf
else
    echo "maxmemory-policy allkeys-lru" >> /etc/redis/redis.conf
fi

systemctl restart redis-server
sleep 2
systemctl is-active --quiet redis-server && log_success "Redis running" || (log_error "Redis failed" && exit 1)

if ! id "$DEPLOY_USER" &>/dev/null; then
    useradd -m -s /bin/bash $DEPLOY_USER
    usermod -aG sudo $DEPLOY_USER
fi

mkdir -p $DEPLOY_DIR/{backend,frontend} $BACKUP_DIR $LOG_DIR /var/www/kahade/uploads /var/www/certbot
chown -R $DEPLOY_USER:$DEPLOY_USER $DEPLOY_DIR $LOG_DIR /var/www/kahade/uploads

ufw --force enable
ufw default deny incoming && ufw default allow outgoing
ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp
ufw allow from 127.0.0.1 to any port 3000
ufw allow from 127.0.0.1 to any port 5432
ufw allow from 127.0.0.1 to any port 6379

log_info "Deploying files..."
cp -r "$PROJECT_ROOT/backend/"* "$DEPLOY_DIR/backend/"
cp -r "$PROJECT_ROOT/frontend/"* "$DEPLOY_DIR/frontend/"
chown -R $DEPLOY_USER:$DEPLOY_USER $DEPLOY_DIR

log_info "Setting up backend..."

JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 16)
COOKIE_SECRET=$(openssl rand -hex 16)
CSRF_SECRET=$(openssl rand -hex 16)
ENCRYPTION_KEY=$(openssl rand -hex 16)

cat > $DEPLOY_DIR/backend/.env.production << EOF
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://kahade_user:${DB_PASSWORD}@localhost:5432/kahade_prod?schema=public
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASSWORD}
JWT_SECRET=${JWT_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
SESSION_SECRET=${SESSION_SECRET}
COOKIE_SECRET=${COOKIE_SECRET}
CSRF_SECRET=${CSRF_SECRET}
ENCRYPTION_KEY=${ENCRYPTION_KEY}
CORS_ORIGIN=https://${DOMAIN},https://www.${DOMAIN}
APP_URL=https://${DOMAIN}
API_URL=https://${API_DOMAIN}
EOF

chmod 600 $DEPLOY_DIR/backend/.env.production
chown $DEPLOY_USER:$DEPLOY_USER $DEPLOY_DIR/backend/.env.production

cd $DEPLOY_DIR/backend

log_info "Cleaning old build artifacts..."
sudo -u $DEPLOY_USER rm -rf dist .pnpm-store

log_info "Installing dependencies..."
sudo -u $DEPLOY_USER NODE_ENV=production pnpm install --prod=false --frozen-lockfile=false
[ $? -ne 0 ] && log_error "Install failed" && exit 1
log_success "Dependencies installed"

log_info "Generating Prisma Client..."
sudo -u $DEPLOY_USER bash -c "export \$(grep -v '^#' .env.production | xargs) && npx prisma generate"
[ $? -ne 0 ] && log_error "Prisma generate failed" && exit 1
log_success "Prisma client generated"

log_info "Building backend (Swagger disabled)..."

if [ ! -f "nest-cli.production.json" ]; then
    cat > nest-cli.production.json << 'NESTCLI'
{
  "\$schema": "https://json.schemastore.org/nest-cli",
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
fi

[ -f "nest-cli.json" ] && cp nest-cli.json nest-cli.json.dev.backup
cp nest-cli.production.json nest-cli.json

sudo -u $DEPLOY_USER NODE_ENV=production npx nest build
BUILD_EXIT=$?

[ -f "nest-cli.json.dev.backup" ] && mv nest-cli.json.dev.backup nest-cli.json

[ $BUILD_EXIT -ne 0 ] && log_error "Build failed" && exit 1
[ ! -f "dist/main.js" ] && log_error "Build output missing" && exit 1

log_success "Backend built"

log_info "Verifying node_modules exists..."
if [ ! -d "node_modules" ]; then
    log_error "node_modules missing after build!"
    exit 1
fi
log_success "node_modules verified"

log_info "Running migrations..."
sudo -u $DEPLOY_USER bash -c "export \$(grep -v '^#' .env.production | xargs) && npx prisma migrate deploy"
[ $? -eq 0 ] && log_success "Migrations complete" || log_warning "Migrations may have failed"

log_info "Building frontend..."
cd $DEPLOY_DIR/frontend

cat > .env.production << EOF
VITE_APP_ENV=production
VITE_API_URL=https://${API_DOMAIN}/api
VITE_WS_URL=wss://${API_DOMAIN}
EOF

sudo -u $DEPLOY_USER pnpm install --frozen-lockfile=false
sudo -u $DEPLOY_USER pnpm run build
log_success "Frontend built"

log_info "Configuring Nginx..."

# Create nginx.conf for VPS
cat > /etc/nginx/nginx.conf << 'NGINXCONF'
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
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    'rt=$request_time uct="$upstream_connect_time" '
                    'uht="$upstream_header_time" urt="$upstream_response_time"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 10M;
    server_tokens off;

    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;
    limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/m;
    limit_req_status 429;
    limit_conn_zone $binary_remote_addr zone=addr:10m;
    limit_conn addr 10;

    # Upstream backend (VPS uses localhost)
    upstream api_backend {
        server localhost:3000 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
NGINXCONF

# Copy site configs from repo
[ -d "$PROJECT_ROOT/nginx/conf.d" ] && cp "$PROJECT_ROOT/nginx/conf.d/"*.conf /etc/nginx/conf.d/

# Fix frontend root path in config
sed -i 's|root /var/www/frontend;|root /var/www/kahade/frontend/dist;|g' /etc/nginx/conf.d/frontend.conf

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Test and reload
nginx -t && systemctl enable nginx && systemctl reload nginx
log_success "Nginx configured"

log_info "Setting up PM2..."
cd $DEPLOY_DIR/backend

# Stop any existing PM2 processes
sudo -u $DEPLOY_USER pm2 delete kahade-api 2>/dev/null || true
sudo -u $DEPLOY_USER pm2 delete all 2>/dev/null || true

if [ -f "ecosystem.config.prod.js" ]; then
    sudo -u $DEPLOY_USER pm2 start ecosystem.config.prod.js
else
    log_warning "ecosystem.config.prod.js not found, starting manually"
    sudo -u $DEPLOY_USER pm2 start dist/main.js --name kahade-api --env production
fi

sudo -u $DEPLOY_USER pm2 save
pm2 startup systemd -u $DEPLOY_USER --hp /home/$DEPLOY_USER

log_success "PM2 configured"

# Verify PM2 is running
sleep 3
if sudo -u $DEPLOY_USER pm2 list | grep -q "online"; then
    log_success "Backend is running"
else
    log_error "Backend failed to start! Check logs: pm2 logs"
fi

cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local 2>/dev/null || true

cat > /etc/fail2ban/filter.d/kahade.conf << 'EOF'
[Definition]
failregex = ^.*Failed login attempt from <HOST>.*$
EOF

cat >> /etc/fail2ban/jail.local << 'EOF'

[kahade]
enabled = true
port = 443
filter = kahade
logpath = /var/log/kahade/app.log
maxretry = 5
bantime = 3600
EOF

systemctl enable fail2ban && systemctl restart fail2ban

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

log_success "Deployment completed!"
echo
echo "==========================================================================="
echo "Frontend: http://$DOMAIN (HTTPS if SSL configured)"
echo "API: http://$API_DOMAIN (HTTPS if SSL configured)"
echo ""
echo "To setup SSL (if not done yet):"
echo "  sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN -d $API_DOMAIN"
echo ""
echo "Check status:"
echo "  sudo -u kahade pm2 list"
echo "  sudo -u kahade pm2 logs kahade-api"
echo "  curl http://localhost:3000/health"
echo "==========================================================================="

CREDS_FILE="$BACKUP_DIR/credentials_$(date +%Y%m%d_%H%M%S).txt"
cat > $CREDS_FILE << EOF
Kahade Deployment - $(date)

Database Password: $DB_PASSWORD
Redis Password: $REDIS_PASSWORD
JWT Secret: $JWT_SECRET
EOF

chmod 600 $CREDS_FILE
log_info "Credentials saved to: $CREDS_FILE"
