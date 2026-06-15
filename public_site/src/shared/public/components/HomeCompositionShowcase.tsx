/**
 * =====================================================
 * HomeCompositionShowcase
 * قسم بصري يربط ما نبنيه بمنهجية التنفيذ
 * =====================================================
 */

import { AppBadge } from "@/shared/design-system/components/AppBadge";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppIcon } from "@/shared/design-system/components/AppIcon";

type CompositionLabels = {
  badge: string;
  title: string;
  description: string;
  discovery: string;
  ux: string;
  backend: string;
  delivery: string;
  noteTitle: string;
  noteDescription: string;
};

export function HomeCompositionShowcase({ labels }: { labels: CompositionLabels }) {
  const flow = [
    { icon: "message" as const, label: labels.discovery },
    { icon: "panels" as const, label: labels.ux },
    { icon: "server" as const, label: labels.backend },
    { icon: "rocket" as const, label: labels.delivery }
  ];

  return (
    <AppCard className="relative overflow-hidden p-5 sm:p-6 md:p-8">
      <div className="absolute inset-0 app-grid-bg opacity-20" aria-hidden="true" />
      <div className="absolute end-[-7rem] top-[-7rem] h-72 w-72 rounded-full bg-[hsl(var(--color-primary)/0.16)] blur-3xl" />

      <div className="relative home-composition-grid">
        <div className="grid content-center gap-5">
          <AppBadge tone="primary">{labels.badge}</AppBadge>
          <h3 className="text-balance text-3xl font-black leading-tight text-gradient sm:text-4xl md:text-6xl">
            {labels.title}
          </h3>
          <p className="text-base font-semibold leading-8 text-app-muted sm:text-lg sm:leading-9">{labels.description}</p>
        </div>

        <div className="grid gap-4">
          {flow.map((item, index) => (
            <div key={item.label} className="relative flex items-center gap-4 rounded-appXl border border-app-border bg-app-surface/72 p-4 shadow-appSoft">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-app2Xl bg-app-surfaceElevated shadow-appGlowSoft">
                <AppIcon name={item.icon} className="text-app-primary" size={22} />
              </span>
              <div className="min-w-0">
                <span className="text-xs font-black text-app-primary">{String(index + 1).padStart(2, "0")}</span>
                <h4 className="text-lg font-black">{item.label}</h4>
              </div>
            </div>
          ))}

          <div className="rounded-appXl border border-app-borderStrong bg-[hsl(var(--color-primary)/0.10)] p-5">
            <h4 className="text-xl font-black">{labels.noteTitle}</h4>
            <p className="mt-2 text-sm font-semibold leading-7 text-app-muted">{labels.noteDescription}</p>
          </div>
        </div>
      </div>
    </AppCard>
  );
}
