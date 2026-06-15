"use client";

/**
 * =====================================================
 * AdminCommunicationOverviewPage
 * مركز الإشعارات والتواصل كواجهة تشغيلية واحدة.
 * =====================================================
 */

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { getAdminCommunicationOverview, type AdminCommunicationOverview, type DashboardTone } from "@/shared/api/admin-client";
import { useAdminAuth } from "@/shared/auth/AdminAuthProvider";
import { AppBadge, type BadgeTone } from "@/shared/design-system/components/AppBadge";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppEmptyState } from "@/shared/design-system/components/AppEmptyState";
import { AppErrorState } from "@/shared/design-system/components/AppErrorState";
import { AppIcon, type IconName } from "@/shared/design-system/components/AppIcon";
import { AppLoadingState } from "@/shared/design-system/components/AppLoadingState";
import { AppPageHeader } from "@/shared/design-system/components/AppPageHeader";
import { cn } from "@/shared/design-system/utils/cn";
import type { Locale } from "@/shared/design-system/utils/direction";

import { AdminCommunicationTabs } from "./AdminCommunicationTabs";

type Labels = {
  eyebrow: string;
  title: string;
  description: string;
  refresh: string;
  totalNotifications: string;
  unreadNotifications: string;
  todayNotifications: string;
  weekNotifications: string;
  activeTemplates: string;
  inactiveTemplates: string;
  openQuotes: string;
  openContacts: string;
  openSupport: string;
  modulesTitle: string;
  alertsTitle: string;
  latestTitle: string;
  rulesTitle: string;
  manage: string;
  noAlerts: string;
  noNotifications: string;
  unread: string;
  read: string;
  generatedAt: string;
  active: string;
  secondary: string;
  needsAttention: string;
  stable: string;
  loading: string;
  errorTitle: string;
};

const AR_LABELS: Labels = {
  eyebrow: "مركز الإشعارات والتواصل",
  title: "نظرة عامة",
  description: "متابعة التنبيهات، قوالب البريد، ورسائل الموقع من مركز واحد واضح.",
  refresh: "تحديث",
  totalNotifications: "كل الإشعارات",
  unreadNotifications: "غير مقروءة",
  todayNotifications: "اليوم",
  weekNotifications: "آخر 7 أيام",
  activeTemplates: "قوالب مفعلة",
  inactiveTemplates: "قوالب غير مفعلة",
  openQuotes: "طلبات مشاريع مفتوحة",
  openContacts: "رسائل تواصل مفتوحة",
  openSupport: "طلبات دعم مفتوحة",
  modulesTitle: "حالة قنوات التواصل",
  alertsTitle: "تنبيهات تحتاج متابعة",
  latestTitle: "آخر الإشعارات",
  rulesTitle: "قاعدة العمل",
  manage: "إدارة",
  noAlerts: "لا توجد تنبيهات مهمة حاليًا.",
  noNotifications: "لا توجد إشعارات بعد.",
  unread: "غير مقروء",
  read: "مقروء",
  generatedAt: "آخر تحديث",
  active: "نشط / مفتوح",
  secondary: "مقروء / ثانوي",
  needsAttention: "يحتاج متابعة",
  stable: "مستقر",
  loading: "جارٍ تحميل مركز الإشعارات والتواصل...",
  errorTitle: "تعذر تحميل مركز التواصل",
};

const EN_LABELS: Labels = {
  eyebrow: "Notifications & Communication Center",
  title: "Overview",
  description: "Track notifications, email templates, and website communication from one clear center.",
  refresh: "Refresh",
  totalNotifications: "All notifications",
  unreadNotifications: "Unread",
  todayNotifications: "Today",
  weekNotifications: "Last 7 days",
  activeTemplates: "Active templates",
  inactiveTemplates: "Inactive templates",
  openQuotes: "Open project requests",
  openContacts: "Open contact messages",
  openSupport: "Open support requests",
  modulesTitle: "Communication channels status",
  alertsTitle: "Alerts needing attention",
  latestTitle: "Latest notifications",
  rulesTitle: "Operating rule",
  manage: "Manage",
  noAlerts: "No important alerts at the moment.",
  noNotifications: "No notifications yet.",
  unread: "Unread",
  read: "Read",
  generatedAt: "Last updated",
  active: "Active / open",
  secondary: "Read / secondary",
  needsAttention: "Needs attention",
  stable: "Stable",
  loading: "Loading notifications and communication center...",
  errorTitle: "Unable to load communication center",
};

const iconMap: Record<string, IconName> = {
  notifications: "bell",
  email_templates: "email",
  quote_requests: "portfolio",
  contact_messages: "messages",
  support_requests: "support",
};

