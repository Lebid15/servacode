"use client";

/**
 * =====================================================
 * AdminContentManagementPage
 * مركز إدارة المحتوى: يوضح حالة كل أقسام المحتوى ويربطها بالمسارات الصحيحة.
 * =====================================================
 */

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import {
  getAdminContentOverview,
  type AdminContentModuleStatus,
} from "@/shared/api/admin-client";
import { useAdminAuth } from "@/shared/auth/AdminAuthProvider";
import { AppBadge, type BadgeTone } from "@/shared/design-system/components/AppBadge";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppErrorState } from "@/shared/design-system/components/AppErrorState";
import { AppIcon, type IconName } from "@/shared/design-system/components/AppIcon";
import { AppLoadingState } from "@/shared/design-system/components/AppLoadingState";
import { AppPageHeader } from "@/shared/design-system/components/AppPageHeader";
import type { Locale } from "@/shared/design-system/utils/direction";
import { cn } from "@/shared/design-system/utils/cn";

type AdminContentManagementPageProps = {
  locale: Locale;
};

const iconMap: Record<string, IconName> = {
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

const labels = {
  ar: {
    eyebrow: "إدارة المحتوى",
    title: "مركز إدارة محتوى الموقع",
    description:
      "من هنا تتابع حالة كل المحتوى الذي يظهر في الموقع العام: الخدمات، الأنظمة، التطبيقات، الأعمال، الصفحات، الأسئلة، الوسائط، وقوالب البريد.",
    refresh: "تحديث",
    loading: "يتم تحميل حالة المحتوى...",
    errorTitle: "تعذر تحميل إدارة المحتوى",
    errorDescription: "تأكد أن الباكند يعمل وأن جلسة الدخول صالحة.",
    modules: "أقسام المحتوى",
    overview: "ملخص المحتوى",
    needsAttention: "يحتاج متابعة",
    ready: "جاهز",
    manage: "إدارة",
    preview: "معاينة",
    total: "الإجمالي",
    visible: "الظاهر",
    hidden: "المخفي",
    draft: "المسودات",
    seed: "تأسيسي من الباكند",
    manual: "إدخال يدوي",
    latestActivity: "آخر نشاط إداري",
    noActivity: "لا يوجد نشاط حديث.",
    rulesTitle: "قواعد إدارة المحتوى",
    modulesCount: "الأقسام",
    itemsCount: "العناصر",
    visibleCount: "العناصر الظاهرة",
    attentionCount: "تنبيهات",
  },
  en: {
    eyebrow: "Content Management",
    title: "Website Content Center",
    description:
      "Track every content area shown on the public website: services, systems, apps, portfolio, pages, FAQs, media, and email templates.",
    refresh: "Refresh",
    loading: "Loading content status...",
    errorTitle: "Could not load content management",
    errorDescription: "Make sure the backend is running and the admin session is valid.",
    modules: "Content Modules",
    overview: "Content Overview",
    needsAttention: "Needs attention",
    ready: "Ready",
    manage: "Manage",
    preview: "Preview",
    total: "Total",
    visible: "Visible",
    hidden: "Hidden",
    draft: "Draft",
    seed: "Seeded backend content",
    manual: "Manual entry",
    latestActivity: "Latest Admin Activity",
    noActivity: "No recent activity.",
    rulesTitle: "Content Rules",
    modulesCount: "Modules",
    itemsCount: "Items",
    visibleCount: "Visible items",
    attentionCount: "Alerts",
  },
} as const;

function adminPath(locale: Locale, path?: string | null) {
  if (!path) return `/${locale}/admin/content`;
  return path.startsWith("/admin") ? `/${locale}${path}` : `/${locale}/admin/${path.replace(/^\/+/, "")}`;
}

function publicPath(locale: Locale, path?: string | null) {
  if (!path) return null;
  return path.startsWith("/") ? `/${locale}${path}` : `/${locale}/${path}`;
}

function moduleTitle(module: AdminContentModuleStatus, locale: Locale) {
  return locale === "ar" ? module.label_ar : module.label_en;
}

function moduleDescription(module: AdminContentModuleStatus, locale: Locale) {
  return locale === "ar" ? module.description_ar : module.description_en;
}

function toneForModule(module: AdminContentModuleStatus): BadgeTone {
  return module.needs_attention ? "warning" : module.tone || "success";
}

function formatNumber(value: number | undefined, locale: Locale) {
  return new Intl.NumberFormat(locale === "ar" ? "ar" : "en").format(value ?? 0);
}

function MetricCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number | undefined;
  tone?: BadgeTone;
}) {
  return (
    <AppCard className="grid gap-2 p-5">
      <span className="text-xs font-bold text-app-muted">{label}</span>
      <strong className={cn(
        "text-2xl font-black",
        tone === "success" && "text-app-success",
        tone === "warning" && "text-app-warning",
        tone === "danger" && "text-app-danger",
        tone === "primary" && "text-app-primary",
        tone === "neutral" && "text-app-foreground"
      )}>
        {value}
      </strong>
    </AppCard>
  );
}

