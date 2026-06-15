"""
=====================================================
اختبارات قوالب البريد
=====================================================
"""

from types import SimpleNamespace

from platform_api.email import render_template


def test_template_render_ar():
    template = SimpleNamespace(
        subject_ar="طلب جديد من {full_name}",
        subject_en="New request from {full_name}",
        body_ar="الهاتف: {phone}",
        body_en="Phone: {phone}",
    )

    subject, body = render_template(
        template,
        {"full_name": "محمد", "phone": "0999999999"},
        language="ar",
    )

    assert subject == "طلب جديد من محمد"
    assert body == "الهاتف: 0999999999"


def test_template_render_en():
    template = SimpleNamespace(
        subject_ar="طلب جديد من {full_name}",
        subject_en="New request from {full_name}",
        body_ar="الهاتف: {phone}",
        body_en="Phone: {phone}",
    )

    subject, body = render_template(
        template,
        {"full_name": "Mohammad", "phone": "+963"},
        language="en",
    )

    assert subject == "New request from Mohammad"
    assert body == "Phone: +963"
