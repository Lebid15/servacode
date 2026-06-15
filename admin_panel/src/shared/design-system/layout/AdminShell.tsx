"use client";

/**
 * =====================================================
 * AdminShell
 * هيكل لوحة إدارة حديثة: سايدبار مختصر + مراكز عمل ذكية + تبويبات داخلية + توب بار نظيف
 * =====================================================
 */

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { getUnreadNotificationsCount } from "@/shared/api/admin-client";
import { getPublicBrandingSettings } from "@/shared/api/auth-client";
import { buildBackendAssetUrl } from "@/shared/api/api-client";
import { useAdminAuth } from "@/shared/auth/AdminAuthProvider";
import { AppBadge } from "@/shared/design-system/components/AppBadge";
import { AppButton } from "@/shared/design-system/components/AppButton";
import { AppIcon, type IconName } from "@/shared/design-system/components/AppIcon";
import { AppLogo } from "@/shared/design-system/components/AppLogo";
import { LanguageSwitcher } from "@/shared/design-system/components/LanguageSwitcher";
import { ThemeSwitcher } from "@/shared/design-system/components/ThemeSwitcher";
import type { ThemeName } from "@/shared/design-system/themes/theme-provider";
import { cn } from "@/shared/design-system/utils/cn";
import type { Locale } from "@/shared/design-system/utils/direction";

type AdminNavItem = {
  href: string;
  label: string;
  icon: IconName;
  matchHrefs?: string[];
};

type AdminTabGroup = {
  key: string;
  label: string;
  description?: string;
  baseHref?: string;
  items: AdminNavItem[];
};

type AdminNavSection = {
  key: string;
  label?: string;
  icon?: IconName;
  items: AdminNavItem[];
  collapsible?: boolean;
  defaultOpen?: boolean;
};

type AdminShellLabels = {
  brand: string;
  panel: string;
  logout: string;
  openWebsite: string;
  switchLanguage: string;
  switchTheme: string;
  user: string;
  navigation?: string;
  menu?: string;
  closeMenu?: string;
  profile?: string;
  themes: Record<ThemeName, string>;
};

type AdminShellProps = {
  children: React.ReactNode;
  locale: Locale;
  labels: AdminShellLabels;
  navItems?: AdminNavItem[];
  navSections?: AdminNavSection[];
  tabGroups?: AdminTabGroup[];
};

function isHrefActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isItemActive(pathname: string, itemOrHref: AdminNavItem | string) {
  if (typeof itemOrHref === "string") {
    return isHrefActive(pathname, itemOrHref);
  }

  return isHrefActive(pathname, itemOrHref.href) || Boolean(itemOrHref.matchHrefs?.some((href) => isHrefActive(pathname, href)));
}

function getAllNavItems(sections: AdminNavSection[]) {
  return sections.flatMap((section) => section.items);
}


function getCurrentItem(pathname: string, sections: AdminNavSection[], tabGroups: AdminTabGroup[]) {
  const tabItem = tabGroups
    .flatMap((group) => group.items)
    .filter((item) => isItemActive(pathname, item))
    .sort((first, second) => second.href.length - first.href.length)[0];

  if (tabItem) {
    return tabItem;
  }

  return getAllNavItems(sections)
    .filter((item) => isItemActive(pathname, item))
    .sort((first, second) => second.href.length - first.href.length)[0];
}

function getActiveTabGroup(pathname: string, tabGroups: AdminTabGroup[]) {
  return tabGroups.find((group) => {
    const baseActive = group.baseHref ? isHrefActive(pathname, group.baseHref) : false;
    const itemActive = group.items.some((item) => isItemActive(pathname, item));
    return baseActive || itemActive;
  });
}

function localizedBrandValue(locale: Locale, ar?: string | null, en?: string | null, fallback = "") {
  const primary = locale === "ar" ? ar : en;
  const secondary = locale === "ar" ? en : ar;

  return primary?.trim() || secondary?.trim() || fallback;
}

function getBrandLogoUrl(settings: Awaited<ReturnType<typeof getPublicBrandingSettings>> | undefined) {
  return settings?.logo_url || settings?.favicon_url || settings?.site_icon_url || settings?.icon_url || settings?.brand_icon_url || null;
}

