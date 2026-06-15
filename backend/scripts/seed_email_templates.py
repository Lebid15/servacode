"""
=====================================================
Seed قوالب البريد الافتراضية
=====================================================
"""

# ruff: noqa: E402, I001

from __future__ import annotations

import os
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django  # noqa: E402

django.setup()

from platform_api.models import EmailTemplate  # noqa: E402


DEFAULT_TEMPLATES = [
    {
        "key": "quote_request_received",
        "subject_ar": "تم استلام طلب مشروعك",
        "subject_en": "Your project request has been received",
        "body_ar": "مرحبًا {full_name}، تم استلام طلبك وسيتواصل معك الفريق قريبًا.",
        "body_en": "Hello {full_name}, your request has been received and our team will contact you soon.",
        "variables": ["full_name"],
    },
    {
        "key": "contact_message_received",
        "subject_ar": "تم استلام رسالتك",
        "subject_en": "Your message has been received",
        "body_ar": "مرحبًا {full_name}، شكرًا لتواصلك معنا.",
        "body_en": "Hello {full_name}, thank you for contacting us.",
        "variables": ["full_name"],
    },
]


def main() -> None:
    """
    إنشاء/تحديث قوالب البريد الافتراضية.
    """
    templates = []
    for payload in DEFAULT_TEMPLATES:
        template, _created = EmailTemplate.objects.update_or_create(
            key=payload["key"],
            defaults={**payload, "is_active": True},
        )
        templates.append(template)

    print("تم تجهيز قوالب البريد الافتراضية بنجاح.")
    print(f"- إجمالي القوالب: {len(templates)}")
    for template in templates:
        print(f"- {template.key}")


if __name__ == "__main__":
    main()
