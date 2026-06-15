"""
=====================================================
Seed احترافي لقائمة خدمات ServaCode / سيرفا كود
=====================================================

يشغّل هذا السكربت قائمة خدمات جاهزة داخل الباكند حتى لا تضطر
لإضافة الخدمات يدويًا من لوحة التحكم خدمة خدمة.

الاستخدام من داخل مجلد backend:
    python scripts\\seed_professional_services.py

خيارات مفيدة:
    python scripts\\seed_professional_services.py --skip-existing
    python scripts\\seed_professional_services.py --inactive

ملاحظات:
- السكربت idempotent: يمكن تشغيله أكثر من مرة.
- يبحث عن الخدمة بواسطة slug_ar أو slug_en، ويحدثها إن كانت موجودة.
- يعيد تفعيل الخدمة إن كانت soft-deleted.
- يزامن ميزات كل خدمة مع القائمة الاحترافية هنا.
"""

# ruff: noqa: E402, I001

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path
from typing import Any

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django  # noqa: E402

django.setup()

from django.db import transaction  # noqa: E402
from django.db.models import Q  # noqa: E402

from platform_api.models import Service, ServiceFeature  # noqa: E402


PROFESSIONAL_SERVICES: list[dict[str, Any]] = [
    {
        "title_ar": "تطوير مواقع إلكترونية احترافية",
        "title_en": "Professional Website Development",
        "slug_ar": "professional-websites",
        "slug_en": "professional-websites",
        "icon": "globe",
        "description_ar": "مواقع تعريفية وتسويقية حديثة للشركات والأعمال، سريعة ومتجاوبة ومهيأة للنمو.",
        "description_en": "Modern corporate and marketing websites for businesses, fast, responsive, and ready to grow.",
        "full_description_ar": "نطوّر مواقع إلكترونية احترافية تعرض هوية شركتك وخدماتك بشكل واضح وموثوق، مع واجهات متجاوبة، بنية قابلة للإدارة من لوحة التحكم، دعم عربي/إنجليزي، وتجهيز أساسي لمحركات البحث.",
        "full_description_en": "We build professional websites that present your brand and services clearly, with responsive interfaces, admin-managed content, Arabic/English support, and SEO-ready structure.",
        "seo_title_ar": "تطوير مواقع إلكترونية احترافية للشركات",
        "seo_title_en": "Professional Website Development for Businesses",
        "seo_description_ar": "تطوير مواقع شركات احترافية متجاوبة وقابلة للإدارة مع دعم عربي وإنجليزي وتهيئة SEO.",
        "seo_description_en": "Professional business websites with responsive UI, admin control, Arabic/English support, and SEO-ready setup.",
        "sort_order": 10,
        "category": "web",
        "features": [
            ("تصميم متجاوب", "Responsive Design", "واجهة تعمل بسلاسة على الجوال والتابلت والديسكتوب.", "Smooth experience across mobile, tablet, and desktop."),
            ("لوحة تحكم للمحتوى", "Content Admin Panel", "تعديل الخدمات والصفحات والمحتوى بدون الرجوع للكود.", "Manage pages, services, and content without touching code."),
            ("دعم عربي وإنجليزي", "Arabic & English Support", "تجربة RTL/LTR جاهزة حسب لغة الزائر.", "RTL/LTR experience according to visitor language."),
            ("تهيئة SEO أساسية", "SEO Foundation", "عناوين ووصف وهيكلة تساعد على الظهور بشكل أفضل.", "Titles, descriptions, and structure prepared for better visibility."),
        ],
    },
    {
        "title_ar": "تطوير تطبيقات ويب تفاعلية",
        "title_en": "Interactive Web App Development",
        "slug_ar": "web-app-development",
        "slug_en": "web-app-development",
        "icon": "apps",
        "description_ar": "تطبيقات تعمل من المتصفح لإدارة الخدمات والعمليات والحجوزات والطلبات والبيانات.",
        "description_en": "Browser-based apps for managing services, operations, bookings, orders, and data.",
        "full_description_ar": "نحوّل الأفكار إلى تطبيقات ويب عملية تعمل من المتصفح، مثل المنصات الخدمية، أدوات الإدارة، أنظمة الطلبات، الحجز، ولوحات التشغيل اليومية.",
        "full_description_en": "We turn ideas into practical web applications such as service platforms, management tools, ordering systems, booking systems, and daily operation dashboards.",
        "seo_title_ar": "تطوير تطبيقات ويب مخصصة",
        "seo_title_en": "Custom Web Application Development",
        "seo_description_ar": "بناء تطبيقات ويب تفاعلية لإدارة العمليات والخدمات والبيانات مع API ولوحات تحكم.",
        "seo_description_en": "Build interactive web apps for operations, services, and data with APIs and admin dashboards.",
        "sort_order": 20,
        "category": "web",
        "features": [
            ("واجهات تفاعلية", "Interactive Interfaces", "تجربة استخدام واضحة وسريعة للمهام اليومية.", "Clear and fast user experience for daily workflows."),
            ("حسابات وصلاحيات", "Users & Permissions", "أدوار متعددة وتحكم بمن يستطيع الوصول لكل قسم.", "Multiple roles and access control per section."),
            ("API وقاعدة بيانات", "API & Database", "بنية منظمة لحفظ ومعالجة البيانات.", "Structured backend for storing and processing data."),
            ("قابلية للتوسع", "Scalable Foundation", "إضافة ميزات لاحقًا بدون إعادة بناء كاملة.", "Add features later without rebuilding from scratch."),
        ],
    },
    {
        "title_ar": "تطوير لوحات تحكم وإدارة محتوى",
        "title_en": "Admin Dashboards & CMS Development",
        "slug_ar": "admin-dashboards-cms",
        "slug_en": "admin-dashboards-cms",
        "icon": "dashboard",
        "description_ar": "لوحات تحكم مخصصة لإدارة المحتوى والطلبات والمستخدمين والصلاحيات والإعدادات.",
        "description_en": "Custom dashboards for content, requests, users, permissions, and settings management.",
        "full_description_ar": "نبني لوحات تحكم مركزية تساعدك على إدارة مشروعك من مكان واحد، مع جداول وفلاتر ونماذج منظمة وصلاحيات ورسائل واضحة وتجربة عربية احترافية.",
        "full_description_en": "We build centralized dashboards to manage your project from one place, with tables, filters, structured forms, permissions, clear messages, and polished UI.",
        "seo_title_ar": "تطوير لوحات تحكم احترافية",
        "seo_title_en": "Professional Admin Dashboard Development",
        "seo_description_ar": "لوحات تحكم مخصصة لإدارة المواقع والأنظمة والمحتوى والطلبات والصلاحيات.",
        "seo_description_en": "Custom admin dashboards for websites, systems, content, requests, and permissions.",
        "sort_order": 30,
        "category": "management",
        "features": [
            ("نماذج إدارة واضحة", "Clear Admin Forms", "حقول مرتبة تساعد الموظف على إدخال البيانات بدون تعقيد.", "Organized fields that make content entry simple."),
            ("جداول وفلاتر", "Tables & Filters", "بحث وترتيب وتصفح للبيانات الكبيرة.", "Search, sorting, and pagination for large data sets."),
            ("أدوار وصلاحيات", "Roles & Permissions", "فصل صلاحيات المدير والمحرر والدعم.", "Separate access for admins, editors, and support."),
            ("تحكم مركزي", "Centralized Control", "إدارة الهوية والمحتوى والإعدادات من مكان واحد.", "Manage identity, content, and settings from one place."),
        ],
    },
    {
        "title_ar": "تطوير الأنظمة الإدارية المخصصة",
        "title_en": "Custom Business Systems Development",
        "slug_ar": "custom-business-systems",
        "slug_en": "custom-business-systems",
        "icon": "database",
        "description_ar": "أنظمة مخصصة لإدارة العملاء والطلبات والموظفين والمخزون والعمليات الداخلية.",
        "description_en": "Custom systems for customers, orders, employees, inventory, and internal operations.",
        "full_description_ar": "نصمم أنظمة إدارية تناسب طريقة عملك بدل إجبارك على قالب جاهز، مع تحليل سير العمل وبناء وحدات مخصصة للبيانات والصلاحيات والتقارير.",
        "full_description_en": "We design business systems that fit your workflow instead of forcing you into a generic template, with custom modules for data, permissions, and reporting.",
        "seo_title_ar": "برمجة أنظمة إدارية مخصصة",
        "seo_title_en": "Custom Management System Development",
        "seo_description_ar": "تصميم وبرمجة أنظمة إدارية للشركات والمكاتب والعمليات الداخلية حسب الحاجة.",
        "seo_description_en": "Design and develop custom management systems for companies, offices, and internal operations.",
        "sort_order": 40,
        "category": "systems",
        "features": [
            ("تحليل سير العمل", "Workflow Analysis", "فهم العمليات قبل تحويلها إلى نظام.", "Understand the workflow before turning it into software."),
            ("وحدات مخصصة", "Custom Modules", "بناء أقسام تناسب نشاطك الحقيقي.", "Build modules that match your real business activity."),
            ("تقارير وإحصائيات", "Reports & Analytics", "مؤشرات تساعد على المتابعة واتخاذ القرار.", "Insights that support monitoring and decisions."),
            ("صلاحيات متعددة", "Multi-role Access", "كل مستخدم يرى ما يحتاجه فقط.", "Each user sees only what they need."),
        ],
    },
    {
        "title_ar": "تطوير تطبيقات سطح المكتب Windows",
        "title_en": "Windows Desktop App Development",
        "slug_ar": "windows-desktop-apps",
        "slug_en": "windows-desktop-apps",
        "icon": "monitor",
        "description_ar": "برامج Windows مستقرة لإدارة المكاتب والعمليات المحلية والطباعة والبيانات.",
        "description_en": "Stable Windows applications for offices, local operations, printing, and data management.",
        "full_description_ar": "نطوّر تطبيقات سطح مكتب عملية تعمل على Windows كملفات قابلة للتثبيت، مناسبة للمكاتب والشركات التي تحتاج عمل محلي سريع مع قاعدة بيانات وتقارير وطباعة.",
        "full_description_en": "We develop practical Windows desktop apps that can be installed locally, suitable for offices and businesses needing fast local workflows, database storage, reports, and printing.",
        "seo_title_ar": "تطوير برامج Windows للشركات والمكاتب",
        "seo_title_en": "Windows Software Development for Businesses",
        "seo_description_ar": "برمجة تطبيقات سطح مكتب Windows لإدارة العمليات المحلية وقواعد البيانات والطباعة.",
        "seo_description_en": "Windows desktop apps for local operations, databases, reports, and printing.",
        "sort_order": 50,
        "category": "desktop",
        "features": [
            ("ملف EXE قابل للتثبيت", "Installable EXE", "تجربة تشغيل واضحة على أجهزة Windows.", "Clear installation and usage experience on Windows devices."),
            ("قاعدة بيانات محلية", "Local Database", "عمل محلي مناسب للبيئات التي لا تعتمد على الإنترنت.", "Local-first workflows for offline-friendly environments."),
            ("تقارير وطباعة", "Reports & Printing", "فواتير وتقارير ومستندات قابلة للطباعة.", "Printable invoices, reports, and documents."),
            ("قابلية تطوير لاحقة", "Future Expansion", "إمكانية التحويل لاحقًا لشبكة أو سحابة.", "Can later evolve into network or cloud versions."),
        ],
    },
    {
        "title_ar": "تطوير تطبيقات موبايل",
        "title_en": "Mobile App Development",
        "slug_ar": "mobile-app-development",
        "slug_en": "mobile-app-development",
        "icon": "apps",
        "description_ar": "تطبيقات موبايل Android و iOS مرتبطة بلوحات تحكم وواجهات API حسب الحاجة.",
        "description_en": "Android and iOS mobile apps connected to dashboards and APIs when needed.",
        "full_description_ar": "نساعدك على بناء تطبيقات موبايل احترافية لعملائك أو موظفيك، مع تجربة استخدام واضحة وربط بالباكند ولوحة تحكم لإدارة المحتوى والطلبات.",
        "full_description_en": "We help build professional mobile apps for customers or internal teams, with clear UX, backend integration, and admin panels for content and operations.",
        "seo_title_ar": "تطوير تطبيقات موبايل Android و iOS",
        "seo_title_en": "Android and iOS Mobile App Development",
        "seo_description_ar": "برمجة تطبيقات موبايل احترافية مرتبطة بباكند ولوحة تحكم وإشعارات.",
        "seo_description_en": "Professional mobile apps connected to backend, admin dashboards, and notifications.",
        "sort_order": 60,
        "category": "mobile",
        "features": [
            ("واجهات مريحة", "User-friendly UI", "تصميم مناسب للمستخدم النهائي على الموبايل.", "A mobile-first interface for end users."),
            ("ربط API", "API Integration", "اتصال آمن مع بيانات النظام.", "Secure communication with system data."),
            ("لوحة تحكم", "Admin Control", "إدارة محتوى التطبيق والطلبات من لوحة مركزية.", "Manage app content and requests from a central dashboard."),
            ("قابلية نشر", "Store-ready Path", "تجهيز فني مناسب للنشر لاحقًا.", "Prepared technically for future publishing."),
        ],
    },
    {
        "title_ar": "تحويل الأفكار إلى منتجات رقمية",
        "title_en": "Idea-to-Product Development",
        "slug_ar": "idea-to-digital-product",
        "slug_en": "idea-to-digital-product",
        "icon": "zap",
        "description_ar": "تحويل فكرتك إلى موقع أو تطبيق أو نظام بخطة واضحة من التحليل حتى النسخة الأولى.",
        "description_en": "Turn your idea into a website, app, or system through a clear path from analysis to MVP.",
        "full_description_ar": "إذا كانت لديك فكرة وتحتاج تحويلها إلى منتج قابل للاستخدام، نساعدك في ترتيب المتطلبات، تحديد الأولويات، تصميم تجربة الاستخدام، وبناء نسخة أولى قابلة للتطوير.",
        "full_description_en": "If you have an idea and need to turn it into a usable product, we help define requirements, prioritize features, design UX, and build a scalable first version.",
        "seo_title_ar": "تحويل الأفكار إلى تطبيقات ومواقع وأنظمة",
        "seo_title_en": "Turn Ideas into Apps, Websites, and Systems",
        "seo_description_ar": "خدمة تحويل الأفكار إلى منتجات رقمية قابلة للتنفيذ والتطوير خطوة بخطوة.",
        "seo_description_en": "Turn ideas into executable and scalable digital products step by step.",
        "sort_order": 70,
        "category": "consulting",
        "features": [
            ("تحليل الفكرة", "Idea Analysis", "تحويل الفكرة العامة إلى متطلبات واضحة.", "Turn a general idea into clear requirements."),
            ("تحديد MVP", "MVP Scope", "اختيار الميزات الضرورية للنسخة الأولى.", "Define the essential features for the first version."),
            ("خطة تنفيذ", "Execution Plan", "مراحل واضحة للتطوير والاختبار والتسليم.", "Clear stages for development, testing, and delivery."),
            ("قابلية توسع", "Scalable Direction", "بناء أساس يسمح بإضافة ميزات لاحقًا.", "Build a foundation that supports future features."),
        ],
    },
    {
        "title_ar": "المتاجر الإلكترونية وحلول البيع",
        "title_en": "E-commerce & Online Selling Solutions",
        "slug_ar": "ecommerce-solutions",
        "slug_en": "ecommerce-solutions",
        "icon": "layers",
        "description_ar": "متاجر إلكترونية وصفحات بيع مخصصة مع إدارة منتجات وطلبات وتجربة شراء واضحة.",
        "description_en": "Custom online stores and selling pages with product, order, and checkout workflows.",
        "full_description_ar": "نبني متاجر إلكترونية وحلول بيع مناسبة لطبيعة المنتج والسوق، مع إدارة المنتجات والطلبات والعروض وتجربة مستخدم تساعد على الشراء.",
        "full_description_en": "We build online stores and selling solutions tailored to the product and market, with product management, orders, offers, and conversion-focused UX.",
        "seo_title_ar": "تطوير متاجر إلكترونية احترافية",
        "seo_title_en": "Professional E-commerce Development",
        "seo_description_ar": "إنشاء متاجر إلكترونية مخصصة مع إدارة منتجات وطلبات وتجربة شراء احترافية.",
        "seo_description_en": "Custom e-commerce stores with product management, orders, and professional buying experience.",
        "sort_order": 80,
        "category": "commerce",
        "features": [
            ("إدارة المنتجات", "Product Management", "إضافة المنتجات والصور والأسعار والعروض.", "Manage products, images, prices, and offers."),
            ("إدارة الطلبات", "Order Management", "متابعة الطلبات وحالاتها بوضوح.", "Track orders and statuses clearly."),
            ("تصميم بيع مقنع", "Conversion-focused Design", "واجهة تساعد العميل على فهم المنتج واتخاذ قرار.", "A UI that helps customers understand and decide."),
            ("قابلية ربط الدفع", "Payment-ready", "إمكانية ربط بوابات الدفع عند الحاجة.", "Ready for payment gateway integration when needed."),
        ],
    },
    {
        "title_ar": "أنظمة الحجز والمواعيد",
        "title_en": "Booking & Appointment Systems",
        "slug_ar": "booking-appointment-systems",
        "slug_en": "booking-appointment-systems",
        "icon": "workflow",
        "description_ar": "أنظمة لحجز المواعيد والخدمات وإدارة الجداول والطلبات والتنبيهات.",
        "description_en": "Systems for booking appointments, services, schedules, requests, and notifications.",
        "full_description_ar": "نطوّر حلول حجز تناسب المكاتب والعيادات والمراكز والخدمات، مع إدارة المواعيد والحالات والتنبيهات ولوحة متابعة للموظفين.",
        "full_description_en": "We develop booking solutions for offices, clinics, centers, and service providers, including schedule management, statuses, notifications, and staff dashboards.",
        "seo_title_ar": "تطوير أنظمة حجز ومواعيد",
        "seo_title_en": "Booking and Appointment System Development",
        "seo_description_ar": "أنظمة مخصصة للحجوزات والمواعيد وإدارة الجداول والتنبيهات.",
        "seo_description_en": "Custom booking and appointment systems with schedules and notifications.",
        "sort_order": 90,
        "category": "systems",
        "features": [
            ("تقويم ومواعيد", "Calendar Scheduling", "تنظيم الأيام والأوقات المتاحة.", "Organize available days and time slots."),
            ("حالات الحجز", "Booking Statuses", "متابعة مؤكد، بانتظار، ملغي، مكتمل.", "Track confirmed, pending, cancelled, and completed bookings."),
            ("تنبيهات", "Notifications", "إشعارات للمستخدم أو الإدارة حسب الحاجة.", "Notifications for users or admins when needed."),
            ("لوحة متابعة", "Operations Dashboard", "إدارة الحجوزات من مكان واحد.", "Manage bookings from one place."),
        ],
    },
    {
        "title_ar": "منيو إلكتروني وأنظمة طلب داخل المطعم",
        "title_en": "Smart Menu & In-house Ordering Systems",
        "slug_ar": "smart-menu-inhouse-ordering",
        "slug_en": "smart-menu-inhouse-ordering",
        "icon": "panels",
        "description_ar": "حلول منيو QR وطلبات داخل المطعم للمطاعم والكافيهات الراقية.",
        "description_en": "QR menu and in-house ordering solutions for premium restaurants and cafés.",
        "full_description_ar": "نبني أنظمة منيو إلكتروني وطلبات داخلية تناسب المطاعم والكافيهات الفخمة، مع إدارة الأصناف والطاولات والطلبات والاستقبال والمطبخ حسب احتياج المكان.",
        "full_description_en": "We build smart menu and in-house ordering systems for premium restaurants and cafés, with menu, table, order reception, and kitchen workflows as needed.",
        "seo_title_ar": "منيو إلكتروني ونظام طلبات داخل المطعم",
        "seo_title_en": "Smart Menu and In-house Ordering System",
        "seo_description_ar": "منيو QR احترافي للمطاعم والكافيهات مع إدارة طلبات داخلية وطاولات.",
        "seo_description_en": "Professional QR menu for restaurants and cafés with in-house ordering and table management.",
        "sort_order": 100,
        "category": "restaurant",
        "features": [
            ("منيو QR احترافي", "Professional QR Menu", "عرض الأصناف والصور والأسعار بشكل راقٍ.", "Show items, images, and prices in a premium layout."),
            ("طلبات داخل المكان", "In-house Ordering", "طلب من الطاولة أو عبر الاستقبال حسب workflow.", "Order from tables or through reception depending on workflow."),
            ("إدارة أقسام وأصناف", "Menu Management", "إضافة وتعديل الأقسام والأصناف بسهولة.", "Easily manage categories and items."),
            ("قابلية ربط المطبخ", "Kitchen-ready", "إمكانية إضافة شاشة مطبخ أو طباعة تذاكر.", "Can support kitchen screens or printed tickets."),
        ],
    },
    {
        "title_ar": "أنظمة إدارة العملاء CRM",
        "title_en": "CRM Customer Management Systems",
        "slug_ar": "crm-customer-management",
        "slug_en": "crm-customer-management",
        "icon": "network",
        "description_ar": "تنظيم العملاء والفرص والمتابعات والملاحظات وسجل التواصل داخل نظام واحد.",
        "description_en": "Organize customers, opportunities, follow-ups, notes, and communication history in one system.",
        "full_description_ar": "نطوّر أنظمة CRM مخصصة تساعدك على متابعة العملاء والمهام والفرص البيعية وحالات التواصل، بدل الاعتماد على ملفات مشتتة ورسائل غير منظمة.",
        "full_description_en": "We develop custom CRM systems to track customers, tasks, sales opportunities, and communication statuses instead of scattered files and unorganized messages.",
        "seo_title_ar": "تطوير نظام إدارة عملاء CRM",
        "seo_title_en": "Custom CRM System Development",
        "seo_description_ar": "نظام CRM مخصص لإدارة العملاء والمتابعات والفرص وسجل التواصل.",
        "seo_description_en": "Custom CRM for managing customers, follow-ups, opportunities, and communication history.",
        "sort_order": 110,
        "category": "systems",
        "features": [
            ("ملفات عملاء", "Customer Profiles", "بيانات وملاحظات وسجل كامل لكل عميل.", "Data, notes, and full history for every customer."),
            ("متابعات ومهام", "Follow-ups & Tasks", "تذكير وتنظيم خطوات التواصل.", "Organize communication steps and reminders."),
            ("حالات وفرص", "Statuses & Opportunities", "تصنيف العملاء والفرص حسب المرحلة.", "Classify customers and opportunities by stage."),
            ("تقارير", "Reports", "رؤية أفضل لأداء المبيعات والمتابعة.", "Better visibility into sales and follow-up performance."),
        ],
    },
    {
        "title_ar": "ربط الأنظمة وواجهات API",
        "title_en": "API Integrations & System Connectivity",
        "slug_ar": "api-integrations-system-connectivity",
        "slug_en": "api-integrations-system-connectivity",
        "icon": "cable",
        "description_ar": "ربط المواقع والتطبيقات مع خدمات الدفع والرسائل والخرائط والأنظمة الخارجية.",
        "description_en": "Connect websites and apps with payments, messaging, maps, and external systems.",
        "full_description_ar": "نربط مشروعك مع الخدمات الخارجية بطريقة منظمة وآمنة، مثل بوابات الدفع، البريد الإلكتروني، الرسائل، الخرائط، المحاسبة، أو أي API يحتاجه المشروع.",
        "full_description_en": "We connect your project with external services safely and cleanly, such as payment gateways, email, messaging, maps, accounting systems, or any required API.",
        "seo_title_ar": "ربط API وتكامل الأنظمة",
        "seo_title_en": "API Integration and System Connectivity",
        "seo_description_ar": "خدمات ربط API للمواقع والتطبيقات مع الدفع والرسائل والأنظمة الخارجية.",
        "seo_description_en": "API integration services for websites and apps with payments, messages, and external systems.",
        "sort_order": 120,
        "category": "backend",
        "features": [
            ("تكاملات خارجية", "External Integrations", "ربط مع خدمات ومنصات متعددة.", "Connect with multiple platforms and services."),
            ("معالجة أخطاء", "Error Handling", "تعامل واضح مع فشل الاتصال أو الاستجابة.", "Clear handling for connection or response failures."),
            ("أمان المفاتيح", "Secure Secrets", "تنظيم مفاتيح API والإعدادات الحساسة.", "Manage API keys and sensitive settings properly."),
            ("توثيق", "Documentation", "تسهيل الصيانة والتطوير لاحقًا.", "Make maintenance and future development easier."),
        ],
    },
    {
        "title_ar": "أتمتة الأعمال وسير العمل",
        "title_en": "Business Automation & Workflow Systems",
        "slug_ar": "business-automation-workflows",
        "slug_en": "business-automation-workflows",
        "icon": "workflow",
        "description_ar": "تحويل المهام المتكررة إلى عمليات رقمية منظمة توفر الوقت وتقلل الأخطاء.",
        "description_en": "Turn repetitive tasks into organized digital workflows that save time and reduce errors.",
        "full_description_ar": "نساعد الشركات والمكاتب على أتمتة خطوات العمل المتكررة، مثل إدخال البيانات، المتابعات، الإشعارات، التقارير، وربط الأقسام ببعضها.",
        "full_description_en": "We help businesses automate repetitive workflows such as data entry, follow-ups, notifications, reports, and cross-team operations.",
        "seo_title_ar": "أتمتة الأعمال والعمليات الداخلية",
        "seo_title_en": "Business Automation and Internal Workflows",
        "seo_description_ar": "حلول أتمتة رقمية للمهام المتكررة وسير العمل الداخلي.",
        "seo_description_en": "Digital automation solutions for repetitive tasks and internal workflows.",
        "sort_order": 130,
        "category": "automation",
        "features": [
            ("تقليل العمل اليدوي", "Reduce Manual Work", "استبدال المهام المتكررة بخطوات رقمية.", "Replace repetitive manual tasks with digital steps."),
            ("تنبيهات ومتابعة", "Notifications & Tracking", "متابعة الحالات والمهام تلقائيًا.", "Automatically track statuses and tasks."),
            ("ربط الأقسام", "Team Connectivity", "تنظيم تدفق العمل بين الموظفين.", "Organize workflows between team members."),
            ("تقارير تلقائية", "Automated Reports", "مخرجات دورية دون تجهيز يدوي كل مرة.", "Recurring outputs without manual preparation each time."),
        ],
    },
    {
        "title_ar": "تصميم واجهات وتجربة المستخدم UI/UX",
        "title_en": "UI/UX Design",
        "slug_ar": "ui-ux-design",
        "slug_en": "ui-ux-design",
        "icon": "panels",
        "description_ar": "تصميم واجهات عصرية ومنظمة للمواقع والأنظمة والتطبيقات قبل وأثناء التطوير.",
        "description_en": "Modern and organized interface design for websites, systems, and applications.",
        "full_description_ar": "نصمم واجهات واضحة تساعد المستخدم على فهم الخدمة وتنفيذ المهام بسهولة، مع مراعاة الهوية البصرية، التسلسل المنطقي، وحالات الاستخدام المختلفة.",
        "full_description_en": "We design clear interfaces that help users understand services and complete tasks easily, considering brand identity, visual hierarchy, and real use cases.",
        "seo_title_ar": "تصميم واجهات وتجربة المستخدم",
        "seo_title_en": "UI/UX Design for Digital Products",
        "seo_description_ar": "تصميم UI/UX احترافي للمواقع والأنظمة والتطبيقات ولوحات التحكم.",
        "seo_description_en": "Professional UI/UX design for websites, systems, apps, and dashboards.",
        "sort_order": 140,
        "category": "design",
        "features": [
            ("تخطيط منطقي", "Logical Layout", "ترتيب المحتوى حسب أهمية الاستخدام.", "Structure content according to real user priorities."),
            ("هوية بصرية", "Visual Identity Alignment", "ألوان ومساحات وأنماط مناسبة للبراند.", "Colors, spacing, and patterns that match the brand."),
            ("تصميم متجاوب", "Responsive UI", "تجربة مناسبة لكل الشاشات.", "UI that works across screen sizes."),
            ("جاهزية للتطوير", "Development-ready", "تصميم قابل للتحويل إلى كود منظم.", "Design that can be translated into clean code."),
        ],
    },
    {
        "title_ar": "برمجة الباكند وقواعد البيانات",
        "title_en": "Backend & Database Engineering",
        "slug_ar": "backend-database-engineering",
        "slug_en": "backend-database-engineering",
        "icon": "server",
        "description_ar": "بناء API وقواعد بيانات ومنطق أعمال مستقر وآمن للمواقع والتطبيقات والأنظمة.",
        "description_en": "Build APIs, databases, and business logic for stable and secure digital products.",
        "full_description_ar": "ننفذ طبقة الباكند التي تدير البيانات والصلاحيات والمنطق والربط بين الواجهة وقاعدة البيانات، مع مراعاة الأمان والتنظيم وقابلية التوسع.",
        "full_description_en": "We implement backend layers that manage data, permissions, business logic, and communication between UI and database, with security, structure, and scalability in mind.",
        "seo_title_ar": "برمجة Backend وقواعد بيانات",
        "seo_title_en": "Backend and Database Development",
        "seo_description_ar": "تطوير API وقواعد بيانات ومنطق أعمال للمواقع والتطبيقات والأنظمة.",
        "seo_description_en": "API, database, and business logic development for websites, apps, and systems.",
        "sort_order": 150,
        "category": "backend",
        "features": [
            ("REST API", "REST API", "واجهات منظمة للربط بين الواجهة والبيانات.", "Structured APIs connecting UI and data."),
            ("نمذجة البيانات", "Data Modeling", "تصميم جداول وعلاقات مناسبة للمشروع.", "Design tables and relationships that fit the project."),
            ("أمان وصلاحيات", "Security & Permissions", "حماية الجلسات والعمليات الحساسة.", "Protect sessions and sensitive actions."),
            ("قابلية صيانة", "Maintainability", "كود منظم يسهل تطويره لاحقًا.", "Organized code that is easier to extend later."),
        ],
    },
    {
        "title_ar": "إضافة ميزات الذكاء الاصطناعي",
        "title_en": "AI Feature Integration",
        "slug_ar": "ai-feature-integration",
        "slug_en": "ai-feature-integration",
        "icon": "sparkles",
        "description_ar": "إضافة أدوات توليد وتحسين النصوص والصور والمساعدة الذكية داخل المشاريع عند الحاجة.",
        "description_en": "Add AI tools for text, image, and smart assistant workflows inside projects when needed.",
        "full_description_ar": "نضيف ميزات ذكاء اصطناعي عملية داخل المواقع واللوحات، مثل توليد أوصاف الخدمات، اقتراح محتوى، تحسين نصوص، أو ربط أدوات توليد صور حسب إمكانيات المنطقة والمفاتيح المتاحة.",
        "full_description_en": "We add practical AI features inside websites and dashboards, such as generating descriptions, suggesting content, improving texts, or connecting image generation tools depending on availability.",
        "seo_title_ar": "دمج ميزات الذكاء الاصطناعي بالمواقع والأنظمة",
        "seo_title_en": "AI Integration for Websites and Systems",
        "seo_description_ar": "إضافة ميزات ذكاء اصطناعي عملية لتوليد المحتوى وتحسين النصوص ودعم الإدارة.",
        "seo_description_en": "Practical AI features for content generation, text improvement, and admin assistance.",
        "sort_order": 160,
        "category": "ai",
        "features": [
            ("توليد محتوى", "Content Generation", "اقتراح عناوين وأوصاف وميزات.", "Suggest titles, descriptions, and features."),
            ("تحسين نصوص", "Text Improvement", "صياغة محتوى تسويقي أو إداري أفضل.", "Improve marketing or admin copy."),
            ("ربط مزودي AI", "AI Provider Integration", "استخدام مفاتيح ومزودين حسب المتاح.", "Use providers and API keys depending on availability."),
            ("تحكم من الإعدادات", "Settings Control", "تشغيل أو إخفاء الميزة من لوحة الإدارة.", "Enable or hide features from admin settings."),
        ],
    },
    {
        "title_ar": "الهوية البصرية والبراند الرقمي",
        "title_en": "Brand Identity & Digital Branding",
        "slug_ar": "brand-identity-digital-branding",
        "slug_en": "brand-identity-digital-branding",
        "icon": "shield",
        "description_ar": "تجهيز هوية رقمية متناسقة للموقع والسوشيال والإعلانات والعروض التقديمية.",
        "description_en": "Prepare a consistent digital identity for websites, social media, ads, and presentations.",
        "full_description_ar": "نساعدك على بناء صورة رقمية احترافية تشمل أسلوب الألوان، ترتيب الهوية داخل الموقع، المواد البصرية الأساسية، وتوحيد ظهور البراند عبر القنوات المختلفة.",
        "full_description_en": "We help create a professional digital presence including color direction, website identity placement, essential visual assets, and brand consistency across channels.",
        "seo_title_ar": "تصميم هوية بصرية رقمية",
        "seo_title_en": "Digital Brand Identity Design",
        "seo_description_ar": "خدمات هوية رقمية وبراند للمواقع والسوشيال والإعلانات والعروض.",
        "seo_description_en": "Digital branding services for websites, social media, ads, and presentations.",
        "sort_order": 170,
        "category": "design",
        "features": [
            ("اتساق بصري", "Visual Consistency", "ألوان وأسلوب موحد عبر المنصات.", "Unified colors and style across platforms."),
            ("مواد رقمية", "Digital Assets", "عناصر مناسبة للموقع والسوشيال.", "Assets suitable for website and social channels."),
            ("عرض احترافي", "Professional Presentation", "طريقة ظهور تعزز الثقة بالبراند.", "Presentation that builds brand trust."),
            ("قابلية استخدام", "Reusable System", "هوية يمكن استخدامها لاحقًا في تصاميم متعددة.", "Identity that can be reused in future designs."),
        ],
    },
    {
        "title_ar": "صفحات هبوط وإعلانات رقمية",
        "title_en": "Landing Pages & Digital Campaign Assets",
        "slug_ar": "landing-pages-digital-campaigns",
        "slug_en": "landing-pages-digital-campaigns",
        "icon": "zap",
        "description_ar": "صفحات هبوط ومحتوى بصري للحملات التسويقية والخدمات والعروض الخاصة.",
        "description_en": "Landing pages and visual content for marketing campaigns, services, and special offers.",
        "full_description_ar": "نجهز صفحات هبوط ومكونات رقمية مخصصة للحملات، تركز على الرسالة والعرض وطلب التواصل أو التسجيل بطريقة واضحة واحترافية.",
        "full_description_en": "We prepare campaign-focused landing pages and digital assets that highlight the message, offer, and conversion action clearly and professionally.",
        "seo_title_ar": "تصميم صفحات هبوط للحملات الإعلانية",
        "seo_title_en": "Landing Pages for Digital Campaigns",
        "seo_description_ar": "صفحات هبوط وتسويق رقمي لعرض الخدمات والعروض وجذب طلبات العملاء.",
        "seo_description_en": "Landing pages and digital campaign assets for presenting services and generating leads.",
        "sort_order": 180,
        "category": "marketing",
        "features": [
            ("رسالة واضحة", "Clear Message", "تقديم العرض أو الخدمة بدون تشتيت.", "Present the offer or service without distraction."),
            ("دعوة لاتخاذ إجراء", "Strong CTA", "أزرار تواصل أو طلب عرض واضحة.", "Clear contact or quote request buttons."),
            ("تصميم للحملات", "Campaign-ready Design", "مناسب للإعلانات والسوشيال.", "Suitable for ads and social media campaigns."),
            ("قياس وتحسين", "Track & Improve", "قابلية إضافة تتبع وتحسين لاحقًا.", "Ready for tracking and later improvement."),
        ],
    },
    {
        "title_ar": "تحسين وإعادة هيكلة المشاريع القائمة",
        "title_en": "Existing Project Audit & Improvement",
        "slug_ar": "existing-project-audit-improvement",
        "slug_en": "existing-project-audit-improvement",
        "icon": "gauge",
        "description_ar": "فحص المشاريع الحالية وإصلاح مشاكل الأداء والبنية والتجربة وإغلاق النواقص.",
        "description_en": "Audit existing projects and fix performance, structure, UX, and missing workflow issues.",
        "full_description_ar": "إذا كان لديك مشروع قائم لكنه غير مستقر أو يحتاج ترتيب، نراجعه كمهندسين، نحدد المشاكل، نصلح الأساس، ونضع خطة تحسين بدون هدم ما يعمل فعليًا.",
        "full_description_en": "If you have an existing project that is unstable or messy, we review it professionally, identify issues, fix the foundation, and improve it without breaking what already works.",
        "seo_title_ar": "فحص وتحسين المشاريع البرمجية القائمة",
        "seo_title_en": "Existing Software Project Audit and Improvement",
        "seo_description_ar": "خدمة فحص وإصلاح وتحسين مشاريع الويب والأنظمة ولوحات التحكم القائمة.",
        "seo_description_en": "Audit, fix, and improve existing web, system, and dashboard projects.",
        "sort_order": 190,
        "category": "maintenance",
        "features": [
            ("فحص تقني", "Technical Audit", "تقييم الكود والبنية والأخطاء.", "Evaluate code, architecture, and issues."),
            ("إصلاح الأساس", "Foundation Fixes", "معالجة المشاكل التي تمنع الاستقرار.", "Fix problems that block stability."),
            ("تحسين تجربة الاستخدام", "UX Improvement", "إزالة التعقيد والأزرار غير المفيدة.", "Reduce complexity and useless actions."),
            ("خطة تطوير", "Improvement Plan", "ترتيب المراحل القادمة بوضوح.", "Organize next stages clearly."),
        ],
    },
    {
        "title_ar": "تجهيز النشر والاستضافة لاحقًا",
        "title_en": "Deployment Readiness & Hosting Preparation",
        "slug_ar": "deployment-readiness-hosting",
        "slug_en": "deployment-readiness-hosting",
        "icon": "shield",
        "description_ar": "تجهيز المشروع تقنيًا ليكون قابلًا للنشر لاحقًا بعد اكتمال المحتوى والفحص.",
        "description_en": "Prepare projects technically for deployment after content and final checks are complete.",
        "full_description_ar": "لا ننشر المشروع قبل جاهزيته، لكن نجهزه بطريقة سليمة تشمل ملفات البيئة، أوامر البناء، التوثيق، الحماية الأساسية، وتنظيف الملفات حتى يصبح النشر لاحقًا أسهل وأكثر أمانًا.",
        "full_description_en": "We do not deploy before the project is ready, but we prepare it correctly with environment files, build commands, documentation, basic security, and clean delivery structure.",
        "seo_title_ar": "تجهيز المشاريع للنشر والاستضافة",
        "seo_title_en": "Deployment and Hosting Readiness",
        "seo_description_ar": "تجهيز تقني للمشاريع قبل النشر يشمل البيئة والبناء والتوثيق والتنظيف.",
        "seo_description_en": "Technical preparation before deployment, including environment, build, docs, and cleanup.",
        "sort_order": 200,
        "category": "deployment",
        "features": [
            ("ملفات بيئة واضحة", "Clear Environment Files", "إعداد env.example بدون أسرار حقيقية.", "Clean env.example without real secrets."),
            ("أوامر تشغيل وبناء", "Run & Build Commands", "توثيق طريقة التشغيل والفحص.", "Document run and build steps."),
            ("تنظيف المشروع", "Project Cleanup", "إزالة الكاش والملفات الثقيلة والحساسة.", "Remove cache, heavy, and sensitive files."),
            ("جاهزية لاحقة", "Future Readiness", "تسهيل الانتقال للنشر عند القرار النهائي.", "Make future deployment easier when ready."),
        ],
    },
    {
        "title_ar": "الصيانة والدعم التقني المستمر",
        "title_en": "Ongoing Maintenance & Technical Support",
        "slug_ar": "ongoing-maintenance-support",
        "slug_en": "ongoing-maintenance-support",
        "icon": "support",
        "description_ar": "متابعة مستمرة بعد التسليم تشمل الإصلاحات والتحديثات والتحسينات الدورية.",
        "description_en": "Ongoing post-delivery support including fixes, updates, and periodic improvements.",
        "full_description_ar": "نساعدك على الحفاظ على استقرار مشروعك بعد التسليم من خلال إصلاحات، تحديثات، نسخ احتياطي، متابعة مشاكل، وتحسينات حسب الحاجة.",
        "full_description_en": "We help keep your project stable after delivery through fixes, updates, backups, issue tracking, and improvements when needed.",
        "seo_title_ar": "صيانة ودعم تقني للمواقع والأنظمة",
        "seo_title_en": "Maintenance and Technical Support for Websites and Systems",
        "seo_description_ar": "خدمات صيانة ودعم وتحديث للمواقع والأنظمة والتطبيقات بعد التسليم.",
        "seo_description_en": "Maintenance, support, and update services for websites, systems, and apps after delivery.",
        "sort_order": 210,
        "category": "support",
        "features": [
            ("دعم بعد التسليم", "Post-delivery Support", "متابعة المشاكل والأسئلة بعد الإطلاق.", "Help with issues and questions after launch."),
            ("تحديثات وتحسينات", "Updates & Improvements", "تطوير مستمر حسب الحاجة.", "Continuous improvement when needed."),
            ("نسخ احتياطي وتنظيم", "Backup & Organization", "تقليل مخاطر فقدان البيانات.", "Reduce the risk of data loss."),
            ("استقرار طويل الأمد", "Long-term Stability", "حماية المشروع من الإهمال التقني.", "Protect the project from technical neglect."),
        ],
    },
]


