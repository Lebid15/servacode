# 📘 ServaCode — معلومات النشر والتشغيل

> هذا الملف هو **المرجع الموحّد** لكل شيء يخص النشر والصيانة. إذا أردت إعادة النشر لاحقًا، اقرأ هذا الملف فقط.

---

## 🌐 معلومات الإنتاج

| العنصر | القيمة |
|---|---|
| المزوّد | Hetzner Cloud |
| نوع السيرفر | CX23 (2 vCPU / 4 GB RAM / 40 GB SSD) |
| النظام | Ubuntu 24.04 |
| IPv4 | `167.233.128.134` |
| الدومين الرئيسي | `servacode.com` |
| لوحة الإدارة | `admin.servacode.com` |
| الـ API | `api.servacode.com` |
| المشروع على GitHub | <https://github.com/Lebid15/servacode> |
| مسار المشروع على السيرفر | `/opt/servacode` |

---

## 🏗️ المعمارية

```
┌────────────────────────────────────────────────────────────┐
│                     Nginx (80/443)                         │
│         + Let's Encrypt SSL + Rate Limiting                │
└────────┬──────────────┬──────────────────┬─────────────────┘
         │              │                  │
   servacode.com   admin.servacode    api.servacode
         │              │                  │
   ┌─────▼────┐   ┌─────▼─────┐     ┌──────▼──────┐
   │public_   │   │admin_     │     │  backend    │
   │site:3000 │   │panel:3001 │     │  Django+DRF │
   │Next.js   │   │Next.js    │     │  :8000      │
   └──────────┘   └───────────┘     └──────┬──────┘
                                            │
                                     ┌──────▼──────┐
                                     │ PostgreSQL  │
                                     │  16 :5432   │
                                     └─────────────┘
```

كل شيء داخل **Docker Compose** على شبكة `servacode_net`.

---

## 🚀 النشر من الصفر (إذا فقدنا السيرفر)

### 1) إنشاء سيرفر جديد على Hetzner

- Type: **CX23** (الأرخص الكافي)
- Image: **Ubuntu 24.04**
- Location: Nuremberg أو Falkenstein
- SSH Key: مفتاحك المعروف
- Name: `servacode-prod`

### 2) DNS

من لوحة الدومين، أضف 4 سجلات `A` تشير إلى IP السيرفر:

| Type | Host | Value |
|------|------|-------|
| A | `@` | `<IP>` |
| A | `www` | `<IP>` |
| A | `admin` | `<IP>` |
| A | `api` | `<IP>` |

> Cloudflare: ضع Proxy = **DNS only** (سحابة رمادية) لكي يعمل Let's Encrypt.

### 3) تجهيز السيرفر

```bash
ssh root@<IP>

# تحديث وجدار حماية
apt update && apt upgrade -y
apt install -y ca-certificates curl gnupg git ufw fail2ban
ufw default deny incoming && ufw default allow outgoing
ufw allow OpenSSH && ufw allow 80/tcp && ufw allow 443/tcp
ufw --force enable

# Docker
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### 4) سحب المشروع

```bash
mkdir -p /opt && cd /opt
git clone https://github.com/Lebid15/servacode.git
cd servacode
```

### 5) ملف البيئة

```bash
cp .env.production.example .env.production
python3 deployment/scripts/generate_secret.py    # SECRET_KEY قوي
nano .env.production
```

عدّل على الأقل:
- `POSTGRES_PASSWORD` (قوية جدًا)
- `SECRET_KEY` (الناتج من السكربت)
- `DATABASE_URL` (يحتوي نفس كلمة مرور postgres)
- البريد إن أردت تفعيل الإشعارات

### 6) تشغيل الخدمات بدون SSL أولاً

```bash
docker compose --env-file .env.production up -d --build postgres backend public_site admin_panel
docker compose --env-file .env.production up -d nginx
```

### 7) إصدار شهادات SSL

```bash
docker compose --env-file .env.production run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d servacode.com -d www.servacode.com \
  -d admin.servacode.com -d api.servacode.com \
  --email <بريدك> --agree-tos --no-eff-email

