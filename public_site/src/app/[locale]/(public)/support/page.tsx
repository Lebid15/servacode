import type { Metadata } from "next";

/**
 * =====================================================
 * صفحة الدعم
 * قناة واضحة لمساعدة مستخدمي التطبيقات والمنتجات.
 * =====================================================
 */

import { getPublicApps, getPublicSettings } from "@/shared/api/public-client";
import { AppBadge } from "@/shared/design-system/components/AppBadge";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppIcon } from "@/shared/design-system/components/AppIcon";
import { AppPageHeader } from "@/shared/design-system/components/AppPageHeader";
import { getDictionary } from "@/shared/design-system/i18n/get-dictionary";
import type { Locale } from "@/shared/design-system/utils/direction";
import { PublicSection } from "@/shared/public/components/PublicSection";
import { SupportRequestForm } from "@/shared/public/components/SupportRequestForm";
import { buildLocalizedMetadata } from "@/shared/seo/metadata";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ locale: string }> };

function emailHref(value: string | null | undefined) {
  return value ? `mailto:${value}` : undefined;
}

function phoneHref(value: string | null | undefined) {
  const cleaned = value?.replace(/[^+\d]/g, "");
  return cleaned ? `tel:${cleaned}` : undefined;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);

  return buildLocalizedMetadata(locale, {
    title: dict.public.support.title,
    description: dict.public.support.description,
    path: `/${locale}/support`
  });
}

export default async function SupportPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const [settings, apps] = await Promise.all([getPublicSettings().catch(() => null), getPublicApps().catch(() => [])]);

  const supportChannels = [
    settings?.support_email || settings?.email
      ? {
          icon: "mail" as const,
          label: dict.fields.email,
          value: settings?.support_email || settings?.email,
          href: emailHref(settings?.support_email || settings?.email)
        }
      : null,
    settings?.support_phone || settings?.phone
      ? {
          icon: "phone" as const,
          label: dict.fields.phone,
          value: settings?.support_phone || settings?.phone,
          href: phoneHref(settings?.support_phone || settings?.phone)
        }
      : null
  ].filter(Boolean) as Array<{ icon: "mail" | "phone"; label: string; value?: string | null; href?: string }>;

  return (
    <main>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 app-grid-bg opacity-25" aria-hidden="true" />
        <div className="app-container relative grid gap-10 py-16 lg:grid-cols-[1fr_0.82fr] lg:items-center">
          <div className="grid gap-7">
            <AppBadge tone="primary" className="gap-2">
              <AppIcon name="support" size={15} />
              {dict.public.support.eyebrow}
            </AppBadge>
            <AppPageHeader title={dict.public.support.title} description={dict.public.support.description} />
          </div>

          <AppCard className="grid gap-4 p-6">
            <h2 className="text-2xl font-black">{dict.public.support.channelsTitle}</h2>
            <p className="leading-7 text-app-muted">{dict.public.support.channelsDescription}</p>
            <div className="grid gap-3">
              {supportChannels.length > 0 ? supportChannels.map((item) => (
                <a key={item.label} href={item.href} className="flex items-center gap-3 rounded-appLg border border-app-border bg-app-surfaceElevated p-4 transition hover:border-app-primary hover:text-app-primary">
                  <span className="grid h-10 w-10 place-items-center rounded-appPill border border-app-border bg-app-surface">
                    <AppIcon name={item.icon} size={18} />
                  </span>
                  <span className="grid gap-1">
                    <span className="text-xs font-bold text-app-muted">{item.label}</span>
                    <span className="font-black">{item.value}</span>
                  </span>
                </a>
              )) : (
                <p className="rounded-appLg border border-app-border bg-app-surfaceElevated p-4 text-sm font-bold text-app-muted">
                  {dict.public.support.noChannels}
                </p>
              )}
            </div>
          </AppCard>
        </div>
      </section>

      <PublicSection className="pt-4">
        <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="grid content-start gap-5">
            <AppCard className="grid gap-4 p-6">
              <h2 className="text-2xl font-black">{dict.public.support.beforeTitle}</h2>
              <p className="leading-7 text-app-muted">{dict.public.support.beforeDescription}</p>
              <div className="grid gap-3">
                {dict.public.support.tips.map((item: string) => (
                  <div key={item} className="flex items-start gap-3 rounded-appLg border border-app-border bg-app-surface/72 p-4 text-sm font-bold text-app-muted">
                    <AppIcon name="check" className="mt-0.5 text-app-primary" size={17} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </AppCard>
          </div>

          <SupportRequestForm
            locale={locale}
            apps={apps}
            labels={{
              title: dict.public.support.formTitle,
              description: dict.public.support.formDescription,
              fullName: dict.fields.fullName,
              phone: dict.fields.phone,
              email: dict.fields.email,
              app: dict.public.support.app,
              subject: dict.fields.subject,
              message: dict.fields.message,
              priority: dict.fields.priority,
              submit: dict.public.support.submit,
              loading: dict.public.support.loading,
              success: dict.public.support.success,
              error: dict.public.support.error,
              privacyNote: dict.public.support.privacyNote,
              noApp: dict.public.support.noApp,
              priorities: dict.public.support.priorities
            }}
          />
        </div>
      </PublicSection>
    </main>
  );
}
