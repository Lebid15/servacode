"""
=====================================================
اختبارات أدوات الأمان
=====================================================
"""

from datetime import timedelta

from platform_api.auth import create_token, decode_token, hash_password, verify_password


def test_password_hash_and_verify():
    password = "StrongPassword123"
    hashed = hash_password(password)

    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("WrongPassword123", hashed) is False


def test_access_token_decode():
    token = create_token("user-123", "access", timedelta(minutes=5), {"role": "admin"})
    payload = decode_token(token, expected_type="access")

    assert payload is not None
    assert payload["sub"] == "user-123"
    assert payload["role"] == "admin"
    assert payload["type"] == "access"


def test_refresh_token_decode_rejects_wrong_type():
    token = create_token("user-123", "refresh", timedelta(days=1))

    assert decode_token(token, expected_type="refresh") is not None
    assert decode_token(token, expected_type="access") is None
