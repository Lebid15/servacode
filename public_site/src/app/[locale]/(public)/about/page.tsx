import type { Metadata } from "next";
import Link from "next/link";

/**
 * =====================================================
 * صفحة من نحن
 * صفحة تعريف احترافية لشركة برمجيات تبني أنظمة ومنتجات رقمية
 * =====================================================
 */

import { AppBadge } from "@/shared/design-system/components/AppBadge";
import { AppButton } from "@/shared/design-system/components/AppButton";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppIcon } from "@/shared/design-system/components/AppIcon";
import { AppPageHeader } from "@/shared/design-system/components/AppPageHeader";
import { AboutMethodStep } from "@/shared/public/components/AboutMethodStep";
import { AboutValueCard } from "@/shared/public/components/AboutValueCard";
import { PublicSection } from "@/shared/public/components/PublicSection";
import { getDictionary } from "@/shared/design-system/i18n/get-dictionary";
import { getPublicStaticPage } from "@/shared/api/public-client";
import { buildLocalizedMetadata } from "@/shared/seo/metadata";
import type { Locale } from "@/shared/design-system/utils/direction";

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

function numberLabel(index: number, locale: Locale) {
  const value = String(index + 1).padStart(2, "0");
  return locale === "ar" ? value.replace(/\d/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[Number(digit)]) : value;
}

async function loadAboutPage() {
  try {
    return await getPublicStaticPage("about");
  } catch {
    return null;
  }
}

