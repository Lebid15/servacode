/**
 * =====================================================
 * PremiumHeroVisual
 * مشهد Hero V2 يعرض Dashboard/Architecture بشكل أقوى بصريًا
 * =====================================================
 */

import { AppBadge } from "@/shared/design-system/components/AppBadge";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppIcon, type AppIconName } from "@/shared/design-system/components/AppIcon";

type PremiumHeroVisualProps = {
  labels: {
    systemCore: string;
    apiLayer: string;
    dashboard: string;
    database: string;
    security: string;
    uptime: string;
    response: string;
    scalable: string;
    frontend: string;
    backend: string;
    deploy: string;
    reports: string;
  };
};

type NodeItem = {
  icon: AppIconName;
  title: string;
  value: string;
};

export function PremiumHeroVisual({ labels }: PremiumHeroVisualProps) {
  const nodes: NodeItem[] = [
    { icon: "panels", title: labels.frontend, value: "UI" },
    { icon: "server", title: labels.backend, value: "API" },
    { icon: "database", title: labels.database, value: "DB" },
    { icon: "shield", title: labels.security, value: "SEC" }
  ];

  return (
    <div className="relative app-float lg:scale-100">
      <div className="absolute -inset-8 rounded-[3rem] bg-[hsl(var(--color-primary)/0.16)] blur-3xl" />
      <AppCard className="relative overflow-hidden p-3 sm:p-4 md:p-5 lg:p-6">
        <div className="absolute end-[-6rem] top-[-6rem] h-72 w-72 rounded-full bg-[hsl(var(--color-primary)/0.24)] blur-3xl" />
        <div className="absolute bottom-[-7rem] start-[-7rem] h-72 w-72 rounded-full bg-[hsl(var(--color-accent)/0.18)] blur-3xl" />

        <div className="relative overflow-hidden rounded-app2Xl border border-app-border bg-app-background/50 shadow-appCard">
          <div className="flex items-center justify-between border-b border-app-border bg-app-surface/78 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[hsl(var(--color-danger))]" />
              <span className="h-3 w-3 rounded-full bg-[hsl(var(--color-warning))]" />
              <span className="h-3 w-3 rounded-full bg-[hsl(var(--color-success))]" />
            </div>
            <AppBadge tone="success">{labels.scalable}</AppBadge>
          </div>

          <div className="grid gap-4 p-4 sm:gap-5 sm:p-5">
            <div className="grid gap-4 rounded-appXl border border-app-border bg-app-surface/70 p-4 shadow-appSoft sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-14 w-14 place-items-center rounded-app2Xl bg-[hsl(var(--color-primary)/0.14)] shadow-appGlowSoft">
                    <AppIcon name="server" className="text-app-primary" size={26} />
                  </span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.32em] text-app-muted">Architecture</p>
                    <h3 className="mt-1 text-xl font-black sm:text-2xl">{labels.systemCore}</h3>
                  </div>
                </div>
                <div className="hidden text-end sm:block">
                  <strong className="block text-2xl font-black text-app-primary">99.9%</strong>
                  <span className="text-xs font-bold text-app-muted">{labels.uptime}</span>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="h-2 rounded-appPill bg-app-surfaceElevated">
                  <div className="app-pulse-line h-full w-4/5 rounded-appPill bg-[image:var(--gradient-primary)]" />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { label: labels.response, value: "<120ms" },
                    { label: labels.deploy, value: "CI/CD" },
                    { label: labels.reports, value: "Live" }
                  ].map((item) => (
                    <div key={item.label} className="rounded-appLg border border-app-border bg-app-surface/72 p-3">
                      <strong className="block text-lg font-black text-app-primary">{item.value}</strong>
                      <span className="text-xs font-bold text-app-muted">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative grid gap-3 sm:gap-4 md:grid-cols-2">
              <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-px w-3/4 -translate-x-1/2 bg-[hsl(var(--color-primary)/0.38)] md:block" />
              <div className="pointer-events-none absolute left-1/2 top-8 hidden h-[calc(100%-4rem)] w-px -translate-x-1/2 bg-[hsl(var(--color-accent)/0.30)] md:block" />

              {nodes.map((node) => (
                <div
                  key={node.title}
                  className="relative rounded-appXl border border-app-border bg-app-surface/74 p-4 shadow-appSoft"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-app2Xl bg-app-surfaceElevated">
                      <AppIcon name={node.icon} className="text-app-primary" size={22} />
                    </span>
                    <span className="rounded-appPill border border-app-border bg-app-background/40 px-3 py-1 text-xs font-black text-app-muted">
                      {node.value}
                    </span>
                  </div>
                  <p className="text-lg font-black">{node.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AppCard>
    </div>
  );
}
