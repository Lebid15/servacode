/**
 * =====================================================
 * Testing Notes
 * هذا الملف ليس اختبارًا فعليًا، بل مرجع خفيف لنقاط اختبار الواجهة.
 * الاختبارات الفعلية يمكن إضافتها لاحقًا باستخدام Playwright/Vitest.
 * =====================================================
 */

export const frontendQualityTargets = [
  "TypeScript strict mode must pass",
  "ESLint must pass with zero warnings",
  "Public routes should render in Arabic and English",
  "Admin routes should redirect unauthenticated users to login",
  "Theme switching should update data-theme",
  "Language switching should preserve route structure"
] as const;
