/**
 * =====================================================
 * AdminCustomerTabs
 * تبويبات عملية لقسم الطلبات والعملاء.
 * الهدف: عدم استخدام صفحة شرح وسيطة، والتنقل مباشرة بين الأقسام الفعلية.
 * =====================================================
 */

import Link from "next/link";

import { AppIcon, type IconName } from "@/shared/design-system/components/AppIcon";
import { cn } from "@/shared/design-system/utils/cn";
import type { Locale } from "@/shared/design-system/utils/direction";

export type AdminCustomerTabKey =
  | "customers"
  | "quote-requests"
  | "contact-messages"
  | "support-requests"
  | "testimonials";

type AdminCustomerTabsProps = {
  locale: Locale;
  activeKey: AdminCustomerTabKey;
};

type CustomerTab = {
  key: AdminCustomerTabKey;
  labelAr: string;
  labelEn: string;
  href: string;
  icon: IconName;
};

const customerTabs: CustomerTab[] = [
  {
    key: "customers",
    labelAr: "نظرة عامة",
    labelEn: "Overview",
    href: "/admin/customers",
    icon: "dashboard"
  },
  {
    key: "quote-requests",
    labelAr: "طلبات المشاريع",
    labelEn: "Project requests",
    href: "/admin/quote-requests",
    icon: "file"
  },
  {
    key: "contact-messages",
    labelAr: "رسائل التواصل",
    labelEn: "Contact messages",
    href: "/admin/contact-messages",
    icon: "messages"
  },
  {
    key: "support-requests",
    labelAr: "طلبات الدعم",
    labelEn: "Support requests",
    href: "/admin/support-requests",
    icon: "support"
  },
  {
    key: "testimonials",
    labelAr: "آراء العملاء",
    labelEn: "Testimonials",
    href: "/admin/testimonials",
    icon: "testimonials"
  }
];

export function AdminCustomerTabs({ locale, activeKey }: AdminCustomerTabsProps) {
  const isAr = locale === "ar";

  return (
    <nav
      aria-label={isAr ? "تبويبات الطلبات والعملاء" : "Requests and customers tabs"}
      className="rounded-appXl border border-app-border bg-app-surface/85 p-2 shadow-appCard backdrop-blur"
    >
      <div className="grid gap-2 md:grid-cols-5">
        {customerTabs.map((tab) => {
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
