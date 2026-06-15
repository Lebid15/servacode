from __future__ import annotations

from rest_framework.permissions import BasePermission


class PermissionKey:
    MANAGE_DASHBOARD = "manage_dashboard"
    MANAGE_SERVICES = "manage_services"
    MANAGE_PRODUCTS = "manage_products"
    MANAGE_APPS = "manage_apps"
    MANAGE_PORTFOLIO = "manage_portfolio"
    MANAGE_QUOTES = "manage_quotes"
    MANAGE_CONTACT_MESSAGES = "manage_contact_messages"
    MANAGE_SUPPORT_REQUESTS = "manage_support_requests"
    MANAGE_BLOG = "manage_blog"
    MANAGE_STATIC_PAGES = "manage_static_pages"
    MANAGE_TESTIMONIALS = "manage_testimonials"
    MANAGE_FAQ = "manage_faq"
    MANAGE_MEDIA = "manage_media"
    MANAGE_SETTINGS = "manage_settings"
    MANAGE_USERS = "manage_users"
    VIEW_NOTIFICATIONS = "view_notifications"
    VIEW_AUDIT_LOGS = "view_audit_logs"
    VIEW_ANALYTICS = "view_analytics"
    EXPORT_DATA = "export_data"


PERMISSION_CATALOG = [value for key, value in PermissionKey.__dict__.items() if key.isupper()]


class HasPermissionKey(BasePermission):
    required_permission: str | None = None

    def has_permission(self, request, view) -> bool:
        required = getattr(view, "required_permission", self.required_permission)
        if not required:
            return bool(request.user and request.user.is_authenticated)
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_superuser:
            return True
        role = getattr(user, "role_id", None)
        return bool(role and required in (role.permissions or []))