function toneToBadgeTone(tone?: DashboardTone): BadgeTone {
  if (tone === "danger") {
    return "danger";
  }
  if (tone === "warning") {
    return "warning";
  }
  if (tone === "success") {
    return "success";
  }
  if (tone === "primary") {
    return "primary";
  }
  return "neutral";
}

function formatNumber(value: number | undefined, locale: Locale) {
  return new Intl.NumberFormat(locale === "ar" ? "ar" : "en").format(value ?? 0);
}

function formatDate(value: string | undefined | null, locale: Locale) {
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

function localize(item: { label_ar?: string | null; label_en?: string | null }, locale: Locale) {
  return locale === "ar" ? item.label_ar || item.label_en || "—" : item.label_en || item.label_ar || "—";
}

function StatCard({ label, value, tone, icon, locale }: { label: string; value: number; tone: BadgeTone; icon: IconName; locale: Locale }) {
  return (
    <AppCard className="relative overflow-hidden p-4">
      <div className="pointer-events-none absolute -top-16 end-4 size-28 rounded-full bg-app-primary/10 blur-2xl" />
      <div className="relative flex items-center justify-between gap-4">
        <div className="grid gap-2">
          <span className="text-sm font-semibold text-app-muted">{label}</span>
          <strong className="text-3xl font-black text-app-foreground">{formatNumber(value, locale)}</strong>
        </div>
        <span className="grid size-11 shrink-0 place-items-center rounded-appMd border border-app-border bg-app-surfaceElevated text-app-primary">
          <AppIcon name={icon} size={19} />
        </span>
      </div>
      <AppBadge tone={tone} className="mt-3">{label}</AppBadge>
    </AppCard>
  );
}

export function AdminCommunicationOverviewPage({ locale }: { locale: Locale }) {
  const labels = locale === "ar" ? AR_LABELS : EN_LABELS;
  const { tokens } = useAdminAuth();
  const token = tokens?.access_token ?? "";

  const query = useQuery({
    queryKey: ["admin-communication-overview"],
    queryFn: () => getAdminCommunicationOverview(token),
    enabled: Boolean(token),
  });

  const data = query.data as AdminCommunicationOverview | undefined;
  const totals = data?.totals;

  return (
    <div className="grid gap-6">
      <AdminCommunicationTabs locale={locale} activeKey="overview" />

      <AppPageHeader
        eyebrow={labels.eyebrow}
        title={labels.title}
        description={labels.description}
        actions={
          <button
            type="button"
            onClick={() => query.refetch()}
            disabled={query.isFetching}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-appMd border border-app-border bg-app-surfaceElevated px-5 py-2 text-sm font-semibold text-app-foreground transition hover:bg-app-surface disabled:opacity-50"
          >
            <AppIcon name="refresh" size={18} />
            {labels.refresh}
          </button>
        }
      />

      {query.isLoading ? <AppLoadingState text={labels.loading} /> : null}
      {query.isError ? <AppErrorState title={labels.errorTitle} description={String(query.error)} /> : null}

      {!query.isLoading && !query.isError && data ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label={labels.totalNotifications} value={totals?.notifications ?? 0} tone="primary" icon="bell" locale={locale} />
            <StatCard label={labels.unreadNotifications} value={totals?.unread_notifications ?? 0} tone={(totals?.unread_notifications ?? 0) > 0 ? "warning" : "success"} icon="eye" locale={locale} />
            <StatCard label={labels.todayNotifications} value={totals?.today_notifications ?? 0} tone="neutral" icon="dashboard" locale={locale} />
            <StatCard label={labels.weekNotifications} value={totals?.week_notifications ?? 0} tone="primary" icon="analytics" locale={locale} />
            <StatCard label={labels.activeTemplates} value={totals?.active_email_templates ?? 0} tone="success" icon="email" locale={locale} />
            <StatCard label={labels.inactiveTemplates} value={totals?.inactive_email_templates ?? 0} tone={(totals?.inactive_email_templates ?? 0) > 0 ? "warning" : "neutral"} icon="eyeOff" locale={locale} />
            <StatCard label={labels.openQuotes} value={totals?.open_quote_requests ?? 0} tone="primary" icon="portfolio" locale={locale} />
            <StatCard label={labels.openSupport} value={totals?.open_support_requests ?? 0} tone={(totals?.open_support_requests ?? 0) > 0 ? "warning" : "neutral"} icon="support" locale={locale} />
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
            <AppCard className="grid gap-4 p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-black text-app-foreground">{labels.modulesTitle}</h2>
                <AppBadge tone="primary">{formatDate(data.generated_at, locale)}</AppBadge>
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                {(data.modules ?? []).map((module) => {
                  const label = locale === "ar" ? module.label_ar : module.label_en;
                  const description = locale === "ar" ? module.description_ar : module.description_en;
                  const icon = iconMap[module.key] ?? "messages";
                  return (
                    <div key={module.key} className="rounded-appLg border border-app-border bg-app-surfaceElevated/70 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span className="grid size-11 shrink-0 place-items-center rounded-appMd border border-app-primary/20 bg-app-primary/10 text-app-primary">
                            <AppIcon name={icon} size={19} />
                          </span>
                          <div className="grid gap-1">
                            <strong className="text-app-foreground">{label}</strong>
                            <p className="line-clamp-2 text-sm leading-6 text-app-muted">{description}</p>
                          </div>
                        </div>
                        <AppBadge tone={module.needs_attention ? "warning" : toneToBadgeTone(module.tone)}>
                          {module.needs_attention ? labels.needsAttention : labels.stable}
                        </AppBadge>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                        <div className="rounded-appMd border border-app-border bg-app-surface p-2">
                          <strong className="block text-lg text-app-foreground">{formatNumber(module.total, locale)}</strong>
                          <span className="text-xs text-app-muted">{labels.totalNotifications}</span>
                        </div>
                        <div className="rounded-appMd border border-app-border bg-app-surface p-2">
                          <strong className="block text-lg text-app-foreground">{formatNumber(module.active, locale)}</strong>
                          <span className="text-xs text-app-muted">{labels.active}</span>
                        </div>
                        <div className="rounded-appMd border border-app-border bg-app-surface p-2">
                          <strong className="block text-lg text-app-foreground">{formatNumber(module.secondary, locale)}</strong>
                          <span className="text-xs text-app-muted">{labels.secondary}</span>
                        </div>
                      </div>
                      <Link
                        href={`/${locale}${module.target_path}`}
                        className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-appMd border border-app-border bg-app-surface px-4 text-sm font-black text-app-foreground transition hover:border-app-primary/35 hover:text-app-primary"
                      >
                        {labels.manage}
                        <AppIcon name="next" size={16} />
                      </Link>
                    </div>
                  );
                })}
              </div>
            </AppCard>

            <div className="grid gap-4">
              <AppCard className="grid gap-4 p-5">
                <h2 className="text-lg font-black text-app-foreground">{labels.alertsTitle}</h2>
                {(data.alerts ?? []).length > 0 ? (
                  <div className="grid gap-2">
                    {(data.alerts ?? []).map((alert) => (
                      <Link
                        key={alert.code}
                        href={`/${locale}${alert.target_path}`}
                        className="rounded-appLg border border-app-border bg-app-surfaceElevated p-3 transition hover:border-app-primary/30"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold leading-6 text-app-foreground">{localize(alert, locale)}</span>
                          <AppBadge tone={toneToBadgeTone(alert.tone)}>{alert.code}</AppBadge>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-appLg border border-app-border bg-app-surfaceElevated p-4 text-sm font-semibold text-app-muted">{labels.noAlerts}</p>
                )}
              </AppCard>

              <AppCard className="grid gap-3 p-5">
                <h2 className="text-lg font-black text-app-foreground">{labels.rulesTitle}</h2>
                <p className="text-sm leading-7 text-app-muted">{locale === "ar" ? data.rules?.ar : data.rules?.en}</p>
              </AppCard>
            </div>
          </div>

          <AppCard className="grid gap-4 p-5">
            <h2 className="text-lg font-black text-app-foreground">{labels.latestTitle}</h2>
            {(data.latest_notifications ?? []).length > 0 ? (
              <div className="grid gap-2">
                {(data.latest_notifications ?? []).map((item) => (
                  <Link
                    key={item.id}
                    href={`/${locale}${item.action_url || "/admin/notifications"}`}
                    className={cn(
                      "grid gap-2 rounded-appLg border border-app-border bg-app-surfaceElevated/70 p-4 transition hover:border-app-primary/35",
                      !item.is_read && "border-app-warning/45 bg-app-warning/5",
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <strong className="text-app-foreground">{locale === "ar" ? item.title_ar || item.title_en : item.title_en || item.title_ar}</strong>
                      <AppBadge tone={item.is_read ? "success" : "warning"}>{item.is_read ? labels.read : labels.unread}</AppBadge>
                    </div>
                    <span className="text-sm text-app-muted">{formatDate(item.created_at, locale)}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <AppEmptyState title={labels.noNotifications} description={labels.description} icon="bell" />
            )}
          </AppCard>
        </>
      ) : null}
    </div>
  );
}
