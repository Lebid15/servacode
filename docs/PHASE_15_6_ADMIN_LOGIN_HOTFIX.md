# Phase 15.6 — Admin Login Hotfix

## الهدف
إصلاح صعوبة دخول لوحة الأدمن في بيئة التطوير المحلية عندما يكون الباكند يعمل والحساب صحيحًا لكن الواجهة لا تنتقل إلى لوحة التحكم.

## التعديلات
- تحسين صفحة تسجيل الدخول لتخزين الجلسة بوضوح ثم الانتقال إلى الداشبورد مع fallback باستخدام `window.location.assign`.
- إظهار خطأ تسجيل الدخول الحقيقي القادم من API داخل الواجهة والـ Console بدل رسالة عامة فقط.
- جعل استرجاع جلسة الأدمن أكثر مرونة في بيئة التطوير؛ إذا تعذر تحديث بيانات المستخدم مؤقتًا تبقى الجلسة المحلية بدل الرجوع الفوري إلى صفحة الدخول.
- إضافة `next.config.ts` مع `allowedDevOrigins` لتخفيف تحذيرات WebSocket/HMR في Next.js أثناء التطوير على 127.0.0.1.
- تعديل سكربتات `package.json` لاستخدام npm في build/quality حتى لا يتعطل المستخدم بسبب pnpm.

## طريقة التشغيل بعد التطبيق
```powershell
cd D:\platform\admin_panel
Remove-Item -Recurse -Force .next,node_modules -ErrorAction SilentlyContinue
npm install
npm run dev
```

ثم افتح:

```text
http://127.0.0.1:3001/ar/admin/login
```

بيانات الدخول المحلية:

```text
admin
Admin12345!
```
