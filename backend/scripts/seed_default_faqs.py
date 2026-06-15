"""
=====================================================
زرع الأسئلة الشائعة الافتراضية للموقع العام
=====================================================

الاستخدام من مجلد backend:
    $env:PYTHONPATH = (Get-Location).Path
    python .\\scripts\\seed_default_faqs.py

ملاحظات:
- السكربت لا يكرر الأسئلة الموجودة.
- إذا وجد السؤال سابقًا يقوم بتحديث نصه وترتيبه وتفعيله.
- الأسئلة قابلة للتعديل أو الإخفاء أو الحذف لاحقًا من لوحة الأدمن.
=====================================================
"""

# ruff: noqa: E402, I001

from __future__ import annotations

import os
import sys
from pathlib import Path
from typing import Any

from django.db.models import Q

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django  # noqa: E402

django.setup()

from platform_api.models import Faq, FaqScope  # noqa: E402

DEFAULT_FAQS: list[dict[str, Any]] = [
    {
        "scope": FaqScope.GENERAL,
        "sort_order": 10,
        "question_ar": "هل يمكنني طلب موقع خاص بشركتي؟",
        "answer_ar": "نعم، يمكننا تنفيذ موقع إلكتروني خاص بشركتك حسب طبيعة عملك، سواء كان موقعًا تعريفيًا، خدميًا، تجاريًا، أو موقعًا مع لوحة تحكم لإدارة المحتوى.",
        "question_en": "Can I request a custom website for my business?",
        "answer_en": "Yes, we can build a custom website for your business based on your needs, whether it is a company profile website, service website, business website, or a website with an admin dashboard.",
    },
    {
        "scope": FaqScope.GENERAL,
        "sort_order": 20,
        "question_ar": "هل الموقع يدعم اللغة العربية والإنجليزية؟",
        "answer_ar": "نعم، يمكن تنفيذ الموقع بلغتين مع دعم كامل لاتجاه الكتابة من اليمين إلى اليسار للعربية ومن اليسار إلى اليمين للإنجليزية.",
        "question_en": "Does the website support Arabic and English?",
        "answer_en": "Yes, we can build bilingual websites with full support for Arabic RTL layout and English LTR layout.",
    },
    {
        "scope": FaqScope.SERVICE,
        "sort_order": 30,
        "question_ar": "هل أستطيع تعديل محتوى الموقع من لوحة تحكم؟",
        "answer_ar": "نعم، يمكن تجهيز لوحة تحكم تتيح لك إدارة الخدمات، التطبيقات، الأعمال، الصفحات، الصور، الرسائل، وطلبات العملاء بدون الحاجة لتعديل الكود.",
        "question_en": "Can I manage website content from an admin panel?",
        "answer_en": "Yes, we can provide an admin panel that allows you to manage services, apps, portfolio items, pages, media, messages, and customer requests without editing code.",
    },
    {
        "scope": FaqScope.SERVICE,
        "sort_order": 40,
        "question_ar": "كم يستغرق تنفيذ موقع إلكتروني؟",
        "answer_ar": "مدة التنفيذ تختلف حسب حجم المشروع وعدد الصفحات والميزات المطلوبة. بعد مراجعة المتطلبات، يتم تحديد مدة واضحة وجدول عمل مناسب.",
        "question_en": "How long does it take to build a website?",
        "answer_en": "The timeline depends on the project size, number of pages, and required features. After reviewing the requirements, we provide a clear timeline and work plan.",
    },
    {
        "scope": FaqScope.PRODUCT,
        "sort_order": 50,
        "question_ar": "هل تنفذون تطبيقات ويب؟",
        "answer_ar": "نعم، يمكننا تطوير تطبيقات ويب مخصصة مثل لوحات التحكم، أنظمة الإدارة، منصات الحجز، أنظمة الطلبات، ولوحات متابعة الأعمال.",
        "question_en": "Do you build web applications?",
        "answer_en": "Yes, we develop custom web applications such as admin dashboards, management systems, booking platforms, order systems, and business tracking panels.",
    },
    {
        "scope": FaqScope.PRODUCT,
        "sort_order": 60,
        "question_ar": "هل تنفذون تطبيقات سطح مكتب؟",
        "answer_ar": "نعم، يمكننا تطوير تطبيقات سطح مكتب مخصصة للشركات والمحلات، مثل أنظمة الإدارة، المحاسبة، متابعة العمليات، وإدارة البيانات.",
        "question_en": "Do you develop desktop applications?",
        "answer_en": "Yes, we develop custom desktop applications for businesses and shops, such as management systems, accounting tools, operation tracking, and data management software.",
    },
    {
        "scope": FaqScope.PRODUCT,
        "sort_order": 70,
        "question_ar": "هل يمكن تطوير نظام إداري خاص بشركتي؟",
        "answer_ar": "نعم، يمكن بناء نظام إداري مخصص حسب طريقة عملك، مثل إدارة العملاء، الموظفين، الطلبات، المنتجات، التقارير، والصلاحيات.",
        "question_en": "Can you build a custom management system for my business?",
        "answer_en": "Yes, we can build a custom management system based on your workflow, including clients, employees, orders, products, reports, and user permissions.",
    },
    {
        "scope": FaqScope.PRODUCT,
        "sort_order": 80,
        "question_ar": "هل يمكن ربط الموقع أو النظام مع خدمات خارجية؟",
        "answer_ar": "نعم، يمكن ربط الموقع أو النظام مع خدمات خارجية مثل البريد الإلكتروني، واتساب، بوابات الدفع، واجهات API، أو أنظمة أخرى حسب الحاجة.",
        "question_en": "Can the website or system be integrated with external services?",
        "answer_en": "Yes, websites and systems can be integrated with external services such as email, WhatsApp, payment gateways, APIs, or other platforms based on your needs.",
    },
    {
        "scope": FaqScope.SERVICE,
        "sort_order": 90,
        "question_ar": "هل تقدمون تصميمًا متجاوبًا مع الجوال؟",
        "answer_ar": "نعم، يتم تصميم الواجهات لتعمل بشكل مناسب على أجهزة الكمبيوتر، التابلت، والجوال، مع مراعاة تجربة المستخدم وسهولة التصفح.",
        "question_en": "Do you provide mobile-responsive design?",
        "answer_en": "Yes, interfaces are designed to work properly on desktops, tablets, and mobile devices while maintaining a smooth user experience.",
    },
    {
        "scope": FaqScope.GENERAL,
        "sort_order": 100,
        "question_ar": "كيف يتم تحديد تكلفة المشروع؟",
        "answer_ar": "يتم تحديد التكلفة بناءً على حجم المشروع، عدد الصفحات، الميزات المطلوبة، مستوى التصميم، لوحة التحكم، والربط مع الخدمات الخارجية إن وجدت.",
        "question_en": "How is the project cost determined?",
        "answer_en": "The cost depends on the project size, number of pages, required features, design level, admin panel, and any external integrations.",
    },
    {
        "scope": FaqScope.GENERAL,
        "sort_order": 110,
        "question_ar": "هل يمكن البدء بميزات أساسية ثم تطوير المشروع لاحقًا؟",
        "answer_ar": "نعم، يمكن البدء بنسخة أولية منظمة وقابلة للتوسع، ثم إضافة ميزات جديدة لاحقًا حسب نمو المشروع واحتياجات العمل.",
        "question_en": "Can we start with basic features and expand later?",
        "answer_en": "Yes, we can start with a clean and scalable first version, then add more features later as the project grows.",
    },
    {
        "scope": FaqScope.GENERAL,
        "sort_order": 120,
        "question_ar": "هل تقدمون دعمًا بعد تسليم المشروع؟",
        "answer_ar": "نعم، يمكن الاتفاق على فترة دعم بعد التسليم لمتابعة الأخطاء، التعديلات البسيطة، والتحسينات حسب طبيعة المشروع.",
        "question_en": "Do you provide support after project delivery?",
        "answer_en": "Yes, post-delivery support can be arranged to handle issues, minor changes, and improvements depending on the project scope.",
    },
    {
        "scope": FaqScope.GENERAL,
        "sort_order": 130,
        "question_ar": "هل يمكن طلب تعديل أو تطوير على مشروع موجود؟",
        "answer_ar": "نعم، يمكن مراجعة مشروعك الحالي وتحديد إمكانية تطويره، تحسين واجهته، إصلاح مشاكله، أو إضافة ميزات جديدة عليه.",
        "question_en": "Can I request updates or improvements for an existing project?",
        "answer_en": "Yes, we can review your existing project and assess whether it can be improved, redesigned, fixed, or extended with new features.",
    },
    {
        "scope": FaqScope.GENERAL,
        "sort_order": 140,
        "question_ar": "كيف أرسل طلب مشروع جديد؟",
        "answer_ar": "يمكنك إرسال طلب مشروع من خلال نموذج طلب المشروع في الموقع، مع توضيح فكرة المشروع، نوعه، الميزانية المتوقعة، ووسيلة التواصل المناسبة.",
        "question_en": "How can I submit a new project request?",
        "answer_en": "You can submit a project request through the website form by describing your idea, project type, expected budget, and preferred contact method.",
    },
]


