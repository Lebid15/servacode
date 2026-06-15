from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from django.conf import settings


@dataclass(frozen=True)
class EmailResult:
    sent: bool
    error: str | None = None


def render_template(template: Any, values: dict[str, Any], language: str = "ar") -> tuple[str, str]:
    suffix = "en" if language == "en" else "ar"
    subject = getattr(template, f"subject_{suffix}").format(**values)
    body = getattr(template, f"body_{suffix}").format(**values)
    return subject, body


def send_email(to: str, subject: str, body: str) -> EmailResult:
    if not getattr(settings, "ENABLE_EMAIL_NOTIFICATIONS", False):
        return EmailResult(sent=False, error="email.disabled")
    if not to or not subject or not body:
        return EmailResult(sent=False, error="email.invalid_payload")
    return EmailResult(sent=False, error="email.smtp_not_configured")