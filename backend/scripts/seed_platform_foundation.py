"""
=====================================================
Seed تأسيسي كامل لموقع ServaCode / سيرفا كود
=====================================================

هذا السكربت يجهّز المحتوى الأساسي الذي لا يجب إدخاله يدويًا من لوحة التحكم:
- إعدادات وهوية الموقع.
- الخدمات الاحترافية.
- الأنظمة/الحلول البرمجية.
- الأسئلة الشائعة العامة.
- الصفحات الثابتة.
- تصنيفات ومقالات تأسيسية.
- قوالب البريد.
- آراء عملاء مخفية قابلة للتعديل لاحقًا.

الاستخدام من داخل backend:
    python scripts/seed_platform_foundation.py

ملاحظات:
- السكربت آمن للتشغيل أكثر من مرة idempotent.
- تطبيقاتنا لا يتم إنشاؤها هنا لأنها تحتاج روابط تحميل وإصدارات وملفات حقيقية.
- الأعمال الحقيقية تبقى قابلة للإدارة من الأدمن؛ هذا السكربت لا ينشر مشاريع وهمية.
"""

# ruff: noqa: E402, I001

from __future__ import annotations

import os
import sys
from pathlib import Path
from typing import Any

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django

django.setup()

from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from platform_api import models
from platform_api.permissions import PERMISSION_CATALOG, PermissionKey
from scripts.seed_professional_services import seed_professional_services


