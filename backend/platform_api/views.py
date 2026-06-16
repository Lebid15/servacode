from __future__ import annotations

import csv
import io
from datetime import timedelta
from pathlib import Path
from uuid import uuid4

from django.conf import settings
from django.core import signing
from django.core.mail import EmailMultiAlternatives
from django.core.mail.backends.smtp import EmailBackend
from django.db import connection
from django.db.models import Count, Q
from django.db.models.functions import TruncDate
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.views import APIView

from platform_api import models, serializers
from platform_api.ai import AdminAiService, AiServiceError
from platform_api.auth import build_tokens, decode_token, hash_password, verify_password
from platform_api.permissions import PERMISSION_CATALOG, HasPermissionKey, PermissionKey
from platform_api.responses import error_response, success_response
from platform_api.translation import TranslationItem, TranslationService

ALLOWED_UPLOAD_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
    ".svg",
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    ".zip",
    ".rar",
    ".7z",
    ".txt",
    ".csv",
    ".exe",
    ".msi",
    ".dmg",
    ".apk",
}


DOCUMENT_EXTENSIONS = {".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".csv"}

DEFAULT_ROLES = [
    {
        "name": "super_admin",
        "display_name_ar": "مدير النظام",
        "display_name_en": "Super Admin",
        "description_ar": "صلاحيات كاملة لإدارة المنصة.",
        "description_en": "Full platform administration permissions.",
        "permissions": PERMISSION_CATALOG,
        "is_system": True,
    },
    {
        "name": "content_manager",
        "display_name_ar": "مدير المحتوى",
        "display_name_en": "Content Manager",
        "description_ar": "إدارة المحتوى العام والوسائط.",
        "description_en": "Manage public content and media.",
        "permissions": [
            PermissionKey.MANAGE_SERVICES,
            PermissionKey.MANAGE_PRODUCTS,
            PermissionKey.MANAGE_APPS,
            PermissionKey.MANAGE_PORTFOLIO,
            PermissionKey.MANAGE_BLOG,
            PermissionKey.MANAGE_STATIC_PAGES,
            PermissionKey.MANAGE_TESTIMONIALS,
            PermissionKey.MANAGE_FAQ,
            PermissionKey.MANAGE_MEDIA,
        ],
        "is_system": True,
    },
    {
        "name": "support_agent",
        "display_name_ar": "موظف الدعم",
        "display_name_en": "Support Agent",
        "description_ar": "متابعة الطلبات والرسائل والدعم.",
        "description_en": "Handle quotes, contact messages, and support requests.",
        "permissions": [
            PermissionKey.MANAGE_QUOTES,
            PermissionKey.MANAGE_CONTACT_MESSAGES,
            PermissionKey.MANAGE_SUPPORT_REQUESTS,
            PermissionKey.VIEW_NOTIFICATIONS,
        ],
        "is_system": True,
    },
]

DEFAULT_STATIC_PAGES = [
    {
        "page_key": "privacy",
        "title_ar": "سياسة الخصوصية",
        "title_en": "Privacy Policy",
        "slug_ar": "privacy",
        "slug_en": "privacy",
        "content_ar": "نلتزم بحماية بيانات العملاء واستخدامها فقط لتقديم الخدمة والتواصل المرتبط بالطلبات.",
        "content_en": "We protect customer data and use it only to provide services and communicate about requests.",
        "seo_title_ar": "سياسة الخصوصية",
        "seo_title_en": "Privacy Policy",
        "seo_description_ar": "تعرف على كيفية حماية بياناتك واستخدامها.",
        "seo_description_en": "Learn how your data is protected and used.",
        "is_active": True,
    },
    {
        "page_key": "terms",
        "title_ar": "الشروط والأحكام",
        "title_en": "Terms and Conditions",
        "slug_ar": "terms",
        "slug_en": "terms",
        "content_ar": "توضح هذه الشروط آلية استخدام الموقع وطلب الخدمات والالتزامات العامة بين الطرفين.",
        "content_en": "These terms explain site usage, service requests, and general responsibilities between parties.",
        "seo_title_ar": "الشروط والأحكام",
        "seo_title_en": "Terms and Conditions",
        "seo_description_ar": "الشروط العامة لاستخدام المنصة وطلب الخدمات.",
        "seo_description_en": "General terms for using the platform and requesting services.",
        "is_active": True,
    },
    {
        "page_key": "about",
        "title_ar": "من نحن",
        "title_en": "About Us",
        "slug_ar": "about",
        "slug_en": "about",
        "content_ar": "نقدم حلولًا برمجية ومواقع وتطبيقات ولوحات تحكم مصممة لاحتياجات الشركات.",
        "content_en": "We provide software solutions, websites, apps, and admin panels tailored to business needs.",
        "seo_title_ar": "من نحن",
        "seo_title_en": "About Us",
        "seo_description_ar": "نبذة عن الشركة وخدماتها البرمجية.",
        "seo_description_en": "Overview of the company and its software services.",
        "is_active": True,
    },
]

DEFAULT_EMAIL_TEMPLATES = [
    {
        "key": "quote_request_received",
        "subject_ar": "تم استلام طلب مشروعك",
        "subject_en": "Your project request has been received",
        "body_ar": "مرحبًا {full_name}، تم استلام طلبك وسيتواصل معك الفريق قريبًا.",
        "body_en": "Hello {full_name}, your request has been received and our team will contact you soon.",
        "variables": ["full_name"],
        "is_active": True,
    },
    {
        "key": "contact_message_received",
        "subject_ar": "تم استلام رسالتك",
        "subject_en": "Your message has been received",
        "body_ar": "مرحبًا {full_name}، شكرًا لتواصلك معنا.",
        "body_en": "Hello {full_name}, thank you for contacting us.",
        "variables": ["full_name"],
        "is_active": True,
    },
]


def _ensure_roles() -> list[models.Role]:
    roles = []
    for payload in DEFAULT_ROLES:
        role, _created = models.Role.objects.update_or_create(name=payload["name"], defaults=payload)
        roles.append(role)
    return roles


def _ensure_static_pages() -> list[models.StaticPage]:
    pages = []
    for payload in DEFAULT_STATIC_PAGES:
        page, _created = models.StaticPage.objects.update_or_create(page_key=payload["page_key"], defaults=payload)
        pages.append(page)
    return pages


def _ensure_email_templates() -> list[models.EmailTemplate]:
    templates = []
    for payload in DEFAULT_EMAIL_TEMPLATES:
        template, _created = models.EmailTemplate.objects.update_or_create(key=payload["key"], defaults=payload)
        templates.append(template)
    return templates


def _query_int(request: Request, name: str, default: int, minimum: int = 0, maximum: int | None = None) -> int:
    try:
        value = int(request.query_params.get(name, default))
    except (TypeError, ValueError):
        value = default
    value = max(value, minimum)
    if maximum is not None:
        value = min(value, maximum)
    return value


def _detect_media_type(mime_type: str, suffix: str) -> str:
    if mime_type.startswith("image/"):
        return models.MediaType.IMAGE
    if suffix in DOCUMENT_EXTENSIONS or mime_type in {"application/pdf", "text/plain", "text/csv"}:
        return models.MediaType.DOCUMENT
    return models.MediaType.OTHER


def _safe_upload_name(original_name: str) -> tuple[str, str]:
    suffix = Path(original_name).suffix.lower()
    if suffix not in ALLOWED_UPLOAD_EXTENSIONS:
        raise ValidationError("نوع الملف غير مسموح.")
    return f"{uuid4().hex}{suffix}", suffix


def _client_ip(request: Request) -> str | None:
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded:
        return forwarded.split(",", 1)[0].strip()
    return request.META.get("REMOTE_ADDR")


def _model_field_names(model: type[models.models.Model]) -> set[str]:
    return {field.name for field in model._meta.get_fields() if hasattr(field, "attname")}




def _create_admin_notification_for_public_object(obj: models.models.Model) -> None:
    """Create an internal admin notification for public forms without blocking submission."""
    try:
        object_id = str(getattr(obj, "id", ""))
        full_name = str(getattr(obj, "full_name", "") or "").strip() or "عميل جديد"

        if isinstance(obj, models.QuoteRequest):
            models.AdminNotification.objects.create(
                notification_type=models.NotificationType.QUOTE_REQUEST,
                title_ar="طلب مشروع جديد",
                title_en="New project request",
                body_ar=f"وصل طلب مشروع جديد من {full_name} ويحتاج مراجعة من الإدارة.",
                body_en=f"A new project request was received from {full_name} and needs admin review.",
                target_type="quote_request",
                target_id=object_id,
                action_url=f"/admin/quote-requests?open={object_id}",
                extra_data={"source": "public_form", "kind": "quote_request"},
            )
            return

        if isinstance(obj, models.ContactMessage):
            subject = str(getattr(obj, "subject", "") or "").strip()
            models.AdminNotification.objects.create(
                notification_type=models.NotificationType.CONTACT_MESSAGE,
                title_ar="رسالة تواصل جديدة",
                title_en="New contact message",
                body_ar=f"وصلت رسالة تواصل جديدة من {full_name}{f' بعنوان: {subject}' if subject else ''}.",
                body_en=f"A new contact message was received from {full_name}{f' with subject: {subject}' if subject else ''}.",
                target_type="contact_message",
                target_id=object_id,
                action_url=f"/admin/contact-messages?open={object_id}",
                extra_data={"source": "public_form", "kind": "contact_message"},
            )
            return

        if isinstance(obj, models.SupportRequest):
            subject = str(getattr(obj, "subject", "") or "").strip()
            app_name = str(getattr(obj, "app_name", "") or "").strip()
            models.AdminNotification.objects.create(
                notification_type=models.NotificationType.SUPPORT_REQUEST,
                title_ar="طلب دعم جديد",
                title_en="New support request",
                body_ar=f"وصل طلب دعم جديد من {full_name}{f' بخصوص {app_name}' if app_name else ''}{f': {subject}' if subject else ''}.",
                body_en=f"A new support request was received from {full_name}{f' about {app_name}' if app_name else ''}{f': {subject}' if subject else ''}.",
                target_type="support_request",
                target_id=object_id,
                action_url=f"/admin/support-requests?open={object_id}",
                extra_data={"source": "public_form", "kind": "support_request"},
            )
    except Exception:
        # Notifications are helpful but should never break public form submission.
        return

def _safe_ordering(request: Request, model: type[models.models.Model], default_ordering: list[str] | tuple[str, ...] | None = None) -> list[str]:
    raw_ordering = str(request.query_params.get("ordering") or request.query_params.get("order_by") or "").strip()
    if not raw_ordering:
        return list(default_ordering or model._meta.ordering or [])

    allowed_fields = _model_field_names(model)
    requested = [part.strip() for part in raw_ordering.split(",") if part.strip()]
    safe_fields = []
    for field_name in requested:
        normalized = field_name[1:] if field_name.startswith("-") else field_name
        if normalized in allowed_fields:
            safe_fields.append(field_name)
    return safe_fields or list(default_ordering or model._meta.ordering or [])


def _audit_action(
    request: Request,
    action: str,
    entity: object | None = None,
    description: str = "",
    before_data: dict | None = None,
    after_data: dict | None = None,
) -> None:
    try:
        user = request.user if getattr(request, "user", None) and request.user.is_authenticated else None
        models.AuditLog.objects.create(
            user_id=user,
            action=action,
            entity_type=entity.__class__.__name__ if entity is not None else None,
            entity_id=str(getattr(entity, "id", "")) if entity is not None else None,
            description=description or action,
            before_data=before_data,
            after_data=after_data,
            ip_address=_client_ip(request),
            user_agent=str(request.META.get("HTTP_USER_AGENT") or "")[:500] or None,
        )
    except Exception:
        # لا نكسر العملية الأساسية إذا فشل تسجيل السجل الإداري.
        return


PASSWORD_RESET_MAX_AGE_SECONDS = 60 * 60
PASSWORD_RESET_SALT = "servacode-admin-password-reset"


def _admin_panel_base_url(request: Request) -> str:
    origin = request.headers.get("origin") or request.META.get("HTTP_REFERER") or ""
    if origin:
        try:
            from urllib.parse import urlparse

            parsed = urlparse(origin)
            if parsed.scheme and parsed.netloc:
                return f"{parsed.scheme}://{parsed.netloc}".rstrip("/")
        except Exception:
            pass
    return str(getattr(settings, "ADMIN_PANEL_BASE_URL", "http://127.0.0.1:3001")).rstrip("/")


def _build_password_reset_token(user: models.User) -> str:
    signer = signing.TimestampSigner(salt=PASSWORD_RESET_SALT)
    payload = {
        "uid": str(user.id),
        "email": user.email or "",
        "password_marker": (user.hashed_password or "")[-32:],
    }
    return signer.sign_object(payload)


def _resolve_password_reset_user(token: str) -> models.User:
    signer = signing.TimestampSigner(salt=PASSWORD_RESET_SALT)
    try:
        payload = signer.unsign_object(token, max_age=PASSWORD_RESET_MAX_AGE_SECONDS)
    except signing.BadSignature as exc:
        raise ValidationError({"token": "رابط استعادة كلمة المرور غير صالح أو منتهي."}) from exc

    user = models.User.objects.filter(id=payload.get("uid"), is_deleted=False).first()
    if not user or user.status != models.UserStatus.ACTIVE:
        raise ValidationError({"token": "رابط استعادة كلمة المرور غير صالح أو منتهي."})
    if (user.hashed_password or "")[-32:] != payload.get("password_marker"):
        raise ValidationError({"token": "تم استخدام هذا الرابط سابقًا أو انتهت صلاحيته."})
    return user


def _send_password_reset_email(user: models.User, reset_url: str) -> bool:
    if not user.email:
        return False
    from_email = settings.SMTP_FROM_EMAIL or settings.SMTP_USERNAME
    if not (settings.SMTP_HOST and from_email):
        return False

    backend = EmailBackend(
        host=settings.SMTP_HOST,
        port=settings.SMTP_PORT,
        username=settings.SMTP_USERNAME,
        password=settings.SMTP_PASSWORD,
        use_tls=settings.SMTP_USE_TLS,
        timeout=settings.SMTP_TIMEOUT_SECONDS,
    )
    sender = f"{settings.SMTP_FROM_NAME} <{from_email}>" if settings.SMTP_FROM_NAME else from_email
    subject = "استعادة كلمة مرور لوحة التحكم"
    body = (
        f"مرحبًا {user.full_name},\n\n"
        "وصلنا طلبًا لاستعادة كلمة مرور لوحة التحكم. استخدم الرابط التالي لتعيين كلمة مرور جديدة خلال ساعة واحدة:\n"
        f"{reset_url}\n\n"
        "إذا لم تطلب الاستعادة، تجاهل هذه الرسالة.\n"
    )
    EmailMultiAlternatives(subject=subject, body=body, from_email=sender, to=[user.email], connection=backend).send()
    return True


def _get_site_settings_instance() -> models.SiteSettings:
    obj = models.SiteSettings.objects.order_by("created_at").first()
    if obj:
        return obj
    return models.SiteSettings.objects.create()


def _mask_secret(value: str | None) -> str:
    if not value:
        return ""
    value = str(value)
    if len(value) <= 8:
        return "********"
    return f"{value[:4]}{'*' * 12}{value[-4:]}"


def _get_ai_config_from_settings_obj(settings_obj: models.SiteSettings | None = None) -> dict:
    settings_obj = settings_obj or models.SiteSettings.objects.order_by("created_at").first()
    extra = settings_obj.extra_settings if settings_obj and isinstance(settings_obj.extra_settings, dict) else {}
    ai = extra.get("ai") if isinstance(extra.get("ai"), dict) else {}
    api_key = ai.get("api_key") or settings.AI_API_KEY or ""
    return {
        "enabled": bool(ai.get("enabled", settings.AI_ASSISTANT_ENABLED)),
        "provider": ai.get("provider") or settings.AI_PROVIDER,
        "base_url": ai.get("base_url") or settings.AI_BASE_URL,
        "base_url_configured": bool(ai.get("base_url") or settings.AI_BASE_URL),
        "api_key_configured": bool(api_key),
        "api_key_masked": _mask_secret(api_key),
        "text_model": ai.get("text_model") or settings.AI_TEXT_MODEL,
        "image_model": ai.get("image_model") or settings.AI_IMAGE_MODEL,
        "timeout_seconds": int(ai.get("timeout_seconds") or settings.AI_TIMEOUT_SECONDS),
        "auto_translate": bool(ai.get("auto_translate", settings.AI_AUTO_TRANSLATE)),
        "auto_fill_seo": bool(ai.get("auto_fill_seo", settings.AI_AUTO_FILL_SEO)),
        "hide_english_fields": bool(ai.get("hide_english_fields", settings.AI_HIDE_ENGLISH_FIELDS)),
        "enable_ai_everywhere": bool(ai.get("enable_ai_everywhere", True)),
        "source": "database" if ai else "environment",
    }


@api_view(["GET"])
@permission_classes([AllowAny])
def root(_request: Request):
    return success_response(
        {"app": settings.APP_NAME, "environment": settings.APP_ENV},
        message="Backend is running successfully",
    )


class HealthView(APIView):
    permission_classes = [AllowAny]

    def get(self, _request: Request):
        return success_response({"status": "ok"}, message="النظام يعمل بنجاح.")


class LiveView(APIView):
    permission_classes = [AllowAny]

    def get(self, _request: Request):
        return success_response({"status": "alive"}, message="التطبيق يعمل.")


class ReadyView(APIView):
    permission_classes = [AllowAny]

    def get(self, _request: Request):
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        return success_response({"status": "ready", "database": "connected"}, message="التطبيق جاهز وقاعدة البيانات متصلة.")


class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = "login"

    def post(self, request: Request):
        serializer = serializers.LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        username = serializer.validated_data["username"].strip()
        password = serializer.validated_data["password"]
        remember_me = bool(serializer.validated_data.get("remember_me"))

        user = models.User.objects.select_related("role_id").filter(
            Q(username=username) | Q(email=username),
            is_deleted=False,
        ).first()
        if user is None or user.status != models.UserStatus.ACTIVE:
            return error_response("بيانات الدخول غير صحيحة.", status_code=status.HTTP_401_UNAUTHORIZED, code="invalid_credentials")

        now = timezone.now()
        if user.locked_until and user.locked_until > now:
            return error_response("تم قفل الحساب مؤقتًا.", status_code=status.HTTP_423_LOCKED, code="account_locked")

        if not verify_password(password, user.hashed_password):
            user.failed_login_count += 1
            if user.failed_login_count >= settings.LOGIN_MAX_FAILED_ATTEMPTS:
                user.locked_until = now + timezone.timedelta(minutes=settings.LOGIN_LOCKOUT_MINUTES)
            user.save(update_fields=["failed_login_count", "locked_until", "updated_at"])
            return error_response("بيانات الدخول غير صحيحة.", status_code=status.HTTP_401_UNAUTHORIZED, code="invalid_credentials")

        user.failed_login_count = 0
        user.locked_until = None
        user.last_login_at = now
        user.save(update_fields=["failed_login_count", "locked_until", "last_login_at", "updated_at"])
        return success_response(
            {"user": serializers.UserSerializer(user).data, "tokens": build_tokens(user, remember_me=remember_me)},
            message="تم تسجيل الدخول بنجاح.",
        )


class RefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request: Request):
        serializer = serializers.RefreshSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = decode_token(serializer.validated_data["refresh_token"], expected_type="refresh")
        if not payload or not payload.get("sub"):
            return error_response("رمز التجديد غير صالح.", status_code=status.HTTP_401_UNAUTHORIZED, code="invalid_refresh_token")
        try:
            user = models.User.objects.select_related("role_id").get(id=payload["sub"], is_deleted=False)
        except models.User.DoesNotExist:
            return error_response("المستخدم غير موجود.", status_code=status.HTTP_401_UNAUTHORIZED, code="user_not_found")
        return success_response({"user": serializers.UserSerializer(user).data, "tokens": build_tokens(user)}, message="تم تجديد الجلسة.")


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request):
        return success_response(serializers.UserSerializer(request.user).data, message="تم جلب بيانات المستخدم.")


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, _request: Request):
        return success_response(
            {"logged_out": True, "token_revoked": False},
            message="تم تسجيل الخروج. احذف رمز الجلسة من العميل.",
        )


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = "login"

    def post(self, request: Request):
        serializer = serializers.ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        identifier = serializer.validated_data["identifier"].strip()
        user = models.User.objects.filter(Q(username=identifier) | Q(email=identifier), is_deleted=False, status=models.UserStatus.ACTIVE).first()

        data = {"accepted": True, "email_sent": False}
        if user and user.email:
            token = _build_password_reset_token(user)
            reset_url = f"{_admin_panel_base_url(request)}/ar/admin/reset-password?token={token}"
            try:
                data["email_sent"] = _send_password_reset_email(user, reset_url)
            except Exception:
                data["email_sent"] = False
            if settings.DEBUG and not data["email_sent"]:
                data["development_reset_url"] = reset_url

        return success_response(
            data,
            message="إذا كان الحساب موجودًا ولديه بريد إلكتروني، سيتم إرسال رابط استعادة كلمة المرور.",
        )


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request: Request):
        serializer = serializers.ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = _resolve_password_reset_user(serializer.validated_data["token"])
        user.hashed_password = hash_password(serializer.validated_data["new_password"])
        user.failed_login_count = 0
        user.locked_until = None
        user.save(update_fields=["hashed_password", "failed_login_count", "locked_until", "updated_at"])
        return success_response({"password_reset": True}, message="تم تعيين كلمة المرور الجديدة بنجاح.")


class SuccessModelViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    include_deleted_param = "include_deleted"
    search_fields: tuple[str, ...] = ()
    filter_fields: tuple[str, ...] = (
        "status",
        "priority",
        "scope",
        "role_id",
        "product_type",
        "app_type",
        "platform",
        "pricing_type",
        "project_type",
        "media_type",
        "notification_type",
        "page_key",
        "is_active",
        "is_featured",
        "is_read",
    )

    def get_queryset(self):
        queryset = super().get_queryset()
        if hasattr(self.queryset.model, "is_deleted") and self.request.query_params.get(self.include_deleted_param) != "true":
            queryset = queryset.filter(is_deleted=False)
        return queryset

    def filter_queryset(self, queryset):
        queryset = super().filter_queryset(queryset)
        model = queryset.model
        model_fields = _model_field_names(model)

        search = str(self.request.query_params.get("search") or "").strip()
        if search and self.search_fields:
            search_query = Q()
            for field_name in self.search_fields:
                search_query |= Q(**{f"{field_name}__icontains": search})
            queryset = queryset.filter(search_query)

        for field_name in self.filter_fields:
            if field_name not in model_fields:
                continue
            value = self.request.query_params.get(field_name)
            if value in {None, ""}:
                continue
            if value in {"true", "false"}:
                value = value == "true"
            queryset = queryset.filter(**{field_name: value})

        ordering = _safe_ordering(self.request, model)
        if ordering:
            queryset = queryset.order_by(*ordering)
        return queryset

    def list(self, request: Request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        total = queryset.count()
        limit = _query_int(request, "limit", 50, minimum=1, maximum=100)
        skip = _query_int(request, "skip", 0, minimum=0)
        serializer = self.get_serializer(queryset[skip : skip + limit], many=True)
        return success_response(
            serializer.data,
            message="تم جلب البيانات بنجاح.",
            meta={"total": total, "skip": skip, "limit": limit, "returned": len(serializer.data)},
        )

    def retrieve(self, request: Request, *args, **kwargs):
        serializer = self.get_serializer(self.get_object())
        return success_response(serializer.data, message="تم جلب البيانات بنجاح.")

    def perform_create(self, serializer):
        instance = serializer.save()
        _audit_action(self.request, models.AuditAction.CREATE, instance, "تم إنشاء عنصر من لوحة الإدارة.", after_data=serializer.data)

    def perform_update(self, serializer):
        instance = serializer.save()
        _audit_action(self.request, models.AuditAction.UPDATE, instance, "تم تعديل عنصر من لوحة الإدارة.", after_data=serializer.data)

    def create(self, request: Request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return success_response(serializer.data, message="تم إنشاء العنصر بنجاح.", status_code=status.HTTP_201_CREATED)

    def update(self, request: Request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        serializer = self.get_serializer(self.get_object(), data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return success_response(serializer.data, message="تم تعديل العنصر بنجاح.")

    def destroy(self, request: Request, *args, **kwargs):
        obj = self.get_object()
        if hasattr(obj, "is_deleted"):
            obj.is_deleted = True
            obj.deleted_at = timezone.now()
            obj.save(update_fields=["is_deleted", "deleted_at", "updated_at"])
        else:
            obj.delete()
        _audit_action(request, models.AuditAction.DELETE, obj, "تم حذف عنصر من لوحة الإدارة.")
        return success_response({"deleted": True}, message="تم حذف العنصر بنجاح.")

    @action(detail=True, methods=["patch"])
    def restore(self, request: Request, pk=None):
        obj = self.get_object()
        if hasattr(obj, "is_deleted"):
            obj.is_deleted = False
            obj.deleted_at = None
            obj.save(update_fields=["is_deleted", "deleted_at", "updated_at"])
        _audit_action(request, models.AuditAction.ACTIVATE, obj, "تمت استعادة عنصر محذوف.")
        return success_response(self.get_serializer(obj).data, message="تمت استعادة العنصر بنجاح.")


class RoleViewSet(SuccessModelViewSet):
    queryset = models.Role.objects.all()
    search_fields = ("name", "display_name_ar", "display_name_en")
    serializer_class = serializers.RoleSerializer
    permission_classes = [HasPermissionKey]
    required_permission = PermissionKey.MANAGE_USERS

    @action(detail=False, methods=["post"], url_path="ensure-defaults")
    def ensure_defaults(self, _request: Request):
        roles = _ensure_roles()
        return success_response(self.get_serializer(roles, many=True).data, message="تم تجهيز الأدوار الافتراضية.")


class UserViewSet(SuccessModelViewSet):
    queryset = models.User.objects.select_related("role_id").all()
    search_fields = ("full_name", "username", "email", "phone")
    serializer_class = serializers.UserSerializer
    permission_classes = [HasPermissionKey]
    required_permission = PermissionKey.MANAGE_USERS

    def _active_superuser_count(self) -> int:
        return self.queryset.filter(is_deleted=False, status=models.UserStatus.ACTIVE, is_superuser=True).count()

    def _ensure_not_last_active_superuser(self, user: models.User, target_status: str | None = None) -> None:
        will_remove_active_superuser = user.is_superuser and (
            user.is_deleted or target_status in {models.UserStatus.INACTIVE, models.UserStatus.SUSPENDED}
        )
        if will_remove_active_superuser and self._active_superuser_count() <= 1:
            raise ValidationError("لا يمكن تعطيل أو حذف آخر مدير منصة نشط.")

    def update(self, request: Request, *args, **kwargs):
        user = self.get_object()
        requested_status = request.data.get("status")
        if str(user.id) == str(request.user.id) and requested_status in {models.UserStatus.INACTIVE, models.UserStatus.SUSPENDED}:
            raise ValidationError("لا يمكنك تعطيل حسابك الحالي أثناء استخدامه.")
        self._ensure_not_last_active_superuser(user, requested_status)
        return super().update(request, *args, **kwargs)

    def destroy(self, request: Request, *args, **kwargs):
        user = self.get_object()
        if str(user.id) == str(request.user.id):
            raise ValidationError("لا يمكنك حذف حسابك الحالي.")
        self._ensure_not_last_active_superuser(user, models.UserStatus.SUSPENDED)
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=["patch"], url_path="me/profile")
    def update_profile(self, request: Request):
        serializer = serializers.UserProfileUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data.get("email")
        if email and models.User.objects.filter(email=email, is_deleted=False).exclude(id=request.user.id).exists():
            raise ValidationError("البريد الإلكتروني مستخدم مسبقًا.")
        serializer.save()
        return success_response(serializers.UserSerializer(request.user).data, message="تم تعديل الملف الشخصي بنجاح.")

    @action(detail=False, methods=["patch"], url_path="me/password")
    def update_own_password(self, request: Request):
        serializer = serializers.UserSelfPasswordUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if not verify_password(serializer.validated_data["current_password"], request.user.hashed_password):
            raise ValidationError("كلمة المرور الحالية غير صحيحة.")
        request.user.hashed_password = hash_password(serializer.validated_data["new_password"])
        request.user.failed_login_count = 0
        request.user.locked_until = None
        request.user.save(update_fields=["hashed_password", "failed_login_count", "locked_until", "updated_at"])
        return success_response({"updated": True}, message="تم تغيير كلمة المرور بنجاح.")

    @action(detail=True, methods=["patch"])
    def password(self, request: Request, pk=None):
        if not request.user.is_superuser:
            raise PermissionDenied("هذه العملية متاحة لمدير المنصة فقط.")
        serializer = serializers.UserPasswordUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = self.get_object()
        if user.is_deleted:
            raise ValidationError("لا يمكن تغيير كلمة مرور مستخدم محذوف قبل استعادته.")
        user.hashed_password = hash_password(serializer.validated_data["password"])
        user.failed_login_count = 0
        user.locked_until = None
        user.save(update_fields=["hashed_password", "failed_login_count", "locked_until", "updated_at"])
        return success_response({"updated": True}, message="تم تغيير كلمة المرور بنجاح.")

    @action(detail=True, methods=["patch"])
    def unlock(self, _request: Request, pk=None):
        user = self.get_object()
        if user.is_deleted:
            raise ValidationError("لا يمكن فك قفل مستخدم محذوف قبل استعادته.")
        user.failed_login_count = 0
        user.locked_until = None
        user.save(update_fields=["failed_login_count", "locked_until", "updated_at"])
        return success_response(self.get_serializer(user).data, message="تم فك قفل المستخدم بنجاح.")


class ServiceViewSet(SuccessModelViewSet):
    queryset = models.Service.objects.prefetch_related("features").all()
    search_fields = ("title_ar", "title_en", "description_ar", "description_en", "slug_ar", "slug_en")
    serializer_class = serializers.ServiceSerializer
    permission_classes = [HasPermissionKey]
    required_permission = PermissionKey.MANAGE_SERVICES


class ProductViewSet(SuccessModelViewSet):
    queryset = models.Product.objects.prefetch_related("features", "images", "faqs").all()
    search_fields = ("name_ar", "name_en", "short_description_ar", "short_description_en", "slug_ar", "slug_en")
    serializer_class = serializers.ProductSerializer
    permission_classes = [HasPermissionKey]
    required_permission = PermissionKey.MANAGE_PRODUCTS


class SoftwareAppViewSet(SuccessModelViewSet):
    queryset = models.SoftwareApp.objects.all()
    search_fields = ("name_ar", "name_en", "short_description_ar", "short_description_en", "slug_ar", "slug_en")
    serializer_class = serializers.SoftwareAppSerializer
    permission_classes = [HasPermissionKey]
    required_permission = PermissionKey.MANAGE_APPS


class PortfolioProjectViewSet(SuccessModelViewSet):
    queryset = models.PortfolioProject.objects.all()
    search_fields = ("title_ar", "title_en", "description_ar", "description_en", "category_ar", "category_en", "slug_ar", "slug_en")
    serializer_class = serializers.PortfolioProjectSerializer
    permission_classes = [HasPermissionKey]
    required_permission = PermissionKey.MANAGE_PORTFOLIO


class BlogCategoryViewSet(SuccessModelViewSet):
    queryset = models.BlogCategory.objects.all()
    search_fields = ("name_ar", "name_en", "slug_ar", "slug_en")
    serializer_class = serializers.BlogCategorySerializer
    permission_classes = [HasPermissionKey]
    required_permission = PermissionKey.MANAGE_BLOG


class BlogPostViewSet(SuccessModelViewSet):
    queryset = models.BlogPost.objects.select_related("category_id", "author_id").all()
    search_fields = ("title_ar", "title_en", "excerpt_ar", "excerpt_en", "slug_ar", "slug_en")
    serializer_class = serializers.BlogPostSerializer
    permission_classes = [HasPermissionKey]
    required_permission = PermissionKey.MANAGE_BLOG


class FaqViewSet(SuccessModelViewSet):
    queryset = models.Faq.objects.all()
    search_fields = ("question_ar", "question_en", "answer_ar", "answer_en")
    serializer_class = serializers.FaqSerializer
    permission_classes = [HasPermissionKey]
    required_permission = PermissionKey.MANAGE_FAQ


class TestimonialViewSet(SuccessModelViewSet):
    queryset = models.Testimonial.objects.all()
    search_fields = ("client_name", "company_name", "position", "text_ar", "text_en")
    serializer_class = serializers.TestimonialSerializer
    permission_classes = [HasPermissionKey]
    required_permission = PermissionKey.MANAGE_TESTIMONIALS


class StaticPageViewSet(SuccessModelViewSet):
    queryset = models.StaticPage.objects.all()
    search_fields = ("page_key", "title_ar", "title_en", "slug_ar", "slug_en")
    serializer_class = serializers.StaticPageSerializer
    permission_classes = [HasPermissionKey]
    required_permission = PermissionKey.MANAGE_STATIC_PAGES

    @action(detail=False, methods=["post"], url_path="ensure-defaults")
    def ensure_defaults(self, _request: Request):
        pages = _ensure_static_pages()
        return success_response(self.get_serializer(pages, many=True).data, message="تم تجهيز الصفحات الافتراضية.")


class QuoteRequestViewSet(SuccessModelViewSet):
    queryset = models.QuoteRequest.objects.all()
    search_fields = ("full_name", "phone", "email", "description")
    serializer_class = serializers.QuoteRequestSerializer
    permission_classes = [HasPermissionKey]
    required_permission = PermissionKey.MANAGE_QUOTES

    @action(detail=True, methods=["post"], url_path="notes")
    def notes(self, request: Request, pk=None):
        quote_request = self.get_object()
        note = str(request.data.get("note") or "").strip()
        if not note:
            raise ValidationError("يجب إدخال نص الملاحظة.")
        created = models.QuoteRequestNote.objects.create(quote_request_id=quote_request, user_id=request.user, note=note)
        return success_response(
            serializers.QuoteRequestNoteSerializer(created).data,
            message="تمت إضافة الملاحظة بنجاح.",
            status_code=status.HTTP_201_CREATED,
        )


class ContactMessageViewSet(SuccessModelViewSet):
    queryset = models.ContactMessage.objects.all()
    search_fields = ("full_name", "phone", "email", "subject", "message")
    serializer_class = serializers.ContactMessageSerializer
    permission_classes = [HasPermissionKey]
    required_permission = PermissionKey.MANAGE_CONTACT_MESSAGES


class SupportRequestViewSet(SuccessModelViewSet):
    queryset = models.SupportRequest.objects.all()
    search_fields = ("full_name", "phone", "email", "app_name", "subject", "message")
    serializer_class = serializers.SupportRequestSerializer
    permission_classes = [HasPermissionKey]
    required_permission = PermissionKey.MANAGE_SUPPORT_REQUESTS


class MediaFileViewSet(SuccessModelViewSet):
    queryset = models.MediaFile.objects.all()
    search_fields = ("file_name", "original_name", "mime_type", "alt_text_ar", "alt_text_en")
    serializer_class = serializers.MediaFileSerializer
    permission_classes = [HasPermissionKey]
    required_permission = PermissionKey.MANAGE_MEDIA

    @action(detail=False, methods=["post"])
    def upload(self, request: Request):
        uploaded_file = request.FILES.get("file")
        if uploaded_file is None:
            raise ValidationError("يجب إرسال ملف للرفع.")

        original_name = uploaded_file.name or "uploaded-file"
        safe_name, suffix = _safe_upload_name(original_name)
        mime_type = getattr(uploaded_file, "content_type", None) or "application/octet-stream"
        media_type = _detect_media_type(mime_type, suffix)
        max_size = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024

        dated_folder = timezone.now().strftime("%Y/%m")
        target_folder = Path(settings.MEDIA_ROOT) / dated_folder
        target_folder.mkdir(parents=True, exist_ok=True)
        storage_path = target_folder / safe_name

        size = 0
        with storage_path.open("wb") as destination:
            for chunk in uploaded_file.chunks():
                size += len(chunk)
                if size > max_size:
                    destination.close()
                    storage_path.unlink(missing_ok=True)
                    raise ValidationError("حجم الملف أكبر من الحد المسموح.")
                destination.write(chunk)

        relative_storage_path = str(Path(dated_folder) / safe_name).replace("\\", "/")
        media = models.MediaFile.objects.create(
            uploaded_by_id=request.user,
            file_name=safe_name,
            original_name=original_name,
            mime_type=mime_type,
            media_type=media_type,
            file_size=size,
            url=f"{settings.MEDIA_URL}{relative_storage_path}",
            storage_path=relative_storage_path,
            alt_text_ar=request.data.get("alt_text_ar") or None,
            alt_text_en=request.data.get("alt_text_en") or None,
            extra_data={"source": "admin_upload"},
        )
        return success_response(self.get_serializer(media).data, message="تم رفع الملف بنجاح.", status_code=status.HTTP_201_CREATED)

    def destroy(self, request: Request, *args, **kwargs):
        media = self.get_object()
        if media.is_used or media.usage_count > 0:
            raise ValidationError("لا يمكن حذف هذا الملف لأنه مستخدم في محتوى الموقع.")
        return super().destroy(request, *args, **kwargs)


class NotificationViewSet(SuccessModelViewSet):
    queryset = models.AdminNotification.objects.all()
    search_fields = ("title_ar", "title_en", "body_ar", "body_en", "target_type", "target_id")
    serializer_class = serializers.AdminNotificationSerializer
    permission_classes = [HasPermissionKey]
    required_permission = PermissionKey.VIEW_NOTIFICATIONS

    def filter_queryset(self, queryset):
        queryset = super().filter_queryset(queryset)
        read_status = str(self.request.query_params.get("read_status") or "all").lower()
        if read_status == "read":
            queryset = queryset.filter(is_read=True)
        elif read_status == "unread":
            queryset = queryset.filter(is_read=False)
        return queryset

    @action(detail=False, methods=["get"], url_path="unread-count")
    def unread_count(self, _request: Request):
        count = self.get_queryset().filter(is_read=False).count()
        return success_response({"count": count, "unread_count": count}, message="تم جلب عدد الإشعارات غير المقروءة.")

    @action(detail=True, methods=["patch"], url_path="read")
    def read(self, _request: Request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.read_at = timezone.now()
        notification.save(update_fields=["is_read", "read_at", "updated_at"])
        return success_response(self.get_serializer(notification).data, message="تم تعليم الإشعار كمقروء.")

    @action(detail=False, methods=["patch"], url_path="read-all")
    def read_all(self, _request: Request):
        updated = self.get_queryset().filter(is_read=False).update(is_read=True, read_at=timezone.now())
        return success_response({"updated": updated}, message="تم تعليم كل الإشعارات كمقروءة.")


class AuditLogViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    permission_classes = [HasPermissionKey]
    required_permission = PermissionKey.VIEW_AUDIT_LOGS
    queryset = models.AuditLog.objects.all()
    serializer_class = serializers.AuditLogSerializer

    def list(self, request: Request, *args, **kwargs):
        serializer = self.get_serializer(self.get_queryset()[:100], many=True)
        return success_response(serializer.data, message="تم جلب سجلات التدقيق.")


class AnalyticsViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    permission_classes = [HasPermissionKey]
    required_permission = PermissionKey.VIEW_ANALYTICS
    queryset = models.AnalyticsEvent.objects.all()
    serializer_class = serializers.AnalyticsEventSerializer

    def list(self, request: Request, *args, **kwargs):
        serializer = self.get_serializer(self.get_queryset()[:200], many=True)
        return success_response(serializer.data, message="تم جلب أحداث التحليلات.")

    @action(detail=False, methods=["get"])
    def summary(self, _request: Request):
        return success_response({"events_count": self.get_queryset().count()}, message="تم جلب ملخص التحليلات.")


class EmailTemplateViewSet(SuccessModelViewSet):
    queryset = models.EmailTemplate.objects.all()
    search_fields = ("key", "subject_ar", "subject_en", "body_ar", "body_en")
    serializer_class = serializers.EmailTemplateSerializer
    permission_classes = [HasPermissionKey]
    required_permission = PermissionKey.MANAGE_SETTINGS

    @action(detail=False, methods=["post"], url_path="ensure-defaults")
    def ensure_defaults(self, _request: Request):
        templates = _ensure_email_templates()
        return success_response(self.get_serializer(templates, many=True).data, message="تم تجهيز قوالب البريد الافتراضية.")






class AdministrationOverviewView(APIView):
    permission_classes = [HasPermissionKey]
    required_permission = PermissionKey.MANAGE_USERS

    def get(self, _request: Request):
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = now - timedelta(days=7)

        users = models.User.objects.select_related("role_id").all()
        active_users = users.filter(is_deleted=False, status=models.UserStatus.ACTIVE)
        inactive_users = users.filter(is_deleted=False, status=models.UserStatus.INACTIVE)
        suspended_users = users.filter(is_deleted=False, status=models.UserStatus.SUSPENDED)
        deleted_users = users.filter(is_deleted=True)
        locked_users = users.filter(is_deleted=False, locked_until__gt=now)
        roles = models.Role.objects.all()
        audit_logs = models.AuditLog.objects.all()

        role_rows = []
        for role in roles.annotate(users_count=Count("users")):
            permissions = role.permissions or []
            role_rows.append(
                {
                    "id": str(role.id),
                    "name": role.name,
                    "display_name_ar": role.display_name_ar,
                    "display_name_en": role.display_name_en,
                    "is_system": role.is_system,
                    "permissions_count": len(permissions),
                    "users_count": role.users.filter(is_deleted=False).count(),
                    "target_path": f"/admin/roles?search={role.name}",
                }
            )

        modules = [
            {
                "key": "users",
                "label_ar": "المستخدمون",
                "label_en": "Users",
                "description_ar": "إدارة حسابات لوحة التحكم، الحالة، القفل، وكلمات المرور.",
                "description_en": "Manage admin accounts, status, locks, and passwords.",
                "target_path": "/admin/users",
                "icon": "users",
                "total": users.filter(is_deleted=False).count(),
                "active": active_users.count(),
                "attention": locked_users.count() + suspended_users.count(),
                "tone": "warning" if locked_users.exists() or suspended_users.exists() else "success",
            },
            {
                "key": "roles",
                "label_ar": "الأدوار والصلاحيات",
                "label_en": "Roles & permissions",
                "description_ar": "تحديد ما يستطيع كل مستخدم فعله داخل لوحة التحكم.",
                "description_en": "Control what each admin user can do inside the panel.",
                "target_path": "/admin/roles",
                "icon": "roles",
                "total": roles.count(),
                "active": roles.filter(is_system=True).count(),
                "attention": 0 if roles.exists() else 1,
                "tone": "success" if roles.exists() else "danger",
            },
            {
                "key": "audit_logs",
                "label_ar": "سجل التدقيق",
                "label_en": "Audit logs",
                "description_ar": "مراجعة عمليات الدخول والإنشاء والتعديل والحذف والإعدادات.",
                "description_en": "Review login, create, update, delete, and settings actions.",
                "target_path": "/admin/audit-logs",
                "icon": "audit",
                "total": audit_logs.count(),
                "active": audit_logs.filter(created_at__gte=week_start).count(),
                "attention": audit_logs.filter(action=models.AuditAction.LOGIN_FAILED, created_at__gte=week_start).count(),
                "tone": "warning" if audit_logs.filter(action=models.AuditAction.LOGIN_FAILED, created_at__gte=week_start).exists() else "primary",
            },
            {
                "key": "profile_security",
                "label_ar": "الملف الشخصي والأمان",
                "label_en": "Profile & security",
                "description_ar": "تعديل بيانات المدير الحالي وكلمة المرور والتفضيلات الشخصية.",
                "description_en": "Update current admin profile, password, and preferences.",
                "target_path": "/admin/profile",
                "icon": "lock",
                "total": 1,
                "active": 1,
                "attention": active_users.filter(last_login_at__isnull=True).count(),
                "tone": "primary",
            },
        ]

        alerts = []
        if not roles.exists():
            alerts.append(
                {
                    "code": "missing_roles",
                    "tone": "danger",
                    "label_ar": "لا توجد أدوار. جهّز الأدوار الافتراضية قبل إضافة مستخدمين.",
                    "label_en": "No roles found. Ensure default roles before adding users.",
                    "target_path": "/admin/roles",
                }
            )
        if active_users.filter(is_superuser=True).count() == 0:
            alerts.append(
                {
                    "code": "missing_super_admin",
                    "tone": "danger",
                    "label_ar": "لا يوجد مدير منصة نشط. هذا خطر تشغيلي ويجب إصلاحه فورًا.",
                    "label_en": "No active super admin exists. This is operationally critical.",
                    "target_path": "/admin/users",
                }
            )
        if locked_users.exists():
            alerts.append(
                {
                    "code": "locked_users",
                    "tone": "warning",
                    "label_ar": "توجد حسابات مقفلة بسبب محاولات دخول فاشلة.",
                    "label_en": "Some accounts are locked because of failed login attempts.",
                    "target_path": "/admin/users",
                }
            )
        if suspended_users.exists():
            alerts.append(
                {
                    "code": "suspended_users",
                    "tone": "warning",
                    "label_ar": "توجد حسابات موقوفة، راجعها للتأكد من الصلاحيات.",
                    "label_en": "Suspended accounts exist; review access policy.",
                    "target_path": "/admin/users",
                }
            )
        if audit_logs.filter(action=models.AuditAction.LOGIN_FAILED, created_at__gte=week_start).count() >= 3:
            alerts.append(
                {
                    "code": "failed_login_spike",
                    "tone": "warning",
                    "label_ar": "هناك عدة محاولات دخول فاشلة خلال آخر 7 أيام.",
                    "label_en": "Several failed login attempts were recorded in the last 7 days.",
                    "target_path": "/admin/audit-logs",
                }
            )

        data = {
            "generated_at": timezone.now(),
            "totals": {
                "users": users.filter(is_deleted=False).count(),
                "active_users": active_users.count(),
                "inactive_users": inactive_users.count(),
                "suspended_users": suspended_users.count(),
                "deleted_users": deleted_users.count(),
                "locked_users": locked_users.count(),
                "superusers": active_users.filter(is_superuser=True).count(),
                "roles": roles.count(),
                "system_roles": roles.filter(is_system=True).count(),
                "custom_roles": roles.filter(is_system=False).count(),
                "permissions": len(PERMISSION_CATALOG),
                "audit_logs": audit_logs.count(),
                "today_audit_logs": audit_logs.filter(created_at__gte=today_start).count(),
                "week_audit_logs": audit_logs.filter(created_at__gte=week_start).count(),
                "failed_logins_week": audit_logs.filter(action=models.AuditAction.LOGIN_FAILED, created_at__gte=week_start).count(),
            },
            "modules": modules,
            "roles": role_rows,
            "latest_users": serializers.UserSerializer(users.filter(is_deleted=False)[:6], many=True).data,
            "latest_activity": serializers.AuditLogSerializer(audit_logs[:8], many=True).data,
            "alerts": alerts,
            "rules": {
                "ar": "قسم الإدارة مسؤول عن الوصول والصلاحيات وسجل التدقيق. لا تمنح صلاحية مدير منصة إلا لمن يحتاجها فعلًا.",
                "en": "Administration controls access, permissions, and audit trails. Grant super admin access only when truly needed.",
            },
        }

        return success_response(data, message="تم جلب ملخص الإدارة.")


class CommunicationOverviewView(APIView):
    permission_classes = [HasPermissionKey]
    required_permission = PermissionKey.VIEW_NOTIFICATIONS

    def get(self, _request: Request):
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = now - timedelta(days=7)

        notifications = models.AdminNotification.objects.all()
        email_templates = models.EmailTemplate.objects.all()
        quote_requests = models.QuoteRequest.objects.filter(is_deleted=False)
        contact_messages = models.ContactMessage.objects.filter(is_deleted=False)
        support_requests = models.SupportRequest.objects.filter(is_deleted=False)

        unread_notifications = notifications.filter(is_read=False).count()
        active_templates = email_templates.filter(is_active=True).count()
        inactive_templates = email_templates.filter(is_active=False).count()
        today_notifications = notifications.filter(created_at__gte=today_start).count()
        week_notifications = notifications.filter(created_at__gte=week_start).count()

        modules = [
            {
                "key": "notifications",
                "label_ar": "الإشعارات",
                "label_en": "Notifications",
                "description_ar": "تنبيهات الطلبات والرسائل والنظام داخل لوحة التحكم.",
                "description_en": "Request, message, and system alerts inside the admin panel.",
                "target_path": "/admin/notifications",
                "icon": "bell",
                "total": notifications.count(),
                "active": unread_notifications,
                "secondary": notifications.filter(is_read=True).count(),
                "needs_attention": unread_notifications > 0,
                "tone": "warning" if unread_notifications else "success",
            },
            {
                "key": "email_templates",
                "label_ar": "قوالب البريد",
                "label_en": "Email templates",
                "description_ar": "القوالب المستخدمة للردود والتنبيهات البريدية.",
                "description_en": "Templates used for email confirmations and admin/customer replies.",
                "target_path": "/admin/email-templates",
                "icon": "email",
                "total": email_templates.count(),
                "active": active_templates,
                "secondary": inactive_templates,
                "needs_attention": active_templates == 0 or inactive_templates > 0,
                "tone": "warning" if active_templates == 0 or inactive_templates > 0 else "success",
            },
            {
                "key": "quote_requests",
                "label_ar": "طلبات المشاريع",
                "label_en": "Project requests",
                "description_ar": "مصدر رئيسي للتواصل التجاري وطلبات العروض.",
                "description_en": "Main business communication source for project inquiries.",
                "target_path": "/admin/quote-requests",
                "icon": "briefcase",
                "total": quote_requests.count(),
                "active": quote_requests.exclude(status__in=["completed", "archived", "rejected"]).count(),
                "secondary": quote_requests.filter(created_at__gte=week_start).count(),
                "needs_attention": quote_requests.filter(status__in=["new", "reviewing", "contacted"]).exists(),
                "tone": "primary",
            },
            {
                "key": "contact_messages",
                "label_ar": "رسائل التواصل",
                "label_en": "Contact messages",
                "description_ar": "رسائل الزوار من صفحة تواصل معنا.",
                "description_en": "Visitor messages from the contact page.",
                "target_path": "/admin/contact-messages",
                "icon": "message",
                "total": contact_messages.count(),
                "active": contact_messages.exclude(status__in=["archived"]).count(),
                "secondary": contact_messages.filter(created_at__gte=week_start).count(),
                "needs_attention": contact_messages.filter(status__in=["new"]).exists(),
                "tone": "primary",
            },
            {
                "key": "support_requests",
                "label_ar": "طلبات الدعم",
                "label_en": "Support requests",
                "description_ar": "طلبات الدعم والمشاكل الفنية القادمة من الموقع.",
                "description_en": "Support tickets and technical issues submitted from the website.",
                "target_path": "/admin/support-requests",
                "icon": "support",
                "total": support_requests.count(),
                "active": support_requests.exclude(status__in=["resolved", "closed", "archived"]).count(),
                "secondary": support_requests.filter(created_at__gte=week_start).count(),
                "needs_attention": support_requests.filter(status__in=["new", "reviewing", "in_progress", "waiting_customer"]).exists(),
                "tone": "warning" if support_requests.filter(priority="urgent").exists() else "primary",
            },
        ]

        latest_notifications = [
            {
                "id": str(item.id),
                "title_ar": item.title_ar,
                "title_en": item.title_en,
                "notification_type": item.notification_type,
                "is_read": item.is_read,
                "target_type": item.target_type,
                "target_id": item.target_id,
                "action_url": item.action_url,
                "created_at": item.created_at,
            }
            for item in notifications.order_by("-created_at")[:8]
        ]

        alerts = []
        if unread_notifications:
            alerts.append({"code": "unread_notifications", "tone": "warning", "label_ar": f"يوجد {unread_notifications} إشعار غير مقروء.", "label_en": f"There are {unread_notifications} unread notifications.", "target_path": "/admin/notifications"})
        if active_templates == 0:
            alerts.append({"code": "missing_email_templates", "tone": "danger", "label_ar": "لا توجد قوالب بريد مفعلة.", "label_en": "No active email templates found.", "target_path": "/admin/email-templates"})
        elif inactive_templates:
            alerts.append({"code": "inactive_email_templates", "tone": "warning", "label_ar": f"يوجد {inactive_templates} قالب بريد غير مفعل.", "label_en": f"There are {inactive_templates} inactive email templates.", "target_path": "/admin/email-templates"})

        return success_response(
            {
                "generated_at": now,
                "totals": {
                    "notifications": notifications.count(),
                    "unread_notifications": unread_notifications,
                    "today_notifications": today_notifications,
                    "week_notifications": week_notifications,
                    "email_templates": email_templates.count(),
                    "active_email_templates": active_templates,
                    "inactive_email_templates": inactive_templates,
                    "open_quote_requests": quote_requests.exclude(status__in=["completed", "archived", "rejected"]).count(),
                    "open_contact_messages": contact_messages.exclude(status__in=["archived"]).count(),
                    "open_support_requests": support_requests.exclude(status__in=["resolved", "closed", "archived"]).count(),
                },
                "modules": modules,
                "latest_notifications": latest_notifications,
                "alerts": alerts,
                "rules": {
                    "ar": "الإشعارات تتولد تلقائيًا من نماذج الموقع، وقوالب البريد تُستخدم للردود والتنبيهات الرسمية.",
                    "en": "Notifications are generated automatically from website forms; email templates power official replies and alerts.",
                },
            },
            message="تم جلب ملخص الإشعارات والتواصل.",
        )


class DashboardView(APIView):
    permission_classes = [HasPermissionKey]
    required_permission = PermissionKey.MANAGE_DASHBOARD

    def get(self, _request: Request):
        settings_obj = models.SiteSettings.objects.order_by("created_at").first()
        services = models.Service.objects.filter(is_deleted=False)
        products = models.Product.objects.filter(is_deleted=False)
        apps = models.SoftwareApp.objects.filter(is_deleted=False)
        portfolio = models.PortfolioProject.objects.filter(is_deleted=False)
        blog_posts = models.BlogPost.objects.filter(is_deleted=False)
        quote_requests = models.QuoteRequest.objects.filter(is_deleted=False)
        contact_messages = models.ContactMessage.objects.filter(is_deleted=False)
        support_requests = models.SupportRequest.objects.filter(is_deleted=False)

        data = {
            "generated_at": timezone.now(),
            "services_count": services.count(),
            "products_count": products.count(),
            "apps_count": apps.count(),
            "portfolio_count": portfolio.count(),
            "blog_posts_count": blog_posts.count(),
            "quote_requests_count": quote_requests.count(),
            "contact_messages_count": contact_messages.count(),
            "support_requests_count": support_requests.count(),
            "users_count": models.User.objects.filter(is_deleted=False).count(),
            "stats": {
                "new_quote_requests": quote_requests.filter(status=models.QuoteStatus.NEW).count(),
                "unread_contact_messages": contact_messages.filter(status=models.ContactMessageStatus.NEW).count(),
                "open_support_requests": support_requests.exclude(
                    status__in=[models.SupportRequestStatus.RESOLVED, models.SupportRequestStatus.CLOSED, models.SupportRequestStatus.ARCHIVED]
                ).count(),
                "unread_notifications": models.AdminNotification.objects.filter(is_read=False).count(),
                "published_services": services.filter(is_active=True).count(),
                "published_products": products.filter(is_active=True).exclude(status=models.ProductStatus.HIDDEN).count(),
                "published_apps": apps.filter(is_active=True).exclude(status=models.AppStatus.HIDDEN).count(),
                "published_portfolio": portfolio.filter(is_active=True).count(),
                "published_blog_posts": blog_posts.filter(status=models.PublishStatus.PUBLISHED).count(),
                "active_faqs": models.Faq.objects.filter(is_deleted=False, is_active=True).count(),
                "active_static_pages": models.StaticPage.objects.filter(is_deleted=False, is_active=True).count(),
                "active_testimonials": models.Testimonial.objects.filter(is_deleted=False, is_active=True).count(),
                "media_files": models.MediaFile.objects.filter(is_deleted=False).count(),
                "email_templates": models.EmailTemplate.objects.filter(is_active=True).count(),
                "active_users": models.User.objects.filter(is_deleted=False, status=models.UserStatus.ACTIVE).count(),
            },
            "site_status": {
                "site_name_ar": settings_obj.site_name_ar if settings_obj else None,
                "site_name_en": settings_obj.site_name_en if settings_obj else None,
                "maintenance_mode": bool(settings_obj.maintenance_mode) if settings_obj else False,
                "default_language": settings_obj.default_language if settings_obj else models.LanguageCode.AR,
                "english_enabled": bool(settings_obj.is_english_enabled) if settings_obj else True,
                "active_theme": settings_obj.active_theme if settings_obj else models.ThemeCode.BLUE_TECH,
                "has_logo": bool(settings_obj and settings_obj.logo_url),
                "has_favicon": bool(settings_obj and settings_obj.favicon_url),
                "has_contact_channels": bool(settings_obj and (settings_obj.phone or settings_obj.email or settings_obj.whatsapp)),
            },
            "content_status": [
                {"key": "services", "total": services.count(), "visible": services.filter(is_active=True).count(), "hidden": services.filter(is_active=False).count()},
                {"key": "products", "total": products.count(), "visible": products.filter(is_active=True).exclude(status=models.ProductStatus.HIDDEN).count(), "hidden": products.filter(is_active=False).count()},
                {"key": "apps", "total": apps.count(), "visible": apps.filter(is_active=True).exclude(status=models.AppStatus.HIDDEN).count(), "hidden": apps.filter(is_active=False).count()},
                {"key": "portfolio", "total": portfolio.count(), "visible": portfolio.filter(is_active=True).count(), "hidden": portfolio.filter(is_active=False).count()},
                {"key": "blog", "total": blog_posts.count(), "visible": blog_posts.filter(status=models.PublishStatus.PUBLISHED).count(), "draft": blog_posts.filter(status=models.PublishStatus.DRAFT).count()},
                {"key": "static_pages", "total": models.StaticPage.objects.filter(is_deleted=False).count(), "visible": models.StaticPage.objects.filter(is_deleted=False, is_active=True).count(), "hidden": models.StaticPage.objects.filter(is_deleted=False, is_active=False).count()},
                {"key": "faqs", "total": models.Faq.objects.filter(is_deleted=False).count(), "visible": models.Faq.objects.filter(is_deleted=False, is_active=True).count(), "hidden": models.Faq.objects.filter(is_deleted=False, is_active=False).count()},
                {"key": "testimonials", "total": models.Testimonial.objects.filter(is_deleted=False).count(), "visible": models.Testimonial.objects.filter(is_deleted=False, is_active=True).count(), "hidden": models.Testimonial.objects.filter(is_deleted=False, is_active=False).count()},
                {"key": "media", "total": models.MediaFile.objects.filter(is_deleted=False).count(), "visible": models.MediaFile.objects.filter(is_deleted=False).count(), "hidden": 0},
                {"key": "email_templates", "total": models.EmailTemplate.objects.count(), "visible": models.EmailTemplate.objects.filter(is_active=True).count(), "hidden": models.EmailTemplate.objects.filter(is_active=False).count()},
            ],
            "readiness_alerts": [],
            "latest_quote_requests": serializers.QuoteRequestSerializer(quote_requests[:5], many=True).data,
            "latest_contact_messages": serializers.ContactMessageSerializer(contact_messages[:5], many=True).data,
            "latest_support_requests": serializers.SupportRequestSerializer(support_requests[:5], many=True).data,
            "latest_activity": serializers.AuditLogSerializer(models.AuditLog.objects.all()[:10], many=True).data,
            "system_status": {
                "api": "online",
                "database": "connected",
                "storage": "local",
                "environment": settings.APP_ENV,
                "debug": settings.DEBUG,
                "email_notifications_enabled": bool(getattr(settings, "EMAIL_HOST", "")),
                "media_files": models.MediaFile.objects.filter(is_deleted=False).count(),
                "email_templates": models.EmailTemplate.objects.count(),
            },
        }

        published_services = services.filter(is_active=True).count()
        published_products = products.filter(is_active=True).exclude(status=models.ProductStatus.HIDDEN).count()
        published_apps = apps.filter(is_active=True).exclude(status=models.AppStatus.HIDDEN).count()
        published_portfolio = portfolio.filter(is_active=True).count()
        published_blog_posts = blog_posts.filter(status=models.PublishStatus.PUBLISHED).count()
        active_faqs = models.Faq.objects.filter(is_deleted=False, is_active=True).count()
        active_static_pages = models.StaticPage.objects.filter(is_deleted=False, is_active=True).count()
        active_email_templates = models.EmailTemplate.objects.filter(is_active=True).count()

        if not settings_obj or not settings_obj.logo_url:
            data["readiness_alerts"].append({"code": "missing_logo", "tone": "warning", "target_path": "/admin/settings/identity"})
        if not settings_obj or not settings_obj.favicon_url:
            data["readiness_alerts"].append({"code": "missing_favicon", "tone": "warning", "target_path": "/admin/settings/identity"})
        if not settings_obj or not (settings_obj.phone or settings_obj.email or settings_obj.whatsapp):
            data["readiness_alerts"].append({"code": "missing_contact_channels", "tone": "warning", "target_path": "/admin/settings/identity"})
        if settings_obj and settings_obj.maintenance_mode:
            data["readiness_alerts"].append({"code": "maintenance_enabled", "tone": "danger", "target_path": "/admin/settings"})
        if published_services == 0:
            data["readiness_alerts"].append({"code": "no_services", "tone": "danger", "target_path": "/admin/services"})
        if published_products == 0:
            data["readiness_alerts"].append({"code": "no_products", "tone": "warning", "target_path": "/admin/products"})
        if active_faqs == 0:
            data["readiness_alerts"].append({"code": "no_faqs", "tone": "warning", "target_path": "/admin/faqs"})
        if active_static_pages < 3:
            data["readiness_alerts"].append({"code": "missing_static_pages", "tone": "warning", "target_path": "/admin/static-pages"})
        if active_email_templates == 0:
            data["readiness_alerts"].append({"code": "missing_email_templates", "tone": "warning", "target_path": "/admin/email-templates"})
        if published_apps == 0:
            data["readiness_alerts"].append({"code": "apps_need_manual_entry", "tone": "primary", "target_path": "/admin/apps"})
        if published_portfolio == 0:
            data["readiness_alerts"].append({"code": "portfolio_need_real_examples", "tone": "primary", "target_path": "/admin/portfolio"})
        if published_blog_posts == 0:
            data["readiness_alerts"].append({"code": "no_blog_posts", "tone": "warning", "target_path": "/admin/blog"})
        if data["stats"]["new_quote_requests"] > 0:
            data["readiness_alerts"].append({"code": "new_quote_requests", "tone": "primary", "target_path": "/admin/quote-requests"})
        if data["stats"]["unread_contact_messages"] > 0:
            data["readiness_alerts"].append({"code": "unread_contact_messages", "tone": "primary", "target_path": "/admin/contact-messages"})
        if data["stats"]["open_support_requests"] > 0:
            data["readiness_alerts"].append({"code": "open_support_requests", "tone": "warning", "target_path": "/admin/support-requests"})

        return success_response(data, message="تم جلب ملخص لوحة التحكم.")



class CustomersOverviewView(APIView):
    """ملخص تنفيذي لقسم الطلبات والعملاء داخل لوحة التحكم."""

    permission_classes = [IsAuthenticated]

    def _status_count(self, queryset, values: list[str]) -> int:
        return queryset.filter(status__in=values, is_deleted=False).count()

    def _customer_key(self, email: str | None, phone: str | None) -> str | None:
        if email:
            return f"email:{email.strip().lower()}"
        if phone:
            return f"phone:{phone.strip()}"
        return None

    def _latest_item(self, kind: str, item, target_path: str, subject: str | None = None) -> dict:
        return {
            "kind": kind,
            "id": str(item.id),
            "full_name": item.full_name,
            "email": item.email,
            "phone": item.phone,
            "subject": subject or getattr(item, "subject", None) or getattr(item, "project_type", None),
            "status": item.status,
            "priority": getattr(item, "priority", None),
            "created_at": item.created_at.isoformat() if item.created_at else None,
            "updated_at": item.updated_at.isoformat() if getattr(item, "updated_at", None) else None,
            "target_path": target_path,
        }

    def get(self, _request: Request):
        quotes = models.QuoteRequest.objects.filter(is_deleted=False)
        contacts = models.ContactMessage.objects.filter(is_deleted=False)
        support = models.SupportRequest.objects.filter(is_deleted=False)
        testimonials = models.Testimonial.objects.filter(is_deleted=False)

        unique_customers: set[str] = set()
        for item in quotes.only("email", "phone"):
            key = self._customer_key(item.email, item.phone)
            if key:
                unique_customers.add(key)
        for item in contacts.only("email", "phone"):
            key = self._customer_key(item.email, item.phone)
            if key:
                unique_customers.add(key)
        for item in support.only("email", "phone"):
            key = self._customer_key(item.email, item.phone)
            if key:
                unique_customers.add(key)

        new_quotes = quotes.filter(status=models.QuoteStatus.NEW).count()
        unread_messages = contacts.filter(status=models.ContactMessageStatus.NEW).count()
        open_support = support.exclude(status__in=[models.SupportRequestStatus.RESOLVED, models.SupportRequestStatus.ARCHIVED]).count()
        urgent_quotes = quotes.filter(priority=models.QuotePriority.URGENT).exclude(status__in=[models.QuoteStatus.COMPLETED, models.QuoteStatus.ARCHIVED, models.QuoteStatus.REJECTED]).count()
        urgent_support = support.filter(priority=models.QuotePriority.URGENT).exclude(status__in=[models.SupportRequestStatus.RESOLVED, models.SupportRequestStatus.ARCHIVED]).count()
        waiting_customer = quotes.filter(status=models.QuoteStatus.WAITING_CUSTOMER).count() + support.filter(status=models.SupportRequestStatus.WAITING_CUSTOMER).count()

        modules = [
            {
                "key": "quote_requests",
                "label_ar": "طلبات المشاريع",
                "label_en": "Project requests",
                "description_ar": "طلبات عروض الأسعار والمشاريع القادمة من الموقع العام.",
                "description_en": "Quote and project requests submitted from the public website.",
                "target_path": "/admin/quote-requests",
                "icon": "file",
                "total": quotes.count(),
                "new": new_quotes,
                "active": quotes.exclude(status__in=[models.QuoteStatus.COMPLETED, models.QuoteStatus.ARCHIVED, models.QuoteStatus.REJECTED]).count(),
                "waiting": quotes.filter(status=models.QuoteStatus.WAITING_CUSTOMER).count(),
                "resolved": quotes.filter(status__in=[models.QuoteStatus.ACCEPTED, models.QuoteStatus.COMPLETED]).count(),
                "closed": quotes.filter(status__in=[models.QuoteStatus.ARCHIVED, models.QuoteStatus.REJECTED]).count(),
                "needs_attention": new_quotes > 0 or urgent_quotes > 0,
                "tone": "warning" if urgent_quotes else ("primary" if new_quotes else "success"),
            },
            {
                "key": "contact_messages",
                "label_ar": "رسائل التواصل",
                "label_en": "Contact messages",
                "description_ar": "رسائل واستفسارات العملاء العامة.",
                "description_en": "General customer messages and inquiries.",
                "target_path": "/admin/contact-messages",
                "icon": "email",
                "total": contacts.count(),
                "new": unread_messages,
                "active": contacts.exclude(status=models.ContactMessageStatus.ARCHIVED).count(),
                "waiting": 0,
                "resolved": contacts.filter(status=models.ContactMessageStatus.REPLIED).count(),
                "closed": contacts.filter(status=models.ContactMessageStatus.ARCHIVED).count(),
                "needs_attention": unread_messages > 0,
                "tone": "primary" if unread_messages else "success",
            },
            {
                "key": "support_requests",
                "label_ar": "طلبات الدعم",
                "label_en": "Support requests",
                "description_ar": "طلبات الدعم الفني والمتابعة بعد التسليم.",
                "description_en": "Technical support and post-delivery follow-up tickets.",
                "target_path": "/admin/support-requests",
                "icon": "support",
                "total": support.count(),
                "new": support.filter(status=models.SupportRequestStatus.NEW).count(),
                "active": open_support,
                "waiting": support.filter(status=models.SupportRequestStatus.WAITING_CUSTOMER).count(),
                "resolved": support.filter(status=models.SupportRequestStatus.RESOLVED).count(),
                "closed": support.filter(status=models.SupportRequestStatus.ARCHIVED).count(),
                "needs_attention": open_support > 0 or urgent_support > 0,
                "tone": "warning" if urgent_support else ("primary" if open_support else "success"),
            },
            {
                "key": "testimonials",
                "label_ar": "آراء العملاء",
                "label_en": "Testimonials",
                "description_ar": "شهادات العملاء التي تظهر في الموقع العام بعد اعتمادها.",
                "description_en": "Customer testimonials displayed on the public website once approved.",
                "target_path": "/admin/testimonials",
                "icon": "testimonials",
                "total": testimonials.count(),
                "new": 0,
                "active": testimonials.filter(is_active=True).count(),
                "waiting": testimonials.filter(is_active=False).count(),
                "resolved": testimonials.filter(is_active=True).count(),
                "closed": testimonials.filter(is_active=False).count(),
                "needs_attention": testimonials.filter(is_active=True).count() == 0,
                "tone": "warning" if testimonials.filter(is_active=True).count() == 0 else "success",
            },
        ]

        latest_items = []
        latest_items.extend([
            self._latest_item("quote_request", item, f"/admin/quote-requests?selected={item.id}", subject=item.project_type)
            for item in quotes.order_by("-created_at")[:5]
        ])
        latest_items.extend([
            self._latest_item("contact_message", item, f"/admin/contact-messages?selected={item.id}", subject=item.subject)
            for item in contacts.order_by("-created_at")[:5]
        ])
        latest_items.extend([
            self._latest_item("support_request", item, f"/admin/support-requests?selected={item.id}", subject=item.subject)
            for item in support.order_by("-created_at")[:5]
        ])
        latest_items.sort(key=lambda item: item.get("created_at") or "", reverse=True)

        due_followups = [
            {
                "id": str(item.id),
                "full_name": item.full_name,
                "phone": item.phone,
                "email": item.email,
                "status": item.status,
                "priority": item.priority,
                "follow_up_at": item.follow_up_at.isoformat() if item.follow_up_at else None,
                "target_path": f"/admin/quote-requests?selected={item.id}",
            }
            for item in quotes.filter(follow_up_at__isnull=False)
            .exclude(status__in=[models.QuoteStatus.COMPLETED, models.QuoteStatus.ARCHIVED, models.QuoteStatus.REJECTED])
            .order_by("follow_up_at")[:8]
        ]

        alerts = []
        if new_quotes:
            alerts.append({"code": "new_quote_requests", "tone": "primary", "label_ar": "يوجد طلبات مشاريع جديدة تحتاج مراجعة.", "label_en": "New project requests need review.", "target_path": "/admin/quote-requests"})
        if unread_messages:
            alerts.append({"code": "unread_contact_messages", "tone": "primary", "label_ar": "يوجد رسائل تواصل جديدة غير معالجة.", "label_en": "New contact messages are waiting.", "target_path": "/admin/contact-messages"})
        if open_support:
            alerts.append({"code": "open_support_requests", "tone": "warning", "label_ar": "يوجد طلبات دعم مفتوحة تحتاج متابعة.", "label_en": "Open support tickets need follow-up.", "target_path": "/admin/support-requests"})
        if urgent_quotes or urgent_support:
            alerts.append({"code": "urgent_customer_items", "tone": "danger", "label_ar": "يوجد عناصر عاجلة ضمن الطلبات أو الدعم.", "label_en": "Urgent customer items are present.", "target_path": "/admin/customers"})

        return success_response(
            {
                "generated_at": timezone.now().isoformat(),
                "totals": {
                    "unique_customers": len(unique_customers),
                    "quote_requests": quotes.count(),
                    "contact_messages": contacts.count(),
                    "support_requests": support.count(),
                    "testimonials": testimonials.count(),
                    "open_items": new_quotes + unread_messages + open_support,
                    "urgent_items": urgent_quotes + urgent_support,
                    "waiting_customer": waiting_customer,
                },
                "modules": modules,
                "alerts": alerts,
                "latest_items": latest_items[:10],
                "due_followups": due_followups,
                "rules": {
                    "ar": "هذا القسم يستقبل الطلبات من الموقع العام؛ لا يتم إدخال الطلبات يدويًا إلا للحالات الخاصة.",
                    "en": "This section receives requests from the public website; manual entry is only for special cases.",
                },
            },
            message="تم جلب ملخص الطلبات والعملاء.",
        )

class ContentOverviewView(APIView):
    """ملخص تنفيذي لإدارة المحتوى داخل لوحة التحكم."""

    permission_classes = [IsAuthenticated]

    def get(self, _request: Request):
        services = models.Service.objects.filter(is_deleted=False)
        products = models.Product.objects.filter(is_deleted=False)
        apps = models.SoftwareApp.objects.filter(is_deleted=False)
        portfolio = models.PortfolioProject.objects.filter(is_deleted=False)
        blog_posts = models.BlogPost.objects.filter(is_deleted=False)
        static_pages = models.StaticPage.objects.filter(is_deleted=False)
        faqs = models.Faq.objects.filter(is_deleted=False)
        testimonials = models.Testimonial.objects.filter(is_deleted=False)
        media_files = models.MediaFile.objects.filter(is_deleted=False)
        email_templates = models.EmailTemplate.objects.all()

        def module_status(
            *,
            key: str,
            label_ar: str,
            label_en: str,
            description_ar: str,
            description_en: str,
            icon: str,
            target_path: str,
            total: int,
            visible: int,
            hidden: int = 0,
            draft: int = 0,
            required_minimum: int = 1,
            seed_managed: bool = False,
            manual_entry_required: bool = False,
            public_path: str | None = None,
        ):
            needs_attention = total < required_minimum or visible == 0
            completion_score = 100
            if total < required_minimum:
                completion_score = 25
            elif visible == 0:
                completion_score = 55
            elif draft or hidden:
                completion_score = 82

            tone = "success"
            if completion_score < 50:
                tone = "danger"
            elif completion_score < 80:
                tone = "warning"
            elif completion_score < 100:
                tone = "primary"

            return {
                "key": key,
                "label_ar": label_ar,
                "label_en": label_en,
                "description_ar": description_ar,
                "description_en": description_en,
                "icon": icon,
                "target_path": target_path,
                "public_path": public_path,
                "total": total,
                "visible": visible,
                "hidden": hidden,
                "draft": draft,
                "required_minimum": required_minimum,
                "needs_attention": needs_attention,
                "completion_score": completion_score,
                "tone": tone,
                "seed_managed": seed_managed,
                "manual_entry_required": manual_entry_required,
            }

        modules = [
            module_status(
                key="services",
                label_ar="الخدمات",
                label_en="Services",
                description_ar="قائمة الخدمات الأساسية التي تقدمها الشركة، وتُجهز تلقائيًا من الباكند ويمكن تعديلها من الأدمن.",
                description_en="Core company services seeded from the backend and editable from admin.",
                icon="services",
                target_path="/admin/services",
                public_path="/services",
                total=services.count(),
                visible=services.filter(is_active=True).count(),
                hidden=services.filter(is_active=False).count(),
                required_minimum=8,
                seed_managed=True,
            ),
            module_status(
                key="products",
                label_ar="الأنظمة",
                label_en="Systems",
                description_ar="حلول وأنظمة برمجية جاهزة للعرض، مثل أنظمة المطاعم والحجوزات والإدارة.",
                description_en="Software systems and solutions presented on the public website.",
                icon="products",
                target_path="/admin/products",
                public_path="/products",
                total=products.count(),
                visible=products.filter(is_active=True).exclude(status=models.ProductStatus.HIDDEN).count(),
                hidden=products.filter(is_active=False).count() + products.filter(status=models.ProductStatus.HIDDEN).count(),
                required_minimum=6,
                seed_managed=True,
            ),
            module_status(
                key="apps",
                label_ar="التطبيقات",
                label_en="Applications",
                description_ar="تُضاف يدويًا لأنها تحتاج روابط تحميل وإصدارات وملفات حقيقية.",
                description_en="Managed manually because apps need real versions, files, and download links.",
                icon="apps",
                target_path="/admin/apps",
                public_path="/apps",
                total=apps.count(),
                visible=apps.filter(is_active=True).exclude(status=models.AppStatus.HIDDEN).count(),
                hidden=apps.filter(is_active=False).count() + apps.filter(status=models.AppStatus.HIDDEN).count(),
                required_minimum=0,
                manual_entry_required=True,
            ),
            module_status(
                key="portfolio",
                label_ar="الأعمال",
                label_en="Portfolio",
                description_ar="مشاريع وأعمال حقيقية يجب إضافتها يدويًا عند توفر صور وتفاصيل موثوقة.",
                description_en="Real case studies and portfolio work should be added manually.",
                icon="portfolio",
                target_path="/admin/portfolio",
                public_path="/portfolio",
                total=portfolio.count(),
                visible=portfolio.filter(is_active=True).count(),
                hidden=portfolio.filter(is_active=False).count(),
                required_minimum=0,
                manual_entry_required=True,
            ),
            module_status(
                key="blog",
                label_ar="المدونة",
                label_en="Blog",
                description_ar="مقالات تأسيسية أو تسويقية تدعم SEO وتشرح الخدمات والأنظمة.",
                description_en="Editorial and SEO articles explaining services and systems.",
                icon="blog",
                target_path="/admin/blog",
                public_path="/blog",
                total=blog_posts.count(),
                visible=blog_posts.filter(status=models.PublishStatus.PUBLISHED).count(),
                draft=blog_posts.filter(status=models.PublishStatus.DRAFT).count(),
                required_minimum=3,
                seed_managed=True,
            ),
            module_status(
                key="static_pages",
                label_ar="الصفحات الثابتة",
                label_en="Static Pages",
                description_ar="من نحن، الخصوصية، الشروط، والدعم؛ يجب أن تبقى مكتملة ومنشورة.",
                description_en="About, privacy, terms, support, and other managed static pages.",
                icon="pages",
                target_path="/admin/static-pages",
                total=static_pages.count(),
                visible=static_pages.filter(is_active=True).count(),
                hidden=static_pages.filter(is_active=False).count(),
                required_minimum=3,
                seed_managed=True,
            ),
            module_status(
                key="faqs",
                label_ar="الأسئلة الشائعة",
                label_en="FAQs",
                description_ar="أسئلة عامة وأسئلة مرتبطة بالخدمات والأنظمة لتقليل تردد العميل.",
                description_en="General and service-specific FAQs to support visitor decisions.",
                icon="faq",
                target_path="/admin/faqs",
                total=faqs.count(),
                visible=faqs.filter(is_active=True).count(),
                hidden=faqs.filter(is_active=False).count(),
                required_minimum=6,
                seed_managed=True,
            ),
            module_status(
                key="testimonials",
                label_ar="آراء العملاء",
                label_en="Testimonials",
                description_ar="تُبقي مخفية حتى يتم إدخال آراء حقيقية وموثوقة.",
                description_en="Can remain hidden until real and verified testimonials are added.",
                icon="testimonials",
                target_path="/admin/testimonials",
                total=testimonials.count(),
                visible=testimonials.filter(is_active=True).count(),
                hidden=testimonials.filter(is_active=False).count(),
                required_minimum=0,
                manual_entry_required=True,
            ),
            module_status(
                key="media",
                label_ar="الوسائط",
                label_en="Media",
                description_ar="صور الشعارات والأقسام والأعمال والملفات المستخدمة في المحتوى.",
                description_en="Uploaded logos, images, files, and reusable media assets.",
                icon="media",
                target_path="/admin/media",
                total=media_files.count(),
                visible=media_files.count(),
                hidden=0,
                required_minimum=1,
            ),
            module_status(
                key="email_templates",
                label_ar="قوالب البريد",
                label_en="Email Templates",
                description_ar="قوالب الرد على التواصل وطلب عرض السعر والدعم.",
                description_en="Email templates for contact, quote, and support workflows.",
                icon="email",
                target_path="/admin/email-templates",
                total=email_templates.count(),
                visible=email_templates.filter(is_active=True).count(),
                hidden=email_templates.filter(is_active=False).count(),
                required_minimum=3,
                seed_managed=True,
            ),
        ]

        totals = {
            "modules_count": len(modules),
            "items_count": sum(int(item["total"]) for item in modules),
            "visible_count": sum(int(item["visible"]) for item in modules),
            "hidden_count": sum(int(item.get("hidden", 0) or 0) for item in modules),
            "draft_count": sum(int(item.get("draft", 0) or 0) for item in modules),
            "attention_count": sum(1 for item in modules if item["needs_attention"]),
            "seed_managed_count": sum(1 for item in modules if item["seed_managed"]),
            "manual_entry_count": sum(1 for item in modules if item["manual_entry_required"]),
        }

        readiness_alerts = []
        for item in modules:
            if item["needs_attention"]:
                readiness_alerts.append({
                    "code": f"content_{item['key']}_needs_attention",
                    "tone": item["tone"],
                    "label_ar": item["label_ar"],
                    "label_en": item["label_en"],
                    "target_path": item["target_path"],
                })

        latest_activity = serializers.AuditLogSerializer(models.AuditLog.objects.all()[:8], many=True).data

        return success_response(
            {
                "generated_at": timezone.now(),
                "totals": totals,
                "modules": modules,
                "readiness_alerts": readiness_alerts,
                "latest_activity": latest_activity,
                "rules": {
                    "seed_managed_ar": "الخدمات والأنظمة والصفحات والأسئلة وقوالب البريد تُجهز تلقائيًا من الباكند ثم تُعدل من لوحة التحكم.",
                    "manual_entry_ar": "التطبيقات والأعمال وآراء العملاء الحقيقية تُضاف يدويًا لأنها تحتاج بيانات وملفات واقعية.",
                    "seed_managed_en": "Services, systems, pages, FAQs, and email templates are seeded from the backend then edited in admin.",
                    "manual_entry_en": "Apps, portfolio, and real testimonials are added manually because they need real files and details.",
                },
            },
            message="تم جلب ملخص إدارة المحتوى.",
        )



class SettingsOverviewView(APIView):
    permission_classes = [HasPermissionKey]
    required_permission = PermissionKey.MANAGE_SETTINGS

    def get(self, _request: Request):
        obj = models.SiteSettings.objects.order_by("created_at").first()
        settings_data = serializers.SiteSettingsSerializer(obj).data if obj else {}

        social_links = settings_data.get("social_links") if isinstance(settings_data.get("social_links"), dict) else {}
        visible_sections = settings_data.get("visible_sections") if isinstance(settings_data.get("visible_sections"), dict) else {}
        extra_settings = settings_data.get("extra_settings") if isinstance(settings_data.get("extra_settings"), dict) else {}
        home_settings = extra_settings.get("home") if isinstance(extra_settings.get("home"), dict) else {}

        def has_text(key: str) -> bool:
            value = settings_data.get(key)
            return isinstance(value, str) and bool(value.strip())

        def module(key: str, label_ar: str, label_en: str, description_ar: str, description_en: str, target_path: str, done: bool, tone_if_missing: str = "warning") -> dict:
            return {
                "key": key,
                "label_ar": label_ar,
                "label_en": label_en,
                "description_ar": description_ar,
                "description_en": description_en,
                "target_path": target_path,
                "done": done,
                "tone": "success" if done else tone_if_missing,
            }

        ai_config = _get_ai_config_from_settings_obj(obj)

        modules = [
            module(
                "identity",
                "هوية الموقع",
                "Site identity",
                "اسم الشركة والوصف والشعار والأيقونة.",
                "Company name, description, logo, and favicon.",
                "/admin/settings/identity",
                has_text("site_name_ar") and has_text("site_name_en") and has_text("company_description_ar") and has_text("logo_url"),
            ),
            module(
                "contact",
                "بيانات التواصل",
                "Contact details",
                "البريد والهاتف والواتساب والعنوان وساعات العمل.",
                "Email, phone, WhatsApp, address, and working hours.",
                "/admin/settings/contact",
                has_text("email") or has_text("phone") or has_text("whatsapp"),
            ),
            module(
                "social",
                "روابط التواصل الاجتماعي",
                "Social links",
                "قنوات التواصل التي تظهر في الموقع والفوتر.",
                "Social channels shown on the website and footer.",
                "/admin/settings/social",
                any(bool(str(value).strip()) for value in social_links.values()),
            ),
            module(
                "seo",
                "إعدادات SEO",
                "SEO settings",
                "عنوان ووصف الموقع لمحركات البحث والمشاركة.",
                "Search and sharing title/description.",
                "/admin/settings/seo",
                (has_text("seo_title_ar") or has_text("seo_title_en")) and (has_text("seo_description_ar") or has_text("seo_description_en")),
            ),
            module(
                "appearance",
                "المظهر واللغة",
                "Appearance and language",
                "الثيم، اللغة الافتراضية، وتفعيل النسخة الإنجليزية.",
                "Theme, default language, and English version toggle.",
                "/admin/settings/appearance",
                bool(settings_data.get("active_theme")) and bool(settings_data.get("default_language")),
            ),
            module(
                "maintenance",
                "الصيانة",
                "Maintenance",
                "حالة الموقع ورسالة الصيانة عند الحاجة.",
                "Website availability and maintenance message.",
                "/admin/settings/maintenance",
                not bool(settings_data.get("maintenance_mode")),
                "danger",
            ),
            module(
                "ai",
                "الذكاء الاصطناعي",
                "AI assistant",
                "إعدادات التوليد والترجمة التلقائية داخل لوحة التحكم.",
                "Generation and auto-translation settings inside admin.",
                "/admin/ai",
                bool(ai_config.get("enabled") and ai_config.get("api_key_configured")),
            ),
            module(
                "home",
                "محتوى الصفحة الرئيسية",
                "Homepage content",
                "عنوان الهيرو، الأزرار، أقسام العرض، والتقنيات.",
                "Hero content, CTAs, visible sections, and technologies.",
                "/admin/settings/identity",
                bool(home_settings) or any(bool(value) for value in visible_sections.values()),
            ),
        ]

        readiness_alerts = []
        for item in modules:
            if not item["done"]:
                readiness_alerts.append({
                    "code": f"settings_{item['key']}_incomplete",
                    "tone": item["tone"],
                    "label_ar": f"يلزم إكمال {item['label_ar']}",
                    "label_en": f"Complete {item['label_en']}",
                    "target_path": item["target_path"],
                })

        completed = sum(1 for item in modules if item["done"])
        total = len(modules)
        completion_score = round((completed / total) * 100) if total else 0

        return success_response(
            {
                "generated_at": timezone.now(),
                "completion_score": completion_score,
                "totals": {
                    "modules_count": total,
                    "completed_modules": completed,
                    "attention_count": len(readiness_alerts),
                    "social_channels": sum(1 for value in social_links.values() if str(value).strip()),
                    "visible_sections": sum(1 for value in visible_sections.values() if bool(value)),
                    "maintenance_mode": bool(settings_data.get("maintenance_mode")),
                },
                "modules": modules,
                "readiness_alerts": readiness_alerts,
                "settings": {
                    "site_name_ar": settings_data.get("site_name_ar"),
                    "site_name_en": settings_data.get("site_name_en"),
                    "active_theme": settings_data.get("active_theme"),
                    "default_language": settings_data.get("default_language"),
                    "is_english_enabled": bool(settings_data.get("is_english_enabled", True)),
                    "has_logo": has_text("logo_url"),
                    "has_favicon": has_text("favicon_url"),
                    "has_contact_channels": has_text("email") or has_text("phone") or has_text("whatsapp"),
                    "has_seo": (has_text("seo_title_ar") or has_text("seo_title_en")) and (has_text("seo_description_ar") or has_text("seo_description_en")),
                },
                "system": {
                    "ai_enabled": bool(ai_config.get("enabled")),
                    "ai_provider": ai_config.get("provider"),
                    "ai_key_configured": bool(ai_config.get("api_key_configured")),
                    "ai_source": ai_config.get("source"),
                    "debug": bool(settings.DEBUG),
                },
                "rules": {
                    "ar": "الإعدادات هي المصدر المركزي لهوية الموقع، اللغة، الثيم، السوشيال، SEO، والصيانة. لا تكرر هذه البيانات داخل صفحات أخرى.",
                    "en": "Settings are the central source of truth for identity, language, theme, social links, SEO, and maintenance. Do not duplicate them in pages.",
                },
            },
            message="تم جلب ملخص الإعدادات.",
        )


class SettingsView(APIView):
    permission_classes = [HasPermissionKey]
    required_permission = PermissionKey.MANAGE_SETTINGS

    def get(self, _request: Request):
        obj = models.SiteSettings.objects.order_by("created_at").first()
        data = serializers.SiteSettingsSerializer(obj).data if obj else {}
        return success_response(data, message="تم جلب إعدادات الموقع.")

    def patch(self, request: Request):
        obj = models.SiteSettings.objects.order_by("created_at").first() or models.SiteSettings()
        serializer = serializers.SiteSettingsSerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        saved = serializer.save()
        _audit_action(request, models.AuditAction.SETTINGS_CHANGE, saved, "تم تعديل إعدادات الموقع.", after_data=serializer.data)
        return success_response(serializer.data, message="تم تعديل إعدادات الموقع.")


class PublicListDetailView(APIView):
    permission_classes = [AllowAny]
    model = None
    serializer_class = None
    hidden_status_value = None
    published_only = False

    def get_queryset(self):
        queryset = self.model.objects.all()
        if hasattr(self.model, "is_deleted"):
            queryset = queryset.filter(is_deleted=False)
        if hasattr(self.model, "is_active"):
            queryset = queryset.filter(is_active=True)
        if self.hidden_status_value:
            queryset = queryset.exclude(status=self.hidden_status_value)
        if self.published_only:
            queryset = queryset.filter(status=models.PublishStatus.PUBLISHED)
        return queryset

    def get(self, _request: Request, slug: str | None = None):
        queryset = self.get_queryset()
        if slug:
            obj = queryset.filter(Q(slug_ar=slug) | Q(slug_en=slug)).first()
            if obj is None:
                return error_response("العنصر المطلوب غير موجود.", status_code=status.HTTP_404_NOT_FOUND, code="not_found")
            return success_response(self.serializer_class(obj).data, message="تم جلب التفاصيل.")
        return success_response(self.serializer_class(queryset, many=True).data, message="تم جلب البيانات بنجاح.")



class PublicTestimonialSubmitView(APIView):
    """استقبال آراء العملاء من الموقع العام مع إبقائها بانتظار مراجعة الإدارة."""

    permission_classes = [AllowAny]
    throttle_scope = "public_forms"

    def post(self, request: Request):
        # حقل مخفي ضد السبام؛ إذا امتلأ نتعامل معه كروبوت ونرجع قبول وهمي.
        if request.data.get("website"):
            return success_response(
                {"accepted": True, "requires_review": True},
                message="تم إرسال رأيك بنجاح.",
                status_code=status.HTTP_201_CREATED,
            )

        client_name = str(request.data.get("client_name") or request.data.get("full_name") or "").strip()
        company_name = str(request.data.get("company_name") or "").strip()
        position = str(request.data.get("position") or "").strip()
        text_ar = str(request.data.get("text") or request.data.get("text_ar") or request.data.get("message") or "").strip()

        if not client_name:
            raise ValidationError({"client_name": "يرجى إدخال اسم العميل."})

        if len(client_name) > 160:
            raise ValidationError({"client_name": "اسم العميل طويل جدًا."})

        if not text_ar:
            raise ValidationError({"text": "يرجى كتابة الرأي أو التجربة."})

        if len(text_ar) < 10:
            raise ValidationError({"text": "الرأي قصير جدًا. يرجى كتابة تجربة أوضح."})

        try:
            rating = int(request.data.get("rating") or 5)
        except (TypeError, ValueError):
            rating = 5

        rating = max(1, min(5, rating))

        testimonial = models.Testimonial.objects.create(
            client_name=client_name,
            company_name=company_name[:160] or None,
            position=position[:160] or None,
            text_ar=text_ar,
            # لا نحتاج أن يكتب العميل بالإنجليزي؛ الترجمة/التحسين يمكن أن تتم لاحقًا من لوحة التحكم.
            text_en=text_ar,
            rating=rating,
            is_active=False,
            sort_order=0,
        )

        try:
            models.AdminNotification.objects.create(
                notification_type=models.NotificationType.SYSTEM,
                title_ar="رأي عميل جديد بانتظار المراجعة",
                title_en="New customer testimonial pending review",
                body_ar=f"أرسل {client_name} رأيًا جديدًا من الموقع ويحتاج مراجعة قبل النشر.",
                body_en=f"{client_name} submitted a new testimonial from the website and it needs review before publishing.",
                target_type="testimonial",
                target_id=str(testimonial.id),
                action_url=f"/admin/testimonials?open={testimonial.id}",
                extra_data={
                    "source": "public_form",
                    "kind": "testimonial_submission",
                    "requires_review": True,
                    "rating": rating,
                },
            )
        except Exception:
            # الإشعار مهم لكنه لا يجب أن يمنع استقبال رأي العميل.
            pass

        return success_response(
            {
                "id": str(testimonial.id),
                "accepted": True,
                "requires_review": True,
                "rating": rating,
                "created_at": testimonial.created_at,
            },
            message="تم إرسال رأيك بنجاح، وسيظهر بعد مراجعته من الإدارة.",
            status_code=status.HTTP_201_CREATED,
        )



class PublicSettingsView(APIView):
    permission_classes = [AllowAny]

    def get(self, _request: Request):
        obj = models.SiteSettings.objects.order_by("created_at").first()
        if obj:
            return success_response(serializers.SiteSettingsSerializer(obj).data, message="تم جلب إعدادات الموقع.")
        return success_response(
            {
                "site_name_ar": "سيرفا كود",
                "site_name_en": "ServaCode",
                "active_theme": "blue-tech",
                "default_language": "ar",
                "is_english_enabled": True,
                "social_links": {},
                "visible_sections": {},
            },
            message="لم يتم ضبط إعدادات الموقع بعد.",
        )


class PublicStaticPageView(APIView):
    permission_classes = [AllowAny]

    def get(self, _request: Request, identifier: str):
        obj = models.StaticPage.objects.filter(
            Q(page_key=identifier) | Q(slug_ar=identifier) | Q(slug_en=identifier),
            is_deleted=False,
            is_active=True,
        ).first()
        if obj is None:
            return error_response("الصفحة المطلوبة غير موجودة.", status_code=status.HTTP_404_NOT_FOUND, code="not_found")
        return success_response(serializers.StaticPageSerializer(obj).data, message="تم جلب الصفحة بنجاح.")


class AnalyticsSummaryView(APIView):
    permission_classes = [HasPermissionKey]
    required_permission = PermissionKey.VIEW_ANALYTICS

    def get(self, request: Request):
        try:
            days = int(request.query_params.get("days") or 30)
        except (TypeError, ValueError):
            days = 30
        days = max(1, min(days, 365))

        period_start = timezone.now() - timedelta(days=days - 1)
        events = models.AnalyticsEvent.objects.filter(created_at__gte=period_start)

        search = str(request.query_params.get("search") or "").strip()
        if search:
            events = events.filter(Q(path__icontains=search) | Q(referrer__icontains=search) | Q(ip_address__icontains=search))

        locale = str(request.query_params.get("locale") or "").strip()
        if locale:
            events = events.filter(locale=locale)

        event_type = str(request.query_params.get("event_type") or "").strip()
        if event_type:
            events = events.filter(event_type=event_type)

        today = timezone.localdate()

        def count_by(field_name: str, *, limit: int = 10) -> list[dict[str, int | str]]:
            return [
                {"label": item[field_name] or "غير محدد", "count": item["count"]}
                for item in events.values(field_name).annotate(count=Count("id")).order_by("-count", field_name)[:limit]
            ]

        daily = [
            {"date": item["day"].isoformat(), "count": item["count"]}
            for item in events.annotate(day=TruncDate("created_at")).values("day").annotate(count=Count("id")).order_by("day")
            if item["day"] is not None
        ]

        data = {
            "period_days": days,
            "period_start": period_start,
            "stats": {
                "total_events": events.count(),
                "page_views": events.filter(event_type=models.AnalyticsEventType.PAGE_VIEW).count(),
                "today_events": events.filter(created_at__date=today).count(),
                "unique_visitors": events.exclude(ip_address__isnull=True).exclude(ip_address="").values("ip_address").distinct().count(),
                "unique_paths": events.exclude(path__isnull=True).exclude(path="").values("path").distinct().count(),
            },
            "top_pages": count_by("path", limit=10),
            "locales": count_by("locale", limit=10),
            "event_types": count_by("event_type", limit=10),
            "entity_types": count_by("entity_type", limit=10),
            "daily": daily,
            "recent_events": serializers.AnalyticsEventSerializer(events.order_by("-created_at")[:100], many=True).data,
        }
        return success_response(data, message="تم جلب ملخص التحليلات.")


class PublicFaqsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: Request):
        queryset = models.Faq.objects.filter(is_deleted=False, is_active=True)
        if request.query_params.get("scope"):
            queryset = queryset.filter(scope=request.query_params["scope"])
        if request.query_params.get("service_id"):
            queryset = queryset.filter(service_id=request.query_params["service_id"])
        if request.query_params.get("product_id"):
            queryset = queryset.filter(product_id=request.query_params["product_id"])
        return success_response(serializers.FaqSerializer(queryset, many=True).data, message="تم جلب الأسئلة الشائعة بنجاح.")


class PublicAnalyticsEventView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = "analytics"

    def post(self, request: Request):
        payload = dict(request.data)
        payload["ip_address"] = request.META.get("REMOTE_ADDR")
        payload["user_agent"] = request.META.get("HTTP_USER_AGENT", "")[:500]
        serializer = serializers.AnalyticsEventSerializer(data=payload)
        serializer.is_valid(raise_exception=True)
        event = serializer.save()
        return success_response({"accepted": True, "id": str(event.id)}, message="تم تسجيل الحدث التحليلي.", status_code=status.HTTP_201_CREATED)


class PublicCreateView(APIView):
    permission_classes = [AllowAny]
    serializer_class = None
    throttle_scope = "public_forms"

    def post(self, request: Request):
        if request.data.get("website"):
            return success_response({"accepted": True}, message="تم إرسال الطلب بنجاح.", status_code=status.HTTP_201_CREATED)
        payload = {key: value for key, value in request.data.items() if key != "website"}
        if "ip_address" in self.serializer_class.Meta.model._meta.fields_map or hasattr(self.serializer_class.Meta.model, "ip_address"):
            payload["ip_address"] = request.META.get("REMOTE_ADDR")
            payload["user_agent"] = request.META.get("HTTP_USER_AGENT", "")[:500]
        serializer = self.serializer_class(data=payload)
        serializer.is_valid(raise_exception=True)
        obj = serializer.save()
        _create_admin_notification_for_public_object(obj)
        return success_response({"id": str(obj.id), "accepted": True, "status": getattr(obj, "status", None), "created_at": obj.created_at}, message="تم إرسال الطلب بنجاح.", status_code=status.HTTP_201_CREATED)


class AiSettingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, _request: Request):
        data = _get_ai_config_from_settings_obj()
        return success_response(data, message="تم جلب إعدادات الذكاء الاصطناعي.")

    def patch(self, request: Request):
        serializer = serializers.AiSettingsUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = dict(serializer.validated_data)
        settings_obj = _get_site_settings_instance()
        extra = dict(settings_obj.extra_settings or {})
        ai = dict(extra.get("ai") or {})

        for key in [
            "enabled",
            "provider",
            "base_url",
            "text_model",
            "image_model",
            "timeout_seconds",
            "auto_translate",
            "auto_fill_seo",
            "hide_english_fields",
            "enable_ai_everywhere",
        ]:
            if key in payload:
                ai[key] = payload[key]

        api_key = str(payload.get("api_key") or "").strip()
        if payload.get("clear_api_key"):
            ai["api_key"] = ""
        elif api_key and not set(api_key) <= {"*"}:
            ai["api_key"] = api_key

        extra["ai"] = ai
        settings_obj.extra_settings = extra
        settings_obj.save(update_fields=["extra_settings", "updated_at"])
        _audit_action(request, models.AuditAction.SETTINGS_CHANGE, settings_obj, "تحديث إعدادات الذكاء الاصطناعي.")
        return success_response(_get_ai_config_from_settings_obj(settings_obj), message="تم حفظ إعدادات الذكاء الاصطناعي.")


class AiSettingsTestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, _request: Request):
        data = _get_ai_config_from_settings_obj()
        ready = bool(data.get("enabled") and data.get("api_key_configured") and data.get("base_url_configured"))
        return success_response(
            {
                "ready": ready,
                "provider": data.get("provider"),
                "text_model": data.get("text_model"),
                "message_ar": "إعدادات الذكاء الاصطناعي جاهزة." if ready else "أكمل مفتاح API ورابط المزود لتفعيل الذكاء الاصطناعي.",
                "message_en": "AI settings are ready." if ready else "Add the API key and provider URL to enable AI.",
            },
            message="تم اختبار جاهزية إعدادات الذكاء الاصطناعي.",
        )


class AiGenerateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request):
        serializer = serializers.AiGenerateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        content = AdminAiService().generate(serializer.validated_data)
        return success_response(
            {"content": content.as_dict(), "used_ai": content.provider != "fallback", "provider": content.provider, "model": content.model},
            message="تم توليد المحتوى الذكي.",
        )


class AiTranslateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request):
        serializer = serializers.AiTranslateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        fields = AdminAiService().translate_fields_to_english(
            serializer.validated_data["fields"],
            overwrite=serializer.validated_data["overwrite"],
        )
        return success_response({"fields": fields}, message="تمت معالجة الترجمة الذكية.")


class AiGenerateImageView(APIView):
    permission_classes = [HasPermissionKey]
    required_permission = PermissionKey.MANAGE_MEDIA

    def post(self, request: Request):
        serializer = serializers.AiImageGenerateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            image_bytes, prompt, mime_type, extension, used_ai, provider, model = AdminAiService().generate_image_bytes(
                serializer.validated_data
            )
        except AiServiceError as exc:
            raise ValidationError(str(exc)) from exc

        dated_folder = timezone.now().strftime("%Y/%m")
        target_folder = Path(settings.MEDIA_ROOT) / dated_folder
        target_folder.mkdir(parents=True, exist_ok=True)
        safe_prefix = "ai-icon" if serializer.validated_data["image_kind"] == "icon" else "ai-image"
        file_name = f"{safe_prefix}-{uuid4().hex}{extension}"
        storage_path = target_folder / file_name
        storage_path.write_bytes(image_bytes)

        relative_storage_path = str(Path(dated_folder) / file_name).replace("\\", "/")
        title = (serializer.validated_data.get("title_ar") or serializer.validated_data["image_kind"]).strip()
        media = models.MediaFile.objects.create(
            uploaded_by_id=request.user,
            file_name=file_name,
            original_name=f"{safe_prefix}-{title}{extension}",
            mime_type=mime_type,
            media_type=models.MediaType.IMAGE,
            file_size=len(image_bytes),
            url=f"{settings.MEDIA_URL}{relative_storage_path}",
            storage_path=relative_storage_path,
            alt_text_ar=title[:255],
            extra_data={"source": "ai_generated", "ai_prompt": prompt, "ai_provider": provider, "ai_model": model},
        )
        return success_response(
            {
                "image_url": media.url,
                "media_id": str(media.id),
                "prompt": prompt,
                "used_ai": used_ai,
                "provider": provider,
                "model": model,
                "mime_type": mime_type,
                "file_size": len(image_bytes),
            },
            message="تم توليد الصورة وحفظها في مكتبة الوسائط.",
            status_code=status.HTTP_201_CREATED,
        )


