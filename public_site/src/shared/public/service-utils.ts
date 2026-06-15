/**
 * =====================================================
 * service-utils
 * أدوات عرض خدمات الموقع العام.
 *
 * ملاحظة مهمة:
 * هذا الملف لا يرسل طلبات API. طلبات API تبقى مركزية داخل:
 * shared/api/public-client.ts
 * =====================================================
 */

import type { PublicService } from "@/shared/api/public-client";
import type { AppIconName } from "@/shared/design-system/components/AppIcon";
import type { Locale } from "@/shared/design-system/utils/direction";
import { pickLocalized, pickSlug } from "@/shared/public/public-utils";

export type ServiceFeatureView = {
  title: string;
  description?: string;
};

export type ServiceCardView = {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  href: string;
  icon: AppIconName;
  imageUrl?: string | null;
  features: ServiceFeatureView[];
};

const SERVICE_ICON_NAMES = new Set<AppIconName>([
  "apps",
  "cable",
  "code",
  "dashboard",
  "database",
  "gauge",
  "globe",
  "layers",
  "monitor",
  "network",
  "panels",
  "server",
  "settings",
  "shield",
  "support",
  "workflow",
  "zap",
]);

export function normalizeServiceIcon(icon?: string | null): AppIconName {
  if (!icon) return "server";
  return SERVICE_ICON_NAMES.has(icon as AppIconName) ? (icon as AppIconName) : "server";
}

function isServiceIconImage(value?: string | null): value is string {
  if (!value) return false;
  const normalized = value.trim();
  return (
    normalized.startsWith("http://") ||
    normalized.startsWith("https://") ||
    normalized.startsWith("/") ||
    normalized.startsWith("uploads/") ||
    normalized.startsWith("media/") ||
    normalized.startsWith("blob:") ||
    normalized.startsWith("data:image/")
  );
}

function buildServiceHref(locale: Locale, slug: string) {
  return `/${locale}/services/${slug}`;
}

function normalizeServiceFeatures(locale: Locale, service: PublicService): ServiceFeatureView[] {
  return (service.features ?? [])
    .filter((feature) => feature.is_active !== false)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((feature) => ({
      title: pickLocalized(locale, feature.title_ar, feature.title_en),
      description: pickLocalized(locale, feature.description_ar, feature.description_en),
    }))
    .filter((feature) => Boolean(feature.title));
}

export function publicServiceToCardView(locale: Locale, service: PublicService): ServiceCardView {
  const slug = pickSlug(locale, service.slug_ar, service.slug_en) || service.slug_en || service.slug_ar || service.id;
  const description = pickLocalized(locale, service.description_ar, service.description_en);
  const fullDescription = pickLocalized(
    locale,
    service.full_description_ar || service.description_ar,
    service.full_description_en || service.description_en,
  );

  return {
    id: service.id,
    title: pickLocalized(locale, service.title_ar, service.title_en),
    description,
    fullDescription: fullDescription || description,
    href: buildServiceHref(locale, slug),
    icon: normalizeServiceIcon(service.icon),
    imageUrl: service.image_url || (isServiceIconImage(service.icon) ? service.icon : null),
    features: normalizeServiceFeatures(locale, service),
  };
}

type FallbackService = {
  id: string;
  slug: string;
  icon: AppIconName;
  ar: {
    title: string;
    description: string;
    fullDescription: string;
    features: ServiceFeatureView[];
  };
  en: {
    title: string;
    description: string;
    fullDescription: string;
    features: ServiceFeatureView[];
  };
};

