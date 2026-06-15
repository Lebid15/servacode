"use client";

/**
 * =====================================================
 * PublicAnalyticsTracker
 * يسجل زيارات الموقع العام بشكل خفيف داخل الباكند
 * =====================================================
 */

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { trackPublicAnalyticsEvent } from "@/shared/api/public-client";
import type { Locale } from "@/shared/design-system/utils/direction";

type PublicAnalyticsTrackerProps = {
  locale: Locale;
};

export function PublicAnalyticsTracker({ locale }: PublicAnalyticsTrackerProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) {
      return;
    }

    trackPublicAnalyticsEvent({
      event_type: "page_view",
      path: pathname,
      locale,
      referrer: typeof document !== "undefined" ? document.referrer || undefined : undefined
    }).catch(() => {
      // لا نريد أن تؤثر التحليلات على تجربة الزائر في حال توقف API.
    });
  }, [pathname, locale]);

  return null;
}
