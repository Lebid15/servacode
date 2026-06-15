import type { Metadata } from "next";

/**
 * =====================================================
 * صفحة تفاصيل العمل السابق
 * تصميم احترافي لدراسة حالة
 * =====================================================
 */

import Link from "next/link";
import { notFound } from "next/navigation";

import { getPublicPortfolioProject } from "@/shared/api/public-client";
import { findDemoPortfolio, isDemoContentEnabled } from "@/shared/public/demo-content";
import { AppBadge } from "@/shared/design-system/components/AppBadge";
import { AppButton } from "@/shared/design-system/components/AppButton";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppIcon } from "@/shared/design-system/components/AppIcon";
import { ContentBlockCard } from "@/shared/public/components/ContentBlockCard";
import { DetailCTA } from "@/shared/public/components/DetailCTA";
import { DynamicDetailHero } from "@/shared/public/components/DynamicDetailHero";
import { PublicSection } from "@/shared/public/components/PublicSection";
import { PublicOptimizedImage } from "@/shared/public/components/PublicOptimizedImage";
import { getDictionary } from "@/shared/design-system/i18n/get-dictionary";
import { pickLocalized } from "@/shared/public/public-utils";
import type { Locale } from "@/shared/design-system/utils/direction";
import { buildLocalizedMetadata } from "@/shared/seo/metadata";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = rawLocale as Locale;
  const item = await getPublicPortfolioProject(slug).catch(() => null) ?? (isDemoContentEnabled() ? findDemoPortfolio(locale, slug) : null);

  if (!item) {
    return buildLocalizedMetadata(locale, {
      title: slug,
      description: slug,
      path: `/${locale}/portfolio/${slug}`
    });
  }

  return buildLocalizedMetadata(locale, {
    title: pickLocalized(locale, item.title_ar, item.title_en),
    description: pickLocalized(locale, item.description_ar, item.description_en),
    path: `/${locale}/portfolio/${slug}`
  });
}

export default async function PortfolioDetailsPage({ params }: PageProps) {
  const { locale: rawLocale, slug } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const project = await getPublicPortfolioProject(slug).catch(() => null) ?? (isDemoContentEnabled() ? findDemoPortfolio(locale, slug) : null);

  if (!project) {
    notFound();
  }

  const title = pickLocalized(locale, project.title_ar, project.title_en);
  const description = pickLocalized(locale, project.full_description_ar || project.description_ar, project.full_description_en || project.description_en);
  const category = pickLocalized(locale, project.category_ar, project.category_en);
  const galleryImages = [project.main_image_url, ...(project.gallery_images ?? [])].filter(Boolean) as string[];

  return (
    <main>
      <DynamicDetailHero
        locale={locale}
        eyebrow={dict.publicDynamic.portfolio.eyebrow}
        title={title}
        description={description}
        icon="layers"
        primaryCta={dict.publicDynamic.common.primaryCta}
        secondaryCta={dict.publicDynamic.common.secondaryCta}
        badges={[category]}
      />

      <PublicSection
        eyebrow={dict.publicDynamic.portfolio.detailsEyebrow}
        title={dict.publicDynamic.portfolio.detailsTitle}
        description={dict.publicDynamic.portfolio.detailsDescription}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <ContentBlockCard
            icon="message"
            title={dict.publicDynamic.portfolio.problemTitle}
            content={pickLocalized(locale, project.problem_ar, project.problem_en)}
          />
          <ContentBlockCard
            icon="rocket"
            title={dict.publicDynamic.portfolio.resultTitle}
            content={pickLocalized(locale, project.result_ar, project.result_en)}
          />
          <ContentBlockCard
            icon="sparkles"
            title={dict.publicDynamic.portfolio.overviewTitle}
            content={description}
          />
          <ContentBlockCard
            icon="code"
            title={dict.publicDynamic.portfolio.techTitle}
            content={(project.technologies ?? []).join(" • ")}
          />
        </div>

        {(project.technologies ?? []).length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-2">
            {(project.technologies ?? []).map((tech) => (
              <AppBadge key={tech} tone="primary">
                {tech}
              </AppBadge>
            ))}
          </div>
        ) : null}

        {galleryImages.length > 0 ? (
          <div className="grid gap-5 pt-2 md:grid-cols-2 xl:grid-cols-3">
            {galleryImages.map((imageUrl, index) => (
              <AppCard key={`${imageUrl}-${index}`} className="relative h-64 overflow-hidden p-0">
                <PublicOptimizedImage
                  src={imageUrl}
                  alt={title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="rounded-none border-0 shadow-none"
                />
              </AppCard>
            ))}
          </div>
        ) : null}

        {project.preview_url ? (
          <div>
            <Link href={project.preview_url} target="_blank" rel="noreferrer">
              <AppButton variant="secondary">
                {dict.publicDynamic.portfolio.previewCta}
                <AppIcon name="arrowUpRight" size={17} />
              </AppButton>
            </Link>
          </div>
        ) : null}
      </PublicSection>

      <PublicSection>
        <DetailCTA
          locale={locale}
          title={dict.publicDynamic.portfolio.ctaTitle}
          description={dict.publicDynamic.portfolio.ctaDescription}
          button={dict.publicDynamic.common.primaryCta}
        />
      </PublicSection>
    </main>
  );
}
