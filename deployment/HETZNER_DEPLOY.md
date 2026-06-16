# 🚀 ServaCode — دليل النشر السريع على Hetzner

دليل عملي خطوة بخطوة لرفع المشروع على سيرفر Hetzner Cloud باستخدام Docker.

---

## 1) متطلبات قبل البدء

- **حساب Hetzner Cloud**: <https://console.hetzner.cloud>
- **دومين**: `servacode.com` (تم شراؤه)
- **مفتاح SSH** على جهازك: إذا لم يكن لديك، شغّل في PowerShell:
  ```powershell
  ssh-keygen -t ed25519 -C "servacode-deploy"
  ```
  ثم انسخ محتوى `C:\Users\<YOU>\.ssh\id_ed25519.pub`.

---

## 2) إنشاء السيرفر على Hetzner

1. ادخل Hetzner Cloud Console → **New project** باسم `ServaCode` → **Add server**.
2. **الموقع**: Nuremberg أو Falkenstein (أسرع لأوروبا/الشرق الأوسط).
3. **النظام**: Ubuntu 24.04.
4. **النوع**: `CPX21` (3 vCPU / 4GB RAM / ~6€ شهريًا) — كافٍ للتشغيل المريح. الحد الأدنى `CX22`.
5. **Networking**: فعّل IPv4 + IPv6.
6. **SSH Keys**: ألصق المفتاح العام الذي نسخته.
7. **Name**: `servacode-prod`.
8. اضغط **Create & Buy**.

دوّن الـ **IPv4** الظاهر بعد الإنشاء.

---

## 3) ربط الدومين بالسيرفر (DNS)

من لوحة مزوّد الدومين (Namecheap / Cloudflare / GoDaddy …) أضف 4 سجلات `A`:

| Type | Host  | Value (IPv4) | TTL  |
| ---- | ----- | ------------ | ---- |
| A    | @     | <IP السيرفر> | 3600 |
| A    | www   | <IP السيرفر> | 3600 |
| A    | admin | <IP السيرفر> | 3600 |
| A    | api   | <IP السيرفر> | 3600 |

> انتظر 5–30 دقيقة حتى ينتشر DNS، تحقق بـ `nslookup servacode.com` من جهازك.

---

## 4) تجهيز السيرفر

اتصل بالسيرفر:
```powershell
ssh root@<IP>
```

ثم نفّذ على السيرفر:

```bash
# تحديث وتثبيت الأساسيات
apt update && apt upgrade -y
apt install -y ca-certificates curl gnupg git ufw fail2ban

# جدار حماية
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# تثبيت Docker
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" \
  | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

docker --version
docker compose version
```

---

## 5) سحب المشروع

```bash
mkdir -p /opt && cd /opt
git clone https://github.com/Lebid15/servacode.git
cd servacode
```

---

## 6) إعداد ملف البيئة

```bash
cp .env.production.example .env.production
python3 deployment/scripts/generate_secret.py    # ينشئ SECRET_KEY قوي
nano .env.production
```

عدّل القيم التالية على الأقل:

```env
DOMAIN_NAME=servacode.com
PUBLIC_DOMAIN=servacode.com
ADMIN_DOMAIN=admin.servacode.com
API_DOMAIN=api.servacode.com

PUBLIC_SITE_URL=https://servacode.com
ADMIN_SITE_URL=https://admin.servacode.com
API_SITE_URL=https://api.servacode.com

POSTGRES_PASSWORD=<ضع كلمة مرور قوية>

SECRET_KEY=<الناتج من السكربت أعلاه>
ALLOWED_HOSTS=servacode.com,www.servacode.com,admin.servacode.com,api.servacode.com,backend
DATABASE_URL=postgresql+psycopg://servacode_user:<نفس كلمة المرور>@postgres:5432/servacode
BACKEND_CORS_ORIGINS=https://servacode.com,https://www.servacode.com,https://admin.servacode.com

# روابط الواجهة (يستخدمها Next.js وقت البناء)
NEXT_PUBLIC_API_BASE_URL=https://api.servacode.com/api/v1
NEXT_PUBLIC_SITE_URL=https://servacode.com
NEXT_PUBLIC_ADMIN_URL=https://admin.servacode.com
NEXT_PUBLIC_ADMIN_SITE_URL=https://admin.servacode.com
NEXT_PUBLIC_PUBLIC_SITE_URL=https://servacode.com

NEXT_PUBLIC_SITE_NAME=ServaCode
NEXT_PUBLIC_SHOW_DEMO_CONTENT=false
NEXT_PUBLIC_ALLOW_INDEXING=true

# البريد لاحقًا (يمكن تركه فارغًا الآن)
ENABLE_EMAIL_NOTIFICATIONS=false
```

