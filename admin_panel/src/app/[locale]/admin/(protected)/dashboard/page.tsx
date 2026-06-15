/**
 * =====================================================
 * صفحة Dashboard متصلة بـ API
 * مع حماية كاملة من نقص مفاتيح الترجمة بعد تعديلات اللوحة
 * =====================================================
 */

import { AdminDashboardLive } from "@/shared/admin/components/AdminDashboardLive";
import { getDictionary } from "@/shared/design-system/i18n/get-dictionary";
import type { Locale } from "@/shared/design-system/utils/direction";

type DashboardPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

type DictionaryRecord = Record<string, unknown>;

function asRecord(value: unknown): DictionaryRecord {
  return value && typeof value === "object" ? (value as DictionaryRecord) : {};
}

function text(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function dashboardFallback(locale: Locale) {
  const isAr = locale === "ar";

  return {
    title: isAr ? "لوحة القيادة" : "Dashboard",
    description: isAr
      ? "نظرة عامة على حالة الموقع والطلبات والمحتوى."
      : "Overview of website status, requests, and content.",
    updatedAt: isAr ? "آخر تحديث" : "Last updated",
    empty: isAr ? "لا توجد بيانات حاليًا" : "No data available",
    noSubject: isAr ? "بدون عنوان" : "No subject",
    sections: {
      overview: isAr ? "نظرة عامة" : "Overview",
      siteStatus: isAr ? "حالة الموقع العام" : "Public site status",
      latestWork: isAr ? "آخر الطلبات" : "Latest requests",
      contentStatus: isAr ? "حالة المحتوى" : "Content status",
      quickActions: isAr ? "اختصارات سريعة" : "Quick actions",
      latestActivity: isAr ? "آخر نشاط" : "Latest activity",
      systemStatus: isAr ? "حالة النظام" : "System status",
      readiness: isAr ? "تنبيهات الجاهزية" : "Readiness alerts"
    },
    stats: {
      quotes: isAr ? "طلبات المشاريع" : "Project requests",
      quotesHint: isAr ? "طلبات جديدة تحتاج متابعة" : "New requests to follow up",
      messages: isAr ? "رسائل التواصل" : "Contact messages",
      messagesHint: isAr ? "رسائل غير مقروءة" : "Unread messages",
      support: isAr ? "طلبات الدعم" : "Support requests",
      supportHint: isAr ? "طلبات مفتوحة" : "Open requests",
      notifications: isAr ? "الإشعارات" : "Notifications",
      notificationsHint: isAr ? "إشعارات غير مقروءة" : "Unread notifications",
      services: isAr ? "الخدمات" : "Services",
      servicesHint: isAr ? "خدمات منشورة" : "Published services",
      products: isAr ? "الأنظمة" : "Systems",
      productsHint: isAr ? "أنظمة منشورة" : "Published systems",
      apps: isAr ? "التطبيقات" : "Apps",
      appsHint: isAr ? "تطبيقات منشورة" : "Published apps",
      portfolio: isAr ? "الأعمال" : "Portfolio",
      portfolioHint: isAr ? "أعمال منشورة" : "Published projects",
      blog: isAr ? "المقالات" : "Blog",
      blogHint: isAr ? "مقالات منشورة" : "Published posts",
      users: isAr ? "المستخدمون" : "Users",
      usersHint: isAr ? "حسابات فعالة" : "Active accounts",
      media: isAr ? "الوسائط" : "Media",
      mediaHint: isAr ? "ملفات مرفوعة" : "Uploaded files"
    },
    site: {
      publicSite: isAr ? "فتح الموقع" : "Open site",
      websiteStatus: isAr ? "حالة الموقع" : "Website status",
      websiteActive: isAr ? "نشط" : "Active",
      maintenance: isAr ? "الصيانة" : "Maintenance",
      maintenanceOn: isAr ? "وضع الصيانة مفعل" : "Maintenance enabled",
      maintenanceOff: isAr ? "وضع الصيانة متوقف" : "Maintenance disabled",
      defaultLanguage: isAr ? "اللغة الافتراضية" : "Default language",
      englishEnabled: isAr ? "الإنجليزية" : "English",
      activeTheme: isAr ? "الثيم الحالي" : "Active theme",
      logo: isAr ? "الشعار" : "Logo",
      favicon: isAr ? "الأيقونة" : "Favicon",
      contactChannels: isAr ? "قنوات التواصل" : "Contact channels",
      ready: isAr ? "جاهز" : "Ready",
      missing: isAr ? "ناقص" : "Missing",
      enabled: isAr ? "مفعل" : "Enabled",
      disabled: isAr ? "معطل" : "Disabled"
    },
    content: {
      total: isAr ? "الإجمالي" : "Total",
      visible: isAr ? "ظاهر" : "Visible",
      hidden: isAr ? "مخفي" : "Hidden",
      draft: isAr ? "مسودة" : "Draft",
      services: isAr ? "الخدمات" : "Services",
      apps: isAr ? "التطبيقات" : "Apps",
      products: isAr ? "الأنظمة" : "Systems",
      portfolio: isAr ? "الأعمال" : "Portfolio",
      static_pages: isAr ? "الصفحات الثابتة" : "Static pages",
      testimonials: isAr ? "آراء العملاء" : "Testimonials",
      faqs: isAr ? "الأسئلة الشائعة" : "FAQs",
      blog: isAr ? "المدونة" : "Blog",
      media: isAr ? "الوسائط" : "Media",
      email_templates: isAr ? "قوالب البريد" : "Email templates"
    },
    latest: {
      quotes: isAr ? "آخر طلبات المشاريع" : "Latest project requests",
      messages: isAr ? "آخر رسائل التواصل" : "Latest contact messages",
      support: isAr ? "آخر طلبات الدعم" : "Latest support requests",
      activity: isAr ? "آخر نشاط" : "Latest activity"
    },
    quickActions: {
      settings: isAr ? "تعديل هوية الشركة" : "Edit company identity",
      service: isAr ? "إدارة الخدمات" : "Manage services",
      app: isAr ? "إدارة التطبيقات" : "Manage apps",
      products: isAr ? "إدارة الأنظمة" : "Manage systems",
      portfolio: isAr ? "إدارة الأعمال" : "Manage portfolio",
      notification: isAr ? "إرسال إشعار" : "Send notification",
      media: isAr ? "مكتبة الوسائط" : "Media library",
      users: isAr ? "إدارة المستخدمين" : "Manage users"
    },
    alerts: {
      missing_logo: isAr ? "لم يتم رفع شعار الشركة" : "Company logo is missing",
      missing_favicon: isAr ? "لم يتم رفع أيقونة الموقع" : "Favicon is missing",
      missing_contact_channels: isAr ? "بيانات التواصل غير مكتملة" : "Contact channels are incomplete",
      maintenance_enabled: isAr ? "الموقع في وضع الصيانة" : "Website is in maintenance mode",
      no_services: isAr ? "لا توجد خدمات منشورة" : "No published services",
      no_products: isAr ? "لا توجد أنظمة منشورة" : "No published systems",
      no_faqs: isAr ? "لا توجد أسئلة شائعة مفعّلة" : "No active FAQs",
      missing_static_pages: isAr ? "الصفحات الثابتة غير مكتملة" : "Static pages are incomplete",
      missing_email_templates: isAr ? "قوالب البريد غير مجهزة" : "Email templates are missing",
      no_apps: isAr ? "لا توجد تطبيقات منشورة" : "No published apps",
      apps_need_manual_entry: isAr ? "أضف تطبيقاتك يدويًا عند توفر روابط التحميل" : "Add apps manually when download links are ready",
      no_portfolio: isAr ? "لا توجد أعمال منشورة" : "No published portfolio items",
      portfolio_need_real_examples: isAr ? "أضف أعمالًا حقيقية عند توفرها" : "Add real portfolio examples when available",
      no_blog_posts: isAr ? "لا توجد مقالات منشورة" : "No published blog posts",
      new_quote_requests: isAr ? "يوجد طلبات مشاريع جديدة" : "There are new project requests",
      unread_contact_messages: isAr ? "يوجد رسائل تواصل غير مقروءة" : "There are unread contact messages",
      open_support_requests: isAr ? "يوجد طلبات دعم مفتوحة" : "There are open support requests"
    },
    system: {
      api: isAr ? "API" : "API",
      database: isAr ? "قاعدة البيانات" : "Database",
      storage: isAr ? "التخزين" : "Storage",
      environment: isAr ? "البيئة" : "Environment",
      debug: isAr ? "Debug" : "Debug",
      emailNotifications: isAr ? "إشعارات البريد" : "Email notifications",
      mediaFiles: isAr ? "ملفات الوسائط" : "Media files",
      emailTemplates: isAr ? "قوالب البريد" : "Email templates",
      online: isAr ? "متصل" : "Online",
      connected: isAr ? "متصل" : "Connected",
      available: isAr ? "متاح" : "Available",
      unavailable: isAr ? "غير متاح" : "Unavailable",
      enabled: isAr ? "مفعل" : "Enabled",
      disabled: isAr ? "معطل" : "Disabled"
    }
  };
}

function mergeSection<T extends DictionaryRecord>(fallback: T, source: unknown): T {
  return {
    ...fallback,
    ...asRecord(source)
  } as T;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);

  const fallback = dashboardFallback(locale);
  const admin = asRecord(dict.admin);
  const dashboardSource = asRecord(admin.dashboard);
  const table = asRecord(dict.table);
  const actions = asRecord(dict.actions);

  const dashboard = {
    ...fallback,
    ...dashboardSource,
    sections: mergeSection(fallback.sections, dashboardSource.sections),
    stats: mergeSection(fallback.stats, dashboardSource.stats),
    site: mergeSection(fallback.site, dashboardSource.site),
    content: mergeSection(fallback.content, dashboardSource.content),
    latest: mergeSection(fallback.latest, dashboardSource.latest),
    quickActions: mergeSection(fallback.quickActions, dashboardSource.quickActions),
    alerts: mergeSection(fallback.alerts, dashboardSource.alerts),
    system: mergeSection(fallback.system, dashboardSource.system)
  };

  return (
    <div className="grid gap-6">
      <AdminDashboardLive
        locale={locale}
        labels={{
          loading: text(table.loading, locale === "ar" ? "جاري التحميل..." : "Loading..."),
          error: text(table.unknown, locale === "ar" ? "غير معروف" : "Unknown"),
          view: text(actions.view, locale === "ar" ? "عرض" : "View"),
          refresh: text(actions.refresh, locale === "ar" ? "تحديث" : "Refresh"),
          updatedAt: dashboard.updatedAt,
          empty: dashboard.empty,
          noSubject: dashboard.noSubject,
          sections: dashboard.sections,
          stats: dashboard.stats,
          site: dashboard.site,
          content: dashboard.content,
          latest: dashboard.latest,
          quickActions: [
            {
              key: "settings",
              label: dashboard.quickActions.settings,
              href: "/admin/settings/identity",
              icon: "settings"
            },
            {
              key: "service",
              label: dashboard.quickActions.service,
              href: "/admin/services",
              icon: "services"
            },
            {
              key: "app",
              label: dashboard.quickActions.app,
              href: "/admin/apps",
              icon: "apps"
            },
            {
              key: "products",
              label: dashboard.quickActions.products,
              href: "/admin/products",
              icon: "products"
            },
            {
              key: "portfolio",
              label: dashboard.quickActions.portfolio,
              href: "/admin/portfolio",
              icon: "portfolio"
            },
            {
              key: "media",
              label: dashboard.quickActions.media,
              href: "/admin/media",
              icon: "media"
            },
            {
              key: "users",
              label: dashboard.quickActions.users,
              href: "/admin/users",
              icon: "users"
            }
          ],
          alerts: dashboard.alerts,
          system: dashboard.system
        }}
      />
    </div>
  );
}
