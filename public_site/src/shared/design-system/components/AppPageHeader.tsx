/**
 * =====================================================
 * AppPageHeader
 * عنوان صفحة مركزي بحجم أوضح للهوية البصرية V2
 * =====================================================
 */

import { cn } from "@/shared/design-system/utils/cn";

type AppPageHeaderProps = {
  title: string;
  description?: string;
  className?: string;
};

export function AppPageHeader({ title, description, className }: AppPageHeaderProps) {
  return (
    <header className={cn("app-fade-up grid max-w-4xl gap-5", className)}>
      <h1 className="text-balance text-[clamp(3rem,6vw,5.8rem)] font-black leading-[1.05] text-gradient">
        {title}
      </h1>
      {description ? (
        <p className="max-w-3xl text-[clamp(1.05rem,1.45vw,1.35rem)] font-semibold leading-9 text-app-muted">
          {description}
        </p>
      ) : null}
    </header>
  );
}
