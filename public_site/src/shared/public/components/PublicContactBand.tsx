/**
 * =====================================================
 * PublicContactBand
 * شريط تواصل مختصر يعتمد على بيانات منطقة الإدارة
 * =====================================================
 */

import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppIcon } from "@/shared/design-system/components/AppIcon";
import type { PublicSettings } from "@/shared/api/public-client";
import type { Locale } from "@/shared/design-system/utils/direction";
import { localizedSetting } from "@/shared/public/settings-utils";

type PublicContactBandProps = {
  locale: Locale;
  settings?: PublicSettings | null;
  labels: {
    email: string;
    phone: string;
    whatsapp: string;
    address: string;
  };
};

export function PublicContactBand({ locale, settings, labels }: PublicContactBandProps) {
  const address = localizedSetting(locale, settings?.address_ar, settings?.address_en);
  const items = [
    settings?.email ? { label: labels.email, value: settings.email, href: `mailto:${settings.email}`, icon: "mail" as const } : null,
    settings?.phone ? { label: labels.phone, value: settings.phone, href: `tel:${settings.phone}`, icon: "phone" as const } : null,
    settings?.whatsapp
      ? {
          label: labels.whatsapp,
          value: settings.whatsapp,
          href: `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`,
          icon: "message" as const
        }
      : null,
    address ? { label: labels.address, value: address, href: null, icon: "globe" as const } : null
  ].filter(Boolean) as Array<{
    label: string;
    value: string;
    href: string | null;
    icon: "mail" | "phone" | "message" | "globe";
  }>;

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="app-container -mt-4 pb-6 lg:-mt-8">
      <AppCard className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => {
          const content = (
            <>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-appPill border border-app-border bg-app-surfaceElevated">
                <AppIcon name={item.icon} className="text-app-primary" size={18} />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-black uppercase tracking-[0.16em] text-app-muted">{item.label}</span>
                <span className="block truncate text-sm font-black text-app-foreground">{item.value}</span>
              </span>
            </>
          );

          return item.href ? (
            <a key={`${item.label}-${item.value}`} href={item.href} className="flex items-center gap-3 rounded-appLg p-2 transition hover:bg-app-surfaceElevated">
              {content}
            </a>
          ) : (
            <div key={`${item.label}-${item.value}`} className="flex items-center gap-3 rounded-appLg p-2">
              {content}
            </div>
          );
        })}
      </AppCard>
    </section>
  );
}
