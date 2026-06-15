# Phase 5.1 — SlowAPI Login Fix

## Problem
After Phase 5, `POST /api/v1/auth/login` returned HTTP 500 with:

```text
Exception: parameter `response` must be an instance of starlette.responses.Response
```

This happened because SlowAPI was configured with `headers_enabled=True`. When response headers are enabled, route functions protected by `@limiter.limit(...)` must accept a `Response` parameter so SlowAPI can inject rate-limit headers.

## Fixed files

- `backend/app/api/v1/endpoints/auth.py`
- `backend/app/api/v1/endpoints/public.py`

## Fix
Added `Response` to the limited endpoints:

- `/api/v1/auth/login`
- `/api/v1/public/contact`
- `/api/v1/public/quote-requests`

## Validation

- `python -m compileall app` passed.

