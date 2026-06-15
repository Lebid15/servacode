"""
=====================================================
اختبارات الإعدادات المركزية
=====================================================
"""

from django.conf import settings


def test_cors_origins_are_split():
    assert "http://localhost:3000" in settings.CORS_ALLOWED_ORIGINS
    assert "http://localhost:3001" in settings.CORS_ALLOWED_ORIGINS


def test_upload_size_conversion():
    assert settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024 == 10 * 1024 * 1024
