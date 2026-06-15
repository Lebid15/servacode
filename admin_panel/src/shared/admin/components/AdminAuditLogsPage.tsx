"use client";

/**
 * =====================================================
 * AdminAuditLogsPage
 * صفحة مخصصة لعرض سجل العمليات داخل لوحة الأدمن
 * =====================================================
 */

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "@/shared/api/api-client";
import { useAdminAuth } from "@/shared/auth/AdminAuthProvider";
import { AppBadge, type BadgeTone } from "@/shared/design-system/components/AppBadge";
import { AppButton } from "@/shared/design-system/components/AppButton";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppEmptyState } from "@/shared/design-system/components/AppEmptyState";
import { AppErrorState } from "@/shared/design-system/components/AppErrorState";
import { AppInput } from "@/shared/design-system/components/AppInput";
import { AppLoadingState } from "@/shared/design-system/components/AppLoadingState";
import { AppModal } from "@/shared/design-system/components/AppModal";
import { AppPageHeader } from "@/shared/design-system/components/AppPageHeader";
import { AppSelect } from "@/shared/design-system/components/AppSelect";
import { AppTable } from "@/shared/design-system/components/AppTable";
import type { Locale } from "@/shared/design-system/utils/direction";

type AuditActionValue =
  | "login_success"
  | "login_failed"
  | "create"
  | "update"
  | "delete"
  | "activate"
  | "deactivate"
  | "status_change"
  | "settings_change"
  | "theme_change"
  | "language_change"
  | "password_change"
  | "export";

type AuditUser = {
  id: string;
  full_name?: string | null;
  username?: string | null;
  email?: string | null;
};

type AuditLogRow = {
  id: string;
  user_id?: string | null;
  user?: AuditUser | null;
  action?: AuditActionValue | string | null;
  entity_type?: string | null;
  entity_id?: string | null;
  description?: string | null;
  before_data?: Record<string, unknown> | null;
  after_data?: Record<string, unknown> | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at?: string | null;
};

type AuditResponse = {
  items: AuditLogRow[];
  total: number;
  skip: number;
  limit: number;
  stats: {
    total: number;
    create: number;
    update: number;
    delete: number;
    settings: number;
    login_failed: number;
  };
  action_counts?: Record<string, number>;
  entity_types?: string[];
};

type AuditFilters = {
  search: string;
  action: string;
  entityType: string;
  dateFrom: string;
  dateTo: string;
};

type AuditLabels = {
  eyebrow: string;
  title: string;
  description: string;
  refresh: string;
  search: string;
  action: string;
  entityType: string;
  dateFrom: string;
  dateTo: string;
  all: string;
  reset: string;
  statsTotal: string;
  statsCreate: string;
  statsUpdate: string;
  statsDelete: string;
  statsSettings: string;
  statsFailedLogin: string;
  operation: string;
  user: string;
  entity: string;
  ip: string;
  date: string;
  actions: string;
  details: string;
  noUser: string;
  noEntity: string;
  noData: string;
  before: string;
  after: string;
  technical: string;
  userAgent: string;
  entityId: string;
  loading: string;
  emptyTitle: string;
  emptyDescription: string;
  errorTitle: string;
  totalResult: string;
  pageHint: string;
  actionsMap: Record<AuditActionValue, string>;
};

const AR_LABELS: AuditLabels = {
  eyebrow: "سجل التدقيق",
  title: "سجل العمليات",
  description: "متابعة العمليات الحساسة التي تحدث داخل لوحة الأدمن مثل الإنشاء والتعديل والحذف وتغيير الإعدادات وتسجيل الدخول.",
  refresh: "تحديث",
  search: "بحث في الوصف أو المستخدم أو الكيان",
  action: "نوع العملية",
  entityType: "القسم / الجدول",
  dateFrom: "من تاريخ",
  dateTo: "إلى تاريخ",
  all: "الكل",
  reset: "مسح الفلاتر",
  statsTotal: "إجمالي العمليات",
  statsCreate: "عمليات إنشاء",
  statsUpdate: "عمليات تعديل",
  statsDelete: "عمليات حذف",
  statsSettings: "تعديلات الإعدادات",
  statsFailedLogin: "فشل تسجيل دخول",
  operation: "العملية",
  user: "المستخدم",
  entity: "الكيان",
  ip: "IP",
  date: "التاريخ",
  actions: "الإجراءات",
  details: "التفاصيل",
  noUser: "مستخدم غير معروف",
  noEntity: "غير محدد",
  noData: "لا توجد بيانات",
  before: "قبل العملية",
  after: "بعد العملية",
  technical: "معلومات تقنية",
  userAgent: "المتصفح / الجهاز",
  entityId: "معرف العنصر",
  loading: "جارٍ تحميل سجل العمليات...",
  emptyTitle: "لا توجد عمليات",
  emptyDescription: "عند تنفيذ عمليات داخل لوحة الأدمن ستظهر السجلات هنا.",
  errorTitle: "تعذر تحميل سجل العمليات",
  totalResult: "عدد النتائج",
  pageHint: "هذه الصفحة للقراءة والمراجعة فقط، ولا يتم حذف سجلات التدقيق من لوحة الأدمن.",
  actionsMap: {
    login_success: "تسجيل دخول ناجح",
    login_failed: "فشل تسجيل دخول",
    create: "إنشاء",
    update: "تعديل",
    delete: "حذف",
    activate: "تفعيل",
    deactivate: "تعطيل",
    status_change: "تغيير حالة",
    settings_change: "تعديل إعدادات",
    theme_change: "تغيير ثيم",
    language_change: "تغيير لغة",
    password_change: "تغيير كلمة مرور",
    export: "تصدير"
  }
};

