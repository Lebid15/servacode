import type { Metadata } from "next";

import { notFound } from "next/navigation";

import { JsonLd } from "@/shared/seo/json-ld";
import { productJsonLd } from "@/shared/seo/structured-data";

import { getPublicApp } from "@/shared/api/public-client";
import { findDemoApp, isDemoContentEnabled } from "@/shared/public/demo-content";
import { buildBackendAssetUrl } from "@/shared/api/api-client";
import { AppBadge } from "@/shared/design-system/components/AppBadge";
import { AppButton } from "@/shared/design-system/components/AppButton";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppIcon } from "@/shared/design-system/components/AppIcon";
import { ContentBlockCard } from "@/shared/public/components/ContentBlockCard";
import { DetailCTA } from "@/shared/public/components/DetailCTA";
import { DetailFeatureCard } from "@/shared/public/components/DetailFeatureCard";
import { DynamicDetailHero } from "@/shared/public/components/DynamicDetailHero";
import { PublicSection } from "@/shared/public/components/PublicSection";
import { PublicOptimizedImage } from "@/shared/public/components/PublicOptimizedImage";
import { getDictionary } from "@/shared/design-system/i18n/get-dictionary";
import { pickLocalized } from "@/shared/public/public-utils";
import { formatPublicLabel, formatPublicLabels } from "@/shared/public/public-labels";
import type { Locale } from "@/shared/design-system/utils/direction";
import { buildLocalizedMetadata } from "@/shared/seo/metadata";
import {
  getAppDownloads,
  normalizeAppChangelog,
  normalizeAppFeature,
  normalizeAppScreenshot,
} from "@/shared/public/app-utils";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = rawLocale as Locale;
  const item = await getPublicApp(slug).catch(() => null) ?? (isDemoContentEnabled() ? findDemoApp(locale, slug) : null);

  if (!item) {
    return buildLocalizedMetadata(locale, {
      title: slug,
      description: slug,
      path: `/${locale}/apps/${slug}`,
    });
  }

  return buildLocalizedMetadata(locale, {
    title: pickLocalized(
      locale,
      item.seo_title_ar || item.name_ar,
      item.seo_title_en || item.name_en,
    ),
    description: pickLocalized(
      locale,
      item.seo_description_ar || item.short_description_ar,
      item.seo_description_en || item.short_description_en,
    ),
    path: `/${locale}/apps/${slug}`,
  });
}

