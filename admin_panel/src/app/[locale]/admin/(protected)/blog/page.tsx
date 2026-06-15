/**
 * =====================================================
 * Blog module disabled
 * تم إلغاء قسم المقالات من لوحة الإدارة.
 * =====================================================
 */

import { notFound } from "next/navigation";

export default function DisabledAdminBlogPage() {
  notFound();
}
