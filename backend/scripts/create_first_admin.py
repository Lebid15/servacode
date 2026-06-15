"""
=====================================================
سكربت إنشاء أول Super Admin
يشغل بعد تنفيذ migration لإنشاء أدوار النظام وأول مدير منصة
=====================================================

مثال تشغيل:

python scripts/create_first_admin.py --username admin --password "StrongPassword123" --full-name "مدير المنصة" --email admin@example.com
"""

# ruff: noqa: E402, I001

from __future__ import annotations

import argparse
import getpass
import os
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django  # noqa: E402

django.setup()

from platform_api.auth import hash_password  # noqa: E402
from platform_api.models import Role, User, UserStatus  # noqa: E402
from platform_api.permissions import PERMISSION_CATALOG  # noqa: E402


def parse_args() -> argparse.Namespace:
    """
    قراءة معاملات السكربت من سطر الأوامر.
    """
    parser = argparse.ArgumentParser(description="Create first Super Admin user.")

    parser.add_argument("--username", required=True, help="اسم المستخدم")
    parser.add_argument("--password", required=False, help="كلمة المرور")
    parser.add_argument("--full-name", default="مدير المنصة", help="الاسم الكامل")
    parser.add_argument("--email", default=None, help="البريد الإلكتروني")
    parser.add_argument("--phone", default=None, help="رقم الهاتف")

    return parser.parse_args()


def main() -> None:
    """
    إنشاء الأدوار الافتراضية ثم إنشاء أول مدير منصة.
    """
    args = parse_args()
    password = args.password or getpass.getpass("Password: ")

    if len(password) < 8:
        raise SystemExit("كلمة المرور يجب أن تكون 8 أحرف على الأقل.")

    super_admin_role, _created = Role.objects.update_or_create(
        name="super_admin",
        defaults={
            "display_name_ar": "مدير النظام",
            "display_name_en": "Super Admin",
            "description_ar": "صلاحيات كاملة لإدارة المنصة.",
            "description_en": "Full platform administration permissions.",
            "permissions": PERMISSION_CATALOG,
            "is_system": True,
        },
    )

    if User.objects.filter(username=args.username).exists() or (args.email and User.objects.filter(email=args.email).exists()):
        raise SystemExit("اسم المستخدم أو البريد الإلكتروني مستخدم مسبقًا.")

    user = User.objects.create(
        role_id=super_admin_role,
        full_name=args.full_name,
        username=args.username,
        email=args.email,
        phone=args.phone,
        hashed_password=hash_password(password),
        status=UserStatus.ACTIVE,
        is_superuser=True,
    )

    print("تم إنشاء مدير المنصة بنجاح.")
    print(f"User ID: {user.id}")
    print(f"Username: {user.username}")


if __name__ == "__main__":
    main()
