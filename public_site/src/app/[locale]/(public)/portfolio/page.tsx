import type { Metadata } from "next";

import { getPublicPortfolio, getPublicSettings } from "@/shared/api/public-client";
import { getDictionary } from "@/shared/design-system/i18n/get-dictionary";
import type { Locale } from "@/shared/design-system/utils/direction";
import { PublicUnavailable } from "@/shared/public/components/PublicUnavailable";
import { PublicSection } from "@/shared/public/components/PublicSection";
import { PublicPageHero } from "@/shared/public/components/PublicPageHero";
import { PublicShowcaseCard } from "@/shared/public/components/PublicShowcaseCard";
import { PublicHighlightGrid } from "@/shared/public/components/PublicHighlightGrid";
import { getPublicPageContent } from "@/shared/public/page-content";
import { getDemoPortfolio, isDemoContentEnabled } from "@/shared/public/demo-content";
import { pickLocalized, pickSlug } from "@/shared/public/public-utils";
import { isPublicSectionVisible } from "@/shared/public/settings-utils";
import { buildLocalizedMetadata } from "@/shared/seo/metadata";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);

  return buildLocalizedMetadata(locale, {
    title: dict.public.portfolio.title,
    description: dict.public.portfolio.description,
    path: `/${locale}/portfolio`,
  });
}

export default async function PortfolioPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const page = getPublicPageContent(locale);
  const [settings, backendProjects] = await Promise.all([
    getPublicSettings().catch(() => null),
    getPublicPortfolio().catch(() => []),
  ]);
  const projects = backendProjects.length > 0 || !isDemoContentEnabled() ? backendProjects : getDemoPortfolio();

  if (projects.length === 0 || !isPublicSectionVisible(settings, "portfolio")) {
    return (
      <main>
        <PublicUnavailable
          locale={locale}
          badge={dict.public.unavailable.badge}
          title={dict.public.portfolio.title}
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
        eyebrow={page.work.eyebrow}
        title={page.work.title}
        description={page.work.description}
        icon="layers"
        primaryCta={page.common.startProject}
        primaryHref={`/${locale}/quote-request`}
        secondaryCta={page.common.details}
        secondaryHref={`/${locale}/contact`}
        metrics={page.work.metrics}
      />

      <PublicSection
        title={dict.public.portfolio.title}
        description={dict.public.portfolio.description}
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((item) => {
            const category = pickLocalized(locale, item.category_ar, item.category_en);
            const technologies = (item.technologies ?? []).slice(0, 4);
            return (
              <PublicShowcaseCard
                key={item.id}
                icon="layers"
                title={pickLocalized(locale, item.title_ar, item.title_en)}
                description={pickLocalized(locale, item.description_ar, item.description_en)}
                href={`/${locale}/portfolio/${pickSlug(locale, item.slug_ar, item.slug_en)}`}
                cta={dict.public.portfolio.detailsCta}
                badge={category}
                imageUrl={item.main_image_url}
                features={technologies}
                meta={category ? [category] : []}
              />
            );
          })}
        </div>
      </PublicSection>

      <PublicSection title={page.work.highlightsTitle} description={page.work.highlightsDescription}>
        <PublicHighlightGrid items={[...page.work.highlights]} />
      </PublicSection>
    </main>
  );
}
