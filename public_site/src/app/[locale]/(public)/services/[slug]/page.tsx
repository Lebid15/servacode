import type { Metadata } from "next";

/**
 * =====================================================
 * صفحة تفاصيل الخدمة
 * تصميم احترافي لخدمة برمجية مع دعم الخدمات الافتراضية.
 * =====================================================
 */

import { notFound } from "next/navigation";

import { getPublicService } from "@/shared/api/public-client";
import { AppButton } from "@/shared/design-system/components/AppButton";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppIcon } from "@/shared/design-system/components/AppIcon";
import { ContentBlockCard } from "@/shared/public/components/ContentBlockCard";
import { DetailCTA } from "@/shared/public/components/DetailCTA";
import { DetailFeatureCard } from "@/shared/public/components/DetailFeatureCard";
import { DynamicDetailHero } from "@/shared/public/components/DynamicDetailHero";
import { PublicSection } from "@/shared/public/components/PublicSection";
import { getDictionary } from "@/shared/design-system/i18n/get-dictionary";
import { pickLocalized } from "@/shared/public/public-utils";
import type { Locale } from "@/shared/design-system/utils/direction";
import { buildLocalizedMetadata } from "@/shared/seo/metadata";
import { JsonLd } from "@/shared/seo/json-ld";
import { serviceJsonLd } from "@/shared/seo/structured-data";
import { getFallbackServiceBySlug, normalizeServiceIcon } from "@/shared/public/service-utils";
import { isDemoContentEnabled } from "@/shared/public/demo-content";
import Link from "next/link";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = rawLocale as Locale;
  const item = await getPublicService(slug).catch(() => null);
  const fallback = item || !isDemoContentEnabled() ? null : getFallbackServiceBySlug(locale, slug);

  if (!item && !fallback) {
    return buildLocalizedMetadata(locale, {
      title: slug,
      description: slug,
      path: `/${locale}/services/${slug}`
    });
  }

  return buildLocalizedMetadata(locale, {
    title: item ? pickLocalized(locale, item.title_ar, item.title_en) : fallback?.title ?? slug,
    description: item ? pickLocalized(locale, item.description_ar, item.description_en) : fallback?.description ?? slug,
    path: `/${locale}/services/${slug}`
  });
}

export default async function ServiceDetailsPage({ params }: PageProps) {
  const { locale: rawLocale, slug } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const service = await getPublicService(slug).catch(() => null);
  const fallback = service || !isDemoContentEnabled() ? null : getFallbackServiceBySlug(locale, slug);

  if (!service && !fallback) {
    notFound();
  }

  const title = service ? pickLocalized(locale, service.title_ar, service.title_en) : fallback!.title;
  const shortDescription = service ? pickLocalized(locale, service.description_ar, service.description_en) : fallback!.description;
  const description = service
    ? pickLocalized(locale, service.full_description_ar || service.description_ar, service.full_description_en || service.description_en)
    : fallback!.fullDescription;
  const features = service
    ? (service.features ?? []).map((feature) => ({
        id: feature.id,
        title: pickLocalized(locale, feature.title_ar, feature.title_en),
        description: pickLocalized(locale, feature.description_ar, feature.description_en),
      }))
    : fallback!.features.map((feature, index) => ({
        id: `${fallback!.id}-${index}`,
        title: feature.title,
        description: feature.description,
      }));
  const icon = service ? normalizeServiceIcon(service.icon) : fallback!.icon;

  const deliverySteps = [
    dict.publicServicesPage.detailSteps.discovery,
    dict.publicServicesPage.detailSteps.scope,
    dict.publicServicesPage.detailSteps.build,
    dict.publicServicesPage.detailSteps.launch,
  ];

  return (
    <main>
      <JsonLd data={serviceJsonLd(locale, title, shortDescription, `/${locale}/services/${slug}`)} />

      <DynamicDetailHero
        locale={locale}
        eyebrow={dict.publicDynamic.service.eyebrow}
        title={title}
        description={description}
        icon={icon}
        primaryCta={dict.publicDynamic.common.primaryCta}
        secondaryCta={dict.publicDynamic.common.secondaryCta}
      />

      <PublicSection
        eyebrow={dict.publicDynamic.service.detailsEyebrow}
        title={dict.publicDynamic.service.detailsTitle}
        description={dict.publicDynamic.service.detailsDescription}
      >
        <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
          <ContentBlockCard
            icon="sparkles"
            title={dict.publicDynamic.service.overviewTitle}
            content={description}
          />

          <div className="grid gap-5 md:grid-cols-2">
            {(features.length > 0 ? features : dict.publicDynamic.service.defaultFeatures).map((feature) => (
              <DetailFeatureCard
                key={feature.id ?? feature.title}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </PublicSection>

      <PublicSection
        eyebrow={dict.publicServicesPage.detailSteps.eyebrow}
        title={dict.publicServicesPage.detailSteps.title}
        description={dict.publicServicesPage.detailSteps.description}
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {deliverySteps.map((step, index) => (
            <AppCard key={step.title} className="p-6">
              <span className="grid h-11 w-11 place-items-center rounded-full border border-app-border bg-app-surfaceElevated text-sm font-black text-app-primary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-5 text-lg font-black">{step.title}</h3>
              <p className="mt-3 text-sm font-semibold leading-7 text-app-muted">{step.description}</p>
            </AppCard>
          ))}
        </div>
      </PublicSection>

      <PublicSection>
        <DetailCTA
          locale={locale}
          title={dict.publicDynamic.service.ctaTitle}
          description={dict.publicDynamic.service.ctaDescription}
          button={dict.publicDynamic.common.primaryCta}
        />
        <div className="mt-5 flex justify-center">
          <Link href={`/${locale}/services`}>
            <AppButton variant="secondary">
              <AppIcon name="arrowUpRight" size={16} />
              {dict.publicServicesPage.backToServices}
            </AppButton>
          </Link>
        </div>
      </PublicSection>
    </main>
  );
}
