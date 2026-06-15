import type { Metadata } from "next";

/**
 * =====================================================
 * الصفحة الرئيسية للموقع العام
 * تصميم احترافي لشركة برمجيات مع إخفاء المحتوى الفارغ.
 * =====================================================
 */

import Link from "next/link";

import { getDictionary } from "@/shared/design-system/i18n/get-dictionary";
import { buildLocalizedMetadata } from "@/shared/seo/metadata";
import { JsonLd } from "@/shared/seo/json-ld";
import { organizationJsonLd, professionalServiceJsonLd, websiteJsonLd } from "@/shared/seo/structured-data";
import { AppButton } from "@/shared/design-system/components/AppButton";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppIcon } from "@/shared/design-system/components/AppIcon";
import { HomeCompositionShowcase } from "@/shared/public/components/HomeCompositionShowcase";
import { HomeFeatureCard } from "@/shared/public/components/HomeFeatureCard";
import { HomeProcessCard } from "@/shared/public/components/HomeProcessCard";
import { HomeProofStrip } from "@/shared/public/components/HomeProofStrip";
import { HomeTechBadge } from "@/shared/public/components/HomeTechBadge";
import { PublicHero } from "@/shared/public/components/PublicHero";
import { PublicContactBand } from "@/shared/public/components/PublicContactBand";
import { PublicItemCard } from "@/shared/public/components/PublicItemCard";
import { PublicServiceCard } from "@/shared/public/components/PublicServiceCard";
import { PublicSection } from "@/shared/public/components/PublicSection";
import { SystemArchitectureShowcase } from "@/shared/public/components/SystemArchitectureShowcase";
import {
  getPublicFaqs,
  getPublicPortfolio,
  getPublicProducts,
  getPublicServices,
  getPublicSettings,
  getPublicApps,
  getPublicTestimonials
} from "@/shared/api/public-client";
import { pickLocalized, pickSlug } from "@/shared/public/public-utils";
import {
  getPublicBrandName,
  getPublicSeoDescription,
  getPublicSeoTitle,
  getPublicHomeText,
  getPublicHomeStringList,
  isPublicSectionVisible
} from "@/shared/public/settings-utils";
import type { Locale } from "@/shared/design-system/utils/direction";
import { getFallbackServiceCards, publicServiceToCardView } from "@/shared/public/service-utils";
import { isDemoContentEnabled } from "@/shared/public/demo-content";
import { formatPublicLabel } from "@/shared/public/public-labels";

export const dynamic = "force-dynamic";

type HomePageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const [dict, settings] = await Promise.all([getDictionary(locale), getPublicSettings().catch(() => null)]);

  return buildLocalizedMetadata(locale, {
    title: getPublicSeoTitle(settings, locale, dict.public.home.title),
    description: getPublicSeoDescription(settings, locale, dict.public.home.description),
    path: `/${locale}`,
    siteName: getPublicBrandName(settings, locale, dict.admin.brand),
    faviconUrl: settings?.favicon_url
  });
}

