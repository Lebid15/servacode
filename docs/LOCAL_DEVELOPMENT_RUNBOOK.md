# دليل التشغيل والفحص المحلي

## 1. الهدف

هذا الملف يشرح طريقة تشغيل المشروع محليًا وفحصه قبل أي نشر.
المشروع مكوّن من:

- `backend` — Django REST API.
- `public_site` — الموقع العام.
- `admin_panel` — لوحة التحكم.

## 2. تجهيز الباكند

```powershell
cd D:\platform\backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements-dev.txt
python manage.py migrate --fake-initial
python scripts\quality_check.py
python manage.py runserver 127.0.0.1:8000
```

إذا احتجت إنشاء أول مدير:

```powershell
cd D:\platform\backend
python scripts\create_first_admin.py
```

## 3. تشغيل الموقع العام

في نافذة طرفية ثانية:

```powershell
cd D:\platform\public_site
npm ci
npm run quality
npm run dev:3000
```

الرابط المحلي المتوقع:

```text
http://127.0.0.1:3000
```

## 4. تشغيل لوحة التحكم

في نافذة طرفية ثالثة:

```powershell
cd D:\platform\admin_panel
pnpm install --frozen-lockfile
pnpm run quality
pnpm run dev
```

الرابط المحلي المتوقع:

```text
http://127.0.0.1:3001
```

## 5. فحص كامل للمشروع

من جذر المشروع:

```powershell
cd D:\platform
.\scripts\full-e2e-check.ps1
```

فحص سريع بدون build كامل:

```powershell
cd D:\platform
.\scripts\full-e2e-check.ps1 -SkipBuild
```

## 6. أوامر الفحص اليدوي

### Backend

```powershell
cd D:\platform\backend
python -m compileall config platform_api scripts tests
python scripts\quality_check.py
pytest
```

### Public Site

```powershell
cd D:\platform\public_site
npm run release-check
npm run quality
npm run build
```

### Admin Panel

```powershell
cd D:\platform\admin_panel
pnpm run release-check
pnpm run quality
pnpm run build
```

## 7. سيناريو اختبار يدوي أساسي

بعد تشغيل الباكند ولوحة التحكم والموقع العام:

1. سجّل الدخول إلى لوحة التحكم.
2. أضف خدمة جديدة بالعربية فقط.
3. افتح الموقع العام وتأكد أن الخدمة ظهرت.
4. أضف نظامًا مع مميزات وصور وأسئلة.
5. افتح صفحة النظام وتأكد أن كل البيانات تظهر.
6. أضف تطبيقًا مع رابط تحميل.
7. تأكد أن زر التطبيق في الموقع هو `تحميل التطبيق`.
8. أضف عملًا مع تقنيات ومعرض صور.
9. تأكد أن صفحة العمل تعرض البيانات والمعرض.
10. أرسل رسالة تواصل من الموقع العام وتأكد أنها ظهرت في الأدمن.
11. أرسل طلب عرض سعر وتأكد أنه ظهر في الأدمن.
12. أرسل طلب دعم وتأكد أنه ظهر في الأدمن.
13. عدّل إعدادات الموقع وتأكد أنها تنعكس على الموقع العام.

## 8. تنظيف الملفات المحلية قبل الرفع

```powershell
cd D:\platform
.\scripts\clean-local-artifacts.ps1
```

لرؤية ما سيتم حذفه دون حذف فعلي:

```powershell
cd D:\platform
.\scripts\clean-local-artifacts.ps1 -WhatIfOnly
```

## 9. إنشاء نسخة خفيفة للرفع

```powershell
cd D:\platform
.\scripts\create-clean-upload.ps1 -Source D:\platform -OutputZip D:\platform-clean-upload.zip
```

الملف الناتج:

```text
D:\platform-clean-upload.zip
```
