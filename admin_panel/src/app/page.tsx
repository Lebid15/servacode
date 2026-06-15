/**
 * =====================================================
 * الصفحة الجذرية للوحة الأدمن
 * تحول المستخدم إلى تسجيل الدخول
 * =====================================================
 */

import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/ar/admin/login");
}
