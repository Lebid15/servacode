"""
=====================================================
Phase 15.4 - Full End-to-End API Contract QA
اختبارات تثبيت المسار الكامل: لوحة الأدمن -> الباكند -> الموقع العام
=====================================================
"""

from __future__ import annotations

import pytest

from platform_api.auth import build_tokens
from platform_api.models import (
    AppPlatform,
    AppPricingType,
    AppStatus,
    AppType,
    AuditLog,
    ContactMessage,
    PortfolioProject,
    Product,
    ProductStatus,
    ProductType,
    QuoteRequest,
    Role,
    Service,
    SiteSettings,
    SoftwareApp,
    SupportRequest,
    User,
    UserStatus,
)
from platform_api.permissions import PERMISSION_CATALOG


@pytest.fixture()
def admin_auth_headers(db):
    role = Role.objects.create(
        name="super_admin_e2e",
        display_name_ar="مدير اختبار شامل",
        display_name_en="Full QA Admin",
        permissions=PERMISSION_CATALOG,
        is_system=True,
    )
    user = User.objects.create_user(
        role_id=role,
        full_name="Full QA Admin",
        username="full-qa-admin",
        email="full-qa-admin@example.com",
        password="Admin12345!",
        status=UserStatus.ACTIVE,
        is_superuser=True,
    )
    return {"HTTP_AUTHORIZATION": f"Bearer {build_tokens(user)['access_token']}"}


def assert_success(response, status_code=200):
    assert response.status_code == status_code
    payload = response.json()
    assert payload["success"] is True
    assert "data" in payload
    return payload["data"]


@pytest.mark.django_db
def test_admin_service_lifecycle_is_visible_on_public_site(client, admin_auth_headers):
    create_payload = {
        "title_ar": "تطوير مواقع احترافية",
        "title_en": "Professional Websites",
        "slug_ar": "professional-websites-ar",
        "slug_en": "professional-websites",
        "description_ar": "خدمة بناء مواقع للشركات.",
        "description_en": "Company website development service.",
        "full_description_ar": "نحول هوية الشركة إلى موقع سريع وقابل للإدارة.",
        "features": [
            {
                "title_ar": "لوحة تحكم",
                "description_ar": "إدارة المحتوى من مكان واحد.",
                "sort_order": 10,
                "is_active": True,
            }
        ],
        "is_active": True,
    }

    created = assert_success(client.post("/api/v1/admin/services", create_payload, format="json", **admin_auth_headers), 201)
    assert created["title_en"] == "Professional Websites"
    assert created["features"][0]["title_en"] == "لوحة تحكم"

    public_detail = assert_success(client.get("/api/v1/public/services/professional-websites"))
    assert public_detail["slug_en"] == "professional-websites"
    assert len(public_detail["features"]) == 1

    updated = assert_success(
        client.patch(
            f"/api/v1/admin/services/{created['id']}",
            {"is_active": False},
            format="json",
            **admin_auth_headers,
        )
    )
    assert updated["is_active"] is False

    hidden_response = client.get("/api/v1/public/services/professional-websites")
    assert hidden_response.status_code == 404
    assert hidden_response.json()["success"] is False

    assert Service.objects.filter(slug_en="professional-websites", is_active=False).exists()
    assert AuditLog.objects.filter(entity_id=created["id"]).exists()


