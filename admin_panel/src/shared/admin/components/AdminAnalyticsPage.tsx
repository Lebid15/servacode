"use client";

/**
 * =====================================================
 * AdminAnalyticsPage
 * تحليلات الموقع العام داخل لوحة الأدمن
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
import { AppPageHeader } from "@/shared/design-system/components/AppPageHeader";
import { AppSelect } from "@/shared/design-system/components/AppSelect";
import { AppTable } from "@/shared/design-system/components/AppTable";
import type { Locale } from "@/shared/design-system/utils/direction";

type AnalyticsEventRow = {
  id: string;
  event_type?: string | null;
  path?: string | null;
  locale?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
  referrer?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  extra_data?: Record<string, unknown> | null;
  created_at?: string | null;
};

type CountItem = {
  label: string;
  count: number;
};

type DailyItem = {
  date: string;
  count: number;
};

type AnalyticsSummary = {
  period_days?: number;
  period_start?: string | null;
  stats?: Partial<{
    total_events: number;
    page_views: number;
    today_events: number;
    unique_visitors: number;
    unique_paths: number;
  }>;
  top_pages?: CountItem[];
  locales?: CountItem[];
  event_types?: CountItem[];
  entity_types?: CountItem[];
  daily?: DailyItem[];
  recent_events?: AnalyticsEventRow[];
};

type NormalizedAnalyticsSummary = {
  period_days: number;
  period_start: string | null;
  stats: {
    total_events: number;
    page_views: number;
    today_events: number;
    unique_visitors: number;
    unique_paths: number;
  };
  top_pages: CountItem[];
  locales: CountItem[];
  event_types: CountItem[];
  entity_types: CountItem[];
  daily: DailyItem[];
  recent_events: AnalyticsEventRow[];
};

const EMPTY_ANALYTICS_SUMMARY: NormalizedAnalyticsSummary = {
  period_days: 30,
  period_start: null,
  stats: {
    total_events: 0,
    page_views: 0,
    today_events: 0,
    unique_visitors: 0,
    unique_paths: 0
  },
  top_pages: [],
  locales: [],
  event_types: [],
  entity_types: [],
  daily: [],
  recent_events: []
};

function normalizeAnalyticsSummary(value?: AnalyticsSummary): NormalizedAnalyticsSummary {
  return {
    period_days: value?.period_days ?? EMPTY_ANALYTICS_SUMMARY.period_days,
    period_start: value?.period_start ?? null,
    stats: {
      ...EMPTY_ANALYTICS_SUMMARY.stats,
      ...(value?.stats ?? {})
    },
    top_pages: Array.isArray(value?.top_pages) ? value.top_pages : [],
    locales: Array.isArray(value?.locales) ? value.locales : [],
    event_types: Array.isArray(value?.event_types) ? value.event_types : [],
    entity_types: Array.isArray(value?.entity_types) ? value.entity_types : [],
    daily: Array.isArray(value?.daily) ? value.daily : [],
    recent_events: Array.isArray(value?.recent_events) ? value.recent_events : []
  };
}

type AnalyticsFilters = {
  search: string;
  days: string;
  locale: string;
  eventType: string;
};

type AnalyticsLabels = {
  eyebrow: string;
  title: string;
  description: string;
  refresh: string;
  search: string;
  period: string;
  locale: string;
  eventType: string;
  all: string;
  reset: string;
  loading: string;
  errorTitle: string;
  emptyTitle: string;
  emptyDescription: string;
  totalEvents: string;
  pageViews: string;
  todayEvents: string;
  uniqueVisitors: string;
  uniquePaths: string;
  topPages: string;
  languageDistribution: string;
  eventTypes: string;
  entityTypes: string;
  dailyActivity: string;
  recentEvents: string;
  path: string;
  event: string;
  date: string;
  visitor: string;
  referrer: string;
  noReferrer: string;
  noPath: string;
  noData: string;
  pageView: string;
  arabic: string;
  english: string;
  last7: string;
  last30: string;
  last90: string;
  last365: string;
  noteTitle: string;
  noteDescription: string;
  itemsCount: string;
  peakDay: string;
  visits: string;
  share: string;
};

const AR_LABELS: AnalyticsLabels = {
  eyebrow: "تحليلات الموقع",
  title: "التحليلات",
  description: "قراءة واضحة لحركة الموقع: الزيارات اليومية، الصفحات الأكثر مشاهدة، توزيع اللغات، وآخر الأحداث المسجلة.",
  refresh: "تحديث",
  search: "بحث بالمسار أو المصدر أو IP",
  period: "الفترة",
  locale: "اللغة",
  eventType: "نوع الحدث",
  all: "الكل",
  reset: "مسح الفلاتر",
  loading: "جاري تحميل التحليلات...",
  errorTitle: "تعذر تحميل التحليلات",
  emptyTitle: "لا توجد بيانات تحليلات بعد",
  emptyDescription: "ستبدأ البيانات بالظهور بعد زيارة صفحات الموقع العام بعد تركيب متتبع التحليلات.",
  totalEvents: "إجمالي الأحداث",
  pageViews: "مشاهدات الصفحات",
  todayEvents: "أحداث اليوم",
  uniqueVisitors: "زوار تقريبيون",
  uniquePaths: "صفحات مختلفة",
  topPages: "الصفحات الأكثر زيارة",
  languageDistribution: "توزيع اللغات",
  eventTypes: "أنواع الأحداث",
  entityTypes: "أنواع العناصر",
  dailyActivity: "النشاط اليومي",
  recentEvents: "آخر الأحداث",
  path: "المسار",
  event: "الحدث",
  date: "التاريخ",
  visitor: "الزائر",
  referrer: "المصدر",
  noReferrer: "مباشر",
  noPath: "غير محدد",
  noData: "لا توجد بيانات",
  pageView: "مشاهدة صفحة",
  arabic: "العربية",
  english: "الإنجليزية",
  last7: "آخر 7 أيام",
  last30: "آخر 30 يومًا",
  last90: "آخر 90 يومًا",
  last365: "آخر سنة",
  noteTitle: "ملاحظة مهمة",
  noteDescription: "الأرقام هنا داخلية ومبدئية وتعتمد على الأحداث المسجلة في قاعدة البيانات، وليست بديلًا كاملًا عن Google Analytics عند الحاجة لتحليلات تسويقية متقدمة.",
  itemsCount: "عنصر",
  peakDay: "أعلى يوم",
  visits: "زيارة",
  share: "النسبة"
};

const EN_LABELS: AnalyticsLabels = {
  eyebrow: "Website analytics",
  title: "Analytics",
  description: "A clear view of website traffic: daily visits, top pages, language distribution, and recently tracked events.",
  refresh: "Refresh",
  search: "Search by path, referrer, or IP",
  period: "Period",
  locale: "Language",
  eventType: "Event type",
  all: "All",
  reset: "Clear filters",
  loading: "Loading analytics...",
  errorTitle: "Unable to load analytics",
  emptyTitle: "No analytics data yet",
  emptyDescription: "Data will appear after public website pages are visited after installing the analytics tracker.",
  totalEvents: "Total events",
  pageViews: "Page views",
  todayEvents: "Today events",
  uniqueVisitors: "Approx. visitors",
  uniquePaths: "Unique pages",
  topPages: "Top pages",
  languageDistribution: "Language distribution",
  eventTypes: "Event types",
  entityTypes: "Entity types",
  dailyActivity: "Daily activity",
  recentEvents: "Recent events",
  path: "Path",
  event: "Event",
  date: "Date",
  visitor: "Visitor",
  referrer: "Referrer",
  noReferrer: "Direct",
  noPath: "Unknown",
  noData: "No data",
  pageView: "Page view",
  arabic: "Arabic",
  english: "English",
  last7: "Last 7 days",
  last30: "Last 30 days",
  last90: "Last 90 days",
  last365: "Last year",
  noteTitle: "Important note",
  noteDescription: "These are lightweight internal metrics based on stored events, not a full replacement for advanced marketing analytics when needed.",
  itemsCount: "items",
  peakDay: "Peak day",
  visits: "visits",
  share: "Share"
};

const PERIOD_OPTIONS = [
  { value: "7", labelAr: AR_LABELS.last7, labelEn: EN_LABELS.last7 },
  { value: "30", labelAr: AR_LABELS.last30, labelEn: EN_LABELS.last30 },
  { value: "90", labelAr: AR_LABELS.last90, labelEn: EN_LABELS.last90 },
  { value: "365", labelAr: AR_LABELS.last365, labelEn: EN_LABELS.last365 }
];

const EVENT_TYPE_OPTIONS = [{ value: "page_view", labelKey: "pageView" as const }];

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

function formatShortDate(value: string, locale: Locale) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.slice(5) || value;
  }

  return new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en", {
    month: "short",
    day: "numeric"
  }).format(date);
}

function formatNumber(value: number | null | undefined, locale: Locale) {
  return new Intl.NumberFormat(locale === "ar" ? "ar" : "en").format(Number(value) || 0);
}

function eventLabel(value: string | null | undefined, labels: AnalyticsLabels) {
  if (value === "page_view") {
    return labels.pageView;
  }

  return value || labels.noData;
}

function localeLabel(value: string | null | undefined, labels: AnalyticsLabels) {
  if (value === "ar") {
    return labels.arabic;
  }
  if (value === "en") {
    return labels.english;
  }
  return value || labels.noData;
}

function cleanAnalyticsLabel(value: string | null | undefined, labels: AnalyticsLabels) {
  if (!value) {
    return labels.noData;
  }

  let decoded = value.trim();
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    // نبقي القيمة الأصلية إذا لم تكن قابلة للفك.
  }

  decoded = decoded.replace(/^https?:\/\/[^/]+/i, "");

  if (!decoded || decoded === "/") {
    return "/";
  }

  return decoded.startsWith("/") ? decoded : `/${decoded}`;
}

function percentage(value: number, total: number) {
  if (!total) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

function barWidth(value: number, max: number, min = 8) {
  if (!max) {
    return 0;
  }

  return Math.max(min, Math.round((value / max) * 100));
}

function StatCard({ label, value, tone = "primary" }: { label: string; value: string; tone?: BadgeTone }) {
  return (
    <AppCard className="group relative overflow-hidden p-5">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-app-primary/50 to-transparent" />
      <div className="grid gap-4">
        <div className="flex items-center justify-between gap-3">
          <AppBadge tone={tone} className="w-fit">{label}</AppBadge>
          <span className="h-2.5 w-2.5 rounded-full bg-app-primary/70 shadow-[0_0_18px_rgba(37,99,235,0.35)]" />
        </div>
        <strong className="text-3xl font-black tracking-tight text-app-foreground md:text-4xl">{value}</strong>
      </div>
    </AppCard>
  );
}

function CountList({
  title,
  items,
  labels,
  locale,
  normalizeLabels = false
}: {
  title: string;
  items: CountItem[];
  labels: AnalyticsLabels;
  locale: Locale;
  normalizeLabels?: boolean;
}) {
  const max = Math.max(...items.map((item) => item.count), 1);
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <AppCard className="grid gap-5 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="grid gap-1">
          <h2 className="text-lg font-bold text-app-foreground">{title}</h2>
          <p className="text-xs text-app-muted">
            {formatNumber(items.length, locale)} {labels.itemsCount}
          </p>
        </div>
        <AppBadge tone="neutral" className="w-fit">
          {labels.share}
        </AppBadge>
      </div>

      {items.length ? (
        <div className="grid gap-3">
          {items.map((item, index) => {
            const displayLabel = normalizeLabels ? cleanAnalyticsLabel(item.label, labels) : item.label || labels.noData;
            const itemPercentage = percentage(item.count, total);

            return (
              <div key={`${item.label}-${index}`} className="rounded-appLg border border-app-border/80 bg-app-surfaceElevated/55 p-3 transition hover:border-app-primary/40 hover:bg-app-surfaceElevated">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-appMd border border-app-border bg-app-surface text-xs font-black text-app-muted">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 truncate text-sm font-bold text-app-foreground" title={displayLabel} dir="auto">
                      {displayLabel}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <strong className="text-sm text-app-foreground">{formatNumber(item.count, locale)}</strong>
                    <AppBadge tone="primary" className="w-fit">{formatNumber(itemPercentage, locale)}%</AppBadge>
                  </div>
                </div>
                <div className="relative h-2 overflow-hidden rounded-full bg-app-border/35" dir="ltr">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-app-primary shadow-[0_0_14px_rgba(37,99,235,0.22)]"
                    style={{ width: `${barWidth(item.count, max)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="rounded-appLg border border-dashed border-app-border bg-app-surfaceElevated/35 p-4 text-sm text-app-muted">{labels.noData}</p>
      )}
    </AppCard>
  );
}

function DailyActivity({ items, labels, locale }: { items: DailyItem[]; labels: AnalyticsLabels; locale: Locale }) {
  const max = Math.max(...items.map((item) => item.count), 1);
  const peak = items.reduce<DailyItem | null>((current, item) => (!current || item.count > current.count ? item : current), null);

  return (
    <AppCard className="grid gap-5 p-5 xl:col-span-3">
      <div className="flex items-start justify-between gap-3">
        <div className="grid gap-1">
          <h2 className="text-lg font-bold text-app-foreground">{labels.dailyActivity}</h2>
          <p className="text-xs text-app-muted">
            {peak ? `${labels.peakDay}: ${formatShortDate(peak.date, locale)} · ${formatNumber(peak.count, locale)} ${labels.visits}` : labels.noData}
          </p>
        </div>
        <AppBadge tone="primary" className="w-fit">{formatNumber(items.length, locale)} {labels.itemsCount}</AppBadge>
      </div>

      {items.length ? (
        <div className="rounded-appLg border border-app-border bg-app-surfaceElevated/45 p-4">
          <div className="flex min-h-52 items-end gap-3 overflow-x-auto pb-1" dir="ltr">
            {items.map((item) => (
              <div key={item.date} className="group flex min-w-16 flex-1 flex-col items-center gap-2">
                <strong className="text-xs text-app-foreground">{formatNumber(item.count, locale)}</strong>
                <div className="relative flex h-32 w-full max-w-16 items-end overflow-hidden rounded-t-appLg rounded-b-appSm border border-app-border/60 bg-app-surface shadow-inner">
                  <div
                    className="mx-auto w-8 rounded-t-appLg bg-app-primary shadow-[0_0_18px_rgba(37,99,235,0.28)] transition-all group-hover:bg-app-primary/85"
                    title={`${item.date}: ${item.count}`}
                    style={{ height: `${barWidth(item.count, max, 5)}%` }}
                  />
                </div>
                <span className="max-w-16 truncate text-[11px] font-semibold text-app-muted" title={item.date} dir="auto">
                  {formatShortDate(item.date, locale)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="rounded-appLg border border-dashed border-app-border bg-app-surfaceElevated/35 p-4 text-sm text-app-muted">{labels.noData}</p>
      )}
    </AppCard>
  );
}

type AdminAnalyticsPageProps = {
  locale: Locale;
};

export function AdminAnalyticsPage({ locale }: AdminAnalyticsPageProps) {
  const labels = locale === "ar" ? AR_LABELS : EN_LABELS;
  const { tokens } = useAdminAuth();
  const token = tokens?.access_token ?? "";
  const [filters, setFilters] = useState<AnalyticsFilters>({ search: "", days: "30", locale: "", eventType: "" });

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("days", filters.days || "30");
    if (filters.search.trim()) params.set("search", filters.search.trim());
    if (filters.locale) params.set("locale", filters.locale);
    if (filters.eventType) params.set("event_type", filters.eventType);
    return params.toString();
  }, [filters]);

  const analyticsQuery = useQuery({
    queryKey: ["admin-analytics-summary", queryString],
    enabled: Boolean(token),
    queryFn: () => apiRequest<AnalyticsSummary>(`/admin/analytics/summary?${queryString}`, { token })
  });

  const data = normalizeAnalyticsSummary(analyticsQuery.data);

  const rows = data.recent_events;
  const columns = useMemo(
    () => [
      {
        key: "event",
        header: labels.event,
        render: (row: AnalyticsEventRow) => <AppBadge tone="primary">{eventLabel(row.event_type, labels)}</AppBadge>
      },
      {
        key: "path",
        header: labels.path,
        render: (row: AnalyticsEventRow) => <span className="block max-w-xs truncate font-medium" dir="auto">{cleanAnalyticsLabel(row.path, labels) || labels.noPath}</span>
      },
      {
        key: "locale",
        header: labels.locale,
        render: (row: AnalyticsEventRow) => <AppBadge tone="neutral">{localeLabel(row.locale, labels)}</AppBadge>
      },
      {
        key: "visitor",
        header: labels.visitor,
        render: (row: AnalyticsEventRow) => <span className="text-sm text-app-muted">{row.ip_address || "—"}</span>
      },
      {
        key: "referrer",
        header: labels.referrer,
        render: (row: AnalyticsEventRow) => <span className="block max-w-xs truncate text-sm text-app-muted" dir="auto">{row.referrer || labels.noReferrer}</span>
      },
      {
        key: "date",
        header: labels.date,
        render: (row: AnalyticsEventRow) => <span className="text-sm text-app-muted">{formatDate(row.created_at, locale)}</span>
      }
    ],
    [labels, locale]
  );

  const resetFilters = () => setFilters({ search: "", days: "30", locale: "", eventType: "" });

  return (
    <div className="grid gap-6">
      <AppPageHeader
        eyebrow={labels.eyebrow}
        title={labels.title}
        description={labels.description}
        actions={
          <AppButton variant="secondary" onClick={() => analyticsQuery.refetch()} disabled={analyticsQuery.isFetching}>
            {labels.refresh}
          </AppButton>
        }
      />

      <AppCard className="grid gap-4 p-5">
        <div className="grid gap-4 md:grid-cols-4">
          <AppInput
            label={labels.search}
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
          />
          <AppSelect
            label={labels.period}
            value={filters.days}
            onChange={(event) => setFilters((current) => ({ ...current, days: event.target.value }))}
          >
            {PERIOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{locale === "ar" ? option.labelAr : option.labelEn}</option>
            ))}
          </AppSelect>
          <AppSelect
            label={labels.locale}
            value={filters.locale}
            onChange={(event) => setFilters((current) => ({ ...current, locale: event.target.value }))}
          >
            <option value="">{labels.all}</option>
            <option value="ar">{labels.arabic}</option>
            <option value="en">{labels.english}</option>
          </AppSelect>
          <AppSelect
            label={labels.eventType}
            value={filters.eventType}
            onChange={(event) => setFilters((current) => ({ ...current, eventType: event.target.value }))}
          >
            <option value="">{labels.all}</option>
            {EVENT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{labels[option.labelKey]}</option>
            ))}
          </AppSelect>
        </div>
        <div className="flex justify-end">
          <AppButton variant="ghost" onClick={resetFilters}>{labels.reset}</AppButton>
        </div>
      </AppCard>

      {analyticsQuery.isLoading ? <AppLoadingState text={labels.loading} /> : null}

      {analyticsQuery.isError ? (
        <AppErrorState title={labels.errorTitle} description={(analyticsQuery.error as Error)?.message} />
      ) : null}

      {!analyticsQuery.isLoading && !analyticsQuery.isError ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <StatCard label={labels.totalEvents} value={formatNumber(data.stats.total_events, locale)} tone="primary" />
            <StatCard label={labels.pageViews} value={formatNumber(data.stats.page_views, locale)} tone="success" />
            <StatCard label={labels.todayEvents} value={formatNumber(data.stats.today_events, locale)} tone="warning" />
            <StatCard label={labels.uniqueVisitors} value={formatNumber(data.stats.unique_visitors, locale)} tone="neutral" />
            <StatCard label={labels.uniquePaths} value={formatNumber(data.stats.unique_paths, locale)} tone="primary" />
          </div>

          {data.stats.total_events === 0 ? (
            <AppEmptyState title={labels.emptyTitle} description={labels.emptyDescription} icon="analytics" />
          ) : null}

          <div className="grid gap-4 xl:grid-cols-5">
            <DailyActivity items={data.daily} labels={labels} locale={locale} />
            <div className="xl:col-span-2">
              <CountList title={labels.topPages} items={data.top_pages} labels={labels} locale={locale} normalizeLabels />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <CountList title={labels.languageDistribution} items={data.locales} labels={labels} locale={locale} />
            <CountList title={labels.eventTypes} items={data.event_types} labels={labels} locale={locale} />
            <CountList title={labels.entityTypes} items={data.entity_types} labels={labels} locale={locale} />
          </div>

          <AppCard className="border-app-primary/30 bg-app-primary/10 p-5">
            <div className="grid gap-2">
              <h2 className="font-bold text-app-foreground">{labels.noteTitle}</h2>
              <p className="text-sm leading-7 text-app-muted">{labels.noteDescription}</p>
            </div>
          </AppCard>

          <AppCard className="grid gap-4 p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-app-foreground">{labels.recentEvents}</h2>
              <AppBadge tone="neutral" className="w-fit">{formatNumber(rows.length, locale)} {labels.itemsCount}</AppBadge>
            </div>
            {rows.length ? (
              <AppTable columns={columns} rows={rows} getRowKey={(row) => row.id} />
            ) : (
              <AppEmptyState title={labels.emptyTitle} description={labels.emptyDescription} icon="analytics" />
            )}
          </AppCard>
        </>
      ) : null}
    </div>
  );
}
