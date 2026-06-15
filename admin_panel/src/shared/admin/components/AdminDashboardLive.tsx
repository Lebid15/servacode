"use client";

/**
 * =====================================================
 * AdminDashboardLive
 * لوحة قيادة تنفيذية مختصرة ومتّصلة بالـ API.
 * =====================================================
 */

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { valueToText } from "@/shared/admin/admin-formatters";
import {
  getAdminDashboard,
  type AdminDashboardItem,
} from "@/shared/api/admin-client";
import { useAdminAuth } from "@/shared/auth/AdminAuthProvider";
import {
  AppBadge,
  type BadgeTone,
} from "@/shared/design-system/components/AppBadge";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppEmptyState } from "@/shared/design-system/components/AppEmptyState";
import { AppErrorState } from "@/shared/design-system/components/AppErrorState";
import {
  AppIcon,
  type IconName,
} from "@/shared/design-system/components/AppIcon";
import { AppLoadingState } from "@/shared/design-system/components/AppLoadingState";
import type { Locale } from "@/shared/design-system/utils/direction";

const MAX_ALERTS = 6;
const MAX_INBOX_ITEMS = 5;

const contentPriority = ["services", "products", "apps", "portfolio", "blog", "static_pages", "faqs", "testimonials", "media", "email_templates"];

type AdminDashboardLiveProps = {
  locale: Locale;
  labels: {
    loading: string;
    error: string;
    view: string;
    refresh: string;
    updatedAt: string;
    empty: string;
    noSubject: string;
    sections: {
      overview: string;
      siteStatus: string;
      latestWork: string;
      contentStatus: string;
      quickActions: string;
      latestActivity: string;
      systemStatus: string;
      readiness: string;
    };
    stats: {
      quotes: string;
      quotesHint: string;
      messages: string;
      messagesHint: string;
      support: string;
      supportHint: string;
      notifications: string;
      notificationsHint: string;
      services: string;
      servicesHint: string;
      products: string;
      productsHint: string;
      apps: string;
      appsHint: string;
      portfolio: string;
      portfolioHint: string;
      users: string;
      usersHint: string;
      media: string;
      mediaHint: string;
    };
    site: {
      publicSite: string;
      websiteStatus: string;
      websiteActive: string;
      maintenance: string;
      maintenanceOn: string;
      maintenanceOff: string;
      defaultLanguage: string;
      englishEnabled: string;
      activeTheme: string;
      logo: string;
      favicon: string;
      contactChannels: string;
      ready: string;
      missing: string;
      enabled: string;
      disabled: string;
    };
    content: Record<string, string> & {
      total: string;
      visible: string;
      hidden: string;
      draft: string;
    };
    latest: {
      quotes: string;
      messages: string;
      support: string;
      activity: string;
    };
    quickActions: Array<{
      key: string;
      label: string;
      href: string;
      icon: IconName;
    }>;
    alerts: Record<string, string>;
    system: {
      api: string;
      database: string;
      storage: string;
      environment: string;
      debug: string;
      emailNotifications: string;
      mediaFiles: string;
      emailTemplates: string;
      online: string;
      connected: string;
      available: string;
      unavailable: string;
      enabled: string;
      disabled: string;
    };
  };
};

type ExecutiveStat = {
  key: string;
  label: string;
  hint: string;
  value: number;
  icon: IconName;
  tone: BadgeTone;
  href: string;
};

type InboxKind = "quote" | "message" | "support";

type UnifiedInboxItem = {
  key: string;
  title: string;
  description: string;
  href: string;
  typeLabel: string;
  icon: IconName;
  statusLabel: string;
  statusTone: BadgeTone;
  isOpen: boolean;
  dateValue?: string;
  dateLabel: string;
};

type RequestState = {
  label: string;
  tone: BadgeTone;
  isOpen: boolean;
};

function numberValue(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}