def _service_defaults(item: dict[str, Any], *, active: bool) -> dict[str, Any]:
    keys = {
        "title_ar",
        "title_en",
        "slug_ar",
        "slug_en",
        "description_ar",
        "description_en",
        "full_description_ar",
        "full_description_en",
        "icon",
        "seo_title_ar",
        "seo_title_en",
        "seo_description_ar",
        "seo_description_en",
        "sort_order",
    }
    defaults = {key: item[key] for key in keys if key in item}
    defaults.update(
        {
            "image_url": item.get("image_url") or "",
            "is_active": active,
            "is_deleted": False,
            "deleted_at": None,
            "extra_data": {
                "seed_key": item["slug_en"],
                "category": item.get("category", "general"),
                "source": "professional_services_seed",
                "managed_by_admin": True,
                "recommended": True,
            },
        }
    )
    return defaults


def _sync_features(service: Service, item: dict[str, Any]) -> None:
    service.features.all().delete()
    for index, (title_ar, title_en, description_ar, description_en) in enumerate(item.get("features", []), start=1):
        ServiceFeature.objects.create(
            service_id=service,
            title_ar=title_ar,
            title_en=title_en,
            description_ar=description_ar,
            description_en=description_en,
            sort_order=index * 10,
            is_active=True,
        )


