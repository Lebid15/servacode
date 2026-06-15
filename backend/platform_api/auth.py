from __future__ import annotations

from datetime import timedelta
from typing import Any

from django.conf import settings
from django.utils import timezone
from jose import JWTError, jwt
from passlib.context import CryptContext
from rest_framework import authentication, exceptions

from platform_api.models import User, UserStatus

password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return password_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_context.verify(plain_password, hashed_password)


def create_token(subject: str, token_type: str, expires_delta: timedelta, extra_claims: dict[str, Any] | None = None) -> str:
    payload: dict[str, Any] = {
        "sub": str(subject),
        "exp": timezone.now() + expires_delta,
        "type": token_type,
    }
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str, expected_type: str | None = None) -> dict[str, Any] | None:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None
    if expected_type and payload.get("type") != expected_type:
        return None
    return payload


def build_tokens(user: User, remember_me: bool = False) -> dict[str, str]:
    role = user.role_id
    permissions = role.permissions if role else []
    access_expires = timedelta(hours=12) if remember_me else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_expires = timedelta(days=30) if remember_me else timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    access_token = create_token(
        str(user.id),
        "access",
        access_expires,
        {
            "username": user.username,
            "role": role.name if role else None,
            "permissions": permissions,
            "is_superuser": user.is_superuser,
        },
    )
    refresh_token = create_token(str(user.id), "refresh", refresh_expires)
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer", "remember_me": remember_me}


class BearerJWTAuthentication(authentication.BaseAuthentication):
    keyword = "Bearer"

    def authenticate(self, request):
        auth_header = authentication.get_authorization_header(request).decode("utf-8")
        if not auth_header:
            return None

        parts = auth_header.split(" ", 1)
        if len(parts) != 2 or parts[0].lower() != self.keyword.lower():
            raise exceptions.AuthenticationFailed("صيغة رمز الدخول غير صحيحة.")

        payload = decode_token(parts[1].strip(), expected_type="access")
        if not payload or not payload.get("sub"):
            raise exceptions.AuthenticationFailed("جلسة الدخول غير صالحة أو منتهية.")

        try:
            user = User.objects.select_related("role_id").get(id=payload["sub"], is_deleted=False)
        except User.DoesNotExist as exc:
            raise exceptions.AuthenticationFailed("المستخدم غير موجود.") from exc

        if user.status != UserStatus.ACTIVE:
            raise exceptions.AuthenticationFailed("هذا الحساب غير نشط.")

        return user, payload