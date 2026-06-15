from __future__ import annotations

import base64
import json
import logging
import re
import unicodedata
from dataclasses import dataclass, field
from typing import Any

import httpx
from django.conf import settings

logger = logging.getLogger(__name__)


class AiServiceError(RuntimeError):
    pass


@dataclass(frozen=True)
class AiGeneratedContent:
    improved_title_ar: str = ""
    short_description_ar: str = ""
    full_description_ar: str = ""
    seo_title_ar: str = ""
    seo_description_ar: str = ""
    keywords_ar: list[str] = field(default_factory=list)
    features_ar: list[str] = field(default_factory=list)
    slug: str = ""
    image_prompt: str = ""
    icon_prompt: str = ""
    title_en: str = ""
    short_description_en: str = ""
    full_description_en: str = ""
    seo_title_en: str = ""
    seo_description_en: str = ""
    provider: str = "fallback"
    model: str = "fallback"

    def as_dict(self) -> dict[str, Any]:
        return self.__dict__.copy()


class AdminAiService:
    def __init__(self) -> None:
        runtime = self._runtime_settings()
        self.enabled = bool(runtime.get("enabled", settings.AI_ASSISTANT_ENABLED))
        self.provider = (runtime.get("provider") or settings.AI_PROVIDER or "openai_compatible").strip().lower()
        self.api_key = runtime.get("api_key") or settings.AI_API_KEY
        self.base_url = (runtime.get("base_url") or settings.AI_BASE_URL or "https://api.openai.com/v1").rstrip("/")
        self.text_model = runtime.get("text_model") or settings.AI_TEXT_MODEL or "gpt-4o-mini"
        self.timeout = float(runtime.get("timeout_seconds") or settings.AI_TIMEOUT_SECONDS or 45)

    def _runtime_settings(self) -> dict[str, Any]:
        try:
            from platform_api.models import SiteSettings

            obj = SiteSettings.objects.order_by("created_at").first()
            extra = obj.extra_settings if obj and isinstance(obj.extra_settings, dict) else {}
            ai = extra.get("ai") if isinstance(extra.get("ai"), dict) else {}
            return dict(ai)
        except Exception:
            return {}

    @property
    def is_configured(self) -> bool:
        return bool(self.enabled and self.api_key and self.base_url)

    def generate(self, payload: dict[str, Any]) -> AiGeneratedContent:
        fallback = self._fallback_content(payload)
        if not self.is_configured:
            return fallback
        try:
            ai_payload = self._call_chat_completion(payload)
            merged = fallback.as_dict()
            merged.update({key: value for key, value in ai_payload.items() if value not in (None, "", [])})
            merged["provider"] = self.provider
            merged["model"] = self.text_model
            return AiGeneratedContent(**{key: merged.get(key) for key in AiGeneratedContent.__dataclass_fields__})
        except Exception as exc:  # pragma: no cover
            logger.warning("AI generation fallback used: %s", exc)
            return fallback

    def translate_fields_to_english(self, fields: dict[str, Any], overwrite: bool = True) -> dict[str, Any]:
        translated = dict(fields)
        pairs = self._collect_translation_pairs(fields)
        if not pairs:
            return translated
        if not self.is_configured:
            for _ar_key, en_key, value in pairs:
                if overwrite or not translated.get(en_key):
                    translated[en_key] = self._fallback_english_text(str(value))
            return translated

        prompt_items = [{"target_key": en_key, "text": str(value)} for _ar_key, en_key, value in pairs]
        system_prompt = "Translate Arabic admin-panel content to professional English. Return JSON only."
        try:
            result = self._chat_json(system_prompt, json.dumps({"items": prompt_items}, ensure_ascii=False))
        except Exception as exc:  # pragma: no cover
            logger.warning("AI translation fallback used: %s", exc)
            result = {}
        for _ar_key, en_key, value in pairs:
            if overwrite or not translated.get(en_key):
                translated[en_key] = str(result.get(en_key) or self._fallback_english_text(str(value))).strip()
        return translated

    def generate_image_bytes(self, payload: dict[str, Any]) -> tuple[bytes, str, str, str, bool, str, str]:
        prompt = (payload.get("prompt") or "").strip() or self._build_image_prompt(payload)
        if not self.is_configured:
            raise AiServiceError("مساعد الذكاء الاصطناعي غير مفعل أو مفتاح API غير مضبوط.")
        if self.provider not in {"openai", "openai_compatible", "openrouter", "azure_openai"}:
            raise AiServiceError(f"Unsupported AI provider: {self.provider}")

        model = settings.AI_IMAGE_MODEL or "gpt-image-1"
        request_payload = {"model": model, "prompt": prompt, "size": payload.get("size") or "1024x1024", "n": 1}
        with httpx.Client(timeout=self.timeout) as client:
            response = client.post(
                f"{self.base_url}/images/generations",
                headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"},
                json=request_payload,
            )
            response.raise_for_status()
            data = response.json()
            image_item = (data.get("data") or [{}])[0]
            if image_item.get("b64_json"):
                return base64.b64decode(image_item["b64_json"]), prompt, "image/png", ".png", True, self.provider, model
            image_url = image_item.get("url")
            if image_url:
                image_response = client.get(image_url)
                image_response.raise_for_status()
                content_type = image_response.headers.get("content-type", "image/png").split(";")[0]
                extension = ".jpg" if content_type in {"image/jpeg", "image/jpg"} else ".webp" if content_type == "image/webp" else ".png"
                return image_response.content, prompt, content_type, extension, True, self.provider, model
        raise AiServiceError("لم يرجع مزود الذكاء الاصطناعي صورة صالحة.")

    def _call_chat_completion(self, payload: dict[str, Any]) -> dict[str, Any]:
        system_prompt = "أنت مساعد محتوى عربي محترف لشركة برمجيات. أعد JSON فقط بدون Markdown."
        return self._chat_json(system_prompt, self._build_generation_prompt(payload))

    def _chat_json(self, system_prompt: str, user_prompt: str) -> dict[str, Any]:
        if self.provider not in {"openai", "openai_compatible", "openrouter", "azure_openai"}:
            raise AiServiceError(f"Unsupported AI provider: {self.provider}")
        payload = {
            "model": self.text_model,
            "temperature": 0.55,
            "messages": [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
            "response_format": {"type": "json_object"},
        }
        with httpx.Client(timeout=self.timeout) as client:
            response = client.post(
                f"{self.base_url}/chat/completions",
                headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"},
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
        content = data.get("choices", [{}])[0].get("message", {}).get("content", "{}")
        return self._safe_json_loads(content)

    def _build_generation_prompt(self, payload: dict[str, Any]) -> str:
        return json.dumps(
            {
                "task": "generate_admin_content",
                "requested_field": payload.get("target_field", "all"),
                "entity_type": payload.get("entity_type", "general"),
                "title_ar": payload.get("title_ar", ""),
                "short_description_ar": payload.get("short_description_ar", ""),
                "full_description_ar": payload.get("full_description_ar", ""),
                "context_ar": payload.get("context_ar", ""),
                "target_audience": payload.get("target_audience", "أصحاب الأعمال والشركات"),
                "tone": payload.get("tone", "احترافي، واضح، تسويقي بدون مبالغة"),
                "extra_instructions": payload.get("extra_instructions", ""),
                "return_json_schema": AiGeneratedContent().__dict__,
            },
            ensure_ascii=False,
        )

    def _fallback_content(self, payload: dict[str, Any]) -> AiGeneratedContent:
        title = (payload.get("title_ar") or "الخدمة البرمجية").strip()
        short = (payload.get("short_description_ar") or "").strip() or f"حل احترافي يساعدك على إدارة {title} بطريقة منظمة وسهلة الاستخدام."
        full = (payload.get("full_description_ar") or "").strip() or (
            f"نقدم {title} بأسلوب احترافي يركز على جودة التجربة، وضوح الواجهات، وقابلية التوسع."
        )
        seo_title = f"{title} | حلول برمجية احترافية"
        seo_description = f"تعرف على {title} كحل برمجي احترافي يساعد الشركات على تحسين الإدارة وتجربة المستخدم."
        slug = self._slugify(title) or f"item-{abs(hash(title)) % 10000}"
        return AiGeneratedContent(
            improved_title_ar=title,
            short_description_ar=short,
            full_description_ar=full,
            seo_title_ar=seo_title[:70],
            seo_description_ar=seo_description[:170],
            keywords_ar=[title, "حلول برمجية", "تطوير برمجيات", "لوحة تحكم"],
            features_ar=["تصميم احترافي", "قابلية للتوسع", "إدارة سهلة", "أداء مستقر"],
            slug=slug,
            image_prompt=f"Premium luxury technology visual for {slug}, dark SaaS style, no text",
            icon_prompt=f"Minimal premium line icon for {slug}, futuristic software style, no text",
            title_en=self._fallback_english_text(title),
            short_description_en=self._fallback_english_text(short),
            full_description_en=self._fallback_english_text(full),
            seo_title_en=self._fallback_english_text(seo_title),
            seo_description_en=self._fallback_english_text(seo_description),
        )

    def _build_image_prompt(self, payload: dict[str, Any]) -> str:
        title = (payload.get("title_ar") or "software solution").strip()
        kind = payload.get("image_kind") or "image"
        slug = self._slugify(title) or "software-solution"
        if kind == "icon":
            return f"Minimal premium app icon for {slug}, clean geometric symbol, no text, no letters."
        return f"Premium technology hero visual for {slug}, modern software interface, no text, no logos."

    def _collect_translation_pairs(self, fields: dict[str, Any]) -> list[tuple[str, str, str]]:
        pairs = []
        for key, value in fields.items():
            if key.endswith("_ar") and value:
                pairs.append((key, f"{key[:-3]}_en", str(value).strip()))
        return pairs

    def _safe_json_loads(self, content: str) -> dict[str, Any]:
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            match = re.search(r"\{.*\}", content, re.DOTALL)
            if not match:
                raise
            return json.loads(match.group(0))

    def _fallback_english_text(self, text: str) -> str:
        return re.sub(r"\s+", " ", text).strip()

    def _slugify(self, value: str) -> str:
        value = unicodedata.normalize("NFKD", value)
        transliteration = {"ا": "a", "أ": "a", "إ": "i", "آ": "a", "ب": "b", "ت": "t", "ث": "th", "ج": "j", "ح": "h", "خ": "kh", "د": "d", "ذ": "th", "ر": "r", "ز": "z", "س": "s", "ش": "sh", "ص": "s", "ض": "d", "ط": "t", "ظ": "z", "ع": "a", "غ": "gh", "ف": "f", "ق": "q", "ك": "k", "ل": "l", "م": "m", "ن": "n", "ه": "h", "و": "w", "ي": "y", "ى": "a", "ة": "h"}
        value = "".join(transliteration.get(char, char) for char in value).lower()
        value = re.sub(r"[^a-z0-9]+", "-", value)
        return re.sub(r"-{2,}", "-", value).strip("-")[:80]