import type { Metadata } from "next";

import { getPublicApps } from "@/shared/api/public-client";
import { buildBackendAssetUrl } from "@/shared/api/api-client";
import { AppBadge } from "@/shared/design-system/components/AppBadge";
import { AppButton } from "@/shared/design-system/components/AppButton";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppIcon } from "@/shared/design-system/components/AppIcon";
import { getDictionary } from "@/shared/design-system/i18n/get-dictionary";
import type { Locale } from "@/shared/design-system/utils/direction";
import { getAppDownloads, groupDownloadsByPlatform } from "@/shared/public/app-utils";
import { getPublicPageContent } from "@/shared/public/page-content";
import { PublicPageHero } from "@/shared/public/components/PublicPageHero";
import { PublicHighlightGrid } from "@/shared/public/components/PublicHighlightGrid";
import { PublicSection } from "@/shared/public/components/PublicSection";
import { PublicUnavailable } from "@/shared/public/components/PublicUnavailable";
import { PublicOptimizedImage } from "@/shared/public/components/PublicOptimizedImage";
import { pickLocalized, pickSlug } from "@/shared/public/public-utils";
import { buildLocalizedMetadata } from "@/shared/seo/metadata";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);

  return buildLocalizedMetadata(locale, {
    title: dict.public.downloads.title,
    description: dict.public.downloads.description,
    path: `/${locale}/downloads`,
  });
}

export default async function DownloadsPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const page = getPublicPageContent(locale);
  const apps = await getPublicApps().catch(() => []);
  const downloadableApps = apps
    .map((app) => ({ app, downloads: getAppDownloads(app, locale) }))
    .filter((item) => item.downloads.length > 0);
  const groupedDownloads = groupDownloadsByPlatform(downloadableApps.flatMap((item) => item.downloads));

  if (downloadableApps.length === 0) {
    return (
      <main>
        <PublicUnavailable
          locale={locale}
          badge={dict.public.unavailable.badge}
          title={dict.public.downloads.title}
          description={dict.public.downloads.empty}
          homeLabel={dict.public.unavailable.homeCta}
          quoteLabel={dict.public.unavailable.quoteCta}
        />
      </main>
    );
  }

  return (
    <main>
      <PublicPageHero
        eyebrow={page.downloads.eyebrow}
        title={page.downloads.title}
        description={page.downloads.description}
        icon="download"
        primaryCta={dict.public.downloads.detailsCta}
        primaryHref={`/${locale}/apps`}
        secondaryCta={dict.public.support.title}
        secondaryHref={`/${locale}/support`}
        metrics={page.downloads.metrics}
      />

      <PublicSection title={dict.public.downloads.title} description={dict.public.downloads.description}>
        <div className="flex flex-wrap gap-2">
          {Object.entries(groupedDownloads).map(([platform, items]) => (
            <AppBadge key={platform} tone="primary">
              {platform}: {items.length}
            </AppBadge>
          ))}
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {downloadableApps.map(({ app, downloads }) => (
            <AppCard key={app.id} className="grid gap-5 p-5 app-hover-lift">
              <div className="flex items-start justify-between gap-4">
                <span className="relative grid h-14 w-14 place-items-center overflow-hidden rounded-appXl border border-app-border bg-app-surfaceElevated text-app-primary">
                  {app.icon_url ? (
                    <PublicOptimizedImage
                      src={app.icon_url}
                      alt={pickLocalized(locale, app.name_ar, app.name_en)}
                      fill
                      sizes="56px"
                      className="rounded-none border-0 shadow-none"
                    />
                  ) : (
                    <AppIcon name="apps" size={24} />
                  )}
                </span>
                <AppBadge tone="primary">{downloads[0]?.platform || app.platform}</AppBadge>
              </div>

              <div className="grid gap-2">
                <h2 className="text-xl font-black">{pickLocalized(locale, app.name_ar, app.name_en)}</h2>
                <p className="leading-7 text-app-muted">
                  {pickLocalized(locale, app.short_description_ar, app.short_description_en)}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs font-black text-app-muted">
                {app.version ? <span>{dict.public.downloads.version}: {app.version}</span> : null}
                <span>{app.pricing_type}</span>
                <span>{app.status}</span>
              </div>

              <div className="grid gap-2">
                {downloads.map((download, index) => (
                  <a key={`${download.url}-${index}`} href={buildBackendAssetUrl(download.url)} download>
                    <AppButton className="w-full">
                      <AppIcon name="download" size={17} />
                      {download.label} {download.fileSize ? `· ${download.fileSize}` : ""}
                    </AppButton>
                  </a>
                ))}
                <a href={`/${locale}/apps/${pickSlug(locale, app.slug_ar, app.slug_en)}`}>
                  <AppButton variant="secondary" className="w-full">
                    <AppIcon name="arrowUpRight" size={17} />
                    {dict.public.downloads.detailsCta}
                  </AppButton>
                </a>
              </div>
            </AppCard>
          ))}
        </div>
      </PublicSection>

      <PublicSection title={page.downloads.safetyTitle} description={page.downloads.safetyDescription}>
        <PublicHighlightGrid items={[...page.downloads.safety]} />
      </PublicSection>
    </main>
  );
}
