# المرحلة 7 — Frontend Foundation

تم تنفيذ المرحلة 7 فقط.

## ما تم إنجازه

- إنشاء مشروع Frontend أساسي بـ Next.js.
- تجهيز TypeScript.
- تجهيز Tailwind CSS.
- تجهيز App Router.
- تجهيز مسار لغات:
  - `/ar`
  - `/en`
- تجهيز i18n أولي:
  - `ar.json`
  - `en.json`
  - `get-dictionary.ts`
  - `i18n-provider.tsx`
- تجهيز Theme Provider.
- تجهيز ثيمين:
  - `blue-tech`
  - `emerald-luxury`
- تجهيز CSS Variables للثيمات.
- تجهيز Direction helpers.
- تجهيز API Client مركزي.
- تجهيز Auth Client.
- تجهيز Public Client.
- تجهيز Admin Client.
- تجهيز Design Tokens:
  - colors
  - spacing
  - typography
  - radius
  - shadows
  - breakpoints
  - transitions
- تجهيز مكونات مركزية:
  - AppButton
  - AppInput
  - AppTextarea
  - AppSelect
  - AppCard
  - AppBadge
  - AppPageHeader
  - AppTable
  - AppModal
  - AppEmptyState
  - AppLoadingState
  - AppErrorState
  - AppIcon
  - AppSkeleton
  - AppToast
  - AppPagination
  - AppConfirmDialog
- تجهيز Layout foundations:
  - PublicLayout
  - AdminLayout
  - Sidebar
  - Topbar
  - Footer

## ما لم يتم تنفيذه

- لم يتم تنفيذ Admin Panel Foundation بعد.
- لم يتم تنفيذ صفحات الأدمن.
- لم يتم تنفيذ صفحات الموقع العام النهائية.
- لم يتم تنفيذ النماذج الفعلية.
- لم يتم تنفيذ Auth Guard بعد.
- لم يتم تنفيذ Sidebar navigation الفعلي بعد.

هذه العناصر تبدأ من المرحلة 8 وما بعدها.

## أوامر التشغيل

```bash
cd public_site أو cd admin_panel حسب التطبيق
npm install
copy .env.example .env.local
npm run dev
```

ثم:

```text
http://localhost:3000/ar
http://localhost:3000/en
```

## حالة المرحلة

المرحلة 7 جاهزة للمراجعة.
