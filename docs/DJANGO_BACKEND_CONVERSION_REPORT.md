# تقرير تحويل الباكند إلى Django وتنظيف التشغيل

تاريخ التقرير: 2026-06-13

## 1. ملخص تنفيذي

تم تحويل الباكند النشط من FastAPI إلى Django + Django REST Framework داخل مجلد `backend` مع الحفاظ على بادئة المسارات الحالية `/api/v1` قدر الإمكان حتى لا تتغير عقود الربط مع الموقع العام ولوحة التحكم. تمت إضافة مشروع Django باسم `config` وتطبيق API باسم `platform_api`، ونقلت نماذج البيانات الأساسية إلى Django Models مع الحفاظ على أسماء الجداول القديمة عبر `db_table` لتقليل أثر الانتقال على قاعدة البيانات.

تم تحويل الباكند النشط إلى Django + DRF مع تنظيف ملفات التشغيل القديمة. بناءً على طلب مالك المشروع، تمت إزالة ملفات الحاويات من المشروع بالكامل واعتماد تشغيل محلي مباشر عبر Python وNode وقاعدة PostgreSQL مستقلة.

## 2. الملفات والمحاور التي تم تنفيذها

- إضافة مشروع Django: `backend/manage.py`, `backend/config/*`.
- إضافة تطبيق API: `backend/platform_api/*`.
- نقل نماذج الجداول الأساسية إلى Django Models: المستخدمون، الأدوار، الإعدادات، الخدمات، المنتجات، التطبيقات، الأعمال، المقالات، FAQ، الشهادات، الصفحات الثابتة، الطلبات، الرسائل، الدعم، الوسائط، الإشعارات، التدقيق، التحليلات، وقوالب البريد.
- إضافة مصادقة JWT متوافقة مع نمط Bearer token الحالي.
- إضافة endpoints للصحة والجذر والمصادقة والواجهات العامة وCRUD إداري عام.
- إضافة توحيد أخطاء DRF بشكل `success=false` مع `error.code/details/status_code`.
- إضافة throttling لمسارات الدخول والنماذج العامة والتحليلات.
- تحسين قوائم الإدارة بإرجاع `meta.total`, `skip`, `limit`, و`returned`.
- استعادة إجراءات مهمة لإدارة المستخدمين: تعديل الملف الشخصي، تغيير كلمة المرور، تغيير كلمة مرور مستخدم، فك القفل، ومنع حذف/تعطيل آخر superuser نشط.
- نقل رفع الوسائط الفعلي إلى Django مع فحص الامتداد والحجم وحماية حذف الملفات المستخدمة.
- نقل خدمات AI والترجمة الجماعية والتصدير إلى Django بدل placeholders.
- إضافة صلاحيات دقيقة على ViewSets الإدارية حسب role permissions.
- إنشاء migration رسمية أولية لـ `platform_api` وتشغيلها عبر `python manage.py migrate --fake-initial`.
- تحويل logout إلى endpoint حقيقي مناسب لـ JWT stateless.
- تحديث اختبارات الباكند لتستهدف Django بدل FastAPI.
- تحديث `requirements.txt` و`requirements-dev.txt` لاعتمادات Django/DRF.
- حذف ملفات الحاويات وسكربتات التشغيل المرتبطة بها من المشروع.

## 3. حالة التحقق الحالية

النتائج المنفذة محليًا:

- `python manage.py check`: ناجح، بدون مشاكل.
- `python -m pytest`: ناجح، 18 اختبارًا.
- `python -m ruff check .`: ناجح.
- `python scripts\quality_check.py`: ناجح، ويشغل compileall + Ruff + pytest.
ملاحظة: بعد حذف ملفات الحاويات أصبحت فحوص التشغيل تعتمد على Python وNode مباشرة.

## 4. حالة الترجمة المركزية

الترجمة الحالية في المشروع ليست مبنية على جدول ترجمة مركزي منفصل، بل على أعمدة ثنائية اللغة داخل الجداول مثل `title_ar`, `title_en`, `description_ar`, `description_en`, وحقول SEO العربية والإنجليزية. هذا التصميم واضح وسهل للوحة التحكم الحالية، لكنه يكرر الحقول داخل كل نموذج.

الإعدادات الجديدة احتفظت بمفاتيح الترجمة التلقائية:

- `AUTO_TRANSLATION_ENABLED`
- `AUTO_TRANSLATION_PROVIDER`
- `TRANSLATION_API_URL`
- `TRANSLATION_API_KEY`

حالة التنفيذ: نموذج البيانات الثنائي محفوظ في Django، ومسار الترجمة التلقائية `/api/v1/admin/translation/bulk` أصبح مربوطًا بخدمة `TranslationService` داخل `platform_api` مع دعم `mymemory` و`libretranslate` وfallback يعيد النص الأصلي عند التعطيل أو الفشل.

التوصية: في المرحلة القادمة، يفضل إضافة cache اختياري لنتائج الترجمة لتقليل استدعاءات API الخارجية.

