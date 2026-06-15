"use client";

/**
 * =====================================================
 * AdminAdministrationOverviewPage
 * مركز الإدارة: إدارة الوصول والصلاحيات وسجل التدقيق من مكان واحد.
 * =====================================================
 */

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import {
  getAdminAdministrationOverview,
  type AdminAdministrationModuleStatus,
  type AdminAdministrationRoleStatus,
  type AdminDashboardItem,
} from "@/shared/api/admin-client";
import { useAdminAuth } from "@/shared/auth/AdminAuthProvider";
import { AppBadge, type BadgeTone } from "@/shared/design-system/components/AppBadge";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppEmptyState } from "@/shared/design-system/components/AppEmptyState";
import { AppErrorState } from "@/shared/design-system/components/AppErrorState";
import { AppIcon, type IconName } from "@/shared/design-system/components/AppIcon";
import { AppLoadingState } from "@/shared/design-system/components/AppLoadingState";
import { AppPageHeader } from "@/shared/design-system/components/AppPageHeader";
import type { Locale } from "@/shared/design-system/utils/direction";

function formatNumber(value: unknown, locale: Locale) {
  const number = typeof value === "number" ? value : Number(value ?? 0);
  return new Intl.NumberFormat(locale === "ar" ? "ar" : "en").format(Number.isFinite(number) ? number : 0);
}

function formatDate(value: unknown, locale: Locale) {
  if (!value || typeof value !== "string") return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function labelForRole(role: AdminAdministrationRoleStatus, locale: Locale) {
  return locale === "ar" ? role.display_name_ar || role.name : role.display_name_en || role.name;
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
      <strong className="text-3xl font-black tracking-tight text-app-foreground">{value}</strong>
      <AppBadge tone={tone} className="w-fit">{label}</AppBadge>
    </AppCard>
  );
}

function ModuleCard({ module, locale }: { module: AdminAdministrationModuleStatus; locale: Locale }) {
  const isAr = locale === "ar";
  const href = `/${locale}${module.target_path}`;
  const label = isAr ? module.label_ar : module.label_en;
  const description = isAr ? module.description_ar : module.description_en;

  return (
    <Link href={href} className="group block">
      <AppCard className="grid h-full gap-4 p-5 transition group-hover:-translate-y-0.5 group-hover:border-app-primary/40 group-hover:shadow-appGlow">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-appLg border border-app-border bg-app-surfaceElevated text-app-primary">
              <AppIcon name={(module.icon as IconName) || "settings"} size={19} />
            </span>
            <div className="grid gap-1">
              <h3 className="font-black text-app-foreground">{label}</h3>
              <p className="line-clamp-2 text-sm leading-6 text-app-muted">{description}</p>
            </div>
          </div>
          <AppBadge tone={module.tone}>{module.attention > 0 ? (isAr ? "متابعة" : "Attention") : (isAr ? "مستقر" : "Stable")}</AppBadge>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          {[
            [isAr ? "الإجمالي" : "Total", module.total],
            [isAr ? "نشط" : "Active", module.active],
            [isAr ? "متابعة" : "Attention", module.attention],
          ].map(([itemLabel, itemValue]) => (
            <span key={String(itemLabel)} className="rounded-appMd border border-app-border bg-app-surfaceElevated/60 p-2">
              <strong className="block text-base text-app-foreground">{formatNumber(itemValue, locale)}</strong>
              <span className="text-app-muted">{itemLabel}</span>
            </span>
          ))}
        </div>
      </AppCard>
    </Link>
  );
}

