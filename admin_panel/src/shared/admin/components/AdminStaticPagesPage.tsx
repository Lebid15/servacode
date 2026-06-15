"use client";

/**
 * =====================================================
 * AdminStaticPagesPage
 * إدارة الصفحات الرسمية أو الأسئلة الشائعة كصفحات مستقلة.
 * =====================================================
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import {
  createAdminItem,
  deleteAdminItem,
  ensureDefaultStaticPages,
  listAdminItems,
  restoreAdminFaq,
  restoreAdminStaticPage,
  updateAdminItem
} from "@/shared/api/admin-client";
import { useAdminAuth } from "@/shared/auth/AdminAuthProvider";
import { AppBadge, type BadgeTone } from "@/shared/design-system/components/AppBadge";
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
import type { Locale } from "@/shared/design-system/utils/direction";

type StaticPageRow = Record<string, unknown> & {
  id: string;
  page_key: string;
  title_ar: string;
  title_en: string;
  slug_ar: string;
  slug_en: string;
  content_ar?: string | null;
  content_en?: string | null;
  sections?: Record<string, unknown> | null;
  seo_title_ar?: string | null;
  seo_title_en?: string | null;
  seo_description_ar?: string | null;
  seo_description_en?: string | null;
  is_active?: boolean;
  is_deleted?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

type FaqScope = "general" | "service" | "product";

type FaqRow = Record<string, unknown> & {
  id: string;
  scope?: FaqScope;
  question_ar: string;
  question_en: string;
  answer_ar: string;
  answer_en: string;
  sort_order?: number;
  is_active?: boolean;
  is_deleted?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

type StatusFilter = "all" | "active" | "hidden" | "deleted";
type ActivePanel = "pages" | "faqs";

type StaticPageForm = {
  page_key: string;
  title_ar: string;
  title_en: string;
  slug_ar: string;
  slug_en: string;
  content_ar: string;
  content_en: string;
  seo_title_ar: string;
  seo_title_en: string;
  seo_description_ar: string;
  seo_description_en: string;
  sections_text: string;
  is_active: boolean;
};

type FaqForm = {
  scope: FaqScope;
  question_ar: string;
  question_en: string;
  answer_ar: string;
  answer_en: string;
  sort_order: string;
  is_active: boolean;
};

type AdminStaticPagesLabels = ReturnType<typeof getStaticPagesLabels>;

type AdminStaticPagesPageProps = {
  locale: Locale;
  labels?: AdminStaticPagesLabels;
  initialPanel?: ActivePanel;
};

const pagesEndpoint = "/admin/static-pages";
const faqsEndpoint = "/admin/faqs";

const initialForm: StaticPageForm = {
  page_key: "",
  title_ar: "",
  title_en: "",
  slug_ar: "",
  slug_en: "",
  content_ar: "",
  content_en: "",
  seo_title_ar: "",
  seo_title_en: "",
  seo_description_ar: "",
  seo_description_en: "",
  sections_text: "{}",
  is_active: true
};

const initialFaqForm: FaqForm = {
  scope: "general",
  question_ar: "",
  question_en: "",
  answer_ar: "",
  answer_en: "",
  sort_order: "0",
  is_active: true
};

export function getStaticPagesLabels(locale: Locale) {
  const isAr = locale === "ar";

  return {
    title: isAr ? "الصفحات الثابتة" : "Static Pages",
    description: isAr
      ? "إدارة الصفحات الرسمية فقط مثل من نحن، الخصوصية، الشروط، وسياسة الدعم."
      : "Manage official pages only, such as About, Privacy, Terms, and Support Policy.",
    faqTitle: isAr ? "الأسئلة الشائعة" : "FAQs",
    faqDescription: isAr
      ? "إدارة الأسئلة الشائعة كقسم مستقل بعيدًا عن الصفحات الثابتة."
      : "Manage FAQs as a standalone section separate from static pages.",
    eyebrow: isAr ? "محتوى رسمي" : "Official content",
    pagesTab: isAr ? "الصفحات الرسمية" : "Official pages",
    faqsTab: isAr ? "الأسئلة الشائعة" : "FAQs",
    addPage: isAr ? "إضافة صفحة" : "Add page",
    addFaq: isAr ? "إضافة سؤال" : "Add FAQ",
    editPage: isAr ? "تعديل الصفحة" : "Edit page",
    editFaq: isAr ? "تعديل السؤال" : "Edit FAQ",
    refresh: isAr ? "تحديث" : "Refresh",
    ensureDefaults: isAr ? "تجهيز الصفحات الافتراضية" : "Ensure default pages",
    search: isAr ? "بحث" : "Search",
    searchPlaceholder: isAr ? "ابحث بالعنوان أو الرابط..." : "Search by title or slug...",
    faqSearchPlaceholder: isAr ? "ابحث بالسؤال أو الإجابة..." : "Search by question or answer...",
    statusFilter: isAr ? "فلترة الحالة" : "Filter status",
    all: isAr ? "الكل" : "All",
    active: isAr ? "منشورة" : "Published",
    hidden: isAr ? "مخفية" : "Hidden",
    deleted: isAr ? "محذوفة" : "Deleted",
    save: isAr ? "حفظ" : "Save",
    savePage: isAr ? "حفظ الصفحة" : "Save page",
    saveFaq: isAr ? "حفظ السؤال" : "Save FAQ",
    create: isAr ? "إنشاء" : "Create",
    cancel: isAr ? "إلغاء" : "Cancel",
    close: isAr ? "إغلاق" : "Close",
    preview: isAr ? "معاينة" : "Preview",
    edit: isAr ? "تعديل" : "Edit",
    remove: isAr ? "حذف" : "Delete",
    restore: isAr ? "استعادة" : "Restore",
    loading: isAr ? "جاري تحميل البيانات..." : "Loading data...",
    emptyTitle: isAr ? "لا توجد بيانات بعد" : "No data yet",
    emptyPagesDescription: isAr
      ? "اضغط تجهيز الصفحات الافتراضية لإنشاء من نحن، الخصوصية، الشروط، وسياسة الدعم."
      : "Use ensure defaults to create About, Privacy, Terms, and Support Policy pages.",
    emptyFaqsDescription: isAr
      ? "أضف الأسئلة التي تساعد العميل على فهم طريقة العمل قبل إرسال طلب مشروع."
      : "Add questions that help clients understand your workflow before submitting a project request.",
    error: isAr ? "تعذر تحميل البيانات." : "Failed to load data.",
    saved: isAr ? "تم الحفظ بنجاح." : "Saved successfully.",
    saveFailed: isAr ? "تعذر الحفظ." : "Failed to save.",
    defaultsReady: isAr ? "تم تجهيز الصفحات الافتراضية." : "Default pages are ready.",
    confirmDeletePage: isAr ? "هل تريد حذف هذه الصفحة؟" : "Delete this page?",
    confirmDeleteFaq: isAr ? "هل تريد حذف هذا السؤال؟" : "Delete this FAQ?",
    confirmDeleteDescription: isAr
      ? "سيتم الحذف حذفًا ناعمًا ويمكن الاستعادة لاحقًا."
      : "This is a soft delete and can be restored later.",
    yesDelete: isAr ? "نعم، احذف" : "Yes, delete",
    general: isAr ? "عام" : "General",
    service: isAr ? "خدمة" : "Service",
    product: isAr ? "نظام" : "Product",
    fields: {
      pageKey: isAr ? "مفتاح الصفحة" : "Page key",
      titleAr: isAr ? "العنوان العربي" : "Arabic title",
      titleEn: isAr ? "العنوان الإنجليزي" : "English title",
      slugAr: isAr ? "الرابط العربي" : "Arabic slug",
      slugEn: isAr ? "الرابط الإنجليزي" : "English slug",
      contentAr: isAr ? "المحتوى العربي" : "Arabic content",
      contentEn: isAr ? "المحتوى الإنجليزي" : "English content",
      seoTitleAr: isAr ? "عنوان SEO عربي" : "Arabic SEO title",
      seoTitleEn: isAr ? "عنوان SEO إنجليزي" : "English SEO title",
      seoDescriptionAr: isAr ? "وصف SEO عربي" : "Arabic SEO description",
      seoDescriptionEn: isAr ? "وصف SEO إنجليزي" : "English SEO description",
      sections: isAr ? "بيانات إضافية JSON" : "Extra JSON data",
      questionAr: isAr ? "السؤال العربي" : "Arabic question",
      questionEn: isAr ? "السؤال الإنجليزي" : "English question",
      answerAr: isAr ? "الإجابة العربية" : "Arabic answer",
      answerEn: isAr ? "الإجابة الإنجليزية" : "English answer",
      scope: isAr ? "نوع السؤال" : "FAQ scope",
      sortOrder: isAr ? "ترتيب الظهور" : "Sort order",
      status: isAr ? "الحالة" : "Status",
      updatedAt: isAr ? "آخر تحديث" : "Last update",
      actions: isAr ? "الإجراءات" : "Actions"
    },
    hints: {
      key: isAr ? "مثال: about, privacy, terms, support-policy" : "Example: about, privacy, terms, support-policy",
      content: isAr
        ? "افصل الفقرات بسطر جديد حتى تظهر مرتبة في الموقع."
        : "Separate paragraphs with new lines for clean rendering on the website.",
      sections: isAr ? "اختياري. اتركه {} إذا لا تحتاجه." : "Optional. Keep {} if unused.",
      faq: isAr
        ? "الأسئلة العامة تظهر في الموقع العام، والأسئلة الخاصة يمكن استخدامها لاحقًا للخدمات أو الأنظمة."
        : "General FAQs appear on the public website; scoped FAQs can later be used for services or products."
    },
    stats: {
      totalPages: isAr ? "إجمالي الصفحات" : "Total pages",
      activePages: isAr ? "صفحات منشورة" : "Published pages",
      hiddenPages: isAr ? "صفحات مخفية" : "Hidden pages",
      deletedPages: isAr ? "صفحات محذوفة" : "Deleted pages",
      totalFaqs: isAr ? "إجمالي الأسئلة" : "Total FAQs",
      activeFaqs: isAr ? "أسئلة منشورة" : "Published FAQs",
      hiddenFaqs: isAr ? "أسئلة مخفية" : "Hidden FAQs",
      deletedFaqs: isAr ? "أسئلة محذوفة" : "Deleted FAQs"
    }
  };
}

function normalizeText(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function contentStatus(row: { is_deleted?: boolean; is_active?: boolean }): StatusFilter {
  if (row.is_deleted) {
    return "deleted";
  }
  return row.is_active === false ? "hidden" : "active";
}

function statusTone(status: StatusFilter): BadgeTone {
  if (status === "active") {
    return "success";
  }
  if (status === "hidden") {
    return "warning";
  }
  if (status === "deleted") {
    return "danger";
  }
  return "neutral";
}

function scopeTone(scope?: FaqScope): BadgeTone {
  if (scope === "service") {
    return "primary";
  }
  if (scope === "product") {
    return "warning";
  }
  return "neutral";
}

function formatDate(value?: string | null, locale?: Locale) {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function toForm(row?: StaticPageRow | null): StaticPageForm {
  if (!row) {
    return initialForm;
  }

  return {
    page_key: row.page_key ?? "",
    title_ar: row.title_ar ?? "",
    title_en: row.title_en ?? "",
    slug_ar: row.slug_ar ?? "",
    slug_en: row.slug_en ?? "",
    content_ar: row.content_ar ?? "",
    content_en: row.content_en ?? "",
    seo_title_ar: row.seo_title_ar ?? "",
    seo_title_en: row.seo_title_en ?? "",
    seo_description_ar: row.seo_description_ar ?? "",
    seo_description_en: row.seo_description_en ?? "",
    sections_text: JSON.stringify(row.sections ?? {}, null, 2),
    is_active: row.is_active !== false
  };
}

function toFaqForm(row?: FaqRow | null): FaqForm {
  if (!row) {
    return initialFaqForm;
  }

  return {
    scope: row.scope ?? "general",
    question_ar: row.question_ar ?? "",
    question_en: row.question_en ?? "",
    answer_ar: row.answer_ar ?? "",
    answer_en: row.answer_en ?? "",
    sort_order: String(row.sort_order ?? 0),
    is_active: row.is_active !== false
  };
}

function buildPagePayload(form: StaticPageForm, isCreate: boolean) {
  let sections: Record<string, unknown> = {};
  try {
    sections = JSON.parse(form.sections_text || "{}");
  } catch {
    sections = {};
  }

  const payload: Record<string, unknown> = {
    title_ar: form.title_ar.trim(),
    title_en: form.title_en.trim(),
    slug_ar: form.slug_ar.trim(),
    slug_en: form.slug_en.trim(),
    content_ar: form.content_ar.trim() || null,
    content_en: form.content_en.trim() || null,
    seo_title_ar: form.seo_title_ar.trim() || null,
    seo_title_en: form.seo_title_en.trim() || null,
    seo_description_ar: form.seo_description_ar.trim() || null,
    seo_description_en: form.seo_description_en.trim() || null,
    sections,
    is_active: form.is_active
  };

  if (isCreate) {
    payload.page_key = form.page_key.trim();
  }

  return payload;
}

function buildFaqPayload(form: FaqForm) {
  return {
    scope: form.scope,
    question_ar: form.question_ar.trim(),
    question_en: form.question_en.trim(),
    answer_ar: form.answer_ar.trim(),
    answer_en: form.answer_en.trim(),
    sort_order: Number.parseInt(form.sort_order || "0", 10) || 0,
    is_active: form.is_active
  };
}

function statCard(label: string, value: number, tone: BadgeTone) {
  return (
    <AppCard className="grid gap-3 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-app-muted">{label}</span>
        <AppBadge tone={tone}>{value}</AppBadge>
      </div>
      <strong className="text-3xl font-black text-app-foreground">{value}</strong>
    </AppCard>
  );
}

export function AdminStaticPagesPage({ locale, labels: labelsProp, initialPanel = "pages" }: AdminStaticPagesPageProps) {
  const labels = labelsProp ?? getStaticPagesLabels(locale);
  const queryClient = useQueryClient();
  const { tokens } = useAdminAuth();
  const token = tokens?.access_token ?? "";

  const activePanel = initialPanel;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [editingPage, setEditingPage] = useState<StaticPageRow | null>(null);
  const [previewPage, setPreviewPage] = useState<StaticPageRow | null>(null);
  const [deletePageRow, setDeletePageRow] = useState<StaticPageRow | null>(null);
  const [isPageFormOpen, setIsPageFormOpen] = useState(false);
  const [pageForm, setPageForm] = useState<StaticPageForm>(initialForm);

  const [editingFaq, setEditingFaq] = useState<FaqRow | null>(null);
  const [previewFaq, setPreviewFaq] = useState<FaqRow | null>(null);
  const [deleteFaqRow, setDeleteFaqRow] = useState<FaqRow | null>(null);
  const [isFaqFormOpen, setIsFaqFormOpen] = useState(false);
  const [faqForm, setFaqForm] = useState<FaqForm>(initialFaqForm);

  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isEnsuring, setIsEnsuring] = useState(false);

  const pagesQueryKey = useMemo(() => ["admin-static-pages", search], [search]);
  const faqsQueryKey = useMemo(() => ["admin-faqs", search], [search]);

  const pagesQuery = useQuery({
    queryKey: pagesQueryKey,
    queryFn: () =>
      listAdminItems(pagesEndpoint, {
        token,
        search,
        includeDeleted: true,
        skip: 0,
        limit: 200
      }) as Promise<StaticPageRow[]>,
    enabled: Boolean(token) && activePanel === "pages"
  });

  const faqsQuery = useQuery({
    queryKey: faqsQueryKey,
    queryFn: () =>
      listAdminItems(faqsEndpoint, {
        token,
        search,
        includeDeleted: true,
        skip: 0,
        limit: 300
      }) as Promise<FaqRow[]>,
    enabled: Boolean(token) && activePanel === "faqs"
  });

  const pageRows = useMemo(() => pagesQuery.data ?? [], [pagesQuery.data]);
  const faqRows = useMemo(() => faqsQuery.data ?? [], [faqsQuery.data]);

  const filteredPages = useMemo(() => {
    return pageRows.filter((row) => {
      const matchesStatus = statusFilter === "all" || contentStatus(row) === statusFilter;
      if (!matchesStatus) {
        return false;
      }

      const needle = normalizeText(search);
      if (!needle) {
        return true;
      }

      return [row.page_key, row.title_ar, row.title_en, row.slug_ar, row.slug_en].some((value) => normalizeText(value).includes(needle));
    });
  }, [pageRows, search, statusFilter]);

  const filteredFaqs = useMemo(() => {
    return faqRows.filter((row) => {
      const matchesStatus = statusFilter === "all" || contentStatus(row) === statusFilter;
      if (!matchesStatus) {
        return false;
      }

      const needle = normalizeText(search);
      if (!needle) {
        return true;
      }

      return [row.question_ar, row.question_en, row.answer_ar, row.answer_en, row.scope].some((value) => normalizeText(value).includes(needle));
    });
  }, [faqRows, search, statusFilter]);

  const pageStats = useMemo(() => {
    return {
      total: pageRows.length,
      active: pageRows.filter((row) => contentStatus(row) === "active").length,
      hidden: pageRows.filter((row) => contentStatus(row) === "hidden").length,
      deleted: pageRows.filter((row) => contentStatus(row) === "deleted").length
    };
  }, [pageRows]);

  const faqStats = useMemo(() => {
    return {
      total: faqRows.length,
      active: faqRows.filter((row) => contentStatus(row) === "active").length,
      hidden: faqRows.filter((row) => contentStatus(row) === "hidden").length,
      deleted: faqRows.filter((row) => contentStatus(row) === "deleted").length
    };
  }, [faqRows]);

  const resetNotice = () => {
    setNotice(null);
    setFormError(null);
  };

  const openCreatePage = () => {
    resetNotice();
    setEditingPage(null);
    setPageForm(initialForm);
    setIsPageFormOpen(true);
  };

  const openEditPage = (row: StaticPageRow) => {
    resetNotice();
    setEditingPage(row);
    setPageForm(toForm(row));
    setIsPageFormOpen(true);
  };

  const closePageForm = () => {
    setEditingPage(null);
    setIsPageFormOpen(false);
    setPageForm(initialForm);
    setFormError(null);
  };

  const openCreateFaq = () => {
    resetNotice();
    setEditingFaq(null);
    setFaqForm(initialFaqForm);
    setIsFaqFormOpen(true);
  };

  const openEditFaq = (row: FaqRow) => {
    resetNotice();
    setEditingFaq(row);
    setFaqForm(toFaqForm(row));
    setIsFaqFormOpen(true);
  };

  const closeFaqForm = () => {
    setEditingFaq(null);
    setIsFaqFormOpen(false);
    setFaqForm(initialFaqForm);
    setFormError(null);
  };

  const submitPageForm = async () => {
    if (!token) {
      return;
    }

    const isCreate = editingPage === null;

    if (isCreate && !pageForm.page_key.trim()) {
      setFormError(labels.fields.pageKey);
      return;
    }

    if (!pageForm.title_ar.trim() || !pageForm.title_en.trim() || !pageForm.slug_ar.trim() || !pageForm.slug_en.trim()) {
      setFormError(labels.saveFailed);
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      const payload = buildPagePayload(pageForm, isCreate);
      if (isCreate) {
        await createAdminItem(pagesEndpoint, token, payload);
      } else {
        await updateAdminItem(`${pagesEndpoint}/${editingPage.id}`, token, payload);
      }
      setNotice(labels.saved);
      closePageForm();
      await queryClient.invalidateQueries({ queryKey: ["admin-static-pages"] });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : labels.saveFailed);
    } finally {
      setIsSaving(false);
    }
  };

  const submitFaqForm = async () => {
    if (!token) {
      return;
    }

    const isCreate = editingFaq === null;

    if (!faqForm.question_ar.trim() || !faqForm.question_en.trim() || !faqForm.answer_ar.trim() || !faqForm.answer_en.trim()) {
      setFormError(labels.saveFailed);
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      const payload = buildFaqPayload(faqForm);
      if (isCreate) {
        await createAdminItem(faqsEndpoint, token, payload);
      } else {
        await updateAdminItem(`${faqsEndpoint}/${editingFaq.id}`, token, payload);
      }
      setNotice(labels.saved);
      closeFaqForm();
      await queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : labels.saveFailed);
    } finally {
      setIsSaving(false);
    }
  };

  const ensureDefaults = async () => {
    if (!token) {
      return;
    }
    setIsEnsuring(true);
    try {
      await ensureDefaultStaticPages(token);
      setNotice(labels.defaultsReady);
      await queryClient.invalidateQueries({ queryKey: ["admin-static-pages"] });
    } finally {
      setIsEnsuring(false);
    }
  };

  const deletePage = async () => {
    if (!token || !deletePageRow) {
      return;
    }
    await deleteAdminItem(`${pagesEndpoint}/${deletePageRow.id}`, token);
    setDeletePageRow(null);
    await queryClient.invalidateQueries({ queryKey: ["admin-static-pages"] });
  };

  const deleteFaq = async () => {
    if (!token || !deleteFaqRow) {
      return;
    }
    await deleteAdminItem(`${faqsEndpoint}/${deleteFaqRow.id}`, token);
    setDeleteFaqRow(null);
    await queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
  };

  const restorePage = async (row: StaticPageRow) => {
    if (!token) {
      return;
    }
    await restoreAdminStaticPage(token, row.id);
    await queryClient.invalidateQueries({ queryKey: ["admin-static-pages"] });
  };

  const restoreFaq = async (row: FaqRow) => {
    if (!token) {
      return;
    }
    await restoreAdminFaq(token, row.id);
    await queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
  };

  const pageColumns = [
    {
      key: "page",
      header: labels.fields.titleAr,
      render: (row: StaticPageRow) => (
        <div className="grid gap-1">
          <strong className="text-sm font-black text-app-foreground">{locale === "ar" ? row.title_ar : row.title_en}</strong>
          <span className="text-xs font-semibold text-app-muted">{row.page_key}</span>
        </div>
      )
    },
    {
      key: "slugs",
      header: labels.fields.slugAr,
      render: (row: StaticPageRow) => (
        <div className="grid gap-1 text-xs font-semibold text-app-muted">
          <span>/{row.slug_ar}</span>
          <span>/{row.slug_en}</span>
        </div>
      )
    },
    {
      key: "status",
      header: labels.fields.status,
      render: (row: StaticPageRow) => {
        const status = contentStatus(row);
        return <AppBadge tone={statusTone(status)}>{labels[status]}</AppBadge>;
      }
    },
    {
      key: "updated_at",
      header: labels.fields.updatedAt,
      render: (row: StaticPageRow) => <span className="text-sm text-app-muted">{formatDate(row.updated_at, locale)}</span>
    },
    {
      key: "actions",
      header: labels.fields.actions,
      className: "min-w-[260px]",
      render: (row: StaticPageRow) => (
        <div className="flex flex-wrap gap-2">
          <AppButton variant="ghost" className="min-h-9 px-3" onClick={() => setPreviewPage(row)} icon={<AppIcon name="external" size={15} />}>
            {labels.preview}
          </AppButton>
          <AppButton variant="secondary" className="min-h-9 px-3" onClick={() => openEditPage(row)} icon={<AppIcon name="edit" size={15} />}>
            {labels.edit}
          </AppButton>
          {row.is_deleted ? (
            <AppButton variant="secondary" className="min-h-9 px-3" onClick={() => restorePage(row)} icon={<AppIcon name="archive" size={15} />}>
              {labels.restore}
            </AppButton>
          ) : (
            <AppButton variant="danger" className="min-h-9 px-3" onClick={() => setDeletePageRow(row)} icon={<AppIcon name="trash" size={15} />}>
              {labels.remove}
            </AppButton>
          )}
        </div>
      )
    }
  ];

  const faqColumns = [
    {
      key: "question",
      header: labels.fields.questionAr,
      render: (row: FaqRow) => (
        <div className="grid gap-1">
          <strong className="text-sm font-black text-app-foreground">{locale === "ar" ? row.question_ar : row.question_en}</strong>
          <span className="line-clamp-2 text-xs font-semibold text-app-muted">{locale === "ar" ? row.answer_ar : row.answer_en}</span>
        </div>
      )
    },
    {
      key: "scope",
      header: labels.fields.scope,
      render: (row: FaqRow) => <AppBadge tone={scopeTone(row.scope)}>{labels[row.scope ?? "general"]}</AppBadge>
    },
    {
      key: "sort_order",
      header: labels.fields.sortOrder,
      render: (row: FaqRow) => <span className="text-sm font-bold text-app-muted">{row.sort_order ?? 0}</span>
    },
    {
      key: "status",
      header: labels.fields.status,
      render: (row: FaqRow) => {
        const status = contentStatus(row);
        return <AppBadge tone={statusTone(status)}>{labels[status]}</AppBadge>;
      }
    },
    {
      key: "actions",
      header: labels.fields.actions,
      className: "min-w-[260px]",
      render: (row: FaqRow) => (
        <div className="flex flex-wrap gap-2">
          <AppButton variant="ghost" className="min-h-9 px-3" onClick={() => setPreviewFaq(row)} icon={<AppIcon name="faq" size={15} />}>
            {labels.preview}
          </AppButton>
          <AppButton variant="secondary" className="min-h-9 px-3" onClick={() => openEditFaq(row)} icon={<AppIcon name="edit" size={15} />}>
            {labels.edit}
          </AppButton>
          {row.is_deleted ? (
            <AppButton variant="secondary" className="min-h-9 px-3" onClick={() => restoreFaq(row)} icon={<AppIcon name="archive" size={15} />}>
              {labels.restore}
            </AppButton>
          ) : (
            <AppButton variant="danger" className="min-h-9 px-3" onClick={() => setDeleteFaqRow(row)} icon={<AppIcon name="trash" size={15} />}>
              {labels.remove}
            </AppButton>
          )}
        </div>
      )
    }
  ];

  const activeQuery = activePanel === "pages" ? pagesQuery : faqsQuery;
  const visibleRowsCount = activePanel === "pages" ? filteredPages.length : filteredFaqs.length;

  return (
    <div className="grid gap-6">
      <AppPageHeader
        title={activePanel === "faqs" ? labels.faqTitle : labels.title}
        description={activePanel === "faqs" ? labels.faqDescription : labels.description}
      />

      <div className="grid gap-4 md:grid-cols-4">
        {activePanel === "pages" ? (
          <>
            {statCard(labels.stats.totalPages, pageStats.total, "primary")}
            {statCard(labels.stats.activePages, pageStats.active, "success")}
            {statCard(labels.stats.hiddenPages, pageStats.hidden, "warning")}
            {statCard(labels.stats.deletedPages, pageStats.deleted, "danger")}
          </>
        ) : (
          <>
            {statCard(labels.stats.totalFaqs, faqStats.total, "primary")}
            {statCard(labels.stats.activeFaqs, faqStats.active, "success")}
            {statCard(labels.stats.hiddenFaqs, faqStats.hidden, "warning")}
            {statCard(labels.stats.deletedFaqs, faqStats.deleted, "danger")}
          </>
        )}
      </div>

      <AppCard className="grid gap-4 p-5">
        <div className="flex flex-wrap items-center justify-end gap-3">
          <div className="flex flex-wrap gap-2">
            <AppButton variant="secondary" onClick={() => activeQuery.refetch()} icon={<AppIcon name="refresh" size={16} />}>
              {labels.refresh}
            </AppButton>
            {activePanel === "pages" ? (
              <>
                <AppButton variant="secondary" disabled={isEnsuring} onClick={ensureDefaults} icon={<AppIcon name="sparkles" size={16} />}>
                  {labels.ensureDefaults}
                </AppButton>
                <AppButton onClick={openCreatePage} icon={<AppIcon name="plus" size={16} />}>
                  {labels.addPage}
                </AppButton>
              </>
            ) : (
              <AppButton onClick={openCreateFaq} icon={<AppIcon name="plus" size={16} />}>
                {labels.addFaq}
              </AppButton>
            )}
          </div>
        </div>

        {notice ? (
          <div className="rounded-appMd border border-app-success/30 bg-app-success/10 px-4 py-3 text-sm font-semibold text-app-success">
            {notice}
          </div>
        ) : null}

        <div className="grid gap-3 lg:grid-cols-[1fr_240px]">
          <AppInput
            label={labels.search}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={activePanel === "faqs" ? labels.faqSearchPlaceholder : labels.searchPlaceholder}
          />
          <AppSelect label={labels.statusFilter} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}>
            <option value="all">{labels.all}</option>
            <option value="active">{labels.active}</option>
            <option value="hidden">{labels.hidden}</option>
            <option value="deleted">{labels.deleted}</option>
          </AppSelect>
        </div>
      </AppCard>

      {activeQuery.isLoading ? <AppLoadingState text={labels.loading} /> : null}
      {activeQuery.isError ? <AppErrorState title={labels.error} description={(activeQuery.error as Error)?.message ?? labels.error} /> : null}
      {!activeQuery.isLoading && !activeQuery.isError && visibleRowsCount === 0 ? (
        <AppEmptyState title={labels.emptyTitle} description={activePanel === "pages" ? labels.emptyPagesDescription : labels.emptyFaqsDescription} />
      ) : null}
      {!activeQuery.isLoading && !activeQuery.isError && activePanel === "pages" && filteredPages.length > 0 ? (
        <AppTable columns={pageColumns} rows={filteredPages} getRowKey={(row) => row.id} />
      ) : null}
      {!activeQuery.isLoading && !activeQuery.isError && activePanel === "faqs" && filteredFaqs.length > 0 ? (
        <AppTable columns={faqColumns} rows={filteredFaqs} getRowKey={(row) => row.id} />
      ) : null}

      <AppModal open={isPageFormOpen} title={editingPage ? labels.editPage : labels.addPage} onClose={closePageForm} size="xl">
        <div className="grid gap-5">
          {formError ? <div className="rounded-appMd border border-app-danger/30 bg-app-danger/10 p-3 text-sm text-app-danger">{formError}</div> : null}

          <div className="grid gap-4 md:grid-cols-3">
            <AppInput
              label={labels.fields.pageKey}
              value={pageForm.page_key}
              disabled={Boolean(editingPage)}
              placeholder="about"
              onChange={(event) => setPageForm((current) => ({ ...current, page_key: event.target.value }))}
            />
            <AppInput
              label={labels.fields.slugAr}
              value={pageForm.slug_ar}
              placeholder="about"
              onChange={(event) => setPageForm((current) => ({ ...current, slug_ar: event.target.value }))}
            />
            <AppInput
              label={labels.fields.slugEn}
              value={pageForm.slug_en}
              placeholder="about"
              onChange={(event) => setPageForm((current) => ({ ...current, slug_en: event.target.value }))}
            />
          </div>
          <p className="text-xs font-semibold text-app-muted">{labels.hints.key}</p>

          <div className="grid gap-4 md:grid-cols-2">
            <AppInput
              label={labels.fields.titleAr}
              value={pageForm.title_ar}
              onChange={(event) => setPageForm((current) => ({ ...current, title_ar: event.target.value }))}
            />
            <AppInput
              label={labels.fields.titleEn}
              value={pageForm.title_en}
              onChange={(event) => setPageForm((current) => ({ ...current, title_en: event.target.value }))}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <AppTextarea
              label={labels.fields.contentAr}
              className="min-h-56"
              value={pageForm.content_ar}
              onChange={(event) => setPageForm((current) => ({ ...current, content_ar: event.target.value }))}
            />
            <AppTextarea
              label={labels.fields.contentEn}
              className="min-h-56"
              value={pageForm.content_en}
              onChange={(event) => setPageForm((current) => ({ ...current, content_en: event.target.value }))}
            />
          </div>
          <p className="text-xs font-semibold text-app-muted">{labels.hints.content}</p>

          <div className="grid gap-4 md:grid-cols-2">
            <AppInput
              label={labels.fields.seoTitleAr}
              value={pageForm.seo_title_ar}
              onChange={(event) => setPageForm((current) => ({ ...current, seo_title_ar: event.target.value }))}
            />
            <AppInput
              label={labels.fields.seoTitleEn}
              value={pageForm.seo_title_en}
              onChange={(event) => setPageForm((current) => ({ ...current, seo_title_en: event.target.value }))}
            />
            <AppTextarea
              label={labels.fields.seoDescriptionAr}
              value={pageForm.seo_description_ar}
              onChange={(event) => setPageForm((current) => ({ ...current, seo_description_ar: event.target.value }))}
            />
            <AppTextarea
              label={labels.fields.seoDescriptionEn}
              value={pageForm.seo_description_en}
              onChange={(event) => setPageForm((current) => ({ ...current, seo_description_en: event.target.value }))}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_220px]">
            <AppTextarea
              label={labels.fields.sections}
              className="font-mono text-xs"
              value={pageForm.sections_text}
              onChange={(event) => setPageForm((current) => ({ ...current, sections_text: event.target.value }))}
            />
            <AppSelect
              label={labels.fields.status}
              value={pageForm.is_active ? "active" : "hidden"}
              onChange={(event) => setPageForm((current) => ({ ...current, is_active: event.target.value === "active" }))}
            >
              <option value="active">{labels.active}</option>
              <option value="hidden">{labels.hidden}</option>
            </AppSelect>
          </div>
          <p className="text-xs font-semibold text-app-muted">{labels.hints.sections}</p>

          <div className="flex flex-wrap justify-end gap-3">
            <AppButton variant="secondary" onClick={closePageForm}>
              {labels.cancel}
            </AppButton>
            <AppButton disabled={isSaving} onClick={submitPageForm} icon={<AppIcon name="save" size={16} />}>
              {editingPage ? labels.savePage : labels.create}
            </AppButton>
          </div>
        </div>
      </AppModal>

      <AppModal open={isFaqFormOpen} title={editingFaq ? labels.editFaq : labels.addFaq} onClose={closeFaqForm} size="xl">
        <div className="grid gap-5">
          {formError ? <div className="rounded-appMd border border-app-danger/30 bg-app-danger/10 p-3 text-sm text-app-danger">{formError}</div> : null}

          <div className="grid gap-4 md:grid-cols-[1fr_220px_180px]">
            <AppSelect
              label={labels.fields.scope}
              value={faqForm.scope}
              onChange={(event) => setFaqForm((current) => ({ ...current, scope: event.target.value as FaqScope }))}
            >
              <option value="general">{labels.general}</option>
              <option value="service">{labels.service}</option>
              <option value="product">{labels.product}</option>
            </AppSelect>
            <AppInput
              label={labels.fields.sortOrder}
              type="number"
              value={faqForm.sort_order}
              onChange={(event) => setFaqForm((current) => ({ ...current, sort_order: event.target.value }))}
            />
            <AppSelect
              label={labels.fields.status}
              value={faqForm.is_active ? "active" : "hidden"}
              onChange={(event) => setFaqForm((current) => ({ ...current, is_active: event.target.value === "active" }))}
            >
              <option value="active">{labels.active}</option>
              <option value="hidden">{labels.hidden}</option>
            </AppSelect>
          </div>
          <p className="text-xs font-semibold text-app-muted">{labels.hints.faq}</p>

          <div className="grid gap-4 md:grid-cols-2">
            <AppInput
              label={labels.fields.questionAr}
              value={faqForm.question_ar}
              onChange={(event) => setFaqForm((current) => ({ ...current, question_ar: event.target.value }))}
            />
            <AppInput
              label={labels.fields.questionEn}
              value={faqForm.question_en}
              onChange={(event) => setFaqForm((current) => ({ ...current, question_en: event.target.value }))}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <AppTextarea
              label={labels.fields.answerAr}
              className="min-h-44"
              value={faqForm.answer_ar}
              onChange={(event) => setFaqForm((current) => ({ ...current, answer_ar: event.target.value }))}
            />
            <AppTextarea
              label={labels.fields.answerEn}
              className="min-h-44"
              value={faqForm.answer_en}
              onChange={(event) => setFaqForm((current) => ({ ...current, answer_en: event.target.value }))}
            />
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <AppButton variant="secondary" onClick={closeFaqForm}>
              {labels.cancel}
            </AppButton>
            <AppButton disabled={isSaving} onClick={submitFaqForm} icon={<AppIcon name="save" size={16} />}>
              {editingFaq ? labels.saveFaq : labels.create}
            </AppButton>
          </div>
        </div>
      </AppModal>

      <AppModal open={Boolean(previewPage)} title={previewPage ? (locale === "ar" ? previewPage.title_ar : previewPage.title_en) : labels.preview} onClose={() => setPreviewPage(null)} size="lg">
        {previewPage ? (
          <div className="grid gap-4">
            <div className="flex flex-wrap gap-2">
              <AppBadge tone={statusTone(contentStatus(previewPage))}>{labels[contentStatus(previewPage)]}</AppBadge>
              <AppBadge tone="neutral">{previewPage.page_key}</AppBadge>
              <AppBadge tone="primary">/{locale === "ar" ? previewPage.slug_ar : previewPage.slug_en}</AppBadge>
            </div>
            <div className="grid gap-3 rounded-appLg border border-app-border bg-app-surfaceElevated p-5 leading-8 text-app-muted">
              {(locale === "ar" ? previewPage.content_ar : previewPage.content_en)
                ?.split("\n")
                .filter(Boolean)
                .map((paragraph) => <p key={paragraph}>{paragraph}</p>) || null}
            </div>
          </div>
        ) : null}
      </AppModal>

      <AppModal open={Boolean(previewFaq)} title={previewFaq ? (locale === "ar" ? previewFaq.question_ar : previewFaq.question_en) : labels.preview} onClose={() => setPreviewFaq(null)} size="lg">
        {previewFaq ? (
          <div className="grid gap-4">
            <div className="flex flex-wrap gap-2">
              <AppBadge tone={statusTone(contentStatus(previewFaq))}>{labels[contentStatus(previewFaq)]}</AppBadge>
              <AppBadge tone={scopeTone(previewFaq.scope)}>{labels[previewFaq.scope ?? "general"]}</AppBadge>
            </div>
            <div className="grid gap-3 rounded-appLg border border-app-border bg-app-surfaceElevated p-5 leading-8 text-app-muted">
              <h3 className="text-lg font-black text-app-foreground">{locale === "ar" ? previewFaq.question_ar : previewFaq.question_en}</h3>
              <p>{locale === "ar" ? previewFaq.answer_ar : previewFaq.answer_en}</p>
            </div>
          </div>
        ) : null}
      </AppModal>

      <AppConfirmDialog
        open={Boolean(deletePageRow)}
        title={labels.confirmDeletePage}
        description={labels.confirmDeleteDescription}
        confirmText={labels.yesDelete}
        cancelText={labels.cancel}
        onConfirm={deletePage}
        onCancel={() => setDeletePageRow(null)}
      />

      <AppConfirmDialog
        open={Boolean(deleteFaqRow)}
        title={labels.confirmDeleteFaq}
        description={labels.confirmDeleteDescription}
        confirmText={labels.yesDelete}
        cancelText={labels.cancel}
        onConfirm={deleteFaq}
        onCancel={() => setDeleteFaqRow(null)}
      />
    </div>
  );
}
