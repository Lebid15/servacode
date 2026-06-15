/**
 * =====================================================
 * Middleware
 * يمرر مسار الصفحة إلى RootLayout حتى يتم ضبط lang/dir من السيرفر.
 * هذا يحسن SSR/SEO للغتين العربية والإنجليزية.
 * =====================================================
 */

import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-public-pathname", request.nextUrl.pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png|robots.txt|sitemap.xml|manifest.webmanifest).*)"]
};