const EN_LABELS: AuditLabels = {
  eyebrow: "Audit Trail",
  title: "Audit Logs",
  description: "Track sensitive admin-panel actions such as create, update, delete, settings changes, and login events.",
  refresh: "Refresh",
  search: "Search description, user, or entity",
  action: "Action type",
  entityType: "Section / table",
  dateFrom: "From date",
  dateTo: "To date",
  all: "All",
  reset: "Clear filters",
  statsTotal: "Total actions",
  statsCreate: "Created",
  statsUpdate: "Updated",
  statsDelete: "Deleted",
  statsSettings: "Settings changes",
  statsFailedLogin: "Failed logins",
  operation: "Operation",
  user: "User",
  entity: "Entity",
  ip: "IP",
  date: "Date",
  actions: "Actions",
  details: "Details",
  noUser: "Unknown user",
  noEntity: "Not specified",
  noData: "No data",
  before: "Before",
  after: "After",
  technical: "Technical info",
  userAgent: "Browser / device",
  entityId: "Entity ID",
  loading: "Loading audit logs...",
  emptyTitle: "No audit logs",
  emptyDescription: "Admin-panel operations will appear here once they happen.",
  errorTitle: "Unable to load audit logs",
  totalResult: "Results",
  pageHint: "This page is read-only. Audit records are not deleted from the admin panel.",
  actionsMap: {
    login_success: "Login success",
    login_failed: "Login failed",
    create: "Create",
    update: "Update",
    delete: "Delete",
    activate: "Activate",
    deactivate: "Deactivate",
    status_change: "Status change",
    settings_change: "Settings change",
    theme_change: "Theme change",
    language_change: "Language change",
    password_change: "Password change",
    export: "Export"
  }
};

const ACTION_OPTIONS: AuditActionValue[] = [
  "login_success",
  "login_failed",
  "create",
  "update",
  "delete",
  "activate",
  "deactivate",
  "status_change",
  "settings_change",
  "theme_change",
  "language_change",
  "password_change",
  "export"
];

function queryString(params: Record<string, string | number | undefined | null>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const value = searchParams.toString();
  return value ? `?${value}` : "";
}

function actionTone(action?: string | null): BadgeTone {
  if (action === "create" || action === "activate" || action === "login_success") {
    return "success";
  }
  if (action === "delete" || action === "deactivate" || action === "login_failed") {
    return "danger";
  }
  if (action === "settings_change" || action === "password_change" || action === "status_change") {
    return "warning";
  }
  return "primary";
}

function actionLabel(action: string | null | undefined, labels: AuditLabels) {
  if (!action) {
    return labels.noEntity;
  }
  return labels.actionsMap[action as AuditActionValue] ?? action;
}

