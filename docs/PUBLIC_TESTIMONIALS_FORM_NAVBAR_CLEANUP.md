# Public Testimonials Form + Navbar Cleanup

## Changes

### Testimonials form
Removed unnecessary customer fields from the public testimonial form:

- Company / organization
- Position

The form now asks only for:

- Customer name
- Rating
- Testimonial text

### Navbar
- Prevented navigation labels from wrapping into two lines.
- Tightened nav spacing slightly.
- Kept CTA text in one line.
- Extended the brand subtitle width so the short company description appears more clearly.

## Files

- `public_site/src/app/[locale]/(public)/testimonials/PublicTestimonialForm.tsx`
- `public_site/src/shared/public/components/PublicNavbar.tsx`
- `public_site/src/shared/design-system/components/AppLogo.tsx`
