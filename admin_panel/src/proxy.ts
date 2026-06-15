/**
 * =====================================================
 * Admin proxy guards
 * يضبط لغة الطلب مبكرًا، ويوقف روابط إعدادات غير موجودة حتى ترجع 404 حقيقية.
 * =====================================================
 */

import { NextResponse, type NextRequest } from "next/server";

const locales = new Set(["ar", "en"]);
const settingsTabs = new Set([
  "identity",
  "contact",
  "social",
  "seo",
  "appearance",
  "maintenance",
]);

export function proxy(request: NextRequest) {
  const segments = request.nextUrl.pathname.split("/").filter(Boolean);
  const [localeSegment, adminSegment, settingsSegment, tab, ...rest] = segments;
  const locale = localeSegment === "en" ? "en" : "ar";

  if (
    locales.has(localeSegment) &&
    adminSegment === "admin" &&
    settingsSegment === "settings" &&
    tab &&
    !settingsTabs.has(tab)
  ) {
    return new NextResponse(null, { status: 404 });
  }

  if (
    locales.has(localeSegment) &&
    adminSegment === "admin" &&
    settingsSegment === "settings" &&
    tab &&
    settingsTabs.has(tab) &&
    rest.length > 0
  ) {
    return new NextResponse(null, { status: 404 });
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-admin-locale", locale);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|opengraph-image).*)",
  ],
};
