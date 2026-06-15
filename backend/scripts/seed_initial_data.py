"""
=====================================================
Seed مبدئي لبيانات النظام
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

from platform_api.models import Role, SiteSettings  # noqa: E402
from platform_api.permissions import PERMISSION_CATALOG, PermissionKey  # noqa: E402


DEFAULT_ROLES = [
    {
        "name": "super_admin",
        "display_name_ar": "مدير النظام",
        "display_name_en": "Super Admin",
        "description_ar": "صلاحيات كاملة لإدارة المنصة.",
        "description_en": "Full platform administration permissions.",
        "permissions": PERMISSION_CATALOG,
        "is_system": True,
    },
    {
        "name": "content_manager",
        "display_name_ar": "مدير المحتوى",
        "display_name_en": "Content Manager",
        "description_ar": "إدارة المحتوى العام والوسائط.",
        "description_en": "Manage public content and media.",
        "permissions": [
            PermissionKey.MANAGE_SERVICES,
            PermissionKey.MANAGE_PRODUCTS,
            PermissionKey.MANAGE_APPS,
            PermissionKey.MANAGE_PORTFOLIO,
            PermissionKey.MANAGE_BLOG,
            PermissionKey.MANAGE_STATIC_PAGES,
            PermissionKey.MANAGE_TESTIMONIALS,
            PermissionKey.MANAGE_FAQ,
            PermissionKey.MANAGE_MEDIA,
        ],
        "is_system": True,
    },
    {
        "name": "support_agent",
        "display_name_ar": "موظف الدعم",
        "display_name_en": "Support Agent",
        "description_ar": "متابعة الطلبات والرسائل والدعم.",
        "description_en": "Handle quotes, contact messages, and support requests.",
        "permissions": [
            PermissionKey.MANAGE_QUOTES,
            PermissionKey.MANAGE_CONTACT_MESSAGES,
            PermissionKey.MANAGE_SUPPORT_REQUESTS,
            PermissionKey.VIEW_NOTIFICATIONS,
        ],
        "is_system": True,
    },
]


def main() -> None:
    """
    تشغيل seed مبدئي للأدوار.
    """
    roles = []
    for payload in DEFAULT_ROLES:
        role, _created = Role.objects.update_or_create(name=payload["name"], defaults=payload)
        roles.append(role)

    if not SiteSettings.objects.exists():
        SiteSettings.objects.create(
            site_name_ar="شركة البرمجيات",
            site_name_en="Software Studio",
            company_description_ar="منصة شركة برمجيات لإدارة الخدمات والمنتجات وطلبات العملاء.",
            company_description_en="A software company platform for services, products, and customer requests.",
        )

    print("تم تجهيز البيانات المبدئية:")
    for role in roles:
        print(f"- role: {role.name}")


if __name__ == "__main__":
    main()
