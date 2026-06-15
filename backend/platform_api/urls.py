from __future__ import annotations

from django.urls import path
from rest_framework.routers import SimpleRouter

from platform_api import models, serializers, views

router = SimpleRouter(trailing_slash=False)
router.register("roles", views.RoleViewSet, basename="roles")
router.register("users", views.UserViewSet, basename="users")
router.register("admin/services", views.ServiceViewSet, basename="admin-services")
router.register("admin/products", views.ProductViewSet, basename="admin-products")
router.register("admin/apps", views.SoftwareAppViewSet, basename="admin-apps")
router.register("admin/portfolio", views.PortfolioProjectViewSet, basename="admin-portfolio")
router.register("admin/blog/categories", views.BlogCategoryViewSet, basename="admin-blog-categories")
router.register("admin/blog/posts", views.BlogPostViewSet, basename="admin-blog-posts")
router.register("admin/faqs", views.FaqViewSet, basename="admin-faqs")
router.register("admin/testimonials", views.TestimonialViewSet, basename="admin-testimonials")
router.register("admin/static-pages", views.StaticPageViewSet, basename="admin-static-pages")
router.register("admin/quote-requests", views.QuoteRequestViewSet, basename="admin-quote-requests")
router.register("admin/contact-messages", views.ContactMessageViewSet, basename="admin-contact-messages")
router.register("admin/support-requests", views.SupportRequestViewSet, basename="admin-support-requests")
router.register("admin/media", views.MediaFileViewSet, basename="admin-media")
router.register("admin/notifications", views.NotificationViewSet, basename="admin-notifications")
router.register("admin/audit-logs", views.AuditLogViewSet, basename="admin-audit-logs")
router.register("admin/analytics/events", views.AnalyticsViewSet, basename="admin-analytics-events")
router.register("admin/email-templates", views.EmailTemplateViewSet, basename="admin-email-templates")