@transaction.atomic
def seed_professional_services(*, skip_existing: bool = False, active: bool = True) -> tuple[int, int]:
    created_count = 0
    updated_count = 0

    for item in PROFESSIONAL_SERVICES:
        service = Service.objects.filter(Q(slug_ar=item["slug_ar"]) | Q(slug_en=item["slug_en"])).first()
        if service and skip_existing:
            continue

        defaults = _service_defaults(item, active=active)
        if service:
            for key, value in defaults.items():
                setattr(service, key, value)
            service.save()
            updated_count += 1
        else:
            service = Service.objects.create(**defaults)
            created_count += 1

        _sync_features(service, item)

    return created_count, updated_count


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed professional ServaCode services into the backend database.")
    parser.add_argument("--skip-existing", action="store_true", help="Do not update services that already exist.")
    parser.add_argument("--inactive", action="store_true", help="Create/update services as inactive/hidden.")
    args = parser.parse_args()

    created, updated = seed_professional_services(skip_existing=args.skip_existing, active=not args.inactive)

    print("تم تجهيز قائمة الخدمات الاحترافية بنجاح.")
    print(f"- خدمات جديدة: {created}")
    print(f"- خدمات محدثة: {updated}")
    print(f"- إجمالي القائمة: {len(PROFESSIONAL_SERVICES)}")


if __name__ == "__main__":
    main()
