"use client";

/**
 * =====================================================
 * AdminNotificationsPage
 * صفحة مخصصة لإدارة إشعارات لوحة الأدمن
 * =====================================================
 */

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/shared/api/api-client";
import { useAdminAuth } from "@/shared/auth/AdminAuthProvider";
import {
  AppBadge,
  type BadgeTone,
} from "@/shared/design-system/components/AppBadge";
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
import { AdminCommunicationTabs } from "./AdminCommunicationTabs";
import type { Locale } from "@/shared/design-system/utils/direction";

type NotificationTypeValue =
  | "quote_request"
  | "contact_message"
  | "support_request"
  | "product_trial"
  | "failed_login"
  | "file_upload_error"
  | "settings_changed"
  | "system";

type ReadStatus = "all" | "unread" | "read";

type AdminNotification = {
  id: string;
  user_id?: string | null;
  notification_type?: NotificationTypeValue | string | null;
  title_ar?: string | null;
  title_en?: string | null;
  body_ar?: string | null;
  body_en?: string | null;
  target_type?: string | null;
  target_id?: string | null;
  action_url?: string | null;
  is_read?: boolean;
  read_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  extra_data?: Record<string, unknown> | null;
};

type NotificationDraft = {
  notification_type: NotificationTypeValue;
  title_ar: string;
  title_en: string;
  body_ar: string;
  body_en: string;
  target_type: string;
  target_id: string;
  action_url: string;
};

type NotificationLabels = {
  eyebrow: string;
  title: string;
  description: string;
  refresh: string;
  create: string;
  markAllRead: string;
  search: string;
  readStatus: string;
  type: string;
  all: string;
  unread: string;
  read: string;
  statsTotal: string;
  statsUnread: string;
  statsRead: string;
  statsSystem: string;
  statsSupport: string;
  notification: string;
  target: string;
  status: string;
  date: string;
  actions: string;
  openTarget: string;
  viewQuoteRequest: string;
  viewContactMessage: string;
  viewSupportRequest: string;
  viewProductTrial: string;
  viewSettings: string;
  viewRelated: string;
  source: string;
  markRead: string;
  markUnread: string;
  delete: string;
  noTarget: string;
  global: string;
  loading: string;
  emptyTitle: string;
  emptyDescription: string;
  errorTitle: string;
  modalTitle: string;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  targetType: string;
  targetId: string;
  actionUrl: string;
  save: string;
  cancel: string;
  manualHint: string;
  created: string;
  deleted: string;
  updated: string;
  types: Record<NotificationTypeValue, string>;
};

const AR_LABELS: NotificationLabels = {
  eyebrow: "مركز التنبيهات",
  title: "الإشعارات",
  description:
    "متابعة إشعارات لوحة الأدمن والطلبات الجديدة والتنبيهات الداخلية من مكان واحد.",
  refresh: "تحديث",
  create: "إشعار يدوي",
  markAllRead: "تعليم الكل كمقروء",
  search: "بحث في الإشعارات",
  readStatus: "حالة القراءة",
  type: "نوع الإشعار",
  all: "الكل",
  unread: "غير مقروء",
  read: "مقروء",
  statsTotal: "إجمالي الإشعارات",
  statsUnread: "غير مقروءة",
  statsRead: "مقروءة",
  statsSystem: "تنبيهات النظام",
  statsSupport: "طلبات الدعم",
  notification: "الإشعار",
  target: "المصدر",
  status: "الحالة",
  date: "التاريخ",
  actions: "الإجراءات",
  openTarget: "عرض",
  viewQuoteRequest: "عرض الطلب",
  viewContactMessage: "عرض الرسالة",
  viewSupportRequest: "عرض الدعم",
  viewProductTrial: "عرض التجربة",
  viewSettings: "عرض الإعدادات",
  viewRelated: "عرض المرتبط",
  source: "مصدر الإشعار",
  markRead: "كمقروء",
  markUnread: "كغير مقروء",
  delete: "حذف",
  noTarget: "لا يوجد ارتباط",
  global: "عام",
  loading: "جارٍ تحميل الإشعارات...",
  emptyTitle: "لا توجد إشعارات",
  emptyDescription: "عند وصول طلب جديد أو حدوث عملية مهمة ستظهر الإشعارات هنا.",
  errorTitle: "تعذر تحميل الإشعارات",
  modalTitle: "إنشاء إشعار يدوي",
  titleAr: "العنوان بالعربية",
  titleEn: "العنوان بالإنجليزية",
  bodyAr: "النص بالعربية",
  bodyEn: "النص بالإنجليزية",
  targetType: "نوع الوجهة",
  targetId: "معرف الوجهة",
  actionUrl: "رابط الإجراء داخل لوحة الأدمن",
  save: "حفظ الإشعار",
  cancel: "إلغاء",
  manualHint:
    "الإشعارات اليدوية تفيد في إرسال تنبيه عام داخل لوحة الأدمن، أما إشعارات الطلبات والرسائل فتتولد تلقائيًا من النظام.",
  created: "تم إنشاء الإشعار.",
  deleted: "تم حذف الإشعار.",
  updated: "تم تحديث الإشعار.",
  types: {
    quote_request: "طلب مشروع",
    contact_message: "رسالة تواصل",
    support_request: "طلب دعم",
    product_trial: "تجربة نظام",
    failed_login: "فشل تسجيل دخول",
    file_upload_error: "خطأ رفع ملف",
    settings_changed: "تعديل إعدادات",
    system: "نظام",
  },
};

