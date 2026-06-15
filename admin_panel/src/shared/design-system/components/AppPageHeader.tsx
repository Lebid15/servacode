/**
 * =====================================================
 * AppPageHeader
 * عنوان صفحة مركزي للموقع ولوحة الأدمن
 * =====================================================
 */

import type { ReactNode } from "react";

import { AppBadge } from "./AppBadge";

type AppPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function AppPageHeader({ actions, eyebrow, title, description }: AppPageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="grid gap-3">
        {eyebrow ? <AppBadge tone="primary" className="w-fit">{eyebrow}</AppBadge> : null}
        <div className="grid gap-2">
          <h1 className="max-w-4xl text-2xl font-bold tracking-tight text-app-foreground md:text-3xl">
            {title}
          </h1>
          {description ? <p className="max-w-3xl text-sm leading-7 text-app-muted md:text-base">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
