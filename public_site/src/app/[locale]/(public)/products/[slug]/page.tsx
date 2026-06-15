import type { Metadata } from "next";

/**
 * =====================================================
 * صفحة تفاصيل المنتج
 * تصميم احترافي لمنتج برمجي
 * =====================================================
 */

import { notFound } from "next/navigation";

import { getPublicProduct } from "@/shared/api/public-client";
import { findDemoProduct, isDemoContentEnabled } from "@/shared/public/demo-content";
import { JsonLd } from "@/shared/seo/json-ld";
import { productJsonLd } from "@/shared/seo/structured-data";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { ContentBlockCard } from "@/shared/public/components/ContentBlockCard";
import { DetailCTA } from "@/shared/public/components/DetailCTA";
import { DetailFeatureCard } from "@/shared/public/components/DetailFeatureCard";
import { DynamicDetailHero } from "@/shared/public/components/DynamicDetailHero";
import { PublicSection } from "@/shared/public/components/PublicSection";
import { PublicOptimizedImage } from "@/shared/public/components/PublicOptimizedImage";
import { getDictionary } from "@/shared/design-system/i18n/get-dictionary";
import { pickLocalized } from "@/shared/public/public-utils";
import { formatPublicLabels } from "@/shared/public/public-labels";
import type { Locale } from "@/shared/design-system/utils/direction";
import { buildLocalizedMetadata } from "@/shared/seo/metadata";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = rawLocale as Locale;
  const item = await getPublicProduct(slug).catch(() => null) ?? (isDemoContentEnabled() ? findDemoProduct(locale, slug) : null);

  if (!item) {
    return buildLocalizedMetadata(locale, {
      title: slug,
      description: slug,
      path: `/${locale}/products/${slug}`
    });
  }

  return buildLocalizedMetadata(locale, {
    title: pickLocalized(locale, item.name_ar, item.name_en),
    description: pickLocalized(locale, item.short_description_ar, item.short_description_en),
    path: `/${locale}/products/${slug}`
  });
}

export default async function ProductDetailsPage({ params }: PageProps) {
  const { locale: rawLocale, slug } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const product = await getPublicProduct(slug).catch(() => null) ?? (isDemoContentEnabled() ? findDemoProduct(locale, slug) : null);

  if (!product) {
    notFound();
  }

  const title = pickLocalized(locale, product.name_ar, product.name_en);
  const description = pickLocalized(locale, product.full_description_ar || product.short_description_ar, product.full_description_en || product.short_description_en);
  const features = product.features ?? [];
  const galleryImages = (product.images ?? []).filter((image) => Boolean(image.image_url));
  const targetAudience = pickLocalized(locale, product.target_audience_ar, product.target_audience_en);
  const requirements = pickLocalized(locale, product.requirements_ar, product.requirements_en);

  return (
    <main>
      <JsonLd data={productJsonLd(locale, title, description, `/${locale}/products/${slug}`)} />
      <DynamicDetailHero
        locale={locale}
        eyebrow={dict.publicDynamic.product.eyebrow}
        title={title}
        description={description}
        icon="rocket"
        primaryCta={dict.publicDynamic.common.primaryCta}
        secondaryCta={dict.publicDynamic.common.secondaryCta}
        badges={formatPublicLabels(locale, [product.product_type, product.status])}
      />

      <PublicSection
        eyebrow={dict.publicDynamic.product.detailsEyebrow}
        title={dict.publicDynamic.product.detailsTitle}
        description={dict.publicDynamic.product.detailsDescription}
      >
        <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="grid gap-5">
            <ContentBlockCard
              icon="rocket"
              title={dict.publicDynamic.product.overviewTitle}
              content={description}
            />
            <ContentBlockCard
              icon="user"
              title={locale === "ar" ? "لمن يناسب هذا النظام؟" : "Who is this system for?"}
              content={targetAudience}
            />
            <ContentBlockCard
              icon="settings"
              title={locale === "ar" ? "المتطلبات" : "Requirements"}
              content={requirements}
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {(features.length > 0
              ? features.map((feature) => ({
                  id: feature.id,
                  title: pickLocalized(locale, feature.title_ar, feature.title_en),
                  description: pickLocalized(locale, feature.description_ar, feature.description_en)
                }))
              : dict.publicDynamic.product.defaultFeatures
            ).map((feature) => (
              <DetailFeatureCard
                key={feature.id ?? feature.title}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </PublicSection>

      {galleryImages.length > 0 ? (
        <PublicSection
          title={locale === "ar" ? "صور ومعاينات النظام" : "System previews"}
          description={locale === "ar" ? "لقطات تساعد الزائر على فهم شكل النظام وطريقة عرضه." : "Preview images that help visitors understand the system presentation."}
        >
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {galleryImages.map((image, index) => (
              <AppCard key={`${image.image_url}-${index}`} className="relative h-64 overflow-hidden p-0">
                <PublicOptimizedImage
                  src={image.image_url}
                  alt={pickLocalized(locale, image.alt_text_ar, image.alt_text_en) || title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="rounded-none border-0 shadow-none"
                />
              </AppCard>
            ))}
          </div>
        </PublicSection>
      ) : null}

      {(product.faqs ?? []).length > 0 ? (
        <PublicSection title={dict.publicDynamic.product.faqTitle}>
          <div className="grid gap-4">
            {(product.faqs ?? []).map((faq) => (
              <AppCard key={faq.id} className="p-5">
                <h3 className="text-lg font-black">{pickLocalized(locale, faq.question_ar, faq.question_en)}</h3>
                <p className="mt-2 leading-7 text-app-muted">{pickLocalized(locale, faq.answer_ar, faq.answer_en)}</p>
              </AppCard>
            ))}
          </div>
        </PublicSection>
      ) : null}

      <PublicSection>
        <DetailCTA
          locale={locale}
          title={dict.publicDynamic.product.ctaTitle}
          description={dict.publicDynamic.product.ctaDescription}
          button={dict.publicDynamic.common.primaryCta}
        />
      </PublicSection>
    </main>
  );
}