function RoleCard({ role, locale }: { role: AdminAdministrationRoleStatus; locale: Locale }) {
  const isAr = locale === "ar";
  return (
    <Link href={`/${locale}${role.target_path}`} className="block rounded-appLg border border-app-border bg-app-surface p-4 transition hover:border-app-primary/40 hover:bg-app-surfaceElevated">
      <div className="flex items-start justify-between gap-3">
        <div className="grid gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <strong className="text-sm font-black text-app-foreground">{labelForRole(role, locale)}</strong>
            <AppBadge tone={role.is_system ? "primary" : "neutral"}>{role.is_system ? (isAr ? "نظامي" : "System") : (isAr ? "مخصص" : "Custom")}</AppBadge>
          </div>
          <span className="text-xs font-semibold text-app-muted">{role.name}</span>
        </div>
        <div className="flex flex-wrap justify-end gap-2 text-xs">
          <AppBadge tone="neutral">{isAr ? "مستخدمون" : "Users"}: {formatNumber(role.users_count, locale)}</AppBadge>
          <AppBadge tone="success">{isAr ? "صلاحيات" : "Permissions"}: {formatNumber(role.permissions_count, locale)}</AppBadge>
        </div>
      </div>
    </Link>
  );
}

function ActivityCard({ item, locale }: { item: AdminDashboardItem; locale: Locale }) {
  const action = typeof item.action === "string" ? item.action : "—";
  const entity = typeof item.entity_type === "string" ? item.entity_type : "—";
  const description = typeof item.description === "string" ? item.description : "—";
  return (
    <div className="rounded-appLg border border-app-border bg-app-surface p-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="grid gap-1">
          <div className="flex flex-wrap gap-2">
            <AppBadge tone="primary">{action}</AppBadge>
            <AppBadge tone="neutral">{entity}</AppBadge>
          </div>
          <p className="text-sm leading-6 text-app-muted">{description}</p>
        </div>
        <span className="shrink-0 text-xs font-semibold text-app-muted">{formatDate(item.created_at, locale)}</span>
      </div>
    </div>
  );
}

