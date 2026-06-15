"""URL configuration for the Django backend."""

from __future__ import annotations

from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path

from platform_api.views import root

urlpatterns = [
    path("", root, name="root"),
    path(f"{settings.API_V1_PREFIX}/", include("platform_api.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)