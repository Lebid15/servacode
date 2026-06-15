/**
 * =====================================================
 * تبويبات إعدادات لوحة الإدارة كصفحات مستقلة
 * =====================================================
 */

import { notFound } from "next/navigation";

import type { Locale } from "@/shared/design-system/utils/direction";

import {
  isSettingsRouteTab,
  SettingsPageContent,
  settingsRouteTabs,
} from "../SettingsPageContent";

type SettingsTabPageProps = {
  params: Promise<{
    locale: string;
    tab: string;
  }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return ["ar", "en"].flatMap((locale) =>
    settingsRouteTabs.map((tab) => ({ locale, tab }))
  );
}

export default async function SettingsTabPage({ params }: SettingsTabPageProps) {
  const { locale: rawLocale, tab } = await params;

  if (!isSettingsRouteTab(tab)) {
    notFound();
  }

  return <SettingsPageContent locale={rawLocale as Locale} activeTab={tab} />;
}