function formatDate(value: unknown, locale: Locale) {
  if (!value || typeof value !== "string") {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function dateTimestamp(value: unknown) {
  if (!value || typeof value !== "string") {
    return 0;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function itemTitle(item: AdminDashboardItem, locale: Locale, fallback: string) {
  const localizedTitle = locale === "ar" ? item.title_ar : item.title_en;
  const title =
    item.full_name ??
    item.subject ??
    localizedTitle ??
    item.title ??
    item.name_ar ??
    item.name_en;
  return valueToText(title || fallback);
}

function itemDescription(item: AdminDashboardItem, locale?: Locale) {
  if (item.subject || item.description || item.message) {
    return valueToText(item.subject ?? item.description ?? item.message);
  }

  if (locale) {
    return readableActivityDescription(item, locale);
  }

  return valueToText(item.entity_type ?? item.action);
}

function normalizeKey(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function readableActivityAction(value: unknown, locale: Locale) {
  const key = normalizeKey(value);
  const isAr = locale === "ar";

  const labels: Record<string, { ar: string; en: string }> = {
    settings_change: { ar: "تعديل الإعدادات", en: "Settings updated" },
    settings_update: { ar: "تعديل الإعدادات", en: "Settings updated" },
    site_settings_update: { ar: "تعديل إعدادات الموقع", en: "Site settings updated" },
    identity_update: { ar: "تعديل هوية الموقع", en: "Identity updated" },

    create: { ar: "إضافة", en: "Created" },
    created: { ar: "إضافة", en: "Created" },
    update: { ar: "تعديل", en: "Updated" },
    updated: { ar: "تعديل", en: "Updated" },
    delete: { ar: "حذف", en: "Deleted" },
    deleted: { ar: "حذف", en: "Deleted" },
    restore: { ar: "استعادة", en: "Restored" },
    restored: { ar: "استعادة", en: "Restored" },

    login: { ar: "تسجيل دخول", en: "Login" },
    logout: { ar: "تسجيل خروج", en: "Logout" },
    password_change: { ar: "تغيير كلمة المرور", en: "Password changed" },
    password_reset: { ar: "استعادة كلمة المرور", en: "Password reset" },

    service_create: { ar: "إضافة خدمة", en: "Service created" },
    service_update: { ar: "تعديل خدمة", en: "Service updated" },
    service_delete: { ar: "حذف خدمة", en: "Service deleted" },

    product_create: { ar: "إضافة نظام", en: "System created" },
    product_update: { ar: "تعديل نظام", en: "System updated" },
    product_delete: { ar: "حذف نظام", en: "System deleted" },

    app_create: { ar: "إضافة تطبيق", en: "App created" },
    app_update: { ar: "تعديل تطبيق", en: "App updated" },
    app_delete: { ar: "حذف تطبيق", en: "App deleted" },

    portfolio_create: { ar: "إضافة عمل", en: "Portfolio item created" },
    portfolio_update: { ar: "تعديل عمل", en: "Portfolio item updated" },
    portfolio_delete: { ar: "حذف عمل", en: "Portfolio item deleted" },

    user_create: { ar: "إضافة مستخدم", en: "User created" },
    user_update: { ar: "تعديل مستخدم", en: "User updated" },
    role_update: { ar: "تعديل دور", en: "Role updated" },
    media_upload: { ar: "رفع وسائط", en: "Media uploaded" },
    notification_create: { ar: "إضافة إشعار", en: "Notification created" },
    email_template_update: { ar: "تعديل قالب بريد", en: "Email template updated" }
  };

  if (labels[key]) {
    return isAr ? labels[key].ar : labels[key].en;
  }

  if (!key) {
    return isAr ? "نشاط إداري" : "Admin activity";
  }

  return isAr
    ? key.replace(/_/g, " ")
    : key.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function readableActivityDescription(item: AdminDashboardItem, locale: Locale) {
  const actionText = readableActivityAction(item.action, locale);
  const entityText = valueToText(item.entity_type || item.entity_name || item.model || "");

  if (entityText && entityText !== "—") {
    return locale === "ar" ? `${actionText} — ${entityText}` : `${actionText} — ${entityText}`;
  }

  return actionText;
}

function booleanValue(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = normalizeKey(value);
    if (["true", "1", "yes", "open", "opened"].includes(normalized)) {
      return true;
    }
    if (["false", "0", "no", "closed", "resolved"].includes(normalized)) {
      return false;
    }
  }

  if (typeof value === "number") {
    return value === 1 ? true : value === 0 ? false : undefined;
  }

  return undefined;
}

function hasDateSignal(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function dashboardCopy(locale: Locale) {
  const isAr = locale === "ar";

  return {
    open: isAr ? "مفتوح" : "Open",
    new: isAr ? "جديد" : "New",
    unread: isAr ? "غير مقروء" : "Unread",
    inReview: isAr ? "قيد المتابعة" : "In review",
    waiting: isAr ? "بانتظار العميل" : "Waiting for customer",
    replied: isAr ? "تم الرد" : "Replied",
    read: isAr ? "مقروء" : "Read",
    closed: isAr ? "مغلق" : "Closed",
    rejected: isAr ? "مرفوض" : "Rejected",
    cancelled: isAr ? "ملغى" : "Cancelled",
    unknownOpen: isAr ? "مفتوح" : "Open",
    openRequests: isAr ? "طلبات مفتوحة" : "Open requests",
    closedRequests: isAr ? "مغلقة / مكتملة" : "Closed / completed",
    noOpenRequests: isAr ? "لا توجد طلبات مفتوحة" : "No open requests",
    readinessNeedsWork: isAr ? "تحتاج متابعة" : "Needs attention",
    readinessAllClear: isAr ? "كل التنبيهات مغلقة" : "All alerts cleared",
    readinessOpen: isAr ? "تنبيه مفتوح" : "Open alert",
    readinessCritical: isAr ? "حرج" : "Critical",
    readinessWarning: isAr ? "يحتاج إعداد" : "Needs setup",
    resolve: isAr ? "معالجة" : "Resolve",
  };
}

function requestState(
  item: AdminDashboardItem,
  locale: Locale,
  kind: InboxKind,
): RequestState {
  const copy = dashboardCopy(locale);
  const rawStatus =
    item.status ??
    item.state ??
    item.request_status ??
    item.message_status ??
    item.read_status;
  const normalized = normalizeKey(rawStatus);
  const isOpen = booleanValue(item.is_open ?? item.open);
  const isClosed = booleanValue(item.is_closed ?? item.closed);
  const isRead = booleanValue(item.is_read ?? item.read);
  const isReplied = Boolean(
    item.replied_at ?? item.responded_at ?? item.response_at ?? item.answer_at,
  );
  const hasClosedAt = hasDateSignal(
    item.closed_at ?? item.resolved_at ?? item.completed_at,
  );

  if (isOpen === true) {
    return { label: copy.open, tone: "primary", isOpen: true };
  }

  if (isOpen === false || isClosed === true || hasClosedAt) {
    return { label: copy.closed, tone: "success", isOpen: false };
  }

  if (kind === "message") {
    if (isReplied) {
      return { label: copy.replied, tone: "success", isOpen: false };
    }

    if (isRead === true || hasDateSignal(item.read_at)) {
      return { label: copy.read, tone: "neutral", isOpen: false };
    }

    if (isRead === false) {
      return { label: copy.unread, tone: "primary", isOpen: true };
    }
  }

  if (
    [
      "new",
      "received",
      "submitted",
      "created",
      "open",
      "opened",
      "pending",
      "unread",
    ].includes(normalized)
  ) {
    return {
      label:
        normalized === "new"
          ? copy.new
          : normalized === "unread"
            ? copy.unread
            : copy.open,
      tone: "primary",
      isOpen: true,
    };
  }

  if (
    [
      "in_progress",
      "reviewing",
      "under_review",
      "processing",
      "draft",
    ].includes(normalized)
  ) {
    return { label: copy.inReview, tone: "warning", isOpen: true };
  }

  if (
    ["waiting_customer", "waiting_for_customer", "customer_reply"].includes(
      normalized,
    )
  ) {
    return { label: copy.waiting, tone: "warning", isOpen: true };
  }

  if (["replied", "answered", "responded"].includes(normalized)) {
    return { label: copy.replied, tone: "success", isOpen: false };
  }

  if (
    ["closed", "resolved", "done", "completed", "approved", "read"].includes(
      normalized,
    )
  ) {
    return {
      label: normalized === "read" ? copy.read : copy.closed,
      tone: "success",
      isOpen: false,
    };
  }

  if (["rejected", "failed"].includes(normalized)) {
    return { label: copy.rejected, tone: "danger", isOpen: false };
  }

  if (["cancelled", "canceled", "archived"].includes(normalized)) {
    return { label: copy.cancelled, tone: "neutral", isOpen: false };
  }

  return {
    label: kind === "message" ? copy.unread : copy.unknownOpen,
    tone: kind === "support" ? "warning" : "primary",
    isOpen: true,
  };
}

function readinessToneLabel(tone: BadgeTone, locale: Locale) {
  const copy = dashboardCopy(locale);

  if (tone === "danger") {
    return copy.readinessCritical;
  }

  if (tone === "warning") {
    return copy.readinessWarning;
  }

  return copy.readinessOpen;
}

function contentHref(key: string, locale: Locale) {
  const map: Record<string, string> = {
    services: "services",
    products: "products",
    apps: "apps",
    portfolio: "portfolio",
    blog: "blog",
    static_pages: "static-pages",
    faqs: "faqs",
    testimonials: "testimonials",
    media: "media",
    email_templates: "email-templates",
  };

  return `/${locale}/admin/${map[key] ?? key}`;
}

function contentIcon(key: string): IconName {
  const map: Record<string, IconName> = {
    services: "services",
    products: "products",
    apps: "apps",
    portfolio: "portfolio",
    blog: "blog",
    static_pages: "pages",
    faqs: "faq",
    testimonials: "testimonials",
    media: "media",
    email_templates: "email",
  };

  return map[key] ?? "pages";
}

function statusTone(value: unknown): BadgeTone {
  const normalized = normalizeKey(value);
  if (["online", "connected", "available", "enabled", "true"].includes(normalized)) {
    return "success";
  }
  if (["offline", "error", "unavailable", "disabled", "false"].includes(normalized)) {
    return "warning";
  }
  return "neutral";
}

function statusLabel(value: unknown, labels: AdminDashboardLiveProps["labels"]["system"]) {
  const normalized = normalizeKey(value);
  if (normalized === "online") return labels.online;
  if (normalized === "connected") return labels.connected;
  if (normalized === "available") return labels.available;
  if (normalized === "unavailable") return labels.unavailable;
  if (normalized === "enabled" || normalized === "true") return labels.enabled;
  if (normalized === "disabled" || normalized === "false") return labels.disabled;
  return valueToText(value || "—");
}

function ExecutiveStatCard({ item }: { item: ExecutiveStat }) {
  return (
    <Link href={item.href} className="group block min-h-full">
      <AppCard className="grid min-h-32 gap-4 p-5 transition hover:-translate-y-0.5 hover:border-app-primary/40 hover:shadow-appGlow">
        <div className="flex items-start justify-between gap-3">
          <span className="grid size-11 place-items-center rounded-appLg border border-app-border bg-app-surfaceElevated text-app-primary transition group-hover:border-app-primary/40">
            <AppIcon name={item.icon} size={20} />
          </span>
          <AppBadge tone={item.tone}>{item.value}</AppBadge>
        </div>
        <div className="grid gap-1">
          <strong className="text-3xl leading-none text-app-foreground">
            {item.value}
          </strong>
          <span className="text-sm font-bold text-app-foreground">
            {item.label}
          </span>
          <span className="line-clamp-1 text-xs text-app-muted">
            {item.hint}
          </span>
        </div>
      </AppCard>
    </Link>
  );
}

function buildInboxItems({
  quoteItems,
  messageItems,
  supportItems,
  locale,
  labels,
}: {
  quoteItems: AdminDashboardItem[];
  messageItems: AdminDashboardItem[];
  supportItems: AdminDashboardItem[];
  locale: Locale;
  labels: AdminDashboardLiveProps["labels"];
}): UnifiedInboxItem[] {
  const mapItem = (
    item: AdminDashboardItem,
    index: number,
    meta: Pick<UnifiedInboxItem, "typeLabel" | "href" | "icon"> & {
      kind: InboxKind;
    },
  ) => {
    const state = requestState(item, locale, meta.kind);

    return {
      key: `${meta.href}-${String(item.id ?? index)}`,
      title: itemTitle(item, locale, labels.noSubject),
      description: itemDescription(item),
      href: meta.href,
      typeLabel: meta.typeLabel,
      icon: meta.icon,
      statusLabel: state.label,
      statusTone: state.tone,
      isOpen: state.isOpen,
      dateValue: item.created_at,
      dateLabel: formatDate(item.created_at, locale),
    };
  };

  return [
    ...quoteItems.map((item, index) =>
      mapItem(item, index, {
        kind: "quote",
        typeLabel: labels.latest.quotes,
        href: `/${locale}/admin/quote-requests`,
        icon: "messages",
      }),
    ),
    ...messageItems.map((item, index) =>
      mapItem(item, index, {
        kind: "message",
        typeLabel: labels.latest.messages,
        href: `/${locale}/admin/contact-messages`,
        icon: "email",
      }),
    ),
    ...supportItems.map((item, index) =>
      mapItem(item, index, {
        kind: "support",
        typeLabel: labels.latest.support,
        href: `/${locale}/admin/support-requests`,
        icon: "support",
      }),
    ),
  ]
    .sort(
      (first, second) =>
        dateTimestamp(second.dateValue) - dateTimestamp(first.dateValue),
    )
    .slice(0, MAX_INBOX_ITEMS);
}

export function AdminDashboardLive({
  locale,
  labels,
}: AdminDashboardLiveProps) {
  const { tokens, user } = useAdminAuth();
  const token = tokens?.access_token ?? "";

  const query = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => getAdminDashboard(token),
    enabled: Boolean(token),
  });

  const data = query.data ?? {};
  const stats = data.stats ?? {};
  const siteStatus = data.site_status ?? {};
  const systemStatus = data.system_status ?? {};
  const latestActivity = data.latest_activity ?? [];
  const generatedAt = formatDate(data.generated_at, locale);
  const siteName =
    locale === "ar" ? siteStatus.site_name_ar : siteStatus.site_name_en;
  const readinessAlerts = data.readiness_alerts ?? [];

  const contentTotals = useMemo(() => {
    const items = data.content_status ?? [];
    return {
      total: items.reduce((sum, item) => sum + numberValue(item.total), 0),
      visible: items.reduce((sum, item) => sum + numberValue(item.visible), 0),
      essentials: contentPriority
        .map((key) => items.find((item) => item.key === key))
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    };
  }, [data.content_status]);

  const executiveStats: ExecutiveStat[] = [
    {
      key: "quotes",
      label: labels.stats.quotes,
      hint: labels.stats.quotesHint,
      value: numberValue(stats.new_quote_requests ?? data.quote_requests_count),
      icon: "messages",
      tone:
        numberValue(stats.new_quote_requests ?? data.quote_requests_count) > 0
          ? "primary"
          : "neutral",
      href: `/${locale}/admin/quote-requests`,
    },
    {
      key: "messages",
      label: labels.stats.messages,
      hint: labels.stats.messagesHint,
      value: numberValue(
        stats.unread_contact_messages ?? data.contact_messages_count,
      ),
      icon: "email",
      tone:
        numberValue(
          stats.unread_contact_messages ?? data.contact_messages_count,
        ) > 0
          ? "primary"
          : "neutral",
      href: `/${locale}/admin/contact-messages`,
    },
    {
      key: "support",
      label: labels.stats.support,
      hint: labels.stats.supportHint,
      value: numberValue(
        stats.open_support_requests ?? data.support_requests_count,
      ),
      icon: "support",
      tone:
        numberValue(
          stats.open_support_requests ?? data.support_requests_count,
        ) > 0
          ? "warning"
          : "success",
      href: `/${locale}/admin/support-requests`,
    },
    {
      key: "services",
      label: labels.stats.services,
      hint: labels.stats.servicesHint,
      value: numberValue(stats.published_services ?? data.services_count),
      icon: "services",
      tone: numberValue(stats.published_services ?? data.services_count) > 0 ? "success" : "warning",
      href: `/${locale}/admin/services`,
    },
    {
      key: "products",
      label: labels.stats.products,
      hint: labels.stats.productsHint,
      value: numberValue(stats.published_products ?? data.products_count),
      icon: "products",
      tone: numberValue(stats.published_products ?? data.products_count) > 0 ? "success" : "warning",
      href: `/${locale}/admin/products`,
    },
    {
      key: "apps",
      label: labels.stats.apps,
      hint: labels.stats.appsHint,
      value: numberValue(stats.published_apps ?? data.apps_count),
      icon: "apps",
      tone: numberValue(stats.published_apps ?? data.apps_count) > 0 ? "success" : "warning",
      href: `/${locale}/admin/apps`,
    },
    {
      key: "portfolio",
      label: labels.stats.portfolio,
      hint: labels.stats.portfolioHint,
      value: numberValue(stats.published_portfolio ?? data.portfolio_count),
      icon: "portfolio",
      tone: numberValue(stats.published_portfolio ?? data.portfolio_count) > 0 ? "success" : "warning",
      href: `/${locale}/admin/portfolio`,
    },
    {
      key: "media",
      label: labels.stats.media,
      hint: labels.stats.mediaHint,
      value: numberValue(stats.media_files),
      icon: "media",
      tone: numberValue(stats.media_files) > 0 ? "success" : "neutral",
      href: `/${locale}/admin/media`,
    },
  ];

  const inboxItems = buildInboxItems({
    quoteItems: data.latest_quote_requests ?? [],
    messageItems: data.latest_contact_messages ?? [],
    supportItems: data.latest_support_requests ?? [],
    locale,
    labels,
  });
  const copy = dashboardCopy(locale);
  const inboxSummary = {
    open: inboxItems.filter((item) => item.isOpen).length,
    closed: inboxItems.filter((item) => !item.isOpen).length,
  };

  if (query.isLoading) {
    return <AppLoadingState text={labels.loading} />;
  }

  if (query.isError) {
    return (
      <AppErrorState title={labels.error} description={String(query.error)} />
    );
  }

  return (
    <div className="grid gap-5">
      <AppCard className="overflow-hidden p-0">
        <div className="grid gap-5 p-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="grid gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <AppBadge
                tone={siteStatus.maintenance_mode ? "warning" : "success"}
              >
                {siteStatus.maintenance_mode
                  ? labels.site.maintenanceOn
                  : labels.site.websiteActive}
              </AppBadge>
              <AppBadge tone={readinessAlerts.length ? "warning" : "success"}>
                {readinessAlerts.length
                  ? `${labels.sections.readiness}: ${readinessAlerts.length}`
                  : labels.site.ready}
              </AppBadge>
            </div>
            <div className="grid gap-1">
              <h2 className="text-2xl font-bold text-app-foreground md:text-3xl">
                {valueToText(siteName || user?.full_name || user?.username)}
              </h2>
              <p className="text-sm leading-7 text-app-muted">
                {labels.updatedAt}: {generatedAt}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 lg:justify-end">
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-appMd bg-app-primary px-5 py-2 text-sm font-semibold text-app-primaryForeground shadow-appGlow transition hover:opacity-95 disabled:opacity-60"
              onClick={() => void query.refetch()}
              disabled={query.isFetching}
            >
              <AppIcon
                name={query.isFetching ? "loader" : "refresh"}
                size={17}
                className={query.isFetching ? "animate-spin" : undefined}
              />
              {labels.refresh}
            </button>
          </div>
        </div>
      </AppCard>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {executiveStats.map((item) => (
          <ExecutiveStatCard key={item.key} item={item} />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <AppCard className="grid content-start gap-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-app-foreground">
              {labels.sections.siteStatus}
            </h3>
            <Link
              href={`/${locale}/admin/settings/identity`}
              className="text-xs font-bold text-app-primary hover:underline"
            >
              {labels.view}
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: labels.site.websiteStatus, value: siteStatus.maintenance_mode ? labels.site.maintenanceOn : labels.site.websiteActive, tone: siteStatus.maintenance_mode ? "warning" : "success" },
              { label: labels.site.defaultLanguage, value: valueToText(siteStatus.default_language || "ar").toUpperCase(), tone: "neutral" },
              { label: labels.site.englishEnabled, value: siteStatus.english_enabled === false ? labels.site.disabled : labels.site.enabled, tone: siteStatus.english_enabled === false ? "warning" : "success" },
              { label: labels.site.activeTheme, value: valueToText(siteStatus.active_theme || "—"), tone: "neutral" },
              { label: labels.site.logo, value: siteStatus.has_logo ? labels.site.ready : labels.site.missing, tone: siteStatus.has_logo ? "success" : "warning" },
              { label: labels.site.favicon, value: siteStatus.has_favicon ? labels.site.ready : labels.site.missing, tone: siteStatus.has_favicon ? "success" : "warning" },
              { label: labels.site.contactChannels, value: siteStatus.has_contact_channels ? labels.site.ready : labels.site.missing, tone: siteStatus.has_contact_channels ? "success" : "warning" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3 rounded-appMd border border-app-border bg-app-surfaceElevated px-4 py-3">
                <span className="text-xs font-semibold text-app-muted">{item.label}</span>
                <AppBadge tone={item.tone as BadgeTone}>{item.value}</AppBadge>
              </div>
            ))}
          </div>
        </AppCard>

        <AppCard className="grid content-start gap-4 p-5">
          <h3 className="text-lg font-bold text-app-foreground">
            {labels.sections.systemStatus}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: labels.system.api, value: systemStatus.api },
              { label: labels.system.database, value: systemStatus.database },
              { label: labels.system.storage, value: systemStatus.storage },
              { label: labels.system.environment, value: systemStatus.environment },
              { label: labels.system.debug, value: systemStatus.debug ? "enabled" : "disabled" },
              { label: labels.system.emailNotifications, value: systemStatus.email_notifications_enabled ? "enabled" : "disabled" },
              { label: labels.system.mediaFiles, value: numberValue(systemStatus.media_files) },
              { label: labels.system.emailTemplates, value: numberValue(systemStatus.email_templates) },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3 rounded-appMd border border-app-border bg-app-surfaceElevated px-4 py-3">
                <span className="text-xs font-semibold text-app-muted">{item.label}</span>
                {typeof item.value === "number" ? (
                  <strong className="text-sm text-app-foreground">{item.value}</strong>
                ) : (
                  <AppBadge tone={statusTone(item.value)}>{statusLabel(item.value, labels.system)}</AppBadge>
                )}
              </div>
            ))}
          </div>
        </AppCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <AppCard className="grid content-start gap-4 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="grid gap-1">
              <h3 className="text-lg font-bold text-app-foreground">
                {labels.sections.readiness}
              </h3>
              <p className="text-xs leading-5 text-app-muted">
                {readinessAlerts.length
                  ? copy.readinessNeedsWork
                  : copy.readinessAllClear}
              </p>
            </div>
            <AppBadge tone={readinessAlerts.length ? "warning" : "success"}>
              {readinessAlerts.length
                ? `${readinessAlerts.length} ${copy.readinessOpen}`
                : labels.site.ready}
            </AppBadge>
          </div>

          {readinessAlerts.length ? (
            <div className="grid gap-3">
              {readinessAlerts.slice(0, MAX_ALERTS).map((alert) => (
                <Link
                  key={`${alert.code}-${alert.target_path ?? "dashboard"}`}
                  href={`/${locale}${alert.target_path ?? "/admin/dashboard"}`}
                  className="grid gap-3 rounded-appMd border border-app-border bg-app-surfaceElevated px-4 py-3 transition hover:border-app-primary/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="line-clamp-2 text-sm font-semibold leading-6 text-app-foreground">
                      {labels.alerts[alert.code] ?? alert.code}
                    </span>
                    <AppBadge tone={alert.tone}>
                      {readinessToneLabel(alert.tone, locale)}
                    </AppBadge>
                  </div>
                  <span className="inline-flex items-center gap-2 text-xs font-semibold text-app-primary">
                    {copy.resolve}
                    <AppIcon name={locale === "ar" ? "previous" : "next"} size={13} />
                  </span>
                </Link>
              ))}
              {readinessAlerts.length > MAX_ALERTS ? (
                <div className="rounded-appMd border border-app-border bg-app-surface px-4 py-3 text-center text-xs font-semibold text-app-muted">
                  +{readinessAlerts.length - MAX_ALERTS}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-appLg border border-app-success/25 bg-app-success/10 p-5">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full border border-app-success/25 bg-app-success/10 text-app-success">
                  <AppIcon name="check" size={18} />
                </span>
                <div className="grid gap-1">
                  <strong className="text-sm text-app-foreground">
                    {copy.readinessAllClear}
                  </strong>
                  <span className="text-xs text-app-muted">
                    {labels.site.ready}
                  </span>
                </div>
              </div>
            </div>
          )}
        </AppCard>

        <AppCard className="grid content-start gap-4 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="grid gap-1">
              <h3 className="text-lg font-bold text-app-foreground">
                {labels.sections.latestWork}
              </h3>
              <p className="text-xs leading-5 text-app-muted">
                {inboxSummary.open > 0
                  ? `${inboxSummary.open} ${copy.openRequests}`
                  : copy.noOpenRequests}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <AppBadge
                tone={inboxSummary.open > 0 ? "warning" : "success"}
              >{`${inboxSummary.open} ${copy.open}`}</AppBadge>
              {inboxSummary.closed > 0 ? (
                <AppBadge tone="neutral">{`${inboxSummary.closed} ${copy.closed}`}</AppBadge>
              ) : null}
            </div>
          </div>

          {inboxItems.length ? (
            <div className="grid gap-3">
              {inboxItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="grid gap-2 rounded-appMd border border-app-border bg-app-surfaceElevated p-4 transition hover:border-app-primary/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-appMd border border-app-border bg-app-surface text-app-primary">
                        <AppIcon name={item.icon} size={17} />
                      </span>
                      <div className="min-w-0">
                        <strong className="line-clamp-1 text-sm text-app-foreground">
                          {item.title}
                        </strong>
                        <p className="line-clamp-1 text-xs leading-5 text-app-muted">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <AppBadge tone={item.statusTone}>
                        {item.statusLabel}
                      </AppBadge>
                      <AppBadge tone="neutral">{item.typeLabel}</AppBadge>
                    </div>
                  </div>
                  <span className="text-xs text-app-muted">
                    {item.dateLabel}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <AppEmptyState title={labels.empty} icon="messages" />
          )}
        </AppCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <AppCard className="grid gap-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-app-foreground">
              {labels.sections.contentStatus}
            </h3>
            <AppBadge tone={readinessAlerts.length ? "warning" : "success"}>
              {contentTotals.visible}
            </AppBadge>
          </div>

          {contentTotals.essentials.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {contentTotals.essentials.map((item) => (
                <Link
                  key={item.key}
                  href={contentHref(item.key, locale)}
                  className="grid gap-3 rounded-appMd border border-app-border bg-app-surfaceElevated p-4 transition hover:border-app-primary/40"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="grid size-8 shrink-0 place-items-center rounded-appMd border border-app-border bg-app-surface text-app-primary">
                        <AppIcon name={contentIcon(item.key)} size={15} />
                      </span>
                      <strong className="line-clamp-1 text-sm text-app-foreground">
                        {labels.content[item.key] ?? item.key}
                      </strong>
                    </span>
                    <AppBadge tone={item.visible ? "success" : "warning"}>
                      {item.visible}
                    </AppBadge>
                  </div>
                  <div className="grid gap-1 text-xs text-app-muted">
                    <span>{labels.content.total}: {item.total}</span>
                    {typeof item.hidden === "number" ? <span>{labels.content.hidden}: {item.hidden}</span> : null}
                    {typeof item.draft === "number" ? <span>{labels.content.draft}: {item.draft}</span> : null}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <AppEmptyState title={labels.empty} icon="pages" />
          )}
        </AppCard>

        <AppCard className="grid content-start gap-4 p-5">
          <h3 className="text-lg font-bold text-app-foreground">
            {labels.sections.quickActions}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {labels.quickActions.map((action) => (
              <Link
                key={action.key}
                href={`/${locale}${action.href}`}
                className="flex items-center gap-3 rounded-appMd border border-app-border bg-app-surfaceElevated px-4 py-3 text-sm font-semibold text-app-foreground transition hover:border-app-primary/40 hover:text-app-primary"
              >
                <span className="grid size-9 place-items-center rounded-appMd border border-app-border bg-app-surface text-app-primary">
                  <AppIcon name={action.icon} size={17} />
                </span>
                <span className="line-clamp-1">{action.label}</span>
              </Link>
            ))}
          </div>
        </AppCard>
      </section>

      <AppCard className="grid content-start gap-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-app-foreground">
            {labels.sections.latestActivity}
          </h3>
          <Link
            href={`/${locale}/admin/audit-logs`}
            className="text-xs font-bold text-app-primary hover:underline"
          >
            {labels.view}
          </Link>
        </div>

        {latestActivity.length ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {latestActivity.slice(0, 6).map((item, index) => (
              <Link
                key={String(item.id ?? index)}
                href={`/${locale}/admin/audit-logs`}
                className="grid gap-2 rounded-appMd border border-app-border bg-app-surfaceElevated p-4 transition hover:border-app-primary/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-appMd border border-app-border bg-app-surface text-app-primary">
                      <AppIcon name="audit" size={17} />
                    </span>
                    <div className="min-w-0">
                      <strong className="line-clamp-1 text-sm text-app-foreground">
                        {itemTitle(item, locale, labels.latest.activity)}
                      </strong>
                      <p className="line-clamp-1 text-xs leading-5 text-app-muted">
                        {itemDescription(item, locale)}
                      </p>
                    </div>
                  </div>
                  <AppBadge tone="neutral">
                    {readableActivityAction(item.action || item.entity_type || labels.latest.activity, locale)}
                  </AppBadge>
                </div>
                <span className="text-xs text-app-muted">
                  {formatDate(item.created_at, locale)}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <AppEmptyState title={labels.empty} icon="audit" />
        )}
      </AppCard>
    </div>
  );
}
