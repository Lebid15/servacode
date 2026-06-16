#!/bin/bash
set -e
cd /opt/servacode
docker compose --env-file .env.production exec -T backend python manage.py shell <<'PYEOF'
from platform_api import models
from platform_api.permissions import PERMISSION_CATALOG

role, created = models.Role.objects.update_or_create(
    name="super_admin",
    defaults={
        "display_name_ar": "مدير النظام",
        "display_name_en": "Super Admin",
        "description_ar": "صلاحيات كاملة لإدارة المنصة.",
        "description_en": "Full platform administration permissions.",
        "permissions": list(PERMISSION_CATALOG),
        "is_system": True,
    },
)
print("ROLE", "CREATED" if created else "UPDATED", role.name)

from django.contrib.auth import get_user_model
User = get_user_model()
username = "admin"
email = "servacode@gmail.com"
password = "Asdf1212asdf!!!"

u = User.objects.filter(username=username).first()
if u is None:
    u = User(username=username, email=email, role=role)
    action = "CREATED"
else:
    action = "UPDATED"
    u.email = email
    u.role = role
u.is_staff = True
u.is_superuser = True
u.is_active = True
u.set_password(password)
u.save()
print("USER", action, u.username, u.email, "role=" + u.role.name)
PYEOF
