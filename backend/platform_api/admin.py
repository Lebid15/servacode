from __future__ import annotations

from django.contrib import admin

from platform_api import models

for model in [
    models.Role,
    models.User,
    models.SiteSettings,
    models.Service,
    models.ServiceFeature,
    models.Product,
    models.ProductFeature,
    models.ProductImage,
    models.ProductFaq,
    models.SoftwareApp,
    models.PortfolioProject,
    models.BlogCategory,
    models.BlogPost,
    models.Faq,
    models.Testimonial,
    models.StaticPage,
    models.QuoteRequest,
    models.QuoteRequestNote,
    models.ContactMessage,
    models.SupportRequest,
    models.MediaFile,
    models.AdminNotification,
    models.AuditLog,
    models.AnalyticsEvent,
    models.EmailTemplate,
]:
    admin.site.register(model)