export default async function AppDetailsPage({ params }: PageProps) {
  const { locale: rawLocale, slug } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const app = await getPublicApp(slug).catch(() => null) ?? (isDemoContentEnabled() ? findDemoApp(locale, slug) : null);

  if (!app) {
    notFound();
    throw new Error("App not found");
  }

  const title = pickLocalized(locale, app.name_ar, app.name_en);
  const description = pickLocalized(
    locale,
    app.full_description_ar || app.short_description_ar,
    app.full_description_en || app.short_description_en,
  );
  const features = app.features ?? [];
  const screenshots = (app.screenshots ?? [])
    .map((item) => normalizeAppScreenshot(item, locale))
    .filter(Boolean) as Array<{
    imageUrl: string;
    alt: string;
  }>;
  const downloads = getAppDownloads(app, locale);
  const requirements = Object.entries(app.requirements ?? {}).filter(
    ([, value]) => Boolean(String(value ?? "").trim()),
  );
  const changelog = (app.changelog ?? []).map((entry, index) =>
    normalizeAppChangelog(entry, locale, index),
  );
  const primaryDownload = downloads[0];

  return (
    <main>
      <JsonLd
        data={productJsonLd(
          locale,
          title,
          description,
          `/${locale}/apps/${slug}`,
        )}
      />
      <DynamicDetailHero
        locale={locale}
        eyebrow={dict.publicDynamic.app.eyebrow}
        title={title}
        description={description}
        icon="apps"
        primaryCta={primaryDownload ? dict.publicDynamic.app.downloadCta : dict.publicDynamic.common.secondaryCta}
        primaryHref={primaryDownload ? buildBackendAssetUrl(primaryDownload.url) : `/${locale}/quote-request`}
        primaryIsDownload={Boolean(primaryDownload)}
        primaryIcon={primaryDownload ? "download" : "arrowUpRight"}
        secondaryCta={dict.publicDynamic.common.secondaryCta}
        badges={formatPublicLabels(locale, [app.platform, app.status, app.pricing_type, app.version])}
      />

      <PublicSection
        eyebrow={dict.publicDynamic.app.detailsEyebrow}
        title={dict.publicDynamic.app.detailsTitle}
        description={dict.publicDynamic.app.detailsDescription}
      >
        <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
          <ContentBlockCard
            icon="apps"
            title={dict.publicDynamic.app.overviewTitle}
            content={description}
          />

          <div className="grid gap-5 md:grid-cols-2">
            {(features.length > 0
              ? features
              : dict.publicDynamic.app.defaultFeatures
            ).map((feature, index) => {
              const item = normalizeAppFeature(
                feature,
                locale,
                `${dict.publicDynamic.app.featureFallback} ${index + 1}`,
              );
              return (
                <DetailFeatureCard
                  key={`${item.title}-${index}`}
                  title={item.title}
                  description={item.description}
                />
              );
            })}
          </div>
        </div>
      </PublicSection>

      {screenshots.length > 0 ? (
        <PublicSection
          title={dict.publicDynamic.app.screenshotsTitle}
          description={dict.publicDynamic.app.screenshotsDescription}
        >
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {screenshots.map((screenshot, index) => (
              <AppCard
                key={`${screenshot.imageUrl}-${index}`}
                className="relative h-64 overflow-hidden p-0"
              >
                <PublicOptimizedImage
                  src={screenshot.imageUrl}
                  alt={screenshot.alt || title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="rounded-none border-0 shadow-none"
                />
              </AppCard>
            ))}
          </div>
        </PublicSection>
      ) : null}

      {downloads.length > 0 ? (
        <PublicSection
          title={dict.publicDynamic.app.downloadsTitle}
          description={dict.publicDynamic.app.downloadsDescription}
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {downloads.map((download, index) => (
              <AppCard
                key={`${download.url}-${index}`}
                className="grid gap-4 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-appXl border border-app-border bg-app-surfaceElevated text-app-primary">
                    <AppIcon name="download" size={20} />
                  </span>
                  <AppBadge tone="primary">{formatPublicLabel(locale, download.platform)}</AppBadge>
                </div>
                <div className="grid gap-1">
                  <h3 className="text-lg font-black">{download.label}</h3>
                  <p className="text-sm text-app-muted">
                    {[download.version, download.fileSize, download.releaseDate]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <a
                  href={buildBackendAssetUrl(download.url)}
                  download
                >
                  <AppButton className="w-full">
                    <AppIcon name="download" size={17} />
                    {dict.publicDynamic.app.downloadCta}
                  </AppButton>
                </a>
              </AppCard>
            ))}
          </div>
        </PublicSection>
      ) : null}

      {requirements.length > 0 ? (
        <PublicSection title={dict.publicDynamic.app.requirementsTitle}>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {requirements.map(([key, value]) => (
              <AppCard key={key} className="p-5">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-app-primary">
                  {key}
                </p>
                <p className="mt-2 text-sm leading-7 text-app-muted">
                  {String(value)}
                </p>
              </AppCard>
            ))}
          </div>
        </PublicSection>
      ) : null}

      <PublicSection title={dict.publicDynamic.app.actionsTitle}>
        <div className="grid gap-4 md:grid-cols-3">
          {primaryDownload ? (
            <a
              href={buildBackendAssetUrl(primaryDownload.url)}
              download
            >
              <AppButton className="w-full" variant="secondary">
                <AppIcon name="download" size={17} />
                {dict.publicDynamic.app.downloadCta}
              </AppButton>
            </a>
          ) : null}
          <a
            href={app.support_url || `/${locale}/support`}
            target={app.support_url ? "_blank" : undefined}
            rel={app.support_url ? "noreferrer" : undefined}
          >
            <AppButton className="w-full" variant="ghost">
              <AppIcon name="support" size={17} />
              {dict.publicDynamic.app.supportCta}
            </AppButton>
          </a>
        </div>
      </PublicSection>

      {changelog.length > 0 ? (
        <PublicSection
          title={dict.publicDynamic.app.changelogTitle}
          description={dict.publicDynamic.app.changelogDescription}
        >
          <div className="grid gap-4">
            {changelog.map((entry, index) => (
              <AppCard key={`${entry.version}-${index}`} className="p-5">
                <div className="flex flex-wrap items-center gap-2">
                  {entry.version ? (
                    <AppBadge tone="primary">{entry.version}</AppBadge>
                  ) : null}
                  {entry.releaseDate ? (
                    <AppBadge tone="neutral">{entry.releaseDate}</AppBadge>
                  ) : null}
                </div>
                <h3 className="mt-3 text-lg font-black">{entry.title}</h3>
                {entry.description ? (
                  <p className="mt-2 leading-7 text-app-muted">
                    {entry.description}
                  </p>
                ) : null}
              </AppCard>
            ))}
          </div>
        </PublicSection>
      ) : null}

      <PublicSection>
        <DetailCTA
          locale={locale}
          title={dict.publicDynamic.app.ctaTitle}
          description={dict.publicDynamic.app.ctaDescription}
          button={dict.publicDynamic.common.primaryCta}
        />
      </PublicSection>
    </main>
  );
}
