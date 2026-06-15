/**
 * =====================================================
 * AdminCommunicationTabs
 * تبويبات عملية لقسم الإشعارات والتواصل.
 * السايدبار يبقى للتنقل الرئيسي فقط، وهذه التبويبات للتفاصيل داخل القسم.
 * =====================================================
 */

import Link from "next/link";

import { AppIcon, type IconName } from "@/shared/design-system/components/AppIcon";
import { cn } from "@/shared/design-system/utils/cn";
import type { Locale } from "@/shared/design-system/utils/direction";

export type AdminCommunicationTabKey = "overview" | "notifications" | "email-templates";

type AdminCommunicationTabsProps = {
  locale: Locale;
  activeKey: AdminCommunicationTabKey;
};

type CommunicationTab = {
  key: AdminCommunicationTabKey;
  labelAr: string;
  labelEn: string;
  href: string;
  icon: IconName;
};

const communicationTabs: CommunicationTab[] = [
  {
    key: "overview",
    labelAr: "نظرة عامة",
    labelEn: "Overview",
    href: "/admin/communication",
    icon: "messages"
  },
  {
    key: "notifications",
    labelAr: "الإشعارات",
    labelEn: "Notifications",
    href: "/admin/notifications",
    icon: "bell"
  },
  {
    key: "email-templates",
    labelAr: "قوالب البريد",
    labelEn: "Email templates",
    href: "/admin/email-templates",
    icon: "email"
  }
];

export function AdminCommunicationTabs({ locale, activeKey }: AdminCommunicationTabsProps) {
  const isAr = locale === "ar";

  return (
    <nav
      aria-label={isAr ? "تبويبات الإشعارات والتواصل" : "Notifications and communication tabs"}
      className="rounded-appXl border border-app-border bg-app-surface/85 p-2 shadow-appCard backdrop-blur"
    >
      <div className="grid gap-2 md:grid-cols-3">
        {communicationTabs.map((tab) => {
          const isActive = tab.key === activeKey;
          const label = isAr ? tab.labelAr : tab.labelEn;

          return (
            <Link
              key={tab.key}
              href={`/${locale}${tab.href}`}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group inline-flex min-h-12 items-center justify-center gap-2 rounded-appLg border px-4 text-sm font-black transition duration-200",
                "focus:outline-none focus:ring-2 focus:ring-app-primary/30",
                isActive
                  ? "border-app-primary bg-app-primary text-app-primaryForeground shadow-appGlow"
                  : "border-app-border bg-app-surfaceElevated/70 text-app-muted hover:-translate-y-0.5 hover:border-app-primary/35 hover:bg-app-surface hover:text-app-foreground"
              )}
            >
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-appMd border transition",
                  isActive
                    ? "border-white/25 bg-white/15 text-app-primaryForeground"
                    : "border-app-border bg-app-surface text-app-primary group-hover:border-app-primary/30"
                )}
              >
                <AppIcon name={tab.icon} size={16} />
              </span>
              <span className="line-clamp-1">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