const EN_LABELS: NotificationLabels = {
  eyebrow: "Notification Center",
  title: "Notifications",
  description:
    "Track admin alerts, new requests, and internal system notices from one place.",
  refresh: "Refresh",
  create: "Manual notification",
  markAllRead: "Mark all read",
  search: "Search notifications",
  readStatus: "Read status",
  type: "Notification type",
  all: "All",
  unread: "Unread",
  read: "Read",
  statsTotal: "Total notifications",
  statsUnread: "Unread",
  statsRead: "Read",
  statsSystem: "System alerts",
  statsSupport: "Support requests",
  notification: "Notification",
  target: "Source",
  status: "Status",
  date: "Date",
  actions: "Actions",
  openTarget: "View",
  viewQuoteRequest: "View request",
  viewContactMessage: "View message",
  viewSupportRequest: "View support",
  viewProductTrial: "View trial",
  viewSettings: "View settings",
  viewRelated: "View related",
  source: "Notification source",
  markRead: "Mark read",
  markUnread: "Mark unread",
  delete: "Delete",
  noTarget: "No target",
  global: "Global",
  loading: "Loading notifications...",
  emptyTitle: "No notifications",
  emptyDescription:
    "New requests and important system events will appear here.",
  errorTitle: "Unable to load notifications",
  modalTitle: "Create manual notification",
  titleAr: "Arabic title",
  titleEn: "English title",
  bodyAr: "Arabic body",
  bodyEn: "English body",
  targetType: "Target type",
  targetId: "Target ID",
  actionUrl: "Admin action URL",
  save: "Save notification",
  cancel: "Cancel",
  manualHint:
    "Manual notifications are useful for general admin-panel alerts. Request and message notifications are generated automatically by the system.",
  created: "Notification created.",
  deleted: "Notification deleted.",
  updated: "Notification updated.",
  types: {
    quote_request: "Project request",
    contact_message: "Contact message",
    support_request: "Support request",
    product_trial: "Product trial",
    failed_login: "Failed login",
    file_upload_error: "File upload error",
    settings_changed: "Settings changed",
    system: "System",
  },
};

const NOTIFICATION_TYPES: NotificationTypeValue[] = [
  "system",
  "quote_request",
  "contact_message",
  "support_request",
  "product_trial",
  "failed_login",
  "file_upload_error",
  "settings_changed",
];

function buildQuery(
  params: Record<string, string | number | boolean | undefined | null>,
) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

function initialDraft(): NotificationDraft {
  return {
    notification_type: "system",
    title_ar: "",
    title_en: "",
    body_ar: "",
    body_en: "",
    target_type: "",
    target_id: "",
    action_url: "",
  };
}

function typeTone(type?: string | null): BadgeTone {
  if (
    type === "quote_request" ||
    type === "contact_message" ||
    type === "support_request" ||
    type === "product_trial"
  ) {
    return "primary";
  }
  if (type === "failed_login" || type === "file_upload_error") {
    return "danger";
  }
  if (type === "settings_changed") {
    return "warning";
  }
  return "neutral";
}

