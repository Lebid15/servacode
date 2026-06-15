# Production Deployment

هذا المجلد يحتوي توثيق النشر الإنتاجي بدون حاويات.

```text
nginx/
scripts/
README.md
DEPLOYMENT_COMMANDS.md
SERVER_SETUP.md
PRODUCTION_CHECKLIST.md
SECURITY_CHECKLIST.md
BACKUP_RESTORE.md
```

## التشغيل السريع

```bash
cp .env.production.example .env.production
python deployment/scripts/generate_secret.py
```

ضع السر الناتج في `SECRET_KEY` داخل `.env.production`، ثم اتبع [DEPLOYMENT_COMMANDS.md](DEPLOYMENT_COMMANDS.md).
