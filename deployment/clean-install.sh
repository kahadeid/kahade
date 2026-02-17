#!/bin/bash

# Kahade Platform - Complete Clean Install Script
# This script nukes everything and starts fresh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

if [ "$EUID" -ne 0 ]; then 
    log_error "Please run as root (use sudo)"
    exit 1
fi

log_warning "⚠️  This will DELETE ALL existing Kahade data!"
log_warning "   - Stop all services"
log_warning "   - Remove all files"
log_warning "   - Drop database"
log_warning "   - Clear PM2 processes"
echo
read -p "Are you SURE you want to continue? (type YES): " CONFIRM

if [ "$CONFIRM" != "YES" ]; then
    log_info "Aborted."
    exit 0
fi

log_info "🧹 Cleaning up existing installation..."

# Stop services
log_info "Stopping services..."
su - kahade -c "pm2 delete all" 2>/dev/null || true
su - kahade -c "pm2 kill" 2>/dev/null || true
systemctl stop nginx 2>/dev/null || true

# Remove PM2 startup
pm2 unstartup systemd 2>/dev/null || true

# Remove files
log_info "Removing files..."
rm -rf /var/www/kahade
rm -rf /home/kahade/.pm2
rm -rf /var/log/kahade
rm -rf /var/backups/kahade
rm -rf /home/kahade/kahade

# Drop database
log_info "Dropping database..."
su - postgres -c "psql -c 'DROP DATABASE IF EXISTS kahade_prod;'" 2>/dev/null || true
su - postgres -c "psql -c 'DROP USER IF EXISTS kahade_user;'" 2>/dev/null || true

# Reset Redis
log_info "Resetting Redis..."
redis-cli FLUSHALL 2>/dev/null || true

log_success "✅ Cleanup complete!"
echo
log_info "📦 Now run the deployment:"
echo "   cd ~/kahade && sudo ./deployment/deploy.sh"
