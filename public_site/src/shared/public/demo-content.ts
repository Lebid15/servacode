/**
 * =====================================================
 * Demo Content Fallback
 * محتوى مبدئي آمن للموقع العام عندما تكون قاعدة البيانات فارغة.
 *
 * الهدف: ألا تظهر صفحات تطبيقاتنا/أنظمتنا/أعمالنا فارغة أثناء التجهيز المحلي.
 * عندما تضيف عناصر من لوحة التحكم، تختفي هذه العناصر تلقائيًا لأن بيانات الباكند تصبح هي الأساس.
 * يمكن تعطيله نهائيًا عبر:
 * NEXT_PUBLIC_SHOW_DEMO_CONTENT=false
 * =====================================================
 */

import type {
  PublicApp,
  PublicPortfolioProject,
  PublicProduct,
} from "@/shared/api/public-client";
import type { Locale } from "@/shared/design-system/utils/direction";
import { pickSlug } from "@/shared/public/public-utils";

export function isDemoContentEnabled() {
  if (process.env.NEXT_PUBLIC_SHOW_DEMO_CONTENT === "true") {
    return true;
  }

  if (process.env.NEXT_PUBLIC_SHOW_DEMO_CONTENT === "false") {
    return false;
  }

  return process.env.NODE_ENV !== "production";
}

