# Separated Deployment

## Domains

```text
PUBLIC_DOMAIN=example.com
ADMIN_DOMAIN=admin.example.com
API_DOMAIN=api.example.com
```

## Required DNS

```text
A example.com        -> SERVER_IP
A www.example.com    -> SERVER_IP
A admin.example.com  -> SERVER_IP
A api.example.com    -> SERVER_IP
```

## Local services

```text
backend      -> 127.0.0.1:8000
public_site  -> 127.0.0.1:3000
admin_panel  -> 127.0.0.1:3001
postgres     -> managed locally or externally through DATABASE_URL
nginx        -> reverse proxy on 80/443
```

## Nginx routing

```text
example.com        -> 127.0.0.1:3000
admin.example.com  -> 127.0.0.1:3001
api.example.com    -> 127.0.0.1:8000
```

## Local testing with hosts file

يمكن تجربة الفصل محليًا بتعديل ملف hosts في Windows:

```text
127.0.0.1 example.com
127.0.0.1 admin.example.com
127.0.0.1 api.example.com
```

ثم شغّل الخدمات محليًا وافتح:

```text
http://example.com
http://admin.example.com/ar/admin/login
http://api.example.com/api/v1/health
```
