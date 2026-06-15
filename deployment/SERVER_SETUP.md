# Server Setup

## المتطلبات

- Ubuntu 22.04 أو أحدث
- Python 3.11+
- PostgreSQL 16 أو قاعدة PostgreSQL خارجية
- Node.js 20+
- pnpm عبر Corepack
- Nginx
- Domain موجه إلى السيرفر
- Firewall يسمح بـ 80 و443

## تثبيت الحزم الأساسية على Ubuntu

```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-pip postgresql-client nginx curl git
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
corepack enable
```

## تجهيز المشروع

```bash
git clone YOUR_REPOSITORY_URL company-platform
cd company-platform
cp .env.production.example .env.production
python3 deployment/scripts/generate_secret.py
```

عدّل `.env.production` ثم اتبع `deployment/DEPLOYMENT_COMMANDS.md`.
