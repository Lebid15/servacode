from __future__ import annotations

from typing import Any

from rest_framework.response import Response


def success_payload(
    data: Any = None,
    message: str = "تم تنفيذ العملية بنجاح.",
    meta: dict[str, Any] | None = None,
) -> dict[str, Any]:
    payload: dict[str, Any] = {"success": True, "message": message, "data": data}
    if meta is not None:
        payload["meta"] = meta
    return payload


def error_payload(
    message: str = "حدث خطأ أثناء تنفيذ الطلب.",
    code: str = "api_error",
    status_code: int = 400,
    details: Any = None,
) -> dict[str, Any]:
    return {
        "success": False,
        "message": message,
        "data": None,
        "error": {
            "code": code,
            "status_code": status_code,
            "details": details,
        },
    }


def success_response(
    data: Any = None,
    message: str = "تم تنفيذ العملية بنجاح.",
    status_code: int = 200,
    meta: dict[str, Any] | None = None,
) -> Response:
    return Response(success_payload(data=data, message=message, meta=meta), status=status_code)


def error_response(
    message: str = "حدث خطأ أثناء تنفيذ الطلب.",
    status_code: int = 400,
    code: str = "api_error",
    details: Any = None,
) -> Response:
    return Response(
        error_payload(message=message, code=code, status_code=status_code, details=details),
        status=status_code,
    )
