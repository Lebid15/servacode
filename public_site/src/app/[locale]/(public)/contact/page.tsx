import type { Metadata } from "next";

/**
 * =====================================================
 * صفحة التواصل
 * صفحة تواصل احترافية لشركة برمجيات
 * =====================================================
 */

import { ContactForm } from "@/shared/public/components/ContactForm";
import { ContactInfoCard } from "@/shared/public/components/ContactInfoCard";
import { ContactTrustCard } from "@/shared/public/components/ContactTrustCard";
import { getPublicSettings } from "@/shared/api/public-client";
import { AppBadge } from "@/shared/design-system/components/AppBadge";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppIcon } from "@/shared/design-system/components/AppIcon";
import { AppPageHeader } from "@/shared/design-system/components/AppPageHeader";
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

function cleanValue(value: string | null | undefined, fallback: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

function phoneHref(value: string | null | undefined) {
  const cleaned = value?.replace(/[^+\d]/g, "");
  return cleaned ? `tel:${cleaned}` : undefined;
}

function emailHref(value: string | null | undefined) {
  return value ? `mailto:${value}` : undefined;
}

function whatsappHref(value: string | null | undefined) {
  const cleaned = value?.replace(/[^\d]/g, "");
  return cleaned ? `https://wa.me/${cleaned}` : undefined;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);

  return buildLocalizedMetadata(locale, {
    title: dict.public.contact.title,
    description: dict.public.contact.description,
    path: `/${locale}/contact`
  });
}

export default async function ContactPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const settings = await getPublicSettings().catch(() => null);

  const address = cleanValue(
    locale === "ar" ? settings?.address_ar : settings?.address_en,
    dict.publicContactRedesign.fallback
  );

  const contactItems = [
    {
      icon: "phone" as const,
      label: dict.fields.phone,
      value: cleanValue(settings?.phone, dict.publicContactRedesign.fallback),
      hint: dict.publicContactRedesign.phoneHint,
      href: phoneHref(settings?.phone)
    },
    {
      icon: "message" as const,
      label: dict.fields.whatsapp,
      value: cleanValue(settings?.whatsapp, dict.publicContactRedesign.fallback),
      hint: dict.publicContactRedesign.whatsappHint,
      href: whatsappHref(settings?.whatsapp)
    },
    {
      icon: "mail" as const,
      label: dict.fields.email,
      value: cleanValue(settings?.email, dict.publicContactRedesign.fallback),
      hint: dict.publicContactRedesign.emailHint,
      href: emailHref(settings?.email)
    },
    {
      icon: "support" as const,
      label: locale === "ar" ? "الدعم" : "Support",
      value: cleanValue(settings?.support_email || settings?.support_phone, dict.publicContactRedesign.fallback),
      hint: locale === "ar" ? "قناة مخصصة لدعم مستخدمي التطبيقات والمنتجات." : "Dedicated channel for app and product support.",
      href: emailHref(settings?.support_email) || phoneHref(settings?.support_phone)
    },
    {
      icon: "globe" as const,
      label: locale === "ar" ? "ساعات العمل" : "Working hours",
      value: cleanValue(locale === "ar" ? settings?.working_hours_ar : settings?.working_hours_en, dict.publicContactRedesign.fallback),
      hint: locale === "ar" ? "الأوقات التي نتابع فيها الرسائل والطلبات." : "Times when we review messages and requests.",
      href: undefined
    }
  ];

  const trustItems = [
    {
      icon: "shield" as const,
      title: dict.publicContactRedesign.trust.privacy.title,
      description: dict.publicContactRedesign.trust.privacy.description
    },
    {
      icon: "workflow" as const,
      title: dict.publicContactRedesign.trust.review.title,
      description: dict.publicContactRedesign.trust.review.description
    },
    {
      icon: "rocket" as const,
      title: dict.publicContactRedesign.trust.next.title,
      description: dict.publicContactRedesign.trust.next.description
    }
  ];

  return (
    <main>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 app-grid-bg opacity-25" aria-hidden="true" />
        <div className="app-container relative grid gap-10 py-16 lg:grid-cols-[1fr_0.82fr] lg:items-center">
          <div className="grid gap-7">
            <AppBadge tone="primary" className="gap-2">
              <AppIcon name="message" size={15} />
              {dict.publicContactRedesign.eyebrow}
            </AppBadge>
            <AppPageHeader title={dict.public.contact.title} description={dict.public.contact.description} />
          </div>

          <AppCard className="grid gap-4 p-6">
            <h2 className="text-2xl font-black">{dict.publicContactRedesign.responseTitle}</h2>
            <p className="leading-7 text-app-muted">{dict.publicContactRedesign.responseDescription}</p>
            <div className="rounded-appXl border border-app-border bg-app-surfaceElevated/75 p-4">
              <span className="text-sm font-black text-app-muted">{dict.publicContactRedesign.address}</span>
              <p className="mt-1 font-bold">{address}</p>
              {settings?.map_url ? (
                <a className="mt-3 inline-flex text-sm font-black text-app-primary" href={settings.map_url} target="_blank" rel="noreferrer">
                  {locale === "ar" ? "فتح الموقع على الخريطة" : "Open location map"}
                </a>
              ) : null}
            </div>
          </AppCard>
        </div>
      </section>

      <PublicSection className="pt-4">
        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="grid content-start gap-5">
            <div className="grid gap-4">
              {contactItems.map((item) => (
                <ContactInfoCard
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  value={item.value}
                  hint={item.hint}
                  href={item.href}
                />
              ))}
            </div>

            <AppCard className="grid gap-4 p-5">
              <h2 className="text-xl font-black">{dict.publicContactRedesign.trustTitle}</h2>
              <div className="grid gap-3">
                {trustItems.map((item) => (
                  <ContactTrustCard
                    key={item.title}
                    icon={item.icon}
                    title={item.title}
                    description={item.description}
                  />
                ))}
              </div>
            </AppCard>
          </div>

          <ContactForm
            locale={locale}
            labels={{
              title: dict.publicContactRedesign.formTitle,
              description: dict.publicContactRedesign.formDescription,
              fullName: dict.fields.fullName,
              phone: dict.fields.phone,
              email: dict.fields.email,
              subject: dict.fields.subject,
              message: dict.fields.message,
              submit: dict.public.contact.submit,
              loading: dict.publicContactRedesign.loading,
              success: dict.public.contact.success,
              error: dict.publicContactRedesign.error,
              privacyNote: dict.publicContactRedesign.privacyNote
            }}
          />
        </div>
      </PublicSection>
    </main>
  );
}