export function getDemoApps(): PublicApp[] {
  return [
    {
      id: "demo-app-smart-task-organizer",
      name_ar: "منظّم المهام الذكي",
      name_en: "Smart Task Organizer",
      slug_ar: "smart-task-organizer",
      slug_en: "smart-task-organizer",
      short_description_ar: "تطبيق خفيف لتنظيم المهام اليومية ومتابعة الإنجاز بطريقة واضحة وسريعة.",
      short_description_en: "A lightweight app for organizing daily tasks and tracking progress with clarity.",
      full_description_ar: "منظّم المهام الذكي نموذج لتطبيق خدمي يساعد المستخدمين على ترتيب الأعمال اليومية، تصنيف الأولويات، ومتابعة المهام المفتوحة من واجهة بسيطة وسريعة.",
      full_description_en: "Smart Task Organizer is a utility app concept for planning daily work, prioritizing tasks, and tracking open items through a simple, fast interface.",
      app_type: "web",
      platform: "web",
      status: "available",
      pricing_type: "free",
      version: "0.1.0",
      is_featured: true,
      features: [
        { title_ar: "لوحة مهام واضحة", title_en: "Clear task board", description_ar: "عرض سريع للمهام حسب الأولوية.", description_en: "Quick overview of tasks by priority." },
        { title_ar: "تصنيف الأولويات", title_en: "Priority grouping", description_ar: "تنظيم العمل حسب الأهمية والموعد.", description_en: "Organize work by importance and due date." },
        { title_ar: "واجهة بسيطة", title_en: "Simple interface", description_ar: "تجربة مناسبة للأفراد والفرق الصغيرة.", description_en: "A friendly experience for individuals and small teams." },
      ],
      requirements: { browser_ar: "متصفح حديث", browser_en: "Modern browser" },
      changelog: [
        { version: "0.1.0", title_ar: "إطلاق النسخة الأولى", title_en: "Initial release", description_ar: "واجهة أولية لتنظيم المهام.", description_en: "Initial task organization interface." },
      ],
    },
    {
      id: "demo-app-invoice-builder",
      name_ar: "مولّد الفواتير",
      name_en: "Invoice Builder",
      slug_ar: "invoice-builder",
      slug_en: "invoice-builder",
      short_description_ar: "أداة خدمية لإنشاء فواتير مرتبة بصيغة PDF مع بيانات العميل والخدمة.",
      short_description_en: "A utility tool for creating clean PDF invoices with customer and service details.",
      full_description_ar: "مولّد الفواتير يساعد أصحاب الأعمال الصغيرة والمستقلين على إنشاء فواتير واضحة وتصدير مستندات مرتبة قابلة للمشاركة.",
      full_description_en: "Invoice Builder helps small businesses and freelancers create clear invoices and export shareable documents.",
      app_type: "tool",
      platform: "web",
      status: "coming_soon",
      pricing_type: "freemium",
      version: "0.1.0",
      is_featured: true,
      features: [
        { title_ar: "قوالب فواتير", title_en: "Invoice templates", description_ar: "تصاميم مرتبة قابلة للتخصيص.", description_en: "Clean layouts ready for customization." },
        { title_ar: "تصدير PDF", title_en: "PDF export", description_ar: "إخراج الفواتير بصيغة سهلة المشاركة.", description_en: "Export invoices in an easy-to-share format." },
        { title_ar: "بيانات العملاء", title_en: "Client details", description_ar: "حفظ معلومات العملاء لتسريع العمل.", description_en: "Keep client details to speed up work." },
      ],
      requirements: { browser_ar: "متصفح حديث", browser_en: "Modern browser" },
      changelog: [
        { version: "0.1.0", title_ar: "تجهيز فكرة التطبيق", title_en: "Concept preparation", description_ar: "تحديد خصائص الفواتير والتصدير.", description_en: "Defined invoice and export capabilities." },
      ],
    },
    {
      id: "demo-app-file-converter",
      name_ar: "محوّل الملفات الخدمي",
      name_en: "Utility File Converter",
      slug_ar: "utility-file-converter",
      slug_en: "utility-file-converter",
      short_description_ar: "أداة عامة لتنظيم وتحويل الملفات الخدمية ضمن واجهة سهلة الاستخدام.",
      short_description_en: "A general utility tool for organizing and converting files through a friendly interface.",
      full_description_ar: "محوّل الملفات الخدمي نموذج لتطبيق سطح مكتب يساعد المستخدم على تجهيز ملفات العمل وتنظيمها ضمن مسارات واضحة.",
      full_description_en: "Utility File Converter is a desktop app concept for preparing and organizing work files through guided flows.",
      app_type: "desktop",
      platform: "windows",
      status: "in_development",
      pricing_type: "contact",
      version: "0.1.0",
      is_featured: false,
      features: [
        { title_ar: "واجهة سطح مكتب", title_en: "Desktop interface", description_ar: "تجربة مناسبة للاستخدام اليومي على Windows.", description_en: "A practical experience for daily use on Windows." },
        { title_ar: "تجهيز جماعي", title_en: "Batch preparation", description_ar: "تنظيم عدة ملفات ضمن عملية واحدة.", description_en: "Prepare multiple files in one workflow." },
        { title_ar: "قابل للتخصيص", title_en: "Customizable", description_ar: "إمكانية تكييف الأداة حسب نوع الملفات.", description_en: "Can be adapted to specific file types." },
      ],
      requirements: { os_ar: "Windows 10 أو أحدث", os_en: "Windows 10 or later" },
      changelog: [
        { version: "0.1.0", title_ar: "نسخة تطوير أولية", title_en: "Initial development version", description_ar: "بنية أولية لتحويل وتنظيم الملفات.", description_en: "Initial structure for file conversion and organization." },
      ],
    },
  ];
}

