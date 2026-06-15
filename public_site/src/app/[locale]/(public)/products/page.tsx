import type { Metadata } from "next";

import { getPublicProducts, getPublicSettings } from "@/shared/api/public-client";
import { getDictionary } from "@/shared/design-system/i18n/get-dictionary";
import type { Locale } from "@/shared/design-system/utils/direction";
import { PublicUnavailable } from "@/shared/public/components/PublicUnavailable";
import { PublicSection } from "@/shared/public/components/PublicSection";
import { PublicPageHero } from "@/shared/public/components/PublicPageHero";
import { PublicShowcaseCard } from "@/shared/public/components/PublicShowcaseCard";
import { PublicHighlightGrid } from "@/shared/public/components/PublicHighlightGrid";
import { getPublicPageContent } from "@/shared/public/page-content";
import { getDemoProducts, isDemoContentEnabled } from "@/shared/public/demo-content";
import { pickLocalized, pickSlug } from "@/shared/public/public-utils";
import { isPublicSectionVisible } from "@/shared/public/settings-utils";
import { formatPublicLabel } from "@/shared/public/public-labels";
import { buildLocalizedMetadata } from "@/shared/seo/metadata";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);

  return buildLocalizedMetadata(locale, {
    title: dict.public.products.title,
    description: dict.public.products.description,
    path: `/${locale}/products`,
  });
}

export default async function ProductsPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const page = getPublicPageContent(locale);
  const [settings, backendProducts] = await Promise.all([
    getPublicSettings().catch(() => null),
    getPublicProducts().catch(() => []),
  ]);
  const products = backendProducts.length > 0 || !isDemoContentEnabled() ? backendProducts : getDemoProducts();

  if (products.length === 0 || !isPublicSectionVisible(settings, "products")) {
    return (
      <main>
        <PublicUnavailable
          locale={locale}
          badge={dict.public.unavailable.badge}
          title={dict.public.products.title}
          description={dict.public.unavailable.description}
          homeLabel={dict.public.unavailable.homeCta}
          quoteLabel={dict.public.unavailable.quoteCta}
        />
      </main>
    );
  }

  return (
    <main>
      <PublicPageHero
        eyebrow={page.systems.eyebrow}
        title={page.systems.title}
        description={page.systems.description}
        icon="server"
        primaryCta={page.common.startProject}
        primaryHref={`/${locale}/quote-request`}
        secondaryCta={page.common.details}
        secondaryHref={`/${locale}/contact`}
        metrics={page.systems.metrics}
      />

      <PublicSection
        title={dict.public.products.title}
        description={dict.public.products.description}
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {products.map((item) => {
            const features = (item.features ?? [])
              .map((feature) => pickLocalized(locale, feature.title_ar, feature.title_en))
              .filter(Boolean);
            return (
              <PublicShowcaseCard
                key={item.id}
                icon="server"
                title={pickLocalized(locale, item.name_ar, item.name_en)}
                description={pickLocalized(locale, item.short_description_ar, item.short_description_en)}
                href={`/${locale}/products/${pickSlug(locale, item.slug_ar, item.slug_en)}`}
                cta={dict.public.products.detailsCta}
                badge={formatPublicLabel(locale, item.status)}
                imageUrl={item.main_image_url}
                features={features.length > 0 ? features : [...page.systems.defaultFeatures]}
                meta={[formatPublicLabel(locale, item.product_type)]}
              />
            );
          })}
        </div>
      </PublicSection>

      <PublicSection
        title={page.systems.highlightsTitle}
        description={page.systems.highlightsDescription}
      >
        <PublicHighlightGrid items={[...page.systems.highlights]} />
      </PublicSection>
    </main>
  );
}
