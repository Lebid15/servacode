"use client";

/**
 * =====================================================
 * AdminCustomersOverviewPage
 * مركز الطلبات والعملاء: نظرة تشغيلية على طلبات المشاريع، التواصل، الدعم، وآراء العملاء.
 * =====================================================
 */

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { getAdminCustomersOverview, type AdminCustomerOverviewItem, type AdminCustomerModuleStatus } from "@/shared/api/admin-client";
import { useAdminAuth } from "@/shared/auth/AdminAuthProvider";
import { AppBadge, type BadgeTone } from "@/shared/design-system/components/AppBadge";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppEmptyState } from "@/shared/design-system/components/AppEmptyState";
import { AppErrorState } from "@/shared/design-system/components/AppErrorState";
import { AppIcon, type IconName } from "@/shared/design-system/components/AppIcon";
import { AppLoadingState } from "@/shared/design-system/components/AppLoadingState";
import { AppPageHeader } from "@/shared/design-system/components/AppPageHeader";
import type { Locale } from "@/shared/design-system/utils/direction";
import { cn } from "@/shared/design-system/utils/cn";

const statusLabelsAr: Record<string, string> = {
  new: "جديد",
  reviewing: "قيد المراجعة",
  contacted: "تم التواصل",
  waiting_customer: "بانتظار العميل",
  proposal_sent: "تم إرسال العرض",
  accepted: "مقبول",
  rejected: "مرفوض",
  completed: "منجز",
  archived: "مؤرشف",
  read: "مقروء",
  replied: "تم الرد",
  in_progress: "قيد المعالجة",
  resolved: "محلول"
};

const statusLabelsEn: Record<string, string> = {
  new: "New",
  reviewing: "Reviewing",
  contacted: "Contacted",
  waiting_customer: "Waiting customer",
  proposal_sent: "Proposal sent",
  accepted: "Accepted",
  rejected: "Rejected",
  completed: "Completed",
  archived: "Archived",
  read: "Read",
  replied: "Replied",
  in_progress: "In progress",
  resolved: "Resolved"
};

const priorityLabelsAr: Record<string, string> = {
  low: "منخفضة",
  normal: "عادية",
  high: "عالية",
  urgent: "عاجلة"
};

const priorityLabelsEn: Record<string, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent"
};

const kindLabelsAr: Record<string, string> = {
  quote_request: "طلب مشروع",
  contact_message: "رسالة تواصل",
  support_request: "طلب دعم"
};

const kindLabelsEn: Record<string, string> = {
  quote_request: "Project request",
  contact_message: "Contact message",
  support_request: "Support request"
};

function formatNumber(value: unknown, locale: Locale) {
  const number = typeof value === "number" ? value : Number(value ?? 0);
  return new Intl.NumberFormat(locale === "ar" ? "ar" : "en").format(Number.isFinite(number) ? number : 0);
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
    timeStyle: "short"
  }).format(date);
}

function getStatusLabel(status: string | undefined, locale: Locale) {
  if (!status) {
    return "—";
  }
  return locale === "ar" ? statusLabelsAr[status] ?? status : statusLabelsEn[status] ?? status;
}

function getPriorityLabel(priority: string | null | undefined, locale: Locale) {
  if (!priority) {
    return null;
  }
  return locale === "ar" ? priorityLabelsAr[priority] ?? priority : priorityLabelsEn[priority] ?? priority;
}

function getKindLabel(kind: string | undefined, locale: Locale) {
  if (!kind) {
    return "—";
  }
  return locale === "ar" ? kindLabelsAr[kind] ?? kind : kindLabelsEn[kind] ?? kind;
}

function toneForStatus(status?: string): BadgeTone {
  if (["completed", "accepted", "resolved", "replied"].includes(status ?? "")) {
    return "success";
  }
  if (["waiting_customer", "proposal_sent", "in_progress", "reviewing"].includes(status ?? "")) {
    return "warning";
  }
  if (["rejected", "archived"].includes(status ?? "")) {
    return "danger";
  }
  return "primary";
}

function StatCard({ label, value, icon, tone = "primary" }: { label: string; value: unknown; icon: IconName; tone?: BadgeTone }) {
  return (
    <AppCard className="grid gap-3 p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-app-muted">{label}</span>
        <span className="grid size-10 place-items-center rounded-appMd border border-app-border bg-app-surfaceElevated text-app-primary">
          <AppIcon name={icon} size={18} />
        </span>
      </div>
      <div className="flex items-end justify-between gap-3">
        <strong className="text-3xl font-black tracking-tight text-app-foreground">{value}</strong>
        <AppBadge tone={tone}>{label}</AppBadge>
      </div>
    </AppCard>
  );
}

