/**
 * =====================================================
 * صفحة 404 حسب اللغة
 * =====================================================
 */

import Link from "next/link";

import { AppButton } from "@/shared/design-system/components/AppButton";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { getDictionary } from "@/shared/design-system/i18n/get-dictionary";
import type { Locale } from "@/shared/design-system/utils/direction";

type NotFoundProps = {
  params?: {
    locale?: string;
  };
};

export default async function NotFound({ params }: NotFoundProps) {
  const locale = (params?.locale ?? "ar") as Locale;
  const dict = await getDictionary(locale);

  return (
    <main className="grid min-h-screen place-items-center p-6">
      <AppCard className="grid max-w-xl gap-4 p-8 text-center">
        <h1 className="text-4xl font-bold">{dict.public.system.notFoundTitle}</h1>
        <p className="text-app-muted">{dict.public.system.notFoundDescription}</p>
        <Link href={`/${locale}`}>
          <AppButton>{dict.public.system.backHome}</AppButton>
        </Link>
      </AppCard>
    </main>
  );
}
