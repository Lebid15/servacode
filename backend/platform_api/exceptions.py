from __future__ import annotations

from typing import Any

from rest_framework.views import exception_handler


def _first_message(details: Any) -> str:
    if isinstance(details, dict):
        for value in details.values():
            return _first_message(value)
    if isinstance(details, list) and details:
        return _first_message(details[0])
    if details:
        return str(details)
    return "حدث خطأ أثناء تنفيذ الطلب."


def api_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return response

    details = response.data
    default_detail = getattr(exc, "default_detail", None)
    message = _first_message(details) if details else str(default_detail or "حدث خطأ أثناء تنفيذ الطلب.")
    code = getattr(exc, "default_code", "api_error")

    response.data = {
        "success": False,
        "message": message,
        "error": {
            "code": code,
            "status_code": response.status_code,
            "details": details,
        },
        "data": None,
    }
    return response