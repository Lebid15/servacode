import type { Metadata } from "next";

/**
 * =====================================================
 * صفحة طلب عرض سعر
 * تجربة احترافية لطلب مشروع برمجي
 * =====================================================
 */

import { AppBadge } from "@/shared/design-system/components/AppBadge";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppIcon } from "@/shared/design-system/components/AppIcon";
import { AppPageHeader } from "@/shared/design-system/components/AppPageHeader";
import { QuoteProjectTypeCard } from "@/shared/public/components/QuoteProjectTypeCard";
import { QuoteRequestForm } from "@/shared/public/components/QuoteRequestForm";
import { QuoteStepCard } from "@/shared/public/components/QuoteStepCard";
import { PublicSection } from "@/shared/public/components/PublicSection";
import { getDictionary } from "@/shared/design-system/i18n/get-dictionary";
import { buildLocalizedMetadata } from "@/shared/seo/metadata";
import type { Locale } from "@/shared/design-system/utils/direction";


export const dynamic = "force-dynamic";
type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

function numberLabel(index: number, locale: Locale) {
  const value = String(index + 1).padStart(2, "0");
  return locale === "ar" ? value.replace(/\d/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[Number(digit)]) : value;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);

  return buildLocalizedMetadata(locale, {
    title: dict.public.quote.title,
    description: dict.public.quote.description,
    path: `/${locale}/quote-request`
  });
}

export default async function QuoteRequestPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);

  const steps = [
    dict.publicQuoteRedesign.steps.review,
    dict.publicQuoteRedesign.steps.scope,
    dict.publicQuoteRedesign.steps.proposal
  ];

  const projectCards = [
    {
      icon: "globe" as const,
      title: dict.publicQuoteRedesign.projectCards.website.title,
      description: dict.publicQuoteRedesign.projectCards.website.description
    },
    {
      icon: "panels" as const,
      title: dict.publicQuoteRedesign.projectCards.webApp.title,
      description: dict.publicQuoteRedesign.projectCards.webApp.description
    },
    {
      icon: "monitor" as const,
      title: dict.publicQuoteRedesign.projectCards.desktop.title,
      description: dict.publicQuoteRedesign.projectCards.desktop.description
    },
    {
      icon: "dashboard" as const,
      title: dict.publicQuoteRedesign.projectCards.admin.title,
      description: dict.publicQuoteRedesign.projectCards.admin.description
    }
  ];

  return (
    <main>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 app-grid-bg opacity-25" aria-hidden="true" />
        <div className="app-container relative grid gap-10 py-16 lg:grid-cols-[1fr_0.86fr] lg:items-center">
          <div className="grid gap-7">
            <AppBadge tone="primary" className="gap-2">
              <AppIcon name="rocket" size={15} />
              {dict.publicQuoteRedesign.eyebrow}
            </AppBadge>
            <AppPageHeader title={dict.public.quote.title} description={dict.public.quote.description} />
          </div>

          <AppCard className="relative overflow-hidden p-6">
            <div className="absolute end-[-5rem] top-[-5rem] h-56 w-56 rounded-full bg-[hsl(var(--color-primary)/0.20)] blur-3xl" />
            <div className="relative grid gap-4">
              <h2 className="text-2xl font-black">{dict.publicQuoteRedesign.sideTitle}</h2>
              <p className="leading-7 text-app-muted">{dict.publicQuoteRedesign.sideDescription}</p>
              <div className="grid gap-3">
                {steps.map((item, index) => (
                  <div key={item.title} className="flex items-start gap-3 rounded-appLg border border-app-border bg-app-surface/72 p-4">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-appPill bg-[hsl(var(--color-primary)/0.12)] text-xs font-black text-app-primary">
                      {numberLabel(index, locale)}
                    </span>
                    <div>
                      <h3 className="font-black">{item.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-app-muted">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AppCard>
        </div>
      </section>

      <PublicSection
        eyebrow={dict.publicQuoteRedesign.projectTypesEyebrow}
        title={dict.publicQuoteRedesign.projectTypesTitle}
        description={dict.publicQuoteRedesign.projectTypesDescription}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {projectCards.map((item) => (
            <QuoteProjectTypeCard
              key={item.title}
              icon={item.icon}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </PublicSection>

      <PublicSection className="pt-4">
        <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="grid content-start gap-5">
            <AppCard className="grid gap-4 p-6">
              <h2 className="text-2xl font-black">{dict.publicQuoteRedesign.beforeTitle}</h2>
              <p className="leading-7 text-app-muted">{dict.publicQuoteRedesign.beforeDescription}</p>
              <div className="grid gap-3">
                {steps.map((item, index) => (
                  <QuoteStepCard
                    key={item.title}
                    index={numberLabel(index, locale)}
                    title={item.title}
                    description={item.description}
                  />
                ))}
              </div>
            </AppCard>
          </div>

          <QuoteRequestForm
            locale={locale}
            labels={{
              title: dict.publicQuoteRedesign.formTitle,
              description: dict.publicQuoteRedesign.formDescription,
              fullName: dict.fields.fullName,
              phone: dict.fields.phone,
              email: dict.fields.email,
              projectType: dict.public.quote.projectType,
              budget: dict.public.quote.budget,
              duration: dict.public.quote.duration,
              preferredContact: dict.public.quote.preferredContact,
              details: dict.publicQuoteRedesign.projectDetails,
              submit: dict.public.quote.submit,
              loading: dict.publicQuoteRedesign.loading,
              success: dict.public.quote.success,
              error: dict.publicQuoteRedesign.error,
              privacyNote: dict.publicQuoteRedesign.privacyNote,
              projectTypes: dict.publicQuoteRedesign.projectTypes,
              contactMethods: dict.publicQuoteRedesign.contactMethods
            }}
          />
        </div>
      </PublicSection>
    </main>
  );
}
