import type { Metadata } from "next";

import { buildBackendAssetUrl } from "@/shared/api/api-client";
import { getPublicApps, getPublicSettings } from "@/shared/api/public-client";
import { getDictionary } from "@/shared/design-system/i18n/get-dictionary";
import type { Locale } from "@/shared/design-system/utils/direction";
import { getPublicPageContent } from "@/shared/public/page-content";
import { getAppDownloads, normalizeAppFeature } from "@/shared/public/app-utils";
import { getDemoApps, isDemoContentEnabled } from "@/shared/public/demo-content";
import { PublicPageHero } from "@/shared/public/components/PublicPageHero";
import { PublicHighlightGrid } from "@/shared/public/components/PublicHighlightGrid";
import { PublicUnavailable } from "@/shared/public/components/PublicUnavailable";
import { PublicShowcaseCard } from "@/shared/public/components/PublicShowcaseCard";
import { PublicSection } from "@/shared/public/components/PublicSection";
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
    title: dict.public.apps.title,
    description: dict.public.apps.description,
    path: `/${locale}/apps`,
  });
}

export default async function AppsPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const page = getPublicPageContent(locale);
  const [settings, backendApps] = await Promise.all([
    getPublicSettings().catch(() => null),
    getPublicApps().catch(() => []),
  ]);
  const apps = backendApps.length > 0 || !isDemoContentEnabled() ? backendApps : getDemoApps();

  if (apps.length === 0 || !isPublicSectionVisible(settings, "apps")) {
    return (
      <main>
        <PublicUnavailable
          locale={locale}
          badge={dict.public.unavailable.badge}
          title={dict.public.apps.title}
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
        eyebrow={page.apps.eyebrow}
        title={page.apps.title}
        description={page.apps.description}
        icon="apps"
        primaryCta={page.common.download}
        primaryHref={`/${locale}/downloads`}
        secondaryCta={page.common.startProject}
        secondaryHref={`/${locale}/quote-request`}
        metrics={page.apps.metrics}
      />

      <PublicSection title={dict.public.apps.title} description={dict.public.apps.description}>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {apps.map((item) => {
            const features = (item.features ?? [])
              .map((feature, index) => normalizeAppFeature(feature, locale, `${index + 1}`).title)
              .filter(Boolean);
            const downloads = getAppDownloads(item, locale);
            const primaryDownload = downloads[0];
            const detailsHref = `/${locale}/apps/${pickSlug(locale, item.slug_ar, item.slug_en)}`;
            return (
              <PublicShowcaseCard
                key={item.id}
                icon="apps"
                title={pickLocalized(locale, item.name_ar, item.name_en)}
                description={pickLocalized(locale, item.short_description_ar, item.short_description_en)}
                href={primaryDownload ? buildBackendAssetUrl(primaryDownload.url) : detailsHref}
                cta={primaryDownload ? dict.publicDynamic.app.downloadCta : dict.public.apps.detailsCta}
                ctaIcon={primaryDownload ? "download" : "arrowUpRight"}
                isDownload={Boolean(primaryDownload)}
                badge={formatPublicLabel(locale, item.status)}
                imageUrl={item.icon_url || item.main_image_url}
                features={features.length > 0 ? features : [...page.apps.defaultFeatures]}
                meta={[
                  formatPublicLabel(locale, item.platform),
                  formatPublicLabel(locale, item.pricing_type),
                  downloads.length ? (locale === "ar" ? `${downloads.length} ملف` : `${downloads.length} files`) : ""
                ]}
              />
            );
          })}
        </div>
      </PublicSection>

      <PublicSection title={page.apps.highlightsTitle} description={page.apps.highlightsDescription}>
        <PublicHighlightGrid items={[...page.apps.highlights]} />
      </PublicSection>
    </main>
  );
}
