"""
=====================================================
اختبارات الخدمات المكتملة بعد تحويل Django
=====================================================
"""

from platform_api.ai import AdminAiService
from platform_api.translation import TranslationItem, TranslationService


def test_ai_generate_uses_fallback_without_api_key(settings):
    settings.AI_ASSISTANT_ENABLED = True
    settings.AI_API_KEY = None

    content = AdminAiService().generate({"entity_type": "service", "title_ar": "تطوير المواقع"})

    assert content.provider == "fallback"
    assert content.improved_title_ar == "تطوير المواقع"
    assert content.slug


def test_translation_disabled_returns_original_text(settings):
    settings.AUTO_TRANSLATION_ENABLED = False
    settings.AUTO_TRANSLATION_PROVIDER = "disabled"

    result = TranslationService().translate_many([TranslationItem(id="title", text="مرحبا")])

    assert result == [{"id": "title", "text": "مرحبا", "provider": "disabled"}]


def test_export_endpoint_requires_authentication(client):
    response = client.get("/api/v1/admin/export/quote-requests")

    assert response.status_code in {401, 403}
    assert response.json()["success"] is False