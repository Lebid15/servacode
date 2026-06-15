# Phase 15.16 — Admin Final AI + Auth Closure

## الهدف
إغلاق لوحة التحكم بشكل احترافي من ناحية تسجيل الدخول، الاستعادة، إعدادات الذكاء الاصطناعي، وتجربة الإدخال الذكية عربي/إنجليزي.

## المنجز

### شاشة تسجيل الدخول
- إضافة خيار **تذكرني**.
- إرسال `remember_me` إلى الباكند.
- عند تفعيل تذكرني تصبح مدة جلسة refresh أطول.
- إضافة رابط **نسيت كلمة المرور؟** داخل شاشة الدخول.
- إضافة نموذج طلب رابط استعادة كلمة المرور عبر البريد.

### استعادة كلمة المرور
- إضافة endpoint عام:
  - `POST /api/v1/auth/forgot-password`
  - `POST /api/v1/auth/reset-password`
- إنشاء رابط استعادة بتوقيع آمن وصلاحية ساعة واحدة.
- بعد تغيير كلمة المرور يصبح الرابط القديم غير صالح لأن التوقيع مرتبط ببصمة كلمة المرور القديمة.
- إضافة صفحة لوحة الأدمن:
  - `/ar/admin/reset-password?token=...`
  - `/en/admin/reset-password?token=...`

### البريد الإلكتروني
يعتمد إرسال رابط الاستعادة على إعدادات SMTP في `backend/.env`:

```env
SMTP_HOST=
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=
SMTP_FROM_NAME=ServaCode
SMTP_USE_TLS=true
```

إذا كان المشروع يعمل في بيئة تطوير ولم تكن إعدادات SMTP مكتملة، يرجع الباكند رابط الاستعادة داخل `development_reset_url` لتسهيل الاختبار المحلي فقط.

### إعدادات الذكاء الاصطناعي
- نقل إدارة `AI_API_KEY` إلى لوحة التحكم من تبويب الذكاء الاصطناعي.
- حفظ المفتاح داخل إعدادات المنصة `SiteSettings.extra_settings.ai` بدل الاعتماد على الكود فقط.
- المفتاح لا يظهر كاملًا في الواجهة؛ يظهر مقنعًا فقط مثل `sk-************abcd`.
- إضافة إعدادات:
  - تفعيل/تعطيل الذكاء الاصطناعي.
  - مزود الذكاء الاصطناعي.
  - رابط المزود.
  - نموذج النصوص.
  - نموذج الصور.
  - مهلة الاتصال.
  - تفعيل الذكاء الاصطناعي في كل النماذج.
  - الترجمة التلقائية.
  - توليد SEO.
  - إخفاء الحقول الإنجليزية.
- إضافة endpoint:
  - `PATCH /api/v1/admin/ai/settings`
  - `POST /api/v1/admin/ai/test`

### تجربة الإدخال الذكية
- المنطق المعتمد: المستخدم يكتب بالعربي، والذكاء الاصطناعي يترجم ويحسّن ويولد SEO والميزات.
- القيم التقنية تبقى داخلية، أما الواجهة فتستخدم مسميات عربية/إنجليزية مفهومة.
- إذا لم يكن AI مضبوطًا، يبقى fallback الداخلي فعالًا حتى لا يتعطل الحفظ.

## الملفات المعدلة
- `backend/platform_api/auth.py`
- `backend/platform_api/ai.py`
- `backend/platform_api/serializers.py`
- `backend/platform_api/views.py`
- `backend/platform_api/urls.py`
- `admin_panel/src/shared/api/auth-client.ts`
- `admin_panel/src/shared/api/ai-client.ts`
- `admin_panel/src/app/[locale]/admin/login/AdminLoginPage.tsx`
- `admin_panel/src/app/[locale]/admin/login/page.tsx`
- `admin_panel/src/app/[locale]/admin/reset-password/page.tsx`
- `admin_panel/src/app/[locale]/admin/reset-password/AdminResetPasswordPage.tsx`
- `admin_panel/src/shared/admin/components/AdminAiSettingsPage.tsx`
- `admin_panel/src/shared/design-system/i18n/ar.json`
- `admin_panel/src/shared/design-system/i18n/en.json`
- `admin_panel/scripts/release-check.mjs`

## الفحص
- Backend compileall: PASS
- Admin release-check: PASS