function numberLabel(index: number, locale: Locale) {
  const value = String(index + 1).padStart(2, "0");
  return locale === "ar" ? value.replace(/\d/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[Number(digit)]) : value;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);

  const [settings, services, products, apps, portfolio, faqs, testimonials] = await Promise.all([
    getPublicSettings().catch(() => null),
    getPublicServices().catch(() => []),
    getPublicProducts().catch(() => []),
    getPublicApps().catch(() => []),
    getPublicPortfolio().catch(() => []),
    getPublicFaqs().catch(() => []),
    getPublicTestimonials().catch(() => [])
  ]);
  const seoTitle = getPublicSeoTitle(settings, locale, dict.public.home.title);
  const seoDescription = getPublicSeoDescription(settings, locale, dict.public.home.description);
  const homeTitle = getPublicHomeText(settings, locale, "hero_title", dict.public.home.title);
  const homeDescription = getPublicHomeText(settings, locale, "hero_subtitle", dict.public.home.description);
  const primaryCtaLabel = getPublicHomeText(settings, locale, "primary_cta", dict.public.home.primaryCta);
  const secondaryCtaLabel = getPublicHomeText(settings, locale, "secondary_cta", dict.public.home.secondaryCta);

  const buildCards = [
    {
      icon: "globe" as const,
      title: dict.publicHomeRedesign.build.websites.title,
      description: dict.publicHomeRedesign.build.websites.description
    },
    {
      icon: "panels" as const,
      title: dict.publicHomeRedesign.build.webApps.title,
      description: dict.publicHomeRedesign.build.webApps.description
    },
    {
      icon: "monitor" as const,
      title: dict.publicHomeRedesign.build.desktop.title,
      description: dict.publicHomeRedesign.build.desktop.description
    },
    {
      icon: "dashboard" as const,
      title: dict.publicHomeRedesign.build.admin.title,
      description: dict.publicHomeRedesign.build.admin.description
    },
    {
      icon: "network" as const,
      title: dict.publicHomeRedesign.build.apis.title,
      description: dict.publicHomeRedesign.build.apis.description
    },
    {
      icon: "database" as const,
      title: dict.publicHomeRedesign.build.data.title,
      description: dict.publicHomeRedesign.build.data.description
    }
  ];

  const whyCards = [
    {
      icon: "layers" as const,
      title: dict.publicHomeRedesign.why.system.title,
      description: dict.publicHomeRedesign.why.system.description
    },
    {
      icon: "shield" as const,
      title: dict.publicHomeRedesign.why.security.title,
      description: dict.publicHomeRedesign.why.security.description
    },
    {
      icon: "gauge" as const,
      title: dict.publicHomeRedesign.why.performance.title,
      description: dict.publicHomeRedesign.why.performance.description
    }
  ];

  const process = [
    dict.publicHomeRedesign.process.discovery,
    dict.publicHomeRedesign.process.architecture,
    dict.publicHomeRedesign.process.design,
    dict.publicHomeRedesign.process.development,
    dict.publicHomeRedesign.process.launch
  ];

  const technologies = getPublicHomeStringList(settings, "technologies", [
    "Next.js",
    "React",
    "TypeScript",
    "Django REST Framework",
    "PostgreSQL",
    "Django ORM",
    "PySide6",
    "REST APIs",
    "Server Deployment",
    "Tailwind"
  ]);

  const proofItems = [
    {
      icon: "globe" as const,
      title: dict.publicHomeV2.proof.web.title,
      description: dict.publicHomeV2.proof.web.description
    },
    {
      icon: "server" as const,
      title: dict.publicHomeV2.proof.backend.title,
      description: dict.publicHomeV2.proof.backend.description
    },
    {
      icon: "dashboard" as const,
      title: dict.publicHomeV2.proof.admin.title,
      description: dict.publicHomeV2.proof.admin.description
    },
    {
      icon: "shield" as const,
      title: dict.publicHomeV2.proof.security.title,
      description: dict.publicHomeV2.proof.security.description
    }
  ];

  return (
    <main>
      <JsonLd data={organizationJsonLd(locale, { settings, name: seoTitle, description: seoDescription })} />
      <JsonLd data={websiteJsonLd(locale, { settings, name: seoTitle })} />
      <JsonLd data={professionalServiceJsonLd(locale, { settings, name: seoTitle, description: seoDescription })} />

      <PublicHero
        locale={locale}
        eyebrow={dict.publicHomeRedesign.hero.eyebrow}
        title={homeTitle}
        description={homeDescription}
        primaryCta={primaryCtaLabel}
        secondaryCta={secondaryCtaLabel}
        secondaryHref={`/${locale}/services`}
        visualLabels={dict.publicHomeRedesign.heroVisual}
      />

      <PublicContactBand
        locale={locale}
        settings={settings}
        labels={{
          email: dict.fields.email,
          phone: dict.fields.phone,
          whatsapp: dict.fields.whatsapp,
          address: locale === "ar" ? "العنوان" : "Address"
        }}
      />

      <HomeProofStrip items={proofItems} />


      {isPublicSectionVisible(settings, "build") ? (
      <PublicSection
        eyebrow={dict.publicHomeRedesign.sections.whatWeBuildEyebrow}
        title={dict.publicHomeRedesign.sections.whatWeBuildTitle}
        description={dict.publicHomeRedesign.sections.whatWeBuildDescription}
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {buildCards.map((item) => (
            <HomeFeatureCard key={item.title} icon={item.icon} title={item.title} description={item.description} />
          ))}
        </div>
      </PublicSection>
      ) : null}

      {isPublicSectionVisible(settings, "composition") ? (
      <PublicSection
        eyebrow={dict.publicHomeV2.composition.eyebrow}
        title={dict.publicHomeV2.composition.sectionTitle}
        description={dict.publicHomeV2.composition.sectionDescription}
      >
        <HomeCompositionShowcase labels={dict.publicHomeV2.composition} />
      </PublicSection>
      ) : null}

      {isPublicSectionVisible(settings, "architecture") ? (
      <PublicSection
        eyebrow={dict.publicHomeV2.architecture.eyebrow}
        title={dict.publicHomeV2.architecture.title}
        description={dict.publicHomeV2.architecture.description}
      >
        <SystemArchitectureShowcase labels={dict.publicHomeV2.architecture} />
      </PublicSection>
      ) : null}


      {isPublicSectionVisible(settings, "why") ? (
      <PublicSection
        eyebrow={dict.publicHomeRedesign.sections.whyEyebrow}
        title={dict.public.home.whyTitle}
        description={dict.public.home.whyDescription}
      >
        <div className="grid gap-5 md:grid-cols-3">
          {whyCards.map((item) => (
            <HomeFeatureCard key={item.title} icon={item.icon} title={item.title} description={item.description} />
          ))}
        </div>
      </PublicSection>
      ) : null}

      {isPublicSectionVisible(settings, "process") ? (
      <PublicSection
        eyebrow={dict.publicHomeRedesign.sections.processEyebrow}
        title={dict.public.home.processTitle}
        description={dict.publicHomeRedesign.sections.processDescription}
      >
        <div className="grid gap-5 md:grid-cols-5">
          {process.map((item, index) => (
            <HomeProcessCard
              key={item.title}
              index={numberLabel(index, locale)}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </PublicSection>
      ) : null}

      {isPublicSectionVisible(settings, "technologies") ? (
      <PublicSection
        eyebrow={dict.publicHomeRedesign.sections.techEyebrow}
        title={dict.publicHomeRedesign.sections.techTitle}
        description={dict.publicHomeRedesign.sections.techDescription}
      >
        <div className="flex flex-wrap gap-3">
          {technologies.map((item) => (
            <HomeTechBadge key={item} label={item} />
          ))}
        </div>
      </PublicSection>
      ) : null}

      {isPublicSectionVisible(settings, "services") ? (
        <PublicSection title={dict.public.home.servicesTitle} description={dict.public.services.description}>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {(services.length > 0
              ? services.map((service) => publicServiceToCardView(locale, service))
              : isDemoContentEnabled()
                ? getFallbackServiceCards(locale)
                : [])
              .slice(0, 6)
              .map((service) => (
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
      ) : null}

      {products.length > 0 && isPublicSectionVisible(settings, "products") ? (
        <PublicSection title={dict.public.home.productsTitle}>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {products.slice(0, 6).map((product) => (
              <PublicItemCard
                key={product.id}
                title={pickLocalized(locale, product.name_ar, product.name_en)}
                description={pickLocalized(locale, product.short_description_ar, product.short_description_en)}
                href={`/${locale}/products/${pickSlug(locale, product.slug_ar, product.slug_en)}`}
                cta={dict.public.products.detailsCta}
                badge={formatPublicLabel(locale, product.status)}
                imageUrl={product.main_image_url}
              />
            ))}
          </div>
        </PublicSection>
      ) : null}

      {apps.length > 0 && isPublicSectionVisible(settings, "apps") ? (
        <PublicSection title={dict.public.apps.title} description={dict.public.apps.description}>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {apps.slice(0, 6).map((app) => (
              <PublicItemCard
                key={app.id}
                icon="apps"
                title={pickLocalized(locale, app.name_ar, app.name_en)}
                description={pickLocalized(locale, app.short_description_ar, app.short_description_en)}
                href={`/${locale}/apps/${pickSlug(locale, app.slug_ar, app.slug_en)}`}
                cta={dict.public.apps.detailsCta}
                badge={formatPublicLabel(locale, app.platform)}
                imageUrl={app.main_image_url || app.icon_url}
              />
            ))}
          </div>
        </PublicSection>
      ) : null}

      {portfolio.length > 0 && isPublicSectionVisible(settings, "portfolio") ? (
        <PublicSection title={dict.public.home.portfolioTitle}>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {portfolio.slice(0, 3).map((project) => (
              <PublicItemCard
                key={project.id}
                title={pickLocalized(locale, project.title_ar, project.title_en)}
                description={pickLocalized(locale, project.description_ar, project.description_en)}
                href={`/${locale}/portfolio/${pickSlug(locale, project.slug_ar, project.slug_en)}`}
                cta={dict.public.portfolio.detailsCta}
                imageUrl={project.main_image_url}
              />
            ))}
          </div>
        </PublicSection>
      ) : null}


      {testimonials.length > 0 && isPublicSectionVisible(settings, "testimonials") ? (
        <PublicSection
          title={dict.public.home.testimonialsTitle}
          description={locale === "ar" ? "مختارات من آراء العملاء التي يتم إدارتها من لوحة التحكم." : "Selected customer feedback managed from the admin panel."}
        >
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.slice(0, 3).map((item) => (
              <AppCard key={item.id} className="relative overflow-hidden p-6">
                <div className="pointer-events-none absolute -top-16 end-6 size-32 rounded-full bg-app-primary/10 blur-3xl" />
                <div className="relative grid gap-5">
                  <div className="flex items-center gap-1 text-app-primary" aria-label={`${item.rating}/5`}>
                    {Array.from({ length: Math.max(1, Math.min(5, Number(item.rating) || 5)) }).map((_, index) => (
                      <AppIcon key={index} name="star" size={16} />
                    ))}
                  </div>
                  <p className="leading-7 text-app-muted">{pickLocalized(locale, item.text_ar, item.text_en)}</p>
                  <div className="flex items-center gap-3 border-t border-app-border pt-4">
                    <span className="grid size-11 place-items-center rounded-full border border-app-border bg-app-surfaceElevated text-sm font-black text-app-primary">
                      {item.client_name?.trim()?.slice(0, 1) || "S"}
                    </span>
                    <div className="min-w-0">
                      <strong className="block truncate text-app-foreground">{item.client_name}</strong>
                      {item.company_name || item.position ? (
                        <span className="block truncate text-xs font-semibold text-app-muted">
                          {[item.position, item.company_name].filter(Boolean).join(" — ")}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </AppCard>
            ))}
          </div>
          <div className="mt-7 flex justify-center">
            <Link href={`/${locale}/testimonials`}>
              <AppButton variant="secondary" icon={<AppIcon name={locale === "ar" ? "previous" : "next"} size={17} />}>
                {locale === "ar" ? "عرض كل آراء العملاء" : "View all testimonials"}
              </AppButton>
            </Link>
          </div>
        </PublicSection>
      ) : null}

      {faqs.length > 0 && isPublicSectionVisible(settings, "faqs") ? (
        <PublicSection title={dict.public.home.faqTitle}>
          <div className="grid gap-4">
            {faqs.slice(0, 5).map((faq) => (
              <AppCard key={faq.id} className="p-5">
                <h3 className="text-lg font-black">{pickLocalized(locale, faq.question_ar, faq.question_en)}</h3>
                <p className="mt-2 text-app-muted">{pickLocalized(locale, faq.answer_ar, faq.answer_en)}</p>
              </AppCard>
            ))}
          </div>
        </PublicSection>
      ) : null}

      {isPublicSectionVisible(settings, "cta") ? (
      <PublicSection>
        <AppCard className="relative overflow-hidden p-8 text-center md:p-12">
          <div className="absolute inset-0 app-grid-bg opacity-20" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-3xl gap-5">
            <h2 className="text-balance text-3xl font-black md:text-5xl">{dict.public.home.ctaTitle}</h2>
            <p className="text-lg leading-8 text-app-muted">{dict.public.home.ctaDescription}</p>
            <div className="flex justify-center">
              <Link href={`/${locale}/quote-request`}>
                <AppButton size="lg">
                  {dict.public.home.primaryCta}
                  <AppIcon name="arrowUpRight" size={18} />
                </AppButton>
              </Link>
            </div>
          </div>
        </AppCard>
      </PublicSection>
      ) : null}
    </main>
  );
}
