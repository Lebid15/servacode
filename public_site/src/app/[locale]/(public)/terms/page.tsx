import type { Metadata } from "next";

/**
 * =====================================================
 * صفحة الشروط والأحكام
 * تقرأ المحتوى من الصفحات الثابتة في الباكند مع fallback آمن.
 * =====================================================
 */

import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppPageHeader } from "@/shared/design-system/components/AppPageHeader";
import { getDictionary } from "@/shared/design-system/i18n/get-dictionary";
import type { Locale } from "@/shared/design-system/utils/direction";
import { getPublicStaticPage } from "@/shared/api/public-client";
import { PublicSection } from "@/shared/public/components/PublicSection";
import { buildLocalizedMetadata } from "@/shared/seo/metadata";

type PageProps = { params: Promise<{ locale: Locale }> };

async function loadTermsPage() {
  try {
    return await getPublicStaticPage("terms");
  } catch {
    return null;
  }
}

function paragraphsFrom(content?: string | null, fallback: string[] = []) {
  const items = String(content ?? "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  return items.length > 0 ? items : fallback;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const page = await loadTermsPage();

  return buildLocalizedMetadata(locale, {
    title: (locale === "ar" ? page?.seo_title_ar || page?.title_ar : page?.seo_title_en || page?.title_en) || dict.public.legal.termsTitle,
    description: (locale === "ar" ? page?.seo_description_ar : page?.seo_description_en) || dict.public.legal.termsBody[0],
    path: `/${locale}/terms`
  });
}

export default async function TermsPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const page = await loadTermsPage();

  const title = (locale === "ar" ? page?.title_ar : page?.title_en) || dict.public.legal.termsTitle;
  const paragraphs = paragraphsFrom(locale === "ar" ? page?.content_ar : page?.content_en, dict.public.legal.termsBody);

  return (
    <main>
      <PublicSection>
        <AppPageHeader title={title} />
        <AppCard className="grid gap-4 p-6 leading-8 text-app-muted">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </AppCard>
      </PublicSection>
    </main>
  );
}
