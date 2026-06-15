"use client";

/**
 * =====================================================
 * AdminContactMessagesPage
 * صفحة مخصصة لقراءة وإدارة رسائل التواصل القادمة من الموقع العام
 * =====================================================
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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

type ContactMessageRow = Record<string, unknown> & {
  id?: string;
  full_name?: string;
  email?: string | null;
  phone?: string | null;
  subject?: string | null;
  message?: string | null;
  status?: string;
  internal_note?: string | null;
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
  all: string;
  clear: string;
  loading: string;
  error: string;
  emptyTitle: string;
  emptyDescription: string;
  details: string;
  messageDetails: string;
  customerInfo: string;
  messageInfo: string;
  technicalInfo: string;
  replyActions: string;
  save: string;
  close: string;
  call: string;
  emailAction: string;
  markAsRead: string;
  copyEmail: string;
  copied: string;
  noSubject: string;
  noNote: string;
  internalNotePlaceholder: string;
  stats: {
    total: string;
    new: string;
    read: string;
    replied: string;
    archived: string;
  };
  workflow: Record<string, string>;
  fields: {
    fullName: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    status: string;
    internalNote: string;
    createdAt: string;
    updatedAt: string;
    archivedAt: string;
    ipAddress: string;
    userAgent: string;
    actions: string;
  };
  statuses: Record<string, string>;
  messages: {
    saved: string;
    saveFailed: string;
  };
};

type AdminContactMessagesPageProps = {
  locale: Locale;
};

const endpoint = "/admin/contact-messages";

const statusOptions: Option[] = [
  { value: "new", label: "new" },
  { value: "read", label: "read" },
  { value: "replied", label: "replied" },
  { value: "archived", label: "archived" }
];

const labelsByLocale: Record<Locale, Labels> = {
  ar: {
    eyebrow: "صندوق الوارد",
    title: "رسائل التواصل",
    description: "استقبال رسائل الزوار القادمة من صفحة التواصل، قراءتها، تحديث حالتها، وتسجيل ملاحظات داخلية للمتابعة.",
    refresh: "تحديث",
    search: "بحث",
    searchPlaceholder: "ابحث باسم العميل أو البريد أو الهاتف أو الموضوع...",
    statusFilter: "الحالة التفصيلية",
    workflowFilter: "حالة الرسالة",
    all: "الكل",
    clear: "مسح الفلاتر",
    loading: "جاري تحميل رسائل التواصل...",
    error: "تعذر تحميل البيانات",
    emptyTitle: "لا توجد رسائل تواصل",
    emptyDescription: "عندما يرسل زائر رسالة من نموذج التواصل ستظهر هنا مباشرة.",
    details: "عرض الرسالة",
    messageDetails: "تفاصيل رسالة التواصل",
    customerInfo: "بيانات المرسل",
    messageInfo: "محتوى الرسالة",
    technicalInfo: "معلومات تقنية",
    replyActions: "إجراءات الرد",
    save: "حفظ المتابعة",
    close: "إغلاق",
    call: "اتصال",
    emailAction: "إرسال بريد",
    markAsRead: "تعليم كمقروءة",
    copyEmail: "نسخ البريد",
    copied: "تم النسخ",
    noSubject: "بدون موضوع",
    noNote: "لا توجد ملاحظة داخلية بعد.",
    internalNotePlaceholder: "اكتب ملاحظة داخلية عن الرد، الاتفاق، أو الخطوة القادمة...",
    stats: {
      total: "إجمالي الرسائل",
      new: "مفتوحة جديدة",
      read: "مفتوحة مقروءة",
      replied: "محلولة / تم الرد",
      archived: "مغلقة / مؤرشفة"
    },
    workflow: {
      open: "مفتوحة",
      resolved: "محلولة",
      closed: "مغلقة"
    },
    fields: {
      fullName: "الاسم",
      email: "البريد الإلكتروني",
      phone: "الهاتف",
      subject: "الموضوع",
      message: "الرسالة",
      status: "الحالة",
      internalNote: "ملاحظة داخلية",
      createdAt: "تاريخ الإرسال",
      updatedAt: "آخر تحديث",
      archivedAt: "تاريخ الأرشفة",
      ipAddress: "عنوان IP",
      userAgent: "المتصفح/الجهاز",
      actions: "الإجراءات"
    },
    statuses: {
      new: "جديدة",
      read: "مقروءة",
      replied: "تم الرد",
      archived: "مؤرشفة"
    },
    messages: {
      saved: "تم تحديث رسالة التواصل بنجاح.",
      saveFailed: "تعذر تحديث رسالة التواصل."
    }
  },
  en: {
    eyebrow: "Inbox",
    title: "Contact Messages",
    description: "Receive website contact form submissions, review them, update their status, and keep internal follow-up notes.",
    refresh: "Refresh",
    search: "Search",
    searchPlaceholder: "Search by customer, email, phone, or subject...",
    statusFilter: "Detailed status",
    workflowFilter: "Message status",
    all: "All",
    clear: "Clear filters",
    loading: "Loading contact messages...",
    error: "Unable to load data",
    emptyTitle: "No contact messages",
    emptyDescription: "New messages submitted from the contact form will appear here.",
    details: "View message",
    messageDetails: "Contact message details",
    customerInfo: "Sender details",
    messageInfo: "Message content",
    technicalInfo: "Technical info",
    replyActions: "Reply actions",
    save: "Save follow-up",
    close: "Close",
    call: "Call",
    emailAction: "Send email",
    markAsRead: "Mark as read",
    copyEmail: "Copy email",
    copied: "Copied",
    noSubject: "No subject",
    noNote: "No internal note yet.",
    internalNotePlaceholder: "Write an internal note about the reply, agreement, or next step...",
    stats: {
      total: "Total messages",
      new: "Open new",
      read: "Open read",
      replied: "Resolved / replied",
      archived: "Closed / archived"
    },
    workflow: {
      open: "Open",
      resolved: "Resolved",
      closed: "Closed"
    },
    fields: {
      fullName: "Name",
      email: "Email",
      phone: "Phone",
      subject: "Subject",
      message: "Message",
      status: "Status",
      internalNote: "Internal note",
      createdAt: "Sent at",
      updatedAt: "Updated at",
      archivedAt: "Archived at",
      ipAddress: "IP address",
      userAgent: "Browser/device",
      actions: "Actions"
    },
    statuses: {
      new: "Open new",
      read: "Open read",
      replied: "Resolved / replied",
      archived: "Closed / archived"
    },
    messages: {
      saved: "Contact message updated successfully.",
      saveFailed: "Unable to update contact message."
    }
  }
};

function workflowKey(value?: string): "open" | "resolved" | "closed" {
  if (value === "archived") {
    return "closed";
  }

  if (value === "replied") {
    return "resolved";
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

function statusTone(value?: string): BadgeTone {
  if (value === "new") {
    return "warning";
  }

  if (value === "read") {
    return "primary";
  }

  if (value === "replied") {
    return "success";
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

function metricCards(rows: ContactMessageRow[], labels: Labels) {
  const newCount = rows.filter((row) => row.status === "new").length;
  const readCount = rows.filter((row) => row.status === "read").length;
  const repliedCount = rows.filter((row) => row.status === "replied").length;
  const archivedCount = rows.filter((row) => row.status === "archived").length;

  return [
    { key: "total", label: labels.stats.total, value: rows.length, tone: "primary" as BadgeTone },
    { key: "new", label: labels.stats.new, value: newCount, tone: newCount > 0 ? "warning" as BadgeTone : "neutral" as BadgeTone },
    { key: "read", label: labels.stats.read, value: readCount, tone: "primary" as BadgeTone },
    { key: "replied", label: labels.stats.replied, value: repliedCount, tone: "success" as BadgeTone },
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

export function AdminContactMessagesPage({ locale }: AdminContactMessagesPageProps) {
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
  const [selectedRow, setSelectedRow] = useState<ContactMessageRow | null>(null);
  const [dismissedLinkedRowId, setDismissedLinkedRowId] = useState<string | null>(null);
  const [status, setStatus] = useState("new");
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

  const rows = useMemo(() => (Array.isArray(query.data) ? (query.data as ContactMessageRow[]) : []), [query.data]);

  const filteredRows = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesWorkflow = workflowFilter === "all" || workflowKey(row.status) === workflowFilter;
      const matchesStatus = statusFilter === "all" || row.status === statusFilter;
      const haystack = [
        row.full_name,
        row.email,
        row.phone,
        row.subject,
        row.message,
        row.status,
        row.internal_note
      ].map(normalizeText).join(" ");

      return matchesWorkflow && matchesStatus && (!needle || haystack.includes(needle));
    });
  }, [rows, search, statusFilter, workflowFilter]);

  const metrics = useMemo(() => metricCards(rows, labels), [labels, rows]);

  useEffect(() => {
    if (!linkedRowId || selectedRow || linkedRowId === dismissedLinkedRowId) {
      return;
    }

    const matchedRow = rows.find((row) => String(row.id ?? "") === linkedRowId);

    if (matchedRow) {
      setSelectedRow(matchedRow);
      setStatus(matchedRow.status ?? "new");
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

  const openDetails = (row: ContactMessageRow) => {
    setSelectedRow(row);
    setDismissedLinkedRowId(null);
    setStatus(row.status ?? "new");
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

      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
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
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.35fr)_minmax(160px,0.3fr)_minmax(180px,0.35fr)_auto] xl:items-end">
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
          <AppButton variant="ghost" onClick={() => { setSearch(""); setWorkflowFilter("all"); setStatusFilter("all"); }}>
            {labels.clear}
          </AppButton>
        </div>
      </AppCard>

      <AppCard className="p-4 md:p-5">
        {query.isLoading ? <AppLoadingState text={labels.loading} /> : null}
        {query.isError ? <AppErrorState title={labels.error} description={query.error instanceof Error ? query.error.message : labels.error} /> : null}
        {!query.isLoading && !query.isError && filteredRows.length === 0 ? (
          <AppEmptyState title={labels.emptyTitle} description={labels.emptyDescription} icon="email" />
        ) : null}
        {!query.isLoading && !query.isError && filteredRows.length > 0 ? (
          <AppTable
            rows={filteredRows}
            getRowKey={(row) => String(row.id)}
            columns={[
              {
                key: "sender",
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
                render: (row) => <span>{row.subject ? valueToText(row.subject) : labels.noSubject}</span>
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
                  <AppButton variant="secondary" className="min-h-10 px-3" onClick={() => openDetails(row)} icon={<AppIcon name="email" size={16} />}>
                    {labels.details}
                  </AppButton>
                )
              }
            ]}
          />
        ) : null}
      </AppCard>

      <AppModal open={Boolean(selectedRow)} title={labels.messageDetails} onClose={closeDetails} size="xl">
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
                <h3 className="text-base font-bold text-app-foreground">{labels.messageInfo}</h3>
                <DetailLine label={labels.fields.subject} value={selectedRow.subject || labels.noSubject} />
                <DetailLine label={labels.fields.status}>
                  <StatusBadges status={selectedRow.status} labels={labels} />
                </DetailLine>
                <DetailLine label={labels.fields.createdAt} value={formatDate(selectedRow.created_at, locale)} />
                <DetailLine label={labels.fields.updatedAt} value={formatDate(selectedRow.updated_at, locale)} />
              </AppCard>

              <AppCard className="grid gap-3 p-4">
                <h3 className="text-base font-bold text-app-foreground">{labels.technicalInfo}</h3>
                <DetailLine label={labels.fields.ipAddress} value={selectedRow.ip_address} />
                <DetailLine label={labels.fields.archivedAt} value={formatDate(selectedRow.archived_at, locale)} />
                <DetailLine label={labels.fields.userAgent} value={selectedRow.user_agent} />
              </AppCard>
            </div>

            <AppTextarea label={labels.fields.message} value={String(selectedRow.message ?? "")} readOnly className="min-h-40" />

            <div className="grid gap-4 lg:grid-cols-[minmax(220px,0.35fr)_minmax(0,1fr)]">
              <AppSelect label={labels.fields.status} value={status} onChange={(event) => setStatus(event.target.value)}>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>{formatLabel(labels.statuses, option.value)}</option>
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

            <div className="flex flex-wrap justify-end gap-2 border-t border-app-border pt-4">
              <AppButton variant="ghost" onClick={closeDetails}>{labels.close}</AppButton>
              {selectedRow.status === "new" ? (
                <AppButton variant="secondary" disabled={isSaving} onClick={() => handleSave("read")}>
                  {labels.markAsRead}
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
