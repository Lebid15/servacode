/**
 * =====================================================
 * أنواع الثيمات المركزية
 * القيم هنا مطابقة للباكند وقاعدة البيانات حتى لا تفشل إعدادات الموقع.
 * =====================================================
 */

export type ThemeName = "blue-tech" | "emerald-luxury";

export type ThemeDefinition = {
  name: ThemeName;
  labelAr: string;
  labelEn: string;
};
