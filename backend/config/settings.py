"""Central Django settings for the company platform backend."""

from __future__ import annotations

import os
from pathlib import Path

import dj_database_url
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


def env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def env_list(name: str, default: str = "") -> list[str]:
    raw = os.getenv(name, default)
    return [item.strip() for item in raw.split(",") if item.strip()]


APP_NAME = os.getenv("APP_NAME", "ServaCode API")
APP_ENV = os.getenv("APP_ENV", "development")
DEBUG = env_bool("DEBUG", APP_ENV != "production")
API_V1_PREFIX = os.getenv("API_V1_PREFIX", "/api/v1").strip("/")

SECRET_KEY = os.getenv("SECRET_KEY", "change-this-secret-key-in-production")
if APP_ENV == "production":
    if DEBUG:
        raise RuntimeError("DEBUG must be false in production.")
    if SECRET_KEY == "change-this-secret-key-in-production" or len(SECRET_KEY) < 40:
        raise RuntimeError("SECRET_KEY must be changed to a strong value in production.")

ALLOWED_HOSTS = env_list("ALLOWED_HOSTS", "localhost,127.0.0.1,testserver,backend")
CSRF_TRUSTED_ORIGINS = env_list("CSRF_TRUSTED_ORIGINS", "")

INSTALLED_APPS = [
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "platform_api",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    }
]

WSGI_APPLICATION = "config.wsgi.application"

database_url = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'db.sqlite3'}")
database_url = database_url.replace("postgresql+psycopg://", "postgresql://", 1)
DATABASES = {"default": dj_database_url.parse(database_url, conn_max_age=60)}

LANGUAGE_CODE = "ar"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

MEDIA_URL = "/uploads/"
MEDIA_ROOT = Path(os.getenv("UPLOAD_DIR", BASE_DIR / "uploads"))

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
AUTH_USER_MODEL = "platform_api.User"

CORS_ALLOWED_ORIGINS = env_list(
    "BACKEND_CORS_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001",
)
CORS_ALLOW_CREDENTIALS = True

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": ["platform_api.auth.BearerJWTAuthentication"],
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticated"],
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "DEFAULT_THROTTLE_CLASSES": ["rest_framework.throttling.ScopedRateThrottle"],
    "DEFAULT_THROTTLE_RATES": {
        "login": os.getenv("RATE_LIMIT_LOGIN", "5/minute"),
        "public_forms": os.getenv("RATE_LIMIT_PUBLIC_FORM", "5/minute"),
        "analytics": "120/minute",
    },
    "EXCEPTION_HANDLER": "platform_api.exceptions.api_exception_handler",
    "UNAUTHENTICATED_USER": None,
}

SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
SECURE_REFERRER_POLICY = "same-origin"
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = False
SESSION_COOKIE_SECURE = APP_ENV == "production"
CSRF_COOKIE_SECURE = APP_ENV == "production"
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
ALGORITHM = os.getenv("ALGORITHM", "HS256")
LOGIN_MAX_FAILED_ATTEMPTS = int(os.getenv("LOGIN_MAX_FAILED_ATTEMPTS", "5"))
LOGIN_LOCKOUT_MINUTES = int(os.getenv("LOGIN_LOCKOUT_MINUTES", "15"))
MAX_UPLOAD_SIZE_MB = int(os.getenv("MAX_UPLOAD_SIZE_MB", "10"))
ENABLE_EMAIL_NOTIFICATIONS = env_bool("ENABLE_EMAIL_NOTIFICATIONS", False)
SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL")
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "ServaCode")
SMTP_USE_TLS = env_bool("SMTP_USE_TLS", True)
SMTP_TIMEOUT_SECONDS = int(os.getenv("SMTP_TIMEOUT_SECONDS", "10"))
ADMIN_NOTIFICATION_EMAIL = os.getenv("ADMIN_NOTIFICATION_EMAIL")

AUTO_TRANSLATION_ENABLED = env_bool("AUTO_TRANSLATION_ENABLED", True)
AUTO_TRANSLATION_PROVIDER = os.getenv("AUTO_TRANSLATION_PROVIDER", "mymemory")
TRANSLATION_API_URL = os.getenv("TRANSLATION_API_URL")
TRANSLATION_API_KEY = os.getenv("TRANSLATION_API_KEY")

AI_ASSISTANT_ENABLED = env_bool("AI_ASSISTANT_ENABLED", True)
AI_PROVIDER = os.getenv("AI_PROVIDER", "openai_compatible")
AI_API_KEY = os.getenv("AI_API_KEY")
AI_BASE_URL = os.getenv("AI_BASE_URL", "https://api.openai.com/v1")
AI_TEXT_MODEL = os.getenv("AI_TEXT_MODEL", "gpt-4o-mini")
AI_IMAGE_MODEL = os.getenv("AI_IMAGE_MODEL", "gpt-image-1")
AI_TIMEOUT_SECONDS = int(os.getenv("AI_TIMEOUT_SECONDS", "45"))
AI_AUTO_TRANSLATE = env_bool("AI_AUTO_TRANSLATE", True)
AI_AUTO_FILL_SEO = env_bool("AI_AUTO_FILL_SEO", True)
AI_HIDE_ENGLISH_FIELDS = env_bool("AI_HIDE_ENGLISH_FIELDS", True)
TRANSLATION_TIMEOUT_SECONDS = int(os.getenv("TRANSLATION_TIMEOUT_SECONDS", "20"))