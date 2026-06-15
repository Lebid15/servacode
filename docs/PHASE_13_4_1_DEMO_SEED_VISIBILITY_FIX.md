# Phase 13.4.1 — Demo Seed Visibility Fix

## الهدف
معالجة حالة تشغيل سكربت المحتوى المبدئي وعدم ظهور عناصر تطبيقاتنا/أنظمتنا/أعمالنا في الموقع العام.

## التعديل
تم تحسين `backend/scripts/seed_demo_content.py` ليقوم بالآتي:

- تفعيل أقسام `apps/products/portfolio` داخل إعدادات الموقع.
- إضافة عناصر مبدئية إذا لم تكن موجودة.
- إعادة تفعيل العناصر التي أنشأها السكربت سابقًا إذا كانت مخفية أو محذوفة أثناء التجربة.
- طباعة عدد العناصر المرئية فعليًا بعد التنفيذ.
- طباعة روابط الاختبار المباشر.

## التشغيل

```powershell
cd D:\platform\backend
.\.venv\Scripts\activate
alembic upgrade head
python scripts\seed_demo_content.py
uvicorn app.main:app --reload
```

ثم افتح:

```text
http://localhost:3000/ar/apps
http://localhost:3000/ar/products
http://localhost:3000/ar/portfolio
```

## احترام العناصر المخفية
إذا أردت تشغيل السكربت بدون إعادة تفعيل العناصر التي أخفيتها سابقًا:

```powershell
python scripts\seed_demo_content.py --respect-hidden
```