export function getDemoProducts(): PublicProduct[] {
  return [
    {
      id: "demo-system-crm",
      name_ar: "نظام إدارة العملاء",
      name_en: "Customer Management System",
      slug_ar: "customer-management-system",
      slug_en: "customer-management-system",
      short_description_ar: "نظام لإدارة العملاء، المتابعات، الطلبات، وسجل التواصل من مكان واحد.",
      short_description_en: "A system for managing customers, follow-ups, requests, and communication history in one place.",
      full_description_ar: "نظام إدارة العملاء يساعد الشركات على تنظيم بيانات العملاء ومتابعة مراحل التواصل وإدارة الطلبات ضمن لوحة تحكم واضحة.",
      full_description_en: "The customer management system helps companies organize client data, track communication stages, and manage requests through a clear dashboard.",
      product_type: "saas",
      status: "available",
      features: [
        { id: "demo-crm-f1", title_ar: "ملفات عملاء منظمة", title_en: "Organized customer profiles", description_ar: "عرض بيانات العملاء وسجل التواصل.", description_en: "View customer information and communication history." },
        { id: "demo-crm-f2", title_ar: "متابعة الطلبات", title_en: "Request tracking", description_ar: "إدارة مراحل الطلب من الاستقبال حتى الإغلاق.", description_en: "Manage request stages from intake to closure." },
        { id: "demo-crm-f3", title_ar: "صلاحيات المستخدمين", title_en: "User permissions", description_ar: "تحديد الوصول حسب دور كل مستخدم.", description_en: "Control access based on each user's role." },
      ],
    },
    {
      id: "demo-system-cms",
      name_ar: "نظام إدارة المحتوى",
      name_en: "Content Management System",
      slug_ar: "content-management-system",
      slug_en: "content-management-system",
      short_description_ar: "منصة لإدارة صفحات الموقع، الخدمات، المقالات، الوسائط، وإعدادات الهوية.",
      short_description_en: "A platform for managing website pages, services, articles, media, and brand settings.",
      full_description_ar: "نظام إدارة المحتوى يوفر لوحة تحكم مركزية لتحديث الموقع دون تعديل الكود، مع دعم تعدد اللغة والوسائط و SEO.",
      full_description_en: "The content management system provides a central dashboard for updating the website without touching code, with multilingual content, media, and SEO.",
      product_type: "web",
      status: "available",
      features: [
        { id: "demo-cms-f1", title_ar: "إدارة الصفحات", title_en: "Page management", description_ar: "تعديل الصفحات والنصوص والصور.", description_en: "Edit pages, text, and images." },
        { id: "demo-cms-f2", title_ar: "مكتبة وسائط", title_en: "Media library", description_ar: "رفع الصور والملفات واستخدامها.", description_en: "Upload and reuse images and files." },
        { id: "demo-cms-f3", title_ar: "تهيئة SEO", title_en: "SEO readiness", description_ar: "حقول مخصصة لعناوين ووصف الصفحات.", description_en: "Custom fields for titles and descriptions." },
      ],
    },
    {
      id: "demo-system-operations",
      name_ar: "نظام إدارة العمليات",
      name_en: "Operations Management System",
      slug_ar: "operations-management-system",
      slug_en: "operations-management-system",
      short_description_ar: "منصة داخلية لمتابعة سير العمل، المستخدمين، الطلبات، والتقارير التشغيلية.",
      short_description_en: "An internal platform for tracking workflows, users, requests, and operational reports.",
      full_description_ar: "نظام إدارة العمليات مناسب للشركات التي تحتاج تنظيم سير العمل اليومي وتوزيع الصلاحيات ومتابعة الحالات.",
      full_description_en: "The operations management system is built for companies that need to organize daily workflows, assign permissions, and track statuses.",
      product_type: "web",
      status: "in_development",
      features: [
        { id: "demo-ops-f1", title_ar: "تتبع الحالات", title_en: "Status tracking", description_ar: "متابعة كل عملية حسب مرحلتها.", description_en: "Track each operation by its current stage." },
        { id: "demo-ops-f2", title_ar: "تقارير تشغيلية", title_en: "Operational reports", description_ar: "ملخصات تساعد الإدارة على فهم الأداء.", description_en: "Summaries that support management decisions." },
        { id: "demo-ops-f3", title_ar: "أدوار وصلاحيات", title_en: "Roles and permissions", description_ar: "تنظيم الوصول حسب الفرق والمستخدمين.", description_en: "Organize access by teams and users." },
      ],
    },
  ];
}

