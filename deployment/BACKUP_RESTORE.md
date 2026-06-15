# Backup & Restore

## Backup

```bash
mkdir -p deployment/backups
pg_dump "$DATABASE_URL" | gzip > deployment/backups/company_platform_$(date +%Y%m%d_%H%M%S).sql.gz
```

## Restore

```bash
gunzip -c deployment/backups/company_platform_YYYYMMDD_HHMMSS.sql.gz | psql "$DATABASE_URL"
```

## ملاحظات مهمة

- اختبر الاستعادة على بيئة staging قبل الإنتاج.
- احتفظ بنسخ خارج السيرفر.
- جدولة النسخ الاحتياطي اليومية مسؤولية نظام التشغيل أو خدمة قاعدة البيانات المستضافة.
