"use client";

/**
 * =====================================================
 * AdminProductsPage
 * صفحة احترافية لإدارة أنظمة الموقع العام
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
  restoreAdminProduct,
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

type AdminProductsLabels = {
  title: string;
  description: string;
  createProduct: string;
  editProduct: string;
  preview: string;
  viewPublicPage: string;
  basicInfo: string;
  content: string;
  classification: string;
  media: string;
  targetAudience: string;
  requirements: string;
  productFeatures: string;
  productImages: string;
  productFaqs: string;
  seo: string;
  publishing: string;
  all: string;
  active: string;
  inactive: string;
  deleted: string;
  available: string;
  comingSoon: string;
  inDevelopment: string;
  hidden: string;
  total: string;
  availableProducts: string;
  hiddenProducts: string;
  deletedProducts: string;
  demoEnabledProducts: string;
  featuresTotal: string;
  statusFilter: string;
  nameAr: string;
  nameEn: string;
  slugAr: string;
  slugEn: string;
  shortDescriptionAr: string;
  shortDescriptionEn: string;
  fullDescriptionAr: string;
  fullDescriptionEn: string;
  productType: string;
  status: string;
  mainImageUrl: string;
  targetAudienceAr: string;
  targetAudienceEn: string;
  requirementsAr: string;
  requirementsEn: string;
  showDemoRequest: string;
  sortOrder: string;
  isActive: string;
  seoTitleAr: string;
  seoTitleEn: string;
  seoDescriptionAr: string;
  seoDescriptionEn: string;
  featuresCount: string;
  imagesCount: string;
  faqsCount: string;
  addFeature: string;
  addImage: string;
  addFaq: string;
  featureItem: string;
  imageItem: string;
  faqItem: string;
  featureTitleAr: string;
  featureTitleEn: string;
  featureDescriptionAr: string;
  featureDescriptionEn: string;
  imageUrl: string;
  imageAltAr: string;
  imageAltEn: string;
  imagePrimary: string;
  faqQuestionAr: string;
  faqQuestionEn: string;
  faqAnswerAr: string;
  faqAnswerEn: string;
  restore: string;
  confirmRestore: string;
  yesRestore: string;
  requiredMessage: string;
  savedMessage: string;
  restoredMessage: string;
  deletedMessage: string;
  noImage: string;
  noFeatures: string;
  noFaqs: string;
  slugHint: string;
  typeWeb: string;
  typeDesktop: string;
  typeMobile: string;
  typeSaas: string;
  typeApi: string;
  typeOther: string;
  statusAvailable: string;
  statusComingSoon: string;
  statusInDevelopment: string;
  statusHidden: string;
};

type ProductFeatureForm = {
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  sort_order: number;
  is_active: boolean;
};

type ProductImageForm = {
  image_url: string;
  alt_text_ar: string;
  alt_text_en: string;
  sort_order: number;
  is_primary: boolean;
};

type ProductFaqForm = {
  question_ar: string;
  question_en: string;
  answer_ar: string;
  answer_en: string;
  sort_order: number;
  is_active: boolean;
};

type ProductFormState = {
  name_ar: string;
  name_en: string;
  slug_ar: string;
  slug_en: string;
  short_description_ar: string;
  short_description_en: string;
  full_description_ar: string;
  full_description_en: string;
  product_type: string;
  status: string;
  main_image_url: string;
  target_audience_ar: string;
  target_audience_en: string;
  requirements_ar: string;
  requirements_en: string;
  seo_title_ar: string;
  seo_title_en: string;
  seo_description_ar: string;
  seo_description_en: string;
  show_demo_request: boolean;
  sort_order: number;
  is_active: boolean;
  features: ProductFeatureForm[];
  images: ProductImageForm[];
  faqs: ProductFaqForm[];
};

type ProductRow = Record<string, unknown> & {
  id?: string;
  name_ar?: string;
  name_en?: string;
  slug_ar?: string;
  slug_en?: string;
  short_description_ar?: string;
  short_description_en?: string;
  full_description_ar?: string | null;
  full_description_en?: string | null;
  product_type?: string;
  status?: string;
  main_image_url?: string | null;
  target_audience_ar?: string | null;
  target_audience_en?: string | null;
  requirements_ar?: string | null;
  requirements_en?: string | null;
  seo_title_ar?: string | null;
  seo_title_en?: string | null;
  seo_description_ar?: string | null;
  seo_description_en?: string | null;
  show_demo_request?: boolean;
  sort_order?: number;
  is_active?: boolean;
  is_deleted?: boolean;
  created_at?: string;
  features?: ProductFeatureForm[];
  images?: ProductImageForm[];
  faqs?: ProductFaqForm[];
};

type StatusFilter =
  | "all"
  | "available"
  | "coming_soon"
  | "in_development"
  | "hidden"
  | "deleted";

const PRODUCTS_ENDPOINT = "/admin/products";

const emptyFeature: ProductFeatureForm = {
  title_ar: "",
  title_en: "",
  description_ar: "",
  description_en: "",
  sort_order: 0,
  is_active: true,
};

const emptyImage: ProductImageForm = {
  image_url: "",
  alt_text_ar: "",
  alt_text_en: "",
  sort_order: 0,
  is_primary: false,
};

const emptyFaq: ProductFaqForm = {
  question_ar: "",
  question_en: "",
  answer_ar: "",
  answer_en: "",
  sort_order: 0,
  is_active: true,
};

const emptyForm: ProductFormState = {
  name_ar: "",
  name_en: "",
  slug_ar: "",
  slug_en: "",
  short_description_ar: "",
  short_description_en: "",
  full_description_ar: "",
  full_description_en: "",
  product_type: "web",
  status: "available",
  main_image_url: "",
  target_audience_ar: "",
  target_audience_en: "",
  requirements_ar: "",
  requirements_en: "",
  seo_title_ar: "",
  seo_title_en: "",
  seo_description_ar: "",
  seo_description_en: "",
  show_demo_request: true,
  sort_order: 0,
  is_active: true,
  features: [],
  images: [],
  faqs: [],
};

const DEFAULT_TABLE_LABELS: TableLabels = {
  search: "بحث",
  searchPlaceholder: "ابحث باسم النظام أو الرابط...",
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

const DEFAULT_PRODUCT_LABELS: AdminProductsLabels = {
  title: "إدارة الأنظمة",
  description:
    "إدارة أنظمة الشركة البرمجية التي تظهر في صفحة أنظمتنا بالموقع العام.",
  createProduct: "إضافة نظام",
  editProduct: "تعديل نظام",
  preview: "معاينة النظام",
  viewPublicPage: "فتح صفحة النظام",
  basicInfo: "البيانات الأساسية",
  content: "المحتوى والوصف",
  classification: "التصنيف والحالة",
  media: "الصورة الرئيسية",
  targetAudience: "الجمهور المستهدف",
  requirements: "المتطلبات",
  productFeatures: "مميزات النظام",
  productImages: "صور النظام",
  productFaqs: "أسئلة النظام",
  seo: "تحسين محركات البحث SEO",
  publishing: "النشر والظهور",
  all: "الكل",
  active: "نشطة",
  inactive: "غير نشطة",
  deleted: "محذوفة",
  available: "متاحة",
  comingSoon: "قريبًا",
  inDevelopment: "قيد التطوير",
  hidden: "مخفية",
  total: "إجمالي الأنظمة",
  availableProducts: "أنظمة متاحة",
  hiddenProducts: "أنظمة مخفية",
  deletedProducts: "أنظمة محذوفة",
  demoEnabledProducts: "طلب عرض مفعل",
  featuresTotal: "إجمالي المميزات",
  statusFilter: "فلتر الحالة",
  nameAr: "اسم النظام بالعربية",
  nameEn: "اسم النظام بالإنجليزية",
  slugAr: "رابط النظام بالعربية",
  slugEn: "رابط النظام بالإنجليزية",
  shortDescriptionAr: "وصف مختصر بالعربية",
  shortDescriptionEn: "وصف مختصر بالإنجليزية",
  fullDescriptionAr: "وصف تفصيلي بالعربية",
  fullDescriptionEn: "وصف تفصيلي بالإنجليزية",
  productType: "نوع النظام",
  status: "حالة النظام",
  mainImageUrl: "الصورة الرئيسية",
  targetAudienceAr: "الجمهور المستهدف بالعربية",
  targetAudienceEn: "الجمهور المستهدف بالإنجليزية",
  requirementsAr: "المتطلبات بالعربية",
  requirementsEn: "المتطلبات بالإنجليزية",
  showDemoRequest: "إظهار طلب عرض / ديمو",
  sortOrder: "ترتيب الظهور",
  isActive: "تفعيل النظام",
  seoTitleAr: "عنوان SEO بالعربية",
  seoTitleEn: "عنوان SEO بالإنجليزية",
  seoDescriptionAr: "وصف SEO بالعربية",
  seoDescriptionEn: "وصف SEO بالإنجليزية",
  featuresCount: "مميزات",
  imagesCount: "صور",
  faqsCount: "أسئلة",
  addFeature: "إضافة ميزة",
  addImage: "إضافة صورة",
  addFaq: "إضافة سؤال",
  featureItem: "ميزة",
  imageItem: "صورة",
  faqItem: "سؤال",
  featureTitleAr: "عنوان الميزة بالعربية",
  featureTitleEn: "عنوان الميزة بالإنجليزية",
  featureDescriptionAr: "وصف الميزة بالعربية",
  featureDescriptionEn: "وصف الميزة بالإنجليزية",
  imageUrl: "رابط الصورة",
  imageAltAr: "النص البديل بالعربية",
  imageAltEn: "النص البديل بالإنجليزية",
  imagePrimary: "صورة رئيسية",
  faqQuestionAr: "السؤال بالعربية",
  faqQuestionEn: "السؤال بالإنجليزية",
  faqAnswerAr: "الإجابة بالعربية",
  faqAnswerEn: "الإجابة بالإنجليزية",
  restore: "استعادة",
  confirmRestore: "هل تريد استعادة هذا النظام؟",
  yesRestore: "نعم، استعادة",
  requiredMessage:
    "يرجى تعبئة اسم النظام والرابط والوصف المختصر بالعربية والإنجليزية.",
  savedMessage: "تم حفظ النظام بنجاح.",
  restoredMessage: "تمت استعادة النظام بنجاح.",
  deletedMessage: "تم حذف النظام بنجاح.",
  noImage: "لا توجد صورة",
  noFeatures: "لا توجد مميزات بعد.",
  noFaqs: "لا توجد أسئلة بعد.",
  slugHint:
    "استخدم رابطًا قصيرًا وواضحًا بدون مسافات، مثل: customer-management-system.",
  typeWeb: "نظام ويب",
  typeDesktop: "نظام سطح مكتب",
  typeMobile: "نظام موبايل",
  typeSaas: "SaaS",
  typeApi: "API",
  typeOther: "أخرى",
  statusAvailable: "متاح",
  statusComingSoon: "قريبًا",
  statusInDevelopment: "قيد التطوير",
  statusHidden: "مخفي",
};

function toText(value: unknown) {
  return value === undefined || value === null ? "" : String(value);
}

function toNumber(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function normalizeFeature(value: unknown): ProductFeatureForm {
  const source =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  return {
    title_ar: toText(source.title_ar),
    title_en: toText(source.title_en),
    description_ar: toText(source.description_ar),
    description_en: toText(source.description_en),
    sort_order: toNumber(source.sort_order),
    is_active: source.is_active !== false,
  };
}

function normalizeImage(value: unknown): ProductImageForm {
  const source =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  return {
    image_url: toText(source.image_url),
    alt_text_ar: toText(source.alt_text_ar),
    alt_text_en: toText(source.alt_text_en),
    sort_order: toNumber(source.sort_order),
    is_primary: source.is_primary === true,
  };
}

function normalizeFaq(value: unknown): ProductFaqForm {
  const source =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  return {
    question_ar: toText(source.question_ar),
    question_en: toText(source.question_en),
    answer_ar: toText(source.answer_ar),
    answer_en: toText(source.answer_en),
    sort_order: toNumber(source.sort_order),
    is_active: source.is_active !== false,
  };
}

function rowToForm(row: ProductRow): ProductFormState {
  return {
    name_ar: toText(row.name_ar),
    name_en: toText(row.name_en),
    slug_ar: toText(row.slug_ar),
    slug_en: toText(row.slug_en),
    short_description_ar: toText(row.short_description_ar),
    short_description_en: toText(row.short_description_en),
    full_description_ar: toText(row.full_description_ar),
    full_description_en: toText(row.full_description_en),
    product_type: toText(row.product_type) || "web",
    status: toText(row.status) || "available",
    main_image_url: toText(row.main_image_url),
    target_audience_ar: toText(row.target_audience_ar),
    target_audience_en: toText(row.target_audience_en),
    requirements_ar: toText(row.requirements_ar),
    requirements_en: toText(row.requirements_en),
    seo_title_ar: toText(row.seo_title_ar),
    seo_title_en: toText(row.seo_title_en),
    seo_description_ar: toText(row.seo_description_ar),
    seo_description_en: toText(row.seo_description_en),
    show_demo_request: row.show_demo_request !== false,
    sort_order: toNumber(row.sort_order),
    is_active: row.is_active !== false,
    features: Array.isArray(row.features)
      ? row.features.map(normalizeFeature)
      : [],
    images: Array.isArray(row.images) ? row.images.map(normalizeImage) : [],
    faqs: Array.isArray(row.faqs) ? row.faqs.map(normalizeFaq) : [],
  };
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\u0600-\u06ff-_]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildPayload(values: ProductFormState) {
  const fallbackSlug =
    normalizeSlug(values.slug_ar || values.name_ar) || `product-${Date.now()}`;

  return {
    name_ar: values.name_ar.trim(),
    name_en: values.name_en.trim() || values.name_ar.trim(),
    slug_ar: normalizeSlug(values.slug_ar || fallbackSlug),
    slug_en: normalizeSlug(values.slug_en || fallbackSlug),
    short_description_ar: values.short_description_ar.trim(),
    short_description_en: values.short_description_en.trim() || values.short_description_ar.trim(),
    full_description_ar: values.full_description_ar.trim() || null,
    full_description_en: values.full_description_en.trim() || values.full_description_ar.trim() || null,
    product_type: values.product_type,
    status: values.status,
    main_image_url: values.main_image_url.trim() || null,
    target_audience_ar: values.target_audience_ar.trim() || null,
    target_audience_en: values.target_audience_en.trim() || values.target_audience_ar.trim() || null,
    requirements_ar: values.requirements_ar.trim() || null,
    requirements_en: values.requirements_en.trim() || values.requirements_ar.trim() || null,
    seo_title_ar: values.seo_title_ar.trim() || null,
    seo_title_en: values.seo_title_en.trim() || values.seo_title_ar.trim() || null,
    seo_description_ar: values.seo_description_ar.trim() || null,
    seo_description_en: values.seo_description_en.trim() || values.seo_description_ar.trim() || null,
    show_demo_request: values.show_demo_request,
    sort_order: Number(values.sort_order) || 0,
    is_active: values.is_active,
    extra_data: {},
    features: values.features
      .filter((feature) => feature.title_ar.trim() || feature.title_en.trim())
      .map((feature, index) => ({
        title_ar: feature.title_ar.trim() || feature.title_en.trim(),
        title_en: feature.title_en.trim() || feature.title_ar.trim(),
        description_ar: feature.description_ar.trim() || null,
        description_en: feature.description_en.trim() || null,
        sort_order: Number(feature.sort_order) || index * 10,
        is_active: feature.is_active,
      })),
    images: values.images
      .filter((image) => image.image_url.trim())
      .map((image, index) => ({
        image_url: image.image_url.trim(),
        alt_text_ar: image.alt_text_ar.trim() || null,
        alt_text_en: image.alt_text_en.trim() || null,
        sort_order: Number(image.sort_order) || index * 10,
        is_primary: image.is_primary,
      })),
    faqs: values.faqs
      .filter((faq) => faq.question_ar.trim() || faq.question_en.trim())
      .map((faq, index) => ({
        question_ar: faq.question_ar.trim() || faq.question_en.trim(),
        question_en: faq.question_en.trim() || faq.question_ar.trim(),
        answer_ar: faq.answer_ar.trim() || faq.answer_en.trim(),
        answer_en: faq.answer_en.trim() || faq.answer_ar.trim(),
        sort_order: Number(faq.sort_order) || index * 10,
        is_active: faq.is_active,
      })),
  };
}

function validateForm(values: ProductFormState, labels: AdminProductsLabels) {
  if (!values.name_ar.trim()) {
    return labels.requiredMessage;
  }
  if (!values.short_description_ar.trim()) {
    return labels.requiredMessage;
  }
  return null;
}

function productStatusTone(row: ProductRow): BadgeTone {
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

function productStatusLabel(row: ProductRow, labels: AdminProductsLabels) {
  if (row.is_deleted) {
    return labels.deleted;
  }
  if (!row.is_active) {
    return labels.inactive;
  }
  const value = toText(row.status);
  const map: Record<string, string> = {
    available: labels.statusAvailable,
    coming_soon: labels.statusComingSoon,
    in_development: labels.statusInDevelopment,
    hidden: labels.statusHidden,
  };
  return map[value] ?? (value || labels.statusAvailable);
}

function productTypeLabel(type: unknown, labels: AdminProductsLabels) {
  const value = toText(type);
  const map: Record<string, string> = {
    web: labels.typeWeb,
    desktop: labels.typeDesktop,
    mobile: labels.typeMobile,
    saas: labels.typeSaas,
    api: labels.typeApi,
    other: labels.typeOther,
  };
  return map[value] ?? (value || labels.typeWeb);
}


function MediaUrlField({
  value,
  label,
  token,
  tableLabels,
  onChange,
  aiAction,
}: {
  value: string;
  label: string;
  token: string;
  tableLabels: TableLabels;
  onChange: (value: string) => void;
  aiAction?: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="grid gap-2">
      <AppInput
        label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        <AppButton
          variant="secondary"
          onClick={() => setOpen(true)}
          icon={<AppIcon name="media" size={16} />}
        >
          {tableLabels.chooseFromLibrary}
        </AppButton>
        {aiAction}
        <AppButton variant="ghost" onClick={() => onChange("")}>
          {tableLabels.clearMedia}
        </AppButton>
      </div>
      <AdminMediaPicker
        open={open}
        token={token}
        labels={tableLabels}
        imagesOnly
        onClose={() => setOpen(false)}
        onSelect={(url) => onChange(url)}
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
      <span className="text-xs font-bold uppercase tracking-wide text-app-muted">
        {label}
      </span>
      <div className="flex items-center justify-between gap-3">
        <strong className="text-2xl font-black text-app-foreground">
          {value}
        </strong>
        <AppBadge tone={tone}>{value}</AppBadge>
      </div>
    </AppCard>
  );
}

function ProductPreview({
  values,
  labels,
  locale,
}: {
  values: ProductFormState;
  labels: AdminProductsLabels;
  locale: Locale;
}) {
  const title = locale === "ar" ? values.name_ar : values.name_en;
  const description =
    locale === "ar" ? values.short_description_ar : values.short_description_en;
  const imageUrl = buildBackendAssetUrl(values.main_image_url);

  return (
    <AppCard className="overflow-hidden">
      <div className="grid gap-4 p-4 md:grid-cols-[11rem_1fr]">
        <div className="flex min-h-36 items-center justify-center overflow-hidden rounded-appLg border border-app-border bg-app-surfaceElevated">
          {values.main_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt=""
              className="h-full max-h-44 w-full object-cover"
            />
          ) : (
            <span className="text-sm text-app-muted">{labels.noImage}</span>
          )}
        </div>
        <div className="grid content-start gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <AppBadge
              tone={productStatusTone({
                status: values.status,
                is_active: values.is_active,
              })}
            >
              {productStatusLabel(
                { status: values.status, is_active: values.is_active },
                labels,
              )}
            </AppBadge>
            <AppBadge tone="primary">
              {productTypeLabel(values.product_type, labels)}
            </AppBadge>
            {values.show_demo_request ? (
              <AppBadge tone="warning">{labels.showDemoRequest}</AppBadge>
            ) : null}
          </div>
          <h3 className="text-xl font-black text-app-foreground">
            {title || labels.preview}
          </h3>
          <p className="text-sm leading-6 text-app-muted">
            {description || labels.shortDescriptionAr}
          </p>
          <div className="flex flex-wrap gap-2">
            {values.features.slice(0, 3).map((feature, index) => (
              <AppBadge key={`${feature.title_ar}-${index}`} tone="neutral">
                {locale === "ar"
                  ? feature.title_ar || feature.title_en
                  : feature.title_en || feature.title_ar}
              </AppBadge>
            ))}
          </div>
        </div>
      </div>
    </AppCard>
  );
}

type AdminProductsPageProps = {
  locale: Locale;
  labels?: Partial<AdminProductsLabels>;
  tableLabels?: Partial<TableLabels>;
};

export function AdminProductsPage({
  locale,
  labels: labelsInput,
  tableLabels: tableLabelsInput,
}: AdminProductsPageProps) {
  const labels: AdminProductsLabels = {
    ...DEFAULT_PRODUCT_LABELS,
    ...(labelsInput ?? {}),
  };
  const tableLabels: TableLabels = {
    ...DEFAULT_TABLE_LABELS,
    ...(tableLabelsInput ?? {}),
  };
  const { tokens } = useAdminAuth();
  const token = tokens?.access_token ?? "";
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [editingRow, setEditingRow] = useState<ProductRow | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formValues, setFormValues] = useState<ProductFormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProductRow | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<ProductRow | null>(null);

  const applyAiContent = (
    targetField: AiTargetField,
    content: AiGeneratedContent,
  ) => {
    setFormValues((current) => {
      const next: ProductFormState = { ...current };

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
        next.features = content.features_ar.map((feature, index) => ({
          ...emptyFeature,
          title_ar: feature,
          sort_order: index + 1,
        }));
      }

      return next;
    });
  };

  const aiButton = (targetField: AiTargetField, label = "توليد") => (
    <AdminAiFieldButton
      token={token}
      entityType="product"
      targetField={targetField}
      titleAr={formValues.name_ar}
      shortDescriptionAr={formValues.short_description_ar}
      fullDescriptionAr={formValues.full_description_ar}
      contextAr={formValues.product_type}
      label={label}
      onApply={(content) => applyAiContent(targetField, content)}
    />
  );

  const aiImageButton = (label = "توليد صورة") => (
    <AdminAiImageButton
      token={token}
      entityType="product"
      imageKind="image"
      titleAr={formValues.name_ar}
      shortDescriptionAr={formValues.short_description_ar}
      fullDescriptionAr={formValues.full_description_ar}
      contextAr={formValues.product_type}
      label={label}
      onApply={(url) => setFormValues((current) => ({ ...current, main_image_url: url }))}
    />
  );

  const queryKey = useMemo(() => ["admin-products", search], [search]);

  const query = useQuery({
    queryKey,
    queryFn: () =>
      listAdminItems(PRODUCTS_ENDPOINT, {
        token: token ?? "",
        search,
        skip: 0,
        limit: 100,
        includeDeleted: true,
      }) as Promise<ProductRow[]>,
    enabled: Boolean(token),
  });

  const rows = useMemo(() => query.data ?? [], [query.data]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (statusFilter === "deleted") {
        return row.is_deleted === true;
      }
      if (statusFilter === "all") {
        return true;
      }
      if (row.is_deleted) {
        return false;
      }
      if (statusFilter === "hidden") {
        return row.status === "hidden" || row.is_active === false;
      }
      return row.status === statusFilter && row.is_active !== false;
    });
  }, [rows, statusFilter]);

  const stats = useMemo(() => {
    const activeRows = rows.filter((row) => !row.is_deleted);
    return {
      total: activeRows.length,
      available: activeRows.filter(
        (row) => row.is_active !== false && row.status === "available",
      ).length,
      hidden: activeRows.filter(
        (row) => row.status === "hidden" || row.is_active === false,
      ).length,
      deleted: rows.filter((row) => row.is_deleted).length,
      demo: activeRows.filter((row) => row.show_demo_request !== false).length,
      features: activeRows.reduce(
        (total, row) =>
          total + (Array.isArray(row.features) ? row.features.length : 0),
        0,
      ),
    };
  }, [rows]);

  const isFormOpen = isCreateOpen || Boolean(editingRow);

  const openCreate = () => {
    setEditingRow(null);
    setFormValues(emptyForm);
    setFormError(null);
    setSuccessMessage(null);
    setIsCreateOpen(true);
  };

  const openEdit = (row: ProductRow) => {
    setEditingRow(row);
    setFormValues(rowToForm(row));
    setFormError(null);
    setSuccessMessage(null);
    setIsCreateOpen(false);
  };

  const closeForm = () => {
    if (isSaving) {
      return;
    }
    setEditingRow(null);
    setIsCreateOpen(false);
    setFormValues(emptyForm);
    setFormError(null);
  };

  const refresh = async () => {
    await query.refetch();
  };

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    await query.refetch();
  };

  const handleSave = async () => {
    if (!token) {
      return;
    }

    const validationError = validateForm(formValues, labels);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsSaving(true);
    setFormError(null);
    setSuccessMessage(null);

    try {
      const payload = buildPayload(formValues);
      if (editingRow?.id) {
        await updateAdminItem(
          `${PRODUCTS_ENDPOINT}/${editingRow.id}`,
          token,
          payload,
        );
      } else {
        await createAdminItem(PRODUCTS_ENDPOINT, token, payload);
      }
      setSuccessMessage(labels.savedMessage);
      await invalidate();
      closeForm();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : tableLabels.unknown,
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !deleteTarget?.id) {
      return;
    }

    try {
      await deleteAdminItem(`${PRODUCTS_ENDPOINT}/${deleteTarget.id}`, token);
      setSuccessMessage(labels.deletedMessage);
      setDeleteTarget(null);
      await invalidate();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : tableLabels.unknown,
      );
    }
  };

  const handleRestore = async () => {
    if (!token || !restoreTarget?.id) {
      return;
    }

    try {
      await restoreAdminProduct(token, restoreTarget.id);
      setSuccessMessage(labels.restoredMessage);
      setRestoreTarget(null);
      await invalidate();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : tableLabels.unknown,
      );
    }
  };

  const publicUrl = (row: ProductRow) => {
    const slug =
      locale === "ar" ? row.slug_ar || row.slug_en : row.slug_en || row.slug_ar;
    return slug ? buildPublicSiteUrl(locale, "products", slug) : "";
  };

  const columns = [
    {
      key: "product",
      header: labels.title,
      render: (row: ProductRow) => {
        const title =
          locale === "ar"
            ? row.name_ar || row.name_en
            : row.name_en || row.name_ar;
        const description =
          locale === "ar"
            ? row.short_description_ar || row.short_description_en
            : row.short_description_en || row.short_description_ar;
        const imageUrl = buildBackendAssetUrl(toText(row.main_image_url));
        return (
          <div className="flex min-w-64 items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-appMd border border-app-border bg-app-surfaceElevated">
              {row.main_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <AppIcon name="products" size={22} />
              )}
            </div>
            <div className="grid gap-1">
              <strong className="text-sm font-black text-app-foreground">
                {title}
              </strong>
              <span className="max-w-md truncate text-xs text-app-muted">
                {description}
              </span>
              <span className="text-xs text-app-muted">
                /{row.slug_ar || row.slug_en}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "type",
      header: labels.productType,
      render: (row: ProductRow) => (
        <AppBadge tone="primary">
          {productTypeLabel(row.product_type, labels)}
        </AppBadge>
      ),
    },
    {
      key: "content",
      header: labels.productFeatures,
      render: (row: ProductRow) => (
        <div className="flex flex-wrap gap-2">
          <AppBadge tone="neutral">
            {Array.isArray(row.features) ? row.features.length : 0}{" "}
            {labels.featuresCount}
          </AppBadge>
          <AppBadge tone="neutral">
            {Array.isArray(row.images) ? row.images.length : 0}{" "}
            {labels.imagesCount}
          </AppBadge>
          <AppBadge tone="neutral">
            {Array.isArray(row.faqs) ? row.faqs.length : 0} {labels.faqsCount}
          </AppBadge>
        </div>
      ),
    },
    {
      key: "sort",
      header: labels.sortOrder,
      render: (row: ProductRow) => (
        <span className="font-semibold text-app-foreground">
          {row.sort_order ?? 0}
        </span>
      ),
    },
    {
      key: "status",
      header: labels.status,
      render: (row: ProductRow) => (
        <AppBadge tone={productStatusTone(row)}>
          {productStatusLabel(row, labels)}
        </AppBadge>
      ),
    },
    {
      key: "actions",
      header: tableLabels.actions,
      className: "w-64",
      render: (row: ProductRow) => {
        const url = publicUrl(row);
        return (
          <div className="flex flex-wrap justify-end gap-2">
            {url ? (
              <AppButton
                variant="ghost"
                className="min-h-9 px-3"
                onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
              >
                {tableLabels.open}
              </AppButton>
            ) : null}
            <AppButton
              variant="secondary"
              className="min-h-9 px-3"
              onClick={() => openEdit(row)}
            >
              {tableLabels.edit}
            </AppButton>
            {row.is_deleted ? (
              <AppButton
                variant="primary"
                className="min-h-9 px-3"
                onClick={() => setRestoreTarget(row)}
              >
                {labels.restore}
              </AppButton>
            ) : (
              <AppButton
                variant="danger"
                className="min-h-9 px-3"
                onClick={() => setDeleteTarget(row)}
              >
                {tableLabels.delete}
              </AppButton>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="grid gap-6">
      <AppPageHeader
        title={labels.title}
        description={labels.description}
        actions={
          <div className="flex flex-wrap gap-2">
            <AppButton
              variant="secondary"
              onClick={refresh}
              icon={<AppIcon name="refresh" size={17} />}
            >
              {tableLabels.refresh}
            </AppButton>
            <AppButton
              onClick={openCreate}
              icon={<AppIcon name="plus" size={17} />}
            >
              {labels.createProduct}
            </AppButton>
          </div>
        }
      />

      {successMessage ? (
        <AppCard className="border-app-success/30 bg-app-success/10 p-4 text-sm font-semibold text-app-success">
          {successMessage}
        </AppCard>
      ) : null}

      {formError ? (
        <AppErrorState title={tableLabels.unknown} description={formError} />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard label={labels.total} value={stats.total} tone="primary" />
        <StatCard
          label={labels.availableProducts}
          value={stats.available}
          tone="success"
        />
        <StatCard
          label={labels.hiddenProducts}
          value={stats.hidden}
          tone="neutral"
        />
        <StatCard
          label={labels.deletedProducts}
          value={stats.deleted}
          tone="danger"
        />
        <StatCard
          label={labels.demoEnabledProducts}
          value={stats.demo}
          tone="warning"
        />
        <StatCard
          label={labels.featuresTotal}
          value={stats.features}
          tone="primary"
        />
      </div>

      <AppCard className="grid gap-4 p-4">
        <div className="grid gap-4 lg:grid-cols-[1fr_18rem_auto] lg:items-end">
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
            <option value="available">{labels.available}</option>
            <option value="coming_soon">{labels.comingSoon}</option>
            <option value="in_development">{labels.inDevelopment}</option>
            <option value="hidden">{labels.hidden}</option>
            <option value="deleted">{labels.deleted}</option>
          </AppSelect>
          <AppButton
            variant="secondary"
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
            }}
          >
            {tableLabels.refresh}
          </AppButton>
        </div>
      </AppCard>

      {query.isLoading ? <AppLoadingState text={tableLabels.loading} /> : null}
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
        />
      ) : null}

      {!query.isLoading && !query.isError && filteredRows.length > 0 ? (
        <AppTable
          columns={columns}
          rows={filteredRows}
          getRowKey={(row) => row.id ?? `${row.slug_ar}-${row.slug_en}`}
        />
      ) : null}

      <AppModal
        open={isFormOpen}
        title={editingRow ? labels.editProduct : labels.createProduct}
        onClose={closeForm}
        size="xl"
      >
        <div className="grid gap-6">
          <ProductPreview values={formValues} labels={labels} locale={locale} />

          {formError ? (
            <AppErrorState
              title={tableLabels.unknown}
              description={formError}
            />
          ) : null}

          <section className="grid gap-4">
            <h3 className="text-lg font-black text-app-foreground">
              {labels.basicInfo}
            </h3>
            <div className="grid gap-4 lg:grid-cols-2">
              <AppInput
                label={labels.nameAr}
                value={formValues.name_ar}
                onChange={(event) =>
                  setFormValues({ ...formValues, name_ar: event.target.value })
                }
                labelAction={aiButton("improved_title_ar")}
              />
              <AppInput
                label={labels.nameEn}
                value={formValues.name_en}
                onChange={(event) =>
                  setFormValues({ ...formValues, name_en: event.target.value })
                }
              />
              <AppInput
                label={labels.slugAr}
                value={formValues.slug_ar}
                onChange={(event) =>
                  setFormValues({ ...formValues, slug_ar: event.target.value })
                }
                labelAction={aiButton("slug")}
              />
              <AppInput
                label={labels.slugEn}
                value={formValues.slug_en}
                onChange={(event) =>
                  setFormValues({ ...formValues, slug_en: event.target.value })
                }
              />
            </div>
            <p className="text-sm text-app-muted">{labels.slugHint}</p>
          </section>

          <section className="grid gap-4">
            <h3 className="text-lg font-black text-app-foreground">
              {labels.content}
            </h3>
            <div className="grid gap-4 lg:grid-cols-2">
              <AppTextarea
                label={labels.shortDescriptionAr}
                value={formValues.short_description_ar}
                onChange={(event) =>
                  setFormValues({
                    ...formValues,
                    short_description_ar: event.target.value,
                  })
                }
                labelAction={aiButton("short_description_ar")}
              />
              <AppTextarea
                label={labels.shortDescriptionEn}
                value={formValues.short_description_en}
                onChange={(event) =>
                  setFormValues({
                    ...formValues,
                    short_description_en: event.target.value,
                  })
                }
              />
              <AppTextarea
                label={labels.fullDescriptionAr}
                value={formValues.full_description_ar}
                onChange={(event) =>
                  setFormValues({
                    ...formValues,
                    full_description_ar: event.target.value,
                  })
                }
                labelAction={aiButton("full_description_ar")}
              />
              <AppTextarea
                label={labels.fullDescriptionEn}
                value={formValues.full_description_en}
                onChange={(event) =>
                  setFormValues({
                    ...formValues,
                    full_description_en: event.target.value,
                  })
                }
              />
            </div>
          </section>

          <section className="grid gap-4">
            <h3 className="text-lg font-black text-app-foreground">
              {labels.classification}
            </h3>
            <div className="grid gap-4 lg:grid-cols-4">
              <AppSelect
                label={labels.productType}
                value={formValues.product_type}
                onChange={(event) =>
                  setFormValues({
                    ...formValues,
                    product_type: event.target.value,
                  })
                }
              >
                <option value="web">{labels.typeWeb}</option>
                <option value="desktop">{labels.typeDesktop}</option>
                <option value="mobile">{labels.typeMobile}</option>
                <option value="saas">{labels.typeSaas}</option>
                <option value="api">{labels.typeApi}</option>
                <option value="other">{labels.typeOther}</option>
              </AppSelect>
              <AppSelect
                label={labels.status}
                value={formValues.status}
                onChange={(event) =>
                  setFormValues({ ...formValues, status: event.target.value })
                }
              >
                <option value="available">{labels.statusAvailable}</option>
                <option value="coming_soon">{labels.statusComingSoon}</option>
                <option value="in_development">
                  {labels.statusInDevelopment}
                </option>
                <option value="hidden">{labels.statusHidden}</option>
              </AppSelect>
              <AppInput
                label={labels.sortOrder}
                type="number"
                value={formValues.sort_order}
                onChange={(event) =>
                  setFormValues({
                    ...formValues,
                    sort_order: Number(event.target.value),
                  })
                }
              />
              <AppSelect
                label={labels.isActive}
                value={formValues.is_active ? "true" : "false"}
                onChange={(event) =>
                  setFormValues({
                    ...formValues,
                    is_active: event.target.value === "true",
                  })
                }
              >
                <option value="true">{tableLabels.active}</option>
                <option value="false">{tableLabels.inactive}</option>
              </AppSelect>
            </div>
            <AppSelect
              label={labels.showDemoRequest}
              value={formValues.show_demo_request ? "true" : "false"}
              onChange={(event) =>
                setFormValues({
                  ...formValues,
                  show_demo_request: event.target.value === "true",
                })
              }
            >
              <option value="true">{tableLabels.active}</option>
              <option value="false">{tableLabels.inactive}</option>
            </AppSelect>
          </section>

          <section className="grid gap-4">
            <h3 className="text-lg font-black text-app-foreground">
              {labels.media}
            </h3>
            <MediaUrlField
              value={formValues.main_image_url}
              label={labels.mainImageUrl}
              token={token ?? ""}
              tableLabels={tableLabels}
              onChange={(value) =>
                setFormValues({ ...formValues, main_image_url: value })
              }
              aiAction={aiImageButton()}
            />
          </section>

          <section className="grid gap-4">
            <h3 className="text-lg font-black text-app-foreground">
              {labels.targetAudience}
            </h3>
            <div className="grid gap-4 lg:grid-cols-2">
              <AppTextarea
                label={labels.targetAudienceAr}
                value={formValues.target_audience_ar}
                onChange={(event) =>
                  setFormValues({
                    ...formValues,
                    target_audience_ar: event.target.value,
                  })
                }
              />
              <AppTextarea
                label={labels.targetAudienceEn}
                value={formValues.target_audience_en}
                onChange={(event) =>
                  setFormValues({
                    ...formValues,
                    target_audience_en: event.target.value,
                  })
                }
              />
            </div>
          </section>

          <section className="grid gap-4">
            <h3 className="text-lg font-black text-app-foreground">
              {labels.requirements}
            </h3>
            <div className="grid gap-4 lg:grid-cols-2">
              <AppTextarea
                label={labels.requirementsAr}
                value={formValues.requirements_ar}
                onChange={(event) =>
                  setFormValues({
                    ...formValues,
                    requirements_ar: event.target.value,
                  })
                }
              />
              <AppTextarea
                label={labels.requirementsEn}
                value={formValues.requirements_en}
                onChange={(event) =>
                  setFormValues({
                    ...formValues,
                    requirements_en: event.target.value,
                  })
                }
              />
            </div>
          </section>

          <section className="grid gap-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-black text-app-foreground">
                  {labels.productFeatures}
                </h3>
                {aiButton("features_ar", "توليد المميزات")}
              </div>
              <AppButton
                variant="secondary"
                onClick={() =>
                  setFormValues({
                    ...formValues,
                    features: [
                      ...formValues.features,
                      {
                        ...emptyFeature,
                        sort_order: formValues.features.length * 10,
                      },
                    ],
                  })
                }
              >
                {labels.addFeature}
              </AppButton>
            </div>
            {formValues.features.length === 0 ? (
              <p className="text-sm text-app-muted">{labels.noFeatures}</p>
            ) : null}
            {formValues.features.map((feature, index) => (
              <AppCard key={`feature-${index}`} className="grid gap-4 p-4">
                <div className="flex items-center justify-between gap-3">
                  <strong className="text-app-foreground">
                    {labels.featureItem} #{index + 1}
                  </strong>
                  <AppButton
                    variant="ghost"
                    onClick={() =>
                      setFormValues({
                        ...formValues,
                        features: formValues.features.filter(
                          (_, itemIndex) => itemIndex !== index,
                        ),
                      })
                    }
                  >
                    {tableLabels.remove}
                  </AppButton>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <AppInput
                    label={labels.featureTitleAr}
                    value={feature.title_ar}
                    onChange={(event) =>
                      setFormValues({
                        ...formValues,
                        features: formValues.features.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, title_ar: event.target.value }
                            : item,
                        ),
                      })
                    }
                  />
                  <AppInput
                    label={labels.featureTitleEn}
                    value={feature.title_en}
                    onChange={(event) =>
                      setFormValues({
                        ...formValues,
                        features: formValues.features.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, title_en: event.target.value }
                            : item,
                        ),
                      })
                    }
                  />
                  <AppTextarea
                    label={labels.featureDescriptionAr}
                    value={feature.description_ar}
                    onChange={(event) =>
                      setFormValues({
                        ...formValues,
                        features: formValues.features.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, description_ar: event.target.value }
                            : item,
                        ),
                      })
                    }
                  />
                  <AppTextarea
                    label={labels.featureDescriptionEn}
                    value={feature.description_en}
                    onChange={(event) =>
                      setFormValues({
                        ...formValues,
                        features: formValues.features.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, description_en: event.target.value }
                            : item,
                        ),
                      })
                    }
                  />
                </div>
              </AppCard>
            ))}
          </section>

          <section className="grid gap-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-black text-app-foreground">
                {labels.productImages}
              </h3>
              <AppButton
                variant="secondary"
                onClick={() =>
                  setFormValues({
                    ...formValues,
                    images: [
                      ...formValues.images,
                      {
                        ...emptyImage,
                        sort_order: formValues.images.length * 10,
                      },
                    ],
                  })
                }
              >
                {labels.addImage}
              </AppButton>
            </div>
            {formValues.images.map((image, index) => (
              <AppCard key={`image-${index}`} className="grid gap-4 p-4">
                <div className="flex items-center justify-between gap-3">
                  <strong className="text-app-foreground">
                    {labels.imageItem} #{index + 1}
                  </strong>
                  <AppButton
                    variant="ghost"
                    onClick={() =>
                      setFormValues({
                        ...formValues,
                        images: formValues.images.filter(
                          (_, itemIndex) => itemIndex !== index,
                        ),
                      })
                    }
                  >
                    {tableLabels.remove}
                  </AppButton>
                </div>
                <MediaUrlField
                  value={image.image_url}
                  label={labels.imageUrl}
                  token={token ?? ""}
                  tableLabels={tableLabels}
                  onChange={(value) =>
                    setFormValues({
                      ...formValues,
                      images: formValues.images.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, image_url: value }
                          : item,
                      ),
                    })
                  }
                />
                <div className="grid gap-4 lg:grid-cols-3">
                  <AppInput
                    label={labels.imageAltAr}
                    value={image.alt_text_ar}
                    onChange={(event) =>
                      setFormValues({
                        ...formValues,
                        images: formValues.images.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, alt_text_ar: event.target.value }
                            : item,
                        ),
                      })
                    }
                  />
                  <AppInput
                    label={labels.imageAltEn}
                    value={image.alt_text_en}
                    onChange={(event) =>
                      setFormValues({
                        ...formValues,
                        images: formValues.images.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, alt_text_en: event.target.value }
                            : item,
                        ),
                      })
                    }
                  />
                  <AppSelect
                    label={labels.imagePrimary}
                    value={image.is_primary ? "true" : "false"}
                    onChange={(event) =>
                      setFormValues({
                        ...formValues,
                        images: formValues.images.map((item, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...item,
                                is_primary: event.target.value === "true",
                              }
                            : item,
                        ),
                      })
                    }
                  >
                    <option value="false">{tableLabels.inactive}</option>
                    <option value="true">{tableLabels.active}</option>
                  </AppSelect>
                </div>
              </AppCard>
            ))}
          </section>

          <section className="grid gap-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-black text-app-foreground">
                {labels.productFaqs}
              </h3>
              <AppButton
                variant="secondary"
                onClick={() =>
                  setFormValues({
                    ...formValues,
                    faqs: [
                      ...formValues.faqs,
                      { ...emptyFaq, sort_order: formValues.faqs.length * 10 },
                    ],
                  })
                }
              >
                {labels.addFaq}
              </AppButton>
            </div>
            {formValues.faqs.length === 0 ? (
              <p className="text-sm text-app-muted">{labels.noFaqs}</p>
            ) : null}
            {formValues.faqs.map((faq, index) => (
              <AppCard key={`faq-${index}`} className="grid gap-4 p-4">
                <div className="flex items-center justify-between gap-3">
                  <strong className="text-app-foreground">
                    {labels.faqItem} #{index + 1}
                  </strong>
                  <AppButton
                    variant="ghost"
                    onClick={() =>
                      setFormValues({
                        ...formValues,
                        faqs: formValues.faqs.filter(
                          (_, itemIndex) => itemIndex !== index,
                        ),
                      })
                    }
                  >
                    {tableLabels.remove}
                  </AppButton>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <AppInput
                    label={labels.faqQuestionAr}
                    value={faq.question_ar}
                    onChange={(event) =>
                      setFormValues({
                        ...formValues,
                        faqs: formValues.faqs.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, question_ar: event.target.value }
                            : item,
                        ),
                      })
                    }
                  />
                  <AppInput
                    label={labels.faqQuestionEn}
                    value={faq.question_en}
                    onChange={(event) =>
                      setFormValues({
                        ...formValues,
                        faqs: formValues.faqs.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, question_en: event.target.value }
                            : item,
                        ),
                      })
                    }
                  />
                  <AppTextarea
                    label={labels.faqAnswerAr}
                    value={faq.answer_ar}
                    onChange={(event) =>
                      setFormValues({
                        ...formValues,
                        faqs: formValues.faqs.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, answer_ar: event.target.value }
                            : item,
                        ),
                      })
                    }
                  />
                  <AppTextarea
                    label={labels.faqAnswerEn}
                    value={faq.answer_en}
                    onChange={(event) =>
                      setFormValues({
                        ...formValues,
                        faqs: formValues.faqs.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, answer_en: event.target.value }
                            : item,
                        ),
                      })
                    }
                  />
                </div>
              </AppCard>
            ))}
          </section>

          <section className="grid gap-4">
            <h3 className="text-lg font-black text-app-foreground">
              {labels.seo}
            </h3>
            <div className="grid gap-4 lg:grid-cols-2">
              <AppInput
                label={labels.seoTitleAr}
                value={formValues.seo_title_ar}
                onChange={(event) =>
                  setFormValues({
                    ...formValues,
                    seo_title_ar: event.target.value,
                  })
                }
                labelAction={aiButton("seo_title_ar")}
              />
              <AppInput
                label={labels.seoTitleEn}
                value={formValues.seo_title_en}
                onChange={(event) =>
                  setFormValues({
                    ...formValues,
                    seo_title_en: event.target.value,
                  })
                }
              />
              <AppTextarea
                label={labels.seoDescriptionAr}
                value={formValues.seo_description_ar}
                onChange={(event) =>
                  setFormValues({
                    ...formValues,
                    seo_description_ar: event.target.value,
                  })
                }
                labelAction={aiButton("seo_description_ar")}
              />
              <AppTextarea
                label={labels.seoDescriptionEn}
                value={formValues.seo_description_en}
                onChange={(event) =>
                  setFormValues({
                    ...formValues,
                    seo_description_en: event.target.value,
                  })
                }
              />
            </div>
          </section>

          <div className="sticky bottom-0 flex flex-wrap justify-end gap-3 border-t border-app-border bg-app-surface/95 py-4 backdrop-blur">
            <AppButton
              variant="secondary"
              onClick={closeForm}
              disabled={isSaving}
            >
              {tableLabels.close}
            </AppButton>
            <AppButton onClick={handleSave} disabled={isSaving}>
              {isSaving ? tableLabels.loading : tableLabels.save}
            </AppButton>
          </div>
        </div>
      </AppModal>

      <AppConfirmDialog
        open={Boolean(deleteTarget)}
        title={tableLabels.confirmDelete}
        description={tableLabels.confirmDelete}
        confirmText={tableLabels.yesDelete}
        cancelText={tableLabels.cancel}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <AppConfirmDialog
        open={Boolean(restoreTarget)}
        title={labels.confirmRestore}
        description={labels.confirmRestore}
        confirmText={labels.yesRestore}
        cancelText={tableLabels.cancel}
        onConfirm={handleRestore}
        onCancel={() => setRestoreTarget(null)}
      />
    </div>
  );
}
