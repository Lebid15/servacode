"""
=====================================================
إعدادات مشتركة لاختبارات الباكند
=====================================================
"""

import pytest
from rest_framework.test import APIClient


@pytest.fixture()
def client() -> APIClient:
    """عميل اختبار Django REST Framework."""
    return APIClient()
