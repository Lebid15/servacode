/**
 * =====================================================
 * الصفحة الجذرية
 * تحول المستخدم إلى اللغة الافتراضية المضبوطة من إعدادات الموقع.
 * =====================================================
 */

import { redirect } from "next/navigation";

import { getPublicSettings } from "@/shared/api/public-client";
import { isEnglishEnabled } from "@/shared/public/settings-utils";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  const settings = await getPublicSettings().catch(() => null);
  const defaultLocale = settings?.default_language === "en" && isEnglishEnabled(settings) ? "en" : "ar";

  redirect(`/${defaultLocale}`);
}
