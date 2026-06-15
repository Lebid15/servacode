/**
 * =====================================================
 * Root Layout
 * الغلاف الأعلى الوحيد لـ html/body.
 * يضبط lang/dir من السيرفر حسب أول جزء من المسار عبر middleware.
 * =====================================================
 */

import type { Metadata } from "next";
import { headers } from "next/headers";
import { getSiteUrl, siteConfig } from "@/shared/seo/seo-config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: siteConfig.defaultTitle,
  description: siteConfig.defaultDescription
};

type RootLayoutProps = {
  children: React.ReactNode;
};

function normalizeLocaleFromPath(pathname: string | null): "ar" | "en" {
  const firstSegment = pathname?.split("/").filter(Boolean)[0];
  return firstSegment === "en" ? "en" : "ar";
}

const localeBootstrapScript = `
(function () {
  try {
    var firstSegment = window.location.pathname.split('/').filter(Boolean)[0];
    var locale = firstSegment === 'en' ? 'en' : 'ar';
    var direction = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
  } catch (_) {}
})();
`;

export default async function RootLayout({ children }: RootLayoutProps) {
  const requestHeaders = await headers();
  const locale = normalizeLocaleFromPath(requestHeaders.get("x-public-pathname"));
  const direction = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={direction} data-theme="blue-tech" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: localeBootstrapScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
