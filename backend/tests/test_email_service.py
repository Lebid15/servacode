"""
=====================================================
اختبارات خدمة البريد
=====================================================
"""

from django.conf import settings

from platform_api.email import send_email


def test_email_service_disabled_does_not_send(monkeypatch):
    monkeypatch.setattr(settings, "ENABLE_EMAIL_NOTIFICATIONS", False)

    result = send_email(
        to="admin@example.com",
        subject="Test",
        body="Hello",
    )

    assert result.sent is False
    assert result.error == "email.disabled"