export function AdminAdministrationOverviewPage({ locale }: { locale: Locale }) {
  const { tokens } = useAdminAuth();
  const token = tokens?.access_token ?? "";
  const isAr = locale === "ar";

  const query = useQuery({
    queryKey: ["admin-administration-overview"],
    queryFn: () => getAdminAdministrationOverview(token),
    enabled: Boolean(token),
  });

  if (query.isLoading) {
    return <AppLoadingState text={isAr ? "جاري تحميل مركز الإدارة..." : "Loading administration center..."} />;
  }

  if (query.isError || !query.data) {
    return <AppErrorState title={isAr ? "تعذر تحميل مركز الإدارة" : "Failed to load administration center"} description={isAr ? "تأكد أن الباكند يعمل وأن الجلسة صالحة." : "Make sure the backend is running and your session is valid."} />;
  }

  const data = query.data;
  const totals = data.totals;

  return (
    <section className="grid gap-6">
      <AppPageHeader
        eyebrow={isAr ? "الإدارة" : "Administration"}
        title={isAr ? "مركز الإدارة والصلاحيات" : "Administration & Access Center"}
        description={isAr ? "إدارة المستخدمين، الأدوار، الصلاحيات، القفل الأمني، وسجل التدقيق من مركز واحد واضح." : "Manage users, roles, permissions, account locks, and audit trails from one clear center."}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href={`/${locale}/admin/users`} className="inline-flex min-h-11 items-center justify-center rounded-appMd bg-app-primary px-5 py-2 text-sm font-semibold text-app-primaryForeground shadow-appGlow transition hover:opacity-95">
              {isAr ? "إدارة المستخدمين" : "Manage users"}
            </Link>
            <Link href={`/${locale}/admin/roles`} className="inline-flex min-h-11 items-center justify-center rounded-appMd border border-app-border bg-app-surface px-5 py-2 text-sm font-semibold text-app-foreground transition hover:border-app-primary/40">
              {isAr ? "الأدوار والصلاحيات" : "Roles & permissions"}
            </Link>
          </div>
        }
      />

      {data.rules?.[isAr ? "ar" : "en"] ? (
        <AppCard className="flex items-start gap-3 border-app-primary/25 bg-app-primary/10 p-4 text-sm font-semibold leading-7 text-app-foreground">
          <AppIcon name="lock" className="mt-1 shrink-0 text-app-primary" size={18} />
          <span>{data.rules[isAr ? "ar" : "en"]}</span>
        </AppCard>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label={isAr ? "المستخدمون" : "Users"} value={formatNumber(totals.users, locale)} icon="users" tone="primary" />
        <StatCard label={isAr ? "نشطون" : "Active"} value={formatNumber(totals.active_users, locale)} icon="check" tone="success" />
        <StatCard label={isAr ? "الأدوار" : "Roles"} value={formatNumber(totals.roles, locale)} icon="roles" tone="primary" />
        <StatCard label={isAr ? "سجلات التدقيق" : "Audit logs"} value={formatNumber(totals.audit_logs, locale)} icon="audit" tone="neutral" />
        <StatCard label={isAr ? "مدراء المنصة" : "Super admins"} value={formatNumber(totals.superusers, locale)} icon="lock" tone="success" />
        <StatCard label={isAr ? "حسابات مقفلة" : "Locked accounts"} value={formatNumber(totals.locked_users, locale)} icon="lock" tone={totals.locked_users > 0 ? "warning" : "success"} />
        <StatCard label={isAr ? "صلاحيات متاحة" : "Permissions"} value={formatNumber(totals.permissions, locale)} icon="settings" tone="primary" />
        <StatCard label={isAr ? "فشل دخول / أسبوع" : "Failed login / week"} value={formatNumber(totals.failed_logins_week, locale)} icon="audit" tone={totals.failed_logins_week > 0 ? "warning" : "success"} />
      </div>

      {data.alerts?.length ? (
        <div className="grid gap-3">
          {data.alerts.map((alert) => (
            <Link key={alert.code} href={`/${locale}${alert.target_path}`} className="flex items-start gap-3 rounded-appLg border border-app-border bg-app-surface p-4 transition hover:border-app-primary/40 hover:bg-app-surfaceElevated">
              <AppBadge tone={alert.tone}>{isAr ? "تنبيه" : "Alert"}</AppBadge>
              <span className="text-sm font-semibold leading-7 text-app-foreground">{isAr ? alert.label_ar : alert.label_en}</span>
            </Link>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-4">
        {data.modules.map((module) => (
          <ModuleCard key={module.key} module={module} locale={locale} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <AppCard className="grid gap-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="grid gap-1">
              <h2 className="text-lg font-black text-app-foreground">{isAr ? "الأدوار الحالية" : "Current roles"}</h2>
              <p className="text-sm leading-6 text-app-muted">{isAr ? "راجع توزيع الأدوار والصلاحيات وعدد المستخدمين بكل دور." : "Review role distribution, permissions, and assigned users."}</p>
            </div>
            <Link href={`/${locale}/admin/roles`} className="text-sm font-black text-app-primary">{isAr ? "إدارة" : "Manage"}</Link>
          </div>
          {data.roles?.length ? (
            <div className="grid gap-3">
              {data.roles.slice(0, 6).map((role) => (
                <RoleCard key={role.id} role={role} locale={locale} />
              ))}
            </div>
          ) : (
            <AppEmptyState title={isAr ? "لا توجد أدوار" : "No roles"} description={isAr ? "جهّز الأدوار الافتراضية من صفحة الأدوار." : "Ensure default roles from the roles page."} />
          )}
        </AppCard>

        <AppCard className="grid gap-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="grid gap-1">
              <h2 className="text-lg font-black text-app-foreground">{isAr ? "آخر نشاط إداري" : "Latest administration activity"}</h2>
              <p className="text-sm leading-6 text-app-muted">{isAr ? "آخر العمليات الحساسة التي تمت داخل لوحة التحكم." : "Latest sensitive operations recorded in the admin panel."}</p>
            </div>
            <Link href={`/${locale}/admin/audit-logs`} className="text-sm font-black text-app-primary">{isAr ? "فتح السجل" : "Open logs"}</Link>
          </div>
          {data.latest_activity?.length ? (
            <div className="grid gap-3">
              {data.latest_activity.slice(0, 6).map((item) => (
                <ActivityCard key={String(item.id)} item={item} locale={locale} />
              ))}
            </div>
          ) : (
            <AppEmptyState title={isAr ? "لا يوجد نشاط" : "No activity"} description={isAr ? "ستظهر عمليات الإدارة هنا عند تنفيذها." : "Administration actions will appear here once recorded."} />
          )}
        </AppCard>
      </div>
    </section>
  );
}