function formatDate(value?: string | null, locale: Locale = "ar") {
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

function userLabel(row: AuditLogRow, labels: AuditLabels) {
  const user = row.user;
  if (!user) {
    return labels.noUser;
  }
  return user.full_name || user.username || user.email || labels.noUser;
}

function entityLabel(row: AuditLogRow, labels: AuditLabels) {
  if (!row.entity_type) {
    return labels.noEntity;
  }
  return row.entity_id ? `${row.entity_type} • ${row.entity_id}` : row.entity_type;
}

function JsonBlock({ value, emptyText }: { value?: Record<string, unknown> | null; emptyText: string }) {
  if (!value || Object.keys(value).length === 0) {
    return <p className="rounded-appMd border border-app-border bg-app-surfaceElevated p-4 text-sm text-app-muted">{emptyText}</p>;
  }

  return (
    <pre className="max-h-80 overflow-auto rounded-appMd border border-app-border bg-app-surfaceElevated p-4 text-xs leading-6 text-app-foreground">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

async function fetchAuditLogs(token: string, filters: AuditFilters) {
  return apiRequest<AuditResponse>(
    `/admin/audit-logs${queryString({
      search: filters.search,
      action: filters.action,
      entity_type: filters.entityType,
      date_from: filters.dateFrom,
      date_to: filters.dateTo,
      skip: 0,
      limit: 100
    })}`,
    { token }
  );
}

type AdminAuditLogsPageProps = {
  locale: Locale;
};

export function AdminAuditLogsPage({ locale }: AdminAuditLogsPageProps) {
  const labels = locale === "ar" ? AR_LABELS : EN_LABELS;
  const { tokens } = useAdminAuth();
  const token = tokens?.access_token ?? "";
  const [filters, setFilters] = useState<AuditFilters>({
    search: "",
    action: "",
    entityType: "",
    dateFrom: "",
    dateTo: ""
  });
  const [selected, setSelected] = useState<AuditLogRow | null>(null);

  const query = useQuery({
    queryKey: ["admin-audit-logs", filters],
    queryFn: () => fetchAuditLogs(token, filters),
    enabled: Boolean(token)
  });

  const data = query.data;
  const rows = data?.items ?? [];
  const stats = data?.stats ?? {
    total: 0,
    create: 0,
    update: 0,
    delete: 0,
    settings: 0,
    login_failed: 0
  };

  const entityTypes = useMemo(() => data?.entity_types ?? [], [data?.entity_types]);

  const metricCards = [
    { key: "total", label: labels.statsTotal, value: stats.total, tone: "primary" as BadgeTone },
    { key: "create", label: labels.statsCreate, value: stats.create, tone: "success" as BadgeTone },
    { key: "update", label: labels.statsUpdate, value: stats.update, tone: "warning" as BadgeTone },
    { key: "delete", label: labels.statsDelete, value: stats.delete, tone: "danger" as BadgeTone },
    { key: "settings", label: labels.statsSettings, value: stats.settings, tone: "warning" as BadgeTone },
    { key: "login", label: labels.statsFailedLogin, value: stats.login_failed, tone: stats.login_failed > 0 ? "danger" as BadgeTone : "neutral" as BadgeTone }
  ];

  return (
    <div className="grid gap-6">
      <AppPageHeader
        eyebrow={labels.eyebrow}
        title={labels.title}
        description={labels.description}
        actions={
          <AppButton variant="secondary" onClick={() => query.refetch()} disabled={query.isFetching}>
            {labels.refresh}
          </AppButton>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {metricCards.map((card) => (
          <AppCard key={card.key} className="grid gap-3 p-5">
            <AppBadge tone={card.tone} className="w-fit">{card.label}</AppBadge>
            <strong className="text-2xl font-bold text-app-foreground">{card.value}</strong>
          </AppCard>
        ))}
      </div>

      <AppCard className="grid gap-4 p-5">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr_0.9fr_0.9fr_0.9fr_auto] lg:items-end">
          <AppInput
            label={labels.search}
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
          />
          <AppSelect
            label={labels.action}
            value={filters.action}
            onChange={(event) => setFilters((current) => ({ ...current, action: event.target.value }))}
          >
            <option value="">{labels.all}</option>
            {ACTION_OPTIONS.map((action) => (
              <option key={action} value={action}>{actionLabel(action, labels)}</option>
            ))}
          </AppSelect>
          <AppSelect
            label={labels.entityType}
            value={filters.entityType}
            onChange={(event) => setFilters((current) => ({ ...current, entityType: event.target.value }))}
          >
            <option value="">{labels.all}</option>
            {entityTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </AppSelect>
          <AppInput
            label={labels.dateFrom}
            type="datetime-local"
            value={filters.dateFrom}
            onChange={(event) => setFilters((current) => ({ ...current, dateFrom: event.target.value }))}
          />
          <AppInput
            label={labels.dateTo}
            type="datetime-local"
            value={filters.dateTo}
            onChange={(event) => setFilters((current) => ({ ...current, dateTo: event.target.value }))}
          />
          <AppButton
            variant="ghost"
            onClick={() => setFilters({ search: "", action: "", entityType: "", dateFrom: "", dateTo: "" })}
          >
            {labels.reset}
          </AppButton>
        </div>
        <p className="text-sm text-app-muted">{labels.pageHint}</p>
      </AppCard>

      <AppCard className="grid gap-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <AppBadge tone="neutral">{labels.totalResult}: {data?.total ?? 0}</AppBadge>
          {query.isFetching ? <span className="text-sm text-app-muted">{labels.loading}</span> : null}
        </div>

        {query.isLoading ? <AppLoadingState text={labels.loading} /> : null}
        {query.isError ? <AppErrorState title={labels.errorTitle} description={String(query.error)} /> : null}
        {!query.isLoading && !query.isError && rows.length === 0 ? (
          <AppEmptyState title={labels.emptyTitle} description={labels.emptyDescription} />
        ) : null}

        {!query.isLoading && !query.isError && rows.length > 0 ? (
          <AppTable<AuditLogRow>
            rows={rows}
            getRowKey={(row) => row.id}
            columns={[
              {
                key: "operation",
                header: labels.operation,
                render: (row) => (
                  <div className="grid gap-2">
                    <AppBadge tone={actionTone(row.action)} className="w-fit">
                      {actionLabel(row.action, labels)}
                    </AppBadge>
                    <span className="max-w-md text-sm text-app-foreground">{row.description || "—"}</span>
                  </div>
                )
              },
              {
                key: "user",
                header: labels.user,
                render: (row) => (
                  <div className="grid gap-1">
                    <span className="font-semibold text-app-foreground">{userLabel(row, labels)}</span>
                    {row.user?.email ? <span className="text-xs text-app-muted">{row.user.email}</span> : null}
                  </div>
                )
              },
              {
                key: "entity",
                header: labels.entity,
                render: (row) => <span className="text-sm text-app-muted">{entityLabel(row, labels)}</span>
              },
              {
                key: "ip",
                header: labels.ip,
                render: (row) => <span className="text-sm text-app-muted">{row.ip_address || "—"}</span>
              },
              {
                key: "date",
                header: labels.date,
                render: (row) => <span className="text-sm text-app-muted">{formatDate(row.created_at, locale)}</span>
              },
              {
                key: "actions",
                header: labels.actions,
                render: (row) => (
                  <AppButton variant="secondary" className="min-h-9 px-3" onClick={() => setSelected(row)}>
                    {labels.details}
                  </AppButton>
                )
              }
            ]}
          />
        ) : null}
      </AppCard>

      <AppModal
        open={Boolean(selected)}
        title={selected ? `${labels.details} • ${actionLabel(selected.action, labels)}` : labels.details}
        onClose={() => setSelected(null)}
        size="xl"
      >
        {selected ? (
          <div className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <AppCard className="grid gap-2 p-4">
                <span className="text-xs font-bold uppercase text-app-muted">{labels.operation}</span>
                <AppBadge tone={actionTone(selected.action)} className="w-fit">
                  {actionLabel(selected.action, labels)}
                </AppBadge>
                <p className="text-sm leading-7 text-app-foreground">{selected.description || "—"}</p>
              </AppCard>
              <AppCard className="grid gap-2 p-4">
                <span className="text-xs font-bold uppercase text-app-muted">{labels.technical}</span>
                <p className="text-sm text-app-muted">{labels.user}: {userLabel(selected, labels)}</p>
                <p className="text-sm text-app-muted">{labels.entity}: {selected.entity_type || labels.noEntity}</p>
                <p className="text-sm text-app-muted">{labels.entityId}: {selected.entity_id || "—"}</p>
                <p className="text-sm text-app-muted">{labels.ip}: {selected.ip_address || "—"}</p>
                <p className="text-sm text-app-muted">{labels.date}: {formatDate(selected.created_at, locale)}</p>
              </AppCard>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="grid gap-2">
                <h3 className="text-sm font-bold text-app-foreground">{labels.before}</h3>
                <JsonBlock value={selected.before_data} emptyText={labels.noData} />
              </div>
              <div className="grid gap-2">
                <h3 className="text-sm font-bold text-app-foreground">{labels.after}</h3>
                <JsonBlock value={selected.after_data} emptyText={labels.noData} />
              </div>
            </div>

            <div className="grid gap-2">
              <h3 className="text-sm font-bold text-app-foreground">{labels.userAgent}</h3>
              <p className="break-words rounded-appMd border border-app-border bg-app-surfaceElevated p-4 text-sm text-app-muted">
                {selected.user_agent || labels.noData}
              </p>
            </div>
          </div>
        ) : null}
      </AppModal>
    </div>
  );
}
