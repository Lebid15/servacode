/**
 * =====================================================
 * HomeHeroVisual
 * مشهد بصري تقني داخل Hero يعبر عن بناء الأنظمة
 * =====================================================
 */

import { AppBadge } from "@/shared/design-system/components/AppBadge";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppIcon } from "@/shared/design-system/components/AppIcon";

type HomeHeroVisualProps = {
  labels: {
    systemCore: string;
    apiLayer: string;
    dashboard: string;
    database: string;
    security: string;
    uptime: string;
    response: string;
    scalable: string;
  };
};

export function HomeHeroVisual({ labels }: HomeHeroVisualProps) {
  const nodes = [
    { icon: "network" as const, title: labels.apiLayer, value: "API" },
    { icon: "dashboard" as const, title: labels.dashboard, value: "UI" },
    { icon: "database" as const, title: labels.database, value: "DB" },
    { icon: "shield" as const, title: labels.security, value: "SEC" }
  ];

  return (
    <AppCard className="app-float relative overflow-hidden p-5 md:p-6">
      <div className="absolute end-[-5rem] top-[-5rem] h-60 w-60 rounded-full bg-[hsl(var(--color-primary)/0.22)] blur-3xl" />
      <div className="absolute bottom-[-5rem] start-[-5rem] h-60 w-60 rounded-full bg-[hsl(var(--color-accent)/0.18)] blur-3xl" />

      <div className="relative grid gap-5">
        <div className="flex items-center justify-between rounded-appXl border border-app-border bg-app-surfaceElevated/78 p-4 shadow-appSoft">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-appPill bg-[hsl(var(--color-primary)/0.14)]">
              <AppIcon name="server" className="text-app-primary" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-app-muted">System</p>
              <h3 className="text-lg font-black">{labels.systemCore}</h3>
            </div>
          </div>
          <AppBadge tone="success">{labels.scalable}</AppBadge>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {nodes.map((node) => (
            <div
              key={node.title}
              className="rounded-appXl border border-app-border bg-app-surface/72 p-4 shadow-appSoft"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-appPill bg-app-surfaceElevated">
                  <AppIcon name={node.icon} className="text-app-primary" size={18} />
                </span>
                <span className="text-xs font-black text-app-muted">{node.value}</span>
              </div>
              <p className="font-black">{node.title}</p>
              <div className="mt-3 h-2 overflow-hidden rounded-appPill bg-app-surfaceElevated">
                <div className="h-full w-3/4 rounded-appPill bg-[image:var(--gradient-primary)]" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {[
            { label: labels.uptime, value: "99.9%" },
            { label: labels.response, value: "<120ms" },
            { label: labels.scalable, value: "Scale" }
          ].map((item) => (
            <div key={item.label} className="rounded-appLg border border-app-border bg-app-surface/70 p-4 text-center">
              <strong className="block text-2xl font-black text-app-primary">{item.value}</strong>
              <span className="text-xs font-bold text-app-muted">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </AppCard>
  );
}
