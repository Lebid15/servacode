"""
=====================================================
اختبارات توافق الباكند مع عملاء الواجهات
=====================================================
"""

import pytest

from platform_api.auth import build_tokens, hash_password
from platform_api.models import ProjectType, QuoteRequest, Role, User, UserStatus
from platform_api.permissions import PERMISSION_CATALOG


@pytest.fixture()
def admin_headers(db):
    role = Role.objects.create(
        name="super_admin",
        display_name_ar="مدير النظام",
        display_name_en="Super Admin",
        permissions=PERMISSION_CATALOG,
        is_system=True,
    )
    user = User.objects.create(
        role_id=role,
        full_name="Admin User",
        username="admin-contract",
        email="admin-contract@example.com",
        hashed_password=hash_password("Admin12345!"),
        status=UserStatus.ACTIVE,
        is_superuser=True,
    )
    return {"HTTP_AUTHORIZATION": f"Bearer {build_tokens(user)['access_token']}"}


@pytest.mark.django_db
def test_frontend_compatibility_endpoints(client, admin_headers):
    roles_response = client.post("/api/v1/roles/ensure-defaults", **admin_headers)
    assert roles_response.status_code == 200
    assert roles_response.json()["success"] is True

    pages_response = client.post("/api/v1/admin/static-pages/ensure-defaults", **admin_headers)
    assert pages_response.status_code == 200
    assert pages_response.json()["success"] is True

    public_page_response = client.get("/api/v1/public/static-pages/privacy")
    assert public_page_response.status_code == 200
    assert public_page_response.json()["data"]["page_key"] == "privacy"

    templates_response = client.post("/api/v1/admin/email-templates/ensure-defaults", **admin_headers)
    assert templates_response.status_code == 200
    assert templates_response.json()["success"] is True

    analytics_response = client.get("/api/v1/admin/analytics/summary", **admin_headers)
    assert analytics_response.status_code == 200
    assert "events_count" in analytics_response.json()["data"]

    notifications_response = client.get("/api/v1/admin/notifications/unread-count", **admin_headers)
    assert notifications_response.status_code == 200
    assert notifications_response.json()["data"] == {"count": 0, "unread_count": 0}

    quote = QuoteRequest.objects.create(
        full_name="Test Customer",
        phone="123456789",
        project_type=ProjectType.WEBSITE,
        description="Need a website",
    )
    note_response = client.post(
        f"/api/v1/admin/quote-requests/{quote.id}/notes",
        {"note": "Follow up tomorrow"},
        format="json",
        **admin_headers,
    )
    assert note_response.status_code == 201
    assert note_response.json()["data"]["note"] == "Follow up tomorrow"
