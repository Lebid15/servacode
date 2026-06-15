"use client";

/**
 * =====================================================
 * AdminAppsPage
 * صفحة احترافية لإدارة تطبيقات الموقع العام وملفات التحميل
 * =====================================================
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type ReactNode, useMemo, useState } from "react";

import { AdminAiFieldButton } from "@/shared/admin/components/AdminAiFieldButton";
import { AdminAiImageButton } from "@/shared/admin/components/AdminAiImageButton";
import {
  AdminMediaPicker,
  type MediaPickerLabels,
} from "@/shared/admin/components/AdminMediaPicker";
import { useAdminAuth } from "@/shared/auth/AdminAuthProvider";
import { buildBackendAssetUrl, buildPublicSiteUrl } from "@/shared/api/api-client";
import {
  createAdminItem,
  deleteAdminItem,
  listAdminItems,
  restoreAdminApp,
  updateAdminItem,
} from "@/shared/api/admin-client";
import {
  AppBadge,
  type BadgeTone,
} from "@/shared/design-system/components/AppBadge";
import { AppButton } from "@/shared/design-system/components/AppButton";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppConfirmDialog } from "@/shared/design-system/components/AppConfirmDialog";
import { AppEmptyState } from "@/shared/design-system/components/AppEmptyState";
import { AppErrorState } from "@/shared/design-system/components/AppErrorState";
import { AppIcon } from "@/shared/design-system/components/AppIcon";
import { AppInput } from "@/shared/design-system/components/AppInput";
import { AppLoadingState } from "@/shared/design-system/components/AppLoadingState";
import { AppModal } from "@/shared/design-system/components/AppModal";
import { AppPageHeader } from "@/shared/design-system/components/AppPageHeader";
import { AppSelect } from "@/shared/design-system/components/AppSelect";
import { AppTable } from "@/shared/design-system/components/AppTable";
import { AppTextarea } from "@/shared/design-system/components/AppTextarea";
import type { AiGeneratedContent, AiTargetField } from "@/shared/api/ai-client";
import type { Locale } from "@/shared/design-system/utils/direction";

type TableLabels = {
  search: string;
  searchPlaceholder: string;
  create: string;
  edit: string;
  delete: string;
  refresh: string;
  actions: string;
  loading: string;
  emptyTitle: string;
  emptyDescription: string;
  save: string;
  close: string;
  confirmDelete: string;
  yesDelete: string;
  cancel: string;
  active: string;
  inactive: string;
  unknown: string;
  chooseFromLibrary: string;
  clearMedia: string;
  open: string;
  addItem: string;
  remove: string;
} & MediaPickerLabels;

type AdminAppsLabels = {
  title: string;
  description: string;
  createApp: string;
  editApp: string;
  preview: string;
  viewPublicPage: string;
  basicInfo: string;
  content: string;
  classification: string;
  media: string;
  downloads: string;
  appFeatures: string;
  screenshots: string;
  requirements: string;
  changelog: string;
  seo: string;
  publishing: string;
  all: string;
  active: string;
  inactive: string;
  deleted: string;
  featured: string;
  total: string;
  availableApps: string;
  hiddenApps: string;
  deletedApps: string;
  featuredApps: string;
  downloadFilesTotal: string;
  statusFilter: string;
  nameAr: string;
  nameEn: string;
  slugAr: string;
  slugEn: string;
  shortDescriptionAr: string;
  shortDescriptionEn: string;
  fullDescriptionAr: string;
  fullDescriptionEn: string;
  appType: string;
  platform: string;
  status: string;
  pricingType: string;
  version: string;
  latestReleaseAt: string;
  iconUrl: string;
  mainImageUrl: string;
  downloadUrl: string;
  liveUrl: string;
  supportUrl: string;
  privacyUrl: string;
  sortOrder: string;
  isActive: string;
  isFeatured: string;
  seoTitleAr: string;
  seoTitleEn: string;
  seoDescriptionAr: string;
  seoDescriptionEn: string;
  featuresCount: string;
  downloadsCount: string;
  screenshotsCount: string;
  addFeature: string;
  featureItem: string;
  featureTitleAr: string;
  featureTitleEn: string;
  featureDescriptionAr: string;
  featureDescriptionEn: string;
  addDownload: string;
  downloadItem: string;
  downloadLabelAr: string;
  downloadLabelEn: string;
  fileSize: string;
  releaseDate: string;
  addScreenshot: string;
  screenshotItem: string;
  imageUrl: string;
  altAr: string;
  altEn: string;
  addRequirement: string;
  requirementItem: string;
  requirementKey: string;
  requirementValue: string;
  addChangelog: string;
  releaseItem: string;
  releaseTitleAr: string;
  releaseTitleEn: string;
  releaseDescriptionAr: string;
  releaseDescriptionEn: string;
  restore: string;
  confirmRestore: string;
  yesRestore: string;
  requiredMessage: string;
  savedMessage: string;
  restoredMessage: string;
  deletedMessage: string;
  noImage: string;
  noFeatures: string;
  noDownloads: string;
  noScreenshots: string;
  noRequirements: string;
  noChangelog: string;
  slugHint: string;
  appTypeWeb: string;
  appTypeDesktop: string;
  appTypeMobile: string;
  appTypeTool: string;
  appTypeApi: string;
  appTypeOther: string;
  platformWeb: string;
  platformWindows: string;
  platformMacos: string;
  platformLinux: string;
  platformAndroid: string;
  platformIos: string;
  platformCrossPlatform: string;
  platformOther: string;
  statusAvailable: string;
  statusBeta: string;
  statusComingSoon: string;
  statusInDevelopment: string;
  statusHidden: string;
  pricingFree: string;
  pricingPaid: string;
  pricingFreemium: string;
  pricingContact: string;
};

type AppFeatureForm = {
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
};

type DownloadFileForm = {
  platform: string;
  label_ar: string;
  label_en: string;
  url: string;
  version: string;
  file_size: string;
  release_date: string;
};

type ScreenshotForm = {
  image_url: string;
  alt_ar: string;
  alt_en: string;
};

type RequirementForm = {
  key: string;
  value: string;
};

type ChangelogForm = {
  version: string;
  release_date: string;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
};

type AppFormState = {
  name_ar: string;
  name_en: string;
  slug_ar: string;
  slug_en: string;
  short_description_ar: string;
  short_description_en: string;
  full_description_ar: string;
  full_description_en: string;
  app_type: string;
  platform: string;
  status: string;
  pricing_type: string;
  icon_url: string;
  main_image_url: string;
  download_url: string;
  download_files: DownloadFileForm[];
  live_url: string;
  support_url: string;
  privacy_url: string;
  version: string;
  latest_release_at: string;
  features: AppFeatureForm[];
  screenshots: ScreenshotForm[];
  requirements: RequirementForm[];
  changelog: ChangelogForm[];
  seo_title_ar: string;
  seo_title_en: string;
  seo_description_ar: string;
  seo_description_en: string;
  sort_order: number;
  is_featured: boolean;
  is_active: boolean;
};

type AppRow = Record<string, unknown> & {
  id?: string;
  name_ar?: string;
  name_en?: string;
  slug_ar?: string;
  slug_en?: string;
  short_description_ar?: string;
  short_description_en?: string;
  full_description_ar?: string | null;
  full_description_en?: string | null;
  app_type?: string;
  platform?: string;
  status?: string;
  pricing_type?: string;
  icon_url?: string | null;
  main_image_url?: string | null;
  download_url?: string | null;
  download_files?: DownloadFileForm[];
  live_url?: string | null;
  support_url?: string | null;
  privacy_url?: string | null;
  version?: string | null;
  latest_release_at?: string | null;
  features?: AppFeatureForm[];
  screenshots?: ScreenshotForm[];
  requirements?: Record<string, unknown>;
  changelog?: ChangelogForm[];
  seo_title_ar?: string | null;
  seo_title_en?: string | null;
  seo_description_ar?: string | null;
  seo_description_en?: string | null;
  sort_order?: number;
  is_featured?: boolean;
  is_active?: boolean;
  is_deleted?: boolean;
  created_at?: string;
};

type StatusFilter = "all" | "active" | "inactive" | "deleted" | "featured";

const APPS_ENDPOINT = "/admin/apps";

const emptyFeature: AppFeatureForm = {
  title_ar: "",
  title_en: "",
  description_ar: "",
  description_en: "",
};

const emptyDownload: DownloadFileForm = {
  platform: "windows",
  label_ar: "",
  label_en: "",
  url: "",
  version: "",
  file_size: "",
  release_date: "",
};

const emptyScreenshot: ScreenshotForm = {
  image_url: "",
  alt_ar: "",
  alt_en: "",
};

const emptyRequirement: RequirementForm = {
  key: "",
  value: "",
};

const emptyChangelog: ChangelogForm = {
  version: "",
  release_date: "",
  title_ar: "",
  title_en: "",
  description_ar: "",
  description_en: "",
};

const emptyForm: AppFormState = {
  name_ar: "",
  name_en: "",
  slug_ar: "",
  slug_en: "",
  short_description_ar: "",
  short_description_en: "",
  full_description_ar: "",
  full_description_en: "",
  app_type: "web",
  platform: "web",
  status: "available",
  pricing_type: "free",
  icon_url: "",
  main_image_url: "",
  download_url: "",
  download_files: [],
  live_url: "",
  support_url: "",
  privacy_url: "",
  version: "",
  latest_release_at: "",
  features: [],
  screenshots: [],
  requirements: [],
  changelog: [],
  seo_title_ar: "",
  seo_title_en: "",
  seo_description_ar: "",
  seo_description_en: "",
  sort_order: 0,
  is_featured: false,
  is_active: true,
};

const DEFAULT_TABLE_LABELS: TableLabels = {
  search: "بحث",
  searchPlaceholder: "ابحث باسم التطبيق أو الرابط...",
  create: "إضافة",
  edit: "تعديل",
  delete: "حذف",
  refresh: "تحديث",
  actions: "الإجراءات",
  loading: "جاري التحميل...",
  emptyTitle: "لا توجد بيانات",
  emptyDescription: "لا توجد عناصر لعرضها حاليًا.",
  save: "حفظ",
  close: "إغلاق",
  confirmDelete: "هل تريد حذف هذا العنصر؟",
  yesDelete: "نعم، حذف",
  cancel: "إلغاء",
  active: "نشط",
  inactive: "غير نشط",
  unknown: "غير معروف",
  chooseFromLibrary: "اختيار من المكتبة",
  clearMedia: "إزالة الملف",
  open: "فتح",
  addItem: "إضافة عنصر",
  remove: "إزالة",
  mediaPickerTitle: "مكتبة الوسائط",
  mediaPickerDescription: "اختر ملفًا من مكتبة الوسائط.",
  mediaPickerSearch: "بحث في الوسائط",
  mediaPickerEmptyTitle: "لا توجد وسائط",
  mediaPickerEmptyDescription: "ارفع ملفًا جديدًا أو جرّب البحث بكلمة أخرى.",
  uploadFromDevice: "رفع من الجهاز",
  chooseFile: "اختيار ملف",
  upload: "رفع",
  select: "اختيار",
  error: "حدث خطأ",
};

const DEFAULT_APP_LABELS: AdminAppsLabels = {
  title: "تطبيقاتنا",
  description: "إدارة التطبيقات والأدوات الخدمية التي تظهر في الموقع العام.",
  createApp: "إضافة تطبيق",
  editApp: "تعديل تطبيق",
  preview: "معاينة التطبيق",
  viewPublicPage: "فتح صفحة التطبيق",
  basicInfo: "البيانات الأساسية",
  content: "المحتوى والوصف",
  classification: "التصنيف والمنصة",
  media: "الصور والروابط",
  downloads: "ملفات التحميل",
  appFeatures: "مميزات التطبيق",
  screenshots: "لقطات الشاشة",
  requirements: "متطلبات التشغيل",
  changelog: "سجل الإصدارات",
  seo: "SEO ومحركات البحث",
  publishing: "النشر والظهور",
  all: "الكل",
  active: "ظاهرة",
  inactive: "مخفية",
  deleted: "محذوفة",
  featured: "مميزة",
  total: "إجمالي التطبيقات",
  availableApps: "التطبيقات الظاهرة",
  hiddenApps: "التطبيقات المخفية",
  deletedApps: "التطبيقات المحذوفة",
  featuredApps: "التطبيقات المميزة",
  downloadFilesTotal: "ملفات التحميل",
  statusFilter: "فلتر الحالة",
  nameAr: "اسم التطبيق بالعربية",
  nameEn: "اسم التطبيق بالإنجليزية",
  slugAr: "رابط التطبيق بالعربية",
  slugEn: "رابط التطبيق بالإنجليزية",
  shortDescriptionAr: "الوصف المختصر بالعربية",
  shortDescriptionEn: "الوصف المختصر بالإنجليزية",
  fullDescriptionAr: "الوصف الكامل بالعربية",
  fullDescriptionEn: "الوصف الكامل بالإنجليزية",
  appType: "نوع التطبيق",
  platform: "المنصة",
  status: "الحالة",
  pricingType: "نوع التسعير",
  version: "الإصدار",
  latestReleaseAt: "تاريخ آخر إصدار",
  iconUrl: "أيقونة التطبيق",
  mainImageUrl: "الصورة الرئيسية",
  downloadUrl: "رابط التحميل المباشر",
  liveUrl: "رابط المعاينة",
  supportUrl: "رابط الدعم",
  privacyUrl: "رابط الخصوصية",
  sortOrder: "ترتيب الظهور",
  isActive: "إظهار في الموقع",
  isFeatured: "تطبيق مميز",
  seoTitleAr: "عنوان SEO عربي",
  seoTitleEn: "عنوان SEO إنجليزي",
  seoDescriptionAr: "وصف SEO عربي",
  seoDescriptionEn: "وصف SEO إنجليزي",
  featuresCount: "المميزات",
  downloadsCount: "ملفات التحميل",
  screenshotsCount: "الصور",
  addFeature: "إضافة ميزة",
  featureItem: "ميزة",
  featureTitleAr: "عنوان الميزة عربي",
  featureTitleEn: "عنوان الميزة إنجليزي",
  featureDescriptionAr: "وصف الميزة عربي",
  featureDescriptionEn: "وصف الميزة إنجليزي",
  addDownload: "إضافة ملف تحميل",
  downloadItem: "ملف تحميل",
  downloadLabelAr: "اسم الملف عربي",
  downloadLabelEn: "اسم الملف إنجليزي",
  fileSize: "حجم الملف",
  releaseDate: "تاريخ الإصدار",
  addScreenshot: "إضافة لقطة شاشة",
  screenshotItem: "لقطة شاشة",
  imageUrl: "رابط الصورة",
  altAr: "النص البديل عربي",
  altEn: "النص البديل إنجليزي",
  addRequirement: "إضافة متطلب",
  requirementItem: "متطلب",
  requirementKey: "اسم المتطلب",
  requirementValue: "قيمة المتطلب",
  addChangelog: "إضافة إصدار",
  releaseItem: "إصدار",
  releaseTitleAr: "عنوان الإصدار عربي",
  releaseTitleEn: "عنوان الإصدار إنجليزي",
  releaseDescriptionAr: "وصف الإصدار عربي",
  releaseDescriptionEn: "وصف الإصدار إنجليزي",
  restore: "استعادة",
  confirmRestore: "هل تريد استعادة هذا التطبيق؟",
  yesRestore: "نعم، استعادة",
  requiredMessage: "يرجى تعبئة الحقول الإلزامية قبل الحفظ.",
  savedMessage: "تم حفظ التطبيق بنجاح.",
  restoredMessage: "تمت استعادة التطبيق بنجاح.",
  deletedMessage: "تم حذف التطبيق بنجاح.",
  noImage: "لا توجد صورة",
  noFeatures: "لا توجد مميزات مضافة.",
  noDownloads: "لا توجد ملفات تحميل.",
  noScreenshots: "لا توجد لقطات شاشة.",
  noRequirements: "لا توجد متطلبات تشغيل.",
  noChangelog: "لا يوجد سجل إصدارات.",
  slugHint: "استخدم رابطًا قصيرًا وواضحًا بدون مسافات. مثال: desktop-client.",
  appTypeWeb: "تطبيق ويب",
  appTypeDesktop: "تطبيق سطح مكتب",
  appTypeMobile: "تطبيق جوال",
  appTypeTool: "أداة",
  appTypeApi: "واجهة API",
  appTypeOther: "أخرى",
  platformWeb: "ويب",
  platformWindows: "Windows",
  platformMacos: "macOS",
  platformLinux: "Linux",
  platformAndroid: "Android",
  platformIos: "iOS",
  platformCrossPlatform: "متعدد المنصات",
  platformOther: "أخرى",
  statusAvailable: "متاح",
  statusBeta: "Beta",
  statusComingSoon: "قريبًا",
  statusInDevelopment: "قيد التطوير",
  statusHidden: "مخفي",
  pricingFree: "مجاني",
  pricingPaid: "مدفوع",
  pricingFreemium: "مجاني مع ميزات مدفوعة",
  pricingContact: "حسب الطلب",
};

function toText(value: unknown) {
  return value === undefined || value === null ? "" : String(value);
}

function toNumber(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function dateForInput(value: unknown) {
  const text = toText(value);
  if (!text) {
    return "";
  }
  return text.slice(0, 10);
}

function normalizeFeature(value: unknown): AppFeatureForm {
  const source =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  return {
    title_ar: toText(source.title_ar),
    title_en: toText(source.title_en),
    description_ar: toText(source.description_ar),
    description_en: toText(source.description_en),
  };
}

function normalizeDownload(value: unknown): DownloadFileForm {
  const source =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  return {
    platform: toText(source.platform) || "windows",
    label_ar: toText(source.label_ar),
    label_en: toText(source.label_en),
    url: toText(source.url),
    version: toText(source.version),
    file_size: toText(source.file_size),
    release_date: dateForInput(source.release_date),
  };
}

function normalizeScreenshot(value: unknown): ScreenshotForm {
  const source =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  return {
    image_url: toText(source.image_url),
    alt_ar: toText(source.alt_ar),
    alt_en: toText(source.alt_en),
  };
}

function normalizeChangelog(value: unknown): ChangelogForm {
  const source =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  return {
    version: toText(source.version),
    release_date: dateForInput(source.release_date),
    title_ar: toText(source.title_ar),
    title_en: toText(source.title_en),
    description_ar: toText(source.description_ar),
    description_en: toText(source.description_en),
  };
}

function requirementsToList(value: unknown): RequirementForm[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [];
  }
  return Object.entries(value as Record<string, unknown>).map(
    ([key, item]) => ({ key, value: toText(item) }),
  );
}

function requirementsToObject(items: RequirementForm[]) {
  return items.reduce<Record<string, string>>((result, item) => {
    const key = item.key.trim();
    const value = item.value.trim();
    if (key && value) {
      result[key] = value;
    }
    return result;
  }, {});
}

function rowToForm(row: AppRow): AppFormState {
  return {
    name_ar: toText(row.name_ar),
    name_en: toText(row.name_en),
    slug_ar: toText(row.slug_ar),
    slug_en: toText(row.slug_en),
    short_description_ar: toText(row.short_description_ar),
    short_description_en: toText(row.short_description_en),
    full_description_ar: toText(row.full_description_ar),
    full_description_en: toText(row.full_description_en),
    app_type: toText(row.app_type) || "web",
    platform: toText(row.platform) || "web",
    status: toText(row.status) || "available",
    pricing_type: toText(row.pricing_type) || "free",
    icon_url: toText(row.icon_url),
    main_image_url: toText(row.main_image_url),
    download_url: toText(row.download_url),
    download_files: Array.isArray(row.download_files)
      ? row.download_files.map(normalizeDownload)
      : [],
    live_url: toText(row.live_url),
    support_url: toText(row.support_url),
    privacy_url: toText(row.privacy_url),
    version: toText(row.version),
    latest_release_at: dateForInput(row.latest_release_at),
    features: Array.isArray(row.features)
      ? row.features.map(normalizeFeature)
      : [],
    screenshots: Array.isArray(row.screenshots)
      ? row.screenshots.map(normalizeScreenshot)
      : [],
    requirements: requirementsToList(row.requirements),
    changelog: Array.isArray(row.changelog)
      ? row.changelog.map(normalizeChangelog)
      : [],
    seo_title_ar: toText(row.seo_title_ar),
    seo_title_en: toText(row.seo_title_en),
    seo_description_ar: toText(row.seo_description_ar),
    seo_description_en: toText(row.seo_description_en),
    sort_order: toNumber(row.sort_order),
    is_featured: Boolean(row.is_featured),
    is_active: row.is_active === undefined ? true : Boolean(row.is_active),
  };
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\u0600-\u06FFa-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function splitAiFeatureText(value: string) {
  const normalized = value.trim();
  const separators = [":", "：", " — ", " – ", " - "];

  for (const separator of separators) {
    const index = normalized.indexOf(separator);
    if (index > 0) {
      return {
        title: normalized.slice(0, index).trim(),
        description: normalized.slice(index + separator.length).trim(),
      };
    }
  }

  return { title: normalized, description: "" };
}

function nullableText(value: string) {
  const text = value.trim();
  return text ? text : null;
}

function nullableDateTime(value: string) {
  const text = value.trim();
  return text ? `${text}T00:00:00Z` : null;
}

function buildPayload(values: AppFormState) {
  const fallbackSlug =
    normalizeSlug(values.slug_ar || values.name_ar) || `app-${Date.now()}`;

  return {
    ...values,
    name_en: values.name_en.trim() || values.name_ar.trim(),
    short_description_en: values.short_description_en.trim() || values.short_description_ar.trim(),
    slug_ar: normalizeSlug(values.slug_ar || fallbackSlug),
    slug_en: normalizeSlug(values.slug_en || fallbackSlug),
    icon_url: nullableText(values.icon_url),
    main_image_url: nullableText(values.main_image_url),
    download_url: nullableText(values.download_url),
    live_url: nullableText(values.live_url),
    support_url: nullableText(values.support_url),
    privacy_url: nullableText(values.privacy_url),
    version: nullableText(values.version),
    latest_release_at: nullableDateTime(values.latest_release_at),
    full_description_ar: nullableText(values.full_description_ar),
    full_description_en: nullableText(values.full_description_en) || nullableText(values.full_description_ar),
    seo_title_ar: nullableText(values.seo_title_ar),
    seo_title_en: nullableText(values.seo_title_en) || nullableText(values.seo_title_ar),
    seo_description_ar: nullableText(values.seo_description_ar),
    seo_description_en: nullableText(values.seo_description_en) || nullableText(values.seo_description_ar),
    sort_order: Number(values.sort_order) || 0,
    is_featured: Boolean(values.is_featured),
    is_active: Boolean(values.is_active),
    download_files: values.download_files
      .filter((item) => item.url.trim())
      .map((item) => ({
        platform: item.platform,
        label_ar: item.label_ar.trim(),
        label_en: item.label_en.trim() || item.label_ar.trim(),
        url: item.url.trim(),
        version: item.version.trim() || null,
        file_size: item.file_size.trim() || null,
        release_date: item.release_date.trim() || null,
      })),
    features: values.features
      .filter((feature) => feature.title_ar.trim() || feature.title_en.trim())
      .map((feature) => ({
        title_ar: feature.title_ar.trim() || feature.title_en.trim(),
        title_en: feature.title_en.trim() || feature.title_ar.trim(),
        description_ar: feature.description_ar.trim() || null,
        description_en: feature.description_en.trim() || feature.description_ar.trim() || null,
      })),
    screenshots: values.screenshots
      .filter((screenshot) => screenshot.image_url.trim())
      .map((screenshot) => ({
        image_url: screenshot.image_url.trim(),
        alt_ar: screenshot.alt_ar.trim() || null,
        alt_en: screenshot.alt_en.trim() || screenshot.alt_ar.trim() || null,
      })),
    requirements: requirementsToObject(values.requirements),
    changelog: values.changelog
      .filter(
        (entry) =>
          entry.version.trim() ||
          entry.title_ar.trim() ||
          entry.title_en.trim(),
      )
      .map((entry) => ({
        version: entry.version.trim(),
        release_date: entry.release_date.trim() || null,
        title_ar: entry.title_ar.trim() || entry.title_en.trim(),
        title_en: entry.title_en.trim() || entry.title_ar.trim(),
        description_ar: entry.description_ar.trim() || null,
        description_en: entry.description_en.trim() || entry.description_ar.trim() || null,
      })),
  };
}

function validate(values: AppFormState, labels: AdminAppsLabels) {
  const required = [values.name_ar, values.short_description_ar];

  if (required.some((value) => !value.trim())) {
    return labels.requiredMessage;
  }

  const invalidFeature = values.features.some(
    (feature) =>
      (feature.title_ar.trim() || feature.title_en.trim()) &&
      !feature.title_ar.trim() &&
      !feature.title_en.trim(),
  );
  if (invalidFeature) {
    return labels.requiredMessage;
  }

  const invalidDownload = values.download_files.some(
    (download) => download.url.trim() && !download.label_ar.trim() && !download.label_en.trim(),
  );
  if (invalidDownload) {
    return labels.requiredMessage;
  }

  return null;
}

function appTitle(row: AppRow, locale: Locale) {
  const primary = locale === "ar" ? row.name_ar : row.name_en;
  const fallback = locale === "ar" ? row.name_en : row.name_ar;
  return toText(primary || fallback || "—");
}

function publicSlug(row: AppRow, locale: Locale) {
  return toText(
    locale === "ar" ? row.slug_ar || row.slug_en : row.slug_en || row.slug_ar,
  );
}

function statusTone(row: AppRow): BadgeTone {
  if (row.is_deleted) {
    return "danger";
  }
  if (!row.is_active || row.status === "hidden") {
    return "neutral";
  }
  if (row.status === "coming_soon" || row.status === "in_development") {
    return "warning";
  }
  return "success";
}

function appStatusLabel(status: unknown, labels: AdminAppsLabels) {
  const value = toText(status);
  const map: Record<string, string> = {
    available: labels.statusAvailable,
    beta: labels.statusBeta,
    coming_soon: labels.statusComingSoon,
    in_development: labels.statusInDevelopment,
    hidden: labels.statusHidden,
  };
  return map[value] ?? (value || labels.statusAvailable);
}

function appPlatformLabel(platform: unknown, labels: AdminAppsLabels) {
  const value = toText(platform);
  const map: Record<string, string> = {
    web: labels.platformWeb,
    windows: labels.platformWindows,
    macos: labels.platformMacos,
    linux: labels.platformLinux,
    android: labels.platformAndroid,
    ios: labels.platformIos,
    cross_platform: labels.platformCrossPlatform,
    other: labels.platformOther,
  };
  return map[value] ?? (value || labels.platformWeb);
}

function appPricingLabel(pricing: unknown, labels: AdminAppsLabels) {
  const value = toText(pricing);
  const map: Record<string, string> = {
    free: labels.pricingFree,
    paid: labels.pricingPaid,
    freemium: labels.pricingFreemium,
    contact: labels.pricingContact,
  };
  return map[value] ?? (value || labels.pricingFree);
}


function mediaValue(value: string, fallback: string) {
  return value || fallback;
}

function MediaUrlField({
  value,
  label,
  token,
  tableLabels,
  imagesOnly = false,
  onChange,
  aiAction,
}: {
  value: string;
  label: string;
  token: string;
  tableLabels: TableLabels;
  imagesOnly?: boolean;
  onChange: (value: string) => void;
  aiAction?: ReactNode;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const previewUrl = buildBackendAssetUrl(value);
  const isImageLike = /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(value);

  return (
    <div className="grid gap-2 md:col-span-2">
      {imagesOnly ? (
        <span className="flex min-h-6 items-center justify-between gap-2 text-sm font-medium text-app-foreground">
          <span>{label}</span>
        </span>
      ) : (
        <AppInput
          label={label}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      <div className="flex flex-wrap gap-2">
        <AppButton
          type="button"
          variant="secondary"
          className="min-h-9 px-3"
          onClick={() => setPickerOpen(true)}
          icon={<AppIcon name="media" size={16} />}
        >
          {tableLabels.chooseFromLibrary}
        </AppButton>
        {aiAction}
        {value ? (
          <AppButton
            type="button"
            variant="ghost"
            className="min-h-9 px-3"
            onClick={() => onChange("")}
          >
            {tableLabels.clearMedia}
          </AppButton>
        ) : null}
      </div>
      {value ? (
        <div className="flex items-center gap-3 rounded-appMd border border-app-border bg-app-surface px-3 py-2 text-xs text-app-muted">
          <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-appSm border border-app-border bg-app-surfaceElevated">
            {isImageLike ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <AppIcon name="file" size={16} />
            )}
          </div>
          <span className="min-w-0 flex-1 truncate">{value}</span>
          <AppButton
            type="button"
            variant="ghost"
            className="min-h-8 px-2"
            onClick={() =>
              window.open(previewUrl, "_blank", "noopener,noreferrer")
            }
          >
            {tableLabels.open}
          </AppButton>
        </div>
      ) : null}
      <AdminMediaPicker
        open={pickerOpen}
        token={token}
        labels={tableLabels}
        imagesOnly={imagesOnly}
        onClose={() => setPickerOpen(false)}
        onSelect={onChange}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: BadgeTone;
}) {
  return (
    <AppCard className="grid gap-2 p-4">
      <AppBadge tone={tone} className="w-fit">
        {label}
      </AppBadge>
      <strong className="text-2xl font-black text-app-foreground">
        {value}
      </strong>
    </AppCard>
  );
}

function SelectOptions({
  options,
}: {
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </>
  );
}

type AdminAppsPageProps = {
  locale: Locale;
  labels?: Partial<AdminAppsLabels>;
  tableLabels?: Partial<TableLabels>;
};

export function AdminAppsPage({
  locale,
  labels: labelsInput,
  tableLabels: tableLabelsInput,
}: AdminAppsPageProps) {
  const labels: AdminAppsLabels = {
    ...DEFAULT_APP_LABELS,
    ...(labelsInput ?? {}),
  };
  const tableLabels: TableLabels = {
    ...DEFAULT_TABLE_LABELS,
    ...(tableLabelsInput ?? {}),
  };
  const queryClient = useQueryClient();
  const { tokens } = useAdminAuth();
  const token = tokens?.access_token ?? "";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [formValues, setFormValues] = useState<AppFormState>(emptyForm);
  const [editingRow, setEditingRow] = useState<AppRow | null>(null);
  const [deleteRow, setDeleteRow] = useState<AppRow | null>(null);
  const [restoreRow, setRestoreRow] = useState<AppRow | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [pageMessage, setPageMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryKey = [APPS_ENDPOINT, search, "with-deleted"];
  const query = useQuery({
    queryKey,
    queryFn: () =>
      listAdminItems(APPS_ENDPOINT, {
        token,
        search,
        skip: 0,
        limit: 100,
        includeDeleted: true,
      }),
    enabled: Boolean(token),
  });

  const allRows = ((query.data ?? []) as AppRow[])
    .slice()
    .sort((first, second) => {
      const firstOrder = toNumber(first.sort_order);
      const secondOrder = toNumber(second.sort_order);
      if (firstOrder !== secondOrder) {
        return firstOrder - secondOrder;
      }
      return toText(second.created_at).localeCompare(toText(first.created_at));
    });

  const filteredRows = useMemo(() => {
    return allRows.filter((row) => {
      if (statusFilter === "active") {
        return !row.is_deleted && row.is_active && row.status !== "hidden";
      }
      if (statusFilter === "inactive") {
        return !row.is_deleted && (!row.is_active || row.status === "hidden");
      }
      if (statusFilter === "deleted") {
        return Boolean(row.is_deleted);
      }
      if (statusFilter === "featured") {
        return !row.is_deleted && Boolean(row.is_featured);
      }
      return true;
    });
  }, [allRows, statusFilter]);

  const stats = useMemo(() => {
    const notDeleted = allRows.filter((row) => !row.is_deleted);
    return {
      total: notDeleted.length,
      available: notDeleted.filter(
        (row) => row.is_active && row.status !== "hidden",
      ).length,
      hidden: notDeleted.filter(
        (row) => !row.is_active || row.status === "hidden",
      ).length,
      deleted: allRows.filter((row) => row.is_deleted).length,
      featured: notDeleted.filter((row) => row.is_featured).length,
      downloads: allRows.reduce(
        (total, row) =>
          total +
          (Array.isArray(row.download_files) ? row.download_files.length : 0) +
          (row.download_url ? 1 : 0),
        0,
      ),
    };
  }, [allRows]);

  const appTypeOptions = [
    { value: "web", label: labels.appTypeWeb },
    { value: "desktop", label: labels.appTypeDesktop },
    { value: "mobile", label: labels.appTypeMobile },
    { value: "tool", label: labels.appTypeTool },
    { value: "api", label: labels.appTypeApi },
    { value: "other", label: labels.appTypeOther },
  ];

  const platformOptions = [
    { value: "web", label: labels.platformWeb },
    { value: "windows", label: labels.platformWindows },
    { value: "macos", label: labels.platformMacos },
    { value: "linux", label: labels.platformLinux },
    { value: "android", label: labels.platformAndroid },
    { value: "ios", label: labels.platformIos },
    { value: "cross_platform", label: labels.platformCrossPlatform },
    { value: "other", label: labels.platformOther },
  ];

  const statusOptions = [
    { value: "available", label: labels.statusAvailable },
    { value: "beta", label: labels.statusBeta },
    { value: "coming_soon", label: labels.statusComingSoon },
    { value: "in_development", label: labels.statusInDevelopment },
    { value: "hidden", label: labels.statusHidden },
  ];

  const pricingOptions = [
    { value: "free", label: labels.pricingFree },
    { value: "paid", label: labels.pricingPaid },
    { value: "freemium", label: labels.pricingFreemium },
    { value: "contact", label: labels.pricingContact },
  ];

  const updateField = <K extends keyof AppFormState>(
    key: K,
    value: AppFormState[K],
  ) => {
    setFormValues((current) => ({ ...current, [key]: value }));
  };

  const applyAiContent = (
    targetField: AiTargetField,
    content: AiGeneratedContent,
  ) => {
    setFormValues((current) => {
      const next: AppFormState = { ...current };

      if (targetField === "improved_title_ar" && content.improved_title_ar) {
        next.name_ar = content.improved_title_ar;
        next.name_en = content.title_en || current.name_en;
      }
      if (targetField === "slug" && content.slug) {
        next.slug_ar = normalizeSlug(content.slug);
        next.slug_en = normalizeSlug(content.slug);
      }
      if (
        targetField === "short_description_ar" &&
        content.short_description_ar
      ) {
        next.short_description_ar = content.short_description_ar;
        next.short_description_en =
          content.short_description_en || current.short_description_en;
      }
      if (
        targetField === "full_description_ar" &&
        content.full_description_ar
      ) {
        next.full_description_ar = content.full_description_ar;
        next.full_description_en =
          content.full_description_en || current.full_description_en;
      }
      if (targetField === "seo_title_ar" && content.seo_title_ar) {
        next.seo_title_ar = content.seo_title_ar;
        next.seo_title_en = content.seo_title_en || current.seo_title_en;
      }
      if (targetField === "seo_description_ar" && content.seo_description_ar) {
        next.seo_description_ar = content.seo_description_ar;
        next.seo_description_en =
          content.seo_description_en || current.seo_description_en;
      }
      if (targetField === "features_ar" && content.features_ar.length > 0) {
        next.features = content.features_ar.map((feature) => {
          const parsedFeature = splitAiFeatureText(feature);
          return {
            title_ar: parsedFeature.title,
            title_en: "",
            description_ar: parsedFeature.description,
            description_en: "",
          };
        });
      }

      return next;
    });
  };

  const aiButton = (targetField: AiTargetField, label = "توليد") => (
    <AdminAiFieldButton
      token={token}
      entityType="app"
      targetField={targetField}
      titleAr={formValues.name_ar}
      shortDescriptionAr={formValues.short_description_ar}
      fullDescriptionAr={formValues.full_description_ar}
      contextAr={formValues.app_type}
      label={label}
      onApply={(content) => applyAiContent(targetField, content)}
    />
  );

  const aiImageButton = (imageKind: "image" | "icon", onApply: (url: string) => void, label?: string) => (
    <AdminAiImageButton
      token={token}
      entityType="app"
      imageKind={imageKind}
      titleAr={formValues.name_ar}
      shortDescriptionAr={formValues.short_description_ar}
      fullDescriptionAr={formValues.full_description_ar}
      contextAr={formValues.platform}
      label={label}
      onApply={onApply}
    />
  );

  const featureAiButton = (
    index: number,
    feature: AppFeatureForm,
    field: "title" | "description",
  ) => (
    <AdminAiFieldButton
      token={token}
      entityType="app"
      targetField="features_ar"
      titleAr={feature.title_ar || formValues.name_ar}
      shortDescriptionAr={feature.description_ar || formValues.short_description_ar}
      fullDescriptionAr={formValues.full_description_ar}
      contextAr={formValues.platform}
      label="توليد"
      extraInstructions={
        field === "title"
          ? "ولّد عنوانًا عربيًا قصيرًا وواضحًا لميزة واحدة فقط في هذا التطبيق. أعد النص بصيغة: عنوان الميزة: وصف قصير."
          : `ولّد وصفًا عربيًا عمليًا ومختصرًا لهذه الميزة فقط. عنوان الميزة الحالي: ${feature.title_ar || "غير محدد"}. أعد النص بصيغة: عنوان الميزة: وصف قصير.`
      }
      onApply={(content) => {
        const generatedText =
          content.features_ar[0] ||
          content.short_description_ar ||
          content.full_description_ar ||
          "";
        const parsedFeature = splitAiFeatureText(generatedText);

        if (field === "title") {
          updateFeature(index, "title_ar", parsedFeature.title || generatedText);
          if (parsedFeature.description && !feature.description_ar.trim()) {
            updateFeature(index, "description_ar", parsedFeature.description);
          }
          return;
        }

        updateFeature(
          index,
          "description_ar",
          parsedFeature.description || parsedFeature.title || generatedText,
        );
      }}
    />
  );

  const openCreate = () => {
    setPageMessage(null);
    setFormError(null);
    setEditingRow(null);
    setFormValues(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (row: AppRow) => {
    setPageMessage(null);
    setFormError(null);
    setEditingRow(row);
    setFormValues(rowToForm(row));
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setFormError(null);
    setEditingRow(null);
    setFormValues(emptyForm);
  };

  const refetch = async () => {
    await queryClient.invalidateQueries({ queryKey });
    await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
  };

  const handleSave = async () => {
    const validationError = validate(formValues, labels);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const payload = buildPayload(formValues);
      if (editingRow?.id) {
        await updateAdminItem(
          `${APPS_ENDPOINT}/${editingRow.id}`,
          token,
          payload,
        );
      } else {
        await createAdminItem(APPS_ENDPOINT, token, payload);
      }
      setPageMessage(labels.savedMessage);
      await refetch();
      closeForm();
    } catch (exception) {
      setFormError(
        exception instanceof Error ? exception.message : tableLabels.unknown,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteRow?.id) {
      return;
    }

    try {
      await deleteAdminItem(`${APPS_ENDPOINT}/${deleteRow.id}`, token);
      setPageMessage(labels.deletedMessage);
      setDeleteRow(null);
      await refetch();
    } catch (exception) {
      setPageMessage(
        exception instanceof Error ? exception.message : tableLabels.unknown,
      );
    }
  };

  const handleRestore = async () => {
    if (!restoreRow?.id) {
      return;
    }

    try {
      await restoreAdminApp(token, restoreRow.id);
      setPageMessage(labels.restoredMessage);
      setRestoreRow(null);
      await refetch();
    } catch (exception) {
      setPageMessage(
        exception instanceof Error ? exception.message : tableLabels.unknown,
      );
    }
  };

  const updateFeature = (
    index: number,
    key: keyof AppFeatureForm,
    value: AppFeatureForm[keyof AppFeatureForm],
  ) => {
    updateField(
      "features",
      formValues.features.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    );
  };

  const updateDownload = (
    index: number,
    key: keyof DownloadFileForm,
    value: DownloadFileForm[keyof DownloadFileForm],
  ) => {
    updateField(
      "download_files",
      formValues.download_files.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    );
  };

  const updateScreenshot = (
    index: number,
    key: keyof ScreenshotForm,
    value: ScreenshotForm[keyof ScreenshotForm],
  ) => {
    updateField(
      "screenshots",
      formValues.screenshots.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    );
  };

  const updateRequirement = (
    index: number,
    key: keyof RequirementForm,
    value: RequirementForm[keyof RequirementForm],
  ) => {
    updateField(
      "requirements",
      formValues.requirements.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    );
  };

  const updateChangelog = (
    index: number,
    key: keyof ChangelogForm,
    value: ChangelogForm[keyof ChangelogForm],
  ) => {
    updateField(
      "changelog",
      formValues.changelog.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    );
  };

  const previewTitle =
    locale === "ar"
      ? formValues.name_ar || formValues.name_en
      : formValues.name_en || formValues.name_ar;
  const previewDescription =
    locale === "ar"
      ? formValues.short_description_ar || formValues.short_description_en
      : formValues.short_description_en || formValues.short_description_ar;
  const previewImage = buildBackendAssetUrl(
    mediaValue(formValues.main_image_url, formValues.icon_url),
  );

  return (
    <div className="grid gap-6">
      <AppPageHeader
        eyebrow={labels.preview}
        title={labels.title}
        description={labels.description}
        actions={
          <>
            <AppButton
              variant="secondary"
              onClick={() => query.refetch()}
              icon={<AppIcon name="refresh" size={17} />}
            >
              {tableLabels.refresh}
            </AppButton>
            <AppButton
              onClick={openCreate}
              icon={<AppIcon name="plus" size={17} />}
            >
              {labels.createApp}
            </AppButton>
          </>
        }
      />

      {pageMessage ? (
        <AppCard className="border-app-primary/30 bg-app-primary/10 p-4 text-sm font-semibold text-app-primary">
          {pageMessage}
        </AppCard>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label={labels.total} value={stats.total} tone="primary" />
        <StatCard
          label={labels.availableApps}
          value={stats.available}
          tone="success"
        />
        <StatCard
          label={labels.hiddenApps}
          value={stats.hidden}
          tone="neutral"
        />
        <StatCard
          label={labels.deletedApps}
          value={stats.deleted}
          tone="danger"
        />
        <StatCard
          label={labels.featuredApps}
          value={stats.featured}
          tone="warning"
        />
        <StatCard
          label={labels.downloadFilesTotal}
          value={stats.downloads}
          tone="primary"
        />
      </div>

      <AppCard className="grid gap-4 p-4 md:grid-cols-[1fr_240px_auto] md:items-end md:p-5">
        <AppInput
          label={tableLabels.search}
          placeholder={tableLabels.searchPlaceholder}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <AppSelect
          label={labels.statusFilter}
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as StatusFilter)
          }
        >
          <option value="all">{labels.all}</option>
          <option value="active">{labels.active}</option>
          <option value="inactive">{labels.inactive}</option>
          <option value="featured">{labels.featured}</option>
          <option value="deleted">{labels.deleted}</option>
        </AppSelect>
        <AppButton
          variant="secondary"
          onClick={() => query.refetch()}
          icon={<AppIcon name="refresh" size={17} />}
        >
          {tableLabels.refresh}
        </AppButton>
      </AppCard>

      <AppCard className="p-4 md:p-5">
        {query.isLoading ? (
          <AppLoadingState text={tableLabels.loading} />
        ) : null}
        {query.isError ? (
          <AppErrorState
            title={tableLabels.unknown}
            description={String(query.error)}
          />
        ) : null}

        {!query.isLoading && !query.isError && filteredRows.length === 0 ? (
          <AppEmptyState
            title={tableLabels.emptyTitle}
            description={tableLabels.emptyDescription}
            icon="apps"
          />
        ) : null}

        {!query.isLoading && !query.isError && filteredRows.length > 0 ? (
          <AppTable
            rows={filteredRows}
            getRowKey={(row) => String(row.id)}
            columns={[
              {
                key: "app",
                header: labels.title,
                render: (row) => (
                  <div className="flex min-w-72 items-center gap-3">
                    <div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-appMd border border-app-border bg-app-surfaceElevated text-app-primary">
                      {row.icon_url || row.main_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={buildBackendAssetUrl(
                            toText(row.icon_url || row.main_image_url),
                          )}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <AppIcon name="apps" size={19} />
                      )}
                    </div>
                    <div className="grid min-w-0 gap-1">
                      <strong className="truncate text-sm text-app-foreground">
                        {appTitle(row, locale)}
                      </strong>
                      <span className="truncate text-xs text-app-muted">
                        {publicSlug(row, locale)}
                      </span>
                    </div>
                  </div>
                ),
              },
              {
                key: "platform",
                header: labels.platform,
                render: (row) => (
                  <AppBadge tone="primary">
                    {appPlatformLabel(row.platform, labels)}
                  </AppBadge>
                ),
              },
              {
                key: "pricing_type",
                header: labels.pricingType,
                render: (row) => (
                  <AppBadge tone="neutral">
                    {appPricingLabel(row.pricing_type, labels)}
                  </AppBadge>
                ),
              },
              {
                key: "downloads",
                header: labels.downloadsCount,
                render: (row) => (
                  <AppBadge tone="warning">
                    {(Array.isArray(row.download_files)
                      ? row.download_files.length
                      : 0) + (row.download_url ? 1 : 0)}
                  </AppBadge>
                ),
              },
              {
                key: "status",
                header: labels.status,
                render: (row) => (
                  <AppBadge tone={statusTone(row)}>
                    {row.is_deleted
                      ? labels.deleted
                      : appStatusLabel(row.status, labels)}
                  </AppBadge>
                ),
              },
              {
                key: "actions",
                header: tableLabels.actions,
                render: (row) => {
                  const slug = publicSlug(row, locale);
                  return (
                    <div className="flex flex-wrap gap-2">
                      {slug && !row.is_deleted ? (
                        <AppButton
                          variant="ghost"
                          className="min-h-9 px-3"
                          onClick={() =>
                            window.open(
                              buildPublicSiteUrl(locale, "apps", slug),
                              "_blank",
                              "noopener,noreferrer",
                            )
                          }
                          icon={<AppIcon name="external" size={15} />}
                        >
                          {labels.viewPublicPage}
                        </AppButton>
                      ) : null}
                      {!row.is_deleted ? (
                        <AppButton
                          variant="secondary"
                          className="min-h-9 px-3"
                          onClick={() => openEdit(row)}
                          icon={<AppIcon name="edit" size={15} />}
                        >
                          {tableLabels.edit}
                        </AppButton>
                      ) : null}
                      {row.is_deleted ? (
                        <AppButton
                          variant="secondary"
                          className="min-h-9 px-3"
                          onClick={() => setRestoreRow(row)}
                          icon={<AppIcon name="refresh" size={15} />}
                        >
                          {labels.restore}
                        </AppButton>
                      ) : (
                        <AppButton
                          variant="danger"
                          className="min-h-9 px-3"
                          onClick={() => setDeleteRow(row)}
                          icon={<AppIcon name="trash" size={15} />}
                        >
                          {tableLabels.delete}
                        </AppButton>
                      )}
                    </div>
                  );
                },
              },
            ]}
          />
        ) : null}
      </AppCard>

      <AppModal
        open={formOpen}
        title={editingRow ? labels.editApp : labels.createApp}
        onClose={closeForm}
        size="xl"
      >
        <div className="grid gap-5">
          {formError ? (
            <AppErrorState
              title={tableLabels.unknown}
              description={formError}
            />
          ) : null}

          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="grid gap-4">
              <AppCard className="grid gap-4 p-4">
                <h3 className="text-base font-black text-app-foreground">
                  {labels.basicInfo}
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <AppInput
                    label={labels.nameAr}
                    required
                    value={formValues.name_ar}
                    onChange={(event) =>
                      updateField("name_ar", event.target.value)
                    }
                    labelAction={aiButton("improved_title_ar")}
                  />
                  <AppInput
                    label={labels.nameEn}
                    required
                    value={formValues.name_en}
                    onChange={(event) =>
                      updateField("name_en", event.target.value)
                    }
                  />
                </div>
              </AppCard>

              <AppCard className="grid gap-4 p-4">
                <h3 className="text-base font-black text-app-foreground">
                  {labels.content}
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <AppTextarea
                    label={labels.shortDescriptionAr}
                    required
                    value={formValues.short_description_ar}
                    onChange={(event) =>
                      updateField("short_description_ar", event.target.value)
                    }
                    labelAction={aiButton("short_description_ar")}
                  />
                  <AppTextarea
                    label={labels.shortDescriptionEn}
                    required
                    value={formValues.short_description_en}
                    onChange={(event) =>
                      updateField("short_description_en", event.target.value)
                    }
                  />
                  <AppTextarea
                    label={labels.fullDescriptionAr}
                    value={formValues.full_description_ar}
                    onChange={(event) =>
                      updateField("full_description_ar", event.target.value)
                    }
                    labelAction={aiButton("full_description_ar")}
                  />
                  <AppTextarea
                    label={labels.fullDescriptionEn}
                    value={formValues.full_description_en}
                    onChange={(event) =>
                      updateField("full_description_en", event.target.value)
                    }
                  />
                </div>
              </AppCard>

              <AppCard className="grid gap-4 p-4">
                <h3 className="text-base font-black text-app-foreground">
                  {labels.classification}
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <AppSelect
                    label={labels.appType}
                    value={formValues.app_type}
                    onChange={(event) =>
                      updateField("app_type", event.target.value)
                    }
                  >
                    <SelectOptions options={appTypeOptions} />
                  </AppSelect>
                  <AppSelect
                    label={labels.platform}
                    value={formValues.platform}
                    onChange={(event) =>
                      updateField("platform", event.target.value)
                    }
                  >
                    <SelectOptions options={platformOptions} />
                  </AppSelect>
                  <AppSelect
                    label={labels.status}
                    value={formValues.status}
                    onChange={(event) =>
                      updateField("status", event.target.value)
                    }
                  >
                    <SelectOptions options={statusOptions} />
                  </AppSelect>
                  <AppSelect
                    label={labels.pricingType}
                    value={formValues.pricing_type}
                    onChange={(event) =>
                      updateField("pricing_type", event.target.value)
                    }
                  >
                    <SelectOptions options={pricingOptions} />
                  </AppSelect>
                  <AppInput
                    label={labels.version}
                    value={formValues.version}
                    onChange={(event) =>
                      updateField("version", event.target.value)
                    }
                  />
                  <AppInput
                    label={labels.latestReleaseAt}
                    type="date"
                    value={formValues.latest_release_at}
                    onChange={(event) =>
                      updateField("latest_release_at", event.target.value)
                    }
                  />
                </div>
              </AppCard>

              <AppCard className="grid gap-4 p-4">
                <h3 className="text-base font-black text-app-foreground">
                  {labels.media}
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <MediaUrlField
                    value={formValues.icon_url}
                    label={labels.iconUrl}
                    token={token}
                    tableLabels={tableLabels}
                    imagesOnly
                    onChange={(value) => updateField("icon_url", value)}
                    aiAction={aiImageButton("icon", (url) => updateField("icon_url", url), "توليد أيقونة")}
                  />
                  <MediaUrlField
                    value={formValues.main_image_url}
                    label={labels.mainImageUrl}
                    token={token}
                    tableLabels={tableLabels}
                    imagesOnly
                    onChange={(value) => updateField("main_image_url", value)}
                    aiAction={aiImageButton("image", (url) => updateField("main_image_url", url), "توليد صورة")}
                  />
                  <MediaUrlField
                    value={formValues.download_url}
                    label={labels.downloadUrl}
                    token={token}
                    tableLabels={tableLabels}
                    onChange={(value) => updateField("download_url", value)}
                  />
                  <AppInput
                    label={labels.liveUrl}
                    value={formValues.live_url}
                    onChange={(event) =>
                      updateField("live_url", event.target.value)
                    }
                  />
                  <AppInput
                    label={labels.supportUrl}
                    value={formValues.support_url}
                    onChange={(event) =>
                      updateField("support_url", event.target.value)
                    }
                  />
                  <AppInput
                    label={labels.privacyUrl}
                    value={formValues.privacy_url}
                    onChange={(event) =>
                      updateField("privacy_url", event.target.value)
                    }
                  />
                </div>
              </AppCard>

              <AppCard className="grid gap-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-base font-black text-app-foreground">
                    {labels.downloads}
                  </h3>
                  <AppButton
                    variant="secondary"
                    className="min-h-9 px-3"
                    onClick={() =>
                      updateField("download_files", [
                        ...formValues.download_files,
                        { ...emptyDownload },
                      ])
                    }
                    icon={<AppIcon name="plus" size={16} />}
                  >
                    {labels.addDownload}
                  </AppButton>
                </div>
                {formValues.download_files.length === 0 ? (
                  <p className="text-sm text-app-muted">{labels.noDownloads}</p>
                ) : null}
                <div className="grid gap-3">
                  {formValues.download_files.map((download, index) => (
                    <AppCard key={index} className="grid gap-4 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <AppBadge tone="primary">
                          {labels.downloadItem} #{index + 1}
                        </AppBadge>
                        <AppButton
                          variant="danger"
                          className="min-h-8 px-3"
                          onClick={() =>
                            updateField(
                              "download_files",
                              formValues.download_files.filter(
                                (_, itemIndex) => itemIndex !== index,
                              ),
                            )
                          }
                          icon={<AppIcon name="trash" size={15} />}
                        >
                          {tableLabels.remove}
                        </AppButton>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <AppSelect
                          label={labels.platform}
                          value={download.platform}
                          onChange={(event) =>
                            updateDownload(
                              index,
                              "platform",
                              event.target.value,
                            )
                          }
                        >
                          <SelectOptions options={platformOptions} />
                        </AppSelect>
                        <AppInput
                          label={labels.version}
                          value={download.version}
                          onChange={(event) =>
                            updateDownload(index, "version", event.target.value)
                          }
                        />
                        <AppInput
                          label={labels.downloadLabelAr}
                          required
                          value={download.label_ar}
                          onChange={(event) =>
                            updateDownload(
                              index,
                              "label_ar",
                              event.target.value,
                            )
                          }
                        />
                        <AppInput
                          label={labels.downloadLabelEn}
                          required
                          value={download.label_en}
                          onChange={(event) =>
                            updateDownload(
                              index,
                              "label_en",
                              event.target.value,
                            )
                          }
                        />
                        <MediaUrlField
                          value={download.url}
                          label={labels.downloadUrl}
                          token={token}
                          tableLabels={tableLabels}
                          onChange={(value) =>
                            updateDownload(index, "url", value)
                          }
                        />
                        <AppInput
                          label={labels.fileSize}
                          value={download.file_size}
                          onChange={(event) =>
                            updateDownload(
                              index,
                              "file_size",
                              event.target.value,
                            )
                          }
                        />
                        <AppInput
                          label={labels.releaseDate}
                          type="date"
                          value={download.release_date}
                          onChange={(event) =>
                            updateDownload(
                              index,
                              "release_date",
                              event.target.value,
                            )
                          }
                        />
                      </div>
                    </AppCard>
                  ))}
                </div>
              </AppCard>

              <AppCard className="grid gap-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-black text-app-foreground">
                      {labels.appFeatures}
                    </h3>
                    {aiButton("features_ar", "توليد المميزات")}
                  </div>
                  <AppButton
                    variant="secondary"
                    className="min-h-9 px-3"
                    onClick={() =>
                      updateField("features", [
                        ...formValues.features,
                        { ...emptyFeature },
                      ])
                    }
                    icon={<AppIcon name="plus" size={16} />}
                  >
                    {labels.addFeature}
                  </AppButton>
                </div>
                {formValues.features.length === 0 ? (
                  <p className="text-sm text-app-muted">{labels.noFeatures}</p>
                ) : null}
                <div className="grid gap-3">
                  {formValues.features.map((feature, index) => (
                    <AppCard key={index} className="grid gap-4 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <AppBadge tone="primary">
                          {labels.featureItem} #{index + 1}
                        </AppBadge>
                        <AppButton
                          variant="danger"
                          className="min-h-8 px-3"
                          onClick={() =>
                            updateField(
                              "features",
                              formValues.features.filter(
                                (_, itemIndex) => itemIndex !== index,
                              ),
                            )
                          }
                          icon={<AppIcon name="trash" size={15} />}
                        >
                          {tableLabels.remove}
                        </AppButton>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <AppInput
                          label={labels.featureTitleAr}
                          required
                          value={feature.title_ar}
                          onChange={(event) =>
                            updateFeature(index, "title_ar", event.target.value)
                          }
                          labelAction={featureAiButton(index, feature, "title")}
                        />
                        <AppInput
                          label={labels.featureTitleEn}
                          required
                          value={feature.title_en}
                          onChange={(event) =>
                            updateFeature(index, "title_en", event.target.value)
                          }
                        />
                        <AppTextarea
                          label={labels.featureDescriptionAr}
                          value={feature.description_ar}
                          onChange={(event) =>
                            updateFeature(
                              index,
                              "description_ar",
                              event.target.value,
                            )
                          }
                          labelAction={featureAiButton(index, feature, "description")}
                        />
                        <AppTextarea
                          label={labels.featureDescriptionEn}
                          value={feature.description_en}
                          onChange={(event) =>
                            updateFeature(
                              index,
                              "description_en",
                              event.target.value,
                            )
                          }
                        />
                      </div>
                    </AppCard>
                  ))}
                </div>
              </AppCard>

              <AppCard className="grid gap-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-base font-black text-app-foreground">
                    {labels.screenshots}
                  </h3>
                  <AppButton
                    variant="secondary"
                    className="min-h-9 px-3"
                    onClick={() =>
                      updateField("screenshots", [
                        ...formValues.screenshots,
                        { ...emptyScreenshot },
                      ])
                    }
                    icon={<AppIcon name="plus" size={16} />}
                  >
                    {labels.addScreenshot}
                  </AppButton>
                </div>
                {formValues.screenshots.length === 0 ? (
                  <p className="text-sm text-app-muted">
                    {labels.noScreenshots}
                  </p>
                ) : null}
                <div className="grid gap-3">
                  {formValues.screenshots.map((screenshot, index) => (
                    <AppCard key={index} className="grid gap-4 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <AppBadge tone="primary">
                          {labels.screenshotItem} #{index + 1}
                        </AppBadge>
                        <AppButton
                          variant="danger"
                          className="min-h-8 px-3"
                          onClick={() =>
                            updateField(
                              "screenshots",
                              formValues.screenshots.filter(
                                (_, itemIndex) => itemIndex !== index,
                              ),
                            )
                          }
                          icon={<AppIcon name="trash" size={15} />}
                        >
                          {tableLabels.remove}
                        </AppButton>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <MediaUrlField
                          value={screenshot.image_url}
                          label={labels.imageUrl}
                          token={token}
                          tableLabels={tableLabels}
                          imagesOnly
                          onChange={(value) =>
                            updateScreenshot(index, "image_url", value)
                          }
                        />
                        <AppInput
                          label={labels.altAr}
                          value={screenshot.alt_ar}
                          onChange={(event) =>
                            updateScreenshot(
                              index,
                              "alt_ar",
                              event.target.value,
                            )
                          }
                        />
                        <AppInput
                          label={labels.altEn}
                          value={screenshot.alt_en}
                          onChange={(event) =>
                            updateScreenshot(
                              index,
                              "alt_en",
                              event.target.value,
                            )
                          }
                        />
                      </div>
                    </AppCard>
                  ))}
                </div>
              </AppCard>

              <AppCard className="grid gap-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-base font-black text-app-foreground">
                    {labels.requirements}
                  </h3>
                  <AppButton
                    variant="secondary"
                    className="min-h-9 px-3"
                    onClick={() =>
                      updateField("requirements", [
                        ...formValues.requirements,
                        { ...emptyRequirement },
                      ])
                    }
                    icon={<AppIcon name="plus" size={16} />}
                  >
                    {labels.addRequirement}
                  </AppButton>
                </div>
                {formValues.requirements.length === 0 ? (
                  <p className="text-sm text-app-muted">
                    {labels.noRequirements}
                  </p>
                ) : null}
                <div className="grid gap-3">
                  {formValues.requirements.map((requirement, index) => (
                    <AppCard key={index} className="grid gap-4 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <AppBadge tone="primary">
                          {labels.requirementItem} #{index + 1}
                        </AppBadge>
                        <AppButton
                          variant="danger"
                          className="min-h-8 px-3"
                          onClick={() =>
                            updateField(
                              "requirements",
                              formValues.requirements.filter(
                                (_, itemIndex) => itemIndex !== index,
                              ),
                            )
                          }
                          icon={<AppIcon name="trash" size={15} />}
                        >
                          {tableLabels.remove}
                        </AppButton>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <AppInput
                          label={labels.requirementKey}
                          value={requirement.key}
                          onChange={(event) =>
                            updateRequirement(index, "key", event.target.value)
                          }
                        />
                        <AppInput
                          label={labels.requirementValue}
                          value={requirement.value}
                          onChange={(event) =>
                            updateRequirement(
                              index,
                              "value",
                              event.target.value,
                            )
                          }
                        />
                      </div>
                    </AppCard>
                  ))}
                </div>
              </AppCard>

              <AppCard className="grid gap-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-base font-black text-app-foreground">
                    {labels.changelog}
                  </h3>
                  <AppButton
                    variant="secondary"
                    className="min-h-9 px-3"
                    onClick={() =>
                      updateField("changelog", [
                        ...formValues.changelog,
                        { ...emptyChangelog },
                      ])
                    }
                    icon={<AppIcon name="plus" size={16} />}
                  >
                    {labels.addChangelog}
                  </AppButton>
                </div>
                {formValues.changelog.length === 0 ? (
                  <p className="text-sm text-app-muted">{labels.noChangelog}</p>
                ) : null}
                <div className="grid gap-3">
                  {formValues.changelog.map((release, index) => (
                    <AppCard key={index} className="grid gap-4 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <AppBadge tone="primary">
                          {labels.releaseItem} #{index + 1}
                        </AppBadge>
                        <AppButton
                          variant="danger"
                          className="min-h-8 px-3"
                          onClick={() =>
                            updateField(
                              "changelog",
                              formValues.changelog.filter(
                                (_, itemIndex) => itemIndex !== index,
                              ),
                            )
                          }
                          icon={<AppIcon name="trash" size={15} />}
                        >
                          {tableLabels.remove}
                        </AppButton>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <AppInput
                          label={labels.version}
                          value={release.version}
                          onChange={(event) =>
                            updateChangelog(
                              index,
                              "version",
                              event.target.value,
                            )
                          }
                        />
                        <AppInput
                          label={labels.releaseDate}
                          type="date"
                          value={release.release_date}
                          onChange={(event) =>
                            updateChangelog(
                              index,
                              "release_date",
                              event.target.value,
                            )
                          }
                        />
                        <AppInput
                          label={labels.releaseTitleAr}
                          value={release.title_ar}
                          onChange={(event) =>
                            updateChangelog(
                              index,
                              "title_ar",
                              event.target.value,
                            )
                          }
                        />
                        <AppInput
                          label={labels.releaseTitleEn}
                          value={release.title_en}
                          onChange={(event) =>
                            updateChangelog(
                              index,
                              "title_en",
                              event.target.value,
                            )
                          }
                        />
                        <AppTextarea
                          label={labels.releaseDescriptionAr}
                          value={release.description_ar}
                          onChange={(event) =>
                            updateChangelog(
                              index,
                              "description_ar",
                              event.target.value,
                            )
                          }
                        />
                        <AppTextarea
                          label={labels.releaseDescriptionEn}
                          value={release.description_en}
                          onChange={(event) =>
                            updateChangelog(
                              index,
                              "description_en",
                              event.target.value,
                            )
                          }
                        />
                      </div>
                    </AppCard>
                  ))}
                </div>
              </AppCard>

              <AppCard className="grid gap-4 p-4">
                <h3 className="text-base font-black text-app-foreground">
                  {labels.seo}
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <AppInput
                    label={labels.seoTitleAr}
                    value={formValues.seo_title_ar}
                    onChange={(event) =>
                      updateField("seo_title_ar", event.target.value)
                    }
                    labelAction={aiButton("seo_title_ar")}
                  />
                  <AppInput
                    label={labels.seoTitleEn}
                    value={formValues.seo_title_en}
                    onChange={(event) =>
                      updateField("seo_title_en", event.target.value)
                    }
                  />
                  <AppTextarea
                    label={labels.seoDescriptionAr}
                    value={formValues.seo_description_ar}
                    onChange={(event) =>
                      updateField("seo_description_ar", event.target.value)
                    }
                    labelAction={aiButton("seo_description_ar")}
                  />
                  <AppTextarea
                    label={labels.seoDescriptionEn}
                    value={formValues.seo_description_en}
                    onChange={(event) =>
                      updateField("seo_description_en", event.target.value)
                    }
                  />
                </div>
              </AppCard>
            </div>

            <div className="grid h-fit gap-4 lg:sticky lg:top-4">
              <AppCard className="grid gap-4 p-4">
                <h3 className="text-base font-black text-app-foreground">
                  {labels.preview}
                </h3>
                <div className="overflow-hidden rounded-appLg border border-app-border bg-app-surface">
                  <div className="grid aspect-video place-items-center bg-app-surfaceElevated">
                    {formValues.main_image_url || formValues.icon_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={previewImage}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid place-items-center gap-2 text-app-muted">
                        <AppIcon name="apps" size={28} />
                        <span className="text-xs">{labels.noImage}</span>
                      </div>
                    )}
                  </div>
                  <div className="grid gap-3 p-4">
                    <div className="flex flex-wrap gap-2">
                      <AppBadge
                        tone={
                          formValues.is_active && formValues.status !== "hidden"
                            ? "success"
                            : "neutral"
                        }
                      >
                        {appStatusLabel(formValues.status, labels)}
                      </AppBadge>
                      <AppBadge tone="primary">
                        {appPlatformLabel(formValues.platform, labels)}
                      </AppBadge>
                      <AppBadge tone="neutral">
                        {appPricingLabel(formValues.pricing_type, labels)}
                      </AppBadge>
                    </div>
                    <strong className="text-lg text-app-foreground">
                      {previewTitle || labels.title}
                    </strong>
                    <p className="line-clamp-4 text-sm leading-6 text-app-muted">
                      {previewDescription || labels.description}
                    </p>
                  </div>
                </div>
              </AppCard>

              <AppCard className="grid gap-4 p-4">
                <h3 className="text-base font-black text-app-foreground">
                  {labels.publishing}
                </h3>
                <label className="flex items-center justify-between rounded-appMd border border-app-border bg-app-surface px-4 py-3">
                  <span className="text-sm font-medium">{labels.isActive}</span>
                  <input
                    type="checkbox"
                    checked={formValues.is_active}
                    onChange={(event) =>
                      updateField("is_active", event.target.checked)
                    }
                    className="size-5 accent-current"
                  />
                </label>
                <label className="flex items-center justify-between rounded-appMd border border-app-border bg-app-surface px-4 py-3">
                  <span className="text-sm font-medium">
                    {labels.isFeatured}
                  </span>
                  <input
                    type="checkbox"
                    checked={formValues.is_featured}
                    onChange={(event) =>
                      updateField("is_featured", event.target.checked)
                    }
                    className="size-5 accent-current"
                  />
                </label>
              </AppCard>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-app-border pt-4">
            <AppButton variant="ghost" onClick={closeForm}>
              {tableLabels.close}
            </AppButton>
            <AppButton
              disabled={isSubmitting}
              onClick={handleSave}
              icon={<AppIcon name="save" size={17} />}
            >
              {tableLabels.save}
            </AppButton>
          </div>
        </div>
      </AppModal>

      <AppConfirmDialog
        open={Boolean(deleteRow)}
        title={tableLabels.delete}
        description={tableLabels.confirmDelete}
        confirmText={tableLabels.yesDelete}
        cancelText={tableLabels.cancel}
        onCancel={() => setDeleteRow(null)}
        onConfirm={handleDelete}
      />

      <AppConfirmDialog
        open={Boolean(restoreRow)}
        title={labels.restore}
        description={labels.confirmRestore}
        confirmText={labels.yesRestore}
        cancelText={tableLabels.cancel}
        onCancel={() => setRestoreRow(null)}
        onConfirm={handleRestore}
      />
    </div>
  );
}
