"""
=====================================================
اختبارات إغلاق مرحلة الباكند وربط لوحة الأدمن
=====================================================
"""

import pytest

from platform_api.auth import build_tokens, verify_password
from platform_api.models import Product, ProductFaq, ProductFeature, ProductImage, Role, Service, ServiceFeature, User, UserStatus
from platform_api.permissions import PERMISSION_CATALOG


@pytest.fixture()
def admin_context(db):
    role = Role.objects.create(
        name="super_admin_closure",
        display_name_ar="مدير النظام",
        display_name_en="Super Admin",
        permissions=PERMISSION_CATALOG,
        is_system=True,
    )
    user = User.objects.create_user(
        role_id=role,
        full_name="Admin Closure",
        username="admin-closure",
        email="admin-closure@example.com",
        password="Admin12345!",
        status=UserStatus.ACTIVE,
        is_superuser=True,
    )
    return {"role": role, "user": user, "headers": {"HTTP_AUTHORIZATION": f"Bearer {build_tokens(user)['access_token']}"}}


@pytest.mark.django_db
def test_admin_can_create_user_with_plain_password_and_role_payload(client, admin_context):
    payload = {
        "role_id": str(admin_context["role"].id),
        "full_name": "Content User",
        "username": "content-user",
        "email": "content@example.com",
        "phone": "+900000000000",
        "password": "StrongPass123!",
        "status": UserStatus.ACTIVE,
        "is_superuser": False,
    }

    response = client.post("/api/v1/users", payload, format="json", **admin_context["headers"])

    assert response.status_code == 201
    body = response.json()
    assert body["success"] is True
    assert body["data"]["username"] == "content-user"
    assert "hashed_password" not in body["data"]
    assert body["data"]["role"]["name"] == "super_admin_closure"

    created = User.objects.get(username="content-user")
    assert verify_password("StrongPass123!", created.hashed_password)


@pytest.mark.django_db
def test_service_features_are_writable_from_admin_payload(client, admin_context):
    payload = {
        "title_ar": "تطوير مواقع",
        "title_en": "Website Development",
        "slug_ar": "website-development-ar",
        "slug_en": "website-development",
        "description_ar": "خدمة تطوير مواقع احترافية.",
        "description_en": "Professional website development service.",
        "features": [
            {
                "title_ar": "لوحة تحكم",
                "title_en": "Admin Panel",
                "description_ar": "إدارة المحتوى بسهولة.",
                "description_en": "Manage content easily.",
                "sort_order": 10,
                "is_active": True,
            }
        ],
    }

    response = client.post("/api/v1/admin/services", payload, format="json", **admin_context["headers"])

    assert response.status_code == 201
    body = response.json()
    assert body["success"] is True
    assert len(body["data"]["features"]) == 1
    service = Service.objects.get(slug_en="website-development")
    assert ServiceFeature.objects.filter(service_id=service, title_ar="لوحة تحكم").exists()


@pytest.mark.django_db
def test_product_nested_features_images_and_faqs_are_writable(client, admin_context):
    payload = {
        "name_ar": "نظام إدارة مطعم",
        "name_en": "Restaurant Management System",
        "slug_ar": "restaurant-system-ar",
        "slug_en": "restaurant-system",
        "short_description_ar": "نظام متكامل للمطاعم.",
        "short_description_en": "Integrated system for restaurants.",
        "features": [{"title_ar": "طلبات الطاولات", "title_en": "Table Orders", "sort_order": 10, "is_active": True}],
        "images": [{"image_url": "/media/demo/system.webp", "alt_text_ar": "واجهة النظام", "alt_text_en": "System UI", "sort_order": 10, "is_primary": True}],
        "faqs": [{"question_ar": "هل يدعم العربية؟", "question_en": "Does it support Arabic?", "answer_ar": "نعم.", "answer_en": "Yes.", "sort_order": 10, "is_active": True}],
    }

    response = client.post("/api/v1/admin/products", payload, format="json", **admin_context["headers"])

    assert response.status_code == 201
    body = response.json()
    assert body["success"] is True
    assert len(body["data"]["features"]) == 1
    assert len(body["data"]["images"]) == 1
    assert len(body["data"]["faqs"]) == 1

    product = Product.objects.get(slug_en="restaurant-system")
    assert ProductFeature.objects.filter(product_id=product, title_ar="طلبات الطاولات").exists()
    assert ProductImage.objects.filter(product_id=product, image_url="/media/demo/system.webp").exists()
    assert ProductFaq.objects.filter(product_id=product, question_ar="هل يدعم العربية؟").exists()
