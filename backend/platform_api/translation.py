from __future__ import annotations

import html
import logging
from dataclasses import dataclass

import httpx
from django.conf import settings

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class TranslationItem:
    id: str
    text: str
    field: str | None = None


class TranslationService:
    def __init__(self) -> None:
        self.provider = (settings.AUTO_TRANSLATION_PROVIDER or "disabled").lower().strip()
        self.timeout = float(settings.TRANSLATION_TIMEOUT_SECONDS or 20)

    def translate_many(
        self,
        items: list[TranslationItem],
        source_language: str = "ar",
        target_language: str = "en",
    ) -> list[dict[str, str]]:
        if not settings.AUTO_TRANSLATION_ENABLED or self.provider == "disabled":
            return [{"id": item.id, "text": item.text, "provider": "disabled"} for item in items if item.text.strip()]

        results: list[dict[str, str]] = []
        for item in items:
            source_text = item.text.strip()
            if not source_text:
                continue
            try:
                translated = self.translate_text(source_text, source_language, target_language)
            except Exception as exc:  # pragma: no cover
                logger.warning("Translation failed provider=%s error=%s", self.provider, exc)
                translated = source_text
            results.append({"id": item.id, "text": translated.strip() or source_text, "provider": self.provider})
        return results

    def translate_text(self, text: str, source_language: str = "ar", target_language: str = "en") -> str:
        if self.provider == "libretranslate":
            return self._translate_with_libretranslate(text, source_language, target_language)
        if self.provider == "mymemory":
            return self._translate_with_mymemory(text, source_language, target_language)
        return text

    def _translate_with_mymemory(self, text: str, source_language: str, target_language: str) -> str:
        with httpx.Client(timeout=self.timeout) as client:
            response = client.get(
                "https://api.mymemory.translated.net/get",
                params={"q": text, "langpair": f"{source_language}|{target_language}"},
            )
            response.raise_for_status()
            payload = response.json()
        return html.unescape(str(payload.get("responseData", {}).get("translatedText") or text))

    def _translate_with_libretranslate(self, text: str, source_language: str, target_language: str) -> str:
        if not settings.TRANSLATION_API_URL:
            return text
        data = {"q": text, "source": source_language, "target": target_language, "format": "text"}
        if settings.TRANSLATION_API_KEY:
            data["api_key"] = settings.TRANSLATION_API_KEY
        with httpx.Client(timeout=self.timeout) as client:
            response = client.post(settings.TRANSLATION_API_URL.rstrip("/") + "/translate", data=data)
            response.raise_for_status()
            payload = response.json()
        return html.unescape(str(payload.get("translatedText") or text))