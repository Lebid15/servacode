"""
=====================================================
اختبارات عقد API الموحد في Django
=====================================================
"""


def test_validation_errors_use_unified_shape(client):
    response = client.post("/api/v1/auth/login", {}, format="json")

    assert response.status_code == 400
    payload = response.json()
    assert payload["success"] is False
    assert payload["data"] is None
    assert payload["error"]["status_code"] == 400


def test_protected_endpoints_use_unified_auth_error(client):
    response = client.get("/api/v1/admin/services")

    assert response.status_code in {401, 403}
    payload = response.json()
    assert payload["success"] is False
    assert payload["data"] is None
    assert "error" in payload