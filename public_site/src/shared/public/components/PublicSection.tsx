/**
 * =====================================================
 * PublicSection
 * قسم مركزي احترافي للموقع العام بخطوط V2
 * =====================================================
 */

import { cn } from "@/shared/design-system/utils/cn";

type PublicSectionProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
};

export function PublicSection({
  eyebrow,
  title,
  description,
  children,
  className,
  headerClassName
}: PublicSectionProps) {
  return (
    <section className={cn("app-container app-section grid gap-9 sm:gap-12", className)}>
      {eyebrow || title || description ? (
        <header className={cn("app-fade-up grid max-w-4xl gap-4 sm:gap-5", headerClassName)}>
          {eyebrow ? (
            <span className="w-fit rounded-appPill border border-app-border bg-app-surface/72 px-4 py-1.5 text-sm font-black text-app-primary">
              {eyebrow}
            </span>
          ) : null}
          {title ? (
            <h2 className="text-balance text-[var(--font-section)] font-black leading-[1.04] text-gradient">
              {title}
            </h2>
          ) : null}
          {description ? (
            <p className="max-w-3xl text-[var(--font-body-lg)] font-semibold leading-9 text-app-muted">
              {description}
            </p>
          ) : null}
        </header>
      ) : null}
      <div className="app-fade-up">{children}</div>
    </section>
  );
}