def _find_existing(payload: dict[str, Any]) -> Faq | None:
    return Faq.objects.filter(Q(question_ar=payload["question_ar"]) | Q(question_en=payload["question_en"])).first()


def seed_default_faqs() -> tuple[int, int]:
    created = 0
    updated = 0

    for payload in DEFAULT_FAQS:
        existing = _find_existing(payload)
        if existing is None:
            Faq.objects.create(
                scope=payload["scope"],
                service_id=None,
                product_id=None,
                question_ar=payload["question_ar"],
                question_en=payload["question_en"],
                answer_ar=payload["answer_ar"],
                answer_en=payload["answer_en"],
                sort_order=payload["sort_order"],
                is_active=True,
            )
            created += 1
            continue

        existing.scope = payload["scope"]
        existing.service_id = None
        existing.product_id = None
        existing.question_ar = payload["question_ar"]
        existing.question_en = payload["question_en"]
        existing.answer_ar = payload["answer_ar"]
        existing.answer_en = payload["answer_en"]
        existing.sort_order = payload["sort_order"]
        existing.is_active = True
        existing.is_deleted = False
        existing.save()
        updated += 1

    return created, updated


def main() -> None:
    created, updated = seed_default_faqs()
    print("تم زرع الأسئلة الشائعة الافتراضية بنجاح.")
    print(f"- تم إنشاء: {created}")
    print(f"- تم تحديث/إعادة تفعيل: {updated}")
    print("افتح لوحة الأدمن / الأسئلة الشائعة لمراجعتها وتعديلها.")


if __name__ == "__main__":
    main()