function ModuleCard({ module, locale }: { module: AdminCustomerModuleStatus; locale: Locale }) {
  const label = locale === "ar" ? module.label_ar : module.label_en;
  const description = locale === "ar" ? module.description_ar : module.description_en;
  const href = `/${locale}${module.target_path}`;

  return (
    <Link href={href} className="group block">
      <AppCard className="grid h-full gap-4 p-5 transition group-hover:-translate-y-0.5 group-hover:border-app-primary/40 group-hover:shadow-appGlow">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-appLg border border-app-border bg-app-surfaceElevated text-app-primary">
              <AppIcon name={(module.icon as IconName) || "messages"} size={19} />
            </span>
            <div className="grid gap-1">
              <h3 className="font-black text-app-foreground">{label}</h3>
              <p className="line-clamp-2 text-sm leading-6 text-app-muted">{description}</p>
            </div>
          </div>
          <AppBadge tone={module.tone}>{module.needs_attention ? (locale === "ar" ? "متابعة" : "Attention") : (locale === "ar" ? "مستقر" : "Stable")}</AppBadge>
        </div>
        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          {[
            [locale === "ar" ? "الإجمالي" : "Total", module.total],
            [locale === "ar" ? "جديد" : "New", module.new],
            [locale === "ar" ? "نشط" : "Active", module.active],
            [locale === "ar" ? "انتظار" : "Waiting", module.waiting],
            [locale === "ar" ? "منجز" : "Done", module.resolved]
          ].map(([itemLabel, itemValue]) => (
            <span key={itemLabel} className="rounded-appMd border border-app-border bg-app-surfaceElevated/60 p-2">
              <strong className="block text-base text-app-foreground">{formatNumber(itemValue, locale)}</strong>
              <span className="text-app-muted">{itemLabel}</span>
            </span>
          ))}
        </div>
      </AppCard>
    </Link>
  );
}

function LatestItemCard({ item, locale }: { item: AdminCustomerOverviewItem; locale: Locale }) {
  const href = `/${locale}${item.target_path}`;
  const priority = getPriorityLabel(item.priority, locale);

  return (
    <Link href={href} className="block rounded-appLg border border-app-border bg-app-surface p-4 transition hover:border-app-primary/40 hover:bg-app-surfaceElevated">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="grid gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <AppBadge tone="neutral">{getKindLabel(item.kind, locale)}</AppBadge>
            <AppBadge tone={toneForStatus(item.status)}>{getStatusLabel(item.status, locale)}</AppBadge>
            {priority ? <AppBadge tone={item.priority === "urgent" ? "danger" : item.priority === "high" ? "warning" : "neutral"}>{priority}</AppBadge> : null}
          </div>
          <strong className="text-sm font-black text-app-foreground">{item.full_name || "—"}</strong>
          <span className="line-clamp-1 text-sm text-app-muted">{item.subject || item.email || item.phone || "—"}</span>
        </div>
        <span className="text-xs font-semibold text-app-muted">{formatDate(item.created_at, locale)}</span>
      </div>
    </Link>
  );
}