class ExportSupportRequestsView(APIView):
    permission_classes = [HasPermissionKey]
    required_permission = PermissionKey.EXPORT_DATA

    def get(self, _request: Request):
        rows = [
            {
                "id": item.id,
                "full_name": item.full_name,
                "phone": item.phone,
                "email": item.email,
                "app_name": item.app_name,
                "subject": item.subject,
                "status": item.status,
                "priority": item.priority,
                "created_at": item.created_at,
            }
            for item in models.SupportRequest.objects.filter(is_deleted=False).order_by("-created_at")
        ]
        return _csv_response("support_requests.csv", rows)


class BulkTranslationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request):
        serializer = serializers.BulkTranslationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        items = [TranslationItem(**item) for item in serializer.validated_data.get("items", [])]
        service = TranslationService()
        translated = service.translate_many(
            items,
            source_language=serializer.validated_data["source_language"],
            target_language=serializer.validated_data["target_language"],
        )
        return success_response(
            {"items": translated, "provider": service.provider, "skipped": max(len(items) - len(translated), 0)},
            message="تمت ترجمة المحتوى تلقائيًا.",
        )


def _csv_response(filename: str, rows: list[dict]) -> HttpResponse:
    buffer = io.StringIO()
    fieldnames = list(rows[0].keys()) if rows else ["empty"]
    writer = csv.DictWriter(buffer, fieldnames=fieldnames)
    writer.writeheader()
    for row in rows:
        writer.writerow(row)
    response = HttpResponse(buffer.getvalue(), content_type="text/csv; charset=utf-8")
    response["Content-Disposition"] = f"attachment; filename={filename}"
    return response


class ExportQuoteRequestsView(APIView):
    permission_classes = [HasPermissionKey]
    required_permission = PermissionKey.EXPORT_DATA

    def get(self, _request: Request):
        rows = [
            {
                "id": item.id,
                "full_name": item.full_name,
                "phone": item.phone,
                "email": item.email,
                "project_type": item.project_type,
                "status": item.status,
                "priority": item.priority,
                "created_at": item.created_at,
            }
            for item in models.QuoteRequest.objects.filter(is_deleted=False).order_by("-created_at")
        ]
        return _csv_response("quote_requests.csv", rows)


class ExportContactMessagesView(APIView):
    permission_classes = [HasPermissionKey]
    required_permission = PermissionKey.EXPORT_DATA

    def get(self, _request: Request):
        rows = [
            {
                "id": item.id,
                "full_name": item.full_name,
                "phone": item.phone,
                "email": item.email,
                "subject": item.subject,
                "status": item.status,
                "created_at": item.created_at,
            }
            for item in models.ContactMessage.objects.filter(is_deleted=False).order_by("-created_at")
        ]
        return _csv_response("contact_messages.csv", rows)