function ModuleCard({
  module,
  locale,
  dictionary,
}: {
  module: AdminContentModuleStatus;
  locale: Locale;
  dictionary: typeof labels.ar;
}) {
  const previewHref = publicPath(locale, module.public_path);
  const iconName = iconMap[module.key] ?? "pages";
  const score = Math.max(0, Math.min(100, Number(module.completion_score || 0)));

  return (
    <AppCard className="grid gap-5 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-appLg border border-app-border bg-app-surfaceElevated text-app-primary">
            <AppIcon name={iconName} size={23} />
          </span>
          <div className="grid min-w-0 gap-1">
            <h3 className="truncate text-lg font-black text-app-foreground">{moduleTitle(module, locale)}</h3>
            <p className="line-clamp-2 text-sm leading-6 text-app-muted">{moduleDescription(module, locale)}</p>
          </div>
        </div>
        <AppBadge tone={toneForModule(module)}>
          {module.needs_attention ? dictionary.needsAttention : dictionary.ready}
        </AppBadge>
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between text-xs font-bold text-app-muted">
          <span>{locale === "ar" ? "اكتمال القسم" : "Completion"}</span>
          <span>{score}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-app-surfaceElevated">
          <div className="h-full rounded-full bg-app-primary" style={{ width: `${score}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="rounded-appMd border border-app-border bg-app-surfaceElevated p-2">
          <span className="block text-[0.68rem] font-bold text-app-muted">{dictionary.total}</span>
          <strong className="text-sm text-app-foreground">{formatNumber(module.total, locale)}</strong>
        </div>
        <div className="rounded-appMd border border-app-border bg-app-surfaceElevated p-2">
          <span className="block text-[0.68rem] font-bold text-app-muted">{dictionary.visible}</span>
          <strong className="text-sm text-app-success">{formatNumber(module.visible, locale)}</strong>
        </div>
        <div className="rounded-appMd border border-app-border bg-app-surfaceElevated p-2">
          <span className="block text-[0.68rem] font-bold text-app-muted">{dictionary.hidden}</span>
          <strong className="text-sm text-app-warning">{formatNumber(module.hidden, locale)}</strong>
        </div>
        <div className="rounded-appMd border border-app-border bg-app-surfaceElevated p-2">
          <span className="block text-[0.68rem] font-bold text-app-muted">{dictionary.draft}</span>
          <strong className="text-sm text-app-primary">{formatNumber(module.draft, locale)}</strong>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {module.seed_managed ? <AppBadge tone="primary">{dictionary.seed}</AppBadge> : null}
        {module.manual_entry_required ? <AppBadge tone="warning">{dictionary.manual}</AppBadge> : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={adminPath(locale, module.target_path)}
          className="inline-flex min-h-10 items-center justify-center rounded-appMd bg-app-primary px-4 py-2 text-sm font-black text-app-primaryForeground shadow-appGlow transition hover:opacity-95"
        >
          {dictionary.manage}
        </Link>
        {previewHref ? (
          <Link
            href={previewHref}
            className="inline-flex min-h-10 items-center justify-center rounded-appMd border border-app-border bg-app-surfaceElevated px-4 py-2 text-sm font-black text-app-foreground transition hover:bg-app-surface"
            target="_blank"
          >
            {dictionary.preview}
          </Link>
        ) : null}
      </div>
    </AppCard>
  );
}

export function AdminContentManagementPage({ locale }: AdminContentManagementPageProps) {
  const { tokens } = useAdminAuth();
  const dictionary = labels[locale];

  const query = useQuery({
    queryKey: ["admin-content-overview"],
    queryFn: () => getAdminContentOverview(tokens?.access_token ?? ""),
    enabled: Boolean(tokens?.access_token),
  });

  if (query.isLoading) {
    return <AppLoadingState text={dictionary.loading} />;
  }

  if (query.isError || !query.data) {
    return <AppErrorState title={dictionary.errorTitle} description={dictionary.errorDescription} />;
  }

  const data = query.data;
  const totals = data.totals;

  return (
    <div className="grid gap-7">
      <AppPageHeader
        eyebrow={dictionary.eyebrow}
        title={dictionary.title}
        description={dictionary.description}
        actions={
          <button
            type="button"
            onClick={() => query.refetch()}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-appMd border border-app-border bg-app-surfaceElevated px-5 py-2 text-sm font-black text-app-foreground transition hover:bg-app-surface"
          >
            <AppIcon name="refresh" size={17} />
            {dictionary.refresh}
          </button>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label={dictionary.modulesCount} value={totals.modules_count} />
        <MetricCard label={dictionary.itemsCount} value={totals.items_count} tone="primary" />
        <MetricCard label={dictionary.visibleCount} value={totals.visible_count} tone="success" />
        <MetricCard label={dictionary.attentionCount} value={totals.attention_count} tone={totals.attention_count ? "warning" : "success"} />
      </section>

      <AppCard className="grid gap-3 p-5">
        <div className="flex items-center gap-2">
          <AppIcon name="sparkles" className="text-app-primary" />
          <h2 className="font-black text-app-foreground">{dictionary.rulesTitle}</h2>
        </div>
        <div className="grid gap-2 text-sm leading-7 text-app-muted md:grid-cols-2">
          <p>{locale === "ar" ? data.rules?.seed_managed_ar : data.rules?.seed_managed_en}</p>
          <p>{locale === "ar" ? data.rules?.manual_entry_ar : data.rules?.manual_entry_en}</p>
        </div>
      </AppCard>

      <section className="grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-app-foreground">{dictionary.modules}</h2>
          {data.readiness_alerts?.length ? (
            <AppBadge tone="warning">
              {formatNumber(data.readiness_alerts.length, locale)} {dictionary.needsAttention}
            </AppBadge>
          ) : (
            <AppBadge tone="success">{dictionary.ready}</AppBadge>
          )}
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {data.modules.map((module) => (
            <ModuleCard key={module.key} module={module} locale={locale} dictionary={dictionary} />
          ))}
        </div>
      </section>

      <AppCard className="grid gap-4 p-5">
        <h2 className="text-lg font-black text-app-foreground">{dictionary.latestActivity}</h2>
        {data.latest_activity?.length ? (
          <div className="grid gap-2">
            {data.latest_activity.slice(0, 6).map((item, index) => (
              <div key={String(item.id ?? index)} className="rounded-appMd border border-app-border bg-app-surfaceElevated p-3">
                <p className="text-sm font-bold text-app-foreground">
                  {String(item.description || item.message || item.status || "-")}
                </p>
                {item.created_at ? (
                  <p className="mt-1 text-xs text-app-muted">{new Date(item.created_at).toLocaleString(locale === "ar" ? "ar" : "en")}</p>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-app-muted">{dictionary.noActivity}</p>
        )}
      </AppCard>
    </div>
  );
}
