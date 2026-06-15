# Phase 13.4.2 — Demo Seed Portfolio Fix

## السبب
كان سكربت `seed_demo_content.py` يضيف `extra_data` لعناصر الأعمال لتحديد مصدرها ومنع التكرار، لكن موديل `PortfolioProject` لم يكن يحتوي هذا الحقل، لذلك كان السكربت يفشل قبل حفظ أي محتوى، فتظل صفحات تطبيقاتنا/أنظمتنا/أعمالنا فارغة.

## الإصلاح
- إضافة `extra_data` إلى موديل `PortfolioProject`.
- إضافة migration آمن يضيف العمود إلى جدول `portfolio_projects` إذا لم يكن موجودًا.
- تحديث `diagnose_schema_compatibility.py` ليفحص توافق جدول الأعمال.

## التشغيل
```powershell
cd D:\platform\backend
.\.venv\Scripts\activate
alembic upgrade head
python scripts\diagnose_schema_compatibility.py
python scripts\seed_demo_content.py
uvicorn app.main:app --reload
```

بعدها افتح:
- `http://localhost:3000/ar/apps`
- `http://localhost:3000/ar/products`
- `http://localhost:3000/ar/portfolio`
