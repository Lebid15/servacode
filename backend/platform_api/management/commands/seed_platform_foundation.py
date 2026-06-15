from __future__ import annotations

from django.core.management.base import BaseCommand

from scripts.seed_platform_foundation import seed_platform_foundation


class Command(BaseCommand):
    help = "Seed foundational ServaCode website content: settings, services, systems, FAQs, static pages, blog, roles, and templates."

    def handle(self, *args, **options):
        result = seed_platform_foundation()
        self.stdout.write(self.style.SUCCESS("تم تجهيز المحتوى التأسيسي للمنصة بنجاح."))
        for key, value in result.items():
            self.stdout.write(f"- {key}: {value}")
        self.stdout.write("ملاحظة: تطبيقاتنا وأعمالنا الحقيقية تبقى إدخالًا يدويًا من لوحة التحكم.")
