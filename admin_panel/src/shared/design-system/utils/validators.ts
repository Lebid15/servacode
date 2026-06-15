/**
 * =====================================================
 * أدوات تحقق مشتركة
 * تستخدم لاحقًا مع React Hook Form و Zod
 * =====================================================
 */

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
