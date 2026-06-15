# Public Customer Testimonial Submission Flow

This hotfix changes testimonials from admin-only content into a real customer submission flow.

## What changed

### Public website

Customers can now submit their own testimonial from:

- `/ar/testimonials`
- `/en/testimonials`

The form includes:

- Customer name
- Company or organization
- Position
- Rating 1–5
- Testimonial text
- Anti-spam honeypot field

### Backend

Added a new public endpoint:

```text
POST /api/v1/public/testimonials/submit
```

Submitted testimonials are saved as:

```text
is_active = false
```

So they do **not** appear publicly until approved from the admin panel.

### Admin flow

The admin receives an internal notification:

```text
رأي عميل جديد بانتظار المراجعة
```

Then the admin can review it from:

```text
لوحة التحكم → إدارة المحتوى → آراء العملاء
```

and publish it by activating it.

## Files

- `backend/platform_api/views.py`
- `backend/platform_api/urls.py`
- `public_site/src/shared/api/public-client.ts`
- `public_site/src/shared/design-system/components/AppIcon.tsx`
- `public_site/src/app/[locale]/(public)/testimonials/page.tsx`
- `public_site/src/app/[locale]/(public)/testimonials/PublicTestimonialForm.tsx`
- `public_site/src/app/[locale]/(public)/page.tsx`
