"use client";

/**
 * =====================================================
 * مزامنة اللغة والاتجاه مع document
 * تستخدم لأن html/body موجودان في Root Layout فقط
 * =====================================================
 */

import { useEffect } from "react";

import { localeToDirection, type Locale } from "@/shared/design-system/utils/direction";

type LocaleDocumentSyncProps = {
  locale: Locale;
};

export function LocaleDocumentSync({ locale }: LocaleDocumentSyncProps) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = localeToDirection(locale);
  }, [locale]);

  return null;
}
