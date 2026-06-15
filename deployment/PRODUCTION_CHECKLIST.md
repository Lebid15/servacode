# Production Checklist

## قبل النشر

- [ ] تعديل `DOMAIN_NAME`.
- [ ] تعديل `PUBLIC_SITE_URL`.
- [ ] تعديل `NEXT_PUBLIC_API_BASE_URL`.
- [ ] توليد `SECRET_KEY` قوي.
- [ ] تغيير كلمة مرور PostgreSQL.
- [ ] ضبط `BACKEND_CORS_ORIGINS`.
- [ ] تعطيل `DEBUG`.
- [ ] ضبط `ALLOWED_HOSTS`.
- [ ] تفعيل rate limiting.
- [ ] اختبار login lockout.
- [ ] ضبط SMTP إن كان البريد مطلوبًا.
- [ ] تنفيذ `npm run quality`.
- [ ] تنفيذ `python scripts/quality_check.py`.
- [ ] إنشاء أول Super Admin.
- [ ] تشغيل seed لقوالب البريد.
- [ ] التأكد من `/api/v1/health/ready`.

## بعد النشر

- [ ] اختبار الصفحة الرئيسية.
- [ ] اختبار تسجيل دخول الأدمن.
- [ ] اختبار إرسال رسالة تواصل.
- [ ] اختبار إرسال طلب عرض سعر.
- [ ] اختبار ظهور الإشعارات.
- [ ] اختبار sitemap وrobots.
- [ ] مراقبة logs أول 24 ساعة.
- [ ] إنشاء backup أولي بعد الإطلاق.
