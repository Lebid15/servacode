"""
تقرير جاهزية محلي للمشروع قبل الإغلاق النهائي أو النشر لاحقًا.

الاستخدام:
    python scripts/site_readiness_report.py
أو:
    python manage.py site_readiness_report
"""

# ruff: noqa: E402, I001
from __future__ import annotations

import os
import sys
from pathlib import Path
from typing import Any

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django

django.setup()

from platform_api import models


def add_issue(issues: list[dict[str, str]], code: str, tone: str, message: str) -> None:
    issues.append({"code": code, "tone": tone, "message": message})


def build_site_readiness_report() -> dict[str, Any]:
    settings_obj = models.SiteSettings.objects.order_by("created_at").first()
    services = models.Service.objects.filter(is_deleted=False, is_active=True).count()
    systems = models.Product.objects.filter(is_deleted=False, is_active=True).exclude(status=models.ProductStatus.HIDDEN).count()
    apps = models.SoftwareApp.objects.filter(is_deleted=False, is_active=True).exclude(status=models.AppStatus.HIDDEN).count()
    portfolio = models.PortfolioProject.objects.filter(is_deleted=False, is_active=True).count()
    faqs = models.Faq.objects.filter(is_deleted=False, is_active=True).count()
    static_pages = models.StaticPage.objects.filter(is_deleted=False, is_active=True).count()
    blog_posts = models.BlogPost.objects.filter(is_deleted=False, status=models.PublishStatus.PUBLISHED).count()
    templates = models.EmailTemplate.objects.filter(is_active=True).count()
    roles = models.Role.objects.count()
    users = models.User.objects.filter(is_deleted=False).count()

    issues: list[dict[str, str]] = []
    score = 100

    def require(condition: bool, points: int, code: str, message: str, tone: str = "warning") -> None:
        nonlocal score
        if not condition:
            score -= points
            add_issue(issues, code, tone, message)

    require(settings_obj is not None, 12, "missing_settings", "إعدادات الموقع غير موجودة.", "danger")
    require(bool(settings_obj and settings_obj.logo_url), 6, "missing_logo", "الشعار غير مرفوع من الإعدادات.")
    require(bool(settings_obj and (settings_obj.phone or settings_obj.email or settings_obj.whatsapp)), 5, "missing_contact", "قنوات التواصل غير مكتملة.")
    require(services >= 12, 10, "services_low", "قائمة الخدمات تحتاج تشغيل seed الخدمات أو مراجعتها.", "danger")
    require(systems >= 6, 10, "systems_low", "قائمة الأنظمة تحتاج تشغيل seed المحتوى التأسيسي.", "danger")
    require(faqs >= 6, 5, "faqs_low", "الأسئلة الشائعة قليلة أو غير مفعلة.")
    require(static_pages >= 4, 6, "static_pages_low", "الصفحات الثابتة الأساسية غير مكتملة.")
    require(blog_posts >= 3, 4, "blog_low", "المقالات التأسيسية غير مكتملة.")
    require(templates >= 3, 5, "email_templates_low", "قوالب البريد غير مجهزة.")
    require(roles >= 3, 5, "roles_low", "الأدوار الأساسية غير مكتملة.")
    require(users >= 1, 8, "missing_admin_user", "لا يوجد مستخدم إدارة نشط.", "danger")

    if apps == 0:
        add_issue(issues, "apps_manual", "info", "تطبيقاتنا تُضاف يدويًا عند توفر ملفات أو روابط تحميل حقيقية.")
    if portfolio == 0:
        add_issue(issues, "portfolio_manual", "info", "الأعمال الحقيقية تُضاف يدويًا عند توفر نماذج حقيقية.")

    return {
        "score": max(score, 0),
        "metrics": {
            "settings": int(settings_obj is not None),
            "services": services,
            "systems": systems,
            "apps": apps,
            "portfolio": portfolio,
            "faqs": faqs,
            "static_pages": static_pages,
            "blog_posts": blog_posts,
            "email_templates": templates,
            "roles": roles,
            "users": users,
        },
        "issues": issues,
    }


def main() -> None:
    report = build_site_readiness_report()
    print("تقرير جاهزية المشروع")
    print("====================")
    print(f"التقييم التقريبي: {report['score']} / 100")
    print("\nالمؤشرات:")
    for key, value in report["metrics"].items():
        print(f"- {key}: {value}")
    if report["issues"]:
        print("\nالملاحظات:")
        for issue in report["issues"]:
            print(f"- [{issue['tone']}] {issue['message']}")
    else:
        print("\nلا توجد ملاحظات حرجة.")


if __name__ == "__main__":
    main()