function formatDate(value: string | null | undefined, locale: Locale) {
  if (!value) {
    return "—";
  }
  try {
    return new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function localizedTitle(notification: AdminNotification, locale: Locale) {
  if (locale === "ar") {
    return notification.title_ar || notification.title_en || "—";
  }
  return notification.title_en || notification.title_ar || "—";
}

function localizedBody(notification: AdminNotification, locale: Locale) {
  if (locale === "ar") {
    return notification.body_ar || notification.body_en || "";
  }
  return notification.body_en || notification.body_ar || "";
}

function normalizeActionUrl(
  actionUrl: string | null | undefined,
  locale: Locale,
) {
  if (!actionUrl) {
    return "";
  }
  if (/^https?:\/\//i.test(actionUrl)) {
    return actionUrl;
  }
  if (actionUrl.startsWith(`/${locale}/`)) {
    return actionUrl;
  }
  if (actionUrl.startsWith("/admin")) {
    return `/${locale}${actionUrl}`;
  }
  return actionUrl.startsWith("/")
    ? actionUrl
    : `/${locale}/admin/${actionUrl}`;
}

function normalizeTargetKey(notification: AdminNotification) {
  return String(
    notification.target_type || notification.notification_type || "system",
  ).toLowerCase();
}

function relatedTargetLabel(
  notification: AdminNotification,
  labels: NotificationLabels,
) {
  const targetKey = normalizeTargetKey(notification);

  if (targetKey.includes("quote")) {
    return labels.types.quote_request;
  }
  if (targetKey.includes("contact")) {
    return labels.types.contact_message;
  }
  if (targetKey.includes("support")) {
    return labels.types.support_request;
  }
  if (targetKey.includes("trial") || targetKey.includes("product")) {
    return labels.types.product_trial;
  }
  if (targetKey.includes("settings")) {
    return labels.types.settings_changed;
  }

  const type = notification.notification_type as
    | NotificationTypeValue
    | undefined;
  return type && labels.types[type] ? labels.types[type] : labels.global;
}

function relatedActionLabel(
  notification: AdminNotification,
  labels: NotificationLabels,
) {
  const targetKey = normalizeTargetKey(notification);

  if (targetKey.includes("quote")) {
    return labels.viewQuoteRequest;
  }
  if (targetKey.includes("contact")) {
    return labels.viewContactMessage;
  }
  if (targetKey.includes("support")) {
    return labels.viewSupportRequest;
  }
  if (targetKey.includes("trial") || targetKey.includes("product")) {
    return labels.viewProductTrial;
  }
  if (targetKey.includes("settings")) {
    return labels.viewSettings;
  }

  return labels.viewRelated;
}

function resolveTargetId(notification: AdminNotification) {
  const explicitId = String(notification.target_id || "").trim();

  if (explicitId) {
    return explicitId;
  }

  const actionUrl = String(notification.action_url || "").trim();

  if (!actionUrl || /^https?:\/\//i.test(actionUrl)) {
    return "";
  }

  const cleanPath = actionUrl.split("?")[0]?.replace(/\/$/, "") || "";
  const lastSegment = cleanPath.split("/").pop() || "";

  return lastSegment && !lastSegment.includes("admin") ? lastSegment : "";
}

function buildTargetRoute(
  notification: AdminNotification,
  locale: Locale,
) {
  const targetKey = normalizeTargetKey(notification);
  const targetId = resolveTargetId(notification);
  const detailQuery = targetId ? buildQuery({ open: targetId }) : "";

  if (targetKey.includes("quote")) {
    return `/${locale}/admin/quote-requests${detailQuery}`;
  }
  if (targetKey.includes("contact")) {
    return `/${locale}/admin/contact-messages${detailQuery}`;
  }
  if (targetKey.includes("support")) {
    return `/${locale}/admin/support-requests${detailQuery}`;
  }
  if (targetKey.includes("trial") || targetKey.includes("product")) {
    return `/${locale}/admin/products`;
  }
  if (targetKey.includes("settings")) {
    return `/${locale}/admin/settings`;
  }

  return "";
}

function fallbackActionUrl(notification: AdminNotification, locale: Locale) {
  return buildTargetRoute(notification, locale);
}

function getRelatedAction(
  notification: AdminNotification,
  labels: NotificationLabels,
  locale: Locale,
) {
  const actionUrl =
    buildTargetRoute(notification, locale) ||
    normalizeActionUrl(notification.action_url, locale) ||
    fallbackActionUrl(notification, locale);

  if (!actionUrl) {
    return null;
  }

  return {
    url: actionUrl,
    label: relatedActionLabel(notification, labels),
  };
}

function shortId(value: string | null | undefined) {
  if (!value) {
    return "";
  }
  return value.length > 12 ? `${value.slice(0, 8)}…${value.slice(-4)}` : value;
}

async function listNotifications(
  token: string,
  params: { search: string; readStatus: ReadStatus; type: string },
) {
  return apiRequest<AdminNotification[]>(
    `/admin/notifications${buildQuery({
      search: params.search,
      read_status: params.readStatus,
      notification_type: params.type,
      skip: 0,
      limit: 100,
    })}`,
    { token },
  );
}

async function createNotification(token: string, draft: NotificationDraft) {
  return apiRequest<AdminNotification>("/admin/notifications", {
    method: "POST",
    token,
    body: JSON.stringify({
      notification_type: draft.notification_type,
      title_ar: draft.title_ar.trim(),
      title_en: draft.title_en.trim(),
      body_ar: draft.body_ar.trim() || null,
      body_en: draft.body_en.trim() || null,
      target_type: draft.target_type.trim() || null,
      target_id: draft.target_id.trim() || null,
      action_url: draft.action_url.trim() || null,
      extra_data: {},
    }),
  });
}

async function markNotificationRead(token: string, notificationId: string) {
  return apiRequest<Record<string, unknown>>(
    `/admin/notifications/${notificationId}/read`,
    {
      method: "PATCH",
      token,
    },
  );
}

async function markNotificationUnread(token: string, notificationId: string) {
  return apiRequest<Record<string, unknown>>(
    `/admin/notifications/${notificationId}/unread`,
    {
      method: "PATCH",
      token,
    },
  );
}

async function markAllRead(token: string) {
  return apiRequest<Record<string, unknown>>("/admin/notifications/read-all", {
    method: "PATCH",
    token,
  });
}

async function deleteNotification(token: string, notificationId: string) {
  return apiRequest<Record<string, unknown>>(
    `/admin/notifications/${notificationId}`,
    {
      method: "DELETE",
      token,
    },
  );
}

export function AdminNotificationsPage({ locale }: { locale: Locale }) {
  const labels = locale === "ar" ? AR_LABELS : EN_LABELS;
  const queryClient = useQueryClient();
  const { tokens } = useAdminAuth();
  const token = tokens?.access_token ?? "";

  const [search, setSearch] = useState("");
  const [readStatus, setReadStatus] = useState<ReadStatus>("all");
  const [type, setType] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draft, setDraft] = useState<NotificationDraft>(() => initialDraft());

  const query = useQuery({
    queryKey: ["admin-notifications", search, readStatus, type],
    queryFn: () => listNotifications(token, { search, readStatus, type }),
    enabled: Boolean(token),
  });

  const rows = useMemo(() => query.data ?? [], [query.data]);

  const stats = useMemo(() => {
    const unread = rows.filter((item) => !item.is_read).length;
    const read = rows.filter((item) => item.is_read).length;
    const system = rows.filter(
      (item) =>
        item.notification_type === "system" ||
        item.notification_type === "settings_changed",
    ).length;
    return [
      {
        key: "total",
        label: labels.statsTotal,
        value: rows.length,
        tone: "primary" as BadgeTone,
      },
      {
        key: "unread",
        label: labels.statsUnread,
        value: unread,
        tone: unread > 0 ? ("warning" as BadgeTone) : ("neutral" as BadgeTone),
      },
      {
        key: "read",
        label: labels.statsRead,
        value: read,
        tone: "success" as BadgeTone,
      },
      {
        key: "system",
        label: labels.statsSystem,
        value: system,
        tone: "neutral" as BadgeTone,
      },
      {
        key: "support",
        label: labels.statsSupport,
        value: rows.filter((item) => item.notification_type === "support_request" || item.target_type === "support_request").length,
        tone: "primary" as BadgeTone,
      },
    ];
  }, [
    labels.statsRead,
    labels.statsSystem,
    labels.statsSupport,
    labels.statsTotal,
    labels.statsUnread,
    rows,
  ]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
    queryClient.invalidateQueries({ queryKey: ["unread-notifications-count"] });
  };

  const createMutation = useMutation({
    mutationFn: () => createNotification(token, draft),
    onSuccess: () => {
      setDraft(initialDraft());
      setIsModalOpen(false);
      invalidate();
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      markNotificationRead(token, notificationId),
    onSuccess: invalidate,
  });

  const markUnreadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      markNotificationUnread(token, notificationId),
    onSuccess: invalidate,
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => markAllRead(token),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (notificationId: string) =>
      deleteNotification(token, notificationId),
    onSuccess: invalidate,
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createMutation.mutate();
  };

  return (
    <div className="grid gap-6">
      <AdminCommunicationTabs locale={locale} activeKey="notifications" />

      <AppPageHeader
        eyebrow={labels.eyebrow}
        title={labels.title}
        description={labels.description}
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
              variant="secondary"
              icon={<AppIcon name="check" size={18} />}
              onClick={() => markAllReadMutation.mutate()}
              disabled={!token || markAllReadMutation.isPending}
            >
              {labels.markAllRead}
            </AppButton>
            <AppButton
              icon={<AppIcon name="plus" size={18} />}
              onClick={() => setIsModalOpen(true)}
            >
              {labels.create}
            </AppButton>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((item) => (
          <AppCard key={item.key} className="grid gap-3 p-5">
            <span className="text-sm text-app-muted">{item.label}</span>
            <div className="flex items-end justify-between gap-3">
              <strong className="text-3xl font-bold text-app-foreground">
                {item.value}
              </strong>
              <AppBadge tone={item.tone}>{item.label}</AppBadge>
            </div>
          </AppCard>
        ))}
      </div>

      <AppCard className="grid gap-4 p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_220px_240px]">
          <AppInput
            label={labels.search}
            placeholder={labels.search}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <AppSelect
            label={labels.readStatus}
            value={readStatus}
            onChange={(event) =>
              setReadStatus(event.target.value as ReadStatus)
            }
          >
            <option value="all">{labels.all}</option>
            <option value="unread">{labels.unread}</option>
            <option value="read">{labels.read}</option>
          </AppSelect>
          <AppSelect
            label={labels.type}
            value={type}
            onChange={(event) => setType(event.target.value)}
          >
            <option value="">{labels.all}</option>
            {NOTIFICATION_TYPES.map((item) => (
              <option key={item} value={item}>
                {labels.types[item]}
              </option>
            ))}
          </AppSelect>
        </div>
      </AppCard>

      {query.isLoading ? <AppLoadingState text={labels.loading} /> : null}
      {query.isError ? (
        <AppErrorState
          title={labels.errorTitle}
          description={String(query.error)}
        />
      ) : null}

      {!query.isLoading && !query.isError && rows.length === 0 ? (
        <AppEmptyState
          title={labels.emptyTitle}
          description={labels.emptyDescription}
          icon="bell"
        />
      ) : null}

      {!query.isLoading && !query.isError && rows.length > 0 ? (
        <AppTable<AdminNotification>
          rows={rows}
          getRowKey={(row) => row.id}
          columns={[
            {
              key: "notification",
              header: labels.notification,
              render: (row) => {
                const body = localizedBody(row, locale);
                return (
                  <div className="grid min-w-64 gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {!row.is_read ? (
                        <span
                          className="size-2 rounded-full bg-app-warning"
                          aria-hidden="true"
                        />
                      ) : null}
                      <strong className="text-app-foreground">
                        {localizedTitle(row, locale)}
                      </strong>
                      {!row.user_id ? (
                        <AppBadge tone="primary">{labels.global}</AppBadge>
                      ) : null}
                    </div>
                    {body ? (
                      <p className="line-clamp-2 text-sm leading-6 text-app-muted">
                        {body}
                      </p>
                    ) : null}
                  </div>
                );
              },
            },
            {
              key: "type",
              header: labels.type,
              render: (row) => {
                const value = (row.notification_type ||
                  "system") as NotificationTypeValue;
                return (
                  <AppBadge tone={typeTone(value)}>
                    {labels.types[value] ?? value}
                  </AppBadge>
                );
              },
            },
            {
              key: "target",
              header: labels.target,
              render: (row) => {
                const targetLabel = relatedTargetLabel(row, labels);
                const reference = shortId(row.target_id);
                return (
                  <div className="grid gap-1 text-sm">
                    <span className="font-semibold text-app-foreground">
                      {targetLabel}
                    </span>
                    {reference ? (
                      <span className="text-xs text-app-muted">
                        {labels.source}: {reference}
                      </span>
                    ) : null}
                    {!reference && !row.action_url ? (
                      <span className="text-xs text-app-muted">
                        {labels.noTarget}
                      </span>
                    ) : null}
                  </div>
                );
              },
            },
            {
              key: "status",
              header: labels.status,
              render: (row) => (
                <AppBadge tone={row.is_read ? "success" : "warning"}>
                  {row.is_read ? labels.read : labels.unread}
                </AppBadge>
              ),
            },
            {
              key: "date",
              header: labels.date,
              render: (row) => (
                <span className="whitespace-nowrap text-sm text-app-muted">
                  {formatDate(row.created_at, locale)}
                </span>
              ),
            },
            {
              key: "actions",
              header: labels.actions,
              render: (row) => {
                const relatedAction = getRelatedAction(row, labels, locale);
                return (
                  <div className="flex flex-wrap items-center gap-2">
                    {relatedAction ? (
                      <AppButton
                        variant="ghost"
                        className="min-h-9 px-3"
                        onClick={() => {
                          if (!row.is_read) {
                            markReadMutation.mutate(row.id);
                          }
                          window.location.href = relatedAction.url;
                        }}
                      >
                        {relatedAction.label}
                      </AppButton>
                    ) : null}
                    {row.is_read ? (
                      <AppButton
                        variant="secondary"
                        className="min-h-9 px-3"
                        onClick={() => markUnreadMutation.mutate(row.id)}
                        disabled={markUnreadMutation.isPending}
                      >
                        {labels.markUnread}
                      </AppButton>
                    ) : (
                      <AppButton
                        variant="secondary"
                        className="min-h-9 px-3"
                        onClick={() => markReadMutation.mutate(row.id)}
                        disabled={markReadMutation.isPending}
                      >
                        {labels.markRead}
                      </AppButton>
                    )}
                    <AppButton
                      variant="danger"
                      className="min-h-9 px-3"
                      onClick={() => deleteMutation.mutate(row.id)}
                      disabled={deleteMutation.isPending}
                    >
                      {labels.delete}
                    </AppButton>
                  </div>
                );
              },
            },
          ]}
        />
      ) : null}

      <AppModal
        open={isModalOpen}
        title={labels.modalTitle}
        onClose={() => setIsModalOpen(false)}
        size="lg"
      >
        <form className="grid gap-5" onSubmit={onSubmit}>
          <p className="rounded-appLg border border-app-border bg-app-surfaceElevated p-4 text-sm leading-7 text-app-muted">
            {labels.manualHint}
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <AppSelect
              label={labels.type}
              value={draft.notification_type}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  notification_type: event.target
                    .value as NotificationTypeValue,
                }))
              }
            >
              {NOTIFICATION_TYPES.map((item) => (
                <option key={item} value={item}>
                  {labels.types[item]}
                </option>
              ))}
            </AppSelect>
            <AppInput
              label={labels.actionUrl}
              value={draft.action_url}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  action_url: event.target.value,
                }))
              }
              placeholder="/admin/quote-requests"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <AppInput
              label={labels.titleAr}
              value={draft.title_ar}
              required
              minLength={2}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  title_ar: event.target.value,
                }))
              }
            />
            <AppInput
              label={labels.titleEn}
              value={draft.title_en}
              required
              minLength={2}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  title_en: event.target.value,
                }))
              }
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <AppTextarea
              label={labels.bodyAr}
              value={draft.body_ar}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  body_ar: event.target.value,
                }))
              }
            />
            <AppTextarea
              label={labels.bodyEn}
              value={draft.body_en}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  body_en: event.target.value,
                }))
              }
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <AppInput
              label={labels.targetType}
              value={draft.target_type}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  target_type: event.target.value,
                }))
              }
              placeholder="quote_request"
            />
            <AppInput
              label={labels.targetId}
              value={draft.target_id}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  target_id: event.target.value,
                }))
              }
            />
          </div>

          {createMutation.isError ? (
            <AppErrorState
              title={labels.errorTitle}
              description={String(createMutation.error)}
            />
          ) : null}

          <div className="flex flex-wrap justify-end gap-2 border-t border-app-border pt-4">
            <AppButton
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={createMutation.isPending}
            >
              {labels.cancel}
            </AppButton>
            <AppButton
              type="submit"
              icon={<AppIcon name="save" size={18} />}
              disabled={createMutation.isPending}
            >
              {labels.save}
            </AppButton>
          </div>
        </form>
      </AppModal>
    </div>
  );
}