@pytest.mark.django_db
def test_admin_product_nested_content_is_returned_publicly(client, admin_auth_headers):
    payload = {
        "name_ar": "نظام إدارة أعمال",
        "slug_ar": "business-suite-ar",
        "slug_en": "business-suite",
        "short_description_ar": "نظام مركزي لإدارة الأعمال.",
        "full_description_ar": "حل متكامل لإدارة العمليات والتقارير.",
        "product_type": ProductType.SAAS,
        "status": ProductStatus.AVAILABLE,
        "target_audience_ar": "الشركات الصغيرة والمتوسطة.",
        "requirements_ar": "متصفح حديث واتصال إنترنت.",
        "main_image_url": "/media/products/business-suite.webp",
        "features": [
            {"title_ar": "تقارير", "description_ar": "لوحات قياس واضحة.", "sort_order": 10, "is_active": True}
        ],
        "images": [
            {"image_url": "/media/products/screen-1.webp", "alt_text_ar": "واجهة النظام", "sort_order": 10, "is_primary": True}
        ],
        "faqs": [
            {"question_ar": "هل يدعم العربية؟", "answer_ar": "نعم بشكل كامل.", "sort_order": 10, "is_active": True}
        ],
        "is_active": True,
    }

    created = assert_success(client.post("/api/v1/admin/products", payload, format="json", **admin_auth_headers), 201)
    assert created["name_en"] == "نظام إدارة أعمال"
    assert created["target_audience_en"] == "الشركات الصغيرة والمتوسطة."
    assert len(created["features"]) == 1
    assert len(created["images"]) == 1
    assert len(created["faqs"]) == 1

    public_detail = assert_success(client.get("/api/v1/public/products/business-suite"))
    assert public_detail["main_image_url"] == "/media/products/business-suite.webp"
    assert public_detail["features"][0]["title_ar"] == "تقارير"
    assert public_detail["images"][0]["image_url"] == "/media/products/screen-1.webp"
    assert public_detail["faqs"][0]["answer_en"] == "نعم بشكل كامل."

    assert Product.objects.filter(slug_en="business-suite").exists()


@pytest.mark.django_db
def test_admin_app_download_contract_is_returned_publicly(client, admin_auth_headers):
    payload = {
        "name_ar": "أداة فواتير ويندوز",
        "slug_ar": "invoice-tool-ar",
        "slug_en": "invoice-tool",
        "short_description_ar": "تطبيق سطح مكتب لإدارة الفواتير.",
        "full_description_ar": "أداة خفيفة للتنزيل والاستخدام المحلي.",
        "app_type": AppType.DESKTOP,
        "platform": AppPlatform.WINDOWS,
        "status": AppStatus.AVAILABLE,
        "pricing_type": AppPricingType.FREE,
        "download_url": "https://example.com/downloads/invoice-tool.exe",
        "download_files": [
            {"label_ar": "نسخة ويندوز", "url": "https://example.com/downloads/invoice-tool.exe", "version": "1.0.0"}
        ],
        "features": [{"title_ar": "طباعة PDF", "description_ar": "تصدير الفاتورة مباشرة."}],
        "screenshots": [{"image_url": "/media/apps/invoice/screen.webp", "alt_text_ar": "واجهة التطبيق"}],
        "requirements": {"windows": "Windows 10 أو أحدث"},
        "changelog": [{"version": "1.0.0", "changes_ar": "الإصدار الأول"}],
        "is_active": True,
    }

    created = assert_success(client.post("/api/v1/admin/apps", payload, format="json", **admin_auth_headers), 201)
    assert created["name_en"] == "أداة فواتير ويندوز"
    assert created["download_url"].endswith("invoice-tool.exe")

    public_detail = assert_success(client.get("/api/v1/public/apps/invoice-tool"))
    assert public_detail["download_url"] == "https://example.com/downloads/invoice-tool.exe"
    assert public_detail["download_files"][0]["url"].endswith("invoice-tool.exe")
    assert public_detail["platform"] == AppPlatform.WINDOWS

    hidden = assert_success(
        client.patch(
            f"/api/v1/admin/apps/{created['id']}",
            {"status": AppStatus.HIDDEN},
            format="json",
            **admin_auth_headers,
        )
    )
    assert hidden["status"] == AppStatus.HIDDEN
    assert client.get("/api/v1/public/apps/invoice-tool").status_code == 404
    assert SoftwareApp.objects.filter(slug_en="invoice-tool").exists()


