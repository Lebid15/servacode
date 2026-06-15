"use client";

/**
 * =====================================================
 * AdminEmailTemplatesPage
 * إدارة قوالب البريد الإلكتروني من الواجهة
 * =====================================================
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { ensureDefaultEmailTemplates, listEmailTemplates, updateEmailTemplate } from "@/shared/api/admin-client";
import { generateAdminAiContent } from "@/shared/api/ai-client";
import { useAdminAuth } from "@/shared/auth/AdminAuthProvider";
import { AppBadge, type BadgeTone } from "@/shared/design-system/components/AppBadge";
import { AppButton } from "@/shared/design-system/components/AppButton";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppEmptyState } from "@/shared/design-system/components/AppEmptyState";
import { AppErrorState } from "@/shared/design-system/components/AppErrorState";
import { AppIcon, type IconName } from "@/shared/design-system/components/AppIcon";
import { AppInput } from "@/shared/design-system/components/AppInput";
import { AppLoadingState } from "@/shared/design-system/components/AppLoadingState";
import { AppPageHeader } from "@/shared/design-system/components/AppPageHeader";
import { AppTextarea } from "@/shared/design-system/components/AppTextarea";
import { AdminCommunicationTabs } from "./AdminCommunicationTabs";
import type { Locale } from "@/shared/design-system/utils/direction";

const CATEGORY_ORDER = ["project", "contact", "support", "admin", "other"] as const;

type TemplateCategory = (typeof CATEGORY_ORDER)[number];

type EmailTemplateRow = {
  id: string;
  key: string;
  subject_ar: string;
  subject_en: string;
  body_ar: string;
  body_en: string;
  variables: string[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

type AdminEmailTemplatesLabels = {
  loading: string;
  error: string;
  emptyTitle: string;
  emptyDescription: string;
  save: string;
  cancel: string;
  close: string;
  refresh: string;
  ensureDefaults: string;
  search: string;
  searchPlaceholder: string;
  all: string;
  active: string;
  inactive: string;
  totalTemplates: string;
  activeTemplates: string;
  inactiveTemplates: string;
  customerTemplates: string;
  adminTemplates: string;
  editTemplate: string;
  preview: string;
  subjectAr: string;
  subjectEn: string;
  bodyAr: string;
  bodyEn: string;
  variables: string;
  noVariables: string;
  status: string;
  enabled: string;
  disabled: string;
  category: string;
  project: string;
  contact: string;
  support: string;
  admin: string;
  other: string;
  updatedAt: string;
  copied: string;
  saved: string;
  defaultsReady: string;
  aiReady: string;
  aiPrepare: string;
  aiImprove: string;
  aiWorking: string;
  aiApplied: string;
  aiHintTitle: string;
  aiHintDescription: string;
  managedTemplatesOnly: string;
  recipient: string;
  adminRecipient: string;
  customerRecipient: string;
  noteTitle: string;
  noteDescription: string;
};

type AdminEmailTemplatesPageProps = {
  title: string;
  description: string;
  labels: AdminEmailTemplatesLabels;
  locale: Locale;
};

type TemplateMeta = {
  nameAr: string;
  nameEn: string;
  description: string;
  category: TemplateCategory;
  recipient: "admin" | "customer";
};

const TEMPLATE_META: Record<string, TemplateMeta> = {
  new_quote_request_admin: {
    nameAr: "تنبيه إداري بطلب مشروع جديد",
    nameEn: "Admin notification for a new project request",
    description: "يرسل للإدارة عند وصول طلب مشروع جديد من نموذج الموقع.",
    category: "project",
    recipient: "admin"
  },
  quote_request_received_customer: {
    nameAr: "تأكيد استلام طلب المشروع للعميل",
    nameEn: "Project request receipt confirmation",
    description: "يرسل للعميل مباشرة بعد إرسال طلب مشروع جديد.",
    category: "project",
    recipient: "customer"
  },
  quote_status_reviewing_customer: {
    nameAr: "طلب المشروع قيد المراجعة",
    nameEn: "Project request under review",
    description: "يرسل للعميل عند نقل الطلب إلى مرحلة المراجعة.",
    category: "project",
    recipient: "customer"
  },
  quote_status_waiting_customer: {
    nameAr: "طلب تفاصيل إضافية من العميل",
    nameEn: "Request more project details",
    description: "يرسل عندما تحتاج الإدارة معلومات إضافية قبل المتابعة.",
    category: "project",
    recipient: "customer"
  },
  quote_status_accepted_customer: {
    nameAr: "قبول طلب المشروع مبدئيًا",
    nameEn: "Project request initially accepted",
    description: "يرسل للعميل عند قبول الطلب مبدئيًا والانتقال للخطوات التالية.",
    category: "project",
    recipient: "customer"
  },
  quote_status_closed_customer: {
    nameAr: "إغلاق طلب المشروع",
    nameEn: "Project request closed",
    description: "يرسل للعميل عند إغلاق الطلب مع ملاحظة الإدارة.",
    category: "project",
    recipient: "customer"
  },
  new_contact_message_admin: {
    nameAr: "تنبيه إداري برسالة تواصل جديدة",
    nameEn: "Admin notification for a new contact message",
    description: "يرسل للإدارة عند وصول رسالة من صفحة تواصل معنا.",
    category: "contact",
    recipient: "admin"
  },
  contact_message_received_customer: {
    nameAr: "تأكيد استلام رسالة التواصل",
    nameEn: "Contact message receipt confirmation",
    description: "يرسل للعميل بعد إرسال رسالة تواصل.",
    category: "contact",
    recipient: "customer"
  },
  contact_message_replied_customer: {
    nameAr: "رد على رسالة العميل",
    nameEn: "Reply to customer contact message",
    description: "قالب للرد الرسمي على رسائل التواصل عند الحاجة.",
    category: "contact",
    recipient: "customer"
  },
  new_support_request_admin: {
    nameAr: "تنبيه إداري بطلب دعم جديد",
    nameEn: "Admin notification for a new support request",
    description: "يرسل للإدارة عند وصول طلب دعم جديد.",
    category: "support",
    recipient: "admin"
  },
  support_request_received_customer: {
    nameAr: "تأكيد فتح طلب الدعم",
    nameEn: "Support request opened confirmation",
    description: "يرسل للعميل بعد فتح طلب دعم جديد.",
    category: "support",
    recipient: "customer"
  },
  support_status_in_progress_customer: {
    nameAr: "طلب الدعم قيد المعالجة",
    nameEn: "Support request in progress",
    description: "يرسل عند بدء معالجة طلب الدعم.",
    category: "support",
    recipient: "customer"
  },
  support_status_waiting_customer: {
    nameAr: "طلب معلومات إضافية للدعم",
    nameEn: "Request more support information",
    description: "يرسل عندما يحتاج الفريق معلومات إضافية من العميل.",
    category: "support",
    recipient: "customer"
  },
  support_status_resolved_customer: {
    nameAr: "تم حل طلب الدعم",
    nameEn: "Support request resolved",
    description: "يرسل عندما يتم وضع طلب الدعم كطلب محلول.",
    category: "support",
    recipient: "customer"
  },
  support_status_closed_customer: {
    nameAr: "تم إغلاق طلب الدعم",
    nameEn: "Support request closed",
    description: "يرسل عند إغلاق طلب الدعم نهائيًا.",
    category: "support",
    recipient: "customer"
  },
  admin_user_welcome: {
    nameAr: "ترحيب بمستخدم لوحة الإدارة",
    nameEn: "Admin user welcome",
    description: "قالب مستقبلي لإرسال بيانات الترحيب عند إنشاء مستخدم إداري.",
    category: "admin",
    recipient: "admin"
  }
};

function getTemplateMeta(row: EmailTemplateRow): TemplateMeta {
  return TEMPLATE_META[row.key] ?? {
    nameAr: row.key,
    nameEn: row.key,
    description: row.key,
    category: "other",
    recipient: "admin"
  };
}

function formatDate(value?: string) {
  if (!value) {
    return "-";
  }

  try {
    return new Intl.DateTimeFormat("ar", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function AdminEmailTemplatesPage({ title, description, labels, locale }: AdminEmailTemplatesPageProps) {
  const { tokens } = useAdminAuth();
  const token = tokens?.access_token ?? "";
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<EmailTemplateRow | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | TemplateCategory>("all");
  const [feedback, setFeedback] = useState("");
  const [aiLoading, setAiLoading] = useState<"prepare" | "improve" | null>(null);
  const [isEnsuringDefaults, setIsEnsuringDefaults] = useState(false);

  const query = useQuery({
    queryKey: ["email-templates"],
    queryFn: () => listEmailTemplates(token),
    enabled: Boolean(token)
  });

  const rows = useMemo(() => (query.data ?? []) as EmailTemplateRow[], [query.data]);

  const stats = useMemo(() => {
    return {
      total: rows.length,
      active: rows.filter((row) => row.is_active).length,
      inactive: rows.filter((row) => !row.is_active).length,
      customer: rows.filter((row) => getTemplateMeta(row).recipient === "customer").length,
      admin: rows.filter((row) => getTemplateMeta(row).recipient === "admin").length
    };
  }, [rows]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return rows.filter((row) => {
      const meta = getTemplateMeta(row);
      const matchesSearch = !normalizedSearch || [
        row.key,
        row.subject_ar,
        row.subject_en,
        row.body_ar,
        row.body_en,
        meta.nameAr,
        meta.nameEn,
        meta.description
      ].some((value) => value.toLowerCase().includes(normalizedSearch));

      const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? row.is_active : !row.is_active);
      const matchesCategory = categoryFilter === "all" || meta.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [categoryFilter, rows, search, statusFilter]);

  const handleAiTemplate = async (mode: "prepare" | "improve") => {
    if (!editing || !token || aiLoading) {
      return;
    }

    const meta = getTemplateMeta(editing);
    const variables = editing.variables.map((variable) => `{${variable}}`).join("، ") || labels.noVariables;
    setAiLoading(mode);

    try {
      const response = await generateAdminAiContent(token, {
        entity_type: "email_template",
        target_field: "all",
        title_ar: meta.nameAr,
        short_description_ar: editing.subject_ar,
        full_description_ar: editing.body_ar,
        context_ar: [
          `مفتاح القالب: ${editing.key}`,
          `وصف القالب: ${meta.description}`,
          `التصنيف: ${labels[meta.category]}`,
          `المستلم: ${meta.recipient === "customer" ? labels.customerRecipient : labels.adminRecipient}`,
          `المتغيرات المسموحة: ${variables}`,
          `العنوان الحالي بالعربية: ${editing.subject_ar}`,
          `النص الحالي بالعربية: ${editing.body_ar}`,
          `العنوان الحالي بالإنجليزية: ${editing.subject_en}`,
          `النص الحالي بالإنجليزية: ${editing.body_en}`
        ].join("\n"),
        extra_instructions: [
          mode === "prepare"
            ? "جهز قالب بريد احترافي كامل وواضح اعتمادًا على وظيفة القالب."
            : "حسّن القالب الحالي بدون تغيير هدفه أو حذف المتغيرات المهمة.",
          "اكتب عنوان البريد العربي في improved_title_ar أو short_description_ar.",
          "اكتب نص البريد العربي الكامل في full_description_ar.",
          "اكتب عنوان البريد الإنجليزي في title_en.",
          "اكتب نص البريد الإنجليزي الكامل في full_description_en.",
          "حافظ على المتغيرات بين الأقواس كما هي، ولا تضف متغيرات غير مذكورة في القائمة.",
          "اجعل النبرة رسمية، قصيرة، واضحة، ومناسبة لشركة برمجيات احترافية."
        ].join(" "),
        tone: "professional",
        target_audience: meta.recipient === "customer" ? "customers" : "platform administrators"
      });

      const content = response.content;
      setEditing({
        ...editing,
        subject_ar: content.improved_title_ar || content.short_description_ar || content.seo_title_ar || editing.subject_ar,
        body_ar: content.full_description_ar || content.short_description_ar || editing.body_ar,
        subject_en: content.title_en || content.seo_title_en || editing.subject_en,
        body_en: content.full_description_en || content.short_description_en || editing.body_en
      });
      setFeedback(labels.aiApplied);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : labels.error);
    } finally {
      setAiLoading(null);
    }
  };

  const handleEnsureDefaults = async () => {
    if (!token || isEnsuringDefaults) {
      return;
    }

    setIsEnsuringDefaults(true);
    try {
      await ensureDefaultEmailTemplates(token);
      setFeedback(labels.defaultsReady);
      await queryClient.invalidateQueries({ queryKey: ["email-templates"] });
    } catch (error) {
      window.alert(error instanceof Error ? error.message : labels.error);
    } finally {
      setIsEnsuringDefaults(false);
    }
  };

  const handleSave = async () => {
    if (!editing) {
      return;
    }

    await updateEmailTemplate(token, editing.id, {
      subject_ar: editing.subject_ar,
      subject_en: editing.subject_en,
      body_ar: editing.body_ar,
      body_en: editing.body_en,
      is_active: editing.is_active
    });

    setEditing(null);
    setFeedback(labels.saved);
    await queryClient.invalidateQueries({ queryKey: ["email-templates"] });
  };

  const handleCopyVariable = async (variable: string) => {
    await navigator.clipboard?.writeText(`{${variable}}`);
    setFeedback(labels.copied);
  };

  return (
    <div className="grid gap-6">
      <AdminCommunicationTabs locale={locale} activeKey="email-templates" />

      <AppPageHeader
        title={title}
        description={description}
        actions={
          <>
            <AppButton
              variant="secondary"
              icon={<AppIcon name="refresh" size={18} />}
              onClick={() => query.refetch()}
              disabled={query.isFetching}
            >
              {labels.refresh}
            </AppButton>
            <AppButton
              icon={<AppIcon name="check" size={18} />}
              onClick={handleEnsureDefaults}
              disabled={!token || isEnsuringDefaults}
            >
              {labels.ensureDefaults}
            </AppButton>
          </>
        }
      />

      <AppCard className="relative overflow-hidden p-5">
        <div className="pointer-events-none absolute -top-24 end-12 size-52 rounded-full bg-app-primary/15 blur-3xl" />
        <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-center">
          <div className="grid gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <AppBadge tone="primary">{labels.aiReady}</AppBadge>
              <AppBadge tone="neutral">{labels.managedTemplatesOnly}</AppBadge>
            </div>
            <h2 className="text-xl font-black text-app-foreground md:text-2xl">{labels.aiHintTitle}</h2>
            <p className="max-w-3xl text-sm leading-7 text-app-muted">{labels.aiHintDescription}</p>
          </div>

          <div className="grid gap-3 rounded-appLg border border-app-border bg-app-surfaceElevated/75 p-4">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-appMd border border-app-primary/25 bg-app-primary/10 text-app-primary">
                <AppIcon name="sparkles" size={20} />
              </span>
              <div className="grid gap-1">
                <strong className="text-sm font-black text-app-foreground">{labels.noteTitle}</strong>
                <span className="text-xs leading-5 text-app-muted">{labels.noteDescription}</span>
              </div>
            </div>
          </div>
        </div>
      </AppCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label={labels.totalTemplates} value={stats.total} tone="primary" icon="email" />
        <StatCard label={labels.activeTemplates} value={stats.active} tone="success" icon="check" />
        <StatCard label={labels.inactiveTemplates} value={stats.inactive} tone={stats.inactive > 0 ? "warning" : "neutral"} icon="eye" />
        <StatCard label={labels.customerTemplates} value={stats.customer} tone="primary" icon="users" />
        <StatCard label={labels.adminTemplates} value={stats.admin} tone="neutral" icon="roles" />
      </div>

      <AppCard className="grid gap-4 p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_220px_220px]">
          <AppInput
            label={labels.search}
            placeholder={labels.searchPlaceholder}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <label className="grid gap-2">
            <span className="text-sm font-medium text-app-foreground">{labels.status}</span>
            <select
              className="min-h-11 rounded-appMd border border-app-border bg-app-surface px-4 text-app-foreground outline-none transition focus:border-app-primary"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as "all" | "active" | "inactive")}
            >
              <option value="all">{labels.all}</option>
              <option value="active">{labels.active}</option>
              <option value="inactive">{labels.inactive}</option>
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-app-foreground">{labels.category}</span>
            <select
              className="min-h-11 rounded-appMd border border-app-border bg-app-surface px-4 text-app-foreground outline-none transition focus:border-app-primary"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value as "all" | TemplateCategory)}
            >
              <option value="all">{labels.all}</option>
              {CATEGORY_ORDER.map((category) => (
                <option key={category} value={category}>{labels[category]}</option>
              ))}
            </select>
          </label>
        </div>

        {feedback ? (
          <p className="rounded-appMd border border-app-primary/25 bg-app-primary/10 px-4 py-3 text-sm font-semibold text-app-primary">
            {feedback}
          </p>
        ) : null}
      </AppCard>

      {query.isLoading ? <AppLoadingState text={labels.loading} /> : null}
      {query.isError ? <AppErrorState title={labels.error} description={String(query.error)} /> : null}
      {!query.isLoading && !query.isError && filteredRows.length === 0 ? (
        <AppEmptyState title={labels.emptyTitle} description={labels.emptyDescription} icon="email" />
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        {filteredRows.map((row) => {
          const meta = getTemplateMeta(row);
          const statusTone: BadgeTone = row.is_active ? "success" : "warning";
          const recipientLabel = meta.recipient === "customer" ? labels.customerRecipient : labels.adminRecipient;

          return (
            <AppCard key={row.id} className="group relative grid min-h-full gap-4 overflow-hidden p-5 transition hover:-translate-y-0.5 hover:border-app-primary/35 hover:shadow-appGlow">
              <div className="pointer-events-none absolute -top-24 end-4 size-44 rounded-full bg-app-primary/10 blur-3xl transition group-hover:bg-app-primary/20" />

              <div className="relative flex flex-wrap items-start justify-between gap-4">
                <div className="grid min-w-0 gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <AppBadge tone="primary">{labels[meta.category]}</AppBadge>
                    <AppBadge tone={statusTone}>{row.is_active ? labels.enabled : labels.disabled}</AppBadge>
                    <AppBadge tone="neutral">{recipientLabel}</AppBadge>
                  </div>

                  <div className="grid gap-1">
                    <h3 className="text-lg font-black text-app-foreground md:text-xl">{meta.nameAr}</h3>
                    <p className="text-sm font-semibold text-app-muted">{meta.nameEn}</p>
                  </div>

                  <p className="max-w-2xl text-sm leading-7 text-app-muted">{meta.description}</p>
                </div>

                <AppButton variant="secondary" icon={<AppIcon name="edit" size={17} />} onClick={() => setEditing(row)}>
                  {labels.editTemplate}
                </AppButton>
              </div>

              <div className="relative grid gap-3 rounded-appLg border border-app-border bg-app-surface/65 p-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <PreviewLine title={labels.subjectAr} value={row.subject_ar} />
                  <PreviewLine title={labels.subjectEn} value={row.subject_en} />
                </div>
                <div className="grid gap-2">
                  <span className="text-xs font-black text-app-muted">{labels.variables}</span>
                  <div className="flex flex-wrap gap-2">
                    {row.variables.length > 0 ? row.variables.map((variable) => (
                      <button
                        key={variable}
                        type="button"
                        className="rounded-full border border-app-border bg-app-surfaceElevated px-3 py-1 text-xs font-bold text-app-foreground transition hover:border-app-primary hover:text-app-primary"
                        onClick={() => handleCopyVariable(variable)}
                      >
                        {`{${variable}}`}
                      </button>
                    )) : <span className="text-xs text-app-muted">{labels.noVariables}</span>}
                  </div>
                </div>
              </div>

              <div className="relative flex flex-wrap items-center justify-between gap-3 border-t border-app-border pt-3">
                <code className="rounded-appMd border border-app-border bg-app-surfaceElevated px-3 py-1 text-xs text-app-muted">
                  {row.key}
                </code>
                <span className="text-xs text-app-muted">{labels.updatedAt}: {formatDate(row.updated_at)}</span>
              </div>
            </AppCard>
          );
        })}
      </div>

      {editing ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4 backdrop-blur-sm">
          <AppCard className="max-h-[92vh] w-full max-w-6xl overflow-auto p-0">
            <div className="sticky top-0 z-10 border-b border-app-border bg-app-surface/95 p-5 backdrop-blur">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="grid gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <AppBadge tone="primary">{labels.aiReady}</AppBadge>
                    <AppBadge tone={editing.is_active ? "success" : "warning"}>{editing.is_active ? labels.enabled : labels.disabled}</AppBadge>
                  </div>
                  <h2 className="text-2xl font-black text-app-foreground">{labels.editTemplate}</h2>
                  <p className="text-sm text-app-muted">{getTemplateMeta(editing).nameAr}</p>
                </div>
                <AppButton variant="ghost" onClick={() => setEditing(null)}>{labels.close}</AppButton>
              </div>
            </div>

            <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
              <div className="grid gap-4">
                <div className="rounded-appLg border border-app-border bg-app-surfaceElevated/70 p-4">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="grid gap-1">
                      <strong className="text-sm font-black text-app-foreground">{labels.aiHintTitle}</strong>
                      <span className="text-xs leading-5 text-app-muted">{labels.aiHintDescription}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <AppButton
                        variant="secondary"
                        className="min-h-10 px-4"
                        icon={<AppIcon name={aiLoading === "prepare" ? "loader" : "sparkles"} size={16} className={aiLoading === "prepare" ? "animate-spin" : undefined} />}
                        onClick={() => handleAiTemplate("prepare")}
                        disabled={!token || Boolean(aiLoading)}
                      >
                        {aiLoading === "prepare" ? labels.aiWorking : labels.aiPrepare}
                      </AppButton>
                      <AppButton
                        className="min-h-10 px-4"
                        icon={<AppIcon name={aiLoading === "improve" ? "loader" : "sparkles"} size={16} className={aiLoading === "improve" ? "animate-spin" : undefined} />}
                        onClick={() => handleAiTemplate("improve")}
                        disabled={!token || Boolean(aiLoading)}
                      >
                        {aiLoading === "improve" ? labels.aiWorking : labels.aiImprove}
                      </AppButton>
                    </div>
                  </div>
                  <p className="text-xs leading-6 text-app-muted">{labels.managedTemplatesOnly}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <AppInput
                    label={labels.subjectAr}
                    value={editing.subject_ar}
                    onChange={(event) => setEditing({ ...editing, subject_ar: event.target.value })}
                  />
                  <AppInput
                    label={labels.subjectEn}
                    value={editing.subject_en}
                    onChange={(event) => setEditing({ ...editing, subject_en: event.target.value })}
                  />
                </div>

                <AppTextarea
                  label={labels.bodyAr}
                  className="min-h-72 font-mono text-sm leading-7"
                  value={editing.body_ar}
                  onChange={(event) => setEditing({ ...editing, body_ar: event.target.value })}
                />
                <AppTextarea
                  label={labels.bodyEn}
                  className="min-h-72 font-mono text-sm leading-7"
                  value={editing.body_en}
                  onChange={(event) => setEditing({ ...editing, body_en: event.target.value })}
                />

                <label className="flex items-center gap-3 rounded-appMd border border-app-border bg-app-surface p-4 text-sm font-semibold text-app-foreground">
                  <input
                    type="checkbox"
                    checked={editing.is_active}
                    onChange={(event) => setEditing({ ...editing, is_active: event.target.checked })}
                  />
                  {labels.enabled}
                </label>
              </div>

              <div className="grid content-start gap-4">
                <AppCard className="grid gap-3 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-black text-app-foreground">{labels.variables}</h3>
                    <AppBadge tone="neutral">{editing.variables.length}</AppBadge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editing.variables.length > 0 ? editing.variables.map((variable) => (
                      <button
                        key={variable}
                        type="button"
                        className="rounded-full border border-app-border bg-app-surfaceElevated px-3 py-1 text-xs font-bold text-app-foreground transition hover:border-app-primary hover:text-app-primary"
                        onClick={() => handleCopyVariable(variable)}
                      >
                        {`{${variable}}`}
                      </button>
                    )) : <span className="text-sm text-app-muted">{labels.noVariables}</span>}
                  </div>
                </AppCard>

                <AppCard className="grid gap-4 p-4">
                  <h3 className="text-lg font-black text-app-foreground">{labels.preview}</h3>
                  <PreviewBlock title={labels.subjectAr} value={editing.subject_ar} />
                  <PreviewBlock title={labels.bodyAr} value={editing.body_ar} />
                  <PreviewBlock title={labels.subjectEn} value={editing.subject_en} />
                  <PreviewBlock title={labels.bodyEn} value={editing.body_en} />
                </AppCard>
              </div>
            </div>

            <div className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t border-app-border bg-app-surface/95 p-5 backdrop-blur">
              <AppButton variant="secondary" onClick={() => setEditing(null)}>{labels.cancel}</AppButton>
              <AppButton icon={<AppIcon name="save" size={18} />} onClick={handleSave}>{labels.save}</AppButton>
            </div>
          </AppCard>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({ label, value, tone, icon }: { label: string; value: number; tone: BadgeTone; icon: IconName }) {
  return (
    <AppCard className="relative overflow-hidden p-4">
      <div className="pointer-events-none absolute -top-12 end-2 size-24 rounded-full bg-app-primary/10 blur-2xl" />
      <div className="relative flex items-center justify-between gap-3">
        <div className="grid gap-2">
          <span className="text-sm font-semibold text-app-muted">{label}</span>
          <strong className="text-3xl font-black text-app-foreground">{value}</strong>
        </div>
        <span className="grid size-11 place-items-center rounded-appMd border border-app-border bg-app-surfaceElevated text-app-primary">
          <AppIcon name={icon} size={19} />
        </span>
      </div>
      <AppBadge tone={tone} className="mt-3">{label}</AppBadge>
    </AppCard>
  );
}

function PreviewLine({ title, value }: { title: string; value: string }) {
  return (
    <div className="grid gap-1">
      <p className="text-xs font-black text-app-muted">{title}</p>
      <p className="line-clamp-2 text-sm font-semibold leading-6 text-app-foreground">{value || "—"}</p>
    </div>
  );
}

function PreviewBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="grid gap-2 rounded-appMd border border-app-border bg-app-surface p-3">
      <p className="text-xs font-black text-app-muted">{title}</p>
      <pre className="max-h-56 overflow-auto whitespace-pre-wrap break-words text-sm leading-7 text-app-foreground">{value || "—"}</pre>
    </div>
  );
}
