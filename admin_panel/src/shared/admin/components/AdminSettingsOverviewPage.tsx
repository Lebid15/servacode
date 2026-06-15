"use client";

/**
 * =====================================================
 * AdminSettingsOverviewPage
 * مركز إعدادات المنصة: هوية، تواصل، SEO، مظهر، صيانة، وذكاء اصطناعي.
 * =====================================================
 */

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Bot,
  Building2,
  CheckCircle2,
  ExternalLink,
  Home,
  Palette,
  Phone,
  RefreshCw,
  Search,
  Settings,
  Share2,
  Wrench,
} from "lucide-react";

import { getAdminSettingsOverview, type AdminSettingsModuleStatus } from "@/shared/api/admin-client";
import { useAdminAuth } from "@/shared/auth/AdminAuthProvider";
import { AppBadge, type BadgeTone } from "@/shared/design-system/components/AppBadge";
import { AppButton } from "@/shared/design-system/components/AppButton";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppErrorState } from "@/shared/design-system/components/AppErrorState";
import { AppLoadingState } from "@/shared/design-system/components/AppLoadingState";
import { AppPageHeader } from "@/shared/design-system/components/AppPageHeader";
import type { Locale } from "@/shared/design-system/utils/direction";

const iconMap = {
  identity: Building2,
  contact: Phone,
  social: Share2,
  seo: Search,
  appearance: Palette,
  maintenance: Wrench,
  ai: Bot,
  home: Home,
};

type AdminSettingsOverviewPageProps = {
  locale: Locale;
};

function localizePath(locale: Locale, targetPath: string) {
  if (targetPath.startsWith(`/${locale}/`)) {
    return targetPath;
  }

  if (targetPath.startsWith("/admin")) {
    return `/${locale}${targetPath}`;
  }

  return targetPath;
}

