"""
=====================================================
اختبارات الاستجابات الموحدة
=====================================================
"""

from platform_api.responses import success_payload


def test_success_response_shape():
    payload = success_payload(data={"status": "ok"}, message="تم")

    assert payload["success"] is True
    assert payload["message"] == "تم"
    assert payload["data"]["status"] == "ok"


def test_success_response_with_meta():
    payload = success_payload(data=[], meta={"total": 0})

    assert payload["meta"]["total"] == 0
