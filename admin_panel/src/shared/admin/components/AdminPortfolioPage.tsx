"use client";

/**
 * =====================================================
 * AdminPortfolioPage
 * صفحة احترافية لإدارة أعمالنا/المشاريع السابقة في الموقع العام
 * =====================================================
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type ChangeEvent, useMemo, useState } from "react";

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
  restoreAdminPortfolio,
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
  error: string;
  title: string;
  status: string;
} & MediaPickerLabels;

type AdminPortfolioLabels = {
  title: string;
  description: string;
  createProject: string;
  editProject: string;
  preview: string;
  viewPublicPage: string;
  basicInfo: string;
  content: string;
  caseStudy: string;
  media: string;
  technologies: string;
  gallery: string;
  seo: string;
  publishing: string;
  all: string;
  active: string;
  inactive: string;
  deleted: string;
  total: string;
  activeProjects: string;
  inactiveProjects: string;
  deletedProjects: string;
  technologiesTotal: string;
  statusFilter: string;
  titleAr: string;
  titleEn: string;
  slugAr: string;
  slugEn: string;
  descriptionAr: string;
  descriptionEn: string;
  fullDescriptionAr: string;
  fullDescriptionEn: string;
  problemAr: string;
  problemEn: string;
  resultAr: string;
  resultEn: string;
  categoryAr: string;
  categoryEn: string;
  mainImageUrl: string;
  previewUrl: string;
  completedAt: string;
  sortOrder: string;
  isActive: string;
  seoTitleAr: string;
  seoTitleEn: string;
  seoDescriptionAr: string;
  seoDescriptionEn: string;
  technologiesHint: string;
  galleryHint: string;
  projectImage: string;
  category: string;
  completed: string;
  techCount: string;
  galleryCount: string;
  restore: string;
  confirmRestore: string;
  yesRestore: string;
  requiredMessage: string;
  savedMessage: string;
  restoredMessage: string;
  deletedMessage: string;
  noImage: string;
  noTechnologies: string;
};

type PortfolioProject = {
  id?: string;
  title_ar: string;
  title_en: string;
  slug_ar: string;
  slug_en: string;
  description_ar: string;
  description_en: string;
  full_description_ar?: string | null;
  full_description_en?: string | null;
  problem_ar?: string | null;
  problem_en?: string | null;
  result_ar?: string | null;
  result_en?: string | null;
  category_ar?: string | null;
  category_en?: string | null;
  technologies: string[];
  gallery_images: string[];
  main_image_url?: string | null;
  preview_url?: string | null;
  completed_at?: string | null;
  seo_title_ar?: string | null;
  seo_title_en?: string | null;
  seo_description_ar?: string | null;
  seo_description_en?: string | null;
  sort_order: number;
  is_active: boolean;
  is_deleted?: boolean;
};

type AdminPortfolioPageProps = {
  locale: Locale;
  labels?: Partial<AdminPortfolioLabels>;
  tableLabels?: Partial<TableLabels>;
};

type PortfolioFilter = "all" | "active" | "inactive" | "deleted";
type MediaTarget = "main" | "gallery";

const emptyProject: PortfolioProject = {
  title_ar: "",
  title_en: "",
  slug_ar: "",
  slug_en: "",
  description_ar: "",
  description_en: "",
  full_description_ar: "",
  full_description_en: "",
  problem_ar: "",
  problem_en: "",
  result_ar: "",
  result_en: "",
  category_ar: "",
  category_en: "",
  technologies: [],
  gallery_images: [],
  main_image_url: "",
  preview_url: "",
  completed_at: "",
  seo_title_ar: "",
  seo_title_en: "",
  seo_description_ar: "",
  seo_description_en: "",
  sort_order: 0,
  is_active: true,
  is_deleted: false,
};

const DEFAULT_TABLE_LABELS: TableLabels = {
  search: "بحث",
  searchPlaceholder: "ابحث بعنوان العمل أو الرابط أو التصنيف...",
  create: "إضافة",
  edit: "تعديل",
  delete: "حذف",
  refresh: "تحديث",
  actions: "الإجراءات",
  loading: "جاري التحميل...",
  emptyTitle: "لا توجد أعمال",
  emptyDescription: "لم يتم إضافة أي أعمال بعد.",
  save: "حفظ",
  close: "إغلاق",
  confirmDelete: "هل تريد حذف هذا العمل؟",
  yesDelete: "نعم، حذف",
  cancel: "إلغاء",
  active: "منشور",
  inactive: "مخفي",
  unknown: "غير معروف",
  chooseFromLibrary: "اختيار من المكتبة",
  clearMedia: "إزالة الملف",
  open: "فتح",
  addItem: "إضافة عنصر",
  remove: "إزالة",
  error: "حدث خطأ",
  title: "العنوان",
  status: "الحالة",
  mediaPickerTitle: "مكتبة الوسائط",
  mediaPickerDescription: "اختر صورة أو ملفًا من مكتبة الوسائط.",
  mediaPickerSearch: "بحث في الوسائط",
  mediaPickerEmptyTitle: "لا توجد وسائط",
  mediaPickerEmptyDescription: "ارفع ملفًا جديدًا أو جرّب البحث بكلمة أخرى.",
  uploadFromDevice: "رفع من الجهاز",
  chooseFile: "اختيار ملف",
  upload: "رفع",
  select: "اختيار",
};

const DEFAULT_PORTFOLIO_LABELS: AdminPortfolioLabels = {
  title: "أعمالنا",
  description: "إدارة المشاريع والأعمال التي تظهر في الموقع العام.",
  createProject: "إضافة عمل",
  editProject: "تعديل عمل",
  preview: "معاينة الإدارة",
  viewPublicPage: "فتح في الموقع",
  basicInfo: "البيانات الأساسية",
  content: "المحتوى",
  caseStudy: "دراسة الحالة",
  media: "الصور والروابط",
  technologies: "التقنيات المستخدمة",
  gallery: "معرض الصور",
  seo: "تحسين محركات البحث",
  publishing: "النشر والظهور",
  all: "الكل",
  active: "منشورة",
  inactive: "مخفية",
  deleted: "محذوفة",
  total: "إجمالي الأعمال",
  activeProjects: "الأعمال المنشورة",
  inactiveProjects: "الأعمال المخفية",
  deletedProjects: "الأعمال المحذوفة",
  technologiesTotal: "إجمالي التقنيات",
  statusFilter: "فلترة الحالة",
  titleAr: "العنوان بالعربية",
  titleEn: "العنوان بالإنجليزية",
  slugAr: "الرابط بالعربية",
  slugEn: "الرابط بالإنجليزية",
  descriptionAr: "الوصف المختصر بالعربية",
  descriptionEn: "الوصف المختصر بالإنجليزية",
  fullDescriptionAr: "الوصف التفصيلي بالعربية",
  fullDescriptionEn: "الوصف التفصيلي بالإنجليزية",
  problemAr: "المشكلة بالعربية",
  problemEn: "المشكلة بالإنجليزية",
  resultAr: "النتيجة بالعربية",
  resultEn: "النتيجة بالإنجليزية",
  categoryAr: "التصنيف بالعربية",
  categoryEn: "التصنيف بالإنجليزية",
  mainImageUrl: "الصورة الرئيسية",
  previewUrl: "رابط المعاينة",
  completedAt: "تاريخ الإنجاز",
  sortOrder: "ترتيب الظهور",
  isActive: "نشر العمل في الموقع",
  seoTitleAr: "عنوان SEO بالعربية",
  seoTitleEn: "عنوان SEO بالإنجليزية",
  seoDescriptionAr: "وصف SEO بالعربية",
  seoDescriptionEn: "وصف SEO بالإنجليزية",
  technologiesHint: "اكتب كل تقنية في سطر منفصل.",
  galleryHint: "اكتب كل رابط صورة في سطر منفصل.",
  projectImage: "صورة العمل",
  category: "التصنيف",
  completed: "تاريخ الإنجاز",
  techCount: "التقنيات",
  galleryCount: "الصور",
  restore: "استعادة",
  confirmRestore: "هل تريد استعادة هذا العمل؟",
  yesRestore: "نعم، استعادة",
  requiredMessage: "يرجى إدخال العنوان والرابط والوصف بالعربية والإنجليزية.",
  savedMessage: "تم حفظ العمل بنجاح.",
  restoredMessage: "تمت استعادة العمل بنجاح.",
  deletedMessage: "تم حذف العمل بنجاح.",
  noImage: "بدون صورة",
  noTechnologies: "لا توجد تقنيات",
};

function ensureArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0,
      )
    : [];
}

function normalizeProject(value: Partial<PortfolioProject>): PortfolioProject {
  return {
    ...emptyProject,
    ...value,
    technologies: ensureArray(value.technologies),
    gallery_images: ensureArray(value.gallery_images),
    sort_order: Number(value.sort_order ?? 0),
    is_active: Boolean(value.is_active ?? true),
    completed_at: value.completed_at
      ? String(value.completed_at).slice(0, 10)
      : "",
  };
}

function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinLines(value: string[]) {
  return value.join("\n");
}

function projectTitle(project: PortfolioProject, locale: Locale) {
  return locale === "ar"
    ? project.title_ar || project.title_en
    : project.title_en || project.title_ar;
}

function projectSlug(project: PortfolioProject, locale: Locale) {
  return locale === "ar"
    ? project.slug_ar || project.slug_en
    : project.slug_en || project.slug_ar;
}

function projectCategory(project: PortfolioProject, locale: Locale) {
  return locale === "ar"
    ? project.category_ar || project.category_en
    : project.category_en || project.category_ar;
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^؀-ۿa-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function cleanPayload(project: PortfolioProject): Record<string, unknown> {
  const fallbackSlug =
    normalizeSlug(project.slug_ar || project.title_ar) ||
    `portfolio-${Date.now()}`;

  return {
    title_ar: project.title_ar.trim(),
    title_en: project.title_en.trim() || project.title_ar.trim(),
    slug_ar: normalizeSlug(project.slug_ar || fallbackSlug),
    slug_en: normalizeSlug(project.slug_en || fallbackSlug),
    description_ar: project.description_ar.trim(),
    description_en: project.description_en.trim() || project.description_ar.trim(),
    full_description_ar: project.full_description_ar?.trim() || null,
    full_description_en: project.full_description_en?.trim() || project.full_description_ar?.trim() || null,
    problem_ar: project.problem_ar?.trim() || null,
    problem_en: project.problem_en?.trim() || project.problem_ar?.trim() || null,
    result_ar: project.result_ar?.trim() || null,
    result_en: project.result_en?.trim() || project.result_ar?.trim() || null,
    category_ar: project.category_ar?.trim() || null,
    category_en: project.category_en?.trim() || project.category_ar?.trim() || null,
    technologies: project.technologies,
    gallery_images: project.gallery_images,
    main_image_url: project.main_image_url?.trim() || null,
    preview_url: project.preview_url?.trim() || null,
    completed_at: project.completed_at || null,
    seo_title_ar: project.seo_title_ar?.trim() || null,
    seo_title_en: project.seo_title_en?.trim() || project.seo_title_ar?.trim() || null,
    seo_description_ar: project.seo_description_ar?.trim() || null,
    seo_description_en: project.seo_description_en?.trim() || project.seo_description_ar?.trim() || null,
    sort_order: Number(project.sort_order || 0),
    is_active: Boolean(project.is_active),
  };
}

function statTone(filter: PortfolioFilter): BadgeTone {
  if (filter === "active") return "success";
  if (filter === "inactive") return "warning";
  if (filter === "deleted") return "danger";
  return "primary";
}

export function AdminPortfolioPage({
  locale,
  labels: labelsInput,
  tableLabels: tableLabelsInput,
}: AdminPortfolioPageProps) {
  const labels: AdminPortfolioLabels = {
    ...DEFAULT_PORTFOLIO_LABELS,
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
  const [filter, setFilter] = useState<PortfolioFilter>("all");
  const [draft, setDraft] = useState<PortfolioProject | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PortfolioProject | null>(
    null,
  );
  const [restoreTarget, setRestoreTarget] = useState<PortfolioProject | null>(
    null,
  );
  const [mediaTarget, setMediaTarget] = useState<MediaTarget | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const queryKey = useMemo(() => ["admin-portfolio", search], [search]);

  const query = useQuery({
    queryKey,
    queryFn: () =>
      listAdminItems("/admin/portfolio", {
        token,
        search,
        includeDeleted: true,
        skip: 0,
        limit: 100,
      }) as Promise<PortfolioProject[]>,
    enabled: Boolean(token),
  });

  const projects = useMemo(
    () => (query.data ?? []).map((item) => normalizeProject(item)),
    [query.data],
  );

  const visibleProjects = useMemo(() => {
    return projects.filter((project) => {
      if (filter === "active") return project.is_active && !project.is_deleted;
      if (filter === "inactive")
        return !project.is_active && !project.is_deleted;
      if (filter === "deleted") return Boolean(project.is_deleted);
      return true;
    });
  }, [filter, projects]);

  const stats = useMemo(
    () => ({
      total: projects.length,
      active: projects.filter(
        (project) => project.is_active && !project.is_deleted,
      ).length,
      inactive: projects.filter(
        (project) => !project.is_active && !project.is_deleted,
      ).length,
      deleted: projects.filter((project) => project.is_deleted).length,
      technologies: projects.reduce(
        (sum, project) => sum + project.technologies.length,
        0,
      ),
    }),
    [projects],
  );

  const updateDraft = (updates: Partial<PortfolioProject>) => {
    setDraft((current) => (current ? { ...current, ...updates } : current));
  };

  const field =
    (key: keyof PortfolioProject) =>
    (
      event: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      const target = event.target as
        | HTMLInputElement
        | HTMLTextAreaElement
        | HTMLSelectElement;
      const value =
        target instanceof HTMLInputElement && target.type === "checkbox"
          ? target.checked
          : target.value;
      updateDraft({
        [key]: key === "sort_order" ? Number(value || 0) : value,
      } as Partial<PortfolioProject>);
    };

  const applyAiContent = (
    targetField: AiTargetField,
    content: AiGeneratedContent,
  ) => {
    setDraft((current) => {
      if (!current) return current;
      const next: PortfolioProject = { ...current };

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
      return next;
    });
  };

  const aiButton = (targetField: AiTargetField, label = "توليد") => (
    <AdminAiFieldButton
      token={token}
      entityType="portfolio"
      targetField={targetField}
      titleAr={draft?.title_ar ?? ""}
      shortDescriptionAr={draft?.description_ar ?? ""}
      fullDescriptionAr={draft?.full_description_ar ?? ""}
      contextAr={draft?.category_ar ?? ""}
      label={label}
      onApply={(content) => applyAiContent(targetField, content)}
    />
  );

  const aiImageButton = (label = "توليد صورة") => (
    <AdminAiImageButton
      token={token}
      entityType="portfolio"
      imageKind="image"
      titleAr={draft?.title_ar ?? ""}
      shortDescriptionAr={draft?.description_ar ?? ""}
      fullDescriptionAr={draft?.full_description_ar ?? ""}
      contextAr={draft?.category_ar ?? ""}
      label={label}
      onApply={(url) => updateDraft({ main_image_url: url })}
    />
  );

  const openCreate = () => {
    setFormError(null);
    setNotice(null);
    setDraft({ ...emptyProject });
  };

  const openEdit = (project: PortfolioProject) => {
    setFormError(null);
    setNotice(null);
    setDraft(normalizeProject(project));
  };

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-portfolio"] });
    await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
  };

  const handleSave = async () => {
    if (!draft || !token) return;

    if (!draft.title_ar.trim()) {
      setFormError(labels.requiredMessage);
      return;
    }

    if (!draft.description_ar.trim()) {
      setFormError(labels.requiredMessage);
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      const payload = cleanPayload(draft);
      if (draft.id) {
        await updateAdminItem(`/admin/portfolio/${draft.id}`, token, payload);
      } else {
        await createAdminItem("/admin/portfolio", token, payload);
      }
      await invalidate();
      setDraft(null);
      setNotice(labels.savedMessage);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : tableLabels.error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id || !token) return;
    await deleteAdminItem(`/admin/portfolio/${deleteTarget.id}`, token);
    await invalidate();
    setDeleteTarget(null);
    setNotice(labels.deletedMessage);
  };

  const handleRestore = async () => {
    if (!restoreTarget?.id || !token) return;
    await restoreAdminPortfolio(token, restoreTarget.id);
    await invalidate();
    setRestoreTarget(null);
    setNotice(labels.restoredMessage);
  };

  const handleMediaSelect = (url: string) => {
    if (!draft || !mediaTarget) return;
    if (mediaTarget === "main") {
      updateDraft({ main_image_url: url });
      return;
    }
    updateDraft({ gallery_images: [...draft.gallery_images, url] });
  };

  const columns = [
    {
      key: "image",
      header: labels.projectImage,
      render: (project: PortfolioProject) => {
        const imageUrl = buildBackendAssetUrl(project.main_image_url);
        return imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={projectTitle(project, locale)}
            className="h-14 w-20 rounded-appMd border border-app-border object-cover"
          />
        ) : (
          <div className="grid h-14 w-20 place-items-center rounded-appMd border border-dashed border-app-border bg-app-surfaceElevated text-xs text-app-muted">
            {labels.noImage}
          </div>
        );
      },
    },
    {
      key: "title",
      header: tableLabels.title,
      render: (project: PortfolioProject) => (
        <div className="grid gap-1 text-start">
          <strong className="text-sm text-app-foreground">
            {projectTitle(project, locale)}
          </strong>
          <span className="text-xs text-app-muted">
            /{projectSlug(project, locale)}
          </span>
          {projectCategory(project, locale) ? (
            <span className="text-xs text-app-muted">
              {projectCategory(project, locale)}
            </span>
          ) : null}
        </div>
      ),
    },
    {
      key: "meta",
      header: labels.technologies,
      render: (project: PortfolioProject) => (
        <div className="flex max-w-xs flex-wrap gap-1">
          {project.technologies.length > 0 ? (
            project.technologies.slice(0, 4).map((tech) => (
              <AppBadge key={tech} tone="primary" className="px-2 py-1">
                {tech}
              </AppBadge>
            ))
          ) : (
            <span className="text-xs text-app-muted">
              {labels.noTechnologies}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "counts",
      header: labels.gallery,
      render: (project: PortfolioProject) => (
        <div className="grid gap-1 text-xs text-app-muted">
          <span>
            {labels.techCount}: {project.technologies.length}
          </span>
          <span>
            {labels.galleryCount}: {project.gallery_images.length}
          </span>
        </div>
      ),
    },
    {
      key: "completed",
      header: labels.completed,
      render: (project: PortfolioProject) => (
        <span className="text-sm text-app-muted">
          {project.completed_at || "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: tableLabels.status,
      render: (project: PortfolioProject) =>
        project.is_deleted ? (
          <AppBadge tone="danger">{labels.deleted}</AppBadge>
        ) : project.is_active ? (
          <AppBadge tone="success">{tableLabels.active}</AppBadge>
        ) : (
          <AppBadge tone="warning">{tableLabels.inactive}</AppBadge>
        ),
    },
    {
      key: "actions",
      header: tableLabels.actions,
      render: (project: PortfolioProject) => (
        <div className="flex flex-wrap gap-2">
          <AppButton
            className="min-h-9 px-3"
            variant="secondary"
            onClick={() => openEdit(project)}
            icon={<AppIcon name="edit" size={15} />}
          >
            {tableLabels.edit}
          </AppButton>
          <AppButton
            className="min-h-9 px-3"
            variant="secondary"
            onClick={() =>
              window.open(
                buildPublicSiteUrl(locale, "portfolio", projectSlug(project, locale)),
                "_blank",
                "noopener,noreferrer",
              )
            }
            icon={<AppIcon name="external" size={15} />}
          >
            {tableLabels.open}
          </AppButton>
          {project.is_deleted ? (
            <AppButton
              className="min-h-9 px-3"
              variant="secondary"
              onClick={() => setRestoreTarget(project)}
              icon={<AppIcon name="refresh" size={15} />}
            >
              {labels.restore}
            </AppButton>
          ) : (
            <AppButton
              className="min-h-9 px-3"
              variant="danger"
              onClick={() => setDeleteTarget(project)}
              icon={<AppIcon name="trash" size={15} />}
            >
              {tableLabels.delete}
            </AppButton>
          )}
        </div>
      ),
    },
  ];

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
              {labels.createProject}
            </AppButton>
          </>
        }
      />

      {notice ? (
        <AppCard className="border-app-success/30 bg-app-success/10 p-4 text-sm font-semibold text-app-success">
          {notice}
        </AppCard>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["all", labels.total, stats.total],
          ["active", labels.activeProjects, stats.active],
          ["inactive", labels.inactiveProjects, stats.inactive],
          ["deleted", labels.deletedProjects, stats.deleted],
          ["all", labels.technologiesTotal, stats.technologies],
        ].map(([tone, title, value]) => (
          <AppCard key={`${title}-${value}`} className="grid gap-3 p-4">
            <AppBadge
              tone={statTone(tone as PortfolioFilter)}
              className="w-fit"
            >
              {title}
            </AppBadge>
            <strong className="text-3xl font-bold text-app-foreground">
              {value}
            </strong>
          </AppCard>
        ))}
      </div>

      <AppCard className="grid gap-4 p-4">
        <div className="grid gap-4 lg:grid-cols-[1fr_240px_auto] lg:items-end">
          <AppInput
            label={tableLabels.search}
            placeholder={tableLabels.searchPlaceholder}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <AppSelect
            label={labels.statusFilter}
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value as PortfolioFilter)
            }
          >
            <option value="all">{labels.all}</option>
            <option value="active">{labels.active}</option>
            <option value="inactive">{labels.inactive}</option>
            <option value="deleted">{labels.deleted}</option>
          </AppSelect>
          <AppButton
            variant="secondary"
            onClick={() => {
              setSearch("");
              setFilter("all");
            }}
          >
            {tableLabels.close}
          </AppButton>
        </div>
      </AppCard>

      {query.isLoading ? <AppLoadingState text={tableLabels.loading} /> : null}
      {query.isError ? (
        <AppErrorState
          title={tableLabels.error}
          description={String(query.error)}
        />
      ) : null}
      {!query.isLoading && !query.isError && visibleProjects.length === 0 ? (
        <AppEmptyState
          icon="portfolio"
          title={tableLabels.emptyTitle}
          description={tableLabels.emptyDescription}
        />
      ) : null}
      {!query.isLoading && !query.isError && visibleProjects.length > 0 ? (
        <AppTable
          columns={columns}
          rows={visibleProjects}
          getRowKey={(row) => row.id ?? `${row.slug_ar}-${row.slug_en}`}
        />
      ) : null}

      <AppModal
        open={Boolean(draft)}
        title={draft?.id ? labels.editProject : labels.createProject}
        onClose={() => setDraft(null)}
        size="xl"
      >
        {draft ? (
          <div className="grid gap-5">
            {formError ? (
              <AppErrorState
                title={tableLabels.error}
                description={formError}
              />
            ) : null}

            <AppCard className="grid gap-4 p-4">
              <h3 className="font-bold text-app-foreground">
                {labels.basicInfo}
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <AppInput
                  label={labels.titleAr}
                  value={draft.title_ar}
                  onChange={field("title_ar")}
                  labelAction={aiButton("improved_title_ar")}
                />
                <AppInput
                  label={labels.titleEn}
                  value={draft.title_en}
                  onChange={field("title_en")}
                />
                <AppInput
                  label={labels.slugAr}
                  value={draft.slug_ar}
                  onChange={field("slug_ar")}
                  labelAction={aiButton("slug")}
                />
                <AppInput
                  label={labels.slugEn}
                  value={draft.slug_en}
                  onChange={field("slug_en")}
                />
                <AppInput
                  label={labels.categoryAr}
                  value={draft.category_ar ?? ""}
                  onChange={field("category_ar")}
                />
                <AppInput
                  label={labels.categoryEn}
                  value={draft.category_en ?? ""}
                  onChange={field("category_en")}
                />
                <AppInput
                  label={labels.completedAt}
                  type="date"
                  value={draft.completed_at ?? ""}
                  onChange={field("completed_at")}
                />
                <AppInput
                  label={labels.sortOrder}
                  type="number"
                  value={draft.sort_order}
                  onChange={field("sort_order")}
                />
              </div>
            </AppCard>

            <AppCard className="grid gap-4 p-4">
              <h3 className="font-bold text-app-foreground">
                {labels.content}
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <AppTextarea
                  label={labels.descriptionAr}
                  value={draft.description_ar}
                  onChange={field("description_ar")}
                  labelAction={aiButton("short_description_ar")}
                />
                <AppTextarea
                  label={labels.descriptionEn}
                  value={draft.description_en}
                  onChange={field("description_en")}
                />
                <AppTextarea
                  label={labels.fullDescriptionAr}
                  value={draft.full_description_ar ?? ""}
                  onChange={field("full_description_ar")}
                  labelAction={aiButton("full_description_ar")}
                />
                <AppTextarea
                  label={labels.fullDescriptionEn}
                  value={draft.full_description_en ?? ""}
                  onChange={field("full_description_en")}
                />
              </div>
            </AppCard>

            <AppCard className="grid gap-4 p-4">
              <h3 className="font-bold text-app-foreground">
                {labels.caseStudy}
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <AppTextarea
                  label={labels.problemAr}
                  value={draft.problem_ar ?? ""}
                  onChange={field("problem_ar")}
                />
                <AppTextarea
                  label={labels.problemEn}
                  value={draft.problem_en ?? ""}
                  onChange={field("problem_en")}
                />
                <AppTextarea
                  label={labels.resultAr}
                  value={draft.result_ar ?? ""}
                  onChange={field("result_ar")}
                />
                <AppTextarea
                  label={labels.resultEn}
                  value={draft.result_en ?? ""}
                  onChange={field("result_en")}
                />
              </div>
            </AppCard>

            <AppCard className="grid gap-4 p-4">
              <h3 className="font-bold text-app-foreground">{labels.media}</h3>
              <div className="grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-end">
                <AppInput
                  label={labels.mainImageUrl}
                  value={draft.main_image_url ?? ""}
                  onChange={field("main_image_url")}
                />
                <AppButton
                  variant="secondary"
                  onClick={() => setMediaTarget("main")}
                >
                  {tableLabels.chooseFromLibrary}
                </AppButton>
                {aiImageButton()}
                <AppButton
                  variant="ghost"
                  onClick={() => updateDraft({ main_image_url: "" })}
                >
                  {tableLabels.clearMedia}
                </AppButton>
              </div>
              <AppInput
                label={labels.previewUrl}
                value={draft.preview_url ?? ""}
                onChange={field("preview_url")}
              />
              <AppTextarea
                label={labels.gallery}
                value={joinLines(draft.gallery_images)}
                onChange={(event) =>
                  updateDraft({
                    gallery_images: splitLines(event.target.value),
                  })
                }
                placeholder={labels.galleryHint}
              />
              <div className="flex flex-wrap gap-2">
                <AppButton
                  variant="secondary"
                  onClick={() => setMediaTarget("gallery")}
                >
                  {tableLabels.chooseFromLibrary}
                </AppButton>
                <AppButton
                  variant="ghost"
                  onClick={() => updateDraft({ gallery_images: [] })}
                >
                  {tableLabels.clearMedia}
                </AppButton>
              </div>
            </AppCard>

            <AppCard className="grid gap-4 p-4">
              <h3 className="font-bold text-app-foreground">
                {labels.technologies}
              </h3>
              <AppTextarea
                label={labels.technologies}
                value={joinLines(draft.technologies)}
                onChange={(event) =>
                  updateDraft({ technologies: splitLines(event.target.value) })
                }
                placeholder={labels.technologiesHint}
              />
            </AppCard>

            <AppCard className="grid gap-4 p-4">
              <h3 className="font-bold text-app-foreground">{labels.seo}</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <AppInput
                  label={labels.seoTitleAr}
                  value={draft.seo_title_ar ?? ""}
                  onChange={field("seo_title_ar")}
                  labelAction={aiButton("seo_title_ar")}
                />
                <AppInput
                  label={labels.seoTitleEn}
                  value={draft.seo_title_en ?? ""}
                  onChange={field("seo_title_en")}
                />
                <AppTextarea
                  label={labels.seoDescriptionAr}
                  value={draft.seo_description_ar ?? ""}
                  onChange={field("seo_description_ar")}
                  labelAction={aiButton("seo_description_ar")}
                />
                <AppTextarea
                  label={labels.seoDescriptionEn}
                  value={draft.seo_description_en ?? ""}
                  onChange={field("seo_description_en")}
                />
              </div>
            </AppCard>

            <AppCard className="grid gap-4 p-4">
              <h3 className="font-bold text-app-foreground">
                {labels.publishing}
              </h3>
              <label className="flex items-center gap-3 text-sm font-semibold text-app-foreground">
                <input
                  type="checkbox"
                  checked={draft.is_active}
                  onChange={field("is_active")}
                />
                {labels.isActive}
              </label>
            </AppCard>

            <div className="flex flex-wrap justify-end gap-3">
              <AppButton variant="secondary" onClick={() => setDraft(null)}>
                {tableLabels.close}
              </AppButton>
              <AppButton
                disabled={isSaving}
                onClick={handleSave}
                icon={<AppIcon name="save" size={17} />}
              >
                {isSaving ? tableLabels.loading : tableLabels.save}
              </AppButton>
            </div>
          </div>
        ) : null}
      </AppModal>

      {draft ? (
        <AdminMediaPicker
          open={Boolean(mediaTarget)}
          token={token}
          labels={tableLabels}
          imagesOnly
          onClose={() => setMediaTarget(null)}
          onSelect={handleMediaSelect}
        />
      ) : null}

      <AppConfirmDialog
        open={Boolean(deleteTarget)}
        title={tableLabels.confirmDelete}
        description={deleteTarget ? projectTitle(deleteTarget, locale) : ""}
        confirmText={tableLabels.yesDelete}
        cancelText={tableLabels.cancel}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <AppConfirmDialog
        open={Boolean(restoreTarget)}
        title={labels.confirmRestore}
        description={restoreTarget ? projectTitle(restoreTarget, locale) : ""}
        confirmText={labels.yesRestore}
        cancelText={tableLabels.cancel}
        onConfirm={handleRestore}
        onCancel={() => setRestoreTarget(null)}
      />
    </div>
  );
}