function formatDate(value: string | undefined, locale: Locale) {
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

function toneLabel(tone: BadgeTone, locale: Locale) {
  const labels = locale === "ar"
    ? { success: "مكتمل", warning: "يحتاج إعداد", danger: "حرج", primary: "مهم", neutral: "عادي" }
    : { success: "Complete", warning: "Needs setup", danger: "Critical", primary: "Important", neutral: "Normal" };

  return labels[tone] ?? labels.neutral;
}

function SettingsModuleCard({ module, locale }: { module: AdminSettingsModuleStatus; locale: Locale }) {
  const Icon = iconMap[module.key as keyof typeof iconMap] ?? Settings;
  const title = locale === "ar" ? module.label_ar : module.label_en;
  const description = locale === "ar" ? module.description_ar : module.description_en;
  const href = localizePath(locale, module.target_path);

  return (
    <AppCard className="grid gap-4 p-5">
      <div className="flex items-start justify-between gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-appLg border border-app-primary/25 bg-app-primary/10 text-app-primary">
          <Icon className="size-5" />
        </span>
        <AppBadge tone={module.tone}>{toneLabel(module.tone, locale)}</AppBadge>
      </div>
      <div className="grid gap-2">
        <h3 className="text-base font-black text-app-foreground">{title}</h3>
        <p className="text-sm leading-6 text-app-muted">{description}</p>
      </div>
      <Link
        href={href}
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-appMd border border-app-border bg-app-surfaceElevated px-4 text-sm font-black text-app-foreground transition hover:border-app-primary/40 hover:bg-app-surface"
      >
        {locale === "ar" ? "إدارة" : "Manage"}
        <ExternalLink className="size-4" />
      </Link>
    </AppCard>
  );
}

function MetricCard({ label, value, tone = "neutral" }: { label: string; value: string | number; tone?: BadgeTone }) {
  return (
    <AppCard className="grid gap-3 p-4">
      <span className="text-sm font-semibold text-app-muted">{label}</span>
      <div className="flex items-center justify-between gap-3">
        <strong className="text-2xl font-black text-app-foreground">{value}</strong>
        <AppBadge tone={tone}>{String(value)}</AppBadge>
      </div>
    </AppCard>
  );
}

export function AdminSettingsOverviewPage({ locale }: AdminSettingsOverviewPageProps) {
  const { tokens } = useAdminAuth();
  const token = tokens?.access_token ?? "";
  const isAr = locale === "ar";

  const query = useQuery({
    queryKey: ["admin-settings-overview"],
    queryFn: () => getAdminSettingsOverview(token),
    enabled: Boolean(token),
  });

  const data = query.data;
  const settings = data?.settings ?? {};
  const system = data?.system ?? {};
  const alerts = data?.readiness_alerts ?? [];

  return (
    <div className="grid gap-6">
      <AppPageHeader
        eyebrow={isAr ? "مركز الإعدادات" : "Settings Center"}
        title={isAr ? "إعدادات المنصة" : "Platform Settings"}
        description={
          isAr
            ? "المصدر المركزي لهوية الموقع، المظهر، اللغة، SEO، التواصل، الصيانة، والذكاء الاصطناعي."
            : "The central source of truth for identity, appearance, language, SEO, contact, maintenance, and AI."
        }
        actions={
          <AppButton
            variant="secondary"
            icon={<RefreshCw className="size-4" />}
            onClick={() => query.refetch()}
            disabled={query.isFetching}
          >
            {isAr ? "تحديث" : "Refresh"}
          </AppButton>
        }
      />

      {query.isLoading ? <AppLoadingState text={isAr ? "جاري تحميل الإعدادات..." : "Loading settings..."} /> : null}
      {query.isError ? (
        <AppErrorState
          title={isAr ? "تعذر تحميل ملخص الإعدادات" : "Could not load settings overview"}
          description={String(query.error)}
        />
      ) : null}

      {!query.isLoading && !query.isError && data ? (
        <>
          <AppCard className="overflow-hidden p-0">
            <div className="grid gap-5 border-b border-app-border bg-gradient-to-br from-app-primary/12 via-app-surface to-app-surfaceElevated p-5 xl:grid-cols-[0.8fr_1.2fr] xl:items-center">
              <div className="grid gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-14 place-items-center rounded-appXl border border-app-primary/25 bg-app-primary/15 text-app-primary shadow-appGlow">
                    <Settings className="size-6" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-app-muted">{isAr ? "جاهزية الإعدادات" : "Settings readiness"}</p>
                    <h2 className="text-3xl font-black text-app-foreground">{data.completion_score}%</h2>
                  </div>
                </div>
                <p className="text-sm leading-7 text-app-muted">
                  {isAr ? data.rules?.ar : data.rules?.en}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard label={isAr ? "الأقسام" : "Modules"} value={data.totals.modules_count} tone="primary" />
                <MetricCard label={isAr ? "المكتملة" : "Completed"} value={data.totals.completed_modules} tone="success" />
                <MetricCard label={isAr ? "تحتاج متابعة" : "Needs attention"} value={data.totals.attention_count} tone={data.totals.attention_count ? "warning" : "success"} />
                <MetricCard label={isAr ? "قنوات التواصل" : "Social channels"} value={data.totals.social_channels} tone="neutral" />
              </div>
            </div>

            <div className="grid gap-4 p-5 lg:grid-cols-2">
              <div className="rounded-appLg border border-app-border bg-app-surfaceElevated p-4">
                <h3 className="mb-3 text-sm font-black text-app-foreground">{isAr ? "هوية نشطة" : "Active identity"}</h3>
                <div className="grid gap-2 text-sm text-app-muted">
                  <p><strong className="text-app-foreground">{isAr ? "الاسم العربي:" : "Arabic name:"}</strong> {settings.site_name_ar || "—"}</p>
                  <p><strong className="text-app-foreground">{isAr ? "الاسم الإنجليزي:" : "English name:"}</strong> {settings.site_name_en || "—"}</p>
                  <p><strong className="text-app-foreground">{isAr ? "الثيم:" : "Theme:"}</strong> {settings.active_theme || "—"}</p>
                  <p><strong className="text-app-foreground">{isAr ? "اللغة الافتراضية:" : "Default language:"}</strong> {settings.default_language || "—"}</p>
                </div>
              </div>

              <div className="rounded-appLg border border-app-border bg-app-surfaceElevated p-4">
                <h3 className="mb-3 text-sm font-black text-app-foreground">{isAr ? "حالة النظام" : "System status"}</h3>
                <div className="grid gap-2 text-sm text-app-muted">
                  <p><strong className="text-app-foreground">{isAr ? "الذكاء الاصطناعي:" : "AI:"}</strong> {system.ai_enabled ? (isAr ? "مفعل" : "Enabled") : (isAr ? "غير مفعل" : "Disabled")}</p>
                  <p><strong className="text-app-foreground">{isAr ? "المزود:" : "Provider:"}</strong> {system.ai_provider || "—"}</p>
                  <p><strong className="text-app-foreground">{isAr ? "مفتاح API:" : "API key:"}</strong> {system.ai_key_configured ? (isAr ? "موجود" : "Configured") : (isAr ? "غير موجود" : "Missing")}</p>
                  <p><strong className="text-app-foreground">{isAr ? "آخر تحديث:" : "Generated:"}</strong> {formatDate(data.generated_at, locale)}</p>
                </div>
              </div>
            </div>
          </AppCard>

          {alerts.length ? (
            <AppCard className="grid gap-4 border-app-warning/30 bg-app-warning/5 p-5">
              <div className="flex items-center gap-3">
                <AlertTriangle className="size-5 text-app-warning" />
                <h2 className="text-base font-black text-app-foreground">{isAr ? "تنبيهات الإعدادات" : "Settings alerts"}</h2>
              </div>
              <div className="grid gap-2">
                {alerts.map((alert) => (
                  <Link
                    key={alert.code}
                    href={localizePath(locale, alert.target_path)}
                    className="flex items-center justify-between gap-3 rounded-appMd border border-app-border bg-app-surface px-4 py-3 transition hover:border-app-primary/35"
                  >
                    <span className="text-sm font-semibold text-app-foreground">{isAr ? alert.label_ar : alert.label_en}</span>
                    <AppBadge tone={alert.tone}>{toneLabel(alert.tone, locale)}</AppBadge>
                  </Link>
                ))}
              </div>
            </AppCard>
          ) : (
            <AppCard className="flex items-center gap-3 border-app-success/30 bg-app-success/5 p-5">
              <CheckCircle2 className="size-5 text-app-success" />
              <p className="text-sm font-black text-app-success">{isAr ? "الإعدادات الأساسية مكتملة." : "Core settings are complete."}</p>
            </AppCard>
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {data.modules.map((module) => (
              <SettingsModuleCard key={module.key} module={module} locale={locale} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