## 5. المزايا الموجودة حاليًا

- API موحد تحت `/api/v1`.
- لوحة تحكم إدارية بكيانات كثيرة: الخدمات، المنتجات، التطبيقات، الأعمال، المقالات، الصفحات، FAQ، الشهادات، الرسائل والطلبات.
- موقع عام يقرأ المحتوى المنشور فقط.
- دعم لغتين على مستوى المحتوى والـ SEO.
- JWT login/refresh/me.
- حذف ناعم لمعظم جداول المحتوى.
- سجل تدقيق AuditLog موجود كنموذج بيانات.
- مكتبة وسائط كنموذج بيانات.
- إعدادات موقع مركزية.
- تشغيل محلي مباشر للباكند والموقع العام ولوحة التحكم.
- اختبارات صحة وأمان واستجابات أساسية.
- AI admin endpoints لتوليد المحتوى والترجمة الذكية وتوليد الصور عند ضبط API key.
- Export endpoints لطلبات الأسعار ورسائل التواصل بصيغة CSV.

## 6. الأخطاء والمخاطر المتبقية

- بعض تفاصيل audit logging المتقدمة ما زالت تحتاج تعميقًا، لكن مسارات AI والترجمة والتصدير ورفع الوسائط وإجراءات المستخدم الأساسية نُقلت إلى Django.
- تم حذف مجلد `backend/app` وملفات Alembic القديمة وسكربتات SQLAlchemy غير النشطة بعد اكتمال تحويل Django.
- تم إنشاء migration رسمية أولية لتطبيق `platform_api`. عند تشغيل قاعدة بيانات تحتوي جداول قديمة، يستخدم الأمر `python manage.py migrate --fake-initial` لتسجيل migration بدون إعادة إنشاء الجداول الموجودة.
- API الإداري العام يطبق صلاحيات role permissions على مستوى الموارد الأساسية، وما زال يحتاج object-level checks لبعض الموارد الحساسة.
- أخطاء DRF أصبحت موحدة، لكن يفضل لاحقًا تخصيص رسائل business errors لكل خدمة بدل الاعتماد على ValidationError عام.

## 7. الأمان

نقاط جيدة موجودة أو أضيفت:

- حماية إنتاجية تمنع `DEBUG=true` أو `SECRET_KEY` ضعيف عند `APP_ENV=production`.
- JWT Bearer authentication.
- قفل حساب مؤقت بعد محاولات دخول فاشلة.
- Throttling لمسارات login والنماذج العامة والتحليلات.
- CORS من متغيرات البيئة.
- Security headers أساسية من Django: منع sniffing، منع framing، referrer policy.
- كلمات المرور الحالية ما زالت تتحقق عبر Passlib/bcrypt للحفاظ على توافق الهاشات القديمة.
- إعدادات cookies آمنة في الإنتاج.

تحسينات أمنية مقترحة:

- تفعيل audit logging فعليًا في create/update/delete/login.
- توسيع فحص رفع الملفات ليشمل MIME sniffing وفحص محتوى فعلي للصور والملفات التنفيذية.
- نقل refresh tokens إلى تخزين قابل للإبطال أو token blacklist إذا كانت الجلسات تحتاج logout حقيقي.

## 8. توصيات التحسين التالية

1. إضافة object-level checks للموارد الحساسة مثل المستخدمين والوسائط والطلبات.
2. إضافة اختبارات تكامل للموقع العام ولوحة الأدمن ضد endpoints الأساسية.
3. توسيع seed scripts لتوليد demo content كامل عند الحاجة.
4. إضافة health check أوسع للتخزين والبريد وقاعدة البيانات.
5. توسيع audit logging ليغطي create/update/delete/login بشكل كامل.
6. تحويل رسائل business errors إلى استثناءات مخصصة بدل ValidationError عام.
7. اختبار migration على نسخة staging من قاعدة البيانات القديمة قبل الإنتاج.

## 9. طريقة التشغيل المقترحة بعد التعديل

للباكند فقط محليًا:

```powershell
cd D:\platform\backend
python -m pip install -r requirements-dev.txt
python manage.py check
python manage.py migrate --fake-initial
python manage.py runserver 0.0.0.0:8000
```

لفحص الجودة:

```powershell
cd D:\platform\backend
python scripts\quality_check.py
```

## 10. الخلاصة

حالة المشروع الآن Django نشط ومكتمل على مستوى التشغيل الأساسي والخدمات الرئيسية: CRUD، auth، media upload، AI، translation، export، permissions، migrations، والفحوصات. تم حذف كود FastAPI/Alembic القديم وتنظيف سكربتات الباكند، وتم حذف ملفات الحاويات بالكامل. المتبقي قبل إعلان جاهزية إنتاج نهائية هو اختبار الواجهات الأمامية ضد API الجديد وتجربة migration على نسخة staging من قاعدة البيانات القديمة.