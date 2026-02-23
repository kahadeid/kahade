#!/usr/bin/env bash
# =============================================================================
# KAHADE - SETUP NGINX CONFIGS (4 subdomain)
# =============================================================================
# Usage: sudo bash scripts/setup-nginx.sh
#
# Menulis 4 nginx config files ke /etc/nginx/conf.d/:
#   landing.conf  → kahade.id
#   app.conf      → app.kahade.id
#   admin.conf    → admin.kahade.id
#   api.conf      → api.kahade.id
#
# Aman dijalankan berulang kali (idempotent).
# =============================================================================

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; NC='\033[0m'
log()     { echo -e "${GREEN}[✔]${NC} $*"; }
error()   { echo -e "${RED}[✘]${NC} $*" >&2; exit 1; }
section() { echo -e "\n${CYAN}═══════════════════════════════════════════${NC}"; echo -e "${CYAN}  $*${NC}"; echo -e "${CYAN}═══════════════════════════════════════════${NC}"; }

[ "$EUID" -ne 0 ] && error "Jalankan sebagai root: sudo bash scripts/setup-nginx.sh"

# ── Rate limiting zones (must exist before server blocks reference them) ────────
cat > /etc/nginx/conf.d/rate-limit.conf << 'RATELIMIT'
# Kahade rate limiting zones
limit_req_zone  $binary_remote_addr  zone=api_limit:10m   rate=100r/m;
limit_req_zone  $binary_remote_addr  zone=auth_limit:10m  rate=20r/m;
RATELIMIT
log "Rate limiting zones written"

# ── Domain vars ───────────────────────────────────────────────────────────────
DOMAIN="kahade.id"
APP_DOMAIN="app.kahade.id"
ADMIN_DOMAIN="admin.kahade.id"
API_DOMAIN="api.kahade.id"
DEPLOY_DIR="/var/www/kahade"

section "⚙️  Kahade Nginx Setup"

# ── Backup semua config lama, lalu hapus yang bisa conflict ──────────────────
BACKUP_SUFFIX="$(date +%Y%m%d_%H%M%S)"
BACKUP_DIR="/etc/nginx/conf.d/backup_${BACKUP_SUFFIX}"
mkdir -p "$BACKUP_DIR"
for f in /etc/nginx/conf.d/*.conf; do
    [[ -f "$f" ]] && cp "$f" "$BACKUP_DIR/"
done
log "Semua config lama di-backup ke $BACKUP_DIR"

# Hapus config yang akan ditimpa atau yang bikin conflicting server_name
# (kahade-http.conf = dibuat deploy.sh lama, pakai server_name yang sama)
for conf in kahade-http.conf frontend.conf landing.conf app.conf admin.conf api.conf; do
    [[ -f "/etc/nginx/conf.d/$conf" ]] && rm -f "/etc/nginx/conf.d/$conf" && echo "  removed: $conf"
done
log "Config lama yang konflik sudah dihapus"

# ── Cloudflare IP block (dipakai di semua server block) ───────────────────────
CF_IPS='    set_real_ip_from 103.21.244.0/22;
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
    real_ip_header CF-Connecting-IP;'

# ────────────────────────────────────────────────────────────────────────────
# 1. landing.conf — kahade.id
# ────────────────────────────────────────────────────────────────────────────
cat > /etc/nginx/conf.d/landing.conf << CONF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN};

${CF_IPS}

    if (\$host = www.${DOMAIN}) {
        return 301 http://${DOMAIN}\$request_uri;
    }

    root ${DEPLOY_DIR}/frontend/dist;
    index index.html;
    charset utf-8;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    access_log /var/log/nginx/landing-access.log main;
    error_log  /var/log/nginx/landing-error.log warn;

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
CONF
log "landing.conf → ${DOMAIN}"

# ────────────────────────────────────────────────────────────────────────────
# 2. app.conf — app.kahade.id
# ────────────────────────────────────────────────────────────────────────────
cat > /etc/nginx/conf.d/app.conf << CONF
server {
    listen 80;
    listen [::]:80;
    server_name ${APP_DOMAIN};

${CF_IPS}

    root ${DEPLOY_DIR}/frontend-app/dist;
    index index.html;
    charset utf-8;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    access_log /var/log/nginx/app-access.log main;
    error_log  /var/log/nginx/app-error.log warn;

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
CONF
log "app.conf → ${APP_DOMAIN}"

# ────────────────────────────────────────────────────────────────────────────
# 3. admin.conf — admin.kahade.id
# ────────────────────────────────────────────────────────────────────────────
cat > /etc/nginx/conf.d/admin.conf << CONF
server {
    listen 80;
    listen [::]:80;
    server_name ${ADMIN_DOMAIN};

${CF_IPS}

    root ${DEPLOY_DIR}/frontend-admin/dist;
    index index.html;
    charset utf-8;

    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    access_log /var/log/nginx/admin-access.log main;
    error_log  /var/log/nginx/admin-error.log warn;

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
CONF
log "admin.conf → ${ADMIN_DOMAIN}"

# ────────────────────────────────────────────────────────────────────────────
# 4. api.conf — api.kahade.id
# ────────────────────────────────────────────────────────────────────────────
cat > /etc/nginx/conf.d/api.conf << CONF
server {
    listen 80;
    listen [::]:80;
    server_name ${API_DOMAIN};

${CF_IPS}

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
CONF
log "api.conf → ${API_DOMAIN}"

# ── Test & reload ─────────────────────────────────────────────────────────────
section "Test & Reload Nginx"
nginx -t || error "Nginx config test GAGAL — periksa error di atas"
nginx -s reload
log "Nginx reloaded"

section "✅ Nginx Setup Selesai"
echo
echo "  Config files:"
echo "    /etc/nginx/conf.d/landing.conf → ${DOMAIN}"
echo "    /etc/nginx/conf.d/app.conf     → ${APP_DOMAIN}"
echo "    /etc/nginx/conf.d/admin.conf   → ${ADMIN_DOMAIN}"
echo "    /etc/nginx/conf.d/api.conf     → ${API_DOMAIN}"
echo
echo "  Verify:"
echo "    nginx -T | grep server_name"
