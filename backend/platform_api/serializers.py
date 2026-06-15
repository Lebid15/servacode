from __future__ import annotations

from typing import Any

from rest_framework import serializers

from platform_api import models
from platform_api.auth import hash_password


READ_ONLY_SYSTEM_FIELDS = ("id", "created_at", "updated_at", "deleted_at", "is_deleted")


class BaseModelSerializer(serializers.ModelSerializer):
    class Meta:
        fields = "__all__"

    def get_fields(self):
        fields = super().get_fields()
        for name, field in fields.items():
            if name.endswith("_en") and hasattr(field, "allow_blank"):
                field.allow_blank = True
                field.required = False
            if name.startswith("seo_") and hasattr(field, "allow_blank"):
                field.allow_blank = True
                field.required = False
        return fields


def _fallback_text(attrs: dict[str, Any], target: str, source: str) -> None:
    if target not in attrs and source not in attrs:
        return
    value = attrs.get(target)
    if value is None or (isinstance(value, str) and not value.strip()):
        attrs[target] = attrs.get(source) or attrs.get(target) or ""


def _fallback_pairs(attrs: dict[str, Any], pairs: tuple[tuple[str, str], ...]) -> dict[str, Any]:
    for target, source in pairs:
        _fallback_text(attrs, target, source)
    return attrs


def _remove_read_only_values(payload: dict[str, Any]) -> dict[str, Any]:
    return {key: value for key, value in payload.items() if key not in READ_ONLY_SYSTEM_FIELDS}


def _sync_nested_children(
    parent: models.UUIDTimestampModel,
    related_name: str,
    child_model: type[models.UUIDTimestampModel],
    parent_field_name: str,
    items: list[dict[str, Any]],
) -> None:
    manager = getattr(parent, related_name)
    manager.all().delete()
    for index, item in enumerate(items):
        cleaned = _remove_read_only_values(dict(item))
        cleaned.pop(parent_field_name, None)
        cleaned.setdefault("sort_order", index * 10)
        child_model.objects.create(**{parent_field_name: parent}, **cleaned)


class RoleSerializer(BaseModelSerializer):
    class Meta(BaseModelSerializer.Meta):
        model = models.Role


class UserSerializer(BaseModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=False, min_length=8, max_length=128)
    role = RoleSerializer(source="role_id", read_only=True)

    class Meta(BaseModelSerializer.Meta):
        model = models.User
        extra_kwargs = {
            "hashed_password": {"write_only": True, "required": False},
            "failed_login_count": {"read_only": True},
            "locked_until": {"read_only": True},
            "last_login_at": {"read_only": True},
        }

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        password = attrs.pop("password", None)
        if password:
            attrs["hashed_password"] = hash_password(password)
        if self.instance is None and not attrs.get("hashed_password"):
            raise serializers.ValidationError({"password": "كلمة المرور مطلوبة عند إنشاء مستخدم جديد."})
        return attrs

    def update(self, instance: models.User, validated_data: dict[str, Any]) -> models.User:
        # كلمة المرور تُحدّث من إجراء مستقل أو من حقل password إن أُرسل صراحة.
        return super().update(instance, validated_data)


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.User
        fields = ["full_name", "email", "phone", "avatar_url", "preferred_locale", "preferred_theme"]
        extra_kwargs = {field: {"required": False} for field in fields}


class UserSelfPasswordUpdateSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True, min_length=1, max_length=128)
    new_password = serializers.CharField(write_only=True, min_length=8, max_length=128)


class UserPasswordUpdateSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True, min_length=8, max_length=128)


class SiteSettingsSerializer(BaseModelSerializer):
    class Meta(BaseModelSerializer.Meta):
        model = models.SiteSettings


class ServiceFeatureSerializer(BaseModelSerializer):
    class Meta(BaseModelSerializer.Meta):
        model = models.ServiceFeature
        extra_kwargs = {
            "service_id": {"read_only": True},
            "id": {"read_only": True},
            "created_at": {"read_only": True},
            "updated_at": {"read_only": True},
        }

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        return _fallback_pairs(attrs, (("title_en", "title_ar"), ("description_en", "description_ar")))


class ServiceSerializer(BaseModelSerializer):
    features = ServiceFeatureSerializer(many=True, required=False)

    class Meta(BaseModelSerializer.Meta):
        model = models.Service

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        return _fallback_pairs(attrs, (("title_en", "title_ar"), ("slug_en", "slug_ar"), ("description_en", "description_ar"), ("full_description_en", "full_description_ar")))

    def create(self, validated_data: dict[str, Any]) -> models.Service:
        features = validated_data.pop("features", [])
        service = super().create(validated_data)
        _sync_nested_children(service, "features", models.ServiceFeature, "service_id", features)
        return service

    def update(self, instance: models.Service, validated_data: dict[str, Any]) -> models.Service:
        features = validated_data.pop("features", None)
        service = super().update(instance, validated_data)
        if features is not None:
            _sync_nested_children(service, "features", models.ServiceFeature, "service_id", features)
        return service


