# Backend Django Commands

هذا المجلد يحتوي أوامر الباكند الحالية بعد التحويل الكامل إلى Django + Django REST Framework.

## تشغيل محلي

```powershell
cd D:\platform\backend
python -m pip install -r requirements-dev.txt
python manage.py migrate --fake-initial
python manage.py runserver 0.0.0.0:8000
```

## فحص الجودة

```powershell
cd D:\platform\backend
python manage.py check
python scripts\quality_check.py
```

## بيانات أولية

```powershell
cd D:\platform\backend
python scripts\seed_initial_data.py
python scripts\seed_email_templates.py
python scripts\seed_default_faqs.py
python scripts\create_first_admin.py --username admin --email admin@example.com --full-name "مدير المنصة"
```

## ملاحظات

- الباكند النشط هو Django داخل `backend/config` و`backend/platform_api`.
- migrations الرسمية موجودة في `backend/platform_api/migrations`.
- كود FastAPI/Alembic القديم لم يعد جزءًا من المشروع النشط.
- لا توجد ملفات حاويات في المشروع؛ التشغيل الحالي محلي عبر Python وNode وقاعدة PostgreSQL مستقلة.