const FALLBACK_SERVICES: FallbackService[] = [
  {
    id: "web-development",
    slug: "web-development",
    icon: "globe",
    ar: {
      title: "تطوير مواقع الويب",
      description: "مواقع احترافية للشركات والبراندات بواجهة حديثة وتجربة استخدام واضحة.",
      fullDescription:
        "نطوّر مواقع ويب تعريفية وتسويقية ومتعددة اللغات تساعد شركتك على تقديم خدماتها بوضوح، مع بنية قابلة للإدارة والتحسين والنمو.",
      features: [
        { title: "تصميم متجاوب لكل الشاشات", description: "تجربة مريحة على الهاتف والتابلت والديسكتوب." },
        { title: "دعم عربي وإنكليزي", description: "جاهزية للاتجاهين RTL و LTR حسب الحاجة." },
        { title: "تهيئة أساسية لمحركات البحث", description: "عناوين ووصف وهيكلة مناسبة للظهور." },
        { title: "ربط بلوحة تحكم", description: "إمكانية تعديل المحتوى بدون الرجوع للكود." },
      ],
    },
    en: {
      title: "Website Development",
      description: "Professional websites for companies and brands with clean UX and modern presentation.",
      fullDescription:
        "We build corporate, marketing, and multilingual websites that present your services clearly, with a maintainable structure ready for growth and content management.",
      features: [
        { title: "Responsive experience", description: "Optimized for mobile, tablet, and desktop." },
        { title: "Arabic and English ready", description: "RTL and LTR support when needed." },
        { title: "SEO-ready structure", description: "Clean titles, descriptions, and page structure." },
        { title: "Admin-managed content", description: "Update website content without touching code." },
      ],
    },
  },
  {
    id: "web-apps",
    slug: "web-apps",
    icon: "apps",
    ar: {
      title: "تطوير تطبيقات الويب",
      description: "تطبيقات تفاعلية تعمل من المتصفح لإدارة العمليات والخدمات الرقمية.",
      fullDescription:
        "نحوّل الأفكار إلى تطبيقات ويب عملية تعمل من المتصفح، مثل منصات الخدمات، أدوات الأعمال، أنظمة الحجز، ولوحات العمليات اليومية.",
      features: [
        { title: "واجهة تفاعلية وسريعة", description: "تجربة استخدام مناسبة للمهام اليومية." },
        { title: "حسابات وصلاحيات", description: "مستخدمون، أدوار، وحماية حسب طبيعة المشروع." },
        { title: "ربط مع API وقواعد بيانات", description: "بنية عملية للبيانات والعمليات." },
        { title: "قابلية توسع", description: "إضافة ميزات لاحقًا دون إعادة بناء كاملة." },
      ],
    },
    en: {
      title: "Web App Development",
      description: "Interactive browser-based applications for operations, services, and digital workflows.",
      fullDescription:
        "We turn ideas into practical web applications such as service platforms, business tools, booking systems, and internal workflow apps.",
      features: [
        { title: "Interactive interface", description: "A smooth experience for daily tasks." },
        { title: "Users and permissions", description: "Roles, accounts, and access control." },
        { title: "API and database integration", description: "Reliable structure for data and workflows." },
        { title: "Scalable foundation", description: "Add features later without rebuilding from zero." },
      ],
    },
  },
  {
    id: "admin-dashboards",
    slug: "admin-dashboards",
    icon: "dashboard",
    ar: {
      title: "تطوير لوحات التحكم",
      description: "لوحات إدارة مخصصة للمحتوى والطلبات والمستخدمين والتقارير.",
      fullDescription:
        "نبني لوحات تحكم واضحة تساعدك على إدارة موقعك أو نظامك بسهولة، من المحتوى والخدمات إلى المستخدمين والصلاحيات والإحصائيات.",
      features: [
        { title: "إدارة محتوى مرنة", description: "تعديل الصفحات والعناصر من مكان واحد." },
        { title: "جداول وفلاتر وإجراءات", description: "تصفح وإدارة البيانات بسهولة." },
        { title: "صلاحيات وأدوار", description: "تحديد ما يمكن لكل مستخدم الوصول إليه." },
        { title: "إحصائيات وتقارير", description: "رؤية أوضح لما يحدث داخل النظام." },
      ],
    },
    en: {
      title: "Management Dashboards",
      description: "Custom dashboards for content, requests, users, permissions, and reporting.",
      fullDescription:
        "We build clean management dashboards that help you control your website or system from one place, including content, users, permissions, and insights.",
      features: [
        { title: "Flexible content control", description: "Update pages and records from one place." },
        { title: "Tables, filters, and actions", description: "Manage data clearly and efficiently." },
        { title: "Roles and permissions", description: "Control access for each user type." },
        { title: "Insights and reports", description: "Understand what happens inside the system." },
      ],
    },
  },
  {
    id: "desktop-apps",
    slug: "desktop-apps",
    icon: "monitor",
    ar: {
      title: "تطوير تطبيقات سطح المكتب",
      description: "برامج Windows عملية لإدارة الأعمال والعمليات الداخلية وربط البيانات.",
      fullDescription:
        "نطوّر تطبيقات سطح مكتب مستقرة لبيئات العمل التي تحتاج أداءً محليًا، واجهات منظمة، وربطًا مع قواعد بيانات أو خدمات خارجية.",
      features: [
        { title: "واجهات عملية وواضحة", description: "تصميم مناسب للعمل اليومي الطويل." },
        { title: "ربط مع قاعدة بيانات", description: "حفظ واسترجاع بيانات بشكل منظم." },
        { title: "تقارير وطباعة", description: "تجهيز مخرجات تناسب إدارة الأعمال." },
        { title: "تحديثات ودعم", description: "إمكانية تطوير البرنامج مع الوقت." },
      ],
    },
    en: {
      title: "Desktop App Development",
      description: "Practical Windows applications for business operations and data workflows.",
      fullDescription:
        "We develop stable desktop applications for teams that need local performance, structured interfaces, and integration with databases or external services.",
      features: [
        { title: "Practical interfaces", description: "Designed for long daily work sessions." },
        { title: "Database connectivity", description: "Organized data storage and retrieval." },
        { title: "Reports and printing", description: "Outputs that support business management." },
        { title: "Updates and support", description: "The application can evolve over time." },
      ],
    },
  },
  {
    id: "business-systems",
    slug: "business-systems",
    icon: "database",
    ar: {
      title: "تطوير الأنظمة الإدارية",
      description: "أنظمة مخصصة لإدارة العملاء والطلبات والمخزون والعمليات الداخلية.",
      fullDescription:
        "نصمم أنظمة إدارية تناسب طريقة عملك بدل إجبارك على قالب جاهز، سواء لإدارة العملاء أو الموظفين أو الطلبات أو المخزون أو العمليات المالية.",
      features: [
        { title: "تحليل سير العمل", description: "نفهم العمليات قبل تحويلها إلى نظام." },
        { title: "صلاحيات متعددة", description: "كل فريق يرى ما يحتاجه فقط." },
        { title: "تقارير قابلة للتوسع", description: "مؤشرات تساعدك على اتخاذ القرار." },
        { title: "بنية قابلة للتطوير", description: "النظام يكبر مع احتياج العمل." },
      ],
    },
    en: {
      title: "Business Systems",
      description: "Custom systems for customers, orders, inventory, and internal operations.",
      fullDescription:
        "We design management systems that fit your workflow instead of forcing you into a generic template, from CRM and HR to orders, inventory, and finance workflows.",
      features: [
        { title: "Workflow analysis", description: "We understand the process before building the system." },
        { title: "Multi-role access", description: "Each team sees what they need." },
        { title: "Expandable reports", description: "Useful indicators for decision-making." },
        { title: "Scalable architecture", description: "The system grows with the business." },
      ],
    },
  },
  {
    id: "api-integrations",
    slug: "api-integrations",
    icon: "cable",
    ar: {
      title: "ربط الأنظمة وواجهات API",
      description: "ربط المواقع والتطبيقات مع خدمات الدفع والرسائل والخرائط والأنظمة الخارجية.",
      fullDescription:
        "نربط الأنظمة مع الخدمات الخارجية بطريقة منظمة، مثل بوابات الدفع، البريد الإلكتروني، الرسائل، الخرائط، أنظمة المحاسبة، أو أي API يحتاجه مشروعك.",
      features: [
        { title: "تكاملات خارجية", description: "ربط مع خدمات ومنصات مختلفة." },
        { title: "معالجة أخطاء واضحة", description: "تعامل أفضل مع فشل الاتصال أو الاستجابة." },
        { title: "أمان في المفاتيح والبيانات", description: "حفظ الأسرار والإعدادات بطريقة مناسبة." },
        { title: "توثيق للاستخدام", description: "تسهيل التطوير والصيانة لاحقًا." },
      ],
    },
    en: {
      title: "API Integrations",
      description: "Connect websites and apps with payments, messages, maps, and external platforms.",
      fullDescription:
        "We integrate systems with external services such as payment gateways, email, messaging, maps, accounting tools, or any API your project requires.",
      features: [
        { title: "External integrations", description: "Connect with different services and platforms." },
        { title: "Clear error handling", description: "Better behavior when a service fails." },
        { title: "Secure keys and data", description: "Secrets and settings handled properly." },
        { title: "Usage documentation", description: "Easier maintenance and future development." },
      ],
    },
  },
  {
    id: "project-improvement",
    slug: "project-improvement",
    icon: "zap",
    ar: {
      title: "تحسين وتطوير المشاريع القائمة",
      description: "تحليل المشاريع الحالية وإصلاح مشاكلها وتحسين أدائها وتجربة استخدامها.",
      fullDescription:
        "إذا كان لديك مشروع قائم لكنه بطيء أو غير منظم أو يحتاج ميزات جديدة، نراجع بنيته ونحدد خطة تحسين واضحة بدون تخريب ما يعمل حاليًا.",
      features: [
        { title: "مراجعة الكود والبنية", description: "تحديد نقاط الضعف والمخاطر." },
        { title: "تحسين الأداء", description: "تقليل البطء وتحسين تجربة الاستخدام." },
        { title: "إصلاح الأخطاء", description: "معالجة المشاكل المتكررة والمزعجة." },
        { title: "إضافة ميزات جديدة", description: "تطوير المشروع تدريجيًا وبأمان." },
      ],
    },
    en: {
      title: "Existing Project Improvement",
      description: "Audit, fix, improve, and extend existing software projects safely.",
      fullDescription:
        "If you already have a project that is slow, messy, or missing features, we review its structure and define a clear improvement plan without breaking what already works.",
      features: [
        { title: "Code and structure review", description: "Identify weaknesses and risks." },
        { title: "Performance improvement", description: "Reduce slowness and improve UX." },
        { title: "Bug fixing", description: "Fix recurring and frustrating issues." },
        { title: "New features", description: "Extend the project gradually and safely." },
      ],
    },
  },
  {
    id: "maintenance-support",
    slug: "maintenance-support",
    icon: "support",
    ar: {
      title: "الصيانة والدعم التقني",
      description: "متابعة مستمرة بعد التسليم تشمل الإصلاحات والتحديثات والتحسينات الدورية.",
      fullDescription:
        "نساعدك على الحفاظ على استقرار مشروعك بعد الإطلاق من خلال إصلاحات، تحديثات، نسخ احتياطي، مراقبة، وتحسينات عند الحاجة.",
      features: [
        { title: "دعم بعد التسليم", description: "متابعة المشاكل والأسئلة بعد الإطلاق." },
        { title: "تحديثات وتحسينات", description: "تطوير مستمر حسب الحاجة." },
        { title: "نسخ احتياطي وتنظيم", description: "تقليل مخاطر فقدان البيانات." },
        { title: "استقرار طويل الأمد", description: "حماية المشروع من الإهمال التقني." },
      ],
    },
    en: {
      title: "Maintenance & Technical Support",
      description: "Ongoing support after delivery: fixes, updates, monitoring, and improvements.",
      fullDescription:
        "We help keep your project stable after launch with fixes, updates, backups, monitoring, and improvements when needed.",
      features: [
        { title: "Post-delivery support", description: "Help with questions and issues after launch." },
        { title: "Updates and improvements", description: "Continuous development when needed." },
        { title: "Backup and organization", description: "Reduce the risk of data loss." },
        { title: "Long-term stability", description: "Protect the project from technical neglect." },
      ],
    },
  },
];

function fallbackToCardView(locale: Locale, service: FallbackService): ServiceCardView {
  const content = service[locale];

  return {
    id: service.id,
    title: content.title,
    description: content.description,
    fullDescription: content.fullDescription,
    href: buildServiceHref(locale, service.slug),
    icon: service.icon,
    imageUrl: null,
    features: content.features,
  };
}

export function getFallbackServiceCards(locale: Locale): ServiceCardView[] {
  return FALLBACK_SERVICES.map((service) => fallbackToCardView(locale, service));
}

export function getFallbackServiceBySlug(locale: Locale, slug: string): ServiceCardView | null {
  const service = FALLBACK_SERVICES.find((item) => item.slug === slug || item.id === slug);
  return service ? fallbackToCardView(locale, service) : null;
}
