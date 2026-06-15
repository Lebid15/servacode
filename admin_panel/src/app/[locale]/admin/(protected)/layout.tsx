/**
 * =====================================================
 * Protected Admin Layout
 * يحمي كل صفحات الأدمن ما عدا صفحة تسجيل الدخول
 * =====================================================
 */

export const dynamic = "force-dynamic";

import { AdminAuthGuard } from "@/shared/auth/AdminAuthGuard";
import { AdminShell } from "@/shared/design-system/layout/AdminShell";
import { getDictionary } from "@/shared/design-system/i18n/get-dictionary";
import type { Locale } from "@/shared/design-system/utils/direction";

type AdminProtectedLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

type AdminShellDictionaryExtras = {
  navGroups?: {
    content?: string;
    customers?: string;
    communication?: string;
    library?: string;
    administration?: string;
    settings?: string;
  };
  shell?: {
    navigation?: string;
    menu?: string;
    closeMenu?: string;
    superAdmin?: string;
  };
};

function getNavGroups(locale: Locale, extras: AdminShellDictionaryExtras) {
  const fallback = locale === "ar"
    ? {
        content: "إدارة المحتوى",
        customers: "الطلبات والعملاء",
        communication: "الإشعارات والتواصل",
        library: "المكتبة",
        administration: "الإدارة",
        settings: "الإعدادات"
      }
    : {
        content: "Content Management",
        customers: "Requests & Customers",
        communication: "Notifications & Communication",
        library: "Library",
        administration: "Administration",
        settings: "Settings"
      };

  return {
    content: extras.navGroups?.content ?? fallback.content,
    customers: extras.navGroups?.customers ?? fallback.customers,
    communication: extras.navGroups?.communication ?? fallback.communication,
    library: extras.navGroups?.library ?? fallback.library,
    administration: extras.navGroups?.administration ?? fallback.administration,
    settings: extras.navGroups?.settings ?? fallback.settings
  };
}