SYSTEM_PRODUCTS: list[dict[str, Any]] = [
    {
        "name_ar": "نظام إدارة المطاعم والكافيهات",
        "name_en": "Restaurant & Café Management System",
        "slug_ar": "restaurant-cafe-management-system",
        "slug_en": "restaurant-cafe-management-system",
        "product_type": models.ProductType.SAAS,
        "short_description_ar": "نظام متكامل لإدارة الطلبات، المنيو، الطاولات، الموظفين، الفواتير والتقارير داخل المطاعم والكافيهات.",
        "short_description_en": "An integrated system for orders, menus, tables, staff, invoices, and reports inside restaurants and cafés.",
        "full_description_ar": "حل مناسب للمطاعم والكافيهات الراقية التي تحتاج إدارة داخلية واضحة للطلبات والطاولات والقوائم، مع لوحة تحكم مركزية وتقارير تساعد الإدارة على المتابعة اليومية.",
        "full_description_en": "A solution for premium dine-in restaurants and cafés needing clear management for orders, tables, menus, central administration, and daily operational reports.",
        "target_audience_ar": "المطاعم الراقية، الكافيهات الكبيرة، الصالات، ومشاريع الضيافة التي تحتاج تجربة طلب منظمة.",
        "target_audience_en": "Premium restaurants, large cafés, lounges, and hospitality venues requiring structured ordering workflows.",
        "requirements_ar": "تحديد طريقة العمل، الأقسام، الطاولات، الصلاحيات، ونمط الطباعة أو الشاشات المطلوبة.",
        "requirements_en": "Define workflow, sections, tables, permissions, and required printing or screen mode.",
        "features": [
            ("إدارة منيو مركزي", "Central Menu Management", "إضافة الأقسام والأصناف والصور والأسعار من لوحة التحكم.", "Manage categories, items, images, and prices from the admin panel."),
            ("طلبات الطاولات", "Table Orders", "استقبال الطلبات ومتابعة حالتها من الاستقبال حتى التسليم.", "Track orders from reception to delivery."),
            ("أدوار موظفين", "Staff Roles", "صلاحيات منفصلة للإدارة والاستقبال والمطبخ والنوادل.", "Separate permissions for manager, reception, kitchen, and waiters."),
            ("فواتير وتقارير", "Invoices & Reports", "طباعة فواتير ومراجعة المبيعات والأصناف الأكثر طلبًا.", "Print invoices and review sales and top items."),
        ],
        "faqs": [
            ("هل يمكن استخدام النظام داخل المطعم فقط؟", "Can it be used only inside the restaurant?", "نعم، يمكن ضبطه لطلبات QR والطاولات داخل الموقع فقط.", "Yes, it can be configured for in-house QR and table ordering only."),
            ("هل يدعم الطباعة للمطبخ؟", "Does it support kitchen printing?", "نعم، يمكن تجهيز تذاكر مطبخ بدون أسعار حسب الحاجة.", "Yes, kitchen tickets without prices can be prepared when needed."),
        ],
        "sort_order": 10,
    },
    {
        "name_ar": "منصة المنيو الإلكتروني والطلب الداخلي",
        "name_en": "Smart QR Menu & In-house Ordering Platform",
        "slug_ar": "smart-qr-menu-platform",
        "slug_en": "smart-qr-menu-platform",
        "product_type": models.ProductType.SAAS,
        "short_description_ar": "منصة QR Menu فاخرة للمطاعم والكافيهات مع طلبات داخلية وخدمات طاولة وتجربة موبايل احترافية.",
        "short_description_en": "A premium QR menu platform for restaurants and cafés with in-house ordering, table services, and polished mobile UX.",
        "full_description_ar": "منصة مصممة للمطاعم والكافيهات الفاخرة، تعرض المنيو بشكل احترافي، وتسمح بإرسال الطلبات وطلبات الخدمة من الطاولة إلى الاستقبال.",
        "full_description_en": "A platform built for premium venues, presenting menus elegantly and sending food and service requests from the table to reception.",
        "target_audience_ar": "مطاعم وكافيهات ترغب بتجربة رقمية داخلية راقية وليست خدمة توصيل.",
        "target_audience_en": "Restaurants and cafés wanting a premium in-house digital experience, not delivery.",
        "requirements_ar": "شعار المطعم، صور الأقسام والأصناف، الطاولات، ومسار استقبال الطلبات.",
        "requirements_en": "Restaurant logo, category/item images, tables, and reception workflow.",
        "features": [
            ("تصميم مناسب للموبايل", "Mobile-first Design", "واجهة سريعة وواضحة للزائر على الهاتف.", "Fast and clear customer experience on phones."),
            ("طلبات خدمة الطاولة", "Table Service Requests", "طلب ماء أو مناديل أو فاتورة من شريط خدمات واضح.", "Request water, napkins, cleaning, or bill from a clear service bar."),
            ("إدارة مركزية", "Central Admin", "تحكم بالقوائم والصور والحالة من لوحة واحدة.", "Control menus, images, and availability from one panel."),
            ("قابلية توسع", "Scalable Workflow", "يمكن إضافة استقبال ومطبخ ونادل حسب حجم المكان.", "Reception, kitchen, and waiter roles can be added as needed."),
        ],
        "faqs": [
            ("هل المنصة مخصصة للتوصيل؟", "Is the platform for delivery?", "لا، التوجه الأساسي هو الطلب داخل المطعم والتجربة الفاخرة للزائر.", "No, the primary focus is in-house ordering and premium guest experience."),
            ("هل يمكن تعطيل الطلب والاكتفاء بالمنيو؟", "Can ordering be disabled?", "نعم، يمكن استخدامها كمنيو فقط أو كمنيو مع طلبات داخلية.", "Yes, it can be used as a menu only or with in-house ordering."),
        ],
        "sort_order": 20,
    },
    {
        "name_ar": "نظام إدارة مكاتب الحج والعمرة",
        "name_en": "Hajj & Umrah Office Management System",
        "slug_ar": "hajj-umrah-office-system",
        "slug_en": "hajj-umrah-office-system",
        "product_type": models.ProductType.DESKTOP,
        "short_description_ar": "برنامج لإدارة المعتمرين، المواسم، البرامج، الأوراق، الدفعات، التقارير والنسخ الاحتياطي المحلي.",
        "short_description_en": "A system for pilgrims, seasons, programs, documents, payments, reports, and local backups.",
        "full_description_ar": "حل مخصص لمكاتب الحج والعمرة يعمل محليًا أو ضمن شبكة داخلية لاحقًا، يساعد على تنظيم البيانات والدفعات وحالة الأوراق والتقارير اليومية.",
        "full_description_en": "A system for Hajj and Umrah offices that can run locally or later on a local network, organizing data, payments, documents, and reports.",
        "target_audience_ar": "مكاتب الحج والعمرة، مكاتب التسجيل، وشركات تنظيم الرحلات الدينية.",
        "target_audience_en": "Hajj/Umrah offices, registration offices, and religious travel organizers.",
        "requirements_ar": "تحديد بيانات المعتمر، البرامج، مواسم العمل، الوثائق المطلوبة، ونماذج الطباعة.",
        "requirements_en": "Define pilgrim data, programs, seasons, required documents, and print templates.",
        "features": [
            ("إدارة المعتمرين", "Pilgrim Management", "ملفات كاملة للحالة والوثائق والملاحظات.", "Full records for status, documents, and notes."),
            ("المواسم والبرامج", "Seasons & Programs", "تنظيم الرحلات والبرامج حسب الموسم.", "Organize trips and programs by season."),
            ("الدفعات والتقارير", "Payments & Reports", "متابعة المدفوعات والمتبقي والتقارير.", "Track paid amounts, balances, and reports."),
            ("عمل محلي", "Local-first", "مناسب للنسخة الأولى بدون اعتماد على الإنترنت.", "Suitable for an offline-first first version."),
        ],
        "faqs": [
            ("هل يحتاج البرنامج إنترنت؟", "Does it require internet?", "يمكن بناء النسخة الأولى محليًا بالكامل بدون إنترنت.", "The first version can be built fully local without internet."),
            ("هل يمكن تطويره لاحقًا لشبكة؟", "Can it later become networked?", "نعم، يمكن توسيعه لاحقًا لشبكة محلية أو سحابة.", "Yes, it can later be expanded to local network or cloud."),
        ],
        "sort_order": 30,
    },
    {
        "name_ar": "نظام إدارة الحجوزات والمواعيد",
        "name_en": "Booking & Appointment Management System",
        "slug_ar": "booking-appointment-system",
        "slug_en": "booking-appointment-system",
        "product_type": models.ProductType.WEB,
        "short_description_ar": "نظام لحجز المواعيد والخدمات وتنظيم الجداول والتنبيهات وحالات الحجز.",
        "short_description_en": "A system for bookings, services, schedules, notifications, and reservation statuses.",
        "full_description_ar": "يساعد المكاتب والعيادات والمراكز الخدمية على استقبال الحجوزات وتنظيمها ومتابعة حالاتها من لوحة تحكم واضحة.",
        "full_description_en": "Helps offices, clinics, and service centers receive, organize, and track reservations through a clear dashboard.",
        "target_audience_ar": "المكاتب الخدمية، العيادات، المراكز التدريبية، الشركات التي تعمل بالمواعيد.",
        "target_audience_en": "Service offices, clinics, training centers, and appointment-based businesses.",
        "requirements_ar": "الخدمات، أوقات العمل، سياسة التأكيد، وطرق التواصل.",
        "requirements_en": "Services, working hours, confirmation policy, and communication channels.",
        "features": [
            ("تقويم حجوزات", "Booking Calendar", "عرض وجدولة المواعيد بطريقة واضحة.", "Display and schedule appointments clearly."),
            ("حالات الحجز", "Booking Statuses", "جديد، مؤكد، ملغي، مكتمل حسب المسار.", "New, confirmed, cancelled, completed based on workflow."),
            ("تنبيهات", "Notifications", "إشعارات داخلية أو بريدية حسب الحاجة.", "Internal or email notifications when needed."),
            ("إدارة خدمات", "Service Management", "تعريف الخدمات والمدد والأسعار.", "Define services, durations, and prices."),
        ],
        "faqs": [],
        "sort_order": 40,
    },
    {
        "name_ar": "نظام إدارة العملاء CRM",
        "name_en": "Customer Relationship Management CRM",
        "slug_ar": "customer-relationship-management-crm",
        "slug_en": "customer-relationship-management-crm",
        "product_type": models.ProductType.WEB,
        "short_description_ar": "نظام لمتابعة العملاء، الطلبات، الملاحظات، المراحل، والفرص التجارية.",
        "short_description_en": "A system for customers, requests, notes, stages, and sales opportunities.",
        "full_description_ar": "يوفر CRM مركزي لتسجيل العملاء ومتابعة التواصل والطلبات وتحويل الفرص إلى مشاريع فعلية مع تقارير مبسطة.",
        "full_description_en": "A central CRM for customer records, communication, requests, opportunities, and practical reports.",
        "target_audience_ar": "شركات الخدمات، المكاتب، فرق المبيعات، مزودو الحلول التقنية.",
        "target_audience_en": "Service companies, offices, sales teams, and technical solution providers.",
        "requirements_ar": "مراحل العمل، أنواع العملاء، مصادر الطلبات، والصلاحيات.",
        "requirements_en": "Workflow stages, customer types, lead sources, and permissions.",
        "features": [
            ("ملفات عملاء", "Customer Profiles", "بيانات وتواصل وملاحظات لكل عميل.", "Customer data, contact, and notes."),
            ("مراحل متابعة", "Pipeline Stages", "متابعة العميل من الاهتمام حتى الإغلاق.", "Track customer from lead to closure."),
            ("مهام وملاحظات", "Tasks & Notes", "توزيع مهام ومتابعة داخلية.", "Assign tasks and internal follow-ups."),
            ("تقارير", "Reports", "مؤشرات مبسطة عن العملاء والفرص.", "Simple indicators for customers and opportunities."),
        ],
        "faqs": [],
        "sort_order": 50,
    },
    {
        "name_ar": "نظام إدارة المبيعات والفواتير",
        "name_en": "Sales & Invoicing Management System",
        "slug_ar": "sales-invoicing-system",
        "slug_en": "sales-invoicing-system",
        "product_type": models.ProductType.WEB,
        "short_description_ar": "إدارة عروض الأسعار والفواتير والمدفوعات والعملاء والتقارير المالية البسيطة.",
        "short_description_en": "Manage quotations, invoices, payments, customers, and simple financial reports.",
        "full_description_ar": "حل عملي للشركات الصغيرة والمتوسطة التي تحتاج تنظيم الفواتير والمدفوعات وعروض الأسعار من لوحة واحدة.",
        "full_description_en": "A practical solution for small and medium businesses needing organized invoices, payments, and quotations from one panel.",
        "target_audience_ar": "الشركات الصغيرة، المكاتب، مزودو الخدمات، فرق المبيعات.",
        "target_audience_en": "Small companies, offices, service providers, and sales teams.",
        "requirements_ar": "العملة، الضرائب، قالب الفاتورة، المنتجات أو الخدمات، وطرق الدفع.",
        "requirements_en": "Currency, taxes, invoice template, products/services, and payment methods.",
        "features": [
            ("عروض أسعار", "Quotations", "إنشاء وإدارة عروض أسعار للعملاء.", "Create and manage customer quotations."),
            ("فواتير", "Invoices", "فواتير قابلة للطباعة والتصدير.", "Printable and exportable invoices."),
            ("مدفوعات", "Payments", "متابعة المدفوع والمتبقي.", "Track paid and remaining amounts."),
            ("تقارير مالية", "Financial Reports", "ملخصات تساعد الإدارة على المتابعة.", "Summaries that help management follow up."),
        ],
        "faqs": [],
        "sort_order": 60,
    },
    {
        "name_ar": "نظام إدارة المخزون",
        "name_en": "Inventory Management System",
        "slug_ar": "inventory-management-system",
        "slug_en": "inventory-management-system",
        "product_type": models.ProductType.WEB,
        "short_description_ar": "متابعة المنتجات والكميات والحركات والتنبيهات والتقارير الخاصة بالمخزون.",
        "short_description_en": "Track products, quantities, stock movements, alerts, and inventory reports.",
        "full_description_ar": "يساعد على ضبط المخزون وتقليل الفوضى في الكميات والحركات، مع سجل واضح للإدخال والإخراج والتقارير.",
        "full_description_en": "Helps control stock and reduce quantity confusion with clear in/out movement logs and reports.",
        "target_audience_ar": "المتاجر، المستودعات، المطاعم، المكاتب التي لديها مواد أو منتجات.",
        "target_audience_en": "Stores, warehouses, restaurants, and offices managing products or materials.",
        "requirements_ar": "تصنيفات المنتجات، الوحدات، الحد الأدنى، وطريقة الجرد.",
        "requirements_en": "Product categories, units, minimum stock, and stocktaking method.",
        "features": [
            ("كميات وحركات", "Quantities & Movements", "تسجيل الدخول والخروج والتحويلات.", "Record stock in, out, and transfers."),
            ("تنبيهات نقص", "Low Stock Alerts", "تنبيه عند وصول الكمية للحد الأدنى.", "Alert when quantity reaches the minimum."),
            ("تصنيفات", "Categories", "تنظيم المنتجات حسب الأقسام والوحدات.", "Organize products by categories and units."),
            ("تقارير جرد", "Stock Reports", "تقارير للحركة والجرد والمخزون الحالي.", "Movement, stocktaking, and current stock reports."),
        ],
        "faqs": [],
        "sort_order": 70,
    },
    {
        "name_ar": "نظام إدارة شركات السفر والنقل",
        "name_en": "Travel & Transportation Management System",
        "slug_ar": "travel-transportation-system",
        "slug_en": "travel-transportation-system",
        "product_type": models.ProductType.WEB,
        "short_description_ar": "إدارة الرحلات والحجوزات والركاب والمدفوعات ومواعيد الانطلاق والوصول.",
        "short_description_en": "Manage trips, bookings, passengers, payments, departure and arrival schedules.",
        "full_description_ar": "حل لشركات ومكاتب النقل والسفر يساعد على تنظيم الرحلات والركاب والحجوزات وتقارير الحركة اليومية.",
        "full_description_en": "A solution for travel and transportation companies to organize trips, passengers, reservations, and daily movement reports.",
        "target_audience_ar": "مكاتب السفر، شركات النقل، مكاتب حجز البولمان، الرحلات الداخلية والخارجية.",
        "target_audience_en": "Travel offices, transport companies, coach booking offices, local and international trips.",
        "requirements_ar": "خطوط الرحلات، المركبات، المقاعد، نقاط الانطلاق والوصول، وأنواع التذاكر.",
        "requirements_en": "Routes, vehicles, seats, departure/arrival points, and ticket types.",
        "features": [
            ("إدارة رحلات", "Trip Management", "تعريف الرحلات والمواعيد والمسارات.", "Define trips, schedules, and routes."),
            ("حجوزات ركاب", "Passenger Bookings", "تنظيم الركاب والمقاعد والمدفوعات.", "Manage passengers, seats, and payments."),
            ("قوائم طباعة", "Printable Lists", "قوائم ركاب ورحلات قابلة للطباعة.", "Printable passenger and trip lists."),
            ("تقارير", "Reports", "متابعة الحجوزات والحركة اليومية.", "Track reservations and daily activity."),
        ],
        "faqs": [],
        "sort_order": 80,
    },
    {
        "name_ar": "نظام إدارة المدارس والمعاهد",
        "name_en": "School & Training Center Management System",
        "slug_ar": "school-training-management-system",
        "slug_en": "school-training-management-system",
        "product_type": models.ProductType.WEB,
        "short_description_ar": "إدارة الطلاب والدورات والحضور والمدفوعات والتقارير التعليمية.",
        "short_description_en": "Manage students, courses, attendance, payments, and educational reports.",
        "full_description_ar": "نظام قابل للتخصيص للمدارس والمعاهد والمراكز التدريبية لتنظيم الطلاب والدورات والحضور والرسوم.",
        "full_description_en": "A customizable system for schools and training centers to organize students, courses, attendance, and fees.",
        "target_audience_ar": "المعاهد، المدارس الخاصة، مراكز التدريب، دورات اللغات والمهن.",
        "target_audience_en": "Institutes, private schools, training centers, language and vocational courses.",
        "requirements_ar": "نوع الدورات، بيانات الطلاب، الحضور، الرسوم، والتقارير المطلوبة.",
        "requirements_en": "Course types, student data, attendance, fees, and required reports.",
        "features": [
            ("إدارة طلاب", "Student Management", "ملفات الطلاب والتواصل والملاحظات.", "Student records, contact, and notes."),
            ("دورات وشعب", "Courses & Groups", "تنظيم الدورات والجداول والشعب.", "Organize courses, schedules, and groups."),
            ("حضور ومدفوعات", "Attendance & Payments", "متابعة الحضور والرسوم.", "Track attendance and fees."),
            ("تقارير", "Reports", "تقارير إدارية وتعليمية مبسطة.", "Simple administrative and educational reports."),
        ],
        "faqs": [],
        "sort_order": 90,
    },
    {
        "name_ar": "نظام إدارة العيادات والمراكز الطبية",
        "name_en": "Clinic & Medical Center Management System",
        "slug_ar": "clinic-medical-center-system",
        "slug_en": "clinic-medical-center-system",
        "product_type": models.ProductType.WEB,
        "short_description_ar": "تنظيم المواعيد والمرضى والملفات والخدمات والمدفوعات للعيادات والمراكز.",
        "short_description_en": "Organize appointments, patients, records, services, and payments for clinics and centers.",
        "full_description_ar": "يساعد العيادات والمراكز الطبية على تنظيم المواعيد والملفات والحركة اليومية مع صلاحيات مناسبة للموظفين.",
        "full_description_en": "Helps clinics and medical centers organize appointments, records, and daily activity with suitable staff permissions.",
        "target_audience_ar": "العيادات، المراكز الطبية، مراكز الأسنان، مراكز التجميل والعلاج.",
        "target_audience_en": "Clinics, medical centers, dental centers, beauty and treatment centers.",
        "requirements_ar": "الخدمات، الأطباء، المواعيد، الملف الطبي، ونماذج الطباعة.",
        "requirements_en": "Services, doctors, appointments, medical records, and print templates.",
        "features": [
            ("مواعيد", "Appointments", "جدولة ومتابعة مواعيد المرضى.", "Schedule and track patient appointments."),
            ("ملفات مرضى", "Patient Records", "بيانات وملاحظات وخدمات لكل مريض.", "Data, notes, and services per patient."),
            ("صلاحيات", "Permissions", "أدوار للإدارة والاستقبال والطبيب.", "Roles for manager, reception, and doctor."),
            ("فواتير", "Billing", "متابعة الخدمات والمدفوعات.", "Track services and payments."),
        ],
        "faqs": [],
        "sort_order": 100,
    },
]