@pytest.mark.django_db
def test_admin_portfolio_gallery_is_returned_publicly(client, admin_auth_headers):
    payload = {
        "title_ar": "موقع شركة تقنية",
        "slug_ar": "tech-company-site-ar",
        "slug_en": "tech-company-site",
        "description_ar": "موقع تعريفي احترافي.",
        "full_description_ar": "بناء موقع سريع يعرض الخدمات والأعمال.",
        "problem_ar": "ضعف الحضور الرقمي.",
        "result_ar": "واجهة أسرع وتجربة أوضح.",
        "category_ar": "مواقع ويب",
        "technologies": ["Next.js", "Django"],
        "gallery_images": ["/media/portfolio/one.webp", "/media/portfolio/two.webp"],
        "main_image_url": "/media/portfolio/main.webp",
        "preview_url": "https://example.com/demo",
        "is_active": True,
    }

    created = assert_success(client.post("/api/v1/admin/portfolio", payload, format="json", **admin_auth_headers), 201)
    assert created["title_en"] == "موقع شركة تقنية"
    assert created["technologies"] == ["Next.js", "Django"]

    public_detail = assert_success(client.get("/api/v1/public/portfolio/tech-company-site"))
    assert public_detail["gallery_images"] == ["/media/portfolio/one.webp", "/media/portfolio/two.webp"]
    assert public_detail["problem_en"] == "ضعف الحضور الرقمي."
    assert public_detail["result_en"] == "واجهة أسرع وتجربة أوضح."
    assert PortfolioProject.objects.filter(slug_en="tech-company-site").exists()


@pytest.mark.django_db
def test_settings_and_public_forms_complete_the_visitor_to_admin_flow(client, admin_auth_headers):
    settings_payload = {
        "site_name_ar": "سيرفا كود",
        "site_name_en": "Serva Code",
        "company_description_ar": "شركة حلول برمجية ولوحات تحكم.",
        "email": "info@example.com",
        "phone": "+905000000000",
        "whatsapp": "+905000000000",
        "visible_sections": {"services": True, "apps": True, "portfolio": True},
    }

    admin_settings = assert_success(client.patch("/api/v1/admin/settings", settings_payload, format="json", **admin_auth_headers))
    assert admin_settings["site_name_ar"] == "سيرفا كود"

    public_settings = assert_success(client.get("/api/v1/public/settings"))
    assert public_settings["site_name_en"] == "Serva Code"
    assert public_settings["visible_sections"]["apps"] is True

    contact = assert_success(
        client.post(
            "/api/v1/public/contact",
            {"full_name": "عميل تواصل", "phone": "+905111111111", "subject": "استفسار", "message": "أريد معرفة الخدمات."},
            format="json",
        ),
        201,
    )
    quote = assert_success(
        client.post(
            "/api/v1/public/quote-requests",
            {
                "full_name": "عميل عرض سعر",
                "phone": "+905222222222",
                "project_type": "website",
                "description": "أريد موقع شركة.",
                "preferred_contact_method": "whatsapp",
            },
            format="json",
        ),
        201,
    )
    support = assert_success(
        client.post(
            "/api/v1/public/support-requests",
            {"full_name": "عميل دعم", "phone": "+905333333333", "subject": "مشكلة تحميل", "message": "رابط التحميل لا يعمل."},
            format="json",
        ),
        201,
    )

    assert ContactMessage.objects.filter(id=contact["id"]).exists()
    assert QuoteRequest.objects.filter(id=quote["id"]).exists()
    assert SupportRequest.objects.filter(id=support["id"]).exists()

    admin_contacts = assert_success(client.get("/api/v1/admin/contact-messages", **admin_auth_headers))
    admin_quotes = assert_success(client.get("/api/v1/admin/quote-requests", **admin_auth_headers))
    admin_support = assert_success(client.get("/api/v1/admin/support-requests", **admin_auth_headers))

    assert any(item["id"] == contact["id"] for item in admin_contacts)
    assert any(item["id"] == quote["id"] for item in admin_quotes)
    assert any(item["id"] == support["id"] for item in admin_support)
    assert SiteSettings.objects.filter(site_name_ar="سيرفا كود").exists()