function paragraphsFrom(content?: string | null) {
  return String(content ?? "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const page = await loadAboutPage();

  return buildLocalizedMetadata(locale, {
    title: (locale === "ar" ? page?.seo_title_ar || page?.title_ar : page?.seo_title_en || page?.title_en) || dict.public.about.title,
    description: (locale === "ar" ? page?.seo_description_ar : page?.seo_description_en) || dict.public.about.description,
    path: `/${locale}/about`
  });
}

export default async function AboutPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const page = await loadAboutPage();
  const pageTitle = (locale === "ar" ? page?.title_ar : page?.title_en) || dict.public.about.title;
  const pageDescription = (locale === "ar" ? page?.seo_description_ar : page?.seo_description_en) || dict.public.about.description;
  const pageParagraphs = paragraphsFrom(locale === "ar" ? page?.content_ar : page?.content_en);

  const stats = [
    dict.publicAboutRedesign.stats.systems,
    dict.publicAboutRedesign.stats.platforms,
    dict.publicAboutRedesign.stats.architecture
  ];

  const values = [
    {
      icon: "layers" as const,
      title: dict.publicAboutRedesign.values.structure.title,
      description: dict.publicAboutRedesign.values.structure.description
    },
    {
      icon: "shield" as const,
      title: dict.publicAboutRedesign.values.trust.title,
      description: dict.publicAboutRedesign.values.trust.description
    },
    {
      icon: "gauge" as const,
      title: dict.publicAboutRedesign.values.performance.title,
      description: dict.publicAboutRedesign.values.performance.description
    },
    {
      icon: "workflow" as const,
      title: dict.publicAboutRedesign.values.workflow.title,
      description: dict.publicAboutRedesign.values.workflow.description
    }
  ];

  const method = [
    dict.publicAboutRedesign.method.analysis,
    dict.publicAboutRedesign.method.architecture,
    dict.publicAboutRedesign.method.interface,
    dict.publicAboutRedesign.method.delivery
  ];

  return (
    <main>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 app-grid-bg opacity-30" aria-hidden="true" />
        <div className="app-container relative grid gap-10 py-16 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <div className="grid gap-7">
            <AppBadge tone="primary" className="gap-2">
              <AppIcon name="sparkles" size={15} />
              {dict.publicAboutRedesign.eyebrow}
            </AppBadge>

            <AppPageHeader
              title={pageTitle}
              description={pageDescription}
            />

            <div className="flex flex-wrap gap-3">
              <Link href={`/${locale}/quote-request`}>
                <AppButton size="lg">
                  {dict.public.home.primaryCta}
                  <AppIcon name="arrowUpRight" size={18} />
                </AppButton>
              </Link>
              <Link href={`/${locale}/contact`}>
                <AppButton variant="secondary" size="lg">
                  {dict.public.home.secondaryCta}
                </AppButton>
              </Link>
            </div>
          </div>

          <AppCard className="relative overflow-hidden p-6">
            <div className="absolute end-[-5rem] top-[-5rem] h-56 w-56 rounded-full bg-[hsl(var(--color-primary)/0.20)] blur-3xl" />
            <div className="relative grid gap-4">
              <div className="rounded-appXl border border-app-border bg-app-surfaceElevated/80 p-5">
                <span className="text-xs font-black uppercase tracking-[0.28em] text-app-muted">
                  Software Studio
                </span>
                <h2 className="mt-3 text-2xl font-black">{dict.publicAboutRedesign.panelTitle}</h2>
                <div className="mt-3 grid gap-3 leading-7 text-app-muted">
                  {(pageParagraphs.length > 0 ? pageParagraphs : [dict.publicAboutRedesign.panelDescription]).slice(0, 2).map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {stats.map((item) => (
                  <div key={item.label} className="rounded-appLg border border-app-border bg-app-surface/75 p-4">
                    <strong className="block text-2xl font-black text-app-primary">{item.value}</strong>
                    <span className="text-xs font-bold text-app-muted">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </AppCard>
        </div>
      </section>

      <PublicSection
        eyebrow={dict.publicAboutRedesign.sections.identityEyebrow}
        title={dict.publicAboutRedesign.sections.identityTitle}
        description={dict.publicAboutRedesign.sections.identityDescription}
      >
        <div className="grid gap-5 lg:grid-cols-3">
          <AppCard className="p-6">
            <h3 className="text-2xl font-black">{dict.public.about.vision}</h3>
            <p className="mt-3 leading-8 text-app-muted">{dict.public.about.visionBody}</p>
          </AppCard>
          <AppCard className="p-6">
            <h3 className="text-2xl font-black">{dict.public.about.mission}</h3>
            <p className="mt-3 leading-8 text-app-muted">{dict.public.about.missionBody}</p>
          </AppCard>
          <AppCard className="p-6">
            <h3 className="text-2xl font-black">{dict.public.about.values}</h3>
            <p className="mt-3 leading-8 text-app-muted">{dict.public.about.valuesBody}</p>
          </AppCard>
        </div>
      </PublicSection>

      <PublicSection
        eyebrow={dict.publicAboutRedesign.sections.valuesEyebrow}
        title={dict.publicAboutRedesign.sections.valuesTitle}
        description={dict.publicAboutRedesign.sections.valuesDescription}
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {values.map((item) => (
            <AboutValueCard
              key={item.title}
              icon={item.icon}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </PublicSection>

      <PublicSection
        eyebrow={dict.publicAboutRedesign.sections.methodEyebrow}
        title={dict.publicAboutRedesign.sections.methodTitle}
        description={dict.publicAboutRedesign.sections.methodDescription}
      >
        <div className="grid gap-5 md:grid-cols-4">
          {method.map((item, index) => (
            <AboutMethodStep
              key={item.title}
              index={numberLabel(index, locale)}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </PublicSection>

      <PublicSection>
        <AppCard className="relative overflow-hidden p-8 text-center md:p-12">
          <div className="absolute inset-0 app-grid-bg opacity-20" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-3xl gap-5">
            <h2 className="text-balance text-3xl font-black md:text-5xl">
              {dict.publicAboutRedesign.cta.title}
            </h2>
            <p className="text-lg leading-8 text-app-muted">{dict.publicAboutRedesign.cta.description}</p>
            <div className="flex justify-center">
              <Link href={`/${locale}/quote-request`}>
                <AppButton size="lg">
                  {dict.publicAboutRedesign.cta.button}
                  <AppIcon name="arrowUpRight" size={18} />
                </AppButton>
              </Link>
            </div>
          </div>
        </AppCard>
      </PublicSection>
    </main>
  );
}
