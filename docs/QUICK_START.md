# ⚡ QUICK START GUIDE
## Deploy Kahade in 30 Minutes

---

## 🎯 Prerequisites
- Ubuntu 24.04 server with root access
- Domain name with DNS configured
- Server: 4GB RAM, 2 CPU cores, 50GB storage

---

## 🚀 5-Step Deployment

### 1️⃣ Upload & Extract (2 minutes)

```bash
# Upload to server
scp kahade-production.zip root@YOUR_SERVER_IP:/root/

# SSH to server
ssh root@YOUR_SERVER_IP

# Extract
cd /root
unzip kahade-production.zip
cd kahade-production
```

### 2️⃣ Run Deployment Script (15-25 minutes)

```bash
chmod +x deployment/deploy.sh
./deployment/deploy.sh
```

**During installation, you'll be prompted for:**
- Database password (create a strong one!)
- Whether to continue without SSL initially

**Save the credentials shown at the end!**

### 3️⃣ Configure API Keys (3 minutes)

```bash
nano /var/www/kahade/backend/.env.production
```

Update these values:
```env
# Email
SMTP_USER=your-email@domain.com
SMTP_PASS=your-app-password

# SMS (Twilio)
SMS_API_KEY=your-twilio-account-sid
SMS_API_SECRET=your-twilio-auth-token
SMS_FROM=+6281234567890

# Payment (Xendit)
PAYMENT_API_KEY=xnd_production_your_key
PAYMENT_WEBHOOK_SECRET=your_webhook_secret

# KYC (Sumsub)
KYC_API_KEY=your_sumsub_key
KYC_API_SECRET=your_sumsub_secret
```

Save: `Ctrl+X`, then `Y`, then `Enter`

### 4️⃣ Setup SSL Certificate (5 minutes)

```bash
certbot --nginx -d kahade.id -d www.kahade.id -d api.kahade.id
```

Follow the prompts:
- Enter email address
- Agree to terms
- Choose to redirect HTTP to HTTPS

### 5️⃣ Restart & Verify (2 minutes)

```bash
# Restart services
cd /var/www/kahade/backend
pm2 restart all
systemctl restart nginx

# Verify
curl https://api.kahade.id/api/v1/health
curl https://kahade.id

# Check logs
pm2 logs
```

---

## ✅ Post-Deployment Checklist

### Immediate (< 5 minutes)
- [ ] All services running: `pm2 list && systemctl status nginx`
- [ ] API health check: `curl https://api.kahade.id/api/v1/health`
- [ ] Frontend loads: Open browser to `https://kahade.id`
- [ ] Can create account
- [ ] Can login

### Within 24 Hours
- [ ] Test transaction flow
- [ ] Test payment integration
- [ ] Verify email sending
- [ ] Verify SMS sending
- [ ] Check logs for errors: `pm2 logs`
- [ ] Verify backups: `ls /var/backups/kahade/`

### Within 1 Week
- [ ] Monitor resource usage: `htop`
- [ ] Review security logs
- [ ] Test disaster recovery
- [ ] Configure monitoring alerts

---

## 🔧 Common Commands

### Service Management
```bash
# View all services
pm2 list
systemctl status nginx postgresql redis-server

# Restart services
pm2 restart all
systemctl restart nginx

# View logs
pm2 logs
tail -f /var/log/nginx/error.log
```

### Troubleshooting
```bash
# If backend won't start
cd /var/www/kahade/backend
pm2 logs
cat .env.production

# If frontend shows 502
systemctl status nginx
nginx -t
pm2 list

# If database connection fails
systemctl status postgresql
sudo -u postgres psql -l
```

### Updates
```bash
# System updates
apt update && apt upgrade -y

# Application updates
cd /var/www/kahade/backend
git pull
pnpm install
pnpm run build
pm2 restart all
```

---

## 🆘 Need Help?

### Check Logs
```bash
# Application logs
pm2 logs

# Nginx logs
tail -f /var/log/nginx/error.log

# System logs
journalctl -u kahade-api -f
```

### Health Checks
```bash
# API health
curl https://api.kahade.id/api/v1/health

# Database
psql -U kahade_user -d kahade_prod -c "SELECT 1"

# Redis
redis-cli -a YOUR_REDIS_PASSWORD ping
```

### Get Status
```bash
# Quick status check
echo "=== Services ==="
pm2 list
echo "=== Nginx ==="
systemctl status nginx --no-pager
echo "=== Database ==="
systemctl status postgresql --no-pager
echo "=== Redis ==="
systemctl status redis-server --no-pager
```

---

## 📚 Documentation

For detailed information, see:
- **Full Guide:** `/DEPLOYMENT_GUIDE.md`
- **Audit Report:** `/AUDIT_REPORT.md`
- **Logs:** `/var/log/kahade/`
- **Backups:** `/var/backups/kahade/`

---

## 🎉 Success!

Your Kahade platform is now live at:
- **Frontend:** https://kahade.id
- **API:** https://api.kahade.id
- **Admin Panel:** https://kahade.id/admin

**Next Steps:**
1. Create admin account
2. Configure payment methods
3. Test all features
4. Monitor for 48 hours
5. Announce launch! 🚀

---

**Questions?** Email: admin@kahade.id
