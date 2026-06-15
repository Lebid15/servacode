"""
=====================================================
اختبارات Health endpoints
تختبر المسارات التي لا تحتاج قاعدة بيانات حقيقية
=====================================================
"""


def test_root_endpoint_returns_success(client):
    response = client.get("/")

    assert response.status_code == 200
    assert response.json()["success"] is True


def test_health_endpoint_returns_ok(client):
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["data"]["status"] == "ok"


def test_liveness_endpoint_returns_alive(client):
    response = client.get("/api/v1/health/live")

    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["data"]["status"] == "alive"