class ProductFeatureSerializer(BaseModelSerializer):
    class Meta(BaseModelSerializer.Meta):
        model = models.ProductFeature
        extra_kwargs = {
            "product_id": {"read_only": True},
            "id": {"read_only": True},
            "created_at": {"read_only": True},
            "updated_at": {"read_only": True},
        }

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        return _fallback_pairs(attrs, (("title_en", "title_ar"), ("description_en", "description_ar")))


class ProductImageSerializer(BaseModelSerializer):
    class Meta(BaseModelSerializer.Meta):
        model = models.ProductImage
        extra_kwargs = {
            "product_id": {"read_only": True},
            "id": {"read_only": True},
            "created_at": {"read_only": True},
            "updated_at": {"read_only": True},
        }


class ProductFaqSerializer(BaseModelSerializer):
    class Meta(BaseModelSerializer.Meta):
        model = models.ProductFaq
        extra_kwargs = {
            "product_id": {"read_only": True},
            "id": {"read_only": True},
            "created_at": {"read_only": True},
            "updated_at": {"read_only": True},
        }

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        return _fallback_pairs(attrs, (("question_en", "question_ar"), ("answer_en", "answer_ar")))


class ProductSerializer(BaseModelSerializer):
    features = ProductFeatureSerializer(many=True, required=False)
    images = ProductImageSerializer(many=True, required=False)
    faqs = ProductFaqSerializer(many=True, required=False)

    class Meta(BaseModelSerializer.Meta):
        model = models.Product

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        return _fallback_pairs(attrs, (("name_en", "name_ar"), ("slug_en", "slug_ar"), ("short_description_en", "short_description_ar"), ("full_description_en", "full_description_ar"), ("target_audience_en", "target_audience_ar"), ("requirements_en", "requirements_ar")))

    def create(self, validated_data: dict[str, Any]) -> models.Product:
        features = validated_data.pop("features", [])
        images = validated_data.pop("images", [])
        faqs = validated_data.pop("faqs", [])
        product = super().create(validated_data)
        _sync_nested_children(product, "features", models.ProductFeature, "product_id", features)
        _sync_nested_children(product, "images", models.ProductImage, "product_id", images)
        _sync_nested_children(product, "faqs", models.ProductFaq, "product_id", faqs)
        return product

    def update(self, instance: models.Product, validated_data: dict[str, Any]) -> models.Product:
        features = validated_data.pop("features", None)
        images = validated_data.pop("images", None)
        faqs = validated_data.pop("faqs", None)
        product = super().update(instance, validated_data)
        if features is not None:
            _sync_nested_children(product, "features", models.ProductFeature, "product_id", features)
        if images is not None:
            _sync_nested_children(product, "images", models.ProductImage, "product_id", images)
        if faqs is not None:
            _sync_nested_children(product, "faqs", models.ProductFaq, "product_id", faqs)
        return product


class SoftwareAppSerializer(BaseModelSerializer):
    class Meta(BaseModelSerializer.Meta):
        model = models.SoftwareApp

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        return _fallback_pairs(attrs, (("name_en", "name_ar"), ("slug_en", "slug_ar"), ("short_description_en", "short_description_ar"), ("full_description_en", "full_description_ar")))


class PortfolioProjectSerializer(BaseModelSerializer):
    class Meta(BaseModelSerializer.Meta):
        model = models.PortfolioProject

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        return _fallback_pairs(attrs, (("title_en", "title_ar"), ("slug_en", "slug_ar"), ("description_en", "description_ar"), ("full_description_en", "full_description_ar"), ("problem_en", "problem_ar"), ("result_en", "result_ar"), ("category_en", "category_ar")))


class BlogCategorySerializer(BaseModelSerializer):
    class Meta(BaseModelSerializer.Meta):
        model = models.BlogCategory

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        return _fallback_pairs(attrs, (("name_en", "name_ar"), ("slug_en", "slug_ar"), ("description_en", "description_ar")))


class BlogPostSerializer(BaseModelSerializer):
    class Meta(BaseModelSerializer.Meta):
        model = models.BlogPost

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        return _fallback_pairs(attrs, (("title_en", "title_ar"), ("slug_en", "slug_ar"), ("excerpt_en", "excerpt_ar"), ("content_en", "content_ar")))


class FaqSerializer(BaseModelSerializer):
    class Meta(BaseModelSerializer.Meta):
        model = models.Faq

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        return _fallback_pairs(attrs, (("question_en", "question_ar"), ("answer_en", "answer_ar")))


class TestimonialSerializer(BaseModelSerializer):
    class Meta(BaseModelSerializer.Meta):
        model = models.Testimonial

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        return _fallback_pairs(attrs, (("text_en", "text_ar"),))


class StaticPageSerializer(BaseModelSerializer):
    class Meta(BaseModelSerializer.Meta):
        model = models.StaticPage

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        return _fallback_pairs(attrs, (("title_en", "title_ar"), ("slug_en", "slug_ar"), ("content_en", "content_ar")))