urlpatterns = [
    path("health", views.HealthView.as_view(), name="health"),
    path("health/live", views.LiveView.as_view(), name="health-live"),
    path("health/ready", views.ReadyView.as_view(), name="health-ready"),
    path("auth/login", views.LoginView.as_view(), name="auth-login"),
    path("auth/forgot-password", views.ForgotPasswordView.as_view(), name="auth-forgot-password"),
    path("auth/reset-password", views.ResetPasswordView.as_view(), name="auth-reset-password"),
    path("auth/refresh", views.RefreshView.as_view(), name="auth-refresh"),
    path("auth/me", views.MeView.as_view(), name="auth-me"),
    path("auth/logout", views.LogoutView.as_view(), name="auth-logout"),
    path("users/me", views.MeView.as_view(), name="users-me"),
    path("admin/dashboard", views.DashboardView.as_view(), name="admin-dashboard"),
    path("admin/content-overview", views.ContentOverviewView.as_view(), name="admin-content-overview"),
    path("admin/customers-overview", views.CustomersOverviewView.as_view(), name="admin-customers-overview"),
    path("admin/communication-overview", views.CommunicationOverviewView.as_view(), name="admin-communication-overview"),
    path("admin/administration-overview", views.AdministrationOverviewView.as_view(), name="admin-administration-overview"),
    path("admin/settings-overview", views.SettingsOverviewView.as_view(), name="admin-settings-overview"),
    path("admin/settings", views.SettingsView.as_view(), name="admin-settings"),
    path("admin/ai/settings", views.AiSettingsView.as_view(), name="admin-ai-settings"),
    path("admin/ai/test", views.AiSettingsTestView.as_view(), name="admin-ai-test"),
    path("admin/ai/generate", views.AiGenerateView.as_view(), name="admin-ai-generate"),
    path("admin/ai/translate", views.AiTranslateView.as_view(), name="admin-ai-translate"),
    path("admin/ai/generate-image", views.AiGenerateImageView.as_view(), name="admin-ai-generate-image"),
    path("admin/translation/bulk", views.BulkTranslationView.as_view(), name="admin-translation-bulk"),
    path("admin/export/quote-requests", views.ExportQuoteRequestsView.as_view(), name="admin-export-quote-requests"),
    path("admin/export/contact-messages", views.ExportContactMessagesView.as_view(), name="admin-export-contact-messages"),
    path("admin/export/support-requests", views.ExportSupportRequestsView.as_view(), name="admin-export-support-requests"),
    path("admin/analytics/summary", views.AnalyticsSummaryView.as_view(), name="admin-analytics-summary"),
    path("public/settings", views.PublicSettingsView.as_view(), name="public-settings"),
    path("public/services", views.PublicListDetailView.as_view(model=models.Service, serializer_class=serializers.ServiceSerializer), name="public-services"),
    path("public/services/<slug:slug>", views.PublicListDetailView.as_view(model=models.Service, serializer_class=serializers.ServiceSerializer), name="public-service-detail"),
    path("public/products", views.PublicListDetailView.as_view(model=models.Product, serializer_class=serializers.ProductSerializer, hidden_status_value=models.ProductStatus.HIDDEN), name="public-products"),
    path("public/products/<slug:slug>", views.PublicListDetailView.as_view(model=models.Product, serializer_class=serializers.ProductSerializer, hidden_status_value=models.ProductStatus.HIDDEN), name="public-product-detail"),
    path("public/apps", views.PublicListDetailView.as_view(model=models.SoftwareApp, serializer_class=serializers.SoftwareAppSerializer, hidden_status_value=models.AppStatus.HIDDEN), name="public-apps"),
    path("public/apps/<slug:slug>", views.PublicListDetailView.as_view(model=models.SoftwareApp, serializer_class=serializers.SoftwareAppSerializer, hidden_status_value=models.AppStatus.HIDDEN), name="public-app-detail"),
    path("public/portfolio", views.PublicListDetailView.as_view(model=models.PortfolioProject, serializer_class=serializers.PortfolioProjectSerializer), name="public-portfolio"),
    path("public/portfolio/<slug:slug>", views.PublicListDetailView.as_view(model=models.PortfolioProject, serializer_class=serializers.PortfolioProjectSerializer), name="public-portfolio-detail"),
    path("public/blog/categories", views.PublicListDetailView.as_view(model=models.BlogCategory, serializer_class=serializers.BlogCategorySerializer), name="public-blog-categories"),
    path("public/blog", views.PublicListDetailView.as_view(model=models.BlogPost, serializer_class=serializers.BlogPostSerializer, published_only=True), name="public-blog"),
    path("public/blog/<slug:slug>", views.PublicListDetailView.as_view(model=models.BlogPost, serializer_class=serializers.BlogPostSerializer, published_only=True), name="public-blog-detail"),
    path("public/static-pages/<str:identifier>", views.PublicStaticPageView.as_view(), name="public-static-page-detail"),
    path("public/faqs", views.PublicFaqsView.as_view(), name="public-faqs"),
    path("public/testimonials/submit", views.PublicTestimonialSubmitView.as_view(), name="public-testimonials-submit"),
    path("public/testimonials", views.PublicListDetailView.as_view(model=models.Testimonial, serializer_class=serializers.TestimonialSerializer), name="public-testimonials"),
    path("public/analytics/events", views.PublicAnalyticsEventView.as_view(), name="public-analytics-events"),
    path("public/contact", views.PublicCreateView.as_view(serializer_class=serializers.ContactMessageSerializer), name="public-contact"),
    path("public/quote-requests", views.PublicCreateView.as_view(serializer_class=serializers.QuoteRequestSerializer), name="public-quote-requests"),
    path("public/support-requests", views.PublicCreateView.as_view(serializer_class=serializers.SupportRequestSerializer), name="public-support-requests"),
]

urlpatterns += router.urls