export function getDemoPortfolio(): PublicPortfolioProject[] {
  return [
    {
      id: "demo-work-tech-company",
      title_ar: "واجهة شركة تقنية متعددة اللغات",
      title_en: "Multilingual Technology Company Website",
      slug_ar: "multilingual-tech-company-website",
      slug_en: "multilingual-tech-company-website",
      description_ar: "نموذج موقع تعريفي لشركة تقنية مع صفحات خدمات، أعمال، وتواصل.",
      description_en: "A concept website for a technology company with services, work, and contact pages.",
      full_description_ar: "نموذج يوضح طريقة بناء واجهة شركة برمجيات بشكل منظم، مع دعم العربية والإنكليزية وربط بالمحتوى القادم من لوحة التحكم.",
      full_description_en: "A concept showing how a software company website can be structured with Arabic/English support and dashboard-managed content.",
      category_ar: "موقع تعريفي",
      category_en: "Company Website",
      technologies: ["Next.js", "Django REST Framework", "PostgreSQL", "RTL/LTR"],
      problem_ar: "الحاجة إلى واجهة تعريفية تظهر الخدمات والأنظمة بطريقة مرتبة.",
      problem_en: "The need for a company website that presents services and systems clearly.",
      result_ar: "واجهة منظمة قابلة للإدارة مع صفحات أساسية ورسائل تسويقية واضحة.",
      result_en: "A manageable, organized website with essential pages and clear messaging.",
    },
    {
      id: "demo-work-dashboard",
      title_ar: "لوحة تحكم لإدارة المحتوى",
      title_en: "Content Administration Dashboard",
      slug_ar: "content-administration-dashboard",
      slug_en: "content-administration-dashboard",
      description_ar: "نموذج لوحة تحكم لإدارة الصفحات، الوسائط، الطلبات، والمستخدمين.",
      description_en: "A dashboard concept for managing pages, media, requests, and users.",
      full_description_ar: "نموذج يركز على بناء تجربة إدارة داخلية لتعديل المحتوى ورفع الملفات ومتابعة طلبات العملاء.",
      full_description_en: "A concept focused on an internal management experience for content, files, and customer requests.",
      category_ar: "لوحة تحكم",
      category_en: "Dashboard",
      technologies: ["Next.js", "Role-Based Access", "Media Library", "Audit Logs"],
      problem_ar: "إدارة المحتوى يدويًا تؤخر تحديث الموقع وتزيد الاعتماد على المطور.",
      problem_en: "Manual content management slows updates and increases dependency on developers.",
      result_ar: "لوحة تحكم مركزية تقلل التكرار وتسرّع تحديث الصفحات.",
      result_en: "A central dashboard that reduces repetition and speeds up updates.",
    },
    {
      id: "demo-work-services-platform",
      title_ar: "منصة خدمات رقمية",
      title_en: "Digital Services Platform",
      slug_ar: "digital-services-platform",
      slug_en: "digital-services-platform",
      description_ar: "نموذج منصة تعرض الخدمات وتستقبل طلبات المشاريع والدعم من الزوار.",
      description_en: "A platform concept for presenting services and receiving project and support requests.",
      full_description_ar: "نموذج يجمع بين صفحات تسويقية، نماذج تواصل، طلبات مشاريع، ومركز دعم قابل للإدارة.",
      full_description_en: "A concept combining marketing pages, contact forms, project requests, and a manageable support center.",
      category_ar: "منصة خدمات",
      category_en: "Service Platform",
      technologies: ["Django REST Framework", "PostgreSQL", "CRM Flow", "Support Requests"],
      problem_ar: "تشتت قنوات استقبال الطلبات يجعل المتابعة صعبة وغير منظمة.",
      problem_en: "Scattered request channels make follow-up difficult and inconsistent.",
      result_ar: "تجميع الطلبات ورسائل التواصل والدعم داخل نظام إداري واضح.",
      result_en: "Collected project, contact, and support requests into a clear administration flow.",
    },
  ];
}

export function findDemoApp(locale: Locale, slug: string) {
  return getDemoApps().find((item) => pickSlug(locale, item.slug_ar, item.slug_en) === slug);
}

export function findDemoProduct(locale: Locale, slug: string) {
  return getDemoProducts().find((item) => pickSlug(locale, item.slug_ar, item.slug_en) === slug);
}

export function findDemoPortfolio(locale: Locale, slug: string) {
  return getDemoPortfolio().find((item) => pickSlug(locale, item.slug_ar, item.slug_en) === slug);
}
