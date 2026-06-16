/**
 * =====================================================
 * Root Layout
 * هذا الملف هو الغلاف الأعلى الوحيد الذي يحتوي html/body في Next.js
 * =====================================================
 */

import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

function getMetadataBase(): URL {
  const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";

  try {
    return new URL(rawUrl);
  } catch {
    return new URL("http://localhost:3001");
  }
}

function normalizeLocale(value: string | null): "ar" | "en" {
  return value === "en" ? "en" : "ar";
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

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: "ServaCode — Management Console",
  description: "Management console for the ServaCode website"
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
  const requestHeaders = await headers();
  const locale = normalizeLocale(requestHeaders.get("x-admin-locale"));
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
