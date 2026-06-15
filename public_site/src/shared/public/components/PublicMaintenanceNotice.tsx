/**
 * =====================================================
 * PublicMaintenanceNotice
 * واجهة موحدة تظهر عندما يفعّل الأدمن وضع الصيانة
 * =====================================================
 */

import Link from "next/link";

import { AppButton } from "@/shared/design-system/components/AppButton";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppIcon } from "@/shared/design-system/components/AppIcon";
import { PublicSection } from "./PublicSection";
import type { Locale } from "@/shared/design-system/utils/direction";

type PublicMaintenanceNoticeProps = {
  locale: Locale;
  title: string;
  description: string;
  backHome: string;
};

export function PublicMaintenanceNotice({ locale, title, description, backHome }: PublicMaintenanceNoticeProps) {
  return (
    <PublicSection className="min-h-[58vh] place-items-center">
      <AppCard className="relative mx-auto grid max-w-2xl gap-6 overflow-hidden p-8 text-center md:p-12">
        <div className="absolute inset-0 app-grid-bg opacity-20" aria-hidden="true" />
        <div className="relative mx-auto grid h-16 w-16 place-items-center rounded-app2Xl border border-app-border bg-app-surfaceElevated shadow-appGlowSoft">
          <AppIcon name="settings" className="text-app-primary" size={28} />
        </div>
        <div className="relative grid gap-3">
          <h1 className="text-balance text-3xl font-black text-gradient md:text-5xl">{title}</h1>
          <p className="text-base font-semibold leading-8 text-app-muted md:text-lg">{description}</p>
        </div>
        <div className="relative flex justify-center">
          <Link href={`/${locale}`}>
            <AppButton variant="secondary">{backHome}</AppButton>
          </Link>
        </div>
      </AppCard>
    </PublicSection>
  );
}