class QuoteRequestSerializer(BaseModelSerializer):
    class Meta(BaseModelSerializer.Meta):
        model = models.QuoteRequest


class QuoteRequestNoteSerializer(BaseModelSerializer):
    class Meta(BaseModelSerializer.Meta):
        model = models.QuoteRequestNote


class ContactMessageSerializer(BaseModelSerializer):
    class Meta(BaseModelSerializer.Meta):
        model = models.ContactMessage


class SupportRequestSerializer(BaseModelSerializer):
    class Meta(BaseModelSerializer.Meta):
        model = models.SupportRequest


class MediaFileSerializer(BaseModelSerializer):
    class Meta(BaseModelSerializer.Meta):
        model = models.MediaFile


class AdminNotificationSerializer(BaseModelSerializer):
    class Meta(BaseModelSerializer.Meta):
        model = models.AdminNotification


class AuditLogSerializer(BaseModelSerializer):
    class Meta(BaseModelSerializer.Meta):
        model = models.AuditLog


class AnalyticsEventSerializer(BaseModelSerializer):
    class Meta(BaseModelSerializer.Meta):
        model = models.AnalyticsEvent


class EmailTemplateSerializer(BaseModelSerializer):
    class Meta(BaseModelSerializer.Meta):
        model = models.EmailTemplate


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    remember_me = serializers.BooleanField(required=False, default=False)


class ForgotPasswordSerializer(serializers.Serializer):
    identifier = serializers.CharField(min_length=2, max_length=255)


class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField(min_length=10, max_length=4000)
    new_password = serializers.CharField(write_only=True, min_length=8, max_length=128)


class AiSettingsUpdateSerializer(serializers.Serializer):
    enabled = serializers.BooleanField(required=False)
    provider = serializers.ChoiceField(choices=["openai", "openai_compatible", "openrouter", "azure_openai"], required=False)
    api_key = serializers.CharField(required=False, allow_blank=True, max_length=4000, write_only=True)
    clear_api_key = serializers.BooleanField(required=False, default=False)
    base_url = serializers.CharField(required=False, allow_blank=True, max_length=500)
    text_model = serializers.CharField(required=False, allow_blank=True, max_length=160)
    image_model = serializers.CharField(required=False, allow_blank=True, max_length=160)
    timeout_seconds = serializers.IntegerField(required=False, min_value=5, max_value=180)
    auto_translate = serializers.BooleanField(required=False)
    auto_fill_seo = serializers.BooleanField(required=False)
    hide_english_fields = serializers.BooleanField(required=False)
    enable_ai_everywhere = serializers.BooleanField(required=False)


class RefreshSerializer(serializers.Serializer):
    refresh_token = serializers.CharField()


class AiGenerateSerializer(serializers.Serializer):
    entity_type = serializers.CharField(default="general", max_length=80)
    target_field = serializers.CharField(default="all", max_length=80)
    title_ar = serializers.CharField(default="", allow_blank=True, max_length=250)
    short_description_ar = serializers.CharField(default="", allow_blank=True, max_length=2000)
    full_description_ar = serializers.CharField(default="", allow_blank=True, max_length=12000)
    context_ar = serializers.CharField(default="", allow_blank=True, max_length=12000)
    target_audience = serializers.CharField(default="أصحاب الأعمال والشركات", allow_blank=True, max_length=250)
    tone = serializers.CharField(default="احترافي، واضح، تسويقي بدون مبالغة", allow_blank=True, max_length=250)
    extra_instructions = serializers.CharField(default="", allow_blank=True, max_length=2000)


class AiTranslateSerializer(serializers.Serializer):
    fields = serializers.DictField(default=dict)
    overwrite = serializers.BooleanField(default=True)


class AiImageGenerateSerializer(serializers.Serializer):
    entity_type = serializers.CharField(default="general", max_length=80)
    image_kind = serializers.ChoiceField(choices=["image", "icon"], default="image")
    title_ar = serializers.CharField(default="", allow_blank=True, max_length=250)
    short_description_ar = serializers.CharField(default="", allow_blank=True, max_length=2000)
    full_description_ar = serializers.CharField(default="", allow_blank=True, max_length=12000)
    context_ar = serializers.CharField(default="", allow_blank=True, max_length=12000)
    prompt = serializers.CharField(default="", allow_blank=True, max_length=4000)
    size = serializers.ChoiceField(choices=["1024x1024", "1024x1536", "1536x1024"], default="1024x1024")


class TranslationItemSerializer(serializers.Serializer):
    id = serializers.CharField(min_length=1, max_length=300)
    text = serializers.CharField(min_length=1, max_length=8000)
    field = serializers.CharField(required=False, allow_blank=True, allow_null=True, max_length=120)


class BulkTranslationSerializer(serializers.Serializer):
    items = TranslationItemSerializer(many=True, required=False, default=list)
    source_language = serializers.CharField(default="ar", max_length=8)
    target_language = serializers.CharField(default="en", max_length=8)