function AdminSectionTabs({ group, pathname }: { group: AdminTabGroup; pathname: string }) {
  const activeItem = group.items.find((item) => isItemActive(pathname, item));

  return (
    <section className="relative overflow-visible rounded-app2xl border border-app-border bg-app-surface/92 p-5 shadow-appCard backdrop-blur-xl">
      <div className="pointer-events-none absolute -top-20 end-10 size-48 rounded-full bg-app-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 start-12 size-48 rounded-full bg-app-primary/5 blur-3xl" />

      <div className="relative grid gap-4 xl:grid-cols-[minmax(14rem,0.55fr)_minmax(0,2fr)] xl:items-center">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-appLg border border-app-primary/25 bg-app-primary/12 text-app-primary shadow-appGlow">
              <AppIcon name={activeItem?.icon ?? group.items[0]?.icon ?? "dashboard"} size={20} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-lg font-black text-app-foreground">{group.label}</p>
              {activeItem ? <p className="truncate text-xs font-bold text-app-primary">{activeItem.label}</p> : null}
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {group.items.map((item) => {
              const active = isItemActive(pathname, item);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full border border-app-border bg-app-surfaceElevated/80 px-4 text-sm font-black text-app-muted transition duration-200 hover:-translate-y-0.5 hover:border-app-primary/40 hover:bg-app-surface hover:text-app-foreground hover:shadow-appCard",
                    active && "border-app-primary bg-app-primary text-app-primaryForeground shadow-appGlow hover:bg-app-primary hover:text-app-primaryForeground"
                  )}
                >
                  <AppIcon name={item.icon} size={17} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function WorkspaceNavigation({
  sections,
  pathname,
  onNavigate
}: {
  sections: AdminNavSection[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="grid content-start gap-4 overflow-y-auto pe-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Admin navigation">
      {sections.map((section) => (
        <div key={section.key} className="grid gap-2.5">
          {section.label ? (
            <div className="flex items-center gap-3 px-2">
              {section.icon ? (
                <span className="grid size-6 shrink-0 place-items-center rounded-full border border-app-border bg-app-surfaceElevated text-app-primary">
                  <AppIcon name={section.icon} size={13} />
                </span>
              ) : null}
              <span className="truncate text-[11px] font-black uppercase tracking-[0.18em] text-app-muted/75">
                {section.label}
              </span>
              <span className="h-px min-w-8 flex-1 bg-app-border/70" />
            </div>
          ) : null}

          <div className="grid gap-1.5">
            {section.items.map((item) => {
              const active = isItemActive(pathname, item);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex min-h-12 items-center gap-3 overflow-hidden rounded-appXl border border-transparent px-3 py-2 text-sm font-black text-app-muted transition duration-200 hover:border-app-primary/25 hover:bg-app-surfaceElevated/90 hover:text-app-foreground hover:shadow-appCard",
                    active && "border-app-primary/35 bg-app-primary/12 text-app-foreground shadow-appCard"
                  )}
                >
                  <span
                    className={cn(
                      "absolute inset-y-2 start-0 w-1 rounded-full bg-app-primary opacity-0 transition duration-200",
                      active && "opacity-100"
                    )}
                  />
                  <span className={cn("pointer-events-none absolute inset-0 opacity-0 transition duration-200", active && "bg-gradient-to-r from-app-primary/12 via-app-primary/5 to-transparent opacity-100")} />
                  <span
                    className={cn(
                      "relative grid size-9 shrink-0 place-items-center rounded-appLg border border-app-border bg-app-surface text-app-primary transition duration-200 group-hover:scale-105 group-hover:border-app-primary/35 group-hover:bg-app-primary/10",
                      active && "border-app-primary/45 bg-app-primary text-app-primaryForeground shadow-appGlow"
                    )}
                  >
                    <AppIcon name={item.icon} size={17} />
                  </span>
                  <span className="relative min-w-0 flex-1 truncate">{item.label}</span>
                  <AppIcon
                    name="next"
                    size={14}
                    className={cn("relative shrink-0 text-app-muted opacity-0 transition duration-200 group-hover:opacity-100", active && "opacity-100 text-app-primary")}
                  />
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function UserAvatar({ user, sizeClass = "size-11" }: { user: ReturnType<typeof useAdminAuth>["user"]; sizeClass?: string }) {
  const avatarUrl = buildBackendAssetUrl(user?.avatar_url);
  const initial = String(user?.full_name || user?.username || "A").trim().slice(0, 1).toUpperCase();

  return (
    <span className={cn("grid shrink-0 place-items-center overflow-hidden rounded-full border border-app-primary/35 bg-app-primary/12 text-sm font-black text-app-primary shadow-appGlow", sizeClass)}>
      {avatarUrl ? <span className="size-full bg-cover bg-center" style={{ backgroundImage: `url(${avatarUrl})` }} /> : initial}
    </span>
  );
}

function UserSummary({
  locale,
  labels,
  user,
  roleLabel
}: {
  locale: Locale;
  labels: AdminShellLabels;
  user: ReturnType<typeof useAdminAuth>["user"];
  roleLabel?: string | null;
}) {
  const statusText = locale === "ar" ? "جلسة نشطة" : "Active session";

  return (
    <Link href={`/${locale}/admin/profile`} className="relative block overflow-hidden rounded-app2xl border border-app-border bg-app-surfaceElevated/85 p-3 shadow-appCard transition hover:-translate-y-0.5 hover:border-app-primary/35">
      <div className="pointer-events-none absolute -end-8 -top-8 size-24 rounded-full bg-app-primary/10 blur-2xl" />
      <div className="relative flex items-center gap-3">
        <UserAvatar user={user} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-app-foreground">{user?.full_name ?? user?.username ?? labels.user}</p>
          <p className="truncate text-xs text-app-muted">@{user?.username ?? labels.user}</p>
        </div>
        <AppIcon name="settings" size={15} className="shrink-0 text-app-muted" />
      </div>
      <div className="relative mt-3 flex flex-wrap items-center gap-2">
        <AppBadge tone={user?.is_superuser ? "primary" : "neutral"}>
          {user?.is_superuser ? labels.profile ?? labels.user : roleLabel ?? labels.user}
        </AppBadge>
        <AppBadge tone="success">{statusText}</AppBadge>
      </div>
    </Link>
  );
}

export function AdminShell({ children, locale, labels, navItems = [], navSections, tabGroups = [] }: AdminShellProps) {
  const publicSiteUrl = process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || "http://localhost:3000";
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, tokens } = useAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isRtl = locale === "ar";

  const sections: AdminNavSection[] = useMemo(
    () => (navSections?.length ? navSections : [{ key: "main", items: navItems, collapsible: false }]),
    [navSections, navItems]
  );

  const activeTabGroup = getActiveTabGroup(pathname, tabGroups);
  const currentItem = getCurrentItem(pathname, sections, tabGroups);
  const roleLabel = locale === "ar" ? user?.role?.display_name_ar : user?.role?.display_name_en;
  const token = tokens?.access_token ?? "";
  const unreadNotificationsQuery = useQuery({
    queryKey: ["admin-notifications-unread-count"],
    queryFn: () => getUnreadNotificationsCount(token),
    enabled: Boolean(token),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
  const unreadNotificationsCount = unreadNotificationsQuery.data?.unread_count ?? 0;

  const brandingQuery = useQuery({
    queryKey: ["admin-public-branding-settings"],
    queryFn: getPublicBrandingSettings,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const brandSettings = brandingQuery.data;
  const brandTitle = localizedBrandValue(locale, brandSettings?.site_name_ar, brandSettings?.site_name_en, labels.brand);
  const brandLogoUrl = getBrandLogoUrl(brandSettings);

  const handleLogout = () => {
    logout();
    router.replace(`/${locale}/admin/login`);
  };

  return (
    <div className="min-h-screen bg-app-background text-app-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 end-0 size-[28rem] rounded-full bg-app-primary/10 blur-3xl" />
        <div className="absolute bottom-0 start-0 size-[24rem] rounded-full bg-app-primary/5 blur-3xl" />
      </div>

      {mobileOpen ? (
        <button
          aria-label={labels.closeMenu ?? "Close menu overlay"}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <div className="grid min-h-screen lg:grid-cols-[17.25rem_minmax(0,1fr)]">
        <aside
          className={cn(
            "fixed inset-y-0 z-40 grid w-[17.25rem] grid-rows-[auto_minmax(0,1fr)_auto] gap-4 overflow-hidden border-app-border bg-app-surface/88 p-4 shadow-appCard backdrop-blur-2xl transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
            "before:pointer-events-none before:absolute before:inset-x-4 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-app-primary/45 before:to-transparent",
            "after:pointer-events-none after:absolute after:-top-24 after:start-8 after:size-52 after:rounded-full after:bg-app-primary/10 after:blur-3xl",
            isRtl ? "right-0 border-l" : "left-0 border-r",
            mobileOpen ? "translate-x-0" : isRtl ? "translate-x-full" : "-translate-x-full"
          )}
        >
          <div className="relative grid gap-4">
            <div className="flex items-start justify-between gap-3 rounded-app2xl border border-app-border/80 bg-app-surfaceElevated/70 p-3 shadow-appCard">
              <AppLogo title={brandTitle} logoUrl={brandLogoUrl} markClassName="size-16 rounded-full" textClassName="max-w-[9.5rem]" />
              <AppButton
                variant="ghost"
                className="min-h-10 px-3 lg:hidden"
                onClick={() => setMobileOpen(false)}
                icon={<AppIcon name="close" size={18} />}
              >
                <span className="sr-only">{labels.closeMenu ?? "Close"}</span>
              </AppButton>
            </div>
          </div>

          <WorkspaceNavigation
            sections={sections}
            pathname={pathname}
            onNavigate={() => setMobileOpen(false)}
          />

          <div className="relative grid gap-3">
            <UserSummary locale={locale} labels={labels} user={user} roleLabel={roleLabel} />
            <AppButton variant="secondary" className="w-full rounded-app2xl" onClick={handleLogout} icon={<AppIcon name="logout" size={17} />}>
              {labels.logout}
            </AppButton>
          </div>
        </aside>

        <div className="grid min-h-screen grid-rows-[auto_1fr]">
          <header className="sticky top-0 z-20 border-b border-app-border/80 bg-app-background/72 backdrop-blur-2xl">
            <div className="px-4 py-3 lg:px-7">
              <div className="flex min-h-[4.25rem] items-center justify-between gap-3 rounded-app2xl border border-app-border/80 bg-app-surface/76 px-3 shadow-appCard backdrop-blur-xl sm:px-4">
                <div className="flex min-w-0 items-center gap-3">
                  <AppButton
                    variant="secondary"
                    className="min-h-10 px-3 lg:hidden"
                    onClick={() => setMobileOpen(true)}
                    icon={<AppIcon name="menu" size={18} />}
                  >
                    <span className="sr-only">{labels.menu ?? "Menu"}</span>
                  </AppButton>

                  <span className="hidden size-10 shrink-0 place-items-center rounded-appLg border border-app-primary/20 bg-app-primary/10 text-app-primary shadow-appGlow sm:grid">
                    <AppIcon name={currentItem?.icon ?? activeTabGroup?.items[0]?.icon ?? "dashboard"} size={18} />
                  </span>

                  <div className="min-w-0">
                    <p className="truncate text-base font-black text-app-foreground sm:text-lg">{currentItem?.label ?? labels.panel}</p>
                    <p className="hidden truncate text-xs font-bold text-app-muted sm:block">
                      {activeTabGroup?.label ?? (locale === "ar" ? "لوحة تحكم المنصة" : "Platform admin")}
                    </p>
                  </div>
                </div>

                <div className="flex min-w-0 shrink-0 items-center gap-2">
                  <Link href={`${publicSiteUrl}/${locale}`} className="hidden md:block" target="_blank" aria-label={labels.openWebsite}>
                    <AppButton variant="ghost" className="rounded-full px-3 xl:px-4" icon={<AppIcon name="external" size={17} />}>
                      <span className="hidden xl:inline">{labels.openWebsite}</span>
                    </AppButton>
                  </Link>
                  <Link href={`/${locale}/admin/notifications`} className="hidden sm:block" aria-label={locale === "ar" ? "الإشعارات" : "Notifications"}>
                    <span className="relative grid size-11 place-items-center rounded-full border border-app-border bg-app-surfaceElevated text-app-foreground transition hover:border-app-primary/35 hover:bg-app-surface hover:shadow-appCard">
                      <AppIcon name="bell" size={17} />
                      {unreadNotificationsCount > 0 ? (
                        <span className="absolute -end-1 -top-1 grid min-w-5 place-items-center rounded-full border border-app-surface bg-app-danger px-1 text-[10px] font-black leading-5 text-white shadow-appGlow">
                          {unreadNotificationsCount > 99 ? "99+" : unreadNotificationsCount}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                  <LanguageSwitcher locale={locale} label={labels.switchLanguage} />
                  <ThemeSwitcher label={labels.switchTheme} labels={labels.themes} />
                  <Link href={`/${locale}/admin/profile`} className="hidden sm:block" aria-label={locale === "ar" ? "الملف الشخصي" : "Profile"}>
                    <UserAvatar user={user} sizeClass="size-11" />
                  </Link>
                </div>
              </div>
            </div>
          </header>

          <main className="grid content-start gap-5 p-4 lg:p-7">
            {activeTabGroup ? <AdminSectionTabs group={activeTabGroup} pathname={pathname} /> : null}
            <div className="min-w-0">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