احفظ بـ `Ctrl+O` ثم `Ctrl+X`.

---

## 7) إصدار شهادات SSL أول مرة

قبل تشغيل nginx بإعدادات HTTPS، نحتاج شهادات. شغّل nginx مؤقتًا للـ HTTP فقط:

```bash
# إيقاف أي nginx قديم على المنفذ 80
systemctl stop nginx 2>/dev/null || true

# تشغيل قاعدة البيانات والباكند والواجهات
docker compose --env-file .env.production up -d --build postgres backend public_site admin_panel

# تشغيل nginx مع كونفيج HTTP فقط مؤقتًا
docker compose --env-file .env.production up -d nginx

# طلب الشهادات
docker compose --env-file .env.production run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d servacode.com -d www.servacode.com \
  -d admin.servacode.com -d api.servacode.com \
  --email <بريدك> --agree-tos --no-eff-email

# إعادة تحميل nginx لتفعيل HTTPS
docker compose --env-file .env.production restart nginx
```

> ⚠️ إذا أعطى nginx خطأ بسبب غياب الشهادات في أول إقلاع، شغّل أمر الشهادات أولًا، ثم `docker compose restart nginx`.

---

## 8) تشغيل المشروع كاملاً

```bash
docker compose --env-file .env.production up -d --build
docker compose ps
docker compose logs -f --tail=100
```

تحقق:

- <https://servacode.com> → الموقع العام
- <https://admin.servacode.com> → لوحة التحكم
- <https://api.servacode.com/api/v1/> → الباكند

---

## 9) إنشاء حساب المدير الأول

```bash
docker compose exec backend python manage.py createsuperuser
```

ثم سجّل دخول إلى `https://admin.servacode.com/ar/admin/login`.

---

## 10) تشغيل بذرة المحتوى الأساسي (اختياري)

تنشئ الأدوار والصفحات الثابتة وقوالب البريد الافتراضية:

```bash
docker compose exec backend python manage.py seed_platform_foundation
```

---

## 11) عمليات يومية مفيدة

| العملية              | الأمر                                                                             |
| -------------------- | --------------------------------------------------------------------------------- |
| رؤية اللوجات         | `docker compose logs -f backend`                                                  |
| إعادة تشغيل خدمة     | `docker compose restart backend`                                                  |
| إيقاف الكل           | `docker compose down`                                                             |
| تحديث الكود ونشر جديد| `git pull && docker compose --env-file .env.production up -d --build`             |
| نسخ احتياطي للداتا   | `docker compose exec postgres pg_dump -U servacode_user servacode > backup.sql`   |

---

## 12) نصائح أمنية سريعة

- لا تترك تسجيل الدخول بـ `root` ـ أنشئ مستخدم `deploy` وأضفه إلى مجموعة `docker`.
- عطّل تسجيل الدخول بكلمة مرور SSH (اعتمد المفتاح فقط).
- شغّل `fail2ban` (مثبّت أصلًا).
- بدّل `SECRET_KEY` و `POSTGRES_PASSWORD` لقيم قوية فعلًا.
- فعّل النسخ الاحتياطي اليومي عبر cron.