GENERAL_FAQS = [
    ("هل يمكن طلب موقع أو نظام مخصص بالكامل؟", "Can I request a fully custom website or system?", "نعم، نبدأ بتحليل المتطلبات ثم نحدد الخطة والميزات المناسبة للنسخة الأولى.", "Yes, we start with requirements analysis, then define the right plan and features for the first version."),
    ("هل تدعمون اللغة العربية والإنجليزية؟", "Do you support Arabic and English?", "نعم، يتم تجهيز الواجهة والمحتوى لدعم RTL/LTR حسب الحاجة.", "Yes, interfaces and content can be prepared for RTL/LTR as needed."),
    ("هل يمكن ربط الموقع بلوحة تحكم؟", "Can the website be connected to an admin panel?", "نعم، هذا جزء أساسي من أغلب مشاريعنا حتى تتم إدارة المحتوى بدون تعديل الكود.", "Yes, this is a core part of most projects so content can be managed without code changes."),
    ("هل تقدمون دعمًا بعد التسليم؟", "Do you provide support after delivery?", "نعم، يمكن الاتفاق على دعم وصيانة وتحديثات حسب طبيعة المشروع.", "Yes, support, maintenance, and updates can be arranged depending on the project."),
    ("هل يمكن تطوير تطبيق Windows؟", "Can you develop a Windows application?", "نعم، يمكن بناء برامج سطح مكتب محلية أو قابلة للتوسع لاحقًا لشبكة أو سحابة.", "Yes, local desktop apps can be built and later expanded to network or cloud versions."),
    ("هل يمكن إضافة ميزات ذكاء اصطناعي؟", "Can AI features be added?", "نعم، يمكن إضافة توليد محتوى، تلخيص، تصنيف، مساعد ذكي أو ميزات حسب الحاجة.", "Yes, content generation, summarization, classification, assistants, or custom AI features can be added."),
    ("هل يتم تسليم الكود؟", "Is the source code delivered?", "يعتمد ذلك على اتفاق المشروع، ويمكن توضيحه ضمن عرض السعر والعقد.", "It depends on the project agreement and can be clarified in the proposal and contract."),
    ("كم يستغرق تنفيذ المشروع؟", "How long does a project take?", "يعتمد على حجم المشروع، لكن نحدد مدة واضحة بعد فهم المتطلبات والميزات المطلوبة.", "It depends on scope, but we define a clear timeline after understanding the required features."),
]