docker compose --env-file .env.production restart nginx
```

### 8) إنشاء حساب مدير

```bash
docker compose exec backend python manage.py createsuperuser
```

### 9) (اختياري) بذر المحتوى الأساسي

```bash
docker compose exec backend python manage.py seed_platform_foundation
```

---

## 🔄 التحديث (Deploy نسخة جديدة)

```bash
ssh root@167.233.128.134
cd /opt/servacode
git pull
docker compose --env-file .env.production up -d --build
docker compose logs -f --tail=100
```

---

## 🛠️ أوامر تشغيلية شائعة

| المهمة | الأمر |
|---|---|
| رؤية حالة الخدمات | `docker compose ps` |
| لوجات الباكند | `docker compose logs -f backend` |
| لوجات Nginx | `docker compose logs -f nginx` |
| إعادة تشغيل خدمة | `docker compose restart backend` |
| إيقاف الكل | `docker compose down` |
| تشغيل الكل | `docker compose --env-file .env.production up -d` |
| دخول shell الباكند | `docker compose exec backend bash` |
| migrate يدوي | `docker compose exec backend python manage.py migrate` |
| collectstatic | `docker compose exec backend python manage.py collectstatic --noinput` |
| Django shell | `docker compose exec backend python manage.py shell` |

---

## 💾 النسخ الاحتياطي

### نسخ احتياطي يدوي

```bash
# قاعدة البيانات
docker compose exec -T postgres pg_dump -U servacode_user servacode > /opt/backup_$(date +%F).sql

# المرفوعات
tar czf /opt/uploads_$(date +%F).tar.gz -C /var/lib/docker/volumes/servacode_backend_uploads/_data .
```

### نسخ احتياطي تلقائي (cron)

```bash
crontab -e
```

أضف:
```
0 3 * * * cd /opt/servacode && docker compose exec -T postgres pg_dump -U servacode_user servacode | gzip > /opt/backups/db_$(date +\%F).sql.gz
```

ثم:
```bash
mkdir -p /opt/backups
```

### الاستعادة

```bash
docker compose exec -T postgres psql -U servacode_user -d servacode < /opt/backup_2026-06-16.sql
```

---

## 🔒 SSL (Let's Encrypt)

- مدة الشهادة: 90 يومًا.
- التجديد التلقائي: مفعّل عبر خدمة `certbot` في `docker-compose.yml` (تتفقد كل 12 ساعة).
- إجبار التجديد يدويًا:
  ```bash
  docker compose run --rm certbot renew
  docker compose restart nginx
  ```

---

## 🧪 فحص صحة الموقع

```bash
curl -I https://servacode.com
curl -I https://admin.servacode.com
curl -I https://api.servacode.com/api/v1/
```

كلها يجب أن تُرجع `200` أو `301`/`302`.

---

## 🆘 حلول مشاكل شائعة

| المشكلة | الحل |
|---|---|
| `nginx: bind() to 0.0.0.0:80 failed` | يوجد nginx آخر يعمل: `systemctl stop nginx` |
| Let's Encrypt يفشل | تأكد أن DNS منتشر: `nslookup servacode.com`. وأن Cloudflare ليس Proxied. |
| Backend لا يستجيب | `docker compose logs backend` — غالبًا قاعدة البيانات لم تجهز. |
| `502 Bad Gateway` من nginx | الباكند توقف، أعد التشغيل: `docker compose restart backend` |
| نفاد المساحة | `docker system prune -af --volumes` (احذر: لا تحذف volumes البيانات الحية) |
| Build Next.js ينفد منه الذاكرة | فعّل swap: `fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile` |

---

## 📝 ملاحظات مهمة

- **لا تعدّل ملفات داخل الحاويات مباشرة** — كل التعديلات تكون في المصدر، ثم `git push`، ثم `git pull && docker compose up -d --build` على السيرفر.
- **الأسرار**: `.env.production` لا يُرفع إلى git أبدًا. يبقى على السيرفر فقط.
- **البريد**: إذا أردت تفعيل البريد لاحقًا، حدّث متغيرات `SMTP_*` في `.env.production` و `ENABLE_EMAIL_NOTIFICATIONS=true` ثم `docker compose restart backend`.
- **بعد كل تحديث للـ DNS**: انتظر 5–30 دقيقة، وتحقّق بـ `nslookup`.

---

## 📞 ملخص الأوامر اليومية

```bash
ssh root@167.233.128.134
cd /opt/servacode

# اطّلع
docker compose ps
docker compose logs -f --tail=50

# حدّث
git pull && docker compose --env-file .env.production up -d --build

# أعد تشغيل خدمة فقط
docker compose restart backend
```
