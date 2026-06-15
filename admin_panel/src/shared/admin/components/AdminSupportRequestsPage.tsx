"use client";

/**
 * =====================================================
 * AdminSupportRequestsPage
 * صفحة مخصصة لاستقبال ومتابعة طلبات الدعم القادمة من الموقع العام
 * =====================================================
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

import { valueToText } from "@/shared/admin/admin-formatters";
import { listAdminItems, updateAdminItem } from "@/shared/api/admin-client";
import { useAdminAuth } from "@/shared/auth/AdminAuthProvider";
import { AppBadge, type BadgeTone } from "@/shared/design-system/components/AppBadge";
import { AppButton } from "@/shared/design-system/components/AppButton";
import { AppCard } from "@/shared/design-system/components/AppCard";
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

type SupportRequestRow = Record<string, unknown> & {
  id?: string;
  full_name?: string;
  email?: string | null;
  phone?: string | null;
  app_name?: string | null;
  subject?: string | null;
  message?: string | null;
  status?: string;
  priority?: string;
  internal_note?: string | null;
  resolved_at?: string | null;
  archived_at?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at?: string;
  updated_at?: string;
};

type Option = {
  label: string;
  value: string;
};

type Labels = {
  eyebrow: string;
  title: string;
  description: string;
  refresh: string;
  search: string;
  searchPlaceholder: string;
  statusFilter: string;
  workflowFilter: string;
  priorityFilter: string;
  all: string;
  clear: string;
  loading: string;
  error: string;
  emptyTitle: string;
  emptyDescription: string;
  details: string;
  requestDetails: string;
  customerInfo: string;
  requestInfo: string;
  followUp: string;
  technicalInfo: string;
  supportActions: string;
  save: string;
  close: string;
  call: string;
  emailAction: string;
  copyEmail: string;
  copied: string;
  startReview: string;
  markInProgress: string;
  markResolved: string;
  archive: string;
  noSubject: string;
  noApp: string;
  noNote: string;
  internalNotePlaceholder: string;
  stats: {
    total: string;
    new: string;
    reviewing: string;
    inProgress: string;
    waitingCustomer: string;
    resolved: string;
    archived: string;
  };
  workflow: Record<string, string>;
  fields: {
    fullName: string;
    email: string;
    phone: string;
    appName: string;
    subject: string;
    message: string;
    status: string;
    priority: string;
    internalNote: string;
    createdAt: string;
    updatedAt: string;
    resolvedAt: string;
    archivedAt: string;
    ipAddress: string;
    userAgent: string;
    actions: string;
  };
  statuses: Record<string, string>;
  priorities: Record<string, string>;
  messages: {
    saved: string;
    saveFailed: string;
  };
};

type AdminSupportRequestsPageProps = {
  locale: Locale;
};

const endpoint = "/admin/support-requests";

const statusOptions: Option[] = [
  { value: "new", label: "new" },
  { value: "reviewing", label: "reviewing" },
  { value: "in_progress", label: "in_progress" },
  { value: "waiting_customer", label: "waiting_customer" },
  { value: "resolved", label: "resolved" },
  { value: "closed", label: "closed" },
  { value: "archived", label: "archived" }
];

const priorityOptions: Option[] = [
  { value: "low", label: "low" },
  { value: "normal", label: "normal" },
  { value: "high", label: "high" },
  { value: "urgent", label: "urgent" }
];

const labelsByLocale: Record<Locale, Labels> = {
  ar: {
    eyebrow: "مركز الدعم",
    title: "طلبات الدعم",
    description: "استقبال طلبات الدعم القادمة من الموقع العام، تصنيفها حسب الحالة والأولوية، وتسجيل الملاحظات الداخلية حتى إغلاق الطلب.",
    refresh: "تحديث",
    search: "بحث",
    searchPlaceholder: "ابحث باسم العميل أو البريد أو الهاتف أو التطبيق أو الموضوع...",
    statusFilter: "الحالة التفصيلية",
    workflowFilter: "حالة الطلب",
    priorityFilter: "الأولوية",
    all: "الكل",
    clear: "مسح الفلاتر",
    loading: "جاري تحميل طلبات الدعم...",
    error: "تعذر تحميل البيانات",
    emptyTitle: "لا توجد طلبات دعم",
    emptyDescription: "عندما يرسل عميل طلب دعم من الموقع العام سيظهر هنا مباشرة.",
    details: "عرض الطلب",
    requestDetails: "تفاصيل طلب الدعم",
    customerInfo: "بيانات العميل",
    requestInfo: "بيانات الطلب",
    followUp: "المتابعة الداخلية",
    technicalInfo: "معلومات تقنية",
    supportActions: "إجراءات الدعم",
    save: "حفظ المتابعة",
    close: "إغلاق",
    call: "اتصال",
    emailAction: "إرسال بريد",
    copyEmail: "نسخ البريد",
    copied: "تم النسخ",
    startReview: "بدء المراجعة",
    markInProgress: "قيد المعالجة",
    markResolved: "تم الحل",
    archive: "أرشفة",
    noSubject: "بدون موضوع",
    noApp: "غير مرتبط بتطبيق محدد",
    noNote: "لا توجد ملاحظة داخلية بعد.",
    internalNotePlaceholder: "اكتب ملخص المشكلة، الخطوة القادمة، أو نتيجة التواصل مع العميل...",
    stats: {
      total: "إجمالي الطلبات",
      new: "مفتوحة جديدة",
      reviewing: "مفتوحة قيد المراجعة",
      inProgress: "مفتوحة قيد المعالجة",
      waitingCustomer: "بانتظار العميل",
      resolved: "محلولة / مغلقة",
      archived: "مؤرشفة"
    },
    workflow: {
      open: "مفتوح",
      waiting: "بانتظار العميل",
      resolved: "محلول",
      closed: "مغلق"
    },
    fields: {
      fullName: "الاسم",
      email: "البريد الإلكتروني",
      phone: "الهاتف",
      appName: "التطبيق/النظام",
      subject: "الموضوع",
      message: "وصف المشكلة",
      status: "الحالة",
      priority: "الأولوية",
      internalNote: "ملاحظة داخلية",
      createdAt: "تاريخ الإرسال",
      updatedAt: "آخر تحديث",
      resolvedAt: "تاريخ الحل",
      archivedAt: "تاريخ الأرشفة",
      ipAddress: "عنوان IP",
      userAgent: "المتصفح/الجهاز",
      actions: "الإجراءات"
    },
    statuses: {
      new: "جديد",
      reviewing: "قيد المراجعة",
      in_progress: "قيد المعالجة",
      waiting_customer: "بانتظار العميل",
      resolved: "تم الحل",
      closed: "مغلق",
      archived: "مؤرشف"
    },
    priorities: {
      low: "منخفضة",
      normal: "عادية",
      high: "عالية",
      urgent: "عاجلة"
    },
    messages: {
      saved: "تم تحديث طلب الدعم بنجاح.",
      saveFailed: "تعذر تحديث طلب الدعم."
    }
  },
  en: {
    eyebrow: "Support Center",
    title: "Support Requests",
    description: "Receive support requests submitted from the public site, classify them by status and priority, and keep internal notes until they are resolved.",
    refresh: "Refresh",
    search: "Search",
    searchPlaceholder: "Search by customer, email, phone, app, or subject...",
    statusFilter: "Detailed status",
    workflowFilter: "Request status",
    priorityFilter: "Priority",
    all: "All",
    clear: "Clear filters",
    loading: "Loading support requests...",
    error: "Unable to load data",
    emptyTitle: "No support requests",
    emptyDescription: "New support requests submitted from the public site will appear here.",
    details: "View request",
    requestDetails: "Support request details",
    customerInfo: "Customer details",
    requestInfo: "Request details",
    followUp: "Internal follow-up",
    technicalInfo: "Technical info",
    supportActions: "Support actions",
    save: "Save follow-up",
    close: "Close",
    call: "Call",
    emailAction: "Send email",
    copyEmail: "Copy email",
    copied: "Copied",
    startReview: "Start review",
    markInProgress: "In progress",
    markResolved: "Resolved",
    archive: "Archive",
    noSubject: "No subject",
    noApp: "Not linked to a specific app",
    noNote: "No internal note yet.",
    internalNotePlaceholder: "Write a summary of the issue, next step, or customer follow-up result...",
    stats: {
      total: "Total requests",
      new: "Open new",
      reviewing: "Open reviewing",
      inProgress: "Open in progress",
      waitingCustomer: "Waiting customer",
      resolved: "Resolved / closed",
      archived: "Archived"
    },
    workflow: {
      open: "Open",
      waiting: "Waiting customer",
      resolved: "Resolved",
      closed: "Closed"
    },
    fields: {
      fullName: "Name",
      email: "Email",
      phone: "Phone",
      appName: "App/system",
      subject: "Subject",
      message: "Issue description",
      status: "Status",
      priority: "Priority",
      internalNote: "Internal note",
      createdAt: "Sent at",
      updatedAt: "Updated at",
      resolvedAt: "Resolved at",
      archivedAt: "Archived at",
      ipAddress: "IP address",
      userAgent: "Browser/device",
      actions: "Actions"
    },
    statuses: {
      new: "New",
      reviewing: "Reviewing",
      in_progress: "In progress",
      waiting_customer: "Waiting customer",
      resolved: "Resolved",
      closed: "Closed",
      archived: "Archived"
    },
    priorities: {
      low: "Low",
      normal: "Normal",
      high: "High",
      urgent: "Urgent"
    },
    messages: {
      saved: "Support request updated successfully.",
      saveFailed: "Unable to update support request."
    }
  }
};

function statusTone(value?: string): BadgeTone {
  if (value === "new" || value === "waiting_customer") {
    return "warning";
  }

  if (value === "reviewing" || value === "in_progress") {
    return "primary";
  }

  if (value === "resolved" || value === "closed") {
    return "success";
  }

  return "neutral";
}

function workflowKey(value?: string): "open" | "waiting" | "resolved" | "closed" {
  if (value === "waiting_customer") {
    return "waiting";
  }

  if (value === "resolved") {
    return "resolved";
  }

  if (["closed", "archived"].includes(value ?? "")) {
    return "closed";
  }

  return "open";
}

function workflowTone(value?: string): BadgeTone {
  const key = workflowKey(value);

  if (key === "resolved") {
    return "success";
  }

  if (key === "closed") {
    return "neutral";
  }

  if (key === "waiting") {
    return "warning";
  }

  return "primary";
}

function StatusBadges({ status, labels }: { status?: string; labels: Labels }) {
  const key = workflowKey(status);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <AppBadge tone={workflowTone(status)}>{formatLabel(labels.workflow, key)}</AppBadge>
      <AppBadge tone={statusTone(status)}>{formatLabel(labels.statuses, status)}</AppBadge>
    </div>
  );
}

function priorityTone(value?: string): BadgeTone {
  if (value === "urgent") {
    return "danger";
  }

  if (value === "high") {
    return "warning";
  }

  if (value === "normal") {
    return "primary";
  }

  return "neutral";
}

function formatLabel(map: Record<string, string>, value?: string | null) {
  if (!value) {
    return "—";
  }

  return map[value] ?? value;
}

function formatDate(value?: string | null, locale?: Locale) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function normalizeText(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function metricCards(rows: SupportRequestRow[], labels: Labels) {
  const newCount = rows.filter((row) => row.status === "new").length;
  const reviewingCount = rows.filter((row) => row.status === "reviewing").length;
  const inProgressCount = rows.filter((row) => row.status === "in_progress").length;
  const waitingCount = rows.filter((row) => row.status === "waiting_customer").length;
  const resolvedCount = rows.filter((row) => row.status === "resolved" || row.status === "closed").length;
  const archivedCount = rows.filter((row) => row.status === "archived").length;

  return [
    { key: "total", label: labels.stats.total, value: rows.length, tone: "primary" as BadgeTone },
    { key: "new", label: labels.stats.new, value: newCount, tone: newCount > 0 ? "warning" as BadgeTone : "neutral" as BadgeTone },
    { key: "reviewing", label: labels.stats.reviewing, value: reviewingCount, tone: "primary" as BadgeTone },
    { key: "inProgress", label: labels.stats.inProgress, value: inProgressCount, tone: "primary" as BadgeTone },
    { key: "waitingCustomer", label: labels.stats.waitingCustomer, value: waitingCount, tone: waitingCount > 0 ? "warning" as BadgeTone : "neutral" as BadgeTone },
    { key: "resolved", label: labels.stats.resolved, value: resolvedCount, tone: "success" as BadgeTone },
    { key: "archived", label: labels.stats.archived, value: archivedCount, tone: "neutral" as BadgeTone }
  ];
}

function DetailLine({ label, value, children }: { label: string; value?: unknown; children?: ReactNode }) {
  return (
    <div className="grid gap-1 rounded-appMd border border-app-border bg-app-surface p-3">
      <span className="text-xs font-semibold text-app-muted">{label}</span>
      {children ?? <span className="break-words text-sm font-semibold text-app-foreground">{valueToText(value)}</span>}
    </div>
  );
}

export function AdminSupportRequestsPage({ locale }: AdminSupportRequestsPageProps) {
  const labels = labelsByLocale[locale] ?? labelsByLocale.ar;
  const { tokens } = useAdminAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const token = tokens?.access_token ?? "";

  const [search, setSearch] = useState("");
  const [workflowFilter, setWorkflowFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedRow, setSelectedRow] = useState<SupportRequestRow | null>(null);
  const [dismissedLinkedRowId, setDismissedLinkedRowId] = useState<string | null>(null);
  const [status, setStatus] = useState("new");
  const [priority, setPriority] = useState("normal");
  const [internalNote, setInternalNote] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const linkedRowId = searchParams.get("open") ?? searchParams.get("target") ?? searchParams.get("id");

  const query = useQuery({
    queryKey: [endpoint, token],
    queryFn: () => listAdminItems(endpoint, { token, skip: 0, limit: 100 }),
    enabled: Boolean(token)
  });

  const rows = useMemo(() => (Array.isArray(query.data) ? (query.data as SupportRequestRow[]) : []), [query.data]);

  const filteredRows = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesWorkflow = workflowFilter === "all" || workflowKey(row.status) === workflowFilter;
      const matchesStatus = statusFilter === "all" || row.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || row.priority === priorityFilter;
      const haystack = [
        row.full_name,
        row.email,
        row.phone,
        row.app_name,
        row.subject,
        row.message,
        row.status,
        row.priority,
        row.internal_note
      ].map(normalizeText).join(" ");

      return matchesWorkflow && matchesStatus && matchesPriority && (!needle || haystack.includes(needle));
    });
  }, [rows, search, statusFilter, priorityFilter, workflowFilter]);

  const metrics = useMemo(() => metricCards(rows, labels), [labels, rows]);

  useEffect(() => {
    if (!linkedRowId || selectedRow || linkedRowId === dismissedLinkedRowId) {
      return;
    }

    const matchedRow = rows.find((row) => String(row.id ?? "") === linkedRowId);

    if (matchedRow) {
      setSelectedRow(matchedRow);
      setStatus(matchedRow.status ?? "new");
      setPriority(matchedRow.priority ?? "normal");
      setInternalNote(matchedRow.internal_note ?? "");
      setNotice(null);
      setCopied(false);
      setError(null);
      return;
    }

    if (!query.isLoading && search !== linkedRowId) {
      setSearch(linkedRowId);
    }
  }, [dismissedLinkedRowId, linkedRowId, query.isLoading, rows, search, selectedRow]);


  useEffect(() => {
    if (!linkedRowId) {
      setDismissedLinkedRowId(null);
      return;
    }

    if (dismissedLinkedRowId && dismissedLinkedRowId !== linkedRowId) {
      setDismissedLinkedRowId(null);
    }
  }, [dismissedLinkedRowId, linkedRowId]);

  const clearLinkedRowQuery = () => {
    if (!linkedRowId) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete("open");
    params.delete("target");
    params.delete("id");

    const nextQuery = params.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  };

  const openDetails = (row: SupportRequestRow) => {
    setSelectedRow(row);
    setDismissedLinkedRowId(null);
    setStatus(row.status ?? "new");
    setPriority(row.priority ?? "normal");
    setInternalNote(row.internal_note ?? "");
    setNotice(null);
    setCopied(false);
    setError(null);
  };

  const closeDetails = () => {
    if (linkedRowId) {
      setDismissedLinkedRowId(linkedRowId);
      clearLinkedRowQuery();
    }

    setSelectedRow(null);
    setError(null);
    setNotice(null);
    setCopied(false);
  };

  const handleSave = async (nextStatus?: string) => {
    if (!selectedRow?.id) {
      return;
    }

    const resolvedStatus = nextStatus ?? status;
    setIsSaving(true);
    setError(null);
    setNotice(null);

    try {
      await updateAdminItem(`${endpoint}/${selectedRow.id}`, token, {
        status: resolvedStatus,
        priority,
        internal_note: internalNote.trim() ? internalNote.trim() : null
      });

      await queryClient.invalidateQueries({ queryKey: [endpoint] });
      await query.refetch();
      setNotice(labels.messages.saved);
      closeDetails();
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : labels.messages.saveFailed);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyEmail = async () => {
    if (!selectedRow?.email) {
      return;
    }

    await navigator.clipboard.writeText(String(selectedRow.email));
    setCopied(true);
  };

  return (
    <div className="grid gap-6">
      <AppPageHeader
        eyebrow={labels.eyebrow}
        title={labels.title}
        description={labels.description}
        actions={(
          <AppButton variant="secondary" onClick={() => query.refetch()} icon={<AppIcon name="refresh" size={17} />}>
            {labels.refresh}
          </AppButton>
        )}
      />

      {notice ? (
        <div className="rounded-appLg border border-app-success/30 bg-app-success/10 px-4 py-3 text-sm font-semibold text-app-success">
          {notice}
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-7">
        {metrics.map((metric) => (
          <AppCard key={metric.key} className="grid gap-2 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-app-muted">{metric.label}</span>
              <AppBadge tone={metric.tone}>{metric.value}</AppBadge>
            </div>
            <strong className="text-3xl font-bold text-app-foreground">{metric.value}</strong>
          </AppCard>
        ))}
      </div>

      <AppCard className="grid gap-4 p-4 md:p-5">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.25fr)_minmax(160px,0.3fr)_minmax(170px,0.35fr)_minmax(160px,0.3fr)_auto] xl:items-end">
          <AppInput
            label={labels.search}
            placeholder={labels.searchPlaceholder}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <AppSelect label={labels.workflowFilter} value={workflowFilter} onChange={(event) => setWorkflowFilter(event.target.value)}>
            <option value="all">{labels.all}</option>
            {Object.entries(labels.workflow).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </AppSelect>
          <AppSelect label={labels.statusFilter} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">{labels.all}</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>{formatLabel(labels.statuses, option.value)}</option>
            ))}
          </AppSelect>
          <AppSelect label={labels.priorityFilter} value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}>
            <option value="all">{labels.all}</option>
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>{formatLabel(labels.priorities, option.value)}</option>
            ))}
          </AppSelect>
          <AppButton variant="ghost" onClick={() => { setSearch(""); setWorkflowFilter("all"); setStatusFilter("all"); setPriorityFilter("all"); }}>
            {labels.clear}
          </AppButton>
        </div>
      </AppCard>

      <AppCard className="p-4 md:p-5">
        {query.isLoading ? <AppLoadingState text={labels.loading} /> : null}
        {query.isError ? <AppErrorState title={labels.error} description={query.error instanceof Error ? query.error.message : labels.error} /> : null}
        {!query.isLoading && !query.isError && filteredRows.length === 0 ? (
          <AppEmptyState title={labels.emptyTitle} description={labels.emptyDescription} icon="support" />
        ) : null}
        {!query.isLoading && !query.isError && filteredRows.length > 0 ? (
          <AppTable
            rows={filteredRows}
            getRowKey={(row) => String(row.id)}
            columns={[
              {
                key: "customer",
                header: labels.fields.fullName,
                render: (row) => (
                  <div className="grid gap-1">
                    <span className="font-semibold text-app-foreground">{valueToText(row.full_name)}</span>
                    <span className="text-xs text-app-muted">{valueToText(row.email ?? row.phone)}</span>
                  </div>
                )
              },
              {
                key: "subject",
                header: labels.fields.subject,
                render: (row) => (
                  <div className="grid gap-1">
                    <span className="font-semibold text-app-foreground">{row.subject ? valueToText(row.subject) : labels.noSubject}</span>
                    <span className="text-xs text-app-muted">{row.app_name ? valueToText(row.app_name) : labels.noApp}</span>
                  </div>
                )
              },
              {
                key: "priority",
                header: labels.fields.priority,
                render: (row) => <AppBadge tone={priorityTone(row.priority)}>{formatLabel(labels.priorities, row.priority)}</AppBadge>
              },
              {
                key: "status",
                header: labels.fields.status,
                render: (row) => <StatusBadges status={row.status} labels={labels} />
              },
              {
                key: "created_at",
                header: labels.fields.createdAt,
                render: (row) => <span>{formatDate(row.created_at, locale)}</span>
              },
              {
                key: "actions",
                header: labels.fields.actions,
                render: (row) => (
                  <AppButton variant="secondary" className="min-h-10 px-3" onClick={() => openDetails(row)} icon={<AppIcon name="support" size={16} />}>
                    {labels.details}
                  </AppButton>
                )
              }
            ]}
          />
        ) : null}
      </AppCard>

      <AppModal open={Boolean(selectedRow)} title={labels.requestDetails} onClose={closeDetails} size="xl">
        {selectedRow ? (
          <div className="grid gap-5">
            {error ? <AppErrorState title={labels.error} description={error} /> : null}

            <div className="grid gap-3 lg:grid-cols-3">
              <AppCard className="grid gap-3 p-4">
                <h3 className="text-base font-bold text-app-foreground">{labels.customerInfo}</h3>
                <DetailLine label={labels.fields.fullName} value={selectedRow.full_name} />
                <DetailLine label={labels.fields.phone} value={selectedRow.phone} />
                <DetailLine label={labels.fields.email} value={selectedRow.email} />
                <div className="flex flex-wrap gap-2">
                  {selectedRow.phone ? (
                    <AppButton
                      variant="secondary"
                      className="min-h-10 px-3"
                      onClick={() => window.open(`tel:${selectedRow.phone}`, "_blank", "noopener,noreferrer")}
                    >
                      {labels.call}
                    </AppButton>
                  ) : null}
                  {selectedRow.email ? (
                    <AppButton
                      variant="ghost"
                      className="min-h-10 px-3"
                      onClick={() => window.open(`mailto:${selectedRow.email}?subject=${encodeURIComponent(String(selectedRow.subject ?? ""))}`, "_blank", "noopener,noreferrer")}
                    >
                      {labels.emailAction}
                    </AppButton>
                  ) : null}
                  {selectedRow.email ? (
                    <AppButton variant="ghost" className="min-h-10 px-3" onClick={handleCopyEmail}>
                      {copied ? labels.copied : labels.copyEmail}
                    </AppButton>
                  ) : null}
                </div>
              </AppCard>

              <AppCard className="grid gap-3 p-4">
                <h3 className="text-base font-bold text-app-foreground">{labels.requestInfo}</h3>
                <DetailLine label={labels.fields.appName} value={selectedRow.app_name || labels.noApp} />
                <DetailLine label={labels.fields.subject} value={selectedRow.subject || labels.noSubject} />
                <DetailLine label={labels.fields.status}>
                  <StatusBadges status={selectedRow.status} labels={labels} />
                </DetailLine>
                <DetailLine label={labels.fields.priority}>
                  <AppBadge tone={priorityTone(selectedRow.priority)}>{formatLabel(labels.priorities, selectedRow.priority)}</AppBadge>
                </DetailLine>
              </AppCard>

              <AppCard className="grid gap-3 p-4">
                <h3 className="text-base font-bold text-app-foreground">{labels.technicalInfo}</h3>
                <DetailLine label={labels.fields.createdAt} value={formatDate(selectedRow.created_at, locale)} />
                <DetailLine label={labels.fields.updatedAt} value={formatDate(selectedRow.updated_at, locale)} />
                <DetailLine label={labels.fields.resolvedAt} value={formatDate(selectedRow.resolved_at, locale)} />
                <DetailLine label={labels.fields.archivedAt} value={formatDate(selectedRow.archived_at, locale)} />
                <DetailLine label={labels.fields.ipAddress} value={selectedRow.ip_address} />
              </AppCard>
            </div>

            <AppTextarea label={labels.fields.message} value={String(selectedRow.message ?? "")} readOnly className="min-h-44" />

            <AppCard className="grid gap-4 p-4">
              <h3 className="text-base font-bold text-app-foreground">{labels.followUp}</h3>
              <div className="grid gap-4 lg:grid-cols-[minmax(180px,0.35fr)_minmax(180px,0.35fr)_minmax(0,1fr)]">
                <AppSelect label={labels.fields.status} value={status} onChange={(event) => setStatus(event.target.value)}>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>{formatLabel(labels.statuses, option.value)}</option>
                  ))}
                </AppSelect>
                <AppSelect label={labels.fields.priority} value={priority} onChange={(event) => setPriority(event.target.value)}>
                  {priorityOptions.map((option) => (
                    <option key={option.value} value={option.value}>{formatLabel(labels.priorities, option.value)}</option>
                  ))}
                </AppSelect>
                <AppTextarea
                  label={labels.fields.internalNote}
                  placeholder={labels.internalNotePlaceholder}
                  value={internalNote}
                  onChange={(event) => setInternalNote(event.target.value)}
                />
              </div>
              {!selectedRow.internal_note && !internalNote ? (
                <p className="rounded-appMd border border-app-border bg-app-surface p-3 text-sm text-app-muted">{labels.noNote}</p>
              ) : null}
            </AppCard>

            <div className="rounded-appMd border border-app-border bg-app-surface p-3 text-xs text-app-muted">
              <span className="font-semibold text-app-foreground">{labels.fields.userAgent}: </span>
              {valueToText(selectedRow.user_agent)}
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-app-border pt-4">
              <AppButton variant="ghost" onClick={closeDetails}>{labels.close}</AppButton>
              {selectedRow.status === "new" ? (
                <AppButton variant="secondary" disabled={isSaving} onClick={() => handleSave("reviewing")}>
                  {labels.startReview}
                </AppButton>
              ) : null}
              {selectedRow.status !== "resolved" && selectedRow.status !== "closed" && selectedRow.status !== "archived" ? (
                <AppButton variant="secondary" disabled={isSaving} onClick={() => handleSave("in_progress")}>
                  {labels.markInProgress}
                </AppButton>
              ) : null}
              {selectedRow.status !== "resolved" ? (
                <AppButton variant="secondary" disabled={isSaving} onClick={() => handleSave("resolved")}>
                  {labels.markResolved}
                </AppButton>
              ) : null}
              {selectedRow.status !== "archived" ? (
                <AppButton variant="ghost" disabled={isSaving} onClick={() => handleSave("archived")}>
                  {labels.archive}
                </AppButton>
              ) : null}
              <AppButton disabled={isSaving} onClick={() => handleSave()} icon={<AppIcon name="save" size={17} />}>
                {isSaving ? labels.loading : labels.save}
              </AppButton>
            </div>
          </div>
        ) : null}
      </AppModal>
    </div>
  );
}