STATIC_PAGES = [
    {
        "page_key": "about",
        "title_ar": "من نحن",
        "title_en": "About Us",
        "slug_ar": "about",
        "slug_en": "about",
        "content_ar": "سيرفا كود شركة/استوديو برمجيات يركز على بناء مواقع وأنظمة وتطبيقات ولوحات تحكم احترافية للشركات والمشاريع التي تحتاج حلولًا واضحة وقابلة للتطوير.",
        "content_en": "ServaCode is a software studio focused on building professional websites, systems, apps, and admin dashboards for businesses that need clear and scalable digital solutions.",
        "sections": {
            "mission_ar": "تحويل الأفكار والعمليات إلى منتجات رقمية عملية ومنظمة.",
            "mission_en": "Turn ideas and workflows into practical, organized digital products.",
            "values_ar": ["الوضوح", "الجودة", "القابلية للتوسع", "الدعم المستمر"],
            "values_en": ["Clarity", "Quality", "Scalability", "Continuous support"],
        },
    },
    {
        "page_key": "privacy",
        "title_ar": "سياسة الخصوصية",
        "title_en": "Privacy Policy",
        "slug_ar": "privacy",
        "slug_en": "privacy",
        "content_ar": "نلتزم بحماية بيانات الزوار والعملاء واستخدامها فقط لأغراض التواصل وتقديم الخدمات وتحسين تجربة الموقع، ولا نشاركها مع أي طرف غير مصرح به.",
        "content_en": "We protect visitor and customer data and use it only for communication, service delivery, and improving the website experience. We do not share it with unauthorized parties.",
        "sections": {},
    },
    {
        "page_key": "terms",
        "title_ar": "الشروط والأحكام",
        "title_en": "Terms and Conditions",
        "slug_ar": "terms",
        "slug_en": "terms",
        "content_ar": "استخدام الموقع أو إرسال طلب مشروع يعني الموافقة على التواصل حول الطلب، ويتم تحديد نطاق العمل والتكاليف والمدة ضمن عرض مستقل قبل بدء التنفيذ.",
        "content_en": "Using the website or submitting a project request means agreeing to communication about the request. Scope, cost, and timeline are defined in a separate proposal before work begins.",
        "sections": {},
    },
    {
        "page_key": "support",
        "title_ar": "الدعم الفني",
        "title_en": "Support",
        "slug_ar": "support",
        "slug_en": "support",
        "content_ar": "يمكن للعملاء إرسال طلبات الدعم أو الاستفسارات الفنية ليتم مراجعتها والرد عليها حسب الأولوية ونوع الخدمة أو التطبيق.",
        "content_en": "Customers can submit support or technical inquiries to be reviewed and answered based on priority and service or app type.",
        "sections": {},
    },
    {
        "page_key": "work-process",
        "title_ar": "آلية العمل",
        "title_en": "Work Process",
        "slug_ar": "work-process",
        "slug_en": "work-process",
        "content_ar": "نبدأ بفهم الفكرة والمتطلبات، ثم نحدد الخطة والهيكل، وبعدها نبني نسخة عملية قابلة للاختبار والتطوير ثم التسليم والدعم.",
        "content_en": "We start by understanding the idea and requirements, then define the plan and structure, build a testable version, and proceed to delivery and support.",
        "sections": {
            "steps_ar": ["تحليل المتطلبات", "تصميم التجربة", "تطوير النسخة الأولى", "اختبار وتحسين", "تسليم ودعم"],
            "steps_en": ["Requirements analysis", "UX design", "First version development", "Testing and improvement", "Delivery and support"],
        },
    },
]

