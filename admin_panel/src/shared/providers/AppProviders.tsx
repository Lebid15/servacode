"use client";

/**
 * =====================================================
 * مزودات التطبيق المركزية
 * تجمع React Query و i18n و Theme و Admin Auth في مكان واحد
 * =====================================================
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { AdminAuthProvider } from "@/shared/auth/AdminAuthProvider";
import { I18nProvider } from "@/shared/design-system/i18n/i18n-provider";
import { ThemeProvider, type ThemeName } from "@/shared/design-system/themes/theme-provider";
import type { Locale } from "@/shared/design-system/utils/direction";

type AppProvidersProps = {
  children: React.ReactNode;
  locale: Locale;
  initialTheme: ThemeName;
};

export function AppProviders({ children, locale, initialTheme }: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            retry: 1,
            refetchOnWindowFocus: false
          }
        }
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider locale={locale}>
        <ThemeProvider initialTheme={initialTheme}>
          <AdminAuthProvider>{children}</AdminAuthProvider>
        </ThemeProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}
