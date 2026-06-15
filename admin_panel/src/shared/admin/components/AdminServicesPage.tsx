"use client";

/**
 * =====================================================
 * AdminServicesPage
 * صفحة احترافية لإدارة خدمات الموقع العام
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
  restoreAdminService,
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

type AdminServicesLabels = {
  title: string;
  description: string;
  createService: string;
  editService: string;
  preview: string;
  viewPublicPage: string;
  basicInfo: string;
  content: string;
  mediaAndIcon: string;
  iconHint: string;
  imageHint: string;
  autoSlugNotice: string;
  serviceFeatures: string;
  seo: string;
  publishing: string;
  all: string;
  active: string;
  inactive: string;
  deleted: string;
  total: string;
  activeServices: string;
  hiddenServices: string;
  deletedServices: string;
  featuresTotal: string;
  statusFilter: string;
  titleAr: string;
  titleEn: string;
  slugAr: string;
  slugEn: string;
  descriptionAr: string;
  descriptionEn: string;
  fullDescriptionAr: string;
  fullDescriptionEn: string;
  icon: string;
  imageUrl: string;
  sortOrder: string;
  isActive: string;
  seoTitleAr: string;
  seoTitleEn: string;
  seoDescriptionAr: string;
  seoDescriptionEn: string;
  featuresCount: string;
  addFeature: string;
  featureItem: string;
  featureTitleAr: string;
  featureTitleEn: string;
  featureDescriptionAr: string;
  featureDescriptionEn: string;
  restore: string;
  confirmRestore: string;
  yesRestore: string;
  requiredMessage: string;
  savedMessage: string;
  restoredMessage: string;
  deletedMessage: string;
  noImage: string;
  noFeatures: string;
  slugHint: string;
  generateFeatures: string;
  generateFeatureDescriptions: string;
};

type ServiceFeatureForm = {
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  sort_order: number;
  is_active: boolean;
};

type ServiceFormState = {
  title_ar: string;
  title_en: string;
  slug_ar: string;
  slug_en: string;
  description_ar: string;
  description_en: string;
  full_description_ar: string;
  full_description_en: string;
  icon: string;
  image_url: string;
  seo_title_ar: string;
  seo_title_en: string;
  seo_description_ar: string;
  seo_description_en: string;
  sort_order: number;
  is_active: boolean;
  features: ServiceFeatureForm[];
};

type ServiceRow = Record<string, unknown> & {
  id?: string;
  title_ar?: string;
  title_en?: string;
  slug_ar?: string;
  slug_en?: string;
  description_ar?: string;
  description_en?: string;
  full_description_ar?: string | null;
  full_description_en?: string | null;
  icon?: string | null;
  image_url?: string | null;
  seo_title_ar?: string | null;
  seo_title_en?: string | null;
  seo_description_ar?: string | null;
  seo_description_en?: string | null;
  sort_order?: number;
  is_active?: boolean;
  is_deleted?: boolean;
  created_at?: string;
  features?: ServiceFeatureForm[];
};

type StatusFilter = "all" | "active" | "inactive" | "deleted";

const SERVICES_ENDPOINT = "/admin/services";

const emptyFeature: ServiceFeatureForm = {
  title_ar: "",
  title_en: "",
  description_ar: "",
  description_en: "",
  sort_order: 0,
  is_active: true,
};

const emptyForm: ServiceFormState = {
  title_ar: "",
  title_en: "",
  slug_ar: "",
  slug_en: "",
  description_ar: "",
  description_en: "",
  full_description_ar: "",
  full_description_en: "",
  icon: "server",
  image_url: "",
  seo_title_ar: "",
  seo_title_en: "",
  seo_description_ar: "",
  seo_description_en: "",
  sort_order: 0,
  is_active: true,
  features: [],
};

const DEFAULT_TABLE_LABELS: TableLabels = {
  search: "بحث",
  searchPlaceholder: "ابحث باسم الخدمة أو الرابط...",
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
  noFileSelected: "لم يتم اختيار أي ملف",
  upload: "رفع",
  select: "اختيار",
  error: "حدث خطأ",
};

const DEFAULT_SERVICE_LABELS: AdminServicesLabels = {
  title: "الخدمات",
  description: "إدارة خدمات الموقع العام من مكان واحد.",
  createService: "إضافة خدمة",
  editService: "تعديل خدمة",
  preview: "معاينة ظهور الخدمة",
  viewPublicPage: "فتح في الموقع",
  basicInfo: "البيانات الأساسية",
  content: "المحتوى",
  mediaAndIcon: "أيقونة الخدمة",
  iconHint: "اختر أيقونة واحدة فقط لتمثيل الخدمة في البطاقات وصفحة التفاصيل، بدون صورة خدمة منفصلة.",
  imageHint: "لا تستخدم الخدمات صورة مستقلة؛ الأيقونة فقط تكفي لتقليل التعقيد.",
  autoSlugNotice: "يتم توليد الرابط تلقائيًا من العنوان وحفظه داخليًا بدون إظهاره داخل النموذج.",
  serviceFeatures: "مميزات الخدمة",
  seo: "تحسين محركات البحث",
  publishing: "النشر والظهور",
  all: "الكل",
  active: "منشورة",
  inactive: "مخفية",
  deleted: "محذوفة",
  total: "إجمالي الخدمات",
  activeServices: "الخدمات المنشورة",
  hiddenServices: "الخدمات المخفية",
  deletedServices: "الخدمات المحذوفة",
  featuresTotal: "إجمالي المميزات",
  statusFilter: "الحالة",
  titleAr: "العنوان بالعربية",
  titleEn: "العنوان بالإنجليزية",
  slugAr: "الرابط بالعربية",
  slugEn: "الرابط بالإنجليزية",
  descriptionAr: "الوصف المختصر بالعربية",
  descriptionEn: "الوصف المختصر بالإنجليزية",
  fullDescriptionAr: "الوصف التفصيلي بالعربية",
  fullDescriptionEn: "الوصف التفصيلي بالإنجليزية",
  icon: "الأيقونة",
  imageUrl: "صورة الخدمة",
  sortOrder: "ترتيب الظهور",
  isActive: "منشورة",
  seoTitleAr: "عنوان SEO بالعربية",
  seoTitleEn: "عنوان SEO بالإنجليزية",
  seoDescriptionAr: "وصف SEO بالعربية",
  seoDescriptionEn: "وصف SEO بالإنجليزية",
  featuresCount: "عدد المميزات",
  addFeature: "إضافة ميزة",
  featureItem: "ميزة",
  featureTitleAr: "عنوان الميزة بالعربية",
  featureTitleEn: "عنوان الميزة بالإنجليزية",
  featureDescriptionAr: "وصف الميزة بالعربية",
  featureDescriptionEn: "وصف الميزة بالإنجليزية",
  restore: "استعادة",
  confirmRestore: "هل تريد استعادة هذه الخدمة؟",
  yesRestore: "نعم، استعادة",
  requiredMessage: "يرجى تعبئة الحقول المطلوبة.",
  savedMessage: "تم حفظ الخدمة بنجاح.",
  restoredMessage: "تمت استعادة الخدمة بنجاح.",
  deletedMessage: "تم حذف الخدمة بنجاح.",
  noImage: "لا توجد أيقونة",
  noFeatures: "لا توجد مميزات",
  slugHint: "استخدم أحرفًا وأرقامًا وشرطات فقط. سيتم تنظيف الرابط تلقائيًا.",
  generateFeatures: "توليد المميزات",
  generateFeatureDescriptions: "توليد وصف المميزات",
};

function toText(value: unknown) {
  return value === undefined || value === null ? "" : String(value);
}

function toNumber(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function normalizeFeature(value: unknown): ServiceFeatureForm {
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
    is_active:
      source.is_active === undefined ? true : Boolean(source.is_active),
  };
}

function rowToForm(row: ServiceRow): ServiceFormState {
  return {
    title_ar: toText(row.title_ar),
    title_en: toText(row.title_en),
    slug_ar: toText(row.slug_ar),
    slug_en: toText(row.slug_en),
    description_ar: toText(row.description_ar),
    description_en: toText(row.description_en),
    full_description_ar: toText(row.full_description_ar),
    full_description_en: toText(row.full_description_en),
    icon: toText(row.icon) || "server",
    image_url: toText(row.image_url),
    seo_title_ar: toText(row.seo_title_ar),
    seo_title_en: toText(row.seo_title_en),
    seo_description_ar: toText(row.seo_description_ar),
    seo_description_en: toText(row.seo_description_en),
    sort_order: toNumber(row.sort_order),
    is_active: row.is_active === undefined ? true : Boolean(row.is_active),
    features: Array.isArray(row.features)
      ? row.features.map(normalizeFeature)
      : [],
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

function shouldRefreshAutoSlug(currentSlug: string, previousTitle: string) {
  const normalizedCurrent = normalizeSlug(currentSlug);
  if (!normalizedCurrent) {
    return true;
  }
  return normalizedCurrent === normalizeSlug(previousTitle);
}

function isImageValue(value: string) {
  return /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(value);
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

function buildPayload(values: ServiceFormState) {
  const fallbackSlug =
    normalizeSlug(values.slug_ar || values.title_ar) || `service-${Date.now()}`;

  return {
    ...values,
    slug_ar: normalizeSlug(values.slug_ar || fallbackSlug),
    slug_en: normalizeSlug(values.slug_en || fallbackSlug),
    icon: values.icon.trim() || null,
    image_url: null,
    full_description_ar: values.full_description_ar.trim() || null,
    full_description_en: values.full_description_en.trim() || null,
    seo_title_ar: values.seo_title_ar.trim() || null,
    seo_title_en: values.seo_title_en.trim() || null,
    seo_description_ar: values.seo_description_ar.trim() || null,
    seo_description_en: values.seo_description_en.trim() || null,
    sort_order: Number(values.sort_order) || 0,
    features: values.features.map((feature) => ({
      ...feature,
      title_ar: feature.title_ar.trim(),
      title_en: feature.title_en.trim(),
      description_ar: feature.description_ar.trim() || null,
      description_en: feature.description_en.trim() || null,
      sort_order: Number(feature.sort_order) || 0,
      is_active: Boolean(feature.is_active),
    })),
  };
}

function validate(values: ServiceFormState, labels: AdminServicesLabels) {
  const required = [values.title_ar, values.description_ar];

  if (required.some((value) => !value.trim())) {
    return labels.requiredMessage;
  }

  const invalidFeature = values.features.some(
    (feature) => !feature.title_ar.trim(),
  );
  if (invalidFeature) {
    return labels.requiredMessage;
  }

  return null;
}

function statusTone(row: ServiceRow): BadgeTone {
  if (row.is_deleted) {
    return "danger";
  }
  return row.is_active ? "success" : "neutral";
}

function statusLabel(row: ServiceRow, labels: AdminServicesLabels) {
  if (row.is_deleted) {
    return labels.deleted;
  }
  return row.is_active ? labels.active : labels.inactive;
}

function serviceTitle(row: ServiceRow, locale: Locale) {
  const primary = locale === "ar" ? row.title_ar : row.title_en;
  const fallback = locale === "ar" ? row.title_en : row.title_ar;
  return toText(primary || fallback || "—");
}

function publicSlug(row: ServiceRow, locale: Locale) {
  return toText(
    locale === "ar" ? row.slug_ar || row.slug_en : row.slug_en || row.slug_ar,
  );
}

function IconField({
  value,
  label,
  hint,
  token,
  tableLabels,
  onChange,
  aiAction,
}: {
  value: string;
  label: string;
  hint: string;
  token: string;
  tableLabels: TableLabels;
  onChange: (value: string) => void;
  aiAction?: ReactNode;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const previewUrl = buildBackendAssetUrl(value);
  const isImageLike = isImageValue(value);

  return (
    <div className="grid gap-2">
      <div className="flex min-h-6 items-center justify-between gap-2 text-sm font-bold text-app-foreground">
        <span>{label}</span>
      </div>
      <p className="text-xs leading-6 text-app-muted">{hint}</p>
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
      <div className="flex items-center gap-3 rounded-appMd border border-app-border bg-app-surface px-3 py-2 text-xs text-app-muted">
        <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-appSm border border-app-border bg-app-surfaceElevated text-app-primary">
          {isImageLike ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <AppIcon name="services" size={18} />
          )}
        </div>
        <span className="min-w-0 flex-1 truncate">{value || "server"}</span>
        {isImageLike ? (
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
        ) : null}
      </div>
      <AdminMediaPicker
        open={pickerOpen}
        token={token}
        labels={tableLabels}
        imagesOnly
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

type AdminServicesPageProps = {
  locale: Locale;
  labels?: Partial<AdminServicesLabels>;
  tableLabels?: Partial<TableLabels>;
};

export function AdminServicesPage({
  locale,
  labels: labelsInput,
  tableLabels: tableLabelsInput,
}: AdminServicesPageProps) {
  const labels: AdminServicesLabels = {
    ...DEFAULT_SERVICE_LABELS,
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
  const [formValues, setFormValues] = useState<ServiceFormState>(emptyForm);
  const [editingRow, setEditingRow] = useState<ServiceRow | null>(null);
  const [deleteRow, setDeleteRow] = useState<ServiceRow | null>(null);
  const [restoreRow, setRestoreRow] = useState<ServiceRow | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [pageMessage, setPageMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryKey = [SERVICES_ENDPOINT, search, "with-deleted"];
  const query = useQuery({
    queryKey,
    queryFn: () =>
      listAdminItems(SERVICES_ENDPOINT, {
        token,
        search,
        skip: 0,
        limit: 100,
        includeDeleted: true,
      }),
    enabled: Boolean(token),
  });

  const allRows = ((query.data ?? []) as ServiceRow[])
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
        return !row.is_deleted && row.is_active;
      }
      if (statusFilter === "inactive") {
        return !row.is_deleted && !row.is_active;
      }
      if (statusFilter === "deleted") {
        return Boolean(row.is_deleted);
      }
      return true;
    });
  }, [allRows, statusFilter]);

  const stats = useMemo(() => {
    const notDeleted = allRows.filter((row) => !row.is_deleted);
    return {
      total: notDeleted.length,
      active: notDeleted.filter((row) => row.is_active).length,
      inactive: notDeleted.filter((row) => !row.is_active).length,
      deleted: allRows.filter((row) => row.is_deleted).length,
      features: allRows.reduce(
        (total, row) =>
          total + (Array.isArray(row.features) ? row.features.length : 0),
        0,
      ),
    };
  }, [allRows]);

  const updateField = <K extends keyof ServiceFormState>(
    key: K,
    value: ServiceFormState[K],
  ) => {
    setFormValues((current) => ({ ...current, [key]: value }));
  };

  const updateTitleField = (key: "title_ar" | "title_en", value: string) => {
    setFormValues((current) => {
      const slugKey = key === "title_ar" ? "slug_ar" : "slug_en";
      const shouldUpdateSlug = shouldRefreshAutoSlug(
        current[slugKey],
        current[key],
      );

      return {
        ...current,
        [key]: value,
        ...(shouldUpdateSlug ? { [slugKey]: normalizeSlug(value) } : {}),
      };
    });
  };

  const applyAiContent = (
    targetField: AiTargetField,
    content: AiGeneratedContent,
  ) => {
    setFormValues((current) => {
      const next: ServiceFormState = { ...current };

      if (targetField === "improved_title_ar" && content.improved_title_ar) {
        next.title_ar = content.improved_title_ar;
        next.title_en = content.title_en || current.title_en;
      }
      if (targetField === "slug" && content.slug) {
        next.slug_ar = normalizeSlug(content.slug);
        next.slug_en = normalizeSlug(content.slug);
      }
      if (
        targetField === "short_description_ar" &&
        content.short_description_ar
      ) {
        next.description_ar = content.short_description_ar;
        next.description_en =
          content.short_description_en || current.description_en;
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
        next.features = content.features_ar.map((feature, index) => {
          const parsedFeature = splitAiFeatureText(feature);
          return {
            ...emptyFeature,
            title_ar: parsedFeature.title,
            description_ar: parsedFeature.description,
            sort_order: index + 1,
          };
        });
      }

      return next;
    });
  };

  const aiButton = (
    targetField: AiTargetField,
    label = "توليد",
    extraInstructions?: string,
  ) => (
    <AdminAiFieldButton
      token={token}
      entityType="service"
      targetField={targetField}
      titleAr={formValues.title_ar}
      shortDescriptionAr={formValues.description_ar}
      fullDescriptionAr={formValues.full_description_ar}
      contextAr={formValues.seo_title_ar}
      extraInstructions={extraInstructions}
      label={label}
      onApply={(content) => applyAiContent(targetField, content)}
    />
  );

  const aiIconButton = (label = "توليد أيقونة") => (
    <AdminAiImageButton
      token={token}
      entityType="service"
      imageKind="icon"
      titleAr={formValues.title_ar}
      shortDescriptionAr={formValues.description_ar}
      fullDescriptionAr={formValues.full_description_ar}
      contextAr={formValues.seo_title_ar}
      label={label}
      onApply={(imageUrl) => updateField("icon", imageUrl)}
    />
  );

  const openCreate = () => {
    setPageMessage(null);
    setFormError(null);
    setEditingRow(null);
    setFormValues(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (row: ServiceRow) => {
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
          `${SERVICES_ENDPOINT}/${editingRow.id}`,
          token,
          payload,
        );
      } else {
        await createAdminItem(SERVICES_ENDPOINT, token, payload);
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
      await deleteAdminItem(`${SERVICES_ENDPOINT}/${deleteRow.id}`, token);
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
      await restoreAdminService(token, restoreRow.id);
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
    key: keyof ServiceFeatureForm,
    value: ServiceFeatureForm[keyof ServiceFeatureForm],
  ) => {
    setFormValues((current) => ({
      ...current,
      features: current.features.map((feature, featureIndex) =>
        featureIndex === index ? { ...feature, [key]: value } : feature,
      ),
    }));
  };

  const featureAiButton = (
    index: number,
    feature: ServiceFeatureForm,
    field: "title" | "description",
  ) => (
    <AdminAiFieldButton
      token={token}
      entityType="service"
      targetField="features_ar"
      titleAr={feature.title_ar || formValues.title_ar}
      shortDescriptionAr={feature.description_ar || formValues.description_ar}
      fullDescriptionAr={formValues.full_description_ar}
      contextAr={formValues.seo_title_ar}
      label="توليد"
      extraInstructions={
        field === "title"
          ? `ولّد عنوانًا عربيًا قصيرًا وواضحًا لميزة واحدة فقط مرتبطة بالخدمة. لا تكتب قائمة طويلة. أعد النص بصيغة: عنوان الميزة: وصف قصير.`
          : `ولّد وصفًا عربيًا عمليًا ومختصرًا لهذه الميزة فقط. عنوان الميزة الحالي: ${feature.title_ar || "غير محدد"}. لا تغيّر عنوان الميزة إلا إذا كان الوصف يحتاج سياقًا. أعد النص بصيغة: عنوان الميزة: وصف قصير.`
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

  const removeFeature = (index: number) => {
    updateField(
      "features",
      formValues.features.filter((_, featureIndex) => featureIndex !== index),
    );
  };

  const addFeature = () => {
    updateField("features", [
      ...formValues.features,
      { ...emptyFeature, sort_order: formValues.features.length + 1 },
    ]);
  };

  const previewTitle =
    locale === "ar"
      ? formValues.title_ar || formValues.title_en
      : formValues.title_en || formValues.title_ar;
  const previewDescription =
    locale === "ar"
      ? formValues.description_ar || formValues.description_en
      : formValues.description_en || formValues.description_ar;
  const previewIconUrl = buildBackendAssetUrl(formValues.icon);
  const hasCustomIcon = isImageValue(formValues.icon);

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
              {labels.createService}
            </AppButton>
          </>
        }
      />

      {pageMessage ? (
        <AppCard className="border-app-primary/30 bg-app-primary/10 p-4 text-sm font-semibold text-app-primary">
          {pageMessage}
        </AppCard>
      ) : null}

      <div className="grid gap-4 md:grid-cols-5">
        <StatCard label={labels.total} value={stats.total} tone="primary" />
        <StatCard
          label={labels.activeServices}
          value={stats.active}
          tone="success"
        />
        <StatCard
          label={labels.hiddenServices}
          value={stats.inactive}
          tone="neutral"
        />
        <StatCard
          label={labels.deletedServices}
          value={stats.deleted}
          tone="danger"
        />
        <StatCard
          label={labels.featuresTotal}
          value={stats.features}
          tone="warning"
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
            icon="services"
          />
        ) : null}

        {!query.isLoading && !query.isError && filteredRows.length > 0 ? (
          <AppTable
            rows={filteredRows}
            getRowKey={(row) => String(row.id)}
            columns={[
              {
                key: "service",
                header: labels.title,
                render: (row) => (
                  <div className="flex min-w-64 items-center gap-3">
                    <div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-appMd border border-app-border bg-app-surfaceElevated text-app-primary">
                      {isImageValue(toText(row.icon)) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={buildBackendAssetUrl(toText(row.icon))}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <AppIcon name="services" size={19} />
                      )}
                    </div>
                    <div className="grid min-w-0 gap-1">
                      <strong className="truncate text-sm text-app-foreground">
                        {serviceTitle(row, locale)}
                      </strong>
                      <span className="truncate text-xs text-app-muted">
                        {publicSlug(row, locale)}
                      </span>
                    </div>
                  </div>
                ),
              },
              {
                key: "features",
                header: labels.featuresCount,
                render: (row) => (
                  <AppBadge tone="primary">
                    {Array.isArray(row.features) ? row.features.length : 0}
                  </AppBadge>
                ),
              },
              {
                key: "sort_order",
                header: labels.sortOrder,
                render: (row) => <span>{toText(row.sort_order || 0)}</span>,
              },
              {
                key: "status",
                header: labels.isActive,
                render: (row) => (
                  <AppBadge tone={statusTone(row)}>
                    {statusLabel(row, labels)}
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
                              buildPublicSiteUrl(locale, "services", slug),
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
        title={editingRow ? labels.editService : labels.createService}
        onClose={closeForm}
        size="2xl"
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
                    label={labels.titleAr}
                    required
                    value={formValues.title_ar}
                    onChange={(event) =>
                      updateTitleField("title_ar", event.target.value)
                    }
                    labelAction={aiButton("improved_title_ar")}
                  />
                  <AppInput
                    label={labels.titleEn}
                    required
                    value={formValues.title_en}
                    onChange={(event) =>
                      updateTitleField("title_en", event.target.value)
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
                    label={labels.descriptionAr}
                    required
                    value={formValues.description_ar}
                    onChange={(event) =>
                      updateField("description_ar", event.target.value)
                    }
                    labelAction={aiButton("short_description_ar")}
                  />
                  <AppTextarea
                    label={labels.descriptionEn}
                    required
                    value={formValues.description_en}
                    onChange={(event) =>
                      updateField("description_en", event.target.value)
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
                  {labels.mediaAndIcon}
                </h3>
                <IconField
                  value={formValues.icon}
                  label={labels.icon}
                  hint={labels.iconHint}
                  token={token}
                  tableLabels={tableLabels}
                  onChange={(value) => updateField("icon", value)}
                  aiAction={aiIconButton()}
                />
              </AppCard>

              <AppCard className="grid gap-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-black text-app-foreground">
                      {labels.serviceFeatures}
                    </h3>
                    {aiButton("features_ar", labels.generateFeatures, "ولّد 4 إلى 6 مميزات دقيقة مرتبطة بعنوان الخدمة ووصفها. اكتب كل عنصر بصيغة: عنوان الميزة: وصف قصير عملي للميزة. تجنب العبارات العامة مثل جودة عالية أو احترافية فقط.")}
                  </div>
                  <AppButton
                    variant="secondary"
                    className="min-h-9 px-3"
                    onClick={addFeature}
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
                          onClick={() => removeFeature(index)}
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
                        <label className="flex items-center justify-between rounded-appMd border border-app-border bg-app-surface px-4 py-3">
                          <span className="text-sm font-medium">
                            {labels.isActive}
                          </span>
                          <input
                            type="checkbox"
                            checked={feature.is_active}
                            onChange={(event) =>
                              updateFeature(
                                index,
                                "is_active",
                                event.target.checked,
                              )
                            }
                            className="size-5 accent-current"
                          />
                        </label>
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
                <div className="group relative overflow-hidden rounded-appLg border border-app-border bg-app-surface p-5 shadow-appCard">
                  <div className="pointer-events-none absolute -top-14 end-6 size-32 rounded-full bg-app-primary/12 blur-3xl" />
                  <div className="relative grid gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-appLg border border-app-primary/25 bg-app-primary/12 text-app-primary shadow-appGlow">
                        {hasCustomIcon ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={previewIconUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <AppIcon name="services" size={24} />
                        )}
                      </span>
                      <AppBadge tone={formValues.is_active ? "success" : "neutral"}>
                        {formValues.is_active ? labels.active : labels.inactive}
                      </AppBadge>
                    </div>

                    <div className="grid gap-2">
                      <strong className="text-lg text-app-foreground">
                        {previewTitle || labels.title}
                      </strong>
                      <p className="line-clamp-4 text-sm leading-7 text-app-muted">
                        {previewDescription || labels.description}
                      </p>
                    </div>

                    {formValues.features.length ? (
                      <div className="flex flex-wrap gap-2 border-t border-app-border/70 pt-4">
                        {formValues.features.slice(0, 3).map((feature, index) => (
                          <span
                            key={`${feature.title_ar}-${index}`}
                            className="rounded-full border border-app-border bg-app-surfaceElevated/80 px-3 py-1 text-xs font-bold text-app-muted"
                          >
                            {feature.title_ar || `${labels.featureItem} ${index + 1}`}
                          </span>
                        ))}
                      </div>
                    ) : null}
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