BLOG_CATEGORIES = [
    ("برمجة وتطوير", "Development", "development", "development"),
    ("أنظمة الشركات", "Business Systems", "business-systems", "business-systems"),
    ("تجربة المستخدم", "User Experience", "user-experience", "user-experience"),
]

BLOG_POSTS = [
    {
        "title_ar": "كيف تختار شركة برمجيات مناسبة لمشروعك؟",
        "title_en": "How to Choose the Right Software Partner",
        "slug_ar": "choose-software-partner",
        "slug_en": "choose-software-partner",
        "category_slug": "development",
        "excerpt_ar": "معايير عملية تساعدك على تقييم الشركة أو المطور قبل بدء المشروع.",
        "excerpt_en": "Practical criteria to evaluate a company or developer before starting a project.",
        "content_ar": "اختيار الشريك البرمجي المناسب يبدأ من وضوح المتطلبات، فهم الخبرة السابقة، طريقة التواصل، قابلية التوسع، وخطة الدعم بعد التسليم.",
        "content_en": "Choosing the right software partner starts with clear requirements, past experience, communication style, scalability, and post-delivery support plans.",
        "sort_order": 10,
    },
    {
        "title_ar": "لماذا تحتاج الشركات إلى لوحة تحكم احترافية؟",
        "title_en": "Why Businesses Need a Professional Admin Panel",
        "slug_ar": "why-admin-panel-matters",
        "slug_en": "why-admin-panel-matters",
        "category_slug": "business-systems",
        "excerpt_ar": "لوحة التحكم تجعل إدارة المحتوى والطلبات والمستخدمين أكثر تنظيمًا.",
        "excerpt_en": "An admin panel makes content, requests, and user management more organized.",
        "content_ar": "لوحة التحكم ليست إضافة شكلية، بل هي مركز تشغيل المشروع. من خلالها تتم إدارة المحتوى والطلبات والصلاحيات والوسائط والإعدادات.",
        "content_en": "An admin panel is not a decorative feature; it is the project operations center for content, requests, permissions, media, and settings.",
        "sort_order": 20,
    },
    {
        "title_ar": "الفرق بين الموقع التعريفي وتطبيق الويب",
        "title_en": "Website vs Web Application",
        "slug_ar": "website-vs-web-app",
        "slug_en": "website-vs-web-app",
        "category_slug": "development",
        "excerpt_ar": "متى تحتاج موقعًا تعريفيًا، ومتى تحتاج تطبيق ويب تفاعلي؟",
        "excerpt_en": "When do you need a website, and when do you need an interactive web app?",
        "content_ar": "الموقع التعريفي يركز على عرض الهوية والخدمات، بينما تطبيق الويب يركز على تنفيذ عمليات وتفاعل وحفظ بيانات وإدارة مستخدمين.",
        "content_en": "A website focuses on presenting brand and services, while a web app focuses on workflows, interaction, data, and users.",
        "sort_order": 30,
    },
]