export function AdminCustomersOverviewPage({ locale }: { locale: Locale }) {
  const { tokens } = useAdminAuth();
  const token = tokens?.access_token ?? "";
  const isAr = locale === "ar";

  const query = useQuery({
    queryKey: ["admin-customers-overview"],
    queryFn: () => getAdminCustomersOverview(token),
    enabled: Boolean(token)
  });

  if (query.isLoading) {
    return <AppLoadingState text={isAr ? "جاري تحميل ملخص الطلبات والعملاء..." : "Loading requests and customers overview..."} />;
  }

  if (query.isError || !query.data) {
    return <AppErrorState title={isAr ? "تعذر تحميل الطلبات والعملاء" : "Failed to load requests and customers"} description={isAr ? "تأكد أن الباكند يعمل وأن الجلسة صالحة." : "Make sure the backend is running and your session is valid."} />;
  }

  const data = query.data;
  const totals = data.totals;

  return (
    <section className="grid gap-6">
      <AppPageHeader
        eyebrow={isAr ? "الطلبات والعملاء" : "Requests & Customers"}
        title={isAr ? "مركز الطلبات والعملاء" : "Requests and Customers Center"}
        description={isAr ? "تابع طلبات المشاريع ورسائل التواصل وطلبات الدعم وآراء العملاء من مركز واحد، مع مؤشرات واضحة للأولوية والمتابعة." : "Follow project requests, contact messages, support tickets, and testimonials from one focused center."}
        actions={
          <Link href={`/${locale}/admin/quote-requests`} className="inline-flex min-h-11 items-center justify-center rounded-appMd bg-app-primary px-5 py-2 text-sm font-semibold text-app-primaryForeground shadow-appGlow transition hover:opacity-95">
            {isAr ? "فتح طلبات المشاريع" : "Open project requests"}
          </Link>
        }
      />

      {data.rules?.[isAr ? "ar" : "en"] ? (
        <AppCard className="flex items-start gap-3 border-app-primary/25 bg-app-primary/10 p-4 text-sm font-semibold leading-7 text-app-foreground">
          <AppIcon name="sparkles" className="mt-1 shrink-0 text-app-primary" size={18} />
          <span>{data.rules[isAr ? "ar" : "en"]}</span>
        </AppCard>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label={isAr ? "عملاء معروفون" : "Known customers"} value={formatNumber(totals.unique_customers, locale)} icon="users" tone="primary" />
        <StatCard label={isAr ? "طلبات مشاريع" : "Project requests"} value={formatNumber(totals.quote_requests, locale)} icon="file" tone="primary" />
        <StatCard label={isAr ? "رسائل ودعم مفتوحة" : "Open messages/support"} value={formatNumber(totals.open_items, locale)} icon="messages" tone={totals.open_items > 0 ? "warning" : "success"} />
        <StatCard label={isAr ? "عناصر عاجلة" : "Urgent items"} value={formatNumber(totals.urgent_items, locale)} icon="bell" tone={totals.urgent_items > 0 ? "danger" : "success"} />
      </div>

      {data.alerts?.length ? (
        <div className="grid gap-3">
          {data.alerts.map((alert) => (
            <Link key={alert.code} href={`/${locale}${alert.target_path}`} className={cn("flex items-center justify-between gap-3 rounded-appLg border p-4 text-sm font-bold transition hover:-translate-y-0.5", alert.tone === "danger" ? "border-app-danger/30 bg-app-danger/10 text-app-danger" : alert.tone === "warning" ? "border-app-warning/30 bg-app-warning/10 text-app-warning" : "border-app-primary/30 bg-app-primary/10 text-app-primary")}> 
              <span>{isAr ? alert.label_ar : alert.label_en}</span>
              <AppIcon name="next" size={16} />
            </Link>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        {(data.modules ?? []).map((module) => (
          <ModuleCard key={module.key} module={module} locale={locale} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <AppCard className="grid gap-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="grid gap-1">
              <h2 className="text-lg font-black text-app-foreground">{isAr ? "آخر الطلبات الواردة" : "Latest incoming items"}</h2>
              <p className="text-sm text-app-muted">{isAr ? "أحدث طلبات المشاريع والرسائل وطلبات الدعم." : "Latest project requests, messages, and support tickets."}</p>
            </div>
            <AppBadge tone="neutral">{formatNumber(data.latest_items?.length ?? 0, locale)}</AppBadge>
          </div>
          {data.latest_items?.length ? (
            <div className="grid gap-3">
              {data.latest_items.map((item) => <LatestItemCard key={`${item.kind}-${item.id}`} item={item} locale={locale} />)}
            </div>
          ) : (
            <AppEmptyState title={isAr ? "لا توجد طلبات بعد" : "No requests yet"} description={isAr ? "عندما يصل طلب من الموقع العام سيظهر هنا." : "Requests from the public website will appear here."} icon="messages" />
          )}
        </AppCard>

        <AppCard className="grid gap-4 p-5">
          <div className="grid gap-1">
            <h2 className="text-lg font-black text-app-foreground">{isAr ? "مواعيد المتابعة" : "Follow-up schedule"}</h2>
            <p className="text-sm text-app-muted">{isAr ? "طلبات المشاريع التي لها موعد متابعة محدد." : "Project requests with scheduled follow-ups."}</p>
          </div>
          {data.due_followups?.length ? (
            <div className="grid gap-3">
              {data.due_followups.map((item) => <LatestItemCard key={`follow-${item.id}`} item={{ ...item, kind: "quote_request", subject: item.phone ?? item.email }} locale={locale} />)}
            </div>
          ) : (
            <AppEmptyState title={isAr ? "لا توجد متابعات مجدولة" : "No scheduled follow-ups"} description={isAr ? "يمكن تحديد موعد متابعة من داخل طلب المشروع." : "You can set a follow-up date from inside a project request."} icon="bell" />
          )}
        </AppCard>
      </div>
    </section>
  );
}
