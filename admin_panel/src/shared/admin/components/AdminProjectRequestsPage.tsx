"use client";

/**
 * =====================================================
 * AdminProjectRequestsPage
 * صفحة مخصصة لاستقبال وإدارة طلبات المشاريع القادمة من الموقع العام
 * =====================================================
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { valueToText } from "@/shared/admin/admin-formatters";
import { addQuoteNote, listAdminItems, updateAdminItem } from "@/shared/api/admin-client";
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

type ProjectRequestNote = Record<string, unknown> & {
  id?: string;
  note?: string;
  created_at?: string;
  is_system?: boolean;
};

type ProjectRequestRow = Record<string, unknown> & {
  id?: string;
  full_name?: string;
  email?: string | null;
  phone?: string | null;
  project_type?: string;
  expected_budget?: string | number | null;
  expected_duration?: string | null;
  description?: string;
  attachment_url?: string | null;
  preferred_contact_method?: string;
  status?: string;
  priority?: string;
  source?: string | null;
  follow_up_at?: string | null;
  created_at?: string;
  updated_at?: string;
  notes?: ProjectRequestNote[];
};

type Option = {
  label: string;
  value: string;
};

type Labels = {
  title: string;
  description: string;
  eyebrow: string;
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
  save: string;
  close: string;
  details: string;
  updateRequest: string;
  addNote: string;
  newNotePlaceholder: string;
  notesTitle: string;
  noNotes: string;
  requestDetails: string;
  customerInfo: string;
  projectInfo: string;
  followUp: string;
  noFollowUp: string;
  contactNow: string;
  openAttachment: string;
  noAttachment: string;
  stats: {
    total: string;
    new: string;
    active: string;
    waiting: string;
    accepted: string;
    archived: string;
  };
  workflow: Record<string, string>;
  fields: {
    fullName: string;
    email: string;
    phone: string;
    projectType: string;
    expectedBudget: string;
    expectedDuration: string;
    description: string;
    contactMethod: string;
    status: string;
    priority: string;
    createdAt: string;
    updatedAt: string;
    source: string;
    followUpAt: string;
    attachment: string;
    actions: string;
  };
  statuses: Record<string, string>;
  priorities: Record<string, string>;
  projectTypes: Record<string, string>;
  contactMethods: Record<string, string>;
  messages: {
    saved: string;
    saveFailed: string;
  };
};

type AdminProjectRequestsPageProps = {
  locale: Locale;
  labels?: Partial<Labels> | null;
};

const endpoint = "/admin/quote-requests";

const DEFAULT_PROJECT_REQUEST_LABELS: Labels = {
  title: "طلبات المشاريع",
  description: "استقبل طلبات المشاريع القادمة من الموقع العام وتابع حالتها وأولويتها.",
  eyebrow: "إدارة العملاء",
  refresh: "تحديث",
  search: "بحث",
  searchPlaceholder: "ابحث باسم العميل أو الهاتف أو البريد أو نوع المشروع...",
  statusFilter: "الحالة التفصيلية",
  workflowFilter: "حالة الطلب",
  priorityFilter: "الأولوية",
  all: "الكل",
  clear: "مسح الفلاتر",
  loading: "جاري التحميل...",
  error: "تعذر تحميل البيانات",
  emptyTitle: "لا توجد طلبات مشاريع",
  emptyDescription: "عندما يرسل عميل طلب مشروع من الموقع العام سيظهر هنا.",
  save: "حفظ",
  close: "إغلاق",
  details: "عرض",
  updateRequest: "تحديث الطلب",
  addNote: "إضافة ملاحظة داخلية",
  newNotePlaceholder: "اكتب ملاحظة للمتابعة الداخلية...",
  notesTitle: "الملاحظات",
  noNotes: "لا توجد ملاحظات بعد.",
  requestDetails: "تفاصيل طلب المشروع",
  customerInfo: "بيانات العميل",
  projectInfo: "تفاصيل المشروع",
  followUp: "المتابعة",
  noFollowUp: "لا يوجد موعد متابعة",
  contactNow: "اتصال",
  openAttachment: "فتح المرفق",
  noAttachment: "لا يوجد مرفق",
  stats: {
    total: "إجمالي الطلبات",
    new: "مفتوحة جديدة",
    active: "مفتوحة قيد المتابعة",
    waiting: "بانتظار العميل",
    accepted: "محلولة / منجزة",
    archived: "مغلقة / مرفوضة"
  },
  workflow: {
    open: "مفتوح",
    waiting: "بانتظار العميل",
    resolved: "محلول",
    closed: "مغلق"
  },
  fields: {
    fullName: "اسم العميل",
    email: "البريد الإلكتروني",
    phone: "الهاتف",
    projectType: "نوع المشروع",
    expectedBudget: "الميزانية المتوقعة",
    expectedDuration: "المدة المتوقعة",
    description: "وصف المشروع",
    contactMethod: "وسيلة التواصل",
    status: "الحالة",
    priority: "الأولوية",
    createdAt: "تاريخ الإرسال",
    updatedAt: "آخر تحديث",
    source: "المصدر",
    followUpAt: "موعد المتابعة",
    attachment: "المرفق",
    actions: "الإجراءات"
  },
  statuses: {
    new: "جديد",
    reviewing: "قيد المراجعة",
    contacted: "تم التواصل",
    waiting_customer: "بانتظار العميل",
    proposal_sent: "تم إرسال العرض",
    accepted: "مقبول",
    rejected: "مرفوض",
    completed: "منجز",
    archived: "مؤرشف"
  },
  priorities: {
    low: "منخفضة",
    normal: "عادية",
    high: "عالية",
    urgent: "عاجلة"
  },
  projectTypes: {
    website: "موقع إلكتروني",
    web_app: "تطبيق ويب",
    desktop_app: "تطبيق سطح مكتب",
    mobile_app: "تطبيق جوال",
    management_system: "نظام إداري",
    ecommerce: "متجر إلكتروني",
    other: "أخرى"
  },
  contactMethods: {
    phone: "اتصال هاتفي",
    whatsapp: "واتساب",
    email: "بريد إلكتروني",
    any: "أي وسيلة مناسبة"
  },
  messages: {
    saved: "تم تحديث طلب المشروع بنجاح.",
    saveFailed: "تعذر حفظ التغييرات. حاول مرة أخرى."
  }
};

function mergeProjectRequestLabels(input?: Partial<Labels> | null): Labels {
  const source = input ?? {};
  return {
    ...DEFAULT_PROJECT_REQUEST_LABELS,
    ...source,
    stats: { ...DEFAULT_PROJECT_REQUEST_LABELS.stats, ...(source.stats ?? {}) },
    workflow: { ...DEFAULT_PROJECT_REQUEST_LABELS.workflow, ...(source.workflow ?? {}) },
    fields: { ...DEFAULT_PROJECT_REQUEST_LABELS.fields, ...(source.fields ?? {}) },
    statuses: { ...DEFAULT_PROJECT_REQUEST_LABELS.statuses, ...(source.statuses ?? {}) },
    priorities: { ...DEFAULT_PROJECT_REQUEST_LABELS.priorities, ...(source.priorities ?? {}) },
    projectTypes: { ...DEFAULT_PROJECT_REQUEST_LABELS.projectTypes, ...(source.projectTypes ?? {}) },
    contactMethods: { ...DEFAULT_PROJECT_REQUEST_LABELS.contactMethods, ...(source.contactMethods ?? {}) },
    messages: { ...DEFAULT_PROJECT_REQUEST_LABELS.messages, ...(source.messages ?? {}) }
  };
}


const statusOptions: Option[] = [
  { value: "new", label: "new" },
  { value: "reviewing", label: "reviewing" },
  { value: "contacted", label: "contacted" },
  { value: "waiting_customer", label: "waiting_customer" },
  { value: "proposal_sent", label: "proposal_sent" },
  { value: "accepted", label: "accepted" },
  { value: "rejected", label: "rejected" },
  { value: "completed", label: "completed" },
  { value: "archived", label: "archived" }
];

const priorityOptions: Option[] = [
  { value: "low", label: "low" },
  { value: "normal", label: "normal" },
  { value: "high", label: "high" },
  { value: "urgent", label: "urgent" }
];

function statusTone(value?: string): BadgeTone {
  if (["new", "reviewing", "contacted"].includes(value ?? "")) {
    return "primary";
  }

  if (["accepted", "completed"].includes(value ?? "")) {
    return "success";
  }

  if (["waiting_customer", "proposal_sent"].includes(value ?? "")) {
    return "warning";
  }

  if (value === "rejected") {
    return "danger";
  }

  return "neutral";
}

function workflowKey(value?: string): "open" | "waiting" | "resolved" | "closed" {
  if (value === "waiting_customer") {
    return "waiting";
  }

  if (["accepted", "completed"].includes(value ?? "")) {
    return "resolved";
  }

  if (["rejected", "archived"].includes(value ?? "")) {
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

function metricCards(rows: ProjectRequestRow[], labels: Labels) {
  const newCount = rows.filter((row) => row.status === "new").length;
  const activeCount = rows.filter((row) => ["reviewing", "contacted", "proposal_sent"].includes(row.status ?? "")).length;
  const waitingCount = rows.filter((row) => row.status === "waiting_customer").length;
  const acceptedCount = rows.filter((row) => row.status === "accepted" || row.status === "completed").length;
  const archivedCount = rows.filter((row) => row.status === "archived" || row.status === "rejected").length;

  return [
    { key: "total", label: labels.stats.total, value: rows.length, tone: "primary" as BadgeTone },
    { key: "new", label: labels.stats.new, value: newCount, tone: newCount > 0 ? "warning" as BadgeTone : "neutral" as BadgeTone },
    { key: "active", label: labels.stats.active, value: activeCount, tone: "primary" as BadgeTone },
    { key: "waiting", label: labels.stats.waiting, value: waitingCount, tone: waitingCount > 0 ? "warning" as BadgeTone : "neutral" as BadgeTone },
    { key: "accepted", label: labels.stats.accepted, value: acceptedCount, tone: "success" as BadgeTone },
    { key: "archived", label: labels.stats.archived, value: archivedCount, tone: "neutral" as BadgeTone }
  ];
}

function DetailLine({ label, value, children }: { label: string; value?: unknown; children?: React.ReactNode }) {
  return (
    <div className="grid gap-1 rounded-appMd border border-app-border bg-app-surface p-3">
      <span className="text-xs font-semibold text-app-muted">{label}</span>
      {children ?? <span className="break-words text-sm font-semibold text-app-foreground">{valueToText(value)}</span>}
    </div>
  );
}

export function AdminProjectRequestsPage({ locale, labels: rawLabels }: AdminProjectRequestsPageProps) {
  const labels = useMemo(() => mergeProjectRequestLabels(rawLabels), [rawLabels]);
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
  const [selectedRow, setSelectedRow] = useState<ProjectRequestRow | null>(null);
  const [dismissedLinkedRowId, setDismissedLinkedRowId] = useState<string | null>(null);
  const [status, setStatus] = useState("new");
  const [priority, setPriority] = useState("normal");
  const [followUpAt, setFollowUpAt] = useState("");
  const [newNote, setNewNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const linkedRowId = searchParams.get("open") ?? searchParams.get("target") ?? searchParams.get("id");

  const query = useQuery({
    queryKey: [endpoint, token],
    queryFn: () => listAdminItems(endpoint, { token, skip: 0, limit: 100 }),
    enabled: Boolean(token)
  });

  const rows = useMemo(() => (Array.isArray(query.data) ? (query.data as ProjectRequestRow[]) : []), [query.data]);

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
        row.project_type,
        row.expected_duration,
        row.description,
        row.preferred_contact_method,
        row.status,
        row.priority,
        row.source
      ].map(normalizeText).join(" ");
      return matchesWorkflow && matchesStatus && matchesPriority && (!needle || haystack.includes(needle));
    });
  }, [priorityFilter, rows, search, statusFilter, workflowFilter]);

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
      setFollowUpAt(matchedRow.follow_up_at ? matchedRow.follow_up_at.slice(0, 16) : "");
      setNewNote("");
      setError(null);
      setMessage(null);
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

  const openDetails = (row: ProjectRequestRow) => {
    setSelectedRow(row);
    setDismissedLinkedRowId(null);
    setStatus(row.status ?? "new");
    setPriority(row.priority ?? "normal");
    setFollowUpAt(row.follow_up_at ? row.follow_up_at.slice(0, 16) : "");
    setNewNote("");
    setError(null);
    setMessage(null);
  };

  const closeDetails = () => {
    if (linkedRowId) {
      setDismissedLinkedRowId(linkedRowId);
      clearLinkedRowQuery();
    }

    setSelectedRow(null);
    setError(null);
    setMessage(null);
  };

  const handleSave = async () => {
    if (!selectedRow?.id) {
      return;
    }

    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      await updateAdminItem(`${endpoint}/${selectedRow.id}`, token, {
        status,
        priority,
        follow_up_at: followUpAt ? new Date(followUpAt).toISOString() : null
      });

      if (newNote.trim()) {
        await addQuoteNote(token, selectedRow.id, newNote.trim());
      }

      await queryClient.invalidateQueries({ queryKey: [endpoint] });
      await query.refetch();
      setMessage(labels.messages.saved);
      closeDetails();
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : labels.messages.saveFailed);
    } finally {
      setIsSaving(false);
    }
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

      {message ? (
        <div className="rounded-appLg border border-app-success/30 bg-app-success/10 px-4 py-3 text-sm font-semibold text-app-success">
          {message}
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
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
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.25fr)_minmax(160px,0.3fr)_minmax(180px,0.35fr)_minmax(160px,0.3fr)_auto] xl:items-end">
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
          <AppEmptyState title={labels.emptyTitle} description={labels.emptyDescription} icon="messages" />
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
                    <span className="text-xs text-app-muted">{valueToText(row.phone)}</span>
                  </div>
                )
              },
              {
                key: "project_type",
                header: labels.fields.projectType,
                render: (row) => <span>{formatLabel(labels.projectTypes, row.project_type)}</span>
              },
              {
                key: "budget",
                header: labels.fields.expectedBudget,
                render: (row) => <span>{valueToText(row.expected_budget)}</span>
              },
              {
                key: "status",
                header: labels.fields.status,
                render: (row) => <StatusBadges status={row.status} labels={labels} />
              },
              {
                key: "priority",
                header: labels.fields.priority,
                render: (row) => <AppBadge tone={priorityTone(row.priority)}>{formatLabel(labels.priorities, row.priority)}</AppBadge>
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
                  <AppButton variant="secondary" className="min-h-10 px-3" onClick={() => openDetails(row)} icon={<AppIcon name="edit" size={16} />}>
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
                <DetailLine label={labels.fields.contactMethod} value={formatLabel(labels.contactMethods, selectedRow.preferred_contact_method)} />
                <div className="flex flex-wrap gap-2">
                  {selectedRow.phone ? (
                    <AppButton
                      variant="secondary"
                      className="min-h-10 px-3"
                      onClick={() => window.open(`tel:${selectedRow.phone}`, "_blank", "noopener,noreferrer")}
                    >
                      {labels.contactNow}
                    </AppButton>
                  ) : null}
                  {selectedRow.email ? (
                    <AppButton
                      variant="ghost"
                      className="min-h-10 px-3"
                      onClick={() => window.open(`mailto:${selectedRow.email}`, "_blank", "noopener,noreferrer")}
                    >
                      {labels.fields.email}
                    </AppButton>
                  ) : null}
                </div>
              </AppCard>

              <AppCard className="grid gap-3 p-4">
                <h3 className="text-base font-bold text-app-foreground">{labels.projectInfo}</h3>
                <DetailLine label={labels.fields.projectType} value={formatLabel(labels.projectTypes, selectedRow.project_type)} />
                <DetailLine label={labels.fields.expectedBudget} value={selectedRow.expected_budget} />
                <DetailLine label={labels.fields.expectedDuration} value={selectedRow.expected_duration} />
                <DetailLine label={labels.fields.source} value={selectedRow.source} />
                <DetailLine label={labels.fields.attachment}>
                  {selectedRow.attachment_url ? (
                    <a className="text-sm font-semibold text-app-primary underline" href={selectedRow.attachment_url} target="_blank" rel="noreferrer">
                      {labels.openAttachment}
                    </a>
                  ) : (
                    <span className="text-sm font-semibold text-app-muted">{labels.noAttachment}</span>
                  )}
                </DetailLine>
              </AppCard>

              <AppCard className="grid gap-3 p-4">
                <h3 className="text-base font-bold text-app-foreground">{labels.followUp}</h3>
                <DetailLine label={labels.fields.createdAt} value={formatDate(selectedRow.created_at, locale)} />
                <DetailLine label={labels.fields.updatedAt} value={formatDate(selectedRow.updated_at, locale)} />
                <DetailLine label={labels.fields.status}>
                  <StatusBadges status={selectedRow.status} labels={labels} />
                </DetailLine>
                <DetailLine label={labels.fields.followUpAt} value={selectedRow.follow_up_at ? formatDate(selectedRow.follow_up_at, locale) : labels.noFollowUp} />
              </AppCard>
            </div>

            <AppTextarea label={labels.fields.description} value={String(selectedRow.description ?? "")} readOnly />

            <div className="grid gap-4 md:grid-cols-3">
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
              <AppInput
                label={labels.fields.followUpAt}
                type="datetime-local"
                value={followUpAt}
                onChange={(event) => setFollowUpAt(event.target.value)}
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <AppTextarea
                label={labels.addNote}
                placeholder={labels.newNotePlaceholder}
                value={newNote}
                onChange={(event) => setNewNote(event.target.value)}
              />

              <div className="grid gap-2 rounded-appLg border border-app-border bg-app-surfaceElevated p-4">
                <h3 className="text-base font-bold text-app-foreground">{labels.notesTitle}</h3>
                {selectedRow.notes && selectedRow.notes.length > 0 ? (
                  <div className="grid max-h-56 gap-2 overflow-auto">
                    {selectedRow.notes.map((note) => (
                      <div key={String(note.id ?? note.created_at ?? note.note)} className="grid gap-1 rounded-appMd bg-app-surface p-3">
                        <p className="text-sm leading-6 text-app-foreground">{valueToText(note.note)}</p>
                        <span className="text-xs text-app-muted">{formatDate(note.created_at, locale)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-appMd bg-app-surface p-3 text-sm text-app-muted">{labels.noNotes}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-app-border pt-4">
              <AppButton variant="ghost" onClick={closeDetails}>{labels.close}</AppButton>
              <AppButton disabled={isSaving} onClick={handleSave} icon={<AppIcon name="save" size={17} />}>
                {isSaving ? labels.loading : labels.updateRequest}
              </AppButton>
            </div>
          </div>
        ) : null}
      </AppModal>
    </div>
  );
}
