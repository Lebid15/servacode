"use client";

/**
 * =====================================================
 * AdminDashboardShell
 * واجهة Dashboard لعرض بيانات الجلسة والثيم واللغة
 * =====================================================
 */

import { AppBadge } from "@/shared/design-system/components/AppBadge";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppPageHeader } from "@/shared/design-system/components/AppPageHeader";
import { useTheme, type ThemeName } from "@/shared/design-system/themes/theme-provider";
import { useAdminAuth } from "@/shared/auth/AdminAuthProvider";

type DashboardLabels = {
  title: string;
  description: string;
  welcome: string;
  foundationNotice: string;
  user: string;
  role: string;
  currentTheme: string;
  currentLanguage: string;
  quickStats: string;
  stats: {
    services: string;
    products: string;
    apps: string;
    quotes: string;
    messages: string;
    support: string;
  };
  themes: Record<ThemeName, string>;
};

type AdminDashboardShellProps = {
  locale: string;
  labels: DashboardLabels;
};

export function AdminDashboardShell({ locale, labels }: AdminDashboardShellProps) {
  const { user } = useAdminAuth();
  const { theme } = useTheme();

  const stats = [
    { label: labels.stats.services, value: "—" },
    { label: labels.stats.products, value: "—" },
    { label: labels.stats.apps, value: "—" },
    { label: labels.stats.quotes, value: "—" },
    { label: labels.stats.messages, value: "—" },
    { label: labels.stats.support, value: "—" }
  ];

  return (
    <div className="grid gap-8">
      <AppPageHeader title={labels.title} description={labels.description} />

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <AppCard className="grid gap-5 p-6">
          <div className="grid gap-2">
            <h2 className="text-2xl font-bold">{labels.welcome}</h2>
            <p className="text-app-muted">{labels.foundationNotice}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <AppBadge tone="primary">
              {labels.user}: {user?.username ?? "—"}
            </AppBadge>
            <AppBadge tone="neutral">
              {labels.currentLanguage}: {locale.toUpperCase()}
            </AppBadge>
            <AppBadge tone="success">
              {labels.currentTheme}: {labels.themes[theme]}
            </AppBadge>
          </div>
        </AppCard>

        <AppCard className="grid gap-4 p-6">
          <h3 className="text-xl font-bold">{labels.quickStats}</h3>
          <div className="grid gap-3">
            {stats.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-appMd border border-app-border bg-app-surfaceElevated px-4 py-3">
                <span className="text-app-muted">{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </AppCard>
      </div>
    </div>
  );
}