EMAIL_TEMPLATES = [
    ("quote_request_received", "تم استلام طلب مشروعك", "Your project request has been received", "مرحبًا {full_name}، تم استلام طلبك وسيتواصل معك الفريق قريبًا.", "Hello {full_name}, your request has been received and our team will contact you soon.", ["full_name"]),
    ("contact_message_received", "تم استلام رسالتك", "Your message has been received", "مرحبًا {full_name}، شكرًا لتواصلك معنا. سنراجع الرسالة ونرد عليك قريبًا.", "Hello {full_name}, thank you for contacting us. We will review your message and reply soon.", ["full_name"]),
    ("support_request_received", "تم استلام طلب الدعم", "Your support request has been received", "مرحبًا {full_name}، تم استلام طلب الدعم الخاص بك وسيتم مراجعته حسب الأولوية.", "Hello {full_name}, your support request has been received and will be reviewed by priority.", ["full_name"]),
    ("admin_new_quote_request", "طلب مشروع جديد", "New project request", "تم إرسال طلب مشروع جديد من {full_name}. راجع لوحة التحكم للتفاصيل.", "A new project request was submitted by {full_name}. Check the admin panel for details.", ["full_name"]),
    ("admin_new_contact_message", "رسالة تواصل جديدة", "New contact message", "تم إرسال رسالة تواصل جديدة من {full_name}.", "A new contact message was submitted by {full_name}.", ["full_name"]),
]

ROLES = [
    ("super_admin", "مدير النظام", "Super Admin", "صلاحيات كاملة لإدارة المنصة.", "Full platform administration permissions.", PERMISSION_CATALOG),
    ("content_manager", "مدير المحتوى", "Content Manager", "إدارة الخدمات والأنظمة والوسائط والصفحات.", "Manage services, systems, media, and pages.", [PermissionKey.MANAGE_SERVICES, PermissionKey.MANAGE_PRODUCTS, PermissionKey.MANAGE_APPS, PermissionKey.MANAGE_PORTFOLIO, PermissionKey.MANAGE_STATIC_PAGES, PermissionKey.MANAGE_FAQ, PermissionKey.MANAGE_MEDIA, PermissionKey.MANAGE_BLOG]),
    ("support_agent", "موظف الدعم", "Support Agent", "متابعة الرسائل وطلبات الدعم وعروض الأسعار.", "Handle messages, support requests, and quotes.", [PermissionKey.MANAGE_QUOTES, PermissionKey.MANAGE_CONTACT_MESSAGES, PermissionKey.MANAGE_SUPPORT_REQUESTS, PermissionKey.VIEW_NOTIFICATIONS]),
    ("viewer", "مشاهد", "Viewer", "صلاحية قراءة محدودة بدون تعديلات حساسة.", "Limited read-only access without sensitive changes.", [PermissionKey.MANAGE_DASHBOARD, PermissionKey.VIEW_ANALYTICS, PermissionKey.VIEW_AUDIT_LOGS]),
]