export default async function AdminProtectedLayout({
  children,
  params
}: AdminProtectedLayoutProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const adminExtras = dict.admin as typeof dict.admin & AdminShellDictionaryExtras;
  const navGroups = getNavGroups(locale, adminExtras);
  const settingsLabels = dict.adminSettingsPage;

  const contentTabItems = [
    { href: `/${locale}/admin/services`, label: dict.admin.nav.services, icon: "services" as const },
    { href: `/${locale}/admin/apps`, label: dict.admin.nav.apps, icon: "apps" as const },
    { href: `/${locale}/admin/products`, label: dict.admin.nav.products, icon: "products" as const },
    { href: `/${locale}/admin/portfolio`, label: dict.admin.nav.portfolio, icon: "portfolio" as const },
    { href: `/${locale}/admin/static-pages`, label: dict.admin.nav.staticPages, icon: "pages" as const },
    { href: `/${locale}/admin/faqs`, label: dict.admin.nav.faq, icon: "faq" as const },
    { href: `/${locale}/admin/media`, label: dict.admin.nav.media, icon: "media" as const }
  ];

  const customersTabItems = [
    { href: `/${locale}/admin/customers`, label: locale === "ar" ? "نظرة عامة" : "Overview", icon: "dashboard" as const },
    { href: `/${locale}/admin/quote-requests`, label: dict.admin.nav.quotes, icon: "messages" as const },
    { href: `/${locale}/admin/contact-messages`, label: dict.admin.nav.messages, icon: "email" as const },
    { href: `/${locale}/admin/support-requests`, label: dict.admin.nav.supportRequests, icon: "support" as const },
    { href: `/${locale}/admin/testimonials`, label: dict.admin.nav.testimonials, icon: "testimonials" as const }
  ];

  const communicationTabItems = [
    { href: `/${locale}/admin/notifications`, label: dict.admin.nav.notifications, icon: "bell" as const },
    { href: `/${locale}/admin/email-templates`, label: dict.admin.nav.emailTemplates, icon: "email" as const }
  ];

  const administrationTabItems = [
    { href: `/${locale}/admin/users`, label: dict.admin.nav.users, icon: "users" as const },
    { href: `/${locale}/admin/roles`, label: dict.admin.nav.roles, icon: "roles" as const },
    { href: `/${locale}/admin/audit-logs`, label: dict.admin.nav.auditLogs, icon: "audit" as const },
    { href: `/${locale}/admin/analytics`, label: dict.admin.nav.analytics, icon: "analytics" as const }
  ];

  const settingsTabItems = [
    { href: `/${locale}/admin/settings`, label: locale === "ar" ? "نظرة عامة" : "Overview", icon: "dashboard" as const },
    { href: `/${locale}/admin/settings/identity`, label: settingsLabels.tabIdentity, icon: "settings" as const },
    { href: `/${locale}/admin/settings/contact`, label: settingsLabels.tabContact, icon: "email" as const },
    { href: `/${locale}/admin/settings/social`, label: settingsLabels.tabSocial, icon: "link" as const },
    { href: `/${locale}/admin/settings/seo`, label: settingsLabels.tabSeo, icon: "analytics" as const },
    { href: `/${locale}/admin/settings/appearance`, label: settingsLabels.tabAppearance, icon: "sun" as const },
    { href: `/${locale}/admin/settings/maintenance`, label: settingsLabels.tabMaintenance, icon: "support" as const },
    { href: `/${locale}/admin/ai`, label: locale === "ar" ? "الذكاء الاصطناعي" : "AI Assistant", icon: "sparkles" as const }
  ];

  const navSections = [
    {
      key: "main",
      items: [
        { href: `/${locale}/admin/dashboard`, label: dict.admin.nav.dashboard, icon: "dashboard" as const },
        {
          href: `/${locale}/admin/content`,
          label: navGroups.content,
          icon: "services" as const,
          matchHrefs: [`/${locale}/admin/content`, ...contentTabItems.map((item) => item.href)]
        },
        {
          href: `/${locale}/admin/customers`,
          label: navGroups.customers,
          icon: "messages" as const,
          matchHrefs: [`/${locale}/admin/customers`, ...customersTabItems.map((item) => item.href)]
        },
        {
          href: `/${locale}/admin/communication`,
          label: navGroups.communication,
          icon: "bell" as const,
          matchHrefs: communicationTabItems.map((item) => item.href)
        },
        {
          href: `/${locale}/admin/administration`,
          label: navGroups.administration,
          icon: "roles" as const,
          matchHrefs: administrationTabItems.map((item) => item.href)
        },
        {
          href: `/${locale}/admin/settings`,
          label: navGroups.settings,
          icon: "settings" as const,
          matchHrefs: [`/${locale}/admin/settings`, ...settingsTabItems.map((item) => item.href)]
        }
      ]
    }
  ];

  const tabGroups = [
    {
      key: "content",
      label: navGroups.content,
      description: locale === "ar"
        ? "إدارة الخدمات والتطبيقات والأنظمة والأعمال والصفحات والوسائط من مكان واحد."
        : "Manage services, apps, systems, portfolio, pages, FAQs, and media from one place.",
      baseHref: `/${locale}/admin/content`,
      items: contentTabItems
    },
    {
      key: "customers",
      label: navGroups.customers,
      description: locale === "ar"
        ? "متابعة طلبات المشاريع ورسائل التواصل والدعم وآراء العملاء."
        : "Follow project requests, contact messages, support tickets, and testimonials.",
      baseHref: `/${locale}/admin/customers`,
      items: customersTabItems
    },
    {
      key: "communication",
      label: navGroups.communication,
      description: locale === "ar"
        ? "إدارة الإشعارات وقوالب البريد من مكان واحد."
        : "Manage notifications and email templates from one place.",
      baseHref: `/${locale}/admin/communication`,
      items: communicationTabItems
    },
    {
      key: "administration",
      label: navGroups.administration,
      description: locale === "ar"
        ? "إدارة المستخدمين والصلاحيات والمراقبة والتحليلات."
        : "Manage users, permissions, monitoring, and analytics.",
      baseHref: `/${locale}/admin/administration`,
      items: administrationTabItems
    },
    {
      key: "settings",
      label: navGroups.settings,
      description: locale === "ar"
        ? "إعدادات هوية الموقع والمظهر والصيانة والذكاء الاصطناعي."
        : "Configure company identity, appearance, maintenance, and AI assistant.",
      baseHref: `/${locale}/admin/settings`,
      items: settingsTabItems
    }
  ];

  return (
    <AdminAuthGuard locale={locale} loadingText={dict.auth.sessionLoading}>
      <AdminShell
        locale={locale}
        navSections={navSections}
        tabGroups={tabGroups}
        labels={{
          brand: dict.admin.brand,
          panel: dict.admin.panel,
          logout: dict.actions.logout,
          openWebsite: dict.actions.openWebsite,
          switchLanguage: dict.actions.switchLanguage,
          switchTheme: dict.actions.switchTheme,
          user: dict.admin.user,
          navigation: adminExtras.shell?.navigation,
          menu: adminExtras.shell?.menu,
          closeMenu: adminExtras.shell?.closeMenu,
          profile: adminExtras.shell?.superAdmin ?? (locale === "ar" ? "مدير المنصة" : "Super Admin"),
          themes: dict.themes
        }}
      >
        {children}
      </AdminShell>
    </AdminAuthGuard>
  );
}
