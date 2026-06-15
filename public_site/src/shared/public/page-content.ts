import type { AppIconName } from "@/shared/design-system/components/AppIcon";
import type { Locale } from "@/shared/design-system/utils/direction";

export type PublicHighlight = {
  icon: AppIconName;
  title: string;
  description: string;
};

export type PublicMetric = {
  label: string;
  value: string;
};

const content = {
  ar: {
    common: {
      details: "استعراض التفاصيل",
      startProject: "ابدأ مشروعك",
      viewApp: "تفاصيل التطبيق",
      readMore: "قراءة المقال",
      viewWork: "استعراض العمل",
      download: "تحميل",
    },
    systems: {
      eyebrow: "أنظمة برمجية قابلة للنمو",
      title: "أنظمتنا",
      description:
        "حلول وأنظمة برمجية مصممة لإدارة العمليات، تنظيم البيانات، وتسريع العمل اليومي داخل الشركات والفرق.",
      metrics: [
        { value: "إدارة", label: "محتوى وعمليات" },
        { value: "صلاحيات", label: "مستخدمون وأدوار" },
        { value: "تقارير", label: "قرارات أوضح" },
      ],
      defaultFeatures: ["لوحة تحكم", "صلاحيات منظمة", "تقارير وإحصائيات"],
      highlightsTitle: "ماذا يميز أنظمتنا؟",
      highlightsDescription:
        "لا نبني واجهة فقط؛ نبني نظامًا واضحًا يمكن تشغيله، تطويره، وربطه مع أدواتك المستقبلية.",
      highlights: [
        {
          icon: "dashboard" as const,
          title: "لوحة إدارة واضحة",
          description: "إدارة المحتوى، المستخدمين، الإعدادات، والتقارير من مكان واحد.",
        },
        {
          icon: "shield" as const,
          title: "صلاحيات وأمان",
          description: "أدوار مستخدمين، حماية وصول، وسجل عمليات يساعدك على تتبع التغييرات.",
        },
        {
          icon: "network" as const,
          title: "قابلية الربط والتوسع",
          description: "بنية API قابلة للربط مع خدمات الدفع، الرسائل، الخرائط، أو أنظمة داخلية أخرى.",
        },
      ],
    },
    apps: {
      eyebrow: "تطبيقات خدمية جاهزة للاستخدام",
      title: "تطبيقاتنا",
      description:
        "مجموعة تطبيقات وأدوات خدمية عامة نطوّرها لتسهيل المهام اليومية، إدارة الأعمال، وتحسين الإنتاجية.",
      metrics: [
        { value: "Web", label: "تطبيقات ويب" },
        { value: "Desktop", label: "برامج سطح مكتب" },
        { value: "Updates", label: "تحديثات مستمرة" },
      ],
      defaultFeatures: ["واجهة سهلة", "تحديثات دورية", "دعم فني"],
      highlightsTitle: "كل تطبيق بصفحة واضحة",
      highlightsDescription:
        "صفحة التطبيق تعرض المميزات، الصور، متطلبات التشغيل، روابط التحميل، وسجل التحديثات بشكل منظم.",
      highlights: [
        {
          icon: "download" as const,
          title: "روابط تحميل منظمة",
          description: "ملفات التحميل تظهر حسب النظام مع الإصدار والحجم إن وجد.",
        },
        {
          icon: "support" as const,
          title: "دعم مرتبط بالتطبيق",
          description: "يمكن للمستخدم إرسال طلب دعم خاص بتطبيق محدد من مركز الدعم.",
        },
        {
          icon: "badgeCheck" as const,
          title: "معلومات إصدار واضحة",
          description: "عرض الإصدار الحالي، المنصة المدعومة، الحالة، ونوع التسعير.",
        },
      ],
    },
    work: {
      eyebrow: "أعمال وتجارب تنفيذية",
      title: "أعمالنا",
      description:
        "نماذج من المشاريع والأنظمة التي توضّح طريقة التفكير، جودة التنفيذ، والنتائج التي يمكن الوصول إليها.",
      metrics: [
        { value: "تحليل", label: "فهم المشكلة" },
        { value: "تنفيذ", label: "حل عملي" },
        { value: "نتيجة", label: "أثر واضح" },
      ],
      highlightsTitle: "كيف نعرض أعمالنا؟",
      highlightsDescription:
        "كل عمل يجب أن يوضح المشكلة، الحل، التقنيات، والنتيجة حتى لا يكون مجرد صورة أو عنوان.",
      highlights: [
        {
          icon: "message" as const,
          title: "المشكلة والسياق",
          description: "شرح مختصر لما كان يحتاجه العميل أو المشروع قبل التنفيذ.",
        },
        {
          icon: "workflow" as const,
          title: "الحل وطريقة العمل",
          description: "توضيح ما تم بناؤه وكيف تم تنظيم التجربة والعمليات.",
        },
        {
          icon: "gauge" as const,
          title: "النتيجة والقيمة",
          description: "إبراز الأثر العملي مثل السرعة، التنظيم، أو سهولة الإدارة.",
        },
      ],
    },
    insights: {
      eyebrow: "معرفة عملية لا ضجيج",
      title: "المقالات",
      description:
        "مقالات قصيرة ومباشرة حول بناء المواقع، الأنظمة، التطبيقات، وتجربة المستخدم بطريقة عملية.",
      metrics: [
        { value: "تقنية", label: "محتوى عملي" },
        { value: "إدارة", label: "أفكار للأعمال" },
        { value: "تطوير", label: "تحسين مستمر" },
      ],
      highlightsTitle: "ماذا ننشر؟",
      highlightsDescription:
        "نركز على محتوى يساعد العميل على فهم قراراته الرقمية وليس مجرد أخبار عامة.",
      highlights: [
        {
          icon: "code" as const,
          title: "تطوير وبرمجة",
          description: "مقالات عن بناء الأنظمة، التطبيقات، والواجهات بطريقة قابلة للتوسع.",
        },
        {
          icon: "gauge" as const,
          title: "أداء وتجربة مستخدم",
          description: "نصائح عملية لجعل المواقع والتطبيقات أسرع وأسهل استخدامًا.",
        },
        {
          icon: "sparkles" as const,
          title: "أفكار رقمية",
          description: "شرح مبسط لكيف يمكن تحويل فكرة أو عملية متعبة إلى حل رقمي واضح.",
        },
      ],
    },
    downloads: {
      eyebrow: "ملفات تحميل منظمة وآمنة",
      title: "مركز التحميل",
      description:
        "مكان واحد لتحميل تطبيقاتنا وأدواتنا حسب النظام، مع معلومات الإصدار وروابط التفاصيل والدعم.",
      metrics: [
        { value: "Version", label: "إصدار واضح" },
        { value: "Platform", label: "نظام مدعوم" },
        { value: "Support", label: "دعم متوفر" },
      ],
      safetyTitle: "قبل التحميل",
      safetyDescription:
        "نحافظ على وضوح معلومات الملف حتى يعرف المستخدم ماذا يحمّل ولأي نظام يعمل.",
      safety: [
        {
          icon: "shield" as const,
          title: "روابط من المصدر",
          description: "كل ملف يظهر من مكتبة الوسائط الرسمية أو رابط موثق من لوحة التحكم.",
        },
        {
          icon: "badgeCheck" as const,
          title: "معلومات إصدار",
          description: "يمكن عرض رقم الإصدار، الحجم، وتاريخ الإصدار عندما تكون البيانات متوفرة.",
        },
        {
          icon: "support" as const,
          title: "مركز دعم",
          description: "في حال وجود مشكلة، يمكن فتح طلب دعم مرتبط بالتطبيق مباشرة.",
        },
      ],
    },
  },
  en: {
    common: {
      details: "View details",
      startProject: "Start your project",
      viewApp: "App details",
      readMore: "Read article",
      viewWork: "View work",
      download: "Download",
    },
    systems: {
      eyebrow: "Scalable software systems",
      title: "Systems",
      description:
        "Software systems designed to organize operations, manage data, and make daily work clearer and faster.",
      metrics: [
        { value: "Manage", label: "Content & operations" },
        { value: "Roles", label: "Users & permissions" },
        { value: "Reports", label: "Clearer decisions" },
      ],
      defaultFeatures: ["Admin dashboard", "Structured permissions", "Reports & analytics"],
      highlightsTitle: "What makes our systems different?",
      highlightsDescription:
        "We do not build a screen only; we build a clear system that can run, grow, and integrate with future tools.",
      highlights: [
        {
          icon: "dashboard" as const,
          title: "Clear admin dashboard",
          description: "Manage content, users, settings, and reports from one place.",
        },
        {
          icon: "shield" as const,
          title: "Permissions and security",
          description: "User roles, protected access, and audit logs for tracking changes.",
        },
        {
          icon: "network" as const,
          title: "Integrations and scale",
          description: "API-ready architecture for payment, messaging, maps, or internal systems.",
        },
      ],
    },
    apps: {
      eyebrow: "Useful public apps",
      title: "Our Apps",
      description:
        "A collection of public tools and applications we build to simplify daily tasks, business operations, and productivity.",
      metrics: [
        { value: "Web", label: "Web apps" },
        { value: "Desktop", label: "Desktop tools" },
        { value: "Updates", label: "Continuous updates" },
      ],
      defaultFeatures: ["Easy interface", "Regular updates", "Technical support"],
      highlightsTitle: "Every app has a clear page",
      highlightsDescription:
        "Each app can show features, screenshots, requirements, downloads, and changelog in an organized way.",
      highlights: [
        {
          icon: "download" as const,
          title: "Organized downloads",
          description: "Download files are grouped by platform with version and file size when available.",
        },
        {
          icon: "support" as const,
          title: "App-related support",
          description: "Users can send support requests related to a specific app from the support center.",
        },
        {
          icon: "badgeCheck" as const,
          title: "Clear release info",
          description: "Show current version, supported platform, status, and pricing type.",
        },
      ],
    },
    work: {
      eyebrow: "Execution-focused work",
      title: "Work",
      description:
        "Selected projects and systems that show how we think, build, and deliver measurable digital value.",
      metrics: [
        { value: "Problem", label: "Understand" },
        { value: "Solution", label: "Build" },
        { value: "Result", label: "Deliver" },
      ],
      highlightsTitle: "How we present our work",
      highlightsDescription:
        "Each work item should show the problem, solution, technologies, and result—not just a screenshot.",
      highlights: [
        {
          icon: "message" as const,
          title: "Problem and context",
          description: "A short explanation of what the project needed before implementation.",
        },
        {
          icon: "workflow" as const,
          title: "Solution and process",
          description: "What was built and how the experience and operations were organized.",
        },
        {
          icon: "gauge" as const,
          title: "Outcome and value",
          description: "Highlight the practical value: speed, clarity, management, or reliability.",
        },
      ],
    },
    insights: {
      eyebrow: "Practical knowledge, no noise",
      title: "Insights",
      description:
        "Short practical articles about websites, systems, apps, and user experience for business owners and teams.",
      metrics: [
        { value: "Tech", label: "Practical content" },
        { value: "Business", label: "Better decisions" },
        { value: "Build", label: "Continuous improvement" },
      ],
      highlightsTitle: "What we publish",
      highlightsDescription:
        "We focus on content that helps clients understand digital decisions, not generic news.",
      highlights: [
        {
          icon: "code" as const,
          title: "Development",
          description: "Articles about building scalable systems, applications, and interfaces.",
        },
        {
          icon: "gauge" as const,
          title: "Performance and UX",
          description: "Practical advice for faster and easier-to-use digital products.",
        },
        {
          icon: "sparkles" as const,
          title: "Digital ideas",
          description: "Simple explanations of how ideas and manual processes become clear digital solutions.",
        },
      ],
    },
    downloads: {
      eyebrow: "Organized and clear downloads",
      title: "Download Center",
      description:
        "One place to download our apps and tools by platform, with release information and quick support links.",
      metrics: [
        { value: "Version", label: "Clear release" },
        { value: "Platform", label: "Supported OS" },
        { value: "Support", label: "Help available" },
      ],
      safetyTitle: "Before downloading",
      safetyDescription:
        "We keep file information clear so users know what they are downloading and which platform it supports.",
      safety: [
        {
          icon: "shield" as const,
          title: "Official links",
          description: "Files come from the official media library or trusted links managed by the admin panel.",
        },
        {
          icon: "badgeCheck" as const,
          title: "Release details",
          description: "Version, file size, and release date can be shown when available.",
        },
        {
          icon: "support" as const,
          title: "Support center",
          description: "Users can open a support request when they face an issue with an app.",
        },
      ],
    },
  },
} as const;

export function getPublicPageContent(locale: Locale) {
  return content[locale] ?? content.ar;
}