def _update_or_create_product(item: dict[str, Any]) -> tuple[bool, bool]:
    product = models.Product.objects.filter(Q(slug_ar=item["slug_ar"]) | Q(slug_en=item["slug_en"])).first()
    defaults = {
        "name_ar": item["name_ar"],
        "name_en": item["name_en"],
        "slug_ar": item["slug_ar"],
        "slug_en": item["slug_en"],
        "short_description_ar": item["short_description_ar"],
        "short_description_en": item["short_description_en"],
        "full_description_ar": item["full_description_ar"],
        "full_description_en": item["full_description_en"],
        "product_type": item.get("product_type", models.ProductType.WEB),
        "status": item.get("status", models.ProductStatus.AVAILABLE),
        "target_audience_ar": item.get("target_audience_ar", ""),
        "target_audience_en": item.get("target_audience_en", ""),
        "requirements_ar": item.get("requirements_ar", ""),
        "requirements_en": item.get("requirements_en", ""),
        "seo_title_ar": item["name_ar"],
        "seo_title_en": item["name_en"],
        "seo_description_ar": item["short_description_ar"][:500],
        "seo_description_en": item["short_description_en"][:500],
        "show_demo_request": True,
        "sort_order": item.get("sort_order", 0),
        "is_active": True,
        "is_deleted": False,
        "deleted_at": None,
        "extra_data": {"source": "platform_foundation_seed", "managed_by_admin": True, "category": "system"},
    }
    created = False
    if product:
        for key, value in defaults.items():
            setattr(product, key, value)
        product.save()
    else:
        product = models.Product.objects.create(**defaults)
        created = True

    product.features.all().delete()
    for index, (title_ar, title_en, description_ar, description_en) in enumerate(item.get("features", []), start=1):
        models.ProductFeature.objects.create(
            product_id=product,
            title_ar=title_ar,
            title_en=title_en,
            description_ar=description_ar,
            description_en=description_en,
            sort_order=index * 10,
            is_active=True,
        )

    product.faqs.all().delete()
    for index, (question_ar, question_en, answer_ar, answer_en) in enumerate(item.get("faqs", []), start=1):
        models.ProductFaq.objects.create(
            product_id=product,
            question_ar=question_ar,
            question_en=question_en,
            answer_ar=answer_ar,
            answer_en=answer_en,
            sort_order=index * 10,
            is_active=True,
        )

    return created, not created


def _seed_settings() -> None:
    obj = models.SiteSettings.objects.order_by("created_at").first() or models.SiteSettings()
    payload = {
        "site_name_ar": "سيرفا كود",
        "site_name_en": "ServaCode",
        "company_legal_name_ar": "سيرفا كود للحلول البرمجية",
        "company_legal_name_en": "ServaCode Software Solutions",
        "company_description_ar": "نطوّر مواقع وأنظمة وتطبيقات ولوحات تحكم احترافية للشركات والمشاريع التي تحتاج حلولًا رقمية واضحة وقابلة للتوسع.",
        "company_description_en": "We build professional websites, systems, apps, and admin dashboards for businesses that need clear and scalable digital solutions.",
        "active_theme": models.ThemeCode.BLUE_TECH,
        "default_language": models.LanguageCode.AR,
        "is_english_enabled": True,
        "email": "info@servacode.com",
        "support_email": "support@servacode.com",
        "phone": "",
        "whatsapp": "",
        "address_ar": "يتم تحديد العنوان الرسمي لاحقًا من لوحة التحكم.",
        "address_en": "The official address can be updated later from the admin panel.",
        "working_hours_ar": "من السبت إلى الخميس حسب المواعيد المتفق عليها",
        "working_hours_en": "Saturday to Thursday by appointment",
        "social_links": {"facebook": "", "instagram": "", "linkedin": "", "github": ""},
        "seo_title_ar": "سيرفا كود | تطوير مواقع وأنظمة وتطبيقات ولوحات تحكم",
        "seo_title_en": "ServaCode | Websites, Systems, Apps, and Admin Panels",
        "seo_description_ar": "شركة برمجيات تقدم تطوير مواقع، تطبيقات، أنظمة إدارية، لوحات تحكم، وحلول رقمية مخصصة.",
        "seo_description_en": "A software studio providing websites, apps, business systems, admin dashboards, and custom digital solutions.",
        "footer_text_ar": "حلول برمجية احترافية قابلة للتطوير والنمو.",
        "footer_text_en": "Professional software solutions built to scale.",
        "visible_sections": {
            "build": True,
            "composition": True,
            "architecture": True,
            "why": True,
            "process": True,
            "technologies": True,
            "services": True,
            "products": True,
            "apps": True,
            "portfolio": True,
            "blog": True,
            "testimonials": True,
            "faqs": True,
            "contact": True,
            "cta": True,
        },
        "extra_settings": {
            "seeded_by": "platform_foundation_seed",
            "foundation_version": "15.9",
            "positioning": {
                "ar": "شركة برمجيات تبني مواقع وأنظمة وتطبيقات ولوحات تحكم بروح واحدة وهوية احترافية.",
                "en": "A software studio building websites, systems, apps, and dashboards with one unified professional identity.",
            },
            "home": {
                "hero_title_ar": "نحوّل فكرتك إلى موقع أو نظام أو تطبيق احترافي",
                "hero_title_en": "We turn your idea into a professional website, system, or app",
                "hero_subtitle_ar": "حلول برمجية مصممة بعناية، بلوحات تحكم مركزية وتجربة استخدام حديثة ودعم عربي/إنجليزي.",
                "hero_subtitle_en": "Carefully built software solutions with centralized admin panels, modern UX, and Arabic/English support.",
                "primary_cta_ar": "اطلب عرض سعر",
                "primary_cta_en": "Request a Quote",
                "secondary_cta_ar": "استعرض الخدمات",
                "secondary_cta_en": "Explore Services",
                "technologies": [
                    "Next.js",
                    "React",
                    "TypeScript",
                    "Django REST Framework",
                    "PostgreSQL",
                    "Tailwind CSS",
                    "PySide6",
                    "REST APIs",
                    "Role-based Access",
                    "SEO Ready",
                ],
                "principles_ar": ["تحليل قبل التنفيذ", "كود مركزي قابل للصيانة", "واجهة واضحة", "تسليم قابل للتطوير"],
                "principles_en": ["Analysis before execution", "Maintainable centralized code", "Clear UI", "Scalable delivery"],
            },
            "quote_project_types": [
                "website",
                "web_app",
                "desktop_app",
                "admin_panel",
                "saas",
                "api_integration",
                "other",
            ],
            "support_priorities": ["low", "normal", "high", "urgent"],
        },
    }
    for key, value in payload.items():
        setattr(obj, key, value)
    obj.save()


