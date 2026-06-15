/**
 * =====================================================
 * محتوى صفحات إعدادات لوحة الإدارة
 * =====================================================
 */

import { AdminSettingsPage } from "@/shared/admin/components/AdminSettingsPage";
import { getDictionary } from "@/shared/design-system/i18n/get-dictionary";
import type { Locale } from "@/shared/design-system/utils/direction";

export const settingsRouteTabs = [
  "identity",
  "contact",
  "social",
  "seo",
  "appearance",
  "maintenance",
] as const;

export type SettingsRouteTab = (typeof settingsRouteTabs)[number];

export function isSettingsRouteTab(value: string): value is SettingsRouteTab {
  return settingsRouteTabs.includes(value as SettingsRouteTab);
}

type SettingsPageContentProps = {
  locale: Locale;
  activeTab: SettingsRouteTab;
};

export async function SettingsPageContent({
  locale,
  activeTab,
}: SettingsPageContentProps) {
  const dict = await getDictionary(locale);
  const settingsLabels = dict.adminSettingsPage;

  return (
    <AdminSettingsPage
      title={dict.adminModules.settings.title}
      description={dict.adminModules.settings.description}
      activeTab={activeTab}
      basePath={`/${locale}/admin/settings`}
      labels={{
        loading: dict.table.loading,
        error: dict.table.unknown,
        save: dict.table.save,
        refresh: dict.table.refresh,
        open: dict.table.open,
        chooseFromLibrary: dict.table.chooseFromLibrary,
        clearMedia: dict.table.clearMedia,
        mediaPickerTitle: dict.table.mediaPickerTitle,
        mediaPickerDescription: dict.table.mediaPickerDescription,
        mediaPickerSearch: dict.table.mediaPickerSearch,
        mediaPickerEmptyTitle: dict.table.mediaPickerEmptyTitle,
        mediaPickerEmptyDescription: dict.table.mediaPickerEmptyDescription,
        uploadFromDevice: dict.table.uploadFromDevice,
        chooseFile: dict.table.chooseFile,
        upload: dict.table.upload,
        select: dict.table.select,

        siteNameAr: dict.fields.titleAr,
        siteNameEn: dict.fields.titleEn,
        email: dict.fields.email,
        phone: dict.fields.phone,
        whatsapp: dict.fields.whatsapp,
        logoUrl: dict.fields.logoUrl,
        faviconUrl: dict.fields.faviconUrl,
        theme: dict.fields.theme,
        language: dict.fields.language,
        seoTitleAr: dict.fields.seoTitleAr,
        seoTitleEn: dict.fields.seoTitleEn,
        seoDescriptionAr: dict.fields.seoDescriptionAr,
        seoDescriptionEn: dict.fields.seoDescriptionEn,

        ...settingsLabels,
      }}
    />
  );
}
