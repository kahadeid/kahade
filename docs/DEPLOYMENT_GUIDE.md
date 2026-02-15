# 🚀 KAHADE DEPLOYMENT GUIDE - UBUNTU 24.04 LTS
## Full Production Deployment Documentation

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Server Setup](#server-setup)
3. [Automated Deployment](#automated-deployment)
4. [Manual Deployment](#manual-deployment)
5. [Post-Deployment](#post-deployment)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)
8. [Security Checklist](#security-checklist)

---

## Prerequisites

### Minimum Server Requirements
- **OS**: Ubuntu 24.04 LTS
- **CPU**: 2+ cores
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 50GB minimum SSD
- **Network**: Public IP address with port 80/443 access

### Required Accounts/Services
- Domain name (e.g., kahade.id)
- Email service (SMTP)
- SMS provider (Twilio/similar)
- Payment gateway (Xendit/Midtrans)
- KYC provider (Sumsub)
- [Optional] Sentry account for error tracking
- [Optional] S3 bucket for file storage

### DNS Configuration
Before deployment, configure your DNS:
```
A     kahade.id           -> YOUR_SERVER_IP
A     www.kahade.id       -> YOUR_SERVER_IP
A     api.kahade.id       -> YOUR_SERVER_IP
```

---

## 🚀 Server Setup

### 1. Initial Server Access
```bash
# SSH into your server
ssh root@YOUR_SERVER_IP

# Update system
apt update && apt upgrade -y

# Set timezone
timedatectl set-timezone Asia/Jakarta
```

### 2. Create Non-Root User
```bash
# Create user
adduser kahade
usermod -aG sudo kahade

# Setup SSH key for kahade user
mkdir -p /home/kahade/.ssh
cp ~/.ssh/authorized_keys /home/kahade/.ssh/
chown -R kahade:kahade /home/kahade/.ssh
chmod 700 /home/kahade/.ssh
chmod 600 /home/kahade/.ssh/authorized_keys

# Test login
ssh kahade@YOUR_SERVER_IP
```

### 3. Basic Security
```bash
# Disable root login
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart sshd

# Install fail2ban
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## 🎯 Automated Deployment

### Option 1: Using Deployment Script (Recommended)

1. **Upload files to server:**
```bash
# On your local machine
scp -r kahade-production.zip kahade@YOUR_SERVER_IP:/home/kahade/

# SSH to server
ssh kahade@YOUR_SERVER_IP
cd /home/kahade
unzip kahade-production.zip
cd kahade-production
```

2. **Run deployment script:**
```bash
sudo chmod +x deployment/deploy.sh
sudo ./deployment/deploy.sh
```

3. **Follow prompts:**
   - Enter database password
   - Wait for installation (~15-30 minutes)
   - Note down credentials shown at the end

4. **Setup SSL:**
```bash
sudo certbot --nginx -d kahade.id -d www.kahade.id -d api.kahade.id
```

5. **Configure API keys:**
```bash
sudo nano /var/www/kahade/backend/.env.production
# Update:
# - SMTP_USER, SMTP_PASS
# - SMS_API_KEY, SMS_API_SECRET
# - PAYMENT_API_KEY, PAYMENT_WEBHOOK_SECRET
# - KYC_API_KEY, KYC_API_SECRET
# Save and exit (Ctrl+X, Y, Enter)
```

6. **Restart services:**
```bash
cd /var/www/kahade/backend
pm2 restart all
sudo systemctl restart nginx
```

---

## 🔧 Manual Deployment

### Step 1: Install Dependencies

```bash
# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# pnpm
sudo npm install -g pnpm

# PM2
sudo npm install -g pm2
pm2 install pm2-logrotate

# PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Redis
sudo apt install -y redis-server

# Nginx
sudo apt install -y nginx

# Certbot
sudo apt install -y certbot python3-certbot-nginx
```

### Step 2: Database Setup

```bash
# Access PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE kahade_prod;
CREATE USER kahade_user WITH ENCRYPTED PASSWORD 'YOUR_SECURE_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE kahade_prod TO kahade_user;
ALTER DATABASE kahade_prod OWNER TO kahade_user;
\c kahade_prod
GRANT ALL ON SCHEMA public TO kahade_user;
\q
```

### Step 3: Redis Configuration

```bash
# Generate password
REDIS_PASSWORD=$(openssl rand -base64 32)
echo "Redis Password: $REDIS_PASSWORD"

# Configure Redis
sudo nano /etc/redis/redis.conf
# Add/update:
# requirepass YOUR_REDIS_PASSWORD
# maxmemory 256mb
# maxmemory-policy allkeys-lru

# Restart Redis
sudo systemctl restart redis-server
```

### Step 4: Backend Deployment

```bash
# Create directory
sudo mkdir -p /var/www/kahade/backend
sudo chown -R kahade:kahade /var/www/kahade

# Copy backend files
cp -r backend/* /var/www/kahade/backend/
cd /var/www/kahade/backend

# Create .env.production
nano .env.production
# (Copy content from template)

# Install dependencies
pnpm install --frozen-lockfile

# Build
pnpm run build

# Run migrations
npx prisma migrate deploy

# Start with PM2
pm2 start ecosystem.config.prod.js
pm2 save
pm2 startup
```

### Step 5: Frontend Build

```bash
# Create directory
sudo mkdir -p /var/www/kahade/frontend
sudo chown -R kahade:kahade /var/www/kahade/frontend

# Copy frontend files
cp -r frontend/* /var/www/kahade/frontend/
cd /var/www/kahade/frontend

# Create .env.production
nano .env.production
# (Copy content from template)

# Install and build
pnpm install --frozen-lockfile
pnpm run build

# Copy dist to nginx directory
sudo rm -rf /var/www/frontend
sudo mkdir -p /var/www/frontend
sudo cp -r dist/* /var/www/frontend/
```

### Step 6: Nginx Configuration

```bash
# Copy nginx configs
sudo cp nginx/nginx.conf /etc/nginx/nginx.conf
sudo cp nginx/conf.d/*.conf /etc/nginx/conf.d/

# Test configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

### Step 7: SSL Certificate

```bash
# Get SSL certificate
sudo certbot --nginx -d kahade.id -d www.kahade.id -d api.kahade.id

# Verify auto-renewal
sudo certbot renew --dry-run
```

---

## 🎉 Post-Deployment

### 1. Verify Services

```bash
# Check all services
sudo systemctl status postgresql
sudo systemctl status redis-server
sudo systemctl status nginx
pm2 list

# Check logs
pm2 logs
sudo tail -f /var/log/nginx/error.log
```

### 2. Test Endpoints

```bash
# Health check
curl https://api.kahade.id/api/v1/health

# Frontend
curl https://kahade.id

# Expected response: HTTP 200
```

### 3. Create Admin User

```bash
cd /var/www/kahade/backend

# Run seed script or manually create admin
npm run seed
```

### 4. Configure Firewall

```bash
# UFW setup
sudo ufw --force enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status
```

---

## 📊 Monitoring & Maintenance

### Daily Checks

```bash
# Check service status
pm2 list
sudo systemctl status nginx postgresql redis-server

# Check disk space
df -h

# Check logs
pm2 logs --lines 100
```

### Weekly Maintenance

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Check for updates
cd /var/www/kahade/backend
pnpm outdated

# Verify backups
ls -lh /var/backups/kahade/
```

### Monitoring Tools

```bash
# Install htop for CPU/Memory monitoring
sudo apt install htop -y
htop

# Install iotop for disk I/O
sudo apt install iotop -y
sudo iotop

# Check logs
sudo journalctl -u kahade-api -f
```

### Automated Backups

Backups run daily at 2 AM automatically. Manual backup:

```bash
sudo /usr/local/bin/kahade-backup.sh
```

### Log Rotation

PM2 automatically rotates logs. To check:

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 100M
pm2 set pm2-logrotate:retain 30
```

---

## 🐛 Troubleshooting

### Application Won't Start

```bash
# Check logs
pm2 logs

# Check environment variables
cd /var/www/kahade/backend
cat .env.production

# Restart services
pm2 restart all
```

### Database Connection Issues

```bash
# Test connection
psql -U kahade_user -d kahade_prod -h localhost

# Check PostgreSQL status
sudo systemctl status postgresql

# View PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-16-main.log
```

### Redis Connection Issues

```bash
# Test connection
redis-cli -a YOUR_REDIS_PASSWORD ping

# Check status
sudo systemctl status redis-server

# View logs
sudo journalctl -u redis-server -f
```

### Nginx Issues

```bash
# Test configuration
sudo nginx -t

# Check error log
sudo tail -f /var/log/nginx/error.log

# Restart nginx
sudo systemctl restart nginx
```

### SSL Certificate Issues

```bash
# Check certificate
sudo certbot certificates

# Renew manually
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run
```

### High CPU/Memory Usage

```bash
# Check processes
htop

# Check PM2 status
pm2 status

# Restart with limited instances
pm2 delete all
pm2 start ecosystem.config.prod.js --instances 2
```

---

## 🔒 Security Checklist

### Pre-Production Security

- [ ] All default passwords changed
- [ ] Firewall configured (UFW)
- [ ] SSH key-based authentication only
- [ ] Fail2ban configured
- [ ] SSL/TLS certificates installed
- [ ] CORS properly configured
- [ ] Environment variables secured
- [ ] Database user has limited privileges
- [ ] Redis password set
- [ ] File upload scanning enabled

### Post-Deployment Security

- [ ] Regular security updates scheduled
- [ ] Backup system verified
- [ ] Monitoring alerts configured
- [ ] Log monitoring active
- [ ] Rate limiting tested
- [ ] API authentication tested
- [ ] CSRF protection verified
- [ ] XSS protection verified
- [ ] SQL injection prevention tested

### Ongoing Security

```bash
# Weekly security updates
sudo apt update && sudo apt upgrade -y

# Monthly security audit
sudo apt install lynis -y
sudo lynis audit system

# Check for vulnerabilities
pnpm audit
```

---

## 📞 Support & Resources

### Important Files
- Logs: `/var/log/kahade/`
- Backups: `/var/backups/kahade/`
- Application: `/var/www/kahade/`

### Useful Commands

```bash
# Quick restart
pm2 restart all && sudo systemctl restart nginx

# View real-time logs
pm2 logs --timestamp

# Check API health
curl https://api.kahade.id/api/v1/health

# Database backup
sudo -u postgres pg_dump kahade_prod > backup.sql
```

### Emergency Contacts
- System Admin: admin@kahade.id
- Support: support@kahade.id

---

## 🎯 Production Checklist

Before going live:

### Infrastructure
- [ ] Server properly configured
- [ ] Domain DNS configured
- [ ] SSL certificates active
- [ ] Firewall rules set
- [ ] Backups automated
- [ ] Monitoring active

### Application
- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] Admin user created
- [ ] API endpoints tested
- [ ] Frontend loads correctly
- [ ] File uploads working
- [ ] Email sending tested
- [ ] SMS sending tested
- [ ] Payment integration tested
- [ ] KYC integration tested

### Security
- [ ] Security headers configured
- [ ] Rate limiting active
- [ ] CORS properly set
- [ ] CSRF protection enabled
- [ ] Input validation working
- [ ] File scanning active
- [ ] Logs being collected

### Performance
- [ ] PM2 clustering enabled
- [ ] Nginx caching configured
- [ ] Database indexed
- [ ] Redis caching active
- [ ] Static assets optimized
- [ ] CDN configured (optional)

---

## 🎓 Best Practices

1. **Always test in staging first**
2. **Keep regular backups**
3. **Monitor logs daily**
4. **Update dependencies weekly**
5. **Security patches immediately**
6. **Document all changes**
7. **Use version control**
8. **Test disaster recovery**
9. **Monitor resource usage**
10. **Keep credentials secure**

---

**Deployment completed successfully! 🎉**

For support, contact: admin@kahade.id