def _seed_roles() -> None:
    for name, display_ar, display_en, desc_ar, desc_en, permissions in ROLES:
        models.Role.objects.update_or_create(
            name=name,
            defaults={
                "display_name_ar": display_ar,
                "display_name_en": display_en,
                "description_ar": desc_ar,
                "description_en": desc_en,
                "permissions": permissions,
                "is_system": True,
            },
        )


def _seed_general_faqs() -> None:
    for index, (question_ar, question_en, answer_ar, answer_en) in enumerate(GENERAL_FAQS, start=1):
        models.Faq.objects.update_or_create(
            scope=models.FaqScope.GENERAL,
            question_ar=question_ar,
            defaults={
                "question_en": question_en,
                "answer_ar": answer_ar,
                "answer_en": answer_en,
                "sort_order": index * 10,
                "is_active": True,
                "is_deleted": False,
                "deleted_at": None,
            },
        )


def _seed_static_pages() -> None:
    for item in STATIC_PAGES:
        models.StaticPage.objects.update_or_create(
            page_key=item["page_key"],
            defaults={
                **item,
                "seo_title_ar": item["title_ar"],
                "seo_title_en": item["title_en"],
                "seo_description_ar": item["content_ar"][:500],
                "seo_description_en": item["content_en"][:500],
                "is_active": True,
                "is_deleted": False,
                "deleted_at": None,
            },
        )


def _seed_blog() -> None:
    categories = {}
    for order, (name_ar, name_en, slug_ar, slug_en) in enumerate(BLOG_CATEGORIES, start=1):
        category, _ = models.BlogCategory.objects.update_or_create(
            slug_en=slug_en,
            defaults={
                "name_ar": name_ar,
                "name_en": name_en,
                "slug_ar": slug_ar,
                "slug_en": slug_en,
                "description_ar": name_ar,
                "description_en": name_en,
                "sort_order": order * 10,
                "is_active": True,
                "is_deleted": False,
                "deleted_at": None,
            },
        )
        categories[slug_en] = category

    for item in BLOG_POSTS:
        category = categories.get(item["category_slug"])
        models.BlogPost.objects.update_or_create(
            slug_en=item["slug_en"],
            defaults={
                "category_id": category,
                "title_ar": item["title_ar"],
                "title_en": item["title_en"],
                "slug_ar": item["slug_ar"],
                "slug_en": item["slug_en"],
                "excerpt_ar": item["excerpt_ar"],
                "excerpt_en": item["excerpt_en"],
                "content_ar": item["content_ar"],
                "content_en": item["content_en"],
                "seo_title_ar": item["title_ar"],
                "seo_title_en": item["title_en"],
                "seo_description_ar": item["excerpt_ar"],
                "seo_description_en": item["excerpt_en"],
                "status": models.PublishStatus.PUBLISHED,
                "published_at": timezone.now(),
                "is_featured": True,
                "sort_order": item["sort_order"],
                "tags": ["software", "business", "digital"],
                "is_deleted": False,
                "deleted_at": None,
            },
        )


def _seed_email_templates() -> None:
    for key, subject_ar, subject_en, body_ar, body_en, variables in EMAIL_TEMPLATES:
        models.EmailTemplate.objects.update_or_create(
            key=key,
            defaults={
                "subject_ar": subject_ar,
                "subject_en": subject_en,
                "body_ar": body_ar,
                "body_en": body_en,
                "variables": variables,
                "is_active": True,
            },
        )


def _seed_testimonials() -> None:
    testimonials = [
        ("عميل تجريبي", "شركة تقنية", "إدارة المشروع", "تم تجهيز هذا الرأي كمثال مخفي يمكن تعديله أو حذفه لاحقًا.", "This hidden sample testimonial can be edited or deleted later."),
        ("عميل تجريبي", "مشروع خدمي", "صاحب المشروع", "نموذج رأي مبدئي غير منشور لتجربة قسم آراء العملاء.", "An unpublished sample testimonial for testing the testimonials section."),
    ]
    for index, (client, company, position, text_ar, text_en) in enumerate(testimonials, start=1):
        models.Testimonial.objects.update_or_create(
            client_name=f"{client} {index}",
            defaults={
                "company_name": company,
                "position": position,
                "text_ar": text_ar,
                "text_en": text_en,
                "rating": 5,
                "sort_order": index * 10,
                "is_active": False,
                "is_deleted": False,
                "deleted_at": None,
            },
        )


@transaction.atomic
def seed_platform_foundation() -> dict[str, int]:
    _seed_roles()
    _seed_settings()
    services_created, services_updated = seed_professional_services(skip_existing=False, active=True)

    products_created = 0
    products_updated = 0
    for item in SYSTEM_PRODUCTS:
        created, updated = _update_or_create_product(item)
        products_created += int(created)
        products_updated += int(updated)

    _seed_general_faqs()
    _seed_static_pages()
    _seed_blog()
    _seed_email_templates()
    _seed_testimonials()

    return {
        "services_created": services_created,
        "services_updated": services_updated,
        "systems_total": len(SYSTEM_PRODUCTS),
        "systems_created": products_created,
        "systems_updated": products_updated,
        "faqs_total": len(GENERAL_FAQS),
        "static_pages_total": len(STATIC_PAGES),
        "blog_posts_total": len(BLOG_POSTS),
        "email_templates_total": len(EMAIL_TEMPLATES),
    }


def main() -> None:
    result = seed_platform_foundation()
    print("تم تجهيز المحتوى التأسيسي للمنصة بنجاح.")
    for key, value in result.items():
        print(f"- {key}: {value}")
    print("ملاحظة: تطبيقاتنا لا يتم إنشاؤها تلقائيًا لأنها تحتاج ملفات وروابط تحميل حقيقية.")


if __name__ == "__main__":
    main()
