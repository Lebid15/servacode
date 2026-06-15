/**
 * =====================================================
 * SystemArchitectureShowcase
 * قسم بصري قوي يعرض طبقات النظام الذي تبنيه الشركة
 * =====================================================
 */

import { AppBadge } from "@/shared/design-system/components/AppBadge";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppIcon, type AppIconName } from "@/shared/design-system/components/AppIcon";
import { PremiumMetricCard } from "./PremiumMetricCard";

type ArchitectureLabels = {
  badge: string;
  panelTitle: string;
  panelDescription: string;
  frontend: string;
  backend: string;
  database: string;
  security: string;
  admin: string;
  deploy: string;
  metricSpeed: string;
  metricSecurity: string;
  metricScale: string;
  metricMaintain: string;
};

type LayerItem = {
  icon: AppIconName;
  label: string;
  code: string;
};

export function SystemArchitectureShowcase({ labels }: { labels: ArchitectureLabels }) {
  const layers: LayerItem[] = [
    { icon: "panels", label: labels.frontend, code: "UI" },
    { icon: "server", label: labels.backend, code: "API" },
    { icon: "database", label: labels.database, code: "DATA" },
    { icon: "shield", label: labels.security, code: "AUTH" },
    { icon: "dashboard", label: labels.admin, code: "OPS" },
    { icon: "rocket", label: labels.deploy, code: "SHIP" }
  ];

  const metrics = [
    { icon: "gauge" as const, value: "Fast", label: labels.metricSpeed },
    { icon: "shield" as const, value: "Secure", label: labels.metricSecurity },
    { icon: "layers" as const, value: "Scale", label: labels.metricScale },
    { icon: "workflow" as const, value: "Clean", label: labels.metricMaintain }
  ];

  return (
    <AppCard className="relative overflow-hidden p-5 sm:p-6 md:p-8 lg:p-10">
      <div className="absolute inset-0 app-grid-bg opacity-25" aria-hidden="true" />
      <div className="absolute end-[-8rem] top-[-8rem] h-80 w-80 rounded-full bg-[hsl(var(--color-primary)/0.18)] blur-3xl" />
      <div className="absolute bottom-[-8rem] start-[-8rem] h-80 w-80 rounded-full bg-[hsl(var(--color-accent)/0.14)] blur-3xl" />

      <div className="relative grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
        <div className="grid gap-6">
          <AppBadge tone="primary">{labels.badge}</AppBadge>
          <div className="grid gap-4">
            <h3 className="text-balance text-3xl font-black leading-tight text-gradient sm:text-4xl md:text-6xl">
              {labels.panelTitle}
            </h3>
            <p className="text-base font-semibold leading-8 text-app-muted sm:text-lg sm:leading-9">{labels.panelDescription}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {metrics.map((item) => (
              <PremiumMetricCard key={item.label} icon={item.icon} value={item.value} label={item.label} />
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-1/2 top-8 hidden h-[calc(100%-4rem)] w-px -translate-x-1/2 bg-[hsl(var(--color-primary)/0.36)] lg:block" />
          <div className="absolute left-[12%] right-[12%] top-1/2 hidden h-px bg-[hsl(var(--color-accent)/0.32)] lg:block" />

          <div className="relative grid gap-4 md:grid-cols-2">
            {layers.map((item, index) => (
              <div
                key={item.label}
                className="group relative rounded-app2Xl border border-app-border bg-app-surface/76 p-5 shadow-appSoft transition hover:-translate-y-1 hover:border-app-borderStrong"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <span className="grid h-14 w-14 place-items-center rounded-app2Xl bg-app-surfaceElevated shadow-appGlowSoft transition group-hover:scale-105">
                    <AppIcon name={item.icon} className="text-app-primary" size={25} />
                  </span>
                  <span className="rounded-appPill border border-app-border bg-app-background/45 px-3 py-1 text-xs font-black text-app-muted">
                    {item.code}
                  </span>
                </div>
                <strong className="text-xl font-black">{item.label}</strong>
                <div className="mt-4 h-2 rounded-appPill bg-app-surfaceElevated">
                  <div
                    className="h-full rounded-appPill bg-[image:var(--gradient-primary)]"
                    style={{ width: `${64 + index * 5}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppCard>
  );
}
