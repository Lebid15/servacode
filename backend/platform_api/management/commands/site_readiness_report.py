from __future__ import annotations

from django.core.management.base import BaseCommand

from scripts.site_readiness_report import build_site_readiness_report


class Command(BaseCommand):
    help = "Print a local readiness report for the platform before final delivery or deployment."

    def handle(self, *args, **options):
        report = build_site_readiness_report()
        self.stdout.write(self.style.SUCCESS("تقرير جاهزية المشروع"))
        self.stdout.write("====================")
        self.stdout.write(f"التقييم التقريبي: {report['score']} / 100")
        self.stdout.write("\nالمؤشرات:")
        for key, value in report["metrics"].items():
            self.stdout.write(f"- {key}: {value}")
        if report["issues"]:
            self.stdout.write("\nالملاحظات:")
            for issue in report["issues"]:
                self.stdout.write(f"- [{issue['tone']}] {issue['message']}")
        else:
            self.stdout.write("\nلا توجد ملاحظات حرجة.")
