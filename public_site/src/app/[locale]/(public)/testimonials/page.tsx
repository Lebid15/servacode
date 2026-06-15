import type { Metadata } from "next";

/**
 * =====================================================
 * صفحة آراء العملاء
 * تعرض آراء العملاء المنشورة من لوحة التحكم.
 * =====================================================
 */

import Link from "next/link";

import { getPublicSettings, getPublicTestimonials } from "@/shared/api/public-client";
import { AppButton } from "@/shared/design-system/components/AppButton";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppEmptyState } from "@/shared/design-system/components/AppEmptyState";
import { AppIcon } from "@/shared/design-system/components/AppIcon";
import { getDictionary } from "@/shared/design-system/i18n/get-dictionary";
import type { Locale } from "@/shared/design-system/utils/direction";
import { pickLocalized } from "@/shared/public/public-utils";
import { getPublicBrandName } from "@/shared/public/settings-utils";
import { buildLocalizedMetadata } from "@/shared/seo/metadata";

import { PublicTestimonialForm } from "./PublicTestimonialForm";

export const dynamic = "force-dynamic";

type TestimonialsPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export async function generateMetadata({ params }: TestimonialsPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const [dict, settings] = await Promise.all([getDictionary(locale), getPublicSettings().catch(() => null)]);

  return buildLocalizedMetadata(locale, {
    title: locale === "ar" ? "آراء العملاء" : "Testimonials",
    description:
      locale === "ar"
        ? "آراء العملاء حول خدمات سيرفا كود في تطوير المواقع والأنظمة والتطبيقات."
        : "Customer testimonials about ServaCode websites, systems, apps, and software services.",
    path: `/${locale}/testimonials`,
    siteName: getPublicBrandName(settings, locale, dict.admin.brand),
    faviconUrl: settings?.favicon_url
  });
}

function ratingStars(value: unknown) {
  const rating = Math.max(1, Math.min(5, Number(value) || 5));
  return Array.from({ length: rating });
}

export default async function TestimonialsPage({ params }: TestimonialsPageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const testimonials = await getPublicTestimonials().catch(() => []);
  const isAr = locale === "ar";

  return (
    <main className="app-container grid gap-10 py-12">
      <section className="release-surface relative overflow-hidden rounded-app2Xl p-7 sm:p-10">
        <div className="pointer-events-none absolute -top-24 end-10 size-64 rounded-full bg-app-primary/15 blur-3xl" />
        <div className="relative grid gap-4">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-app-border bg-app-surfaceElevated px-3 py-1 text-xs font-black text-app-primary">
            <AppIcon name="testimonials" size={15} />
            {isAr ? "ثقة وتجارب" : "Trust & feedback"}
          </span>
          <div className="max-w-3xl">
            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
              {isAr ? "آراء العملاء" : "Customer Testimonials"}
            </h1>
            <p className="mt-4 text-base leading-8 text-app-muted sm:text-lg">
              {isAr
                ? "هنا تظهر آراء العملاء التي تضيفها وتديرها من لوحة التحكم. يمكن إظهار أو إخفاء كل رأي حسب الحاجة."
                : "This page displays customer feedback managed from the admin panel. Each testimonial can be shown or hidden as needed."}
            </p>
          </div>
        </div>
      </section>

      <PublicTestimonialForm locale={locale} />

      {testimonials.length > 0 ? (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {testimonials.map((item) => (
            <AppCard key={item.id} className="relative overflow-hidden p-6">
              <div className="pointer-events-none absolute -top-20 end-6 size-36 rounded-full bg-app-primary/10 blur-3xl" />
              <div className="relative grid gap-5">
                <div className="flex items-center gap-1 text-app-primary" aria-label={`${item.rating}/5`}>
                  {ratingStars(item.rating).map((_, index) => (
                    <AppIcon key={index} name="star" size={16} />
                  ))}
                </div>

                <p className="min-h-28 leading-8 text-app-muted">
                  “{pickLocalized(locale, item.text_ar, item.text_en)}”
                </p>

                <div className="flex items-center gap-3 border-t border-app-border pt-5">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.client_name}
                      className="size-12 rounded-full border border-app-border object-cover"
                    />
                  ) : (
                    <span className="grid size-12 place-items-center rounded-full border border-app-border bg-app-surfaceElevated text-sm font-black text-app-primary">
                      {item.client_name?.trim()?.slice(0, 1) || "S"}
                    </span>
                  )}
                  <div className="min-w-0">
                    <strong className="block truncate text-app-foreground">{item.client_name}</strong>
                    {item.position || item.company_name ? (
                      <span className="block truncate text-xs font-bold text-app-muted">
                        {[item.position, item.company_name].filter(Boolean).join(" — ")}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </AppCard>
          ))}
        </section>
      ) : (
        <AppCard className="p-8">
          <AppEmptyState
            icon="testimonials"
            title={isAr ? "لا توجد آراء منشورة بعد" : "No published testimonials yet"}
            description={
              isAr
                ? "أضف آراء العملاء من لوحة التحكم ثم فعّلها لتظهر هنا وفي الصفحة الرئيسية."
                : "Add customer testimonials from the admin panel and activate them to show them here and on the homepage."
            }
            action={
              <Link href={`/${locale}/contact`}>
                <AppButton>{isAr ? "تواصل معنا" : "Contact us"}</AppButton>
              </Link>
            }
          />
        </AppCard>
      )}
    </main>
  );
}
