import type { Metadata } from "next";

/**
 * =====================================================
 * صفحة services
 * تصميم قائمة احترافي مع حالة محتوى غير منشور عند عدم وجود عناصر.
 * =====================================================
 */

import { getPublicServices, getPublicSettings } from "@/shared/api/public-client";
import { AppIcon } from "@/shared/design-system/components/AppIcon";
import { AppPageHeader } from "@/shared/design-system/components/AppPageHeader";
import { getDictionary } from "@/shared/design-system/i18n/get-dictionary";
import { buildLocalizedMetadata } from "@/shared/seo/metadata";
import { PublicUnavailable } from "@/shared/public/components/PublicUnavailable";
import { PublicServiceCard } from "@/shared/public/components/PublicServiceCard";
import { PublicSection } from "@/shared/public/components/PublicSection";
import type { Locale } from "@/shared/design-system/utils/direction";
import { isPublicSectionVisible } from "@/shared/public/settings-utils";
import { getFallbackServiceCards, publicServiceToCardView } from "@/shared/public/service-utils";
import { isDemoContentEnabled } from "@/shared/public/demo-content";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);

  return buildLocalizedMetadata(locale, {
    title: dict.public.services.title,
    description: dict.public.services.description,
    path: `/${locale}/services`
  });
}

export default async function ServicesPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const [settings, services] = await Promise.all([getPublicSettings().catch(() => null), getPublicServices().catch(() => [])]);

  if (!isPublicSectionVisible(settings, "services")) {
    return (
      <main>
        <PublicUnavailable
          locale={locale}
          badge={dict.public.unavailable.badge}
          title={dict.public.services.title}
          description={dict.public.unavailable.description}
          homeLabel={dict.public.unavailable.homeCta}
          quoteLabel={dict.public.unavailable.quoteCta}
        />
      </main>
    );
  }

  const serviceCards = services.length > 0
    ? services.map((service) => publicServiceToCardView(locale, service))
    : isDemoContentEnabled()
      ? getFallbackServiceCards(locale)
      : [];

  if (serviceCards.length === 0) {
    return (
      <main>
        <PublicUnavailable
          locale={locale}
          badge={dict.public.unavailable.badge}
          title={dict.public.services.title}
          description={dict.public.unavailable.description}
          homeLabel={dict.public.unavailable.homeCta}
          quoteLabel={dict.public.unavailable.quoteCta}
        />
      </main>
    );
  }

  const approachCards = [
    { icon: "message" as const, ...dict.publicServicesPage.approach.discovery },
    { icon: "layers" as const, ...dict.publicServicesPage.approach.planning },
    { icon: "code" as const, ...dict.publicServicesPage.approach.delivery },
    { icon: "support" as const, ...dict.publicServicesPage.approach.support },
  ];

  return (
    <main>
      <PublicSection className="relative overflow-hidden">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_0.1fr]">
          <AppPageHeader title={dict.public.services.title} description={dict.public.services.description} />
          <div className="hidden place-items-center lg:grid">
            <span className="grid h-20 w-20 place-items-center rounded-app2Xl border border-app-border bg-app-surfaceElevated shadow-appGlow">
              <AppIcon name="server" className="text-app-primary" size={32} />
            </span>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {serviceCards.map((service) => (
            <PublicServiceCard
              key={service.id}
              service={service}
              detailsLabel={dict.public.services.detailsCta}
              quoteLabel={dict.publicServicesPage.quoteCta}
              featuresLabel={dict.publicServicesPage.featuresLabel}
              quoteHref={`/${locale}/quote-request`}
            />
          ))}
        </div>
      </PublicSection>

      <PublicSection
        eyebrow={dict.publicServicesPage.approach.eyebrow}
        title={dict.publicServicesPage.approach.title}
        description={dict.publicServicesPage.approach.description}
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {approachCards.map((card) => (
            <div key={card.title} className="rounded-app2Xl border border-app-border bg-app-surface/80 p-6 shadow-appSoft">
              <span className="mb-5 grid h-12 w-12 place-items-center rounded-appLg border border-app-border bg-app-surfaceElevated text-app-primary">
                <AppIcon name={card.icon} size={22} />
              </span>
              <h3 className="text-lg font-black">{card.title}</h3>
              <p className="mt-3 text-sm font-semibold leading-7 text-app-muted">{card.description}</p>
            </div>
          ))}
        </div>
      </PublicSection>
    </main>
  );
}
