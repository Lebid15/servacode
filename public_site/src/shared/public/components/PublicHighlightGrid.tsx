import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppIcon } from "@/shared/design-system/components/AppIcon";
import type { PublicHighlight } from "@/shared/public/page-content";

type PublicHighlightGridProps = {
  items: PublicHighlight[];
};

export function PublicHighlightGrid({ items }: PublicHighlightGridProps) {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {items.map((item) => (
        <AppCard key={item.title} className="grid gap-4 p-6">
          <span className="grid h-12 w-12 place-items-center rounded-appXl border border-app-border bg-app-surfaceElevated text-app-primary">
            <AppIcon name={item.icon} size={22} />
          </span>
          <div className="grid gap-2">
            <h3 className="text-xl font-black">{item.title}</h3>
            <p className="leading-7 text-app-muted">{item.description}</p>
          </div>
        </AppCard>
      ))}
    </div>
  );
}
