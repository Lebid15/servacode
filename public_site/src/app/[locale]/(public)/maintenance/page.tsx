/**
 * =====================================================
 * صفحة الصيانة
 * =====================================================
 */

import Link from "next/link";

import { AppButton } from "@/shared/design-system/components/AppButton";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { PublicSection } from "@/shared/public/components/PublicSection";
import { getDictionary } from "@/shared/design-system/i18n/get-dictionary";
import type { Locale } from "@/shared/design-system/utils/direction";

type PageProps = { params: Promise<{ locale: Locale }> };

export default async function MaintenancePage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);

  return (
    <main>
      <PublicSection>
        <AppCard className="grid gap-4 p-8 text-center">
          <h1 className="text-4xl font-bold">{dict.public.system.maintenanceTitle}</h1>
          <p className="text-app-muted">{dict.public.system.maintenanceDescription}</p>
          <Link href={`/${locale}`}>
            <AppButton>{dict.public.system.backHome}</AppButton>
          </Link>
        </AppCard>
      </PublicSection>
    </main>
  